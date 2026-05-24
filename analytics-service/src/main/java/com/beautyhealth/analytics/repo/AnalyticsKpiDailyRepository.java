package com.beautyhealth.analytics.repo;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beautyhealth.analytics.domain.AnalyticsKpiDaily;

public interface AnalyticsKpiDailyRepository extends JpaRepository<AnalyticsKpiDaily, Long> {

    Optional<AnalyticsKpiDaily> findByDay(LocalDate day);
}
