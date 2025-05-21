package com.ayoub.recruitment.repository;

import com.ayoub.recruitment.model.JobOffer;
import com.ayoub.recruitment.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    List<JobOffer> findByRecruiter(User recruiter);
    List<JobOffer> findByRecruiterId(Long recruiterId);
    
    @Query("SELECT j FROM JobOffer j WHERE " +
           "LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<JobOffer> searchByKeyword(String keyword);
}
