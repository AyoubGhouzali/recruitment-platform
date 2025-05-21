package com.ayoub.recruitment.repository;

import com.ayoub.recruitment.model.Application;
import com.ayoub.recruitment.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(Long studentId);
    List<Application> findByJobOfferId(Long jobOfferId);
    List<Application> findByStudentIdAndStatus(Long studentId, ApplicationStatus status);
    List<Application> findByJobOfferIdAndStatus(Long jobOfferId, ApplicationStatus status);
    Optional<Application> findByStudentIdAndJobOfferId(Long studentId, Long jobOfferId);
}
