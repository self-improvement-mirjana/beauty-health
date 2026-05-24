package com.beautyhealth.analytics.repo;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beautyhealth.analytics.domain.AnalyticsPaymentsDaily;

public interface AnalyticsPaymentsDailyRepository extends JpaRepository<AnalyticsPaymentsDaily, Long> {

    Optional<AnalyticsPaymentsDaily> findByDay(LocalDate day);
}
