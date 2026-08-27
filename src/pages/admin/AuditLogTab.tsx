import { History } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { fetchAuditLogs } from '../../services/cms';
import { formatDateTime } from '../../lib/utils';
import { EmptyState, ErrorBox, Spinner } from '../../components/ui';

export function AuditLogTab() {
  const query = useQuery(() => fetchAuditLogs(), []);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <History className="w-4 h-4 text-brand-400" /> Audit Trail
      </h3>

      {query.loading ? (
        <Spinner />
      ) : query.error ? (
        <ErrorBox message={query.error} onRetry={() => void query.refetch()} />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState message="No audit activity yet." icon={<History className="w-14 h-14 opacity-30" />} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-white/10">
                <th className="py-2 pr-4 font-medium">When</th>
                <th className="py-2 pr-4 font-medium">Admin</th>
                <th className="py-2 pr-4 font-medium">Action</th>
                <th className="py-2 pr-4 font-medium">Target</th>
                <th className="py-2 pr-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {(query.data ?? []).map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4 text-gray-400 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                  <td className="py-2.5 px-4 text-gray-300">{log.admin_email || '—'}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-xs uppercase tracking-wide bg-white/5 px-2 py-0.5 rounded-full">{log.action}</span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-400">{log.target} <span className="text-gray-600">{log.target_id}</span></td>
                  <td className="py-2.5 px-4 text-gray-400 max-w-[320px] truncate">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}