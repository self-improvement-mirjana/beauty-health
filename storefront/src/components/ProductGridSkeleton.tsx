export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white" aria-hidden>
          <div className="aspect-square bg-neutral-50" />
          <div className="space-y-2 pt-4">
            <div className="h-3 w-full rounded bg-neutral-200" />
            <div className="h-3 w-2/3 rounded bg-neutral-200" />
            <div className="h-4 w-1/3 rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
