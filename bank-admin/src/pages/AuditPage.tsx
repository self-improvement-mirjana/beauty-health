import { useGetAuditLogQuery } from '../features/api/auditEndpoints';

export function AuditPage() {
  const { data: entries, isLoading } = useGetAuditLogQuery({ page: 0, size: 100 });

  if (isLoading) return <div className="h-32 animate-pulse rounded bg-neutral-200" />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Audit Log</h1>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
            <th className="pb-2">ID</th>
            <th className="pb-2">Aktor</th>
            <th className="pb-2">Akcija</th>
            <th className="pb-2">Target</th>
            <th className="pb-2">Vreme</th>
          </tr>
        </thead>
        <tbody>
          {(entries ?? []).map((e) => (
            <tr key={e.id} className="border-b border-neutral-100">
              <td className="py-2">{e.id}</td>
              <td className="py-2 text-xs">
                {e.actorType}:{e.actorId}
              </td>
              <td className="py-2">{e.action}</td>
              <td className="py-2 text-xs">{e.target ?? '-'}</td>
              <td className="py-2 text-neutral-500">
                {new Date(e.createdAt).toLocaleString('sr')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
