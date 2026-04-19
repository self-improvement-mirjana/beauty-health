import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import {
  EyeIcon,
  RememberMeInfoButton,
  SephoraAuthModal,
  SephoraNewUserFooter,
  sephoraInputClass,
  sephoraLinkBlueClass,
  sephoraPrimaryButtonClass,
} from '@/components/auth/AuthFormShell';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { hasBrowserAuthToken } from '@/features/auth/authPresence';
import { selectAccessToken } from '@/features/auth/authSlice';
import { useLoginMutation } from '@/features/api/authEndpoints';
import { useMergeCartMutation } from '@/features/api/cartEndpoints';
import { setCredentials } from '@/features/auth/authSlice';
import { readGuestCartToken } from '@/lib/authSession';
import { mapApiDetailsToFieldErrors } from '@/lib/mapApiFieldErrors';
import { parseApiError } from '@/lib/parseApiError';

const loginSchema = z.object({
  email: z.string().email('Unesite ispravan e-mail.'),
  password: z.string().min(1, 'Unesite lozinku.'),
});

type LoginForm = z.infer<typeof loginSchema>;

function friendlyAuthMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid credential')) {
    return 'Pogrešan e-mail ili lozinka.';
  }
  return message;
}

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/account';
  }
  return raw;
}

const labelCls = 'block text-xs font-medium text-neutral-600';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();
  const [mergeCart] = useMergeCartMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  if (accessToken || hasBrowserAuthToken()) {
    return <Navigate to={safeNextPath(searchParams.get('next'))} replace />;
  }

  const passwordJustReset = searchParams.get('reset') === 'ok';

  function goForgotPassword() {
    navigate('/forgot-password');
  }

  async function onSubmit(values: LoginForm) {
    try {
      const res = await login(values).unwrap();
      dispatch(
        setCredentials({
          accessToken: res.accessToken,
          user: res.user,
          rememberMe,
        }),
      );
      const guest = readGuestCartToken();
      if (guest) {
        try {
          await mergeCart({ guestCartToken: guest }).unwrap();
        } catch {
          /* merge nije kritičan za prijavu */
        }
      }
      navigate(safeNextPath(searchParams.get('next')), { replace: true });
    } catch (e: unknown) {
      const { message, details } = parseApiError(e);
      const fieldMap = mapApiDetailsToFieldErrors(details);
      let applied = false;
      for (const key of ['email', 'password'] as const) {
        const msg = fieldMap[key];
        if (msg) {
          setError(key, { type: 'server', message: msg });
          applied = true;
        }
      }
      if (!applied) {
        setError('root', { type: 'server', message: friendlyAuthMessage(message) });
      }
    }
  }

  return (
    <SephoraAuthModal
      title="Prijava"
      footer={
        <SephoraNewUserFooter heading="Novi ste kod nas?" buttonLabel="Kreiraj nalog" buttonTo="/register" />
      }
    >
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-6 space-y-4">
        {passwordJustReset ? (
          <p role="status" className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Lozinka je uspešno promenjena. Prijavite se novom lozinkom.
          </p>
        ) : null}
        {errors.root ? (
          <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {errors.root.message}
          </p>
        ) : null}

        <div>
          <label htmlFor="login-email" className={labelCls}>
            E-adresa
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="ime@primer.rs"
            className={`${sephoraInputClass} mt-1`}
            {...register('email')}
          />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <label htmlFor="login-password" className={labelCls}>
            Lozinka
          </label>
          <div className="relative mt-1">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`${sephoraInputClass} pr-11`}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-neutral-500 hover:bg-neutral-200/80 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
          {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
        </div>

        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded-sm border-neutral-400 text-black focus:ring-black"
            />
            <label htmlFor="remember-me" className="cursor-pointer select-none text-sm text-neutral-800">
              Ostani prijavljen
            </label>
            <RememberMeInfoButton />
          </div>
          <button
            type="button"
            onClick={goForgotPassword}
            className={`${sephoraLinkBlueClass} shrink-0 whitespace-nowrap bg-transparent text-right`}
          >
            Zaboravljena lozinka?
          </button>
        </div>

        <p className="text-left text-[11px] leading-snug text-neutral-600">
          Klikom na „Prijavi se“ (1) prihvatate aktuelnu verziju naših{' '}
          <Link to="/pages/uslovi-kupovine" className="font-bold text-neutral-800 underline underline-offset-2 hover:text-black">
            USLOVA KORIšĆENJA
          </Link>
          , i (2) potvrđujete da ste pročitali{' '}
          <Link
            to="/pages/privatnost-i-kolacici"
            className="font-bold text-neutral-800 underline underline-offset-2 hover:text-black"
          >
            POLITIKU PRIVATNOSTI
          </Link>
          .
        </p>

        <button type="submit" disabled={isLoading} className={`${sephoraPrimaryButtonClass} mt-1`}>
          {isLoading ? 'Prijava…' : 'Prijavi se'}
        </button>
      </form>
    </SephoraAuthModal>
  );
}
