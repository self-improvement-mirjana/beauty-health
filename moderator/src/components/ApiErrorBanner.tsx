type Props = {
  message: string;
  details?: string[];
  onDismiss?: () => void;
};

export function ApiErrorBanner({ message, details = [], onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-800/80 bg-red-950/40 px-4 py-3 text-sm text-red-100"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{message}</p>
          {details.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-red-200/90">
              {details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded border border-red-700 px-2 py-0.5 text-xs text-red-200 hover:bg-red-900/50"
          >
            Zatvori
          </button>
        ) : null}
      </div>
    </div>
  );
}
