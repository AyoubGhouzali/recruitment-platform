package com.ayoub.recruitment.ai;

import com.ayoub.recruitment.dto.JobOfferDto;
import com.ayoub.recruitment.model.JobOffer;
import com.ayoub.recruitment.model.StudentProfile;

import java.util.List;

/**
 * Service interface for AI-powered job recommendations.
 * This will be implemented in future iterations with actual ML models.
 */
public interface RecommendationService {
    
    /**
     * Recommends job offers based on a student's profile.
     * 
     * @param studentProfile The student profile to analyze
     * @param availableJobs List of available job offers
     * @param limit Maximum number of recommendations to return
     * @return List of recommended job offers sorted by relevance
     */
    List<JobOfferDto> recommendJobs(StudentProfile studentProfile, List<JobOfferDto> availableJobs, int limit);
    
    /**
     * Extracts skills from a resume text.
     * 
     * @param resumeText The text content of a resume
     * @return List of extracted skills
     */
    List<String> extractSkills(String resumeText);
    
    /**
     * Calculates a match score between a student profile and a job offer.
     * 
     * @param studentProfile The student profile
     * @param jobOffer The job offer
     * @return A score between 0.0 and 1.0 indicating match quality
     */
    double calculateMatchScore(StudentProfile studentProfile, JobOfferDto jobOffer);
    
    /**
     * Get job recommendations for a student based on their user ID.
     * 
     * @param studentId The user ID of the student
     * @return List of recommended job offers sorted by relevance
     */
    List<JobOffer> getRecommendationsForStudent(long studentId);
}
