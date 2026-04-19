import { parseApiError } from '@/lib/parseApiError';

type Props = {
  error: unknown;
  onRetry?: () => void;
};

export function ErrorState({ error, onRetry }: Props) {
  const { message, details } = parseApiError(error);
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900"
    >
      <p className="font-medium">{message}</p>
      {details.length > 0 ? (
        <ul className="mt-2 list-inside list-disc text-red-800/90">
          {details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-sm border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-900 hover:bg-red-100"
        >
          Pokušaj ponovo
        </button>
      ) : null}
    </div>
  );
}
