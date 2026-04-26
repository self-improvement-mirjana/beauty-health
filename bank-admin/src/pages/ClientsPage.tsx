import { useState } from 'react';
import {
  useGetClientsQuery,
  useCreateClientMutation,
  useIssueCardMutation,
  useTopupCardMutation,
} from '../features/api/clientEndpoints';
import type { BankClientDto, VirtualCardDto } from '../features/api/clientEndpoints';

export function ClientsPage() {
  const { data: clients, isLoading } = useGetClientsQuery();
  const [createClient] = useCreateClientMutation();
  const [issueCard] = useIssueCardMutation();
  const [topupCard] = useTopupCardMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<BankClientDto | null>(null);
  const [showIssueCard, setShowIssueCard] = useState(false);
  const [showTopup, setShowTopup] = useState<VirtualCardDto | null>(null);

  if (isLoading) return <div className="h-32 animate-pulse rounded bg-neutral-200" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Klijenti</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Novi klijent
        </button>
      </div>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
            <th className="pb-2">ID</th>
            <th className="pb-2">Ime</th>
            <th className="pb-2">Email</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {(clients ?? []).map((c) => (
            <tr key={c.id} className="border-b border-neutral-100">
              <td className="py-2">{c.id}</td>
              <td className="py-2">{c.fullName}</td>
              <td className="py-2">{c.email}</td>
              <td className="py-2">{c.status}</td>
              <td className="py-2">
                <button
                  onClick={() => setSelected(c)}
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
        <CreateClientModal
          onClose={() => setShowCreate(false)}
          onCreate={async (data) => {
            await createClient(data).unwrap();
            setShowCreate(false);
          }}
        />
      )}
      {selected && (
        <ClientDetailModal
          client={selected}
          onClose={() => {
            setSelected(null);
            setShowIssueCard(false);
            setShowTopup(null);
          }}
          onIssueCard={() => setShowIssueCard(true)}
          onTopup={(card) => setShowTopup(card)}
        />
      )}
      {showIssueCard && selected && (
        <IssueCardModal
          clientId={selected.id}
          onClose={() => setShowIssueCard(false)}
          onIssue={async (data) => {
            await issueCard({ clientId: selected.id, body: data }).unwrap();
            setShowIssueCard(false);
            setSelected(null);
          }}
        />
      )}
      {showTopup && (
        <TopupModal
          card={showTopup}
          onClose={() => setShowTopup(null)}
          onTopup={async (amount) => {
            await topupCard({ cardId: showTopup.id, body: { amount } }).unwrap();
            setShowTopup(null);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function CreateClientModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { fullName: string; email: string; taxId?: string }) => Promise<void>;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Novi klijent</h2>
        <div className="mt-4 space-y-3">
          <input
            placeholder="Ime i prezime"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="PIB (opciono)"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm"
          >
            Otkaži
          </button>
          <button
            onClick={() => onCreate({ fullName, email, taxId: taxId || undefined })}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Kreiraj
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientDetailModal({
  client,
  onClose,
  onIssueCard,
  onTopup,
}: {
  client: BankClientDto;
  onClose: () => void;
  onIssueCard: () => void;
  onTopup: (card: VirtualCardDto) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{client.fullName}</h2>
        <p className="text-sm text-neutral-500">
          {client.email} · {client.status}
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Kartice</h3>
            <button
              onClick={onIssueCard}
              className="rounded-md bg-neutral-900 px-3 py-1 text-xs text-white"
            >
              Izdaj karticu
            </button>
          </div>
          {(client.cards ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-neutral-400">Nema kartica.</p>
          ) : (
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-500">
                  <th>PAN</th>
                  <th>Ističe</th>
                  <th>Balans</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(client.cards ?? []).map((card) => (
                  <tr key={card.id} className="border-b border-neutral-100">
                    <td className="py-1 font-mono">****{card.panLast4}</td>
                    <td className="py-1">
                      {card.expMonth}/{card.expYear}
                    </td>
                    <td className="py-1">{card.balance.formatted}</td>
                    <td className="py-1">{card.status}</td>
                    <td className="py-1">
                      <button
                        onClick={() => onTopup(card)}
                        className="text-xs text-neutral-600 underline"
                      >
                        Top-up
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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

function IssueCardModal({
  clientId,
  onClose,
  onIssue,
}: {
  clientId: number;
  onClose: () => void;
  onIssue: (data: {
    holderName: string;
    initialBalance: number;
    expMonths: number;
  }) => Promise<void>;
}) {
  const [holderName, setHolderName] = useState('');
  const [balance, setBalance] = useState('10000');
  const [months, setMonths] = useState('24');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Izdaj karticu (klijent #{clientId})</h2>
        <div className="mt-4 space-y-3">
          <input
            placeholder="Ime na kartici"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Početni balans (RSD)"
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Validnost (meseci)"
            type="number"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
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
              onIssue({
                holderName,
                initialBalance: Number(balance),
                expMonths: Number(months),
              })
            }
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Izdaj
          </button>
        </div>
      </div>
    </div>
  );
}

function TopupModal({
  card,
  onClose,
  onTopup,
}: {
  card: VirtualCardDto;
  onClose: () => void;
  onTopup: (amount: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState('5000');
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">Top-up ****{card.panLast4}</h2>
        <p className="text-sm text-neutral-500">Trenutni balans: {card.balance.formatted}</p>
        <div className="mt-4">
          <input
            placeholder="Iznos (RSD)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm"
          >
            Otkaži
          </button>
          <button
            onClick={() => onTopup(Number(amount))}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Dopuni
          </button>
        </div>
      </div>
    </div>
  );
}
