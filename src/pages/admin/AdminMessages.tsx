import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPatch } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, SearchBox, Toolbar, Table, Th, Td, PaginationControls } from './AdminUi';
import { formatDate } from '../../components/ui';
import type { ContactMessage } from '../../types';

const PAGE_SIZE = 25;
const STATUSES = ['new', 'read', 'responded', 'archived'] as const;

export default function AdminMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), per_page: String(PAGE_SIZE), search, status: statusFilter });
      const r = await apiGet<{ messages: ContactMessage[]; total: number }>(`/api/admin/messages?${qs}`);
      setMessages(r.messages);
      setTotal(r.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const saveStatus = async (m: ContactMessage, s: ContactMessage['status']) => {
    try {
      await apiPatch(`/api/admin/messages/${m.id}`, { status: s });
      setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, status: s } : x)));
      if (selected?.id === m.id) setSelected({ ...selected, status: s });
      toast(`Marked ${s}`);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const remove = async (m: ContactMessage) => {
    if (!window.confirm(`Delete message from ${m.name}?`)) return;
    try {
      await apiDelete(`/api/admin/messages/${m.id}`);
      toast('Message deleted');
      if (selected?.id === m.id) setSelected(null);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Messages</h1>
      <p className="mb-6 text-sm text-slate-500">{total} contact messages from the website</p>

      <Toolbar>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, email, subject…" />
          <select className="input input-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </Toolbar>

      {error && <AdminError error={error} />}
      {loading ? (
        <LoadingBlock label="Loading messages…" />
      ) : (
        <>
          <Table head={<><Th>From</Th><Th>Subject</Th><Th>Status</Th><Th>Date</Th><Th /></>}>
            {messages.map((m) => (
              <tr key={m.id} className="cursor-pointer hover:bg-slate-50" onClick={() => { setSelected(m); if (m.status === 'new') saveStatus(m, 'read'); }}>
                <Td>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-slate-400">{m.email} {m.phone ? `· ${m.phone}` : ''}</div>
                </Td>
                <Td className={`max-w-md truncate ${m.status === 'new' ? 'font-semibold' : ''}`}>{m.subject || '—'}<div className="truncate text-xs font-normal text-slate-400">{m.message}</div></Td>
                <Td>
                  <span className={`badge ${m.status === 'new' ? 'status-pending' : m.status === 'read' ? 'status-confirmed' : m.status === 'responded' ? 'status-completed' : 'status-cancelled'}`}>{m.status}</span>
                </Td>
                <Td className="text-slate-500">{formatDate(m.created_at)}</Td>
                <Td className="text-right text-xs text-[var(--primary)]">Open</Td>
              </tr>
            ))}
          </Table>
          <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">{selected.subject || 'General Message'}</h2>
                <p className="text-xs text-slate-500">{formatDate(selected.created_at)}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div>
                <p className="text-sm text-slate-400">From</p>
                <p className="font-medium">{selected.name} · {selected.email} {selected.phone ? `· ${selected.phone}` : ''}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Message</p>
                <p className="whitespace-pre-wrap text-slate-700">{selected.message}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {STATUSES.map((s) => (
                  <button key={s} className={`badge cursor-pointer ${s === selected.status ? 'badge-active' : 'badge-option'}`} onClick={() => saveStatus(selected, s)}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </button>
                ))}
                <button className="btn btn-ghost btn-sm ml-auto text-red-600" onClick={() => remove(selected)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}