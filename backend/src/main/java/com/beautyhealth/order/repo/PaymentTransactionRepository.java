package com.beautyhealth.order.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beautyhealth.order.domain.PaymentTransaction;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByOrder_Id(long orderId);

    Optional<PaymentTransaction> findByPaymentRef(String paymentRef);
}
