package com.ayoub.recruitment.controller;

import com.ayoub.recruitment.ai.RecommendationService;
import com.ayoub.recruitment.ai.SalaryPredictionService;
import com.ayoub.recruitment.dto.JobOfferDto;
import com.ayoub.recruitment.model.StudentProfile;
import com.ayoub.recruitment.repository.StudentProfileRepository;
import com.ayoub.recruitment.security.SecurityUtils;
import com.ayoub.recruitment.service.JobOfferService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AIController {

    private final RecommendationService recommendationService;
    private final SalaryPredictionService salaryPredictionService;
    private final StudentProfileRepository studentProfileRepository;
    private final JobOfferService jobOfferService;
    private final SecurityUtils securityUtils;

    public AIController(
            RecommendationService recommendationService,
            SalaryPredictionService salaryPredictionService,
            StudentProfileRepository studentProfileRepository,
            JobOfferService jobOfferService,
            SecurityUtils securityUtils) {
        this.recommendationService = recommendationService;
        this.salaryPredictionService = salaryPredictionService;
        this.studentProfileRepository = studentProfileRepository;
        this.jobOfferService = jobOfferService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/recommend")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<JobOfferDto>> getJobRecommendations(
            @RequestParam(defaultValue = "5") int limit) {
        Long userId = securityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        // Get student profile
        StudentProfile studentProfile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        // Get all available jobs
        List<JobOfferDto> availableJobs = jobOfferService.getAllJobOffers();

        // Get recommendations
        List<JobOfferDto> recommendations = recommendationService.recommendJobs(
                studentProfile, availableJobs, limit);

        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/salary")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getSalaryPrediction() {
        Long userId = securityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        // Get student profile
        StudentProfile studentProfile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        // Get salary prediction
        SalaryPredictionService.SalaryPrediction prediction = 
                salaryPredictionService.predictSalary(studentProfile);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("minSalary", prediction.getMinSalary());
        response.put("maxSalary", prediction.getMaxSalary());
        response.put("confidenceScore", prediction.getConfidenceScore());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/skills")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<String>> extractSkills(@RequestParam String resumeText) {
        List<String> skills = recommendationService.extractSkills(resumeText);
        return ResponseEntity.ok(skills);
    }
}
