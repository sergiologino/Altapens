package ru.altacare.backend.modules.care.api;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.altacare.backend.common.api.ApiPaths;
import ru.altacare.backend.modules.care.api.dto.TimelineItemResponse;
import ru.altacare.backend.modules.care.application.TimelineService;

@RestController
@RequestMapping(ApiPaths.CARE + "/timeline")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    @GetMapping
    public ResponseEntity<List<TimelineItemResponse>> list(
            @RequestParam(name = "seniorUserId", required = false) UUID seniorUserId,
            @RequestParam(name = "limit", defaultValue = "30") int limit) {
        return ResponseEntity.ok(timelineService.list(seniorUserId, limit));
    }
}
