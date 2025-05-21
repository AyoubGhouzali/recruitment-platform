package com.ayoub.recruitment.ai;

import com.ayoub.recruitment.model.StudentProfile;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * A simple implementation of the SalaryPredictionService that uses basic heuristics.
 * This will be replaced with more sophisticated ML models in future iterations.
 */
@Service
public class SimpleSalaryPredictionService implements SalaryPredictionService {

    // Map of skills to their relative value in salary calculation
    private static final Map<String, Double> SKILL_VALUES = new HashMap<>();
    
    static {
        // Programming languages
        SKILL_VALUES.put("java", 0.8);
        SKILL_VALUES.put("python", 0.85);
        SKILL_VALUES.put("javascript", 0.75);
        SKILL_VALUES.put("typescript", 0.8);
        SKILL_VALUES.put("c++", 0.85);
        SKILL_VALUES.put("c#", 0.75);
        SKILL_VALUES.put("php", 0.65);
        SKILL_VALUES.put("ruby", 0.7);
        
        // Databases
        SKILL_VALUES.put("sql", 0.7);
        SKILL_VALUES.put("nosql", 0.75);
        SKILL_VALUES.put("mongodb", 0.75);
        SKILL_VALUES.put("postgresql", 0.8);
        SKILL_VALUES.put("mysql", 0.7);
        SKILL_VALUES.put("oracle", 0.85);
        
        // Frameworks
        SKILL_VALUES.put("spring", 0.85);
        SKILL_VALUES.put("hibernate", 0.75);
        SKILL_VALUES.put("react", 0.8);
        SKILL_VALUES.put("angular", 0.8);
        SKILL_VALUES.put("vue", 0.75);
        SKILL_VALUES.put("node.js", 0.8);
        SKILL_VALUES.put("express", 0.7);
        SKILL_VALUES.put("django", 0.75);
        SKILL_VALUES.put("flask", 0.7);
        
        // DevOps & Cloud
        SKILL_VALUES.put("docker", 0.85);
        SKILL_VALUES.put("kubernetes", 0.9);
        SKILL_VALUES.put("aws", 0.9);
        SKILL_VALUES.put("azure", 0.85);
        SKILL_VALUES.put("gcp", 0.85);
        SKILL_VALUES.put("devops", 0.9);
        SKILL_VALUES.put("ci/cd", 0.8);
        
        // Other
        SKILL_VALUES.put("git", 0.6);
        SKILL_VALUES.put("agile", 0.6);
        SKILL_VALUES.put("scrum", 0.6);
        SKILL_VALUES.put("machine learning", 0.95);
        SKILL_VALUES.put("data science", 0.95);
        SKILL_VALUES.put("ai", 0.95);
    }

    // Base salary ranges by education level
    private static final Map<String, double[]> EDUCATION_BASE_SALARY = new HashMap<>();
    
    static {
        EDUCATION_BASE_SALARY.put("bachelor", new double[]{40000, 60000});
        EDUCATION_BASE_SALARY.put("master", new double[]{55000, 75000});
        EDUCATION_BASE_SALARY.put("phd", new double[]{70000, 90000});
        EDUCATION_BASE_SALARY.put("default", new double[]{35000, 55000});
    }

    @Override
    public SalaryPrediction predictSalary(StudentProfile studentProfile) {
        if (studentProfile == null) {
            return new SalaryPrediction(0, 0, 0);
        }
        
        // Extract skills from student profile
        List<String> skills = parseSkills(studentProfile.getSkills());
        
        // Determine education level
        String educationLevel = determineEducationLevel(studentProfile.getEducation());
        
        // Get base salary range for the education level
        double[] baseSalaryRange = EDUCATION_BASE_SALARY.getOrDefault(educationLevel, EDUCATION_BASE_SALARY.get("default"));
        
        // Calculate skill score (0.0 to 1.0)
        double skillScore = calculateSkillScore(skills);
        
        // Adjust salary range based on skill score
        double minSalary = baseSalaryRange[0] * (1 + skillScore * 0.5);
        double maxSalary = baseSalaryRange[1] * (1 + skillScore * 0.7);
        
        // Calculate confidence score based on amount of information available
        double confidenceScore = calculateConfidenceScore(studentProfile, skills);
        
        return new SalaryPrediction(minSalary, maxSalary, confidenceScore);
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
    
    private String determineEducationLevel(String educationText) {
        if (educationText == null || educationText.isEmpty()) {
            return "default";
        }
        
        String lowerCaseText = educationText.toLowerCase();
        
        if (lowerCaseText.contains("phd") || lowerCaseText.contains("doctorate")) {
            return "phd";
        } else if (lowerCaseText.contains("master") || lowerCaseText.contains("msc") || lowerCaseText.contains("mba")) {
            return "master";
        } else if (lowerCaseText.contains("bachelor") || lowerCaseText.contains("bsc") || lowerCaseText.contains("undergraduate")) {
            return "bachelor";
        } else {
            return "default";
        }
    }
    
    private double calculateSkillScore(List<String> skills) {
        if (skills.isEmpty()) {
            return 0.0;
        }
        
        double totalValue = 0.0;
        int matchedSkills = 0;
        
        for (String skill : skills) {
            for (Map.Entry<String, Double> entry : SKILL_VALUES.entrySet()) {
                if (skill.contains(entry.getKey()) || entry.getKey().contains(skill)) {
                    totalValue += entry.getValue();
                    matchedSkills++;
                    break;
                }
            }
        }
        
        // Calculate weighted average of skill values
        return matchedSkills > 0 ? totalValue / matchedSkills : 0.0;
    }
    
    private double calculateConfidenceScore(StudentProfile profile, List<String> skills) {
        // Factors affecting confidence:
        // 1. Number of skills (more skills = more confidence)
        // 2. Presence of education information
        // 3. Presence of resume
        
        double skillFactor = Math.min(1.0, skills.size() / 10.0);
        double educationFactor = (profile.getEducation() != null && !profile.getEducation().isEmpty()) ? 1.0 : 0.5;
        double resumeFactor = (profile.getResumeUrl() != null && !profile.getResumeUrl().isEmpty()) ? 1.0 : 0.7;
        
        return (skillFactor * 0.6 + educationFactor * 0.3 + resumeFactor * 0.1);
    }
}
