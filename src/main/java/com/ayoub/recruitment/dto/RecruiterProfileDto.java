package com.ayoub.recruitment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfileDto {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private String companyName;
    private String position;
    private LocalDateTime updatedAt;
}
