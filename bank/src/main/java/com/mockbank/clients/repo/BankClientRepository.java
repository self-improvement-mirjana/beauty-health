package com.mockbank.clients.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.mockbank.clients.domain.BankClient;

public interface BankClientRepository extends JpaRepository<BankClient, Long> {
    Optional<BankClient> findByEmail(String email);
}
