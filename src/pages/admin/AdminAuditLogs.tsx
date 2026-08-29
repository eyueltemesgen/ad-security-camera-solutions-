import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';
import { AdminError, LoadingBlock, Table, Th, Td, PaginationControls } from './AdminUi';
import { formatDate } from '../../components/ui';
import type { AuditLog } from '../../types';

const PAGE_SIZE = 40;
const ACTIONS = ['all', 'admin_login', 'product_created', 'product_updated', 'product_deleted', 'stock_updated', 'category_created', 'service_created', 'order_status_changed', 'service_request_updated', 'customer_updated', 'setting_updated', 'page_updated', 'homepage_updated', 'media_uploaded', 'admin_created', 'message_updated'];

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), per_page: String(PAGE_SIZE), action });
      const r = await apiGet<{ logs: AuditLog[]; total: number }>(`/api/admin/audit-logs?${qs}`);
      setLogs(r.logs);
      setTotal(r.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, action]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Audit Logs</h1>
      <p className="mb-6 text-sm text-slate-500">A record of every important action taken by admins.</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select className="input input-sm" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
          {ACTIONS.map((a) => <option key={a} value={a}>{a === 'all' ? 'All actions' : a.replace(/_/g, ' ')}</option>)}
        </select>
        <span className="text-xs text-slate-400">{total} records</span>
      </div>

      {error && <AdminError error={error} />}
      {loading ? (
        <LoadingBlock />
      ) : (
        <>
          <Table head={<><Th>When</Th><Th>Admin</Th><Th>Action</Th><Th>Target</Th><Th>Description</Th><Th>Details</Th></>}>
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <Td className="whitespace-nowrap text-slate-500">{formatDate(l.created_at)}</Td>
                <Td className="text-slate-600">{l.admin_name}</Td>
                <Td><span className="badge badge-option">{l.action.replace(/_/g, ' ')}</span></Td>
                <Td className="text-slate-500">{l.target_type}{l.target_id ? ` · ${String(l.target_id).slice(0, 8)}` : ''}</Td>
                <Td className="max-w-sm text-slate-600">{l.description}</Td>
                <Td>
                  {(l.old_value !== undefined && l.old_value !== null) || (l.new_value !== undefined && l.new_value !== null) ? (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-[var(--primary)]">View</summary>
                      <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-2 text-[10px] text-slate-500">{JSON.stringify({ old: l.old_value, new: l.new_value }, null, 2)}</pre>
                    </details>
                  ) : '—'}
                </Td>
              </tr>
            ))}
          </Table>
          <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}