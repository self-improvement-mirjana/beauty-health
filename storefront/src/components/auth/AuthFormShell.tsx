import type { MouseEvent, ReactNode } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/** Sephora: svetlosiva polja, tanak obrub. */
export const sephoraInputClass =
  'w-full rounded border border-neutral-300 bg-[#f5f5f5] px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:ring-1 focus:ring-neutral-900';

export const sephoraPrimaryButtonClass =
  'w-full rounded-full bg-black py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2';

export const sephoraOutlineButtonClass =
  'flex w-full items-center justify-center rounded-full border-2 border-black bg-white py-3.5 text-sm font-semibold tracking-wide text-black transition hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2';

/** Sephora plavi link. */
export const sephoraLinkBlueClass = 'text-sm font-normal text-[#0066c8] hover:text-[#004f9a] hover:underline';

/** Zadržano za starije importe — mapirano na Sephora input. */
export const authFieldClass = sephoraInputClass;
export const authPrimaryButtonClass = sephoraPrimaryButtonClass;
export const authOutlineButtonClass = sephoraOutlineButtonClass;
export const authLinkBlueClass = sephoraLinkBlueClass;

type SephoraAuthModalProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Full-screen dimmed overlay + beli panel kao Sephora „Sign In“ modal.
 * Klik van kartice zatvara (nazad ili početna).
 */
export function SephoraAuthModal({ title, subtitle, children, footer }: SephoraAuthModalProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function handleClose() {
    navigate(-1);
  }

  function handleBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8 sm:items-center sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sephora-auth-title"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="relative my-auto w-full max-w-[420px] rounded-lg bg-white px-7 pb-8 pt-6 shadow-[0_8px_32px_rgba(0,0,0,0.18)] sm:px-8 sm:pt-7"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pr-0">
          <h1 id="sephora-auth-title" className="text-left text-xl font-bold tracking-tight text-black">
            {title}
          </h1>
          <button
            type="button"
            onClick={handleClose}
            className="-mr-1 -mt-0.5 shrink-0 rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-black"
            aria-label="Zatvori"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {subtitle ? <div className="mt-3 text-left text-sm leading-relaxed text-neutral-600">{subtitle}</div> : null}
        {children}
        {footer}
      </div>
    </div>
  );
}

/** Donji blok kao „New to Sephora?“ — naslov levo, dugme pil ispod. */
export function SephoraNewUserFooter({
  heading,
  buttonLabel,
  buttonTo,
}: {
  heading: string;
  buttonLabel: string;
  buttonTo: string;
}) {
  return (
    <div className="mt-10">
      <p className="text-left text-base font-bold text-black">{heading}</p>
      <Link to={buttonTo} className={`${sephoraOutlineButtonClass} mt-4 block text-center`}>
        {buttonLabel}
      </Link>
    </div>
  );
}

/** Za registraciju: „Već imate nalog?“ + Prijava. */
export function SephoraExistingUserFooter({
  heading,
  buttonLabel,
  buttonTo,
}: {
  heading: string;
  buttonLabel: string;
  buttonTo: string;
}) {
  return (
    <div className="mt-10">
      <p className="text-left text-base font-bold text-black">{heading}</p>
      <Link to={buttonTo} className={`${sephoraOutlineButtonClass} mt-4 block text-center`}>
        {buttonLabel}
      </Link>
    </div>
  );
}

/** Mali „i“ kao na Sephori (tooltip). */
export function RememberMeInfoButton() {
  return (
    <button
      type="button"
      className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-neutral-400 bg-white text-[10px] font-bold leading-none text-neutral-600 hover:bg-neutral-50"
      title="Ostanete prijavljeni na ovom uređaju i posle zatvaranja pregledača (do isteka sesije na serveru)."
      aria-label="Informacije: Ostani prijavljen"
    >
      i
    </button>
  );
}

export function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

/** @deprecated Koristite SephoraAuthModal */
export function AuthFormShell({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  return (
    <SephoraAuthModal title={title} subtitle={subtitle}>
      {children}
    </SephoraAuthModal>
  );
}

/** @deprecated Koristite SephoraNewUserFooter */
export function AuthFormDividerSection({ title: sectionTitle, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-10 border-t border-neutral-200 pt-8">
      <p className="text-center text-sm font-medium text-neutral-900">{sectionTitle}</p>
      {children}
    </div>
  );
}
