package com.beautyhealth.cart.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beautyhealth.cart.domain.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    long countByCart_Id(Long cartId);

    void deleteByCart_Id(Long cartId);

    Optional<CartItem> findByIdAndCart_Id(Long id, Long cartId);

    Optional<CartItem> findByCart_IdAndVariant_Id(Long cartId, Long variantId);

    @EntityGraph(attributePaths = { "variant", "variant.product" })
    @Query("select ci from CartItem ci where ci.cart.id = :cartId order by ci.id asc")
    List<CartItem> findForCartView(@Param("cartId") Long cartId);
}
