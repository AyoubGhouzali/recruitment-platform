package com.ayoub.recruitment.service;

import com.ayoub.recruitment.dto.JobOfferDto;
import com.ayoub.recruitment.model.JobOffer;
import com.ayoub.recruitment.model.User;
import com.ayoub.recruitment.model.UserRole;
import com.ayoub.recruitment.repository.JobOfferRepository;
import com.ayoub.recruitment.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;
    private final UserRepository userRepository;

    public JobOfferService(JobOfferRepository jobOfferRepository, UserRepository userRepository) {
        this.jobOfferRepository = jobOfferRepository;
        this.userRepository = userRepository;
    }

    public List<JobOfferDto> getAllJobOffers() {
        return jobOfferRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public JobOfferDto getJobOfferById(Long id) {
        JobOffer jobOffer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job offer not found"));
        return mapToDto(jobOffer);
    }

    public List<JobOfferDto> getJobOffersByRecruiterId(Long recruiterId) {
        return jobOfferRepository.findByRecruiterId(recruiterId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<JobOfferDto> searchJobOffers(String keyword) {
        return jobOfferRepository.searchByKeyword(keyword).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobOfferDto createJobOffer(Long recruiterId, JobOfferDto jobOfferDto) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (recruiter.getRole() != UserRole.RECRUITER) {
            throw new AccessDeniedException("Only recruiters can create job offers");
        }

        JobOffer jobOffer = new JobOffer();
        jobOffer.setRecruiter(recruiter);
        jobOffer.setTitle(jobOfferDto.getTitle());
        jobOffer.setDescription(jobOfferDto.getDescription());
        jobOffer.setCompanyName(jobOfferDto.getCompanyName());
        jobOffer.setSalaryMin(jobOfferDto.getSalaryMin());
        jobOffer.setSalaryMax(jobOfferDto.getSalaryMax());
        jobOffer.setSkills(jobOfferDto.getSkills());

        JobOffer savedJobOffer = jobOfferRepository.save(jobOffer);
        return mapToDto(savedJobOffer);
    }

    @Transactional
    public JobOfferDto updateJobOffer(Long recruiterId, Long jobOfferId, JobOfferDto jobOfferDto) {
        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Job offer not found"));

        // Verify that the recruiter is the owner of the job offer
        if (!jobOffer.getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You can only update your own job offers");
        }

        jobOffer.setTitle(jobOfferDto.getTitle());
        jobOffer.setDescription(jobOfferDto.getDescription());
        jobOffer.setCompanyName(jobOfferDto.getCompanyName());
        jobOffer.setSalaryMin(jobOfferDto.getSalaryMin());
        jobOffer.setSalaryMax(jobOfferDto.getSalaryMax());
        jobOffer.setSkills(jobOfferDto.getSkills());

        JobOffer updatedJobOffer = jobOfferRepository.save(jobOffer);
        return mapToDto(updatedJobOffer);
    }

    @Transactional
    public void deleteJobOffer(Long recruiterId, Long jobOfferId) {
        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Job offer not found"));

        // Verify that the recruiter is the owner of the job offer
        if (!jobOffer.getRecruiter().getId().equals(recruiterId)) {
            throw new AccessDeniedException("You can only delete your own job offers");
        }

        jobOfferRepository.delete(jobOffer);
    }

    private JobOfferDto mapToDto(JobOffer jobOffer) {
        JobOfferDto dto = new JobOfferDto();
        dto.setId(jobOffer.getId());
        dto.setRecruiterId(jobOffer.getRecruiter().getId());
        dto.setRecruiterEmail(jobOffer.getRecruiter().getEmail());
        dto.setTitle(jobOffer.getTitle());
        dto.setDescription(jobOffer.getDescription());
        dto.setCompanyName(jobOffer.getCompanyName());
        dto.setSalaryMin(jobOffer.getSalaryMin());
        dto.setSalaryMax(jobOffer.getSalaryMax());
        dto.setSkills(jobOffer.getSkills());
        dto.setCreatedAt(jobOffer.getCreatedAt());
        return dto;
    }
}
