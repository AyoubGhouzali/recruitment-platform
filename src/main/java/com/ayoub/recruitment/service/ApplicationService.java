package com.ayoub.recruitment.service;

import com.ayoub.recruitment.dto.ApplicationDto;
import com.ayoub.recruitment.model.*;
import com.ayoub.recruitment.repository.ApplicationRepository;
import com.ayoub.recruitment.repository.JobOfferRepository;
import com.ayoub.recruitment.repository.StudentProfileRepository;
import com.ayoub.recruitment.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobOfferRepository jobOfferRepository;
    private final StudentProfileRepository studentProfileRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                             UserRepository userRepository,
                             JobOfferRepository jobOfferRepository,
                             StudentProfileRepository studentProfileRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobOfferRepository = jobOfferRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    public List<ApplicationDto> getApplicationsByStudentId(Long studentId) {
        return applicationRepository.findByStudentId(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ApplicationDto> getApplicationsByJobOfferId(Long jobOfferId) {
        return applicationRepository.findByJobOfferId(jobOfferId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationDto createApplication(Long studentId, Long jobOfferId, String resumeUrl) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getRole() != UserRole.STUDENT) {
            throw new AccessDeniedException("Only students can apply to job offers");
        }

        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Job offer not found"));

        // Check if student has already applied to this job offer
        applicationRepository.findByStudentIdAndJobOfferId(studentId, jobOfferId)
                .ifPresent(a -> {
                    throw new RuntimeException("You have already applied to this job offer");
                });

        Application application = new Application();
        application.setStudent(student);
        application.setJobOffer(jobOffer);
        application.setStatus(ApplicationStatus.PENDING);
        
        // Use provided resume URL or get from student profile
        if (resumeUrl != null && !resumeUrl.isEmpty()) {
            application.setResumeUrl(resumeUrl);
        } else {
            StudentProfile studentProfile = studentProfileRepository.findByUser(student)
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));
            application.setResumeUrl(studentProfile.getResumeUrl());
        }

        Application savedApplication = applicationRepository.save(application);
        return mapToDto(savedApplication);
    }

    @Transactional
    public ApplicationDto updateApplicationStatus(Long applicationId, ApplicationStatus status, Long recruiterId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Verify that the recruiter is the owner of the job offer
        if (!application.getJobOffer().getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You can only update status for applications to your job offers");
        }

        application.setStatus(status);
        Application updatedApplication = applicationRepository.save(application);
        return mapToDto(updatedApplication);
    }

    @Transactional
    public ApplicationDto withdrawApplication(Long applicationId, Long studentId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Verify that the student is the owner of the application
        if (!application.getStudent().getId().equals(studentId)) {
            throw new AccessDeniedException("You can only withdraw your own applications");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        Application updatedApplication = applicationRepository.save(application);
        return mapToDto(updatedApplication);
    }

    private ApplicationDto mapToDto(Application application) {
        ApplicationDto dto = new ApplicationDto();
        dto.setId(application.getId());
        dto.setStudentId(application.getStudent().getId());
        dto.setStudentEmail(application.getStudent().getEmail());
        
        // Get student name from profile if available
        studentProfileRepository.findByUser(application.getStudent())
                .ifPresent(profile -> dto.setStudentName(profile.getFullName()));
        
        dto.setJobOfferId(application.getJobOffer().getId());
        dto.setJobTitle(application.getJobOffer().getTitle());
        dto.setCompanyName(application.getJobOffer().getCompanyName());
        dto.setStatus(application.getStatus());
        dto.setAppliedAt(application.getAppliedAt());
        dto.setResumeUrl(application.getResumeUrl());
        return dto;
    }
}
