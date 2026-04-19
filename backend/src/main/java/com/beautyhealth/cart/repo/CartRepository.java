package com.beautyhealth.cart.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beautyhealth.cart.domain.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByGuestCartToken(String guestCartToken);

    Optional<Cart> findByUser_Id(Long userId);
}
