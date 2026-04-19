package com.beautyhealth.catalog.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beautyhealth.catalog.domain.InventoryRow;

import jakarta.persistence.LockModeType;

public interface InventoryRowRepository extends JpaRepository<InventoryRow, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from InventoryRow i where i.variant.id = :variantId order by i.id asc")
    List<InventoryRow> lockRowsByVariantId(@Param("variantId") long variantId);
}
