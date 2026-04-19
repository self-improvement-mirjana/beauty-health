import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import {
  EyeIcon,
  RememberMeInfoButton,
  SephoraAuthModal,
  SephoraExistingUserFooter,
  sephoraInputClass,
  sephoraPrimaryButtonClass,
} from '@/components/auth/AuthFormShell';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { hasBrowserAuthToken } from '@/features/auth/authPresence';
import { selectAccessToken } from '@/features/auth/authSlice';
import { useRegisterMutation } from '@/features/api/authEndpoints';
import { useMergeCartMutation } from '@/features/api/cartEndpoints';
import { setCredentials } from '@/features/auth/authSlice';
import { readGuestCartToken } from '@/lib/authSession';
import { mapApiDetailsToFieldErrors } from '@/lib/mapApiFieldErrors';
import { parseApiError } from '@/lib/parseApiError';

const registerSchema = z
  .object({
    fullName: z.string().min(1, 'Unesite ime i prezime.').max(255, 'Predugačko ime.'),
    email: z.string().email('Unesite ispravan e-mail.'),
    password: z
      .string()
      .min(8, 'Lozinka mora imati najmanje 8 karaktera.')
      .max(128, 'Predugačka lozinka.')
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Lozinka mora sadržati bar jedno slovo i jednu cifru.'),
    confirmPassword: z.string().min(1, 'Potvrdite lozinku.'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Lozinke se ne poklapaju.',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const labelCls = 'block text-xs font-medium text-neutral-600';

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [mergeCart] = useMergeCartMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  if (accessToken || hasBrowserAuthToken()) {
    return <Navigate to="/account" replace />;
  }

  async function onSubmit(values: RegisterForm) {
    try {
      const res = await registerUser({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      }).unwrap();
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
          /* nije kritično */
        }
      }
      navigate('/account', { replace: true });
    } catch (e: unknown) {
      const { message, details } = parseApiError(e);
      const fieldMap = mapApiDetailsToFieldErrors(details);
      let applied = false;
      for (const key of ['fullName', 'email', 'password'] as const) {
        const msg = fieldMap[key];
        if (msg) {
          setError(key, { type: 'server', message: msg });
          applied = true;
        }
      }
      if (!applied) {
        setError('root', { type: 'server', message });
      }
    }
  }

  return (
    <SephoraAuthModal
      title="Kreiraj nalog"
      footer={<SephoraExistingUserFooter heading="Već ste registrovani?" buttonLabel="Prijavi se" buttonTo="/login" />}
    >
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-6 space-y-4">
        {errors.root ? (
          <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {errors.root.message}
          </p>
        ) : null}

        <div>
          <label htmlFor="reg-name" className={labelCls}>
            Ime i prezime
          </label>
          <input id="reg-name" autoComplete="name" className={`${sephoraInputClass} mt-1`} {...register('fullName')} />
          {errors.fullName ? <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p> : null}
        </div>

        <div>
          <label htmlFor="reg-email" className={labelCls}>
            E-adresa
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="ime@primer.rs"
            className={`${sephoraInputClass} mt-1`}
            {...register('email')}
          />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <label htmlFor="reg-password" className={labelCls}>
            Lozinka
          </label>
          <div className="relative mt-1">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
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
          <p className="mt-1 text-xs text-neutral-500">Minimum 8 karaktera, bar jedno slovo i jedna cifra.</p>
        </div>

        <div>
          <label htmlFor="reg-confirm" className={labelCls}>
            Potvrda lozinke
          </label>
          <div className="relative mt-1">
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              className={`${sephoraInputClass} pr-11`}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-neutral-500 hover:bg-neutral-200/80 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Sakrij potvrdu lozinke' : 'Prikaži potvrdu lozinke'}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <input
            id="reg-remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded-sm border-neutral-400 text-black focus:ring-black"
          />
          <label htmlFor="reg-remember" className="cursor-pointer select-none text-sm text-neutral-800">
            Ostani prijavljen
          </label>
          <RememberMeInfoButton />
        </div>

        <p className="text-left text-[11px] leading-snug text-neutral-600">
          Klikom na „Registruj se“ prihvatate naše{' '}
          <Link to="/pages/uslovi-kupovine" className="font-bold text-neutral-800 underline underline-offset-2 hover:text-black">
            USLOVE KORIšĆENJA
          </Link>{' '}
          i{' '}
          <Link
            to="/pages/privatnost-i-kolacici"
            className="font-bold text-neutral-800 underline underline-offset-2 hover:text-black"
          >
            POLITIKU PRIVATNOSTI
          </Link>
          .
        </p>

        <button type="submit" disabled={isLoading} className={`${sephoraPrimaryButtonClass} mt-1`}>
          {isLoading ? 'Slanje…' : 'Registruj se'}
        </button>
      </form>
    </SephoraAuthModal>
  );
}
