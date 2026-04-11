# GPU inference for Qwen3-TTS. Требуется NVIDIA Container Toolkit и достаточный VRAM.
FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir "qwen-tts"

COPY app ./app

ENV PYTHONPATH=/app \
    QWEN_TTS_MODEL=Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice/ \
    QWEN_TTS_DEVICE=cuda:0 \
    QWEN_TTS_DTYPE=bfloat16 \
    QWEN_TTS_ATTN=sdpa

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
