package com.beautyhealth.analytics.repo;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beautyhealth.analytics.domain.AnalyticsFunnelDaily;

public interface AnalyticsFunnelDailyRepository extends JpaRepository<AnalyticsFunnelDaily, Long> {

    Optional<AnalyticsFunnelDaily> findByDay(LocalDate day);
}
