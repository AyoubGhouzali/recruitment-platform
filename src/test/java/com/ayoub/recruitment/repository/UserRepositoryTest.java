package com.ayoub.recruitment.repository;

import com.ayoub.recruitment.model.User;
import com.ayoub.recruitment.model.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
public class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void whenFindByEmail_thenReturnUser() {
        // given
        User user = new User();
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setRole(UserRole.STUDENT);
        entityManager.persist(user);
        entityManager.flush();

        // when
        Optional<User> found = userRepository.findByEmail(user.getEmail());

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo(user.getEmail());
    }

    @Test
    public void whenFindByNonExistentEmail_thenReturnEmpty() {
        // when
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        // then
        assertThat(found).isEmpty();
    }

    @Test
    public void whenExistsByEmail_thenReturnTrue() {
        // given
        User user = new User();
        user.setEmail("exists@example.com");
        user.setPassword("password");
        user.setRole(UserRole.RECRUITER);
        entityManager.persist(user);
        entityManager.flush();

        // when
        boolean exists = userRepository.existsByEmail(user.getEmail());

        // then
        assertThat(exists).isTrue();
    }

    @Test
    public void whenExistsByNonExistentEmail_thenReturnFalse() {
        // when
        boolean exists = userRepository.existsByEmail("nonexistent@example.com");

        // then
        assertThat(exists).isFalse();
    }

    @Test
    public void whenFindByRole_thenReturnUsers() {
        // given
        User student1 = new User();
        student1.setEmail("student1@example.com");
        student1.setPassword("password");
        student1.setRole(UserRole.STUDENT);
        entityManager.persist(student1);

        User student2 = new User();
        student2.setEmail("student2@example.com");
        student2.setPassword("password");
        student2.setRole(UserRole.STUDENT);
        entityManager.persist(student2);

        User recruiter = new User();
        recruiter.setEmail("recruiter@example.com");
        recruiter.setPassword("password");
        recruiter.setRole(UserRole.RECRUITER);
        entityManager.persist(recruiter);

        entityManager.flush();

        // when
        List<User> studentUsers = userRepository.findByRole(UserRole.STUDENT);
        List<User> recruiterUsers = userRepository.findByRole(UserRole.RECRUITER);
        List<User> adminUsers = userRepository.findByRole(UserRole.ADMIN);

        // then
        assertThat(studentUsers).hasSize(2);
        assertThat(recruiterUsers).hasSize(1);
        assertThat(adminUsers).isEmpty();
    }
}
