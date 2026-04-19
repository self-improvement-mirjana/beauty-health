package com.beautyhealth.catalog.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beautyhealth.catalog.domain.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = "brand")
    Optional<Product> findBySlugAndActiveTrue(String slug);

    @EntityGraph(attributePaths = { "brand", "categories" })
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findWithBrandAndCategoriesById(@Param("id") Long id);

    Optional<Product> findBySlug(String slug);

    @EntityGraph(attributePaths = "brand")
    @Query("select p from Product p where p.slug = :slug")
    Optional<Product> findBySlugFetchingBrand(@Param("slug") String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByBrand_Id(Long brandId);

    @Query("select p.brand.id, count(p) from Product p where p.active = true group by p.brand.id")
    List<Object[]> countActiveProductsByBrandId();
}
