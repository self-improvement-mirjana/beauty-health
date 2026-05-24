package com.beautyhealth.analytics.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beautyhealth.analytics.domain.AnalyticsEventRaw;

public interface AnalyticsEventRawRepository extends JpaRepository<AnalyticsEventRaw, Long> {

    boolean existsByEventId(String eventId);

    Optional<AnalyticsEventRaw> findByEventId(String eventId);
}
