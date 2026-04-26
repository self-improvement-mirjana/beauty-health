package com.mockbank.auth.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.mockbank.auth.domain.BankUser;

public interface BankUserRepository extends JpaRepository<BankUser, Long> {
    Optional<BankUser> findByEmail(String email);
}
