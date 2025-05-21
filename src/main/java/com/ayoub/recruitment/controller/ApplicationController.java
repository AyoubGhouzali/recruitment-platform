package com.ayoub.recruitment.controller;

import com.ayoub.recruitment.dto.ApplicationDto;
import com.ayoub.recruitment.model.ApplicationStatus;
import com.ayoub.recruitment.model.User;
import com.ayoub.recruitment.model.UserRole;
import com.ayoub.recruitment.security.SecurityUtils;
import com.ayoub.recruitment.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final SecurityUtils securityUtils;

    public ApplicationController(ApplicationService applicationService, SecurityUtils securityUtils) {
        this.applicationService = applicationService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<List<ApplicationDto>> getApplicationsByStudentId(@PathVariable Long studentId) {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        
        // Students can only view their own applications
        if (currentUser.getRole() == UserRole.STUDENT && !currentUser.getId().equals(studentId)) {
            return ResponseEntity.status(403).build();
        }
        
        List<ApplicationDto> applications = applicationService.getApplicationsByStudentId(studentId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/joboffer/{jobOfferId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<List<ApplicationDto>> getApplicationsByJobOfferId(@PathVariable Long jobOfferId) {
        List<ApplicationDto> applications = applicationService.getApplicationsByJobOfferId(jobOfferId);
        return ResponseEntity.ok(applications);
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApplicationDto> createApplication(
            @RequestParam Long jobOfferId,
            @RequestParam(required = false) String resumeUrl) {
        Long studentId = securityUtils.getCurrentUserId();
        if (studentId == null) {
            return ResponseEntity.status(401).build();
        }
        
        ApplicationDto application = applicationService.createApplication(studentId, jobOfferId, resumeUrl);
        return ResponseEntity.ok(application);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApplicationDto> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status) {
        Long recruiterId = securityUtils.getCurrentUserId();
        if (recruiterId == null) {
            return ResponseEntity.status(401).build();
        }
        
        ApplicationDto application = applicationService.updateApplicationStatus(id, status, recruiterId);
        return ResponseEntity.ok(application);
    }

    @PutMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApplicationDto> withdrawApplication(@PathVariable Long id) {
        Long studentId = securityUtils.getCurrentUserId();
        if (studentId == null) {
            return ResponseEntity.status(401).build();
        }
        
        ApplicationDto application = applicationService.withdrawApplication(id, studentId);
        return ResponseEntity.ok(application);
    }
}
