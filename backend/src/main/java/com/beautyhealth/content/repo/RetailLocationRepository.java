package com.beautyhealth.content.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beautyhealth.content.domain.RetailLocation;

public interface RetailLocationRepository extends JpaRepository<RetailLocation, Long> {

    List<RetailLocation> findByActiveTrueOrderBySortOrderAscIdAsc();

    List<RetailLocation> findAllByOrderBySortOrderAscIdAsc();
}
