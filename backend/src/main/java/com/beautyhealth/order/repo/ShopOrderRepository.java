package com.beautyhealth.order.repo;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beautyhealth.order.domain.OrderStatus;
import com.beautyhealth.order.domain.ShopOrder;

public interface ShopOrderRepository
        extends JpaRepository<ShopOrder, Long>, JpaSpecificationExecutor<ShopOrder> {

    long countByUser_Id(long userId);

    @EntityGraph(attributePaths = { "lines", "lines.variant", "lines.variant.product", "user" })
    @Query("select o from ShopOrder o where o.id = :id")
    Optional<ShopOrder> findWithLinesById(@Param("id") long id);

    Optional<ShopOrder> findByIdAndUser_Id(Long id, Long userId);

    @Query("select o from ShopOrder o where o.user.id = :userId")
    Page<ShopOrder> findPageForUser(@Param("userId") long userId, Pageable pageable);

    /**
     * Specification-based admin filter. Izbegava JPQL pattern {@code :param is null or ...},
     * koji na PostgreSQL JDBC-u zna da padne sa "could not determine data type of parameter $N"
     * jer Hibernate ne može da pošalje tip kada je svaki parametar potencijalno NULL.
     * Specifikacija dodaje predikat samo kada filter NIJE null, pa se takvi parametri uopšte ne pojavljuju u SQL-u.
     */
    default Page<ShopOrder> findAdminFiltered(OrderStatus status, Instant from, Instant to, Pageable pageable) {
        Specification<ShopOrder> spec = (root, query, cb) -> {
            // EntityGraph-like fetch: pre-učitaj `user` u istom upitu (samo za upit koji vraća redove,
            // ne i za count upit — Hibernate će sam odraditi count bez fetch-a).
            if (query != null && Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("user");
            }
            List<Predicate> predicates = new ArrayList<>(3);
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), to));
            }
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
        return findAll(spec, pageable);
    }
}
