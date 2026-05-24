package com.beautyhealth.analytics.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.beautyhealth.analytics.domain.AnalyticsOutbox;
import com.beautyhealth.analytics.domain.OutboxStatus;

public interface AnalyticsOutboxRepository extends JpaRepository<AnalyticsOutbox, Long> {

    @Query("""
            select o from AnalyticsOutbox o
            where o.status = :status
            order by o.createdAt asc
            """)
    List<AnalyticsOutbox> findBatchByStatus(OutboxStatus status, org.springframework.data.domain.Pageable pageable);

    boolean existsByEventId(String eventId);
}
