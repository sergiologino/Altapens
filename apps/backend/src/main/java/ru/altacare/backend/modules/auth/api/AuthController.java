package ru.altacare.backend.modules.auth.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.altacare.backend.common.api.ApiPaths;
import ru.altacare.backend.modules.auth.api.dto.AuthActionResultResponse;
import ru.altacare.backend.modules.auth.api.dto.AuthUserResponse;
import ru.altacare.backend.modules.auth.api.dto.LoginRequest;
import ru.altacare.backend.modules.auth.api.dto.LoginResponse;
import ru.altacare.backend.modules.auth.api.dto.RegisterRequest;
import ru.altacare.backend.modules.auth.api.dto.RegisterResponse;
import ru.altacare.backend.modules.auth.application.AuthService;

@RestController
@RequestMapping(ApiPaths.AUTH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        var result = authService.register(request);
        return ResponseEntity.ok(new RegisterResponse(result.result(), result.session(), result.accessToken()));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        var result = authService.login(request);
        return ResponseEntity.ok(new LoginResponse(result.result(), result.session(), result.accessToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthActionResultResponse> logout() {
        return ResponseEntity.ok(authService.logout());
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> me() {
        return ResponseEntity.ok(authService.me());
    }
}
