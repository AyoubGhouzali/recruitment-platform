package com.ayoub.recruitment.ai;

import com.ayoub.recruitment.dto.JobOfferDto;
import com.ayoub.recruitment.model.StudentProfile;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * A simple implementation of the RecommendationService that uses basic text matching.
 * This will be replaced with more sophisticated ML models in future iterations.
 */
@Service
public class SimpleRecommendationService implements RecommendationService {

    @Override
    public List<JobOfferDto> recommendJobs(StudentProfile studentProfile, List<JobOfferDto> availableJobs, int limit) {
        // Calculate match scores for all available jobs
        Map<JobOfferDto, Double> jobScores = new HashMap<>();
        for (JobOfferDto job : availableJobs) {
            double score = calculateMatchScore(studentProfile, job);
            jobScores.put(job, score);
        }
        
        // Sort jobs by score and return top matches
        return jobScores.entrySet().stream()
                .sorted(Map.Entry.<JobOfferDto, Double>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> extractSkills(String resumeText) {
        if (resumeText == null || resumeText.isEmpty()) {
            return Collections.emptyList();
        }
        
        // This is a very simple skill extraction that just looks for common programming languages
        // In a real implementation, this would use NLP techniques to extract skills
        List<String> commonSkills = Arrays.asList(
                "java", "python", "javascript", "typescript", "c++", "c#", "php", "ruby",
                "sql", "nosql", "mongodb", "postgresql", "mysql", "oracle", "spring", "hibernate",
                "react", "angular", "vue", "node.js", "express", "django", "flask", "docker",
                "kubernetes", "aws", "azure", "gcp", "devops", "ci/cd", "git", "agile", "scrum"
        );
        
        String lowerCaseText = resumeText.toLowerCase();
        return commonSkills.stream()
                .filter(lowerCaseText::contains)
                .collect(Collectors.toList());
    }

    @Override
    public double calculateMatchScore(StudentProfile studentProfile, JobOfferDto jobOffer) {
        if (studentProfile == null || jobOffer == null) {
            return 0.0;
        }
        
        // Extract skills from student profile and job offer
        List<String> studentSkills = parseSkills(studentProfile.getSkills());
        List<String> jobSkills = parseSkills(jobOffer.getSkills());
        
        if (studentSkills.isEmpty() || jobSkills.isEmpty()) {
            return 0.0;
        }
        
        // Calculate Jaccard similarity (intersection over union)
        Set<String> intersection = new HashSet<>(studentSkills);
        intersection.retainAll(jobSkills);
        
        Set<String> union = new HashSet<>(studentSkills);
        union.addAll(jobSkills);
        
        return (double) intersection.size() / union.size();
    }
    
    private List<String> parseSkills(String skillsText) {
        if (skillsText == null || skillsText.isEmpty()) {
            return Collections.emptyList();
        }
        
        // Split by common delimiters and normalize
        return Arrays.stream(skillsText.split("[,;\\n]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.toList());
    }
}
