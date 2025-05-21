package com.ayoub.recruitment.service;

import com.ayoub.recruitment.dto.AuthRequest;
import com.ayoub.recruitment.dto.AuthResponse;
import com.ayoub.recruitment.dto.SignupRequest;
import com.ayoub.recruitment.model.StudentProfile;
import com.ayoub.recruitment.model.User;
import com.ayoub.recruitment.model.UserRole;
import com.ayoub.recruitment.repository.StudentProfileRepository;
import com.ayoub.recruitment.repository.UserRepository;
import com.ayoub.recruitment.security.JwtTokenUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private UserDetails userDetails;
    private final String TEST_TOKEN = "test.jwt.token";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setRole(UserRole.STUDENT);

        userDetails = org.springframework.security.core.userdetails.User
                .withUsername(testUser.getEmail())
                .password(testUser.getPassword())
                .authorities("ROLE_" + testUser.getRole().name())
                .build();
    }

    @Test
    void whenSignupWithNewEmail_thenSuccessful() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("new@example.com");
        signupRequest.setPassword("password");
        signupRequest.setRole(UserRole.STUDENT);
        signupRequest.setFullName("New Student");

        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(signupRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenUtil.generateToken(any(UserDetails.class))).thenReturn(TEST_TOKEN);

        // Act
        AuthResponse response = authService.signup(signupRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(testUser.getId());
        assertThat(response.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(response.getRole()).isEqualTo(testUser.getRole());
        assertThat(response.getToken()).isEqualTo(TEST_TOKEN);
        assertThat(response.getMessage()).contains("successfully");

        // Verify user was saved
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getEmail()).isEqualTo(signupRequest.getEmail());
        assertThat(savedUser.getPassword()).isEqualTo("encodedPassword");
        assertThat(savedUser.getRole()).isEqualTo(signupRequest.getRole());

        // Verify student profile was created
        ArgumentCaptor<StudentProfile> profileCaptor = ArgumentCaptor.forClass(StudentProfile.class);
        verify(studentProfileRepository).save(profileCaptor.capture());
        StudentProfile savedProfile = profileCaptor.getValue();
        assertThat(savedProfile.getUser()).isEqualTo(testUser);
        assertThat(savedProfile.getFullName()).isEqualTo(signupRequest.getFullName());
    }

    @Test
    void whenSignupWithExistingEmail_thenReturnError() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("existing@example.com");
        signupRequest.setPassword("password");
        signupRequest.setRole(UserRole.STUDENT);

        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(true);

        // Act
        AuthResponse response = authService.signup(signupRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isNull();
        assertThat(response.getEmail()).isNull();
        assertThat(response.getRole()).isNull();
        assertThat(response.getToken()).isNull();
        assertThat(response.getMessage()).contains("already in use");

        // Verify no user was saved
        verify(userRepository, never()).save(any(User.class));
        verify(studentProfileRepository, never()).save(any(StudentProfile.class));
    }

    @Test
    void whenSignupAsRecruiter_thenNoStudentProfileCreated() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail("recruiter@example.com");
        signupRequest.setPassword("password");
        signupRequest.setRole(UserRole.RECRUITER);

        User recruiterUser = new User();
        recruiterUser.setId(2L);
        recruiterUser.setEmail(signupRequest.getEmail());
        recruiterUser.setPassword("encodedPassword");
        recruiterUser.setRole(UserRole.RECRUITER);

        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(signupRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(recruiterUser);
        when(jwtTokenUtil.generateToken(any(UserDetails.class))).thenReturn(TEST_TOKEN);

        // Act
        AuthResponse response = authService.signup(signupRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(recruiterUser.getId());
        assertThat(response.getRole()).isEqualTo(UserRole.RECRUITER);

        // Verify user was saved but no student profile was created
        verify(userRepository).save(any(User.class));
        verify(studentProfileRepository, never()).save(any(StudentProfile.class));
    }

    @Test
    void whenLoginWithValidCredentials_thenSuccessful() {
        // Arrange
        AuthRequest authRequest = new AuthRequest();
        authRequest.setEmail("test@example.com");
        authRequest.setPassword("password");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userRepository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(jwtTokenUtil.generateToken(userDetails)).thenReturn(TEST_TOKEN);

        // Act
        AuthResponse response = authService.login(authRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(testUser.getId());
        assertThat(response.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(response.getRole()).isEqualTo(testUser.getRole());
        assertThat(response.getToken()).isEqualTo(TEST_TOKEN);
        assertThat(response.getMessage()).contains("successful");

        // Verify authentication was attempted
        verify(authenticationManager).authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );
    }

    @Test
    void whenLoginWithInvalidCredentials_thenReturnError() {
        // Arrange
        AuthRequest authRequest = new AuthRequest();
        authRequest.setEmail("test@example.com");
        authRequest.setPassword("wrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act
        AuthResponse response = authService.login(authRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isNull();
        assertThat(response.getEmail()).isNull();
        assertThat(response.getRole()).isNull();
        assertThat(response.getToken()).isNull();
        assertThat(response.getMessage()).contains("Invalid");

        // Verify authentication was attempted
        verify(authenticationManager).authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );
    }
}
