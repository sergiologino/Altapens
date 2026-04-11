"""
HTTP API для Qwen3-TTS (CustomVoice). Контракт: только русский язык (language=Russian).
"""
from __future__ import annotations

import base64
import io
import logging
import os
import threading
from typing import Any

import numpy as np
import soundfile as sf
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("tts-qwen")

MODEL_PATH = os.environ.get(
    "QWEN_TTS_MODEL", "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice/"
)
DEVICE = os.environ.get("QWEN_TTS_DEVICE", "cuda:0")
DTYPE_STR = os.environ.get("QWEN_TTS_DTYPE", "bfloat16")
ATTN_IMPL = os.environ.get("QWEN_TTS_ATTN", "sdpa")

# UI-пресеты → speaker + style (English instructs; модель поддерживает Russian)
VOICE_PRESETS: dict[str, dict[str, str]] = {
    "default": {"speaker": "Ryan", "instruct": "Speak clearly and calmly in Russian."},
    "calm": {"speaker": "Ryan", "instruct": "Speak slowly and calmly in Russian."},
    "warm": {"speaker": "Serena", "instruct": "Warm, gentle tone in Russian."},
    "clear": {"speaker": "Aiden", "instruct": "Clear, friendly delivery in Russian."},
}

_model = None
_model_lock = threading.Lock()


def _dtype():
    import torch

    return {
        "bfloat16": torch.bfloat16,
        "float16": torch.float16,
        "float32": torch.float32,
    }.get(DTYPE_STR, __import__("torch").bfloat16)


def get_model():
    global _model
    if _model is not None:
        return _model
    with _model_lock:
        if _model is not None:
            return _model
        import torch
        from qwen_tts import Qwen3TTSModel

        log.info("Loading Qwen3-TTS from %s device=%s dtype=%s attn=%s", MODEL_PATH, DEVICE, DTYPE_STR, ATTN_IMPL)
        _model = Qwen3TTSModel.from_pretrained(
            MODEL_PATH,
            device_map=DEVICE,
            dtype=_dtype(),
            attn_implementation=ATTN_IMPL,
        )
        log.info("Qwen3-TTS loaded.")
        return _model


app = FastAPI(title="Qwen3-TTS bridge", version="1.0.0")


class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=8000)
    language: str = Field(default="Russian", description="Только Russian (контракт продукта).")
    voice: str = Field(default="default", description="Ключ пресета: default|calm|warm|clear")
    instruct: str | None = Field(default=None, description="Переопределить стиль (опционально).")


class SynthesizeResponse(BaseModel):
    format: str = "wav"
    sample_rate: int
    audio_base64: str
    voice: str
    speaker: str


@app.get("/health")
def health():
    ok = _model is not None
    return {"status": "ok", "model_loaded": ok}


@app.get("/v1/voices")
def list_voices():
    return {
        "language": "Russian",
        "voices": [
            {"id": k, **VOICE_PRESETS[k]}
            for k in VOICE_PRESETS
        ],
    }


@app.post("/v1/synthesize", response_model=SynthesizeResponse)
def synthesize(body: SynthesizeRequest):
    t = body.text.strip()
    if not t:
        raise HTTPException(400, "text is empty")

    lang_norm = body.language.strip()
    if lang_norm.lower() not in ("russian", "ru"):
        raise HTTPException(
            400,
            "Only Russian is supported; set language to Russian.",
        )

    preset = VOICE_PRESETS.get(body.voice)
    if not preset:
        raise HTTPException(400, f"Unknown voice preset: {body.voice}")

    speaker = preset["speaker"]
    instruct = body.instruct if body.instruct and body.instruct.strip() else preset["instruct"]

    try:
        model = get_model()
    except Exception as e:
        log.exception("Model load failed")
        raise HTTPException(503, f"Model unavailable: {e}") from e

    import torch

    try:
        torch.cuda.synchronize() if DEVICE.startswith("cuda") else None
        wavs, sr = model.generate_custom_voice(
            text=t,
            language="Russian",
            speaker=speaker,
            instruct=instruct,
            max_new_tokens=2048,
        )
        w = np.asarray(wavs[0])
        buf = io.BytesIO()
        sf.write(buf, w, int(sr), format="WAV")
        b64 = base64.standard_b64encode(buf.getvalue()).decode("ascii")
        return SynthesizeResponse(
            sample_rate=int(sr),
            audio_base64=b64,
            voice=body.voice,
            speaker=speaker,
        )
    except Exception as e:
        log.exception("Synthesis failed")
        raise HTTPException(500, str(e)) from e


@app.post("/v1/load-model")
def load_model():
    """Прогрев модели (удобно для orchestrator)."""
    try:
        get_model()
        return {"status": "loaded"}
    except Exception as e:
        raise HTTPException(503, str(e)) from e
