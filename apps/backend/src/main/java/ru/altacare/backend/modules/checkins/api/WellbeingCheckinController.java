package ru.altacare.backend.modules.checkins.api;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.altacare.backend.common.api.ApiPaths;
import ru.altacare.backend.modules.checkins.api.dto.RecordWellbeingCheckinRequest;
import ru.altacare.backend.modules.checkins.api.dto.WellbeingCheckinResponse;
import ru.altacare.backend.modules.checkins.application.WellbeingCheckinService;

@RestController
@RequestMapping(ApiPaths.CARE + "/checkins")
@RequiredArgsConstructor
public class WellbeingCheckinController {

    private final WellbeingCheckinService wellbeingCheckinService;

    @PostMapping
    public ResponseEntity<WellbeingCheckinResponse> create(
            @Valid @RequestBody RecordWellbeingCheckinRequest request) {
        return ResponseEntity.ok(wellbeingCheckinService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<WellbeingCheckinResponse>> list(
            @RequestParam(name = "seniorUserId", required = false) UUID seniorUserId,
            @RequestParam(name = "limit", defaultValue = "30") int limit) {
        return ResponseEntity.ok(wellbeingCheckinService.list(seniorUserId, limit));
    }
}
