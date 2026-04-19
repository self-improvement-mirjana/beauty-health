import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@/app/hooks';
import { useLoginMutation } from '@/features/api/baseApi';
import { setCredentials } from '@/features/auth/authSlice';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const data = await login({ email: email.trim(), password }).unwrap();
      dispatch(setCredentials({ token: data.accessToken, user: data.user }));
      const ok = data.user.roles.includes('MODERATOR');
      navigate(ok ? (from.startsWith('/login') ? '/' : from) : '/forbidden', { replace: true });
    } catch {
      // Invalid credentials or network — keep message generic (no password in logs/UI detail).
      setError('Prijava nije uspela. Proverite email i lozinku.');
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-shell-border bg-shell-panel p-8 shadow-xl">
        <h1 className="text-center text-2xl font-semibold text-white">Moderacija</h1>
        <p className="mt-1 text-center text-sm text-slate-400">Prijavite se moderatorskim nalogom</p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value);
                setError(null);
              }}
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-white outline-none ring-amber-500 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Lozinka
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(ev) => {
                setPassword(ev.target.value);
                setError(null);
              }}
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-white outline-none ring-amber-500 focus:ring-2"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-amber-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
          >
            {isLoading ? 'Prijava…' : 'Prijavi se'}
          </button>
        </form>
      </div>
    </div>
  );
}
