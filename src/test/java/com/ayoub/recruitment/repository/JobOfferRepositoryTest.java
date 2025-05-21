package com.ayoub.recruitment.repository;

import com.ayoub.recruitment.model.JobOffer;
import com.ayoub.recruitment.model.User;
import com.ayoub.recruitment.model.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
public class JobOfferRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    private User recruiter1;
    private User recruiter2;

    @BeforeEach
    public void setup() {
        // Create test recruiters
        recruiter1 = new User();
        recruiter1.setEmail("recruiter1@example.com");
        recruiter1.setPassword("password");
        recruiter1.setRole(UserRole.RECRUITER);
        entityManager.persist(recruiter1);

        recruiter2 = new User();
        recruiter2.setEmail("recruiter2@example.com");
        recruiter2.setPassword("password");
        recruiter2.setRole(UserRole.RECRUITER);
        entityManager.persist(recruiter2);

        entityManager.flush();
    }

    @Test
    public void whenFindByRecruiter_thenReturnJobOffers() {
        // given
        JobOffer job1 = createJobOffer("Software Engineer", "Java developer position", 
                "Tech Company", recruiter1, "Java, Spring, SQL");
        JobOffer job2 = createJobOffer("Frontend Developer", "React developer position", 
                "Tech Company", recruiter1, "React, JavaScript, CSS");
        JobOffer job3 = createJobOffer("Data Scientist", "ML engineer position", 
                "Data Corp", recruiter2, "Python, TensorFlow, SQL");

        entityManager.persist(job1);
        entityManager.persist(job2);
        entityManager.persist(job3);
        entityManager.flush();

        // when
        List<JobOffer> recruiter1Jobs = jobOfferRepository.findByRecruiter(recruiter1);
        List<JobOffer> recruiter2Jobs = jobOfferRepository.findByRecruiter(recruiter2);

        // then
        assertThat(recruiter1Jobs).hasSize(2);
        assertThat(recruiter1Jobs).extracting(JobOffer::getTitle).containsExactlyInAnyOrder(
                "Software Engineer", "Frontend Developer");

        assertThat(recruiter2Jobs).hasSize(1);
        assertThat(recruiter2Jobs).extracting(JobOffer::getTitle).containsExactly("Data Scientist");
    }

    @Test
    public void whenFindByRecruiterId_thenReturnJobOffers() {
        // given
        JobOffer job1 = createJobOffer("Software Engineer", "Java developer position", 
                "Tech Company", recruiter1, "Java, Spring, SQL");
        JobOffer job2 = createJobOffer("Frontend Developer", "React developer position", 
                "Tech Company", recruiter1, "React, JavaScript, CSS");

        entityManager.persist(job1);
        entityManager.persist(job2);
        entityManager.flush();

        // when
        List<JobOffer> recruiter1Jobs = jobOfferRepository.findByRecruiterId(recruiter1.getId());

        // then
        assertThat(recruiter1Jobs).hasSize(2);
        assertThat(recruiter1Jobs).extracting(JobOffer::getTitle).containsExactlyInAnyOrder(
                "Software Engineer", "Frontend Developer");
    }

    @Test
    public void whenSearchByKeyword_thenReturnMatchingJobOffers() {
        // given
        JobOffer job1 = createJobOffer("Java Developer", "Senior Java developer position", 
                "Tech Company", recruiter1, "Java, Spring, SQL");
        JobOffer job2 = createJobOffer("Frontend Developer", "React developer position", 
                "Tech Company", recruiter1, "React, JavaScript, CSS");
        JobOffer job3 = createJobOffer("Data Scientist", "ML engineer position at Tech Company", 
                "Data Corp", recruiter2, "Python, TensorFlow, SQL");
        JobOffer job4 = createJobOffer("Java Architect", "Java architect with SQL skills", 
                "Finance Corp", recruiter2, "Java, Architecture, SQL");

        entityManager.persist(job1);
        entityManager.persist(job2);
        entityManager.persist(job3);
        entityManager.persist(job4);
        entityManager.flush();

        // when
        List<JobOffer> javaJobs = jobOfferRepository.searchByKeyword("java");
        List<JobOffer> techCompanyJobs = jobOfferRepository.searchByKeyword("tech company");
        List<JobOffer> sqlJobs = jobOfferRepository.searchByKeyword("SQL");
        List<JobOffer> nonExistentJobs = jobOfferRepository.searchByKeyword("nonexistent");

        // then
        assertThat(javaJobs).hasSize(2);
        assertThat(javaJobs).extracting(JobOffer::getTitle).containsExactlyInAnyOrder(
                "Java Developer", "Java Architect");

        assertThat(techCompanyJobs).hasSize(3);
        assertThat(techCompanyJobs).extracting(JobOffer::getTitle).containsExactlyInAnyOrder(
                "Java Developer", "Frontend Developer", "Data Scientist");

        assertThat(sqlJobs).hasSize(3);
        assertThat(sqlJobs).extracting(JobOffer::getTitle).containsExactlyInAnyOrder(
                "Java Developer", "Data Scientist", "Java Architect");

        assertThat(nonExistentJobs).isEmpty();
    }

    private JobOffer createJobOffer(String title, String description, String companyName, 
                                    User recruiter, String skills) {
        JobOffer jobOffer = new JobOffer();
        jobOffer.setTitle(title);
        jobOffer.setDescription(description);
        jobOffer.setCompanyName(companyName);
        jobOffer.setRecruiter(recruiter);
        jobOffer.setSkills(skills);
        jobOffer.setSalaryMin(50000.0);
        jobOffer.setSalaryMax(100000.0);
        return jobOffer;
    }
}
