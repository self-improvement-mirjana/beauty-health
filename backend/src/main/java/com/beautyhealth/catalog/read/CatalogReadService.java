package com.beautyhealth.catalog.read;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.beautyhealth.catalog.api.dto.BrandSummaryResponse;
import com.beautyhealth.catalog.api.dto.CatalogCtaType;
import com.beautyhealth.catalog.api.dto.CategoryChildProductCountRow;
import com.beautyhealth.catalog.api.dto.CategoryTreeNodeResponse;
import com.beautyhealth.catalog.api.dto.ProductCardResponse;
import com.beautyhealth.catalog.api.dto.ProductCategoryLinkResponse;
import com.beautyhealth.catalog.api.dto.ProductDetailResponse;
import com.beautyhealth.catalog.api.dto.ProductOptionResponse;
import com.beautyhealth.catalog.api.dto.ProductOptionValueResponse;
import com.beautyhealth.catalog.api.dto.ProductVariantDetailResponse;
import com.beautyhealth.catalog.api.dto.SelectedOptionValueResponse;
import com.beautyhealth.catalog.domain.Category;
import com.beautyhealth.catalog.domain.Product;
import com.beautyhealth.catalog.domain.ProductOption;
import com.beautyhealth.catalog.domain.ProductOptionValue;
import com.beautyhealth.catalog.domain.ProductVariant;
import com.beautyhealth.catalog.domain.ProductVariantOption;
import com.beautyhealth.catalog.repo.BrandRepository;
import com.beautyhealth.catalog.repo.CategoryRepository;
import com.beautyhealth.catalog.repo.ProductOptionRepository;
import com.beautyhealth.catalog.repo.ProductRepository;
import com.beautyhealth.catalog.repo.ProductVariantRepository;
import com.beautyhealth.common.money.MoneyResponse;
import com.beautyhealth.review.repo.ProductReviewRepository;

@Service
@Transactional(readOnly = true)
public class CatalogReadService {

    private final CatalogListingJdbcRepository listingJdbcRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductOptionRepository productOptionRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductReviewRepository productReviewRepository;

    public CatalogReadService(CatalogListingJdbcRepository listingJdbcRepository, CategoryRepository categoryRepository,
            BrandRepository brandRepository, ProductRepository productRepository,
            ProductOptionRepository productOptionRepository, ProductVariantRepository productVariantRepository,
            ProductReviewRepository productReviewRepository) {
        this.listingJdbcRepository = listingJdbcRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
        this.productOptionRepository = productOptionRepository;
        this.productVariantRepository = productVariantRepository;
        this.productReviewRepository = productReviewRepository;
    }

    public Page<ProductCardResponse> listProducts(String brandSlug, String categorySlug, List<String> categoryFacets,
            Boolean featured, String q, Integer minRating, Pageable pageable) {
        return listingJdbcRepository
                .findProductCards(brandSlug, categorySlug, categoryFacets, featured, q, minRating, pageable)
                .map(this::toCard);
    }

    /**
     * Lista želja: kartice za slug-ove u redosledu kao u zahtevu (do200), sa istim sortiranjem kao /products.
     */
    public Page<ProductCardResponse> listProductsBySlugs(List<String> slugs, Pageable pageable) {
        if (slugs == null || slugs.isEmpty()) {
            return Page.empty(pageable);
        }
        LinkedHashSet<String> ordered = new LinkedHashSet<>();
        for (String s : slugs) {
            if (s != null && !s.isBlank()) {
                ordered.add(s.trim());
            }
            if (ordered.size() >= 200) {
                break;
            }
        }
        if (ordered.isEmpty()) {
            return Page.empty(pageable);
        }
        List<String> list = new ArrayList<>(ordered);
        return listingJdbcRepository.findProductCardsBySlugs(list, pageable).map(this::toCard);
    }

    /**
     * B05: pretraga po nazivu (ILIKE/LIKE); isti DTO kao listing. Prazan {@code q} — validacija u kontroleru (400).
     */
    public Page<ProductCardResponse> searchProducts(String brandSlug, String categorySlug, List<String> categoryFacets,
            String q, Integer minRating, Pageable pageable) {
        return listingJdbcRepository
                .findProductCards(brandSlug, categorySlug, categoryFacets, null, q, minRating, pageable)
                .map(this::toCard);
    }

