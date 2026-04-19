package com.beautyhealth.catalog.read;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CatalogListingJdbcRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public CatalogListingJdbcRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * @param categorySlug glavni kontekst kategorije (jedan slug), npr. PLP „lice“
     * @param categoryFacets dodatni slug-ovi (OR): proizvod mora biti u bar jednom od podstabala; u kombinaciji sa
     *            {@code categorySlug} važi AND (glavni filter I bar jedan facet).
     */
    public Page<ProductListingRow> findProductCards(String brandSlug, String categorySlug, List<String> categoryFacets,
            Boolean featured, String q, Integer minRating, Pageable pageable) {
        StringBuilder where = new StringBuilder("WHERE p.is_active = true ");
        MapSqlParameterSource params = new MapSqlParameterSource();
        if (brandSlug != null && !brandSlug.isBlank()) {
            where.append("AND b.slug = :brandSlug ");
            params.addValue("brandSlug", brandSlug.trim());
        }
        if (categorySlug != null && !categorySlug.isBlank()) {
            appendExistsInCategorySubtree(where, params, "categorySlug", categorySlug.trim(), true);
        }
        if (categoryFacets != null && !categoryFacets.isEmpty()) {
            List<String> cleaned = new ArrayList<>();
            for (String facet : categoryFacets) {
                if (facet != null && !facet.isBlank()) {
                    cleaned.add(facet.trim());
                }
            }
            if (!cleaned.isEmpty()) {
                where.append("AND (");
                for (int i = 0; i < cleaned.size(); i++) {
                    if (i > 0) {
                        where.append(" OR ");
                    }
                    appendExistsInCategorySubtree(where, params, "catFacet" + i, cleaned.get(i), false);
                }
                where.append(") ");
            }
        }
        if (featured != null) {
            where.append("AND p.is_featured = :featured ");
            params.addValue("featured", featured);
        }
        if (q != null && !q.isBlank()) {
            where.append("AND LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) ");
            params.addValue("q", q.trim());
        }
        if (minRating != null && minRating >= 1 && minRating <= 5) {
            where.append(
                    "AND (SELECT AVG(r.rating) FROM review r WHERE r.product_id = p.id AND r.is_approved = TRUE) >= :minRating ");
            params.addValue("minRating", minRating.doubleValue());
        }

        String baseFrom = """
                FROM product p
                JOIN brand b ON b.id = p.brand_id
                LEFT JOIN product_variant dv ON dv.product_id = p.id AND dv.is_default = true
                """;

        String countSql = "SELECT COUNT(*) " + baseFrom + where;
        Long total = jdbc.queryForObject(countSql, params, Long.class);
        long totalLong = total == null ? 0L : total;

        Pageable queryPageable = resolvePageableWhenNoApprovedReviews(pageable);

        String dataSql = """
                SELECT p.id AS product_id,
                       p.name AS title,
                       p.slug AS slug,
                       b.name AS brand_name,
                       b.slug AS brand_slug,
                       p.primary_image_url AS primary_image_url,
                       dv.regular_price AS regular_price,
                       dv.sale_price AS sale_price,
                       COALESCE(dv.id, (SELECT MIN(pv.id) FROM product_variant pv WHERE pv.product_id = p.id)) AS primary_variant_id,
                       (SELECT COUNT(*) FROM product_variant pv2 WHERE pv2.product_id = p.id) AS variant_count,
                       COALESCE((
                           SELECT SUM(i.quantity)
                           FROM inventory i
                           JOIN product_variant pv3 ON pv3.id = i.product_variant_id
                           WHERE pv3.product_id = p.id
                       ), 0) AS total_stock,
                       (SELECT COUNT(*) FROM product_option po WHERE po.product_id = p.id) AS option_group_count,
                       (SELECT COUNT(*) FROM review r WHERE r.product_id = p.id AND r.is_approved = TRUE) AS review_count,
                       (SELECT AVG(r.rating) FROM review r WHERE r.product_id = p.id AND r.is_approved = TRUE) AS rating_avg
                """
                + baseFrom
                + where
                + buildOrderBy(queryPageable)
                + " LIMIT :limit OFFSET :offset";

        params.addValue("limit", queryPageable.getPageSize());
        params.addValue("offset", (int) queryPageable.getOffset());

        List<ProductListingRow> rows = jdbc.query(dataSql, params, (rs, rowNum) -> {
            BigDecimal reg = rs.getBigDecimal("regular_price");
            if (rs.wasNull()) {
                reg = BigDecimal.ZERO;
            }
            BigDecimal sale = rs.getBigDecimal("sale_price");
            if (rs.wasNull()) {
                sale = null;
            }
            long defVar = rs.getLong("primary_variant_id");
            Long primaryVariantId = rs.wasNull() ? null : defVar;
            String img = rs.getString("primary_image_url");
            if (rs.wasNull()) {
                img = null;
            }
            BigDecimal ratingAvg = rs.getBigDecimal("rating_avg");
            if (rs.wasNull()) {
                ratingAvg = null;
            }
            return new ProductListingRow(
                    rs.getLong("product_id"),
                    rs.getString("title"),
                    rs.getString("slug"),
                    rs.getString("brand_name"),
                    rs.getString("brand_slug"),
                    img,
                    reg,
                    sale,
                    primaryVariantId,
                    rs.getLong("variant_count"),
                    rs.getLong("total_stock"),
                    rs.getLong("option_group_count"),
                    ratingAvg,
                    rs.getLong("review_count"));
        });

        return new PageImpl<>(rows, queryPageable, totalLong);
    }

    /**
     * Proizvod pripada stablu kategorije {@code slugValue} (uključujući podkategorije).
     *
     * @param leadingAnd ako je true, prefiks {@code AND } (glavni categorySlug); ako false, samo {@code EXISTS} (član OR grupe).
     */
    private static void appendExistsInCategorySubtree(StringBuilder where, MapSqlParameterSource params, String paramName,
            String slugValue, boolean leadingAnd) {
        Objects.requireNonNull(paramName);
        if (leadingAnd) {
            where.append("AND ");
        }
        /*
         * Izbegava IN (WITH RECURSIVE …) — neki PG drajveri/parseri greše; JOIN ka podupitu sa CTE je stabilniji.
         */
        where.append(
                """
                        EXISTS (
                            SELECT 1
                            FROM product_category pc
                            INNER JOIN (
                                WITH RECURSIVE subcats AS (
                                    SELECT id FROM category
                                    WHERE slug = :%s AND is_active = true
                                    UNION ALL
                                    SELECT c.id FROM category c
                                    INNER JOIN subcats s ON c.parent_category_id = s.id
                                    WHERE c.is_active = true
                                )
                                SELECT id FROM subcats
                            ) facet_tree ON facet_tree.id = pc.category_id
                            WHERE pc.product_id = p.id
                        )
                        """.formatted(paramName));
        params.addValue(paramName, slugValue);
    }

    /**
     * Kartice za zadate slug-ove (lista želja). Redosled kao u listi kada nema eksplicitnog Spring {@code sort};
     * inače važi {@link #buildOrderBy(Pageable)}.
     */
    public Page<ProductListingRow> findProductCardsBySlugs(List<String> slugs, Pageable pageable) {
        if (slugs == null || slugs.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }
        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("slugs", slugs);

        String baseFrom = """
                FROM product p
                JOIN brand b ON b.id = p.brand_id
                LEFT JOIN product_variant dv ON dv.product_id = p.id AND dv.is_default = true
                """;
        String where = "WHERE p.is_active = true AND p.slug IN (:slugs) ";

        String countSql = "SELECT COUNT(*) " + baseFrom + where;
        Long total = jdbc.queryForObject(countSql, params, Long.class);
        long totalLong = total == null ? 0L : total;

        Pageable queryPageable = resolvePageableWhenNoApprovedReviews(pageable);
        boolean applySqlSort = !queryPageable.getSort().isEmpty();
        String orderSql = applySqlSort ? buildOrderBy(queryPageable) : "";

        String dataSql = """
                SELECT p.id AS product_id,
                       p.name AS title,
                       p.slug AS slug,
                       b.name AS brand_name,
                       b.slug AS brand_slug,
                       p.primary_image_url AS primary_image_url,
                       dv.regular_price AS regular_price,
                       dv.sale_price AS sale_price,
                       COALESCE(dv.id, (SELECT MIN(pv.id) FROM product_variant pv WHERE pv.product_id = p.id)) AS primary_variant_id,
                       (SELECT COUNT(*) FROM product_variant pv2 WHERE pv2.product_id = p.id) AS variant_count,
                       COALESCE((
                           SELECT SUM(i.quantity)
                           FROM inventory i
                           JOIN product_variant pv3 ON pv3.id = i.product_variant_id
                           WHERE pv3.product_id = p.id
                       ), 0) AS total_stock,
                       (SELECT COUNT(*) FROM product_option po WHERE po.product_id = p.id) AS option_group_count,
                       (SELECT COUNT(*) FROM review r WHERE r.product_id = p.id AND r.is_approved = TRUE) AS review_count,
                       (SELECT AVG(r.rating) FROM review r WHERE r.product_id = p.id AND r.is_approved = TRUE) AS rating_avg
                """
                + baseFrom
                + where
                + orderSql
                + " LIMIT :limit OFFSET :offset";

        params.addValue("limit", queryPageable.getPageSize());
        params.addValue("offset", (int) queryPageable.getOffset());

        List<ProductListingRow> rows = jdbc.query(dataSql, params, (rs, rowNum) -> {
            BigDecimal reg = rs.getBigDecimal("regular_price");
            if (rs.wasNull()) {
                reg = BigDecimal.ZERO;
            }
            BigDecimal sale = rs.getBigDecimal("sale_price");
            if (rs.wasNull()) {
                sale = null;
            }
            long defVar = rs.getLong("primary_variant_id");
            Long primaryVariantId = rs.wasNull() ? null : defVar;
            String img = rs.getString("primary_image_url");
            if (rs.wasNull()) {
                img = null;
            }
            BigDecimal ratingAvg = rs.getBigDecimal("rating_avg");
            if (rs.wasNull()) {
                ratingAvg = null;
            }
            return new ProductListingRow(
                    rs.getLong("product_id"),
                    rs.getString("title"),
                    rs.getString("slug"),
                    rs.getString("brand_name"),
                    rs.getString("brand_slug"),
                    img,
                    reg,
                    sale,
                    primaryVariantId,
                    rs.getLong("variant_count"),
                    rs.getLong("total_stock"),
                    rs.getLong("option_group_count"),
                    ratingAvg,
                    rs.getLong("review_count"));
        });

        if (!applySqlSort) {
            Map<String, Integer> order = new HashMap<>();
            for (int i = 0; i < slugs.size(); i++) {
                order.putIfAbsent(slugs.get(i), i);
            }
            rows = new ArrayList<>(rows);
            rows.sort(Comparator.comparingInt(r -> order.getOrDefault(r.slug(), Integer.MAX_VALUE)));
        }

        return new PageImpl<>(rows, queryPageable, totalLong);
    }

    /**
     * Sort po proseku ocena nema smisla dok u bazi nema nijedne odobrene recenzije; bez toga neki klijenti/okruženja
     * mogu prijaviti grešku ili beskoristan redosled. U tom slučaju koristi podrazumevani listing (relevantnost).
     */
    private Pageable resolvePageableWhenNoApprovedReviews(Pageable pageable) {
        if (!sortContainsRatingAvg(pageable)) {
            return pageable;
        }
        if (anyApprovedReviewsExist()) {
            return pageable;
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
    }

    private static boolean sortContainsRatingAvg(Pageable pageable) {
        return pageable.getSort().stream().anyMatch(o -> "ratingAvg".equals(normalizeSortProperty(o.getProperty())));
    }

    /** Spring / klijenti ponekad šalju {@code rating_avg} ili drugačiji zapis. */
    private static String normalizeSortProperty(String prop) {
        if (prop == null || prop.isBlank()) {
            return "";
        }
        if ("rating_avg".equalsIgnoreCase(prop) || "ratingavg".equalsIgnoreCase(prop)) {
            return "ratingAvg";
        }
        return prop;
    }

    private boolean anyApprovedReviewsExist() {
        Long n = jdbc.queryForObject(
                "SELECT COUNT(*) FROM review WHERE is_approved = true",
                new MapSqlParameterSource(),
                Long.class);
        return n != null && n > 0;
    }

    /**
     * Same listing rows as {@link #findProductCards} but constrained to a brand slug (for /brands/{slug}/products).
     */
    public Page<ProductListingRow> findProductCardsForBrand(String brandSlug, Pageable pageable) {
        return findProductCards(brandSlug, null, List.of(), null, null, null, pageable);
    }

    /**
     * Whitelist sort properties for SQL fragment (avoid injection).
     * Prazan sort: podrazumevani redosled (najnoviji / „relevantniji” pregled kataloga).
     */
    static String buildOrderBy(Pageable pageable) {
        if (pageable.getSort().isEmpty()) {
            return " ORDER BY p.id DESC";
        }
        StringBuilder sb = new StringBuilder(" ORDER BY ");
        int i = 0;
        for (Sort.Order order : pageable.getSort()) {
            if (i++ > 0) {
                sb.append(", ");
            }
            String prop = normalizeSortProperty(order.getProperty());
            boolean asc = order.isAscending();
            switch (prop) {
                case "ratingAvg" -> sb.append(
                        /* prvo svi sa odobrenom recenzijom, po proseku; zatim neocenjeni po relevantnosti (p.id DESC) */
                        "(EXISTS (SELECT 1 FROM review r WHERE r.product_id = p.id AND r.is_approved = TRUE)) DESC, ")
                        .append("COALESCE((SELECT AVG(r.rating) FROM review r WHERE r.product_id = p.id AND r.is_approved = TRUE), 0) ")
                        .append(asc ? "ASC" : "DESC")
                        .append(", p.id DESC");
                case "createdAt" -> sb.append("p.created_at ").append(asc ? "ASC" : "DESC").append(", p.id DESC");
                case "featured" -> sb.append("p.is_featured ").append(asc ? "ASC" : "DESC").append(", p.id DESC");
                case "name" -> sb.append("p.name ").append(asc ? "ASC" : "DESC");
                case "id" -> sb.append("p.id ").append(asc ? "ASC" : "DESC");
                case "price" -> sb.append("COALESCE(dv.sale_price, dv.regular_price) ")
                        .append(asc ? "ASC" : "DESC")
                        .append(", p.id DESC");
                default -> throw new IllegalArgumentException("Unsupported sort property: " + prop
                        + " (allowed: id, name, price, featured, createdAt, ratingAvg)");
            }
        }
        return sb.toString();
    }
}
