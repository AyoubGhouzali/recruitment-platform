package com.ayoub.recruitment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobOfferDto {
    private Long id;
    private Long recruiterId;
    private String recruiterEmail;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    private String companyName;
    private Double salaryMin;
    private Double salaryMax;
    private String skills;
    private java.time.LocalDateTime createdAt;
}
