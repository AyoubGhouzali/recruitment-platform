package com.ayoub.recruitment.service;

import com.ayoub.recruitment.ai.RecommendationService;
import com.ayoub.recruitment.ai.SimpleRecommendationService;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RecommendationServiceTest {

    @Mock
    private JobOfferRepository jobOfferRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    private RecommendationService recommendationService;
    private StudentProfile studentProfile;
    private List<JobOffer> allJobOffers;

    @BeforeEach
    void setUp() {
        recommendationService = new SimpleRecommendationService(jobOfferRepository, studentProfileRepository);
        
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
        
        // Create job offers
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
        job1.setRecruiter(recruiter);
        
        JobOffer job2 = new JobOffer();
        job2.setId(2L);
        job2.setTitle("Frontend Developer");
        job2.setDescription("React developer position");
        job2.setCompanyName("Web Company");
        job2.setSkills("React, JavaScript, HTML, CSS");
        job2.setRecruiter(recruiter);
        
        JobOffer job3 = new JobOffer();
        job3.setId(3L);
        job3.setTitle("Data Scientist");
        job3.setDescription("ML engineer position");
        job3.setCompanyName("Data Company");
        job3.setSkills("Python, TensorFlow, SQL");
        job3.setRecruiter(recruiter);
        
        allJobOffers = Arrays.asList(job1, job2, job3);
    }

    @Test
    void whenGetRecommendationsForStudent_thenReturnMatchingJobs() {
        // Arrange
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(studentProfile));
        when(jobOfferRepository.findAll()).thenReturn(allJobOffers);
        
        // Act
        List<JobOffer> recommendations = recommendationService.getRecommendationsForStudent(1L);
        
        // Assert
        assertThat(recommendations).hasSize(2);
        assertThat(recommendations.get(0).getTitle()).isEqualTo("Java Developer");
        assertThat(recommendations.get(1).getTitle()).isEqualTo("Frontend Developer");
    }

    @Test
    void whenGetRecommendationsWithNoSkillMatch_thenReturnEmptyList() {
        // Arrange
        StudentProfile noMatchProfile = new StudentProfile();
        noMatchProfile.setId(2L);
        noMatchProfile.setSkills("C++, Unity, Game Development");
        
        User student2 = new User();
        student2.setId(2L);
        noMatchProfile.setUser(student2);
        
        when(studentProfileRepository.findByUserId(2L)).thenReturn(Optional.of(noMatchProfile));
        when(jobOfferRepository.findAll()).thenReturn(allJobOffers);
        
        // Act
        List<JobOffer> recommendations = recommendationService.getRecommendationsForStudent(2L);
        
        // Assert
        assertThat(recommendations).isEmpty();
    }

    @Test
    void whenStudentProfileNotFound_thenReturnEmptyList() {
        // Arrange
        when(studentProfileRepository.findByUserId(999L)).thenReturn(Optional.empty());
        
        // Act
        List<JobOffer> recommendations = recommendationService.getRecommendationsForStudent(999L);
        
        // Assert
        assertThat(recommendations).isEmpty();
    }

    @Test
    void whenGetRecommendationsWithPartialSkillMatch_thenRankByRelevance() {
        // Arrange
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(studentProfile));
        
        // Create job with partial skill match
        JobOffer job4 = new JobOffer();
        job4.setId(4L);
        job4.setTitle("Full Stack Developer");
        job4.setDescription("Full stack position with Java and React");
        job4.setCompanyName("Software Company");
        job4.setSkills("Java, React, Node.js, MongoDB");
        
        List<JobOffer> moreJobs = Arrays.asList(allJobOffers.get(0), allJobOffers.get(1), allJobOffers.get(2), job4);
        when(jobOfferRepository.findAll()).thenReturn(moreJobs);
        
        // Act
        List<JobOffer> recommendations = recommendationService.getRecommendationsForStudent(1L);
        
        // Assert
        assertThat(recommendations).hasSize(3);
        // The full stack job should be in the recommendations
        assertThat(recommendations.stream().anyMatch(job -> job.getTitle().equals("Full Stack Developer"))).isTrue();
    }
}
