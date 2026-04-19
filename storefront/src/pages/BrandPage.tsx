import { useParams } from 'react-router-dom';

import { useListBrandProductsQuery, useListBrandsQuery } from '@/features/api/catalogEndpoints';
import { ProductListing } from '@/components/ProductListing';
import { useListingPagination } from '@/hooks/useListingPagination';

export function BrandPage() {
  const { slug: slugParam } = useParams();
  const slug = slugParam ?? '';
  const { page, size, setPage } = useListingPagination();
  const { data: brands } = useListBrandsQuery();
  const brandName = brands?.find((b) => b.slug === slug)?.name;

  const { data, isLoading, isError, error, isFetching, refetch } = useListBrandProductsQuery(
    { slug, page, size },
    { skip: !slug },
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">{(brandName ?? slug) || 'Brend'}</h1>
      <p className="mt-1 text-sm text-neutral-600">Proizvodi brenda (B04).</p>
      {!slug ? <p className="mt-4 text-sm text-rose-300">Nedostaje slug u URL-u.</p> : null}
      {slug ? (
        <div className="mt-8">
          <ProductListing
            data={data}
            isLoading={isLoading}
            isError={isError}
            error={error}
            isFetching={isFetching}
            refetch={refetch}
            page={page}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
}
