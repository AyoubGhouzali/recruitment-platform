package com.ayoub.recruitment.security;

import com.ayoub.recruitment.model.User;
import com.ayoub.recruitment.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        // Check if principal is CustomUserDetails
        if (authentication.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) authentication.getPrincipal()).getId();
        }
        
        // Fallback to old method
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        // Check if principal is CustomUserDetails
        if (authentication.getPrincipal() instanceof CustomUserDetails) {
            String email = ((CustomUserDetails) authentication.getPrincipal()).getUsername();
            return userRepository.findByEmail(email).orElse(null);
        }
        
        // Fallback to old method
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }
    
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().contains(new SimpleGrantedAuthority(role));
    }
}
