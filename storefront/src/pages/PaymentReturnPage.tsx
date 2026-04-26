import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';

import { useGetPaymentStatusQuery } from '@/features/api/orderEndpoints';

export function PaymentReturnPage() {
  const [params] = useSearchParams();
  const status = params.get('status');
  const orderId = params.get('orderId');
  const ref = params.get('ref');
  const orderIdNum = orderId ? Number(orderId) : undefined;

  const { data: paymentStatus, isLoading } = useGetPaymentStatusQuery(orderIdNum!, {
    skip: !orderIdNum,
    pollingInterval: 2000,
  });

  const settled = paymentStatus && paymentStatus.paymentStatus !== 'PENDING';
  const isSuccess = status === 'AUTHORIZED' || status === 'success' || paymentStatus?.externalStatus === 'AUTHORIZED';
  const isFailed = status === 'DECLINED' || status === 'FAILED' || status === 'failure'
    || paymentStatus?.externalStatus === 'DECLINED' || paymentStatus?.externalStatus === 'FAILED';

  return (
    <div className="mx-auto max-w-lg py-8">
      <Helmet>
        <title>Rezultat plaćanja · Beauty Health</title>
      </Helmet>

      {isLoading && (
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-neutral-200" />
          <div className="h-32 rounded bg-neutral-200" />
        </div>
      )}

      {!isLoading && isSuccess && (
        <>
          <h1 className="text-2xl font-semibold text-emerald-800">Plaćanje uspešno</h1>
          <p className="mt-2 text-sm text-neutral-600">Vaša narudžbina je potvrđena.</p>
          <dl className="mt-6 space-y-3 rounded-xl border border-neutral-200 bg-white p-6 text-sm shadow-sm">
            {orderId && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Narudžbina</dt>
                <dd className="font-medium text-neutral-900">#{orderId}</dd>
              </div>
            )}
            {ref && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Referenca plaćanja</dt>
                <dd className="font-mono text-xs text-neutral-700">{ref}</dd>
              </div>
            )}
            {paymentStatus && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Status</dt>
                <dd className="text-neutral-800">{paymentStatus.paymentStatus}</dd>
              </div>
            )}
          </dl>
        </>
      )}

      {!isLoading && isFailed && (
        <>
          <h1 className="text-2xl font-semibold text-red-800">Plaćanje neuspešno</h1>
          <p className="mt-2 text-sm text-neutral-600">Nažalost, plaćanje nije prošlo. Pokušajte ponovo ili odaberite pouzeće.</p>
        </>
      )}

      {!isLoading && !isSuccess && !isFailed && !settled && (
        <>
          <h1 className="text-2xl font-semibold text-neutral-800">Obrada plaćanja</h1>
          <p className="mt-2 text-sm text-neutral-600">Čekamo potvrdu od banke...</p>
        </>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          Na početnu
        </Link>
        <Link to="/account" className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50">
          Moj nalog
        </Link>
      </div>
    </div>
  );
}
