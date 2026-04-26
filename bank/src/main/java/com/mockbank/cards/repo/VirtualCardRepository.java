package com.mockbank.cards.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import com.mockbank.cards.domain.VirtualCard;

import jakarta.persistence.LockModeType;

public interface VirtualCardRepository extends JpaRepository<VirtualCard, Long> {
    List<VirtualCard> findByClient_Id(long clientId);
    Optional<VirtualCard> findByPan(String pan);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM VirtualCard c WHERE c.pan = :pan")
    Optional<VirtualCard> findByPanForUpdate(String pan);
}
