import { useState } from 'react';
import {
  useGetMerchantsQuery,
  useCreateMerchantMutation,
  useIssueCredentialMutation,
  useRevealCredentialMutation,
  useRevokeCredentialMutation,
  useGetMerchantQuery,
} from '../features/api/merchantEndpoints';
import type { IssueCredentialResponse, RevealResponse } from '../features/api/merchantEndpoints';

export function MerchantsPage() {
  const { data: merchants, isLoading } = useGetMerchantsQuery();
  const [createMerchant] = useCreateMerchantMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (isLoading) return <div className="h-32 animate-pulse rounded bg-neutral-200" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Merchant-i</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Novi merchant
        </button>
      </div>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
            <th className="pb-2">ID</th>
            <th className="pb-2">Naziv</th>
            <th className="pb-2">Slug</th>
            <th className="pb-2">Signing</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {(merchants ?? []).map((m) => (
            <tr key={m.id} className="border-b border-neutral-100">
              <td className="py-2">{m.id}</td>
              <td className="py-2">{m.name}</td>
              <td className="py-2 font-mono text-xs">{m.slug}</td>
              <td className="py-2">{m.signingMode}</td>
              <td className="py-2">{m.status}</td>
              <td className="py-2">
                <button
                  onClick={() => setSelectedId(m.id)}
                  className="text-sm text-neutral-600 underline"
                >
                  Detalji
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showCreate && (
        <CreateMerchantModal
          onClose={() => setShowCreate(false)}
          onCreate={async (data) => {
            await createMerchant(data).unwrap();
            setShowCreate(false);
          }}
        />
      )}
      {selectedId && (
        <MerchantDetailModal merchantId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function CreateMerchantModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    slug: string;
    returnUrlSuccess?: string;
    returnUrlFailure?: string;
    webhookUrl?: string;
    signingMode: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [returnSuccess, setReturnSuccess] = useState('');
  const [returnFailure, setReturnFailure] = useState('');
  const [signingMode, setSigningMode] = useState('RSA');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Novi merchant</h2>
        <div className="mt-4 space-y-3">
          <input
            placeholder="Naziv"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Webhook URL"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Return URL (success)"
            value={returnSuccess}
            onChange={(e) => setReturnSuccess(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Return URL (failure)"
            value={returnFailure}
            onChange={(e) => setReturnFailure(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <select
            value={signingMode}
            onChange={(e) => setSigningMode(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="RSA">RSA</option>
            <option value="HMAC">HMAC</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm"
          >
            Otkaži
          </button>
          <button
            onClick={() =>
              onCreate({
                name,
                slug,
                webhookUrl: webhookUrl || undefined,
                returnUrlSuccess: returnSuccess || undefined,
                returnUrlFailure: returnFailure || undefined,
                signingMode,
              })
            }
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Kreiraj
          </button>
        </div>
      </div>
    </div>
  );
}

function MerchantDetailModal({
  merchantId,
  onClose,
}: {
  merchantId: number;
  onClose: () => void;
}) {
  const { data: merchant, isLoading } = useGetMerchantQuery(merchantId);
  const [issueCredential] = useIssueCredentialMutation();
  const [revealCredential] = useRevealCredentialMutation();
  const [revokeCredential] = useRevokeCredentialMutation();
  const [issued, setIssued] = useState<IssueCredentialResponse | null>(null);
  const [revealed, setRevealed] = useState<RevealResponse | null>(null);

  if (isLoading || !merchant) return null;

  async function handleIssue(type: string) {
    const res = await issueCredential({
      merchantId,
      body: { type, validityDays: 365 },
    }).unwrap();
    setIssued(res);
  }

  async function handleReveal(credId: number) {
    const res = await revealCredential({ merchantId, credentialId: credId }).unwrap();
    setRevealed(res);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{merchant.name}</h2>
        <p className="text-sm text-neutral-500">
          Slug: {merchant.slug} · Signing: {merchant.signingMode} · Webhook:{' '}
          {merchant.webhookUrl ?? 'N/A'}
        </p>
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Kredencijali</h3>
            <button
              onClick={() => handleIssue('RSA_KEYPAIR')}
              className="rounded bg-neutral-800 px-2 py-1 text-xs text-white"
            >
              Izdaj RSA
            </button>
            <button
              onClick={() => handleIssue('HMAC_SECRET')}
              className="rounded bg-neutral-700 px-2 py-1 text-xs text-white"
            >
              Izdaj HMAC
            </button>
          </div>
          <table className="mt-2 w-full text-xs">
            <thead>
              <tr className="text-left text-neutral-500">
                <th>Serial</th>
                <th>Tip</th>
                <th>Fingerprint</th>
                <th>Važi do</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(merchant.credentials ?? []).map((c) => (
                <tr key={c.id} className="border-b border-neutral-100">
                  <td className="py-1 font-mono">{c.serial.substring(0, 8)}...</td>
                  <td className="py-1">{c.type}</td>
                  <td className="py-1 font-mono">
                    {c.fingerprintSha256 ? c.fingerprintSha256.substring(0, 16) + '...' : '-'}
                  </td>
                  <td className="py-1">{new Date(c.validTo).toLocaleDateString('sr')}</td>
                  <td className="py-1">{c.revokedAt ? 'REVOKED' : 'ACTIVE'}</td>
                  <td className="py-1 space-x-1">
                    {!c.revokedAt && (
                      <button
                        onClick={() => handleReveal(c.id)}
                        className="text-neutral-600 underline"
                      >
                        Reveal
                      </button>
                    )}
                    {!c.revokedAt && (
                      <button
                        onClick={async () => {
                          await revokeCredential({
                            merchantId,
                            credentialId: c.id,
                          }).unwrap();
                        }}
                        className="text-red-600 underline"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {issued && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <h4 className="text-sm font-semibold text-emerald-800">
              Kredencijal izdat (sacuvajte odmah!)
            </h4>
            <p className="mt-1 text-xs text-neutral-600">Serial: {issued.serial}</p>
            {issued.privateKeyPem && (
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-white p-2 text-xs">
                {issued.privateKeyPem}
              </pre>
            )}
            {issued.hmacSecret && (
              <pre className="mt-2 rounded bg-white p-2 text-xs">{issued.hmacSecret}</pre>
            )}
            {issued.publicKeyPem && (
              <>
                <p className="mt-2 text-xs text-neutral-500">Public key:</p>
                <pre className="mt-1 max-h-40 overflow-auto rounded bg-white p-2 text-xs">
                  {issued.publicKeyPem}
                </pre>
              </>
            )}
            <button
              onClick={() => {
                setIssued(null);
                navigator.clipboard.writeText(issued.privateKeyPem ?? issued.hmacSecret ?? '');
              }}
              className="mt-2 rounded bg-neutral-900 px-3 py-1 text-xs text-white"
            >
              Kopiraj i zatvori
            </button>
          </div>
        )}
        {revealed && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="text-sm font-semibold text-blue-800">Reveal (jednokratno)</h4>
            {revealed.privateKeyPem && (
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-white p-2 text-xs">
                {revealed.privateKeyPem}
              </pre>
            )}
            {revealed.hmacSecret && (
              <pre className="mt-2 rounded bg-white p-2 text-xs">{revealed.hmacSecret}</pre>
            )}
            <button
              onClick={() => setRevealed(null)}
              className="mt-2 rounded bg-neutral-900 px-3 py-1 text-xs text-white"
            >
              Zatvori
            </button>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}
