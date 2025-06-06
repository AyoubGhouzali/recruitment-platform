package com.ayoub.recruitment.controller;

import com.ayoub.recruitment.dto.JobOfferDto;
import com.ayoub.recruitment.model.User;
import com.ayoub.recruitment.model.UserRole;
import com.ayoub.recruitment.security.SecurityUtils;
import com.ayoub.recruitment.service.JobOfferService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/joboffers")
public class JobOfferController {

    private final JobOfferService jobOfferService;
    private final SecurityUtils securityUtils;

    public JobOfferController(JobOfferService jobOfferService, SecurityUtils securityUtils) {
        this.jobOfferService = jobOfferService;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public ResponseEntity<List<JobOfferDto>> getAllJobOffers() {
        List<JobOfferDto> jobOffers = jobOfferService.getAllJobOffers();
        return ResponseEntity.ok(jobOffers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOfferDto> getJobOfferById(@PathVariable Long id) {
        JobOfferDto jobOffer = jobOfferService.getJobOfferById(id);
        return ResponseEntity.ok(jobOffer);
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobOfferDto>> searchJobOffers(@RequestParam String keyword) {
        List<JobOfferDto> jobOffers = jobOfferService.searchJobOffers(keyword);
        return ResponseEntity.ok(jobOffers);
    }
    
    @GetMapping("/recruiter/{recruiterId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<List<JobOfferDto>> getJobOffersByRecruiterId(
            @PathVariable Long recruiterId,
            @RequestParam(required = false) Integer limit) {
        Long currentUserId = securityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        
        // Recruiters can only view their own job offers unless they are admins
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null || (currentUser.getRole() != UserRole.ADMIN && !currentUserId.equals(recruiterId))) {
            return ResponseEntity.status(403).build();
        }
        
        List<JobOfferDto> jobOffers = jobOfferService.getJobOffersByRecruiterId(recruiterId, Optional.ofNullable(limit));
        return ResponseEntity.ok(jobOffers);
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobOfferDto> createJobOffer(@RequestBody JobOfferDto jobOfferDto) {
        Long recruiterId = securityUtils.getCurrentUserId();
        if (recruiterId == null) {
            return ResponseEntity.status(401).build();
        }
        
        JobOfferDto createdJobOffer = jobOfferService.createJobOffer(recruiterId, jobOfferDto);
        return ResponseEntity.ok(createdJobOffer);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobOfferDto> updateJobOffer(
            @PathVariable Long id, 
            @RequestBody JobOfferDto jobOfferDto) {
        Long recruiterId = securityUtils.getCurrentUserId();
        if (recruiterId == null) {
            return ResponseEntity.status(401).build();
        }
        
        JobOfferDto updatedJobOffer = jobOfferService.updateJobOffer(recruiterId, id, jobOfferDto);
        return ResponseEntity.ok(updatedJobOffer);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Void> deleteJobOffer(@PathVariable Long id) {
        Long recruiterId = securityUtils.getCurrentUserId();
        if (recruiterId == null) {
            return ResponseEntity.status(401).build();
        }
        
        jobOfferService.deleteJobOffer(recruiterId, id);
        return ResponseEntity.noContent().build();
    }
}