    public Page<ProductCardResponse> listProductsForBrand(String brandSlug, Pageable pageable) {
        brandRepository.findBySlug(brandSlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found"));
        return listingJdbcRepository.findProductCardsForBrand(brandSlug, pageable).map(this::toCard);
    }

    /**
     * Broj aktivnih proizvoda u podstablu svake direktne podkategorije roditelja (PLP leva kolona).
     */
    public List<CategoryChildProductCountRow> childCategoryProductCounts(String parentSlug) {
        if (parentSlug == null || parentSlug.isBlank()) {
            return List.of();
        }
        return mapSlugCountRows(categoryRepository.countActiveProductsPerDirectChild(parentSlug.trim()));
    }

    /**
     * Broj proizvoda u podstablu za svaki slug (mega-meni). Maks. 200 slug-ova.
     */
    public List<CategoryChildProductCountRow> productCountsForSlugs(List<String> slugs) {
        if (slugs == null || slugs.isEmpty()) {
            return List.of();
        }
        List<String> cleaned = slugs.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .limit(200)
                .toList();
        if (cleaned.isEmpty()) {
            return List.of();
        }
        return mapSlugCountRows(categoryRepository.countActiveProductsForSubtreeSlugs(cleaned));
    }

    private static List<CategoryChildProductCountRow> mapSlugCountRows(List<Object[]> rows) {
        List<CategoryChildProductCountRow> out = new ArrayList<>(rows.size());
        for (Object[] row : rows) {
            String s = row[0] != null ? row[0].toString() : "";
            long n = row[1] instanceof Number num ? num.longValue() : 0L;
            out.add(new CategoryChildProductCountRow(s, n));
        }
        return out;
    }

    public List<CategoryTreeNodeResponse> categoryTree() {
        List<Category> flat = categoryRepository.findAllActiveForTree();
        Map<Long, CategoryTreeNodeResponse> byId = new LinkedHashMap<>();
        for (Category c : flat) {
            byId.put(c.getId(), new CategoryTreeNodeResponse(c.getId(), c.getName(), c.getSlug(), new ArrayList<>()));
        }
        List<CategoryTreeNodeResponse> roots = new ArrayList<>();
        for (Category c : flat) {
            CategoryTreeNodeResponse node = byId.get(c.getId());
            if (c.getParent() == null) {
                roots.add(node);
            } else {
                CategoryTreeNodeResponse parentNode = byId.get(c.getParent().getId());
                if (parentNode != null) {
                    parentNode.children().add(node);
                } else {
                    roots.add(node);
                }
            }
        }
        roots.sort(Comparator.comparing(CategoryTreeNodeResponse::id));
        for (CategoryTreeNodeResponse r : byId.values()) {
            r.children().sort(Comparator.comparing(CategoryTreeNodeResponse::id));
        }
        return roots;
    }

    public List<BrandSummaryResponse> listBrands() {
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : productRepository.countActiveProductsByBrandId()) {
            long brandId = ((Number) row[0]).longValue();
            long cnt = ((Number) row[1]).longValue();
            counts.put(brandId, cnt);
        }
        return brandRepository.findAllByOrderByNameAsc().stream()
                .map(b -> new BrandSummaryResponse(
                        b.getId(),
                        b.getName(),
                        b.getSlug(),
                        b.getLogoUrl(),
                        counts.getOrDefault(b.getId(), 0L)))
                .collect(Collectors.toList());
    }

    public ProductDetailResponse productDetail(String slug) {
        Product p = productRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return buildProductDetail(p);
    }

