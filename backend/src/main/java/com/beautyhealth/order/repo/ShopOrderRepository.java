package com.beautyhealth.order.repo;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beautyhealth.order.domain.OrderStatus;
import com.beautyhealth.order.domain.ShopOrder;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {

    long countByUser_Id(long userId);

    @EntityGraph(attributePaths = { "lines", "lines.variant", "lines.variant.product", "user" })
    @Query("select o from ShopOrder o where o.id = :id")
    Optional<ShopOrder> findWithLinesById(@Param("id") long id);

    Optional<ShopOrder> findByIdAndUser_Id(Long id, Long userId);

    @Query("select o from ShopOrder o where o.user.id = :userId")
    Page<ShopOrder> findPageForUser(@Param("userId") long userId, Pageable pageable);

    @EntityGraph(attributePaths = "user")
    @Query("""
            select o from ShopOrder o
            where (:status is null or o.status = :status)
            and (:from is null or o.createdAt >= :from)
            and (:to is null or o.createdAt < :to)
            """)
    Page<ShopOrder> findAdminFiltered(@Param("status") OrderStatus status, @Param("from") Instant from,
            @Param("to") Instant to, Pageable pageable);
}
