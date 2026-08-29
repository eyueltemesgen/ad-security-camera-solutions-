import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, SearchBox, Toolbar, Table, Th, Td, PaginationControls } from './AdminUi';
import { statusBadge, formatDate } from '../../components/ui';
import { SERVICE_STATUSES } from '../../types';
import type { ServiceRequest } from '../../types';

const PAGE_SIZE = 20;

export default function AdminServiceRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), per_page: String(PAGE_SIZE), search, status });
      const r = await apiGet<{ requests: ServiceRequest[]; total: number }>(`/api/service-requests/all/admin?${qs}`);
      setRequests(r.requests);
      setTotal(r.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (id: string) => {
    try {
      const r = await apiGet<ServiceRequest>(`/api/service-requests/${id}`);
      setSelected(r);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const save = async (body: Record<string, unknown>) => {
    if (!selected) return;
    try {
      await apiPatch(`/api/service-requests/${selected.id}`, body);
      const r = await apiGet<ServiceRequest>(`/api/service-requests/${selected.id}`);
      setSelected(r);
      toast('Service request updated');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Service Requests</h1>
      <p className="mb-6 text-sm text-slate-500">{total} requests total</p>

      <Toolbar>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search request, customer, service…" />
          <select className="input input-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="all">All statuses</option>
            {SERVICE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </Toolbar>

      {error && <AdminError error={error} />}
      {loading ? (
        <LoadingBlock label="Loading requests…" />
      ) : (
        <>
          <Table head={<><Th>Request</Th><Th>Customer</Th><Th>Service</Th><Th>Location</Th><Th>Status</Th><Th>Date</Th><Th /></>}>
            {requests.map((r) => (
              <tr key={r.id} className="cursor-pointer hover:bg-slate-50" onClick={() => open(r.id)}>
                <Td className="font-semibold">{r.request_number}</Td>
                <Td><div className="font-medium">{r.customer_name}</div><div className="text-xs text-slate-400">{r.phone}</div></Td>
                <Td className="font-medium">{r.service_name}</Td>
                <Td className="text-slate-500">{r.location || '—'}</Td>
                <Td>{statusBadge(r.status)}</Td>
                <Td className="text-slate-500">{formatDate(r.created_at)}</Td>
                <Td className="text-right text-xs text-[var(--primary)]">Open</Td>
              </tr>
            ))}
          </Table>
          <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">{selected.request_number}</h2>
                <p className="text-xs text-slate-500">{selected.service_name} · {formatDate(selected.created_at)}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <label className="label">Status</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      className={`badge cursor-pointer ${s.value === selected.status ? 'badge-active' : 'badge-option'}`}
                      onClick={() => save({ status: s.value })}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Assigned Technician</label>
                  <input className="input" defaultValue={selected.assigned_technician} placeholder="e.g. Dawit K." onBlur={(e) => e.target.value !== selected.assigned_technician && save({ assigned_technician: e.target.value })} />
                </div>
                <div>
                  <label className="label">Scheduled Date</label>
                  <input className="input" type="date" defaultValue={selected.scheduled_date?.slice(0, 10) ?? ''} onBlur={(e) => e.target.value !== (selected.scheduled_date?.slice(0, 10) ?? '') && save({ scheduled_date: e.target.value })} />
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold text-slate-700">Customer</h3>
                <dl className="grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="flex justify-between"><dt className="text-slate-400">Name</dt><dd className="font-medium">{selected.customer_name}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Phone</dt><dd className="font-medium">{selected.phone}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Email</dt><dd className="font-medium">{selected.email || '—'}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Location</dt><dd className="font-medium">{selected.location || '—'}</dd></div>
                </dl>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold text-slate-700">Requirements</h3>
                <dl className="grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="flex justify-between"><dt className="text-slate-400">Property</dt><dd className="font-medium">{selected.property_type || '—'}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Devices</dt><dd className="font-medium">{selected.device_count ?? '—'}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Preferred Date</dt><dd className="font-medium">{selected.preferred_date ? formatDate(String(selected.preferred_date)) : '—'}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Preferred Time</dt><dd className="font-medium">{selected.preferred_time || '—'}</dd></div>
                  <div className="flex justify-between col-span-2"><dt className="text-slate-400">Current System</dt><dd className="font-medium">{selected.current_system || '—'}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-slate-400">Description</dt><dd className="font-medium">{selected.description}</dd></div>
                  {selected.notes && <div className="sm:col-span-2"><dt className="text-slate-400">Notes</dt><dd className="font-medium">{selected.notes}</dd></div>}
                </dl>
              </div>

              {selected.files.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold text-slate-700">Uploaded Files ({selected.files.length})</h3>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {selected.files.map((f) => (
                      <a key={f.id} href={f.file_url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-slate-200">
                        {f.file_type?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(f.file_url) ? (
                          <img src={f.file_url} alt={f.file_name} className="aspect-square w-full object-cover" />
                        ) : (
                          <div className="flex aspect-square items-center justify-center bg-slate-50 text-2xl">📄</div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="label">Internal Notes</label>
                <textarea className="input" rows={3} defaultValue={selected.admin_notes} onBlur={(e) => e.target.value !== selected.admin_notes && save({ admin_notes: e.target.value })} placeholder="Add internal notes…" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}