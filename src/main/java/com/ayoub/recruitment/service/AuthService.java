package com.ayoub.recruitment.service;

import com.ayoub.recruitment.dto.AuthRequest;
import com.ayoub.recruitment.dto.AuthResponse;
import com.ayoub.recruitment.dto.SignupRequest;
import com.ayoub.recruitment.model.RecruiterProfile;
import com.ayoub.recruitment.model.StudentProfile;
import com.ayoub.recruitment.model.User;
import com.ayoub.recruitment.model.UserRole;
import com.ayoub.recruitment.repository.RecruiterProfileRepository;
import com.ayoub.recruitment.repository.StudentProfileRepository;
import com.ayoub.recruitment.repository.UserRepository;
import com.ayoub.recruitment.security.CustomUserDetails;
import com.ayoub.recruitment.security.JwtTokenUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthService(UserRepository userRepository, 
                      StudentProfileRepository studentProfileRepository,
                      RecruiterProfileRepository recruiterProfileRepository,
                      PasswordEncoder passwordEncoder, 
                      AuthenticationManager authenticationManager,
                      JwtTokenUtil jwtTokenUtil) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @Transactional
    public AuthResponse signup(SignupRequest signupRequest) {
        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return AuthResponse.builder()
                    .message("Email already in use")
                    .build();
        }
        
        // Validate role is not null
        if (signupRequest.getRole() == null) {
            return AuthResponse.builder()
                    .message("Role is required")
                    .build();
        }

        // Create new user
        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(signupRequest.getRole());
        
        User savedUser = userRepository.save(user);

        // Create appropriate profile based on role
        if (signupRequest.getRole() == UserRole.STUDENT) {
            StudentProfile studentProfile = new StudentProfile();
            studentProfile.setUser(savedUser);
            studentProfile.setFullName(signupRequest.getFullName());
            studentProfileRepository.save(studentProfile);
        } else if (signupRequest.getRole() == UserRole.RECRUITER) {
            RecruiterProfile recruiterProfile = new RecruiterProfile();
            recruiterProfile.setUser(savedUser);
            recruiterProfile.setFullName(signupRequest.getFullName());
            recruiterProfileRepository.save(recruiterProfile);
        }

        // Create CustomUserDetails for JWT token generation
        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtTokenUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .token(token)
                .message("User registered successfully")
                .build();
    }

    public AuthResponse login(AuthRequest authRequest) {
        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            // Get user details from the authenticated principal
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            // Generate JWT token
            String token = jwtTokenUtil.generateToken(userDetails);

            return AuthResponse.builder()
                    .userId(userDetails.getId())
                    .email(userDetails.getUsername())
                    .role(userDetails.getRole())
                    .token(token)
                    .message("Login successful")
                    .build();
        } catch (BadCredentialsException e) {
            return AuthResponse.builder()
                    .message("Invalid email or password")
                    .build();
        } catch (Exception e) {
            return AuthResponse.builder()
                    .message("An error occurred during login: " + e.getMessage())
                    .build();
        }
    }
}
