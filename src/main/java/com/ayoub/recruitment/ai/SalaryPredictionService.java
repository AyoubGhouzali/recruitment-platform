package com.ayoub.recruitment.ai;

import com.ayoub.recruitment.model.StudentProfile;

import java.util.Map;

/**
 * Service interface for AI-powered salary predictions.
 * This will be implemented in future iterations with actual ML models.
 */
public interface SalaryPredictionService {
    
    /**
     * Predicts a salary range based on a student's profile and skills.
     * 
     * @param studentProfile The student profile to analyze
     * @return A predicted salary range as a SalaryPrediction object
     */
    SalaryPrediction predictSalary(StudentProfile studentProfile);
    
    /**
     * Predicts a salary range for a student based on their user ID.
     * 
     * @param studentId The user ID of the student
     * @return A map containing minSalary, maxSalary, and confidenceScore
     */
    Map<String, Object> predictSalaryForStudent(long studentId);
    
    /**
     * Inner class representing a salary prediction with min and max values.
     */
    class SalaryPrediction {
        private final double minSalary;
        private final double maxSalary;
        private final double confidenceScore;
        
        public SalaryPrediction(double minSalary, double maxSalary, double confidenceScore) {
            this.minSalary = minSalary;
            this.maxSalary = maxSalary;
            this.confidenceScore = confidenceScore;
        }
        
        public double getMinSalary() {
            return minSalary;
        }
        
        public double getMaxSalary() {
            return maxSalary;
        }
        
        public double getConfidenceScore() {
            return confidenceScore;
        }
    }
}
