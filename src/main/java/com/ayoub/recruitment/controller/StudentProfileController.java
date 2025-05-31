package com.ayoub.recruitment.controller;

import com.ayoub.recruitment.dto.StudentProfileDto;
import com.ayoub.recruitment.security.SecurityUtils;
import com.ayoub.recruitment.service.StudentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/students")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;
    private final SecurityUtils securityUtils;

    public StudentProfileController(StudentProfileService studentProfileService, SecurityUtils securityUtils) {
        this.studentProfileService = studentProfileService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileDto> getMyProfile() {
        Long userId = securityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        StudentProfileDto profileDto = studentProfileService.getStudentProfileByUserId(userId);
        return ResponseEntity.ok(profileDto);
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileDto> updateProfile(@RequestBody StudentProfileDto profileDto) {
        Long userId = securityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        
        StudentProfileDto updatedProfile = studentProfileService.updateStudentProfile(userId, profileDto);
        return ResponseEntity.ok(updatedProfile);
    }
}
