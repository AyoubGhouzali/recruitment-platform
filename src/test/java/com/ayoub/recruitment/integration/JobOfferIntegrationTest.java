package com.ayoub.recruitment.integration;

import com.ayoub.recruitment.dto.JobOfferDto;
import com.ayoub.recruitment.model.JobOffer;
import com.ayoub.recruitment.model.User;
import com.ayoub.recruitment.model.UserRole;
import com.ayoub.recruitment.repository.JobOfferRepository;
import com.ayoub.recruitment.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class JobOfferIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User recruiter;
    private User student;
    private String recruiterToken;
    private String studentToken;

    @BeforeEach
    void setUp() throws Exception {
        // Clean up existing data
        jobOfferRepository.deleteAll();
        userRepository.deleteAll();

        // Create test users
        recruiter = new User();
        recruiter.setEmail("recruiter@example.com");
        recruiter.setPassword(passwordEncoder.encode("password"));
        recruiter.setRole(UserRole.RECRUITER);
        userRepository.save(recruiter);

        student = new User();
        student.setEmail("student@example.com");
        student.setPassword(passwordEncoder.encode("password"));
        student.setRole(UserRole.STUDENT);
        userRepository.save(student);

        // Login and get tokens
        recruiterToken = getAuthToken("recruiter@example.com", "password");
        studentToken = getAuthToken("student@example.com", "password");
    }

    @Test
    void testCreateAndGetJobOffer() throws Exception {
        // Create a job offer
        JobOfferDto jobOfferDto = new JobOfferDto();
        jobOfferDto.setTitle("Software Engineer");
        jobOfferDto.setDescription("Java developer position");
        jobOfferDto.setCompanyName("Tech Company");
        jobOfferDto.setSalaryMin(50000.0);
        jobOfferDto.setSalaryMax(100000.0);
        jobOfferDto.setSkills("Java, Spring, SQL");

        // Post the job offer as a recruiter
        MvcResult result = mockMvc.perform(post("/jobs")
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(jobOfferDto)))
                .andExpect(status().isCreated())
                .andReturn();

        // Extract the job ID from the response
        String responseJson = result.getResponse().getContentAsString();
        JobOffer createdJob = objectMapper.readValue(responseJson, JobOffer.class);
        Long jobId = createdJob.getId();

        // Get the job offer by ID
        mockMvc.perform(get("/jobs/" + jobId)
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Software Engineer")))
                .andExpect(jsonPath("$.description", is("Java developer position")))
                .andExpect(jsonPath("$.companyName", is("Tech Company")))
                .andExpect(jsonPath("$.skills", is("Java, Spring, SQL")));

        // Verify student can also view the job
        mockMvc.perform(get("/jobs/" + jobId)
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Software Engineer")));
    }

    @Test
    void testUpdateJobOffer() throws Exception {
        // Create a job offer
        JobOffer jobOffer = new JobOffer();
        jobOffer.setTitle("Software Engineer");
        jobOffer.setDescription("Java developer position");
        jobOffer.setCompanyName("Tech Company");
        jobOffer.setSalaryMin(50000.0);
        jobOffer.setSalaryMax(100000.0);
        jobOffer.setSkills("Java, Spring, SQL");
        jobOffer.setRecruiter(recruiter);
        
        JobOffer savedJob = jobOfferRepository.save(jobOffer);

        // Update job offer DTO
        JobOfferDto updateDto = new JobOfferDto();
        updateDto.setTitle("Senior Software Engineer");
        updateDto.setDescription("Updated description");
        updateDto.setCompanyName("Tech Company");
        updateDto.setSalaryMin(60000.0);
        updateDto.setSalaryMax(120000.0);
        updateDto.setSkills("Java, Spring, SQL, AWS");

        // Update the job offer as a recruiter
        mockMvc.perform(put("/jobs/" + savedJob.getId())
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Senior Software Engineer")))
                .andExpect(jsonPath("$.description", is("Updated description")))
                .andExpect(jsonPath("$.skills", is("Java, Spring, SQL, AWS")));

        // Verify student cannot update the job
        mockMvc.perform(put("/jobs/" + savedJob.getId())
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testDeleteJobOffer() throws Exception {
        // Create a job offer
        JobOffer jobOffer = new JobOffer();
        jobOffer.setTitle("Software Engineer");
        jobOffer.setDescription("Java developer position");
        jobOffer.setCompanyName("Tech Company");
        jobOffer.setRecruiter(recruiter);
        
        JobOffer savedJob = jobOfferRepository.save(jobOffer);

        // Delete the job offer as a recruiter
        mockMvc.perform(delete("/jobs/" + savedJob.getId())
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk());

        // Verify the job offer is deleted
        assertThat(jobOfferRepository.findById(savedJob.getId())).isEmpty();

        // Verify student cannot delete a job
        JobOffer anotherJob = new JobOffer();
        anotherJob.setTitle("Another Job");
        anotherJob.setDescription("Another description");
        anotherJob.setCompanyName("Another Company");
        anotherJob.setRecruiter(recruiter);
        
        JobOffer savedAnotherJob = jobOfferRepository.save(anotherJob);

        mockMvc.perform(delete("/jobs/" + savedAnotherJob.getId())
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void testSearchJobOffers() throws Exception {
        // Create multiple job offers
        createJobOffer("Java Developer", "Java position", "Tech Company", "Java, Spring", recruiter);
        createJobOffer("Frontend Developer", "React position", "Web Company", "React, JavaScript", recruiter);
        createJobOffer("Data Scientist", "ML position", "Data Company", "Python, TensorFlow", recruiter);
        createJobOffer("Java Architect", "Senior Java position", "Enterprise Company", "Java, Architecture", recruiter);

        // Search for Java jobs
        mockMvc.perform(get("/jobs/search?keyword=java")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title", is("Java Developer")))
                .andExpect(jsonPath("$[1].title", is("Java Architect")));

        // Search for Tech Company jobs
        mockMvc.perform(get("/jobs/search?keyword=tech company")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].companyName", is("Tech Company")));
    }

    private void createJobOffer(String title, String description, String companyName, String skills, User recruiter) {
        JobOffer jobOffer = new JobOffer();
        jobOffer.setTitle(title);
        jobOffer.setDescription(description);
        jobOffer.setCompanyName(companyName);
        jobOffer.setSkills(skills);
        jobOffer.setRecruiter(recruiter);
        jobOfferRepository.save(jobOffer);
    }

    private String getAuthToken(String email, String password) throws Exception {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", email);
        loginRequest.put("password", password);

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        Map<String, Object> responseMap = objectMapper.readValue(responseJson, Map.class);
        return (String) responseMap.get("token");
    }
}
