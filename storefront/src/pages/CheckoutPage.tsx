import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useGetCartQuery } from '@/features/api/cartEndpoints';
import { useGetCmsPageQuery } from '@/features/api/contentEndpoints';
import { useCreateOrderMutation } from '@/features/api/orderEndpoints';
import type { CreateOrderResponseDto } from '@/features/order/types';
import { formatRsd } from '@/lib/money';
import { mapApiDetailsToFieldErrors } from '@/lib/mapApiFieldErrors';
import { parseApiError } from '@/lib/parseApiError';
import { stripHtmlToPlainText } from '@/lib/stripHtml';

const SHIPPING_CMS_SLUG = 'isporuka';

const SHIPPING_FALLBACK =
  'Rokovi isporuke zavise od kurira i destinacije. Standardno: obrada porudžbine 1–3 radna dana, isporuka 4–6 radnih dana. Tačan tekst snima se na narudžbinu iz konfiguracije backenda (B07).';

const checkoutSchema = z.object({
  recipientName: z.string().min(1, 'Unesite primaoca.').max(255),
  recipientPhone: z.string().min(1, 'Unesite telefon.').max(64),
  addressLine1: z.string().min(1, 'Unesite adresu.').max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1, 'Unesite grad.').max(128),
  postalCode: z.string().min(1, 'Unesite poštanski broj.').max(32),
  countryCode: z.string().length(2, 'Država: tačno 2 znaka (ISO, npr. RS).'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const inputCls =
  'mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading: cartLoading } = useGetCartQuery();
  const { data: shippingPage } = useGetCmsPageQuery(SHIPPING_CMS_SLUG);
  const [createOrder, { isLoading: submitting }] = useCreateOrderMutation();
  const [orderDone, setOrderDone] = useState<CreateOrderResponseDto | null>(null);
  const orderDoneRef = useRef(false);
  const orderSubmitInFlightRef = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      countryCode: 'RS',
      addressLine2: '',
    },
  });

  useEffect(() => {
    if (orderDone || orderDoneRef.current) {
      return;
    }
    if (!cartLoading && cart?.empty && !orderSubmitInFlightRef.current) {
      navigate('/cart', { replace: true });
    }
  }, [cart?.empty, cartLoading, navigate, orderDone]);

  const shippingPlain = shippingPage ? stripHtmlToPlainText(shippingPage.bodyMarkdown) : '';
  const shippingIntro = shippingPlain || SHIPPING_FALLBACK;

  async function onSubmit(values: CheckoutForm) {
    try {
      const body = {
        recipientName: values.recipientName.trim(),
        recipientPhone: values.recipientPhone.trim(),
        addressLine1: values.addressLine1.trim(),
        addressLine2: values.addressLine2?.trim() ? values.addressLine2.trim() : null,
        city: values.city.trim(),
        postalCode: values.postalCode.trim(),
        countryCode: values.countryCode.trim().toUpperCase(),
        paymentMethod,
      };
      orderSubmitInFlightRef.current = true;
      const res = await createOrder(body).unwrap();
      if (res.paymentRedirectUrl) {
        window.location.href = res.paymentRedirectUrl;
        return;
      }
      orderDoneRef.current = true;
      setOrderDone(res);
    } catch (e: unknown) {
      orderSubmitInFlightRef.current = false;
      const { message, details } = parseApiError(e);
      const fieldMap = mapApiDetailsToFieldErrors(details);
      let applied = false;
      for (const key of [
        'recipientName',
        'recipientPhone',
        'addressLine1',
        'addressLine2',
        'city',
        'postalCode',
        'countryCode',
      ] as const) {
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

  if (orderDone) {
    return (
      <div className="mx-auto max-w-lg">
        <Helmet>
          <title>{`Narudžbina #${orderDone.orderId} · Beauty Health`}</title>
          <meta name="description" content={`Potvrda narudžbine ${orderDone.orderId}.`} />
        </Helmet>
        <h1 className="text-2xl font-semibold text-emerald-800">Hvala na porudžbini</h1>
        <p className="mt-2 text-sm text-neutral-600">Narudžbina je kreirana (B07).</p>
        <dl className="mt-8 space-y-3 rounded-xl border border-neutral-200 bg-white p-6 text-sm shadow-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Broj narudžbine</dt>
            <dd className="font-medium text-neutral-900">#{orderDone.orderId}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Status</dt>
            <dd className="text-neutral-800">{orderDone.status}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Ukupno</dt>
            <dd className="font-semibold text-neutral-900">{formatRsd(orderDone.total)}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Isporuka</dt>
            <dd className="mt-1 text-neutral-700">{orderDone.deliverySummaryText}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          >
            Na početnu
          </Link>
          <Link
            to="/account"
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50"
          >
            Moj nalog
          </Link>
        </div>
      </div>
    );
  }

  if (cartLoading || !cart || cart.empty) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true">
        <div className="h-8 w-64 rounded bg-neutral-200" />
        <div className="h-48 w-full max-w-xl rounded bg-neutral-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Helmet>
        <title>Poručivanje · Beauty Health</title>
        <meta name="description" content="Završetak kupovine — adresa isporuke i potvrda porudžbine." />
      </Helmet>
      <h1 className="text-2xl font-semibold text-neutral-900">Poručivanje</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Korpa: {cart.totalQuantity} stavki · međuzbir <span className="font-medium text-neutral-900">{formatRsd(cart.subtotal)}</span>
      </p>

      <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-700 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Rokovi isporuke (7.2)</h2>
        <p className="mt-2 leading-relaxed text-neutral-700">{shippingIntro}</p>
        {shippingPage ? (
          <p className="mt-2 text-xs text-neutral-500">
            Detaljnije:{' '}
            <Link to={`/pages/${encodeURIComponent(SHIPPING_CMS_SLUG)}`} className="text-neutral-900 underline underline-offset-2">
              stranica „Isporuka”
            </Link>
            .
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs text-neutral-500">
        Polja ispod odgovaraju trenutnom DTO-u <span className="font-medium text-neutral-700">CreateOrderRequest</span> (B07). Napomena uz porudžbinu, alternativna adresa, PIB —{' '}
        <span className="text-neutral-600">faza 2 (TBD 7.3)</span>.
      </p>

      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-6 space-y-4">
        {errors.root ? (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {errors.root.message}
          </p>
        ) : null}
        <div>
          <label htmlFor="co-name" className="block text-sm font-medium text-neutral-800">
            Ime i prezime primaoca
          </label>
          <input id="co-name" className={inputCls} {...register('recipientName')} />
          {errors.recipientName ? <p className="mt-1 text-xs text-red-600">{errors.recipientName.message}</p> : null}
        </div>
        <div>
          <label htmlFor="co-phone" className="block text-sm font-medium text-neutral-800">
            Telefon
          </label>
          <input
            id="co-phone"
            type="tel"
            autoComplete="tel"
            className={inputCls}
            {...register('recipientPhone')}
          />
          {errors.recipientPhone ? <p className="mt-1 text-xs text-red-600">{errors.recipientPhone.message}</p> : null}
        </div>
        <div>
          <label htmlFor="co-a1" className="block text-sm font-medium text-neutral-800">
            Adresa (linija 1)
          </label>
          <input id="co-a1" autoComplete="address-line1" className={inputCls} {...register('addressLine1')} />
          {errors.addressLine1 ? <p className="mt-1 text-xs text-red-600">{errors.addressLine1.message}</p> : null}
        </div>
        <div>
          <label htmlFor="co-a2" className="block text-sm font-medium text-neutral-800">
            Adresa (linija 2, opciono)
          </label>
          <input id="co-a2" autoComplete="address-line2" className={inputCls} {...register('addressLine2')} />
          {errors.addressLine2 ? <p className="mt-1 text-xs text-red-600">{errors.addressLine2.message}</p> : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="co-city" className="block text-sm font-medium text-neutral-800">
              Grad
            </label>
            <input id="co-city" autoComplete="address-level2" className={inputCls} {...register('city')} />
            {errors.city ? <p className="mt-1 text-xs text-red-600">{errors.city.message}</p> : null}
          </div>
          <div>
            <label htmlFor="co-post" className="block text-sm font-medium text-neutral-800">
              Poštanski broj
            </label>
            <input id="co-post" autoComplete="postal-code" className={inputCls} {...register('postalCode')} />
            {errors.postalCode ? <p className="mt-1 text-xs text-red-600">{errors.postalCode.message}</p> : null}
          </div>
        </div>
        <div>
          <label htmlFor="co-country" className="block text-sm font-medium text-neutral-800">
            Država (ISO-3166 alpha-2)
          </label>
          <select id="co-country" className={inputCls} {...register('countryCode')}>
            <option value="RS">Srbija (RS)</option>
            <option value="ME">Crna Gora (ME)</option>
            <option value="BA">Bosna i Hercegovina (BA)</option>
            <option value="HR">Hrvatska (HR)</option>
            <option value="MK">Severna Makedonija (MK)</option>
          </select>
          {errors.countryCode ? <p className="mt-1 text-xs text-red-600">{errors.countryCode.message}</p> : null}
        </div>

        <fieldset className="space-y-2">
          <legend className="block text-sm font-medium text-neutral-800">Način plaćanja</legend>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'}
              onChange={() => setPaymentMethod('COD')} className="accent-neutral-900" />
            Pouzeće (COD)
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="radio" name="paymentMethod" value="CARD" checked={paymentMethod === 'CARD'}
              onChange={() => setPaymentMethod('CARD')} className="accent-neutral-900" />
            Kartica (online plaćanje)
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        >
          {submitting ? 'Slanje…' : 'Potvrdi porudžbinu'}
        </button>
      </form>
    </div>
  );
}
