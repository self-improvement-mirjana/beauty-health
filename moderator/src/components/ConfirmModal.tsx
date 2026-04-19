import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
};

export function ConfirmModal({
  open,
  title,
  children,
  confirmLabel = 'Potvrdi',
  cancelLabel = 'Otkaži',
  onConfirm,
  onCancel,
  busy,
}: Props) {
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-slate-600 bg-slate-900 p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <div className="mt-3 text-sm text-slate-300">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
          >
            {busy ? 'Čekaj…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
