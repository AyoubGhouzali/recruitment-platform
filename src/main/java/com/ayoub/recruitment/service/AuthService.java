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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthService(UserRepository userRepository, 
                      StudentProfileRepository studentProfileRepository,
                      PasswordEncoder passwordEncoder, 
                      AuthenticationManager authenticationManager,
                      JwtTokenUtil jwtTokenUtil) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
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

        // Create new user
        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(signupRequest.getRole());
        
        User savedUser = userRepository.save(user);

        // If user is a student, create a student profile
        if (signupRequest.getRole() == UserRole.STUDENT) {
            StudentProfile studentProfile = new StudentProfile();
            studentProfile.setUser(savedUser);
            studentProfile.setFullName(signupRequest.getFullName());
            studentProfileRepository.save(studentProfile);
        }

        // Generate JWT token
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(savedUser.getEmail())
                .password(savedUser.getPassword())
                .authorities("ROLE_" + savedUser.getRole().name())
                .build();
        
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
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            
            String token = jwtTokenUtil.generateToken(userDetails);

            return AuthResponse.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .token(token)
                    .message("Login successful")
                    .build();
        } catch (Exception e) {
            return AuthResponse.builder()
                    .message("Invalid email or password")
                    .build();
        }
    }
}
