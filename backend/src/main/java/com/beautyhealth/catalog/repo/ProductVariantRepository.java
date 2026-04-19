package com.beautyhealth.catalog.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beautyhealth.catalog.domain.ProductVariant;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    @Query("select v from ProductVariant v join fetch v.product p where v.id = :id")
    Optional<ProductVariant> findWithProductById(@Param("id") Long id);

    /**
     * Avoids multi-bag {@code fetch join} on two collections (Hibernate limitation). PDP has few variants.
     */
    @Query("select v from ProductVariant v where v.product.id = :pid order by v.id asc")
    List<ProductVariant> findForProductDetail(@Param("pid") Long productId);

    Optional<ProductVariant> findByIdAndProduct_Id(Long id, Long productId);

    @Query("select distinct v from ProductVariant v join fetch v.inventories inv join fetch inv.storeLocation where v.id = :vid and v.product.id = :pid")
    Optional<ProductVariant> findByIdAndProductIdWithInventory(@Param("vid") Long variantId, @Param("pid") Long productId);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);
}
