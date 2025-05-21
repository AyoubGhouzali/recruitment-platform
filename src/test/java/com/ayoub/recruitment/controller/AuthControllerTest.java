package com.ayoub.recruitment.controller;

import com.ayoub.recruitment.dto.AuthRequest;
import com.ayoub.recruitment.dto.AuthResponse;
import com.ayoub.recruitment.dto.SignupRequest;
import com.ayoub.recruitment.model.UserRole;
import com.ayoub.recruitment.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    private SignupRequest signupRequest;
    private AuthRequest authRequest;
    private AuthResponse successResponse;
    private AuthResponse errorResponse;

    @BeforeEach
    void setUp() {
        // Setup signup request
        signupRequest = new SignupRequest();
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("password");
        signupRequest.setRole(UserRole.STUDENT);
        signupRequest.setFullName("Test User");

        // Setup login request
        authRequest = new AuthRequest();
        authRequest.setEmail("test@example.com");
        authRequest.setPassword("password");

        // Setup success response
        successResponse = AuthResponse.builder()
                .userId(1L)
                .email("test@example.com")
                .role(UserRole.STUDENT)
                .token("test.jwt.token")
                .message("Success")
                .build();

        // Setup error response
        errorResponse = AuthResponse.builder()
                .message("Error message")
                .build();
    }

    @Test
    void whenSignupWithValidData_thenReturns200() throws Exception {
        when(authService.signup(any(SignupRequest.class))).thenReturn(successResponse);

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(successResponse.getUserId()))
                .andExpect(jsonPath("$.email").value(successResponse.getEmail()))
                .andExpect(jsonPath("$.role").value(successResponse.getRole().toString()))
                .andExpect(jsonPath("$.token").value(successResponse.getToken()))
                .andExpect(jsonPath("$.message").value(successResponse.getMessage()));
    }

    @Test
    void whenSignupWithInvalidData_thenReturns400() throws Exception {
        when(authService.signup(any(SignupRequest.class))).thenReturn(errorResponse);

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(errorResponse.getMessage()));
    }

    @Test
    void whenSignupWithInvalidRequest_thenReturns400() throws Exception {
        // Create an invalid request (missing required fields)
        SignupRequest invalidRequest = new SignupRequest();
        invalidRequest.setEmail("invalid-email"); // Invalid email format
        // Missing password and role

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void whenLoginWithValidCredentials_thenReturns200() throws Exception {
        when(authService.login(any(AuthRequest.class))).thenReturn(successResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(successResponse.getUserId()))
                .andExpect(jsonPath("$.email").value(successResponse.getEmail()))
                .andExpect(jsonPath("$.role").value(successResponse.getRole().toString()))
                .andExpect(jsonPath("$.token").value(successResponse.getToken()))
                .andExpect(jsonPath("$.message").value(successResponse.getMessage()));
    }

    @Test
    void whenLoginWithInvalidCredentials_thenReturns400() throws Exception {
        when(authService.login(any(AuthRequest.class))).thenReturn(errorResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(errorResponse.getMessage()));
    }

    @Test
    void whenLoginWithInvalidRequest_thenReturns400() throws Exception {
        // Create an invalid request (missing required fields)
        AuthRequest invalidRequest = new AuthRequest();
        invalidRequest.setEmail("invalid-email"); // Invalid email format
        // Missing password

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}
