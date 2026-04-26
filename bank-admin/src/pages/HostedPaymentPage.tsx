import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useGetHostedPaymentQuery,
  usePayCardMutation,
} from '../features/api/hostedEndpoints';

export function HostedPaymentPage() {
  const { paymentRef } = useParams<{ paymentRef: string }>();
  const { data: info, isLoading, error } = useGetHostedPaymentQuery(paymentRef ?? '');
  const [payCard, { isLoading: paying }] = usePayCardMutation();
  const [pan, setPan] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');
  const [result, setResult] = useState<{ status: string; returnUrl: string } | null>(null);
  const [payError, setPayError] = useState('');

  if (isLoading) return <div className="h-32 animate-pulse rounded bg-neutral-200" />;
  if (error || !info)
    return <div className="text-red-600">Plaćanje nije pronađeno ili je isteklo.</div>;

  if (info.status !== 'CREATED') {
    return (
      <div className="text-center">
        <h2 className="text-lg font-semibold text-neutral-800">Plaćanje je već obrađeno</h2>
        <p className="mt-2 text-sm text-neutral-500">Status: {info.status}</p>
      </div>
    );
  }

  if (result) {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = result.returnUrl;
      }, 2000);
    }
    return (
      <div className="text-center">
        <h2
          className={`text-lg font-semibold ${result.status === 'AUTHORIZED' ? 'text-emerald-700' : 'text-red-700'}`}
        >
          {result.status === 'AUTHORIZED' ? 'Plaćanje uspešno' : 'Plaćanje odbijeno'}
        </h2>
        <p className="mt-2 text-sm text-neutral-500">Preusmeravanje nazad na prodavnicu...</p>
      </div>
    );
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setPayError('');
    try {
      const res = await payCard({
        ref: paymentRef!,
        body: { pan, expMonth: Number(expMonth), expYear: Number(expYear), cvv, holderName },
      }).unwrap();
      setResult(res);
    } catch {
      setPayError('Plaćanje nije uspelo. Proverite podatke kartice.');
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-wide text-neutral-400">Banka Demo</p>
        <h1 className="mt-1 text-xl font-bold text-neutral-900">Plaćanje</h1>
      </div>
      <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-500">Prodavnica</span>
          <span className="font-medium">{info.merchantName}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-neutral-500">Narudžbina</span>
          <span className="font-mono text-xs">{info.externalOrderId}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-neutral-500">Iznos</span>
          <span className="text-lg font-bold text-neutral-900">{info.amount.formatted}</span>
        </div>
      </div>
      {payError && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{payError}</p>
      )}
      <form onSubmit={handlePay} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-600">Broj kartice</label>
          <input
            value={pan}
            onChange={(e) => setPan(e.target.value)}
            placeholder="4242424242424242"
            maxLength={19}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm tracking-wider outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-600">Mesec</label>
            <input
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
              placeholder="12"
              maxLength={2}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600">Godina</label>
            <input
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
              placeholder="2028"
              maxLength={4}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600">CVV</label>
            <input
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
              maxLength={4}
              type="password"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600">Ime na kartici</label>
          <input
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="DEMO KORISNIK"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>
        <button
          type="submit"
          disabled={paying}
          className="w-full rounded-md bg-emerald-700 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {paying ? 'Obrada...' : `Plati ${info.amount.formatted}`}
        </button>
      </form>
    </div>
  );
}
