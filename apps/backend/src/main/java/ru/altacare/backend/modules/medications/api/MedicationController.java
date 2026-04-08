package ru.altacare.backend.modules.medications.api;

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
import ru.altacare.backend.modules.medications.api.dto.CreateMedicationRequest;
import ru.altacare.backend.modules.medications.api.dto.MedicationDoseResponse;
import ru.altacare.backend.modules.medications.api.dto.MedicationResponse;
import ru.altacare.backend.modules.medications.api.dto.RecordMedicationIntakeRequest;
import ru.altacare.backend.modules.medications.application.MedicationService;

@RestController
@RequestMapping(ApiPaths.CARE + "/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;

    @GetMapping
    public ResponseEntity<List<MedicationResponse>> list(
            @RequestParam(name = "seniorUserId", required = false) UUID seniorUserId) {
        return ResponseEntity.ok(medicationService.listMedications(seniorUserId));
    }

    @GetMapping("/today-doses")
    public ResponseEntity<List<MedicationDoseResponse>> todayDoses(
            @RequestParam(name = "seniorUserId", required = false) UUID seniorUserId) {
        return ResponseEntity.ok(medicationService.listTodayDoses(seniorUserId));
    }

    @PostMapping
    public ResponseEntity<MedicationResponse> create(@Valid @RequestBody CreateMedicationRequest request) {
        return ResponseEntity.ok(medicationService.create(request));
    }

    @PostMapping("/intake")
    public ResponseEntity<Void> recordIntake(@Valid @RequestBody RecordMedicationIntakeRequest request) {
        medicationService.recordIntake(request);
        return ResponseEntity.noContent().build();
    }
}
