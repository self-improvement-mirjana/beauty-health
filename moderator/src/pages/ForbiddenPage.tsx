import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearCredentials, selectAuthUser } from '@/features/auth/authSlice';

export function ForbiddenPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);

  function logout() {
    dispatch(clearCredentials());
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md rounded-xl border border-amber-900/50 bg-shell-panel p-8 text-center">
        <h1 className="text-xl font-semibold text-amber-400">Nemate pristup</h1>
        <p className="mt-3 text-slate-300">
          Ova aplikacija je samo za naloge sa ulogom <strong className="text-white">moderator</strong>.
          {user ? (
            <>
              {' '}
              Vaš nalog <span className="text-slate-200">{user.email}</span> nema tu ulogu.
            </>
          ) : null}
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-6 rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
        >
          Nazad na prijavu
        </button>
      </div>
    </div>
  );
}
