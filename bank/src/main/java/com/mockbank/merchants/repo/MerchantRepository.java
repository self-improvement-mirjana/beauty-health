package com.mockbank.merchants.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.mockbank.merchants.domain.Merchant;

public interface MerchantRepository extends JpaRepository<Merchant, Long> {
    Optional<Merchant> findBySlug(String slug);
}
