package com.beautyhealth.order.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beautyhealth.order.domain.Shipment;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
}
