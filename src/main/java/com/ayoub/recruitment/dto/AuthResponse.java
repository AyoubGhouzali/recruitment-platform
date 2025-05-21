package com.ayoub.recruitment.dto;

import com.ayoub.recruitment.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Long userId;
    private String email;
    private UserRole role;
    private String token;
    private String message;
}
