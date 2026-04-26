import { useState } from 'react';
import { useGetTransactionsQuery } from '../features/api/transactionEndpoints';

export function TransactionsPage() {
  const [status, setStatus] = useState<string | undefined>();
  const { data: txs, isLoading } = useGetTransactionsQuery({ status });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Transakcije</h1>
      <div className="mt-4 flex gap-3">
        <select
          value={status ?? ''}
          onChange={(e) => setStatus(e.target.value || undefined)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">Svi statusi</option>
          <option value="CREATED">CREATED</option>
          <option value="AUTHORIZED">AUTHORIZED</option>
          <option value="DECLINED">DECLINED</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>
      {isLoading ? (
        <div className="mt-4 h-32 animate-pulse rounded bg-neutral-200" />
      ) : (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
              <th className="pb-2">Ref</th>
              <th className="pb-2">Merchant</th>
              <th className="pb-2">Order</th>
              <th className="pb-2">Iznos</th>
              <th className="pb-2">Intent</th>
              <th className="pb-2">Card Tx</th>
              <th className="pb-2">Vreme</th>
            </tr>
          </thead>
          <tbody>
            {(txs ?? []).map((t) => (
              <tr key={t.id} className="border-b border-neutral-100">
                <td className="py-2 font-mono text-xs">{t.paymentRef.substring(0, 8)}...</td>
                <td className="py-2">{t.merchantName}</td>
                <td className="py-2 font-mono text-xs">{t.externalOrderId}</td>
                <td className="py-2">{t.amount.formatted}</td>
                <td className="py-2">{t.intentStatus}</td>
                <td className="py-2">{t.cardTransactionStatus ?? '-'}</td>
                <td className="py-2 text-neutral-500">
                  {new Date(t.processedAt).toLocaleString('sr')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
