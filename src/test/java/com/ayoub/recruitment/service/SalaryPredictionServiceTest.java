package com.ayoub.recruitment.service;

import com.ayoub.recruitment.ai.SalaryPredictionService;
import com.ayoub.recruitment.ai.SimpleSalaryPredictionService;
import com.ayoub.recruitment.model.JobOffer;
import com.ayoub.recruitment.model.StudentProfile;
import com.ayoub.recruitment.model.User;
import com.ayoub.recruitment.model.UserRole;
import com.ayoub.recruitment.repository.JobOfferRepository;
import com.ayoub.recruitment.repository.StudentProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SalaryPredictionServiceTest {

    @Mock
    private JobOfferRepository jobOfferRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    private SalaryPredictionService salaryPredictionService;
    private StudentProfile studentProfile;
    private List<JobOffer> allJobOffers;

    @BeforeEach
    void setUp() {
        salaryPredictionService = new SimpleSalaryPredictionService(jobOfferRepository, studentProfileRepository);
        
        // Create a student profile
        User student = new User();
        student.setId(1L);
        student.setEmail("student@example.com");
        student.setRole(UserRole.STUDENT);
        
        studentProfile = new StudentProfile();
        studentProfile.setId(1L);
        studentProfile.setUser(student);
        studentProfile.setFullName("John Doe");
        studentProfile.setSkills("Java, Spring, SQL, React");
        studentProfile.setEducation("Bachelor of Computer Science");
        studentProfile.setExperience("2 years as Junior Developer");
        
        // Create job offers with salary ranges
        User recruiter = new User();
        recruiter.setId(2L);
        recruiter.setEmail("recruiter@example.com");
        recruiter.setRole(UserRole.RECRUITER);
        
        JobOffer job1 = new JobOffer();
        job1.setId(1L);
        job1.setTitle("Java Developer");
        job1.setDescription("Java developer position");
        job1.setCompanyName("Tech Company");
        job1.setSkills("Java, Spring, Hibernate, SQL");
        job1.setSalaryMin(70000.0);
        job1.setSalaryMax(90000.0);
        job1.setRecruiter(recruiter);
        
        JobOffer job2 = new JobOffer();
        job2.setId(2L);
        job2.setTitle("Senior Java Developer");
        job2.setDescription("Senior Java developer position");
        job2.setCompanyName("Enterprise Company");
        job2.setSkills("Java, Spring, Microservices, SQL");
        job2.setSalaryMin(90000.0);
        job2.setSalaryMax(120000.0);
        job2.setRecruiter(recruiter);
        
        JobOffer job3 = new JobOffer();
        job3.setId(3L);
        job3.setTitle("Frontend Developer");
        job3.setDescription("React developer position");
        job3.setCompanyName("Web Company");
        job3.setSkills("React, JavaScript, HTML, CSS");
        job3.setSalaryMin(65000.0);
        job3.setSalaryMax(85000.0);
        job3.setRecruiter(recruiter);
        
        allJobOffers = Arrays.asList(job1, job2, job3);
    }

    @Test
    void whenPredictSalaryForStudent_thenReturnReasonablePrediction() {
        // Arrange
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(studentProfile));
        when(jobOfferRepository.findAll()).thenReturn(allJobOffers);
        
        // Act
        Map<String, Object> prediction = salaryPredictionService.predictSalaryForStudent(1L);
        
        // Assert
        assertThat(prediction).containsKeys("minSalary", "maxSalary", "confidenceScore");
        
        Double minSalary = (Double) prediction.get("minSalary");
        Double maxSalary = (Double) prediction.get("maxSalary");
        Double confidenceScore = (Double) prediction.get("confidenceScore");
        
        // Verify the prediction is within a reasonable range based on the job offers
        assertThat(minSalary).isGreaterThanOrEqualTo(65000.0);
        assertThat(maxSalary).isLessThanOrEqualTo(120000.0);
        
        // Verify min is less than max
        assertThat(minSalary).isLessThan(maxSalary);
        
        // Verify confidence score is between 0 and 1
        assertThat(confidenceScore).isBetween(0.0, 1.0);
    }

    @Test
    void whenStudentHasHigherEducation_thenSalaryPredictionIsHigher() {
        // Arrange
        StudentProfile mastersDegreeProfile = new StudentProfile();
        mastersDegreeProfile.setId(2L);
        mastersDegreeProfile.setSkills("Java, Spring, SQL, React");
        mastersDegreeProfile.setEducation("Master of Computer Science");
        mastersDegreeProfile.setExperience("2 years as Junior Developer");
        
        User student2 = new User();
        student2.setId(2L);
        mastersDegreeProfile.setUser(student2);
        
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(studentProfile)); // Bachelor's
        when(studentProfileRepository.findByUserId(2L)).thenReturn(Optional.of(mastersDegreeProfile)); // Master's
        when(jobOfferRepository.findAll()).thenReturn(allJobOffers);
        
        // Act
        Map<String, Object> bachelorsPrediction = salaryPredictionService.predictSalaryForStudent(1L);
        Map<String, Object> mastersPrediction = salaryPredictionService.predictSalaryForStudent(2L);
        
        // Assert
        Double bachelorsMinSalary = (Double) bachelorsPrediction.get("minSalary");
        Double mastersMinSalary = (Double) mastersPrediction.get("minSalary");
        
        // Master's degree should predict higher salary
        assertThat(mastersMinSalary).isGreaterThan(bachelorsMinSalary);
    }

    @Test
    void whenStudentHasMoreExperience_thenSalaryPredictionIsHigher() {
        // Arrange
        StudentProfile moreExperienceProfile = new StudentProfile();
        moreExperienceProfile.setId(3L);
        moreExperienceProfile.setSkills("Java, Spring, SQL, React");
        moreExperienceProfile.setEducation("Bachelor of Computer Science");
        moreExperienceProfile.setExperience("5 years as Software Engineer");
        
        User student3 = new User();
        student3.setId(3L);
        moreExperienceProfile.setUser(student3);
        
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(studentProfile)); // 2 years
        when(studentProfileRepository.findByUserId(3L)).thenReturn(Optional.of(moreExperienceProfile)); // 5 years
        when(jobOfferRepository.findAll()).thenReturn(allJobOffers);
        
        // Act
        Map<String, Object> lessExperiencePrediction = salaryPredictionService.predictSalaryForStudent(1L);
        Map<String, Object> moreExperiencePrediction = salaryPredictionService.predictSalaryForStudent(3L);
        
        // Assert
        Double lessExperienceMinSalary = (Double) lessExperiencePrediction.get("minSalary");
        Double moreExperienceMinSalary = (Double) moreExperiencePrediction.get("minSalary");
        
        // More experience should predict higher salary
        assertThat(moreExperienceMinSalary).isGreaterThan(lessExperienceMinSalary);
    }

    @Test
    void whenStudentProfileNotFound_thenReturnDefaultPrediction() {
        // Arrange
        when(studentProfileRepository.findByUserId(999L)).thenReturn(Optional.empty());
        when(jobOfferRepository.findAll()).thenReturn(allJobOffers);
        
        // Act
        Map<String, Object> prediction = salaryPredictionService.predictSalaryForStudent(999L);
        
        // Assert
        assertThat(prediction).containsKeys("minSalary", "maxSalary", "confidenceScore");
        
        Double confidenceScore = (Double) prediction.get("confidenceScore");
        
        // Confidence should be low when profile is not found
        assertThat(confidenceScore).isLessThan(0.5);
    }

    @Test
    void whenNoJobOffersExist_thenReturnDefaultPrediction() {
        // Arrange
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(studentProfile));
        when(jobOfferRepository.findAll()).thenReturn(Arrays.asList());
        
        // Act
        Map<String, Object> prediction = salaryPredictionService.predictSalaryForStudent(1L);
        
        // Assert
        assertThat(prediction).containsKeys("minSalary", "maxSalary", "confidenceScore");
        
        Double minSalary = (Double) prediction.get("minSalary");
        Double maxSalary = (Double) prediction.get("maxSalary");
        Double confidenceScore = (Double) prediction.get("confidenceScore");
        
        // Should return some default values
        assertThat(minSalary).isGreaterThan(0.0);
        assertThat(maxSalary).isGreaterThan(minSalary);
        
        // Confidence should be low when no job offers exist
        assertThat(confidenceScore).isLessThan(0.5);
    }
}
