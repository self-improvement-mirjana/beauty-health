package com.beautyhealth.catalog.domain;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ProductVariantOptionId implements Serializable {

    @Column(name = "product_variant_id")
    private Long productVariantId;

    @Column(name = "product_option_value_id")
    private Long productOptionValueId;

    protected ProductVariantOptionId() {
    }

    public ProductVariantOptionId(Long productVariantId, Long productOptionValueId) {
        this.productVariantId = productVariantId;
        this.productOptionValueId = productOptionValueId;
    }

    public Long getProductVariantId() {
        return productVariantId;
    }

    public Long getProductOptionValueId() {
        return productOptionValueId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        ProductVariantOptionId that = (ProductVariantOptionId) o;
        return Objects.equals(productVariantId, that.productVariantId)
                && Objects.equals(productOptionValueId, that.productOptionValueId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productVariantId, productOptionValueId);
    }
}
