package com.mockbank.payments.repo;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.mockbank.payments.domain.PaymentIntent;

public interface PaymentIntentRepository extends JpaRepository<PaymentIntent, Long> {
    Optional<PaymentIntent> findByPaymentRef(String paymentRef);

    @Query("SELECT p FROM PaymentIntent p WHERE p.status = 'CREATED' AND p.expiresAt IS NOT NULL AND p.expiresAt < :now")
    List<PaymentIntent> findExpired(Instant now);

    @Query("SELECT p FROM PaymentIntent p JOIN FETCH p.merchant ORDER BY p.createdAt DESC LIMIT :limit")
    List<PaymentIntent> findRecentWithMerchant(int limit);

    @Query("SELECT p FROM PaymentIntent p JOIN FETCH p.merchant WHERE (:merchantId IS NULL OR p.merchant.id = :merchantId) AND (:status IS NULL OR p.status = :status) ORDER BY p.createdAt DESC")
    List<PaymentIntent> findFiltered(Long merchantId, String status);

    @Query("SELECT COUNT(p) FROM PaymentIntent p")
    long countAll();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentIntent p WHERE p.status = 'AUTHORIZED'")
    java.math.BigDecimal sumAuthorized();
}
