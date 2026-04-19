package com.beautyhealth.catalog.repo;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beautyhealth.catalog.domain.ProductOption;

public interface ProductOptionRepository extends JpaRepository<ProductOption, Long> {

    long countByProduct_Id(Long productId);

    @EntityGraph(attributePaths = "values")
    @Query("select distinct po from ProductOption po left join fetch po.values where po.product.id = :pid order by po.sortOrder asc, po.id asc")
    List<ProductOption> findForProductDetail(@Param("pid") Long productId);
}
