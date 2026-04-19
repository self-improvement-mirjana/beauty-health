type Props = {
  /** Prosek 1–5 (npr. 4.3) */
  rating: number;
  /** Veličina zvezdica */
  size?: 'sm' | 'md';
  className?: string;
};

export function StarRating({ rating, size = 'sm', className = '' }: Props) {
  const cls = size === 'md' ? 'text-lg leading-none sm:text-xl' : 'text-[13px] leading-none';
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className={`inline-flex gap-px text-neutral-900 ${cls} ${className}`.trim()} role="img" aria-label={`Ocena ${rating} od 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rounded >= i;
        const half = !filled && rounded >= i - 0.5;
        if (half) {
          return (
            <span key={i} className="relative inline-block w-[0.65em]" aria-hidden>
              <span className="text-neutral-300">{'\u2605'}</span>
              <span className="absolute left-0 top-0 w-1/2 overflow-hidden text-neutral-900">{'\u2605'}</span>
            </span>
          );
        }
        return (
          <span key={i} className={filled ? 'text-neutral-900' : 'text-neutral-300'} aria-hidden>
            {'\u2605'}
          </span>
        );
      })}
    </span>
  );
}
