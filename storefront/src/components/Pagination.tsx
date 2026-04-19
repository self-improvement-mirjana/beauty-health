type Props = {
  page: number;
  totalPages: number;
  totalElements: number;
  isFetching?: boolean;
  onPageChange: (nextPage: number) => void;
};

export function Pagination({ page, totalPages, totalElements, isFetching, onPageChange }: Props) {
  if (totalPages <= 1) {
    return (
      <p className="text-sm text-neutral-500">
        {totalElements} proizvoda
        {isFetching ? ' · osvežavanje…' : null}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Strana {page + 1} od {totalPages} ({totalElements} ukupno)
        {isFetching ? ' · osvežavanje…' : null}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          className="rounded-sm border border-neutral-300 bg-white px-3 py-1.5 text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prethodna
        </button>
        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="rounded-sm border border-neutral-300 bg-white px-3 py-1.5 text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sledeća
        </button>
      </div>
    </div>
  );
}
