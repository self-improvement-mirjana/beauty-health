import { useEffect, useId, useState, type ReactNode } from 'react';

import { useAppSelector } from '@/app/hooks';
import { useChangePasswordMutation, useUpdateProfileMutation } from '@/features/api/authEndpoints';
import { selectAuthUser } from '@/features/auth/authSlice';
import { parseApiError } from '@/lib/parseApiError';

const linkCls = 'text-[rgb(0,76,151)] hover:underline';

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

function Modal({ title, children, onClose }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[min(90vh,32rem)] w-full max-w-md overflow-y-auto rounded-xl border border-neutral-200 bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="text-lg font-semibold text-neutral-900">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export function AccountInformationPage() {
  const user = useAppSelector(selectAuthUser);
  const [nameOpen, setNameOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [fullNameDraft, setFullNameDraft] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [updateProfile, { isLoading: savingName }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: savingPw }] = useChangePasswordMutation();

  function openNameEditor() {
    setFullNameDraft(user?.fullName?.trim() ?? '');
    setNameError(null);
    setNameOpen(true);
  }

  function openPasswordEditor() {
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setPwError(null);
    setPasswordOpen(true);
  }

  async function submitName() {
    const v = fullNameDraft.trim();
    if (!v) {
      setNameError('Unesite ime i prezime.');
      return;
    }
    if (v.length > 255) {
      setNameError('Predugačko ime.');
      return;
    }
    setNameError(null);
    try {
      await updateProfile({ fullName: v }).unwrap();
      setNameOpen(false);
    } catch (e) {
      setNameError(parseApiError(e).message);
    }
  }

  async function submitPassword() {
    const pwdRule = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!currentPw) {
      setPwError('Unesite trenutnu lozinku.');
      return;
    }
    if (newPw.length < 8) {
      setPwError('Nova lozinka mora imati najmanje 8 karaktera.');
      return;
    }
    if (!pwdRule.test(newPw)) {
      setPwError('Nova lozinka mora sadržati bar jedno slovo i jednu cifru.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwError('Lozinke se ne poklapaju.');
      return;
    }
    setPwError(null);
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw }).unwrap();
      setPasswordOpen(false);
    } catch (e) {
      setPwError(parseApiError(e).message);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="text-neutral-900">
      <h1 className="font-serif text-3xl font-normal tracking-tight text-neutral-900">Podaci o nalogu</h1>
      <div className="mt-3 border-b-4 border-neutral-900" aria-hidden />

      <div className="mt-2 divide-y divide-neutral-200">
        <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="w-full shrink-0 sm:w-44">
            <span className="text-sm font-semibold">Ime</span>
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p>{user.fullName}</p>
          </div>
          <div className="shrink-0 sm:w-24 sm:text-right">
            <button type="button" className={`text-sm ${linkCls}`} onClick={openNameEditor}>
              Izmeni
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="w-full shrink-0 sm:w-44">
            <span className="text-sm font-semibold">E-pošta</span>
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p>{user.email}</p>
            <p className="mt-1 text-xs text-neutral-500">
              Za promenu adrese e-pošte obratite se podršci — uskoro i u aplikaciji.
            </p>
          </div>
          <div className="shrink-0 sm:w-24 sm:text-right" />
        </div>

        <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="w-full shrink-0 sm:w-44">
            <span className="text-sm font-semibold">Telefon</span>
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="text-neutral-500">—</p>
            <p className="mt-1 text-xs text-neutral-500">Broj telefona i SMS obaveštenja biće dostupni u sledećoj verziji.</p>
          </div>
          <div className="shrink-0 sm:w-24 sm:text-right" />
        </div>

        <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="w-full shrink-0 sm:w-44">
            <span className="text-sm font-semibold">Lozinka</span>
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="tracking-widest text-neutral-800">••••••••</p>
          </div>
          <div className="shrink-0 sm:w-24 sm:text-right">
            <button type="button" className={`text-sm ${linkCls}`} onClick={openPasswordEditor}>
              Izmeni
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:gap-8">
          <div className="w-full shrink-0 sm:w-44">
            <span className="text-sm font-semibold">Uloge</span>
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="text-neutral-700">{user.roles.join(', ')}</p>
          </div>
          <div className="shrink-0 sm:w-24 sm:text-right" />
        </div>
      </div>

      {nameOpen ? (
        <Modal title="Izmena imena" onClose={() => setNameOpen(false)}>
          <div className="mt-4">
            <label htmlFor="acc-fullname" className="block text-xs font-medium text-neutral-600">
              Ime i prezime
            </label>
            <input
              id="acc-fullname"
              autoComplete="name"
              value={fullNameDraft}
              onChange={(e) => setFullNameDraft(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
            />
            {nameError ? <p className="mt-2 text-sm text-red-600">{nameError}</p> : null}
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              onClick={() => setNameOpen(false)}
            >
              Otkaži
            </button>
            <button
              type="button"
              disabled={savingName}
              className="rounded-md bg-[rgb(0,76,151)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
              onClick={() => void submitName()}
            >
              {savingName ? 'Čuvanje…' : 'Sačuvaj'}
            </button>
          </div>
        </Modal>
      ) : null}

      {passwordOpen ? (
        <Modal title="Promena lozinke" onClose={() => setPasswordOpen(false)}>
          <div className="mt-4 space-y-3">
            <div>
              <label htmlFor="acc-cur-pw" className="block text-xs font-medium text-neutral-600">
                Trenutna lozinka
              </label>
              <input
                id="acc-cur-pw"
                type="password"
                autoComplete="current-password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <div>
              <label htmlFor="acc-new-pw" className="block text-xs font-medium text-neutral-600">
                Nova lozinka
              </label>
              <input
                id="acc-new-pw"
                type="password"
                autoComplete="new-password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <div>
              <label htmlFor="acc-confirm-pw" className="block text-xs font-medium text-neutral-600">
                Potvrdi novu lozinku
              </label>
              <input
                id="acc-confirm-pw"
                type="password"
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
              />
            </div>
            <p className="text-xs text-neutral-500">Najmanje 8 karaktera, bar jedno slovo i jedna cifra.</p>
            {pwError ? <p className="text-sm text-red-600">{pwError}</p> : null}
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              onClick={() => setPasswordOpen(false)}
            >
              Otkaži
            </button>
            <button
              type="button"
              disabled={savingPw}
              className="rounded-md bg-[rgb(0,76,151)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
              onClick={() => void submitPassword()}
            >
              {savingPw ? 'Čuvanje…' : 'Sačuvaj'}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
