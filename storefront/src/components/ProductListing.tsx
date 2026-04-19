import type { ProductCardDto, SpringPage } from '@/features/catalog/types';
import { ErrorState } from '@/components/ErrorState';
import { Pagination } from '@/components/Pagination';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton';

type Props = {
  data: SpringPage<ProductCardDto> | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  refetch: () => void;
  page: number;
  onPageChange: (nextPage: number) => void;
};

export function ProductListing({ data, isLoading, isError, error, isFetching, refetch, page, onPageChange }: Props) {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  if (!data?.content.length) {
    return <p className="text-sm text-neutral-500">Nema proizvoda za prikaz.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {data.content.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
      <div className="mt-10">
        <Pagination
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          isFetching={isFetching}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
