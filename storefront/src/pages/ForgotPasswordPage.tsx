import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import {
  SephoraAuthModal,
  SephoraExistingUserFooter,
  sephoraInputClass,
  sephoraLinkBlueClass,
  sephoraPrimaryButtonClass,
} from '@/components/auth/AuthFormShell';
import { useForgotPasswordMutation } from '@/features/api/authEndpoints';
import { parseApiError } from '@/lib/parseApiError';

const schema = z.object({
  email: z.string().email('Unesite ispravan e-mail.'),
});

type FormValues = z.infer<typeof schema>;

const labelCls = 'block text-xs font-medium text-neutral-600';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      setSent(false);
      clearErrors('root');
      await forgotPassword({ email: values.email }).unwrap();
      reset();
      setSent(true);
    } catch (e: unknown) {
      setSent(false);
      const { message } = parseApiError(e);
      setError('root', { type: 'server', message });
    }
  }

  return (
    <SephoraAuthModal
      title="Zaboravljena lozinka"
      subtitle={
        <>
          Unesite e-adresu naloga. Poslaćemo uputstvo za reset.{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={`${sephoraLinkBlueClass} inline bg-transparent p-0 font-normal hover:underline`}
          >
            Nazad na prijavu
          </button>
        </>
      }
      footer={<SephoraExistingUserFooter heading="Imate nalog?" buttonLabel="Prijavi se" buttonTo="/login" />}
    >
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-6 space-y-4">
        {sent ? (
          <p role="status" className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Ako nalog postoji za ovu adresu, poslato je uputstvo za reset lozinke. U lokalnom razvoju proverite log API-ja (INFO) za link sa tokenom.
          </p>
        ) : null}
        {errors.root ? (
          <p role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {errors.root.message}
          </p>
        ) : null}
        <div>
          <label htmlFor="forgot-email" className={labelCls}>
            E-adresa
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="ime@primer.rs"
            className={`${sephoraInputClass} mt-1`}
            {...register('email')}
          />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
        </div>
        <button type="submit" disabled={isLoading} className={sephoraPrimaryButtonClass}>
          {isLoading ? 'Šaljem…' : 'Pošalji uputstvo'}
        </button>
      </form>
    </SephoraAuthModal>
  );
}
