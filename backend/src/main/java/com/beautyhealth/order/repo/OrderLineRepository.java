package com.beautyhealth.order.repo;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beautyhealth.order.api.dto.BuyAgainItemResponse;
import com.beautyhealth.order.domain.OrderLine;

public interface OrderLineRepository extends JpaRepository<OrderLine, Long> {

    @Query("""
            select new com.beautyhealth.order.api.dto.BuyAgainItemResponse(
                v.id,
                p.slug,
                p.name,
                max(o.createdAt),
                sum(l.quantity)
            )
            from OrderLine l
            join l.order o
            join l.variant v
            join v.product p
            where o.user.id = :userId
            group by v.id, p.slug, p.name
            order by max(o.createdAt) desc
            """)
    List<BuyAgainItemResponse> findBuyAgainItems(@Param("userId") long userId, Pageable pageable);
}
