package com.beautyhealth.catalog.repo;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.beautyhealth.catalog.domain.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @EntityGraph(attributePaths = "parent")
    @Query("select c from Category c where c.active = true order by c.sortOrder asc, c.id asc")
    List<Category> findAllActiveForTree();

    @Query("select distinct c from Category c join c.products p where p.id = :pid order by c.sortOrder asc, c.id asc")
    List<Category> findLinkedToProduct(@Param("pid") Long productId);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    @Query("select case when count(p) > 0 then true else false end from Product p join p.categories c where c.id = :cid")
    boolean existsProductLinkedToCategory(@Param("cid") Long categoryId);

    boolean existsByParent_Id(Long parentId);

    /**
     * Direktna deca roditelja: broj aktivnih proizvoda u celom podstablu svake podkategorije
     * (product_category na bilo kom potomku), kao na Sephora navigaciji.
     */
    @Query(value = """
            WITH RECURSIVE tree AS (
                SELECT c.id AS anchor_id, c.slug AS anchor_slug, c.sort_order, c.id AS node_id
                FROM category pcat
                INNER JOIN category c ON c.parent_category_id = pcat.id AND c.is_active = TRUE
                WHERE pcat.slug = :parentSlug AND pcat.is_active = TRUE
                UNION ALL
                SELECT t.anchor_id, t.anchor_slug, t.sort_order, cat.id
                FROM tree t
                INNER JOIN category cat ON cat.parent_category_id = t.node_id AND cat.is_active = TRUE
            )
            SELECT t.anchor_slug AS slug, COUNT(DISTINCT p.id) AS product_count
            FROM tree t
            LEFT JOIN product_category pc ON pc.category_id = t.node_id
            LEFT JOIN product p ON p.id = pc.product_id AND p.is_active = TRUE
            GROUP BY t.anchor_id, t.anchor_slug, t.sort_order
            ORDER BY t.sort_order ASC, t.anchor_id ASC
            """, nativeQuery = true)
    List<Object[]> countActiveProductsPerDirectChild(@Param("parentSlug") String parentSlug);

    /**
     * Isto kao gore, ali za proizvoljan skup slug-ova (mega-meni).
     */
    @Query(value = """
            WITH RECURSIVE tree AS (
                SELECT c.id AS anchor_id, c.slug AS anchor_slug, c.id AS node_id
                FROM category c
                WHERE c.slug IN (:slugs) AND c.is_active = TRUE
                UNION ALL
                SELECT t.anchor_id, t.anchor_slug, cat.id
                FROM tree t
                INNER JOIN category cat ON cat.parent_category_id = t.node_id AND cat.is_active = TRUE
            )
            SELECT t.anchor_slug AS slug, COUNT(DISTINCT p.id) AS product_count
            FROM tree t
            LEFT JOIN product_category pc ON pc.category_id = t.node_id
            LEFT JOIN product p ON p.id = pc.product_id AND p.is_active = TRUE
            GROUP BY t.anchor_id, t.anchor_slug
            ORDER BY t.anchor_slug ASC
            """, nativeQuery = true)
    List<Object[]> countActiveProductsForSubtreeSlugs(@Param("slugs") List<String> slugs);
}
