package com.ayoub.recruitment.service;

import com.ayoub.recruitment.dto.StudentProfileDto;
import com.ayoub.recruitment.model.StudentProfile;
import com.ayoub.recruitment.model.User;
import com.ayoub.recruitment.model.UserRole;
import com.ayoub.recruitment.repository.StudentProfileRepository;
import com.ayoub.recruitment.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    public StudentProfileService(StudentProfileRepository studentProfileRepository, UserRepository userRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
    }

    public StudentProfileDto getStudentProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != UserRole.STUDENT) {
            throw new AccessDeniedException("User is not a student");
        }
        
        StudentProfile studentProfile = studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        
        return mapToDto(studentProfile);
    }
    
    @Transactional
    public StudentProfileDto updateStudentProfile(Long userId, StudentProfileDto profileDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() != UserRole.STUDENT) {
            throw new AccessDeniedException("User is not a student");
        }
        
        StudentProfile studentProfile = studentProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        
        studentProfile.setFullName(profileDto.getFullName());
        studentProfile.setEducation(profileDto.getEducation());
        studentProfile.setSkills(profileDto.getSkills());
        
        // Only update resume URL if provided
        if (profileDto.getResumeUrl() != null && !profileDto.getResumeUrl().isEmpty()) {
            studentProfile.setResumeUrl(profileDto.getResumeUrl());
        }
        
        StudentProfile updatedProfile = studentProfileRepository.save(studentProfile);
        return mapToDto(updatedProfile);
    }
    
    private StudentProfileDto mapToDto(StudentProfile studentProfile) {
        StudentProfileDto dto = new StudentProfileDto();
        dto.setId(studentProfile.getId());
        dto.setUserId(studentProfile.getUser().getId());
        dto.setEmail(studentProfile.getUser().getEmail());
        dto.setFullName(studentProfile.getFullName());
        dto.setEducation(studentProfile.getEducation());
        dto.setSkills(studentProfile.getSkills());
        dto.setResumeUrl(studentProfile.getResumeUrl());
        return dto;
    }
}
