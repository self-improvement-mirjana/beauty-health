import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/api/authEndpoints';

export function LoginPage() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('admin@banka.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await login({ email, password }).unwrap();
      localStorage.setItem('bank_token', res.token);
      navigate('/', { replace: true });
    } catch {
      setError('Pogrešan email ili lozinka.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-xl font-bold text-neutral-900">Banka · Prijava</h1>
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-neutral-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Lozinka</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
        </button>
      </form>
    </div>
  );
}
