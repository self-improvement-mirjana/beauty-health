package com.beautyhealth.moderation.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.catalog.domain.Brand;
import com.beautyhealth.catalog.domain.Category;
import com.beautyhealth.catalog.domain.InventoryRow;
import com.beautyhealth.catalog.domain.Product;
import com.beautyhealth.catalog.domain.ProductVariant;
import com.beautyhealth.catalog.domain.StoreLocation;
import com.beautyhealth.catalog.repo.BrandRepository;
import com.beautyhealth.catalog.repo.CategoryRepository;
import com.beautyhealth.catalog.repo.ProductRepository;
import com.beautyhealth.catalog.repo.ProductVariantRepository;
import com.beautyhealth.catalog.repo.StoreLocationRepository;
import com.beautyhealth.common.error.ConflictException;
import com.beautyhealth.moderation.api.dto.AdminBrandRequest;
import com.beautyhealth.moderation.api.dto.AdminBrandResponse;
import com.beautyhealth.moderation.api.dto.AdminCategoryRequest;
import com.beautyhealth.moderation.api.dto.AdminCategoryResponse;
import com.beautyhealth.moderation.api.dto.AdminCreateProductRequest;
import com.beautyhealth.moderation.api.dto.AdminInventoryLineRequest;
import com.beautyhealth.moderation.api.dto.AdminProductCreatedResponse;
import com.beautyhealth.moderation.api.dto.AdminUpdateProductRequest;
import com.beautyhealth.moderation.api.dto.AdminVariantCreateRequest;
import com.beautyhealth.moderation.api.dto.AdminStoreLocationResponse;
import com.beautyhealth.moderation.api.dto.AdminVariantInventoryBody;
import com.beautyhealth.moderation.api.dto.AdminVariantInventoryLineResponse;
import com.beautyhealth.moderation.api.dto.AdminVariantPricesRequest;

@Service
@Transactional
public class ModerationCatalogWriteService {

    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final StoreLocationRepository storeLocationRepository;

    public ModerationCatalogWriteService(BrandRepository brandRepository, CategoryRepository categoryRepository,
            ProductRepository productRepository, ProductVariantRepository productVariantRepository,
            StoreLocationRepository storeLocationRepository) {
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.storeLocationRepository = storeLocationRepository;
    }

    public List<AdminBrandResponse> listBrands() {
        return brandRepository.findAllByOrderByNameAsc().stream()
                .map(b -> new AdminBrandResponse(b.getId(), b.getName(), b.getSlug()))
                .toList();
    }

    public AdminBrandResponse createBrand(AdminBrandRequest request) {
        if (brandRepository.existsBySlug(request.slug())) {
            throw new ConflictException("Brand slug already exists");
        }
        Brand b = new Brand();
        b.setName(request.name().trim());
        b.setSlug(request.slug().trim());
        brandRepository.save(b);
        return new AdminBrandResponse(b.getId(), b.getName(), b.getSlug());
    }

    public AdminBrandResponse updateBrand(long id, AdminBrandRequest request) {
        Brand b = brandRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found"));
        if (brandRepository.existsBySlugAndIdNot(request.slug().trim(), id)) {
            throw new ConflictException("Brand slug already exists");
        }
        b.setName(request.name().trim());
        b.setSlug(request.slug().trim());
        return new AdminBrandResponse(b.getId(), b.getName(), b.getSlug());
    }

    public void deleteBrand(long id) {
        Brand b = brandRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found"));
        if (productRepository.existsByBrand_Id(b.getId())) {
            throw new ConflictException("Cannot delete brand that still has products");
        }
        brandRepository.delete(b);
    }

