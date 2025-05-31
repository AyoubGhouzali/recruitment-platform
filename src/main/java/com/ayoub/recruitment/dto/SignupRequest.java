package com.ayoub.recruitment.dto;

import com.ayoub.recruitment.model.UserRole;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SignupRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotNull(message = "User role is required")
    private UserRole role;
    
    @JsonCreator
    public SignupRequest(
        @JsonProperty("email") String email,
        @JsonProperty("password") String password,
        @JsonProperty("role") String role,
        @JsonProperty("fullName") String fullName) {
        this.email = email;
        this.password = password;
        try {
            this.role = role != null ? UserRole.valueOf(role) : null;
        } catch (IllegalArgumentException e) {
            this.role = null;
        }
        this.fullName = fullName;
    }
    
    @NotBlank(message = "Full name is required")
    private String fullName;
}
