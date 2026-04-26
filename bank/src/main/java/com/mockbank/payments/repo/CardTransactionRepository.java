package com.mockbank.payments.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.mockbank.payments.domain.CardTransaction;

public interface CardTransactionRepository extends JpaRepository<CardTransaction, Long> {
    Optional<CardTransaction> findByIntent_Id(long intentId);
    long countByStatus(String status);
}