    public List<AdminCategoryResponse> listCategories() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparingInt(Category::getSortOrder).thenComparingLong(Category::getId))
                .map(c -> new AdminCategoryResponse(c.getId(), c.getName(), c.getSlug(),
                        c.getParent() == null ? null : c.getParent().getId(), c.getSortOrder(), c.isActive(), c.getDescription()))
                .toList();
    }

    public AdminCategoryResponse createCategory(AdminCategoryRequest request) {
        if (categoryRepository.existsBySlug(request.slug().trim())) {
            throw new ConflictException("Category slug already exists");
        }
        Category c = new Category();
        applyCategoryFields(c, request);
        categoryRepository.save(c);
        return toCategoryResponse(c);
    }

    public AdminCategoryResponse updateCategory(long id, AdminCategoryRequest request) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        if (categoryRepository.existsBySlugAndIdNot(request.slug().trim(), id)) {
            throw new ConflictException("Category slug already exists");
        }
        applyCategoryFields(c, request);
        categoryRepository.save(c);
        return toCategoryResponse(c);
    }

    public void deleteCategory(long id) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        if (categoryRepository.existsByParent_Id(c.getId())) {
            throw new ConflictException("Cannot delete category that has subcategories");
        }
        if (categoryRepository.existsProductLinkedToCategory(c.getId())) {
            throw new ConflictException("Cannot delete category linked to products");
        }
        categoryRepository.delete(c);
    }

    public List<AdminStoreLocationResponse> listStoreLocations() {
        return storeLocationRepository.findAll().stream()
                .sorted(Comparator.comparingLong(StoreLocation::getId))
                .map(s -> new AdminStoreLocationResponse(s.getId(), s.getName(), s.getSlug()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminVariantInventoryLineResponse> getVariantInventory(long productId, long variantId) {
        ProductVariant v = productVariantRepository.findByIdAndProductIdWithInventory(variantId, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        return v.getInventories().stream()
                .sorted(Comparator.comparing(inv -> inv.getStoreLocation().getId()))
                .map(inv -> new AdminVariantInventoryLineResponse(
                        inv.getStoreLocation().getId(),
                        inv.getStoreLocation().getName(),
                        inv.getQuantity()))
                .toList();
    }

    public AdminProductCreatedResponse createProduct(AdminCreateProductRequest request) {
        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found"));
        if (productRepository.existsBySlug(request.slug().trim())) {
            throw new ConflictException("Product slug already exists");
        }
        validateVariantDefaults(request.variants());
        for (AdminVariantCreateRequest v : request.variants()) {
            if (productVariantRepository.existsBySku(v.sku().trim())) {
                throw new ConflictException("Duplicate SKU: " + v.sku().trim());
            }
        }

        Product p = new Product();
        p.setBrand(brand);
        p.setName(request.name().trim());
        p.setSlug(request.slug().trim());
        p.setDescription(request.description());
        p.setShortDescription(request.shortDescription());
        p.setFeatured(request.featured());
        p.setActive(request.active());
        replaceProductCategories(p, request.categoryIds());
        productRepository.saveAndFlush(p);

        for (AdminVariantCreateRequest vReq : request.variants()) {
            ProductVariant pv = new ProductVariant();
            pv.setProduct(p);
            pv.setSku(vReq.sku().trim());
            pv.setName(vReq.name() == null ? null : vReq.name().trim());
            pv.setRegularPrice(normalizeMoney(vReq.regularPrice()));
            pv.setSalePrice(vReq.salePrice() == null ? null : normalizeMoney(vReq.salePrice()));
            pv.setDefaultVariant(vReq.defaultVariant());
            for (AdminInventoryLineRequest line : vReq.inventory()) {
                StoreLocation loc = storeLocationRepository.findById(line.storeLocationId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store location not found"));
                InventoryRow row = new InventoryRow();
                row.setVariant(pv);
                row.setStoreLocation(loc);
                row.setQuantity(line.quantity());
                pv.getInventories().add(row);
            }
            productVariantRepository.save(pv);
        }
        return new AdminProductCreatedResponse(p.getId(), p.getSlug());
    }

    public AdminProductCreatedResponse updateProduct(long id, AdminUpdateProductRequest request) {
        Product p = productRepository.findWithBrandAndCategoriesById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found"));
        if (productRepository.existsBySlugAndIdNot(request.slug().trim(), id)) {
            throw new ConflictException("Product slug already exists");
        }
        p.setBrand(brand);
        p.setName(request.name().trim());
        p.setSlug(request.slug().trim());
        p.setDescription(request.description());
        p.setShortDescription(request.shortDescription());
        p.setFeatured(request.featured());
        p.setActive(request.active());
        replaceProductCategories(p, request.categoryIds());
        productRepository.save(p);
        return new AdminProductCreatedResponse(p.getId(), p.getSlug());
    }

    public void updateVariantPrices(long productId, long variantId, AdminVariantPricesRequest request) {
        ProductVariant v = productVariantRepository.findByIdAndProduct_Id(variantId, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        v.setRegularPrice(normalizeMoney(request.regularPrice()));
        v.setSalePrice(request.salePrice() == null ? null : normalizeMoney(request.salePrice()));
        productVariantRepository.save(v);
    }

    public void replaceVariantInventory(long productId, long variantId, AdminVariantInventoryBody body) {
        ProductVariant v = productVariantRepository.findByIdAndProduct_Id(variantId, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        v.getInventories().clear();
        for (AdminInventoryLineRequest line : body.lines()) {
            StoreLocation loc = storeLocationRepository.findById(line.storeLocationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Store location not found"));
            InventoryRow row = new InventoryRow();
            row.setVariant(v);
            row.setStoreLocation(loc);
            row.setQuantity(line.quantity());
            v.getInventories().add(row);
        }
        productVariantRepository.save(v);
    }

    private static void validateVariantDefaults(List<AdminVariantCreateRequest> variants) {
        long defaults = variants.stream().filter(AdminVariantCreateRequest::defaultVariant).count();
        if (defaults != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exactly one variant must be marked default");
        }
    }

    private void replaceProductCategories(Product p, List<Long> categoryIds) {
        p.getCategories().clear();
        if (categoryIds == null || categoryIds.isEmpty()) {
            return;
        }
        Set<Long> seen = new HashSet<>();
        for (Long cid : categoryIds) {
            if (cid == null || !seen.add(cid)) {
                continue;
            }
            Category c = categoryRepository.findById(cid)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
            p.getCategories().add(c);
        }
    }

    private void applyCategoryFields(Category c, AdminCategoryRequest request) {
        c.setName(request.name().trim());
        c.setSlug(request.slug().trim());
        c.setDescription(request.description());
        c.setSortOrder(request.sortOrder());
        c.setActive(request.active());
        if (request.parentCategoryId() == null) {
            c.setParent(null);
        } else {
            if (c.getId() != null && request.parentCategoryId().equals(c.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(request.parentCategoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent category not found"));
            assertCategoryParentDoesNotCreateCycle(c, parent);
            c.setParent(parent);
        }
    }

    /**
     * Rejects assigning a parent that is this category or lies under it in the tree (would create a cycle).
     */
    private void assertCategoryParentDoesNotCreateCycle(Category category, Category proposedParent) {
        Category cursor = proposedParent;
        int depth = 0;
        while (cursor != null && depth++ < 512) {
            if (category.getId() != null && cursor.getId().equals(category.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid parent: would create a cycle in the category tree");
            }
            cursor = cursor.getParent();
        }
    }

    private static AdminCategoryResponse toCategoryResponse(Category c) {
        return new AdminCategoryResponse(c.getId(), c.getName(), c.getSlug(),
                c.getParent() == null ? null : c.getParent().getId(), c.getSortOrder(), c.isActive(), c.getDescription());
    }

    private static BigDecimal normalizeMoney(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
