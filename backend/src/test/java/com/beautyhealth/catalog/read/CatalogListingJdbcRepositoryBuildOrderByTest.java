package com.beautyhealth.catalog.read;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

class CatalogListingJdbcRepositoryBuildOrderByTest {

    @Test
    void priceAsc_usesCoalesceAndTieBreaksByProductId() {
        var pageable = PageRequest.of(0, 20, Sort.by(Sort.Order.asc("price")));
        String sql = CatalogListingJdbcRepository.buildOrderBy(pageable);
        assertThat(sql)
                .contains("COALESCE(dv.sale_price, dv.regular_price) ASC")
                .contains("p.id DESC");
    }

    @Test
    void priceDesc_usesCoalesceAndTieBreaksByProductId() {
        var pageable = PageRequest.of(0, 20, Sort.by(Sort.Order.desc("price")));
        String sql = CatalogListingJdbcRepository.buildOrderBy(pageable);
        assertThat(sql)
                .contains("COALESCE(dv.sale_price, dv.regular_price) DESC")
                .contains("p.id DESC");
    }

    @Test
    void unsupportedProperty_throwsIllegalArgumentException() {
        var pageable = PageRequest.of(0, 20, Sort.by(Sort.Order.asc("unknownField")));
        assertThatThrownBy(() -> CatalogListingJdbcRepository.buildOrderBy(pageable))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported sort property");
    }
}