    /**
     * Detalj za moderaciju (uklj. neaktivne proizvode) — isti JSON oblik kao javni PDP (B04 + M02).
     */
    public ProductDetailResponse moderatorProductDetail(String slug) {
        Product p = productRepository.findBySlugFetchingBrand(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return buildProductDetail(p);
    }

    private ProductDetailResponse buildProductDetail(Product p) {
        List<Category> cats = categoryRepository.findLinkedToProduct(p.getId());
        List<ProductOption> options = productOptionRepository.findForProductDetail(p.getId());
        List<ProductVariant> variants = productVariantRepository.findForProductDetail(p.getId());

        List<ProductCategoryLinkResponse> catDtos = cats.stream()
                .sorted(Comparator.comparing(Category::getSortOrder))
                .map(c -> new ProductCategoryLinkResponse(c.getId(), c.getName(), c.getSlug()))
                .toList();

        List<ProductOptionResponse> optDtos = options.stream()
                .sorted(Comparator.comparingInt(ProductOption::getSortOrder))
                .map(po -> new ProductOptionResponse(po.getName(), po.getValues().stream()
                        .sorted(Comparator.comparingInt(ProductOptionValue::getSortOrder))
                        .map(v -> new ProductOptionValueResponse(v.getId(), v.getValue()))
                        .toList()))
                .toList();

        List<ProductVariantDetailResponse> varDtos = variants.stream()
                .sorted(Comparator.comparingLong(ProductVariant::getId))
                .map(this::toVariantDetail)
                .toList();

        long reviewCount = productReviewRepository.countByProduct_IdAndApprovedTrue(p.getId());
        Double ratingAverage = null;
        if (reviewCount > 0) {
            Double rawAvg = productReviewRepository.averageRatingApprovedByProductId(p.getId());
            if (rawAvg != null) {
                ratingAverage = BigDecimal.valueOf(rawAvg).setScale(1, RoundingMode.HALF_UP).doubleValue();
            }
        }

        return new ProductDetailResponse(
                p.getId(),
                p.getBrand().getId(),
                p.getName(),
                p.getSlug(),
                p.getPrimaryImageUrl(),
                p.getBrand().getName(),
                p.getBrand().getSlug(),
                p.getShortDescription(),
                p.getDescription(),
                p.isFeatured(),
                p.isActive(),
                catDtos,
                optDtos,
                varDtos,
                ratingAverage,
                reviewCount);
    }

    private ProductVariantDetailResponse toVariantDetail(ProductVariant v) {
        int stock = v.getInventories().stream().mapToInt(inv -> inv.getQuantity()).sum();
        List<SelectedOptionValueResponse> sel = v.getSelectedOptions().stream()
                .sorted(Comparator.comparing(o -> o.getOptionValue().getId()))
                .map(ProductVariantOption::getOptionValue)
                .map(ov -> new SelectedOptionValueResponse(ov.getProductOption().getName(), ov.getValue()))
                .toList();
        return new ProductVariantDetailResponse(
                v.getId(),
                v.getSku(),
                v.getName(),
                MoneyResponse.rsd(v.getRegularPrice()),
                v.getSalePrice() == null ? null : MoneyResponse.rsd(v.getSalePrice()),
                stock > 0,
                sel);
    }

    private ProductCardResponse toCard(ProductListingRow row) {
        CatalogCtaType cta = resolveCta(row.totalStock(), row.variantCount(), row.optionGroupCount());
        boolean inStock = row.totalStock() > 0;
        boolean choose = row.variantCount() > 1 || row.optionGroupCount() > 0;
        Double ratingAverage = null;
        if (row.reviewCount() > 0 && row.ratingAverage() != null) {
            ratingAverage = row.ratingAverage().setScale(1, RoundingMode.HALF_UP).doubleValue();
        }
        return new ProductCardResponse(
                row.title(),
                row.slug(),
                row.brandName(),
                row.brandSlug(),
                row.primaryImageUrl(),
                MoneyResponse.rsd(row.regularPrice()),
                row.salePrice() == null ? null : MoneyResponse.rsd(row.salePrice()),
                cta,
                inStock,
                choose,
                row.primaryVariantId(),
                ratingAverage,
                row.reviewCount());
    }

    static CatalogCtaType resolveCta(long totalStock, long variantCount, long optionGroupCount) {
        if (totalStock <= 0) {
            return CatalogCtaType.OUT_OF_STOCK;
        }
        if (variantCount > 1 || optionGroupCount > 0) {
            return CatalogCtaType.CHOOSE_OPTIONS;
        }
        return CatalogCtaType.ADD_TO_CART;
    }
}
