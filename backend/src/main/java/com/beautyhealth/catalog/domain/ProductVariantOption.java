package com.beautyhealth.catalog.domain;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_variant_option")
public class ProductVariantOption {

    @EmbeddedId
    private ProductVariantOptionId id;

    @MapsId("productVariantId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id")
    private ProductVariant variant;

    @MapsId("productOptionValueId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_option_value_id")
    private ProductOptionValue optionValue;

    protected ProductVariantOption() {
    }

    public ProductVariantOption(ProductVariant variant, ProductOptionValue optionValue) {
        this.variant = variant;
        this.optionValue = optionValue;
    }

    @PrePersist
    void prePersist() {
        this.id = new ProductVariantOptionId(variant.getId(), optionValue.getId());
    }

    public ProductVariantOptionId getId() {
        return id;
    }

    public ProductVariant getVariant() {
        return variant;
    }

    public ProductOptionValue getOptionValue() {
        return optionValue;
    }
}
