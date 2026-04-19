package com.beautyhealth.catalog.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beautyhealth.catalog.domain.StoreLocation;

public interface StoreLocationRepository extends JpaRepository<StoreLocation, Long> {
}
