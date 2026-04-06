package ru.altacare.backend.modules.care_network.api;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.altacare.backend.common.api.ApiPaths;
import ru.altacare.backend.modules.auth.api.dto.AuthActionResultResponse;
import ru.altacare.backend.modules.care_network.api.dto.CareInviteResponse;
import ru.altacare.backend.modules.care_network.api.dto.CareRelationshipResponse;
import ru.altacare.backend.modules.care_network.api.dto.CareUserSummaryResponse;
import ru.altacare.backend.modules.care_network.api.dto.CreateInviteRequest;
import ru.altacare.backend.modules.care_network.api.dto.CreateInviteResponse;
import ru.altacare.backend.modules.care_network.api.dto.LookupInviteResponse;
import ru.altacare.backend.modules.care_network.application.CareNetworkService;

@RestController
@RequestMapping(ApiPaths.CARE)
@RequiredArgsConstructor
public class CareNetworkController {

    private final CareNetworkService careNetworkService;

    @PostMapping("/invites")
    public ResponseEntity<CreateInviteResponse> createInvite(@Valid @RequestBody CreateInviteRequest request) {
        return ResponseEntity.ok(new CreateInviteResponse(careNetworkService.createInvite(request)));
    }

    @GetMapping("/invites")
    public ResponseEntity<List<CareInviteResponse>> getOwnInvites() {
        return ResponseEntity.ok(careNetworkService.getInvitesCreatedByCurrentUser());
    }

    @GetMapping("/invites/{code}")
    public ResponseEntity<LookupInviteResponse> lookupInvite(@PathVariable String code) {
        return ResponseEntity.ok(new LookupInviteResponse(careNetworkService.lookupInvite(code)));
    }

    @PostMapping("/invites/{code}/accept")
    public ResponseEntity<AuthActionResultResponse> acceptInvite(@PathVariable String code) {
        return ResponseEntity.ok(careNetworkService.acceptInvite(code));
    }

    @GetMapping("/seniors")
    public ResponseEntity<List<CareUserSummaryResponse>> getSeniors() {
        return ResponseEntity.ok(careNetworkService.getSeniors());
    }

    @GetMapping("/caregivers")
    public ResponseEntity<List<CareUserSummaryResponse>> getCaregivers() {
        return ResponseEntity.ok(careNetworkService.getCaregivers());
    }

    @GetMapping("/relationships/{id}")
    public ResponseEntity<CareRelationshipResponse> getRelationship(@PathVariable UUID id) {
        return ResponseEntity.ok(careNetworkService.getRelationship(id));
    }
}
