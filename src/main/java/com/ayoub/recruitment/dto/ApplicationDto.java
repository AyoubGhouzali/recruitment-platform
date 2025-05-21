package com.ayoub.recruitment.dto;

import com.ayoub.recruitment.model.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDto {
    private Long id;
    private Long studentId;
    private String studentEmail;
    private String studentName;
    private Long jobOfferId;
    private String jobTitle;
    private String companyName;
    private ApplicationStatus status;
    private java.time.LocalDateTime appliedAt;
    private String resumeUrl;
}
