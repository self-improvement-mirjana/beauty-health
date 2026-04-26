package com.mockbank.credentials.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.mockbank.credentials.domain.MerchantCredential;

public interface MerchantCredentialRepository extends JpaRepository<MerchantCredential, Long> {
    List<MerchantCredential> findByMerchant_Id(long merchantId);
    Optional<MerchantCredential> findBySerial(String serial);

    @Query("SELECT c FROM MerchantCredential c WHERE c.merchant.id = :merchantId AND c.type = :type AND c.revokedAt IS NULL AND c.validFrom <= CURRENT_TIMESTAMP AND c.validTo > CURRENT_TIMESTAMP ORDER BY c.createdAt DESC")
    List<MerchantCredential> findActiveByMerchantAndType(long merchantId, String type);
}
