import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import {
  EyeIcon,
  SephoraAuthModal,
  SephoraExistingUserFooter,
  sephoraInputClass,
  sephoraLinkBlueClass,
  sephoraOutlineButtonClass,
  sephoraPrimaryButtonClass,
} from '@/components/auth/AuthFormShell';
import { useResetPasswordMutation } from '@/features/api/authEndpoints';
import { parseApiError } from '@/lib/parseApiError';

const schema = z
  .object({
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

type FormValues = z.infer<typeof schema>;

const labelCls = 'block text-xs font-medium text-neutral-600';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (!token) {
      setError('root', { type: 'server', message: 'Nedostaje token u linku.' });
      return;
    }
    try {
      await resetPassword({ token, newPassword: values.password }).unwrap();
      navigate('/login?reset=ok', { replace: true });
    } catch (e: unknown) {
      const { message } = parseApiError(e);
      setError('root', { type: 'server', message: friendlyResetMessage(message) });
    }
  }

  if (!token) {
    return (
      <SephoraAuthModal
        title="Nova lozinka"
        subtitle="Link za reset nije ispravan ili je istekao. Zatražite novi e-mail za reset."
        footer={<SephoraExistingUserFooter heading="Zatražite novi link" buttonLabel="Zaboravljena lozinka" buttonTo="/forgot-password" />}
      >
        <div className="mt-6 space-y-4">
          <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Koristite pun link iz poruke (ili loga u razvoju).
          </p>
          <Link to="/login" className={sephoraOutlineButtonClass}>
            Nazad na prijavu
          </Link>
        </div>
      </SephoraAuthModal>
    );
  }

  return (
    <SephoraAuthModal
      title="Nova lozinka"
      subtitle={
        <>
          Izaberite novu lozinku.{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={`${sephoraLinkBlueClass} inline bg-transparent p-0 font-normal hover:underline`}
          >
            Prijava
          </button>
        </>
      }
      footer={<SephoraExistingUserFooter heading="Treba vam novi link?" buttonLabel="Zaboravljena lozinka" buttonTo="/forgot-password" />}
    >
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-6 space-y-4">
        {errors.root ? (
          <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {errors.root.message}
          </p>
        ) : null}
        <div>
          <label htmlFor="reset-password" className={labelCls}>
            Nova lozinka
          </label>
          <div className="relative mt-1">
            <input
              id="reset-password"
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
        </div>
        <div>
          <label htmlFor="reset-confirm" className={labelCls}>
            Potvrda lozinke
          </label>
          <div className="relative mt-1">
            <input
              id="reset-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              className={`${sephoraInputClass} pr-11`}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-neutral-500 hover:bg-neutral-200/80 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Sakrij potvrdu' : 'Prikaži potvrdu'}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
        <button type="submit" disabled={isLoading} className={sephoraPrimaryButtonClass}>
          {isLoading ? 'Čuvam…' : 'Sačuvaj lozinku'}
        </button>
      </form>
    </SephoraAuthModal>
  );
}

function friendlyResetMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid') && m.includes('expired')) {
    return 'Link nije ispravan ili je istekao. Zatražite novi reset lozinke.';
  }
  return message;
}
