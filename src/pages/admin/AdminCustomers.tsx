import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, SearchBox, Toolbar, Table, Th, Td, PaginationControls } from './AdminUi';
import { formatMoney, formatDate } from '../../components/ui';
import type { CustomerSummary, Order, ServiceRequest } from '../../types';

const PAGE_SIZE = 25;

export default function AdminCustomers() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CustomerSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), per_page: String(PAGE_SIZE), search });
      const r = await apiGet<{ customers: CustomerSummary[]; total: number }>(`/api/admin/customers?${qs}`);
      setCustomers(r.customers);
      setTotal(r.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (c: CustomerSummary) => {
    setSelected(c);
    setOrders([]);
    setRequests([]);
    apiGet<{ orders: Order[] }>(`/api/orders/all/admin?search=${encodeURIComponent(c.email)}`)
      .then((r) => setOrders(r.orders.filter((o) => o.user_id === c.id)))
      .catch(() => setOrders([]));
    apiGet<{ requests: ServiceRequest[] }>(`/api/service-requests/all/admin?search=${encodeURIComponent(c.email)}`)
      .then((r) => setRequests(r.requests.filter((x) => x.user_id === c.id)))
      .catch(() => setRequests([]));
  };

  const toggleActive = async (c: CustomerSummary) => {
    try {
      await apiPatch(`/api/admin/customers/${c.id}`, { is_active: !c.is_active });
      setCustomers((cs) => cs.map((x) => (x.id === c.id ? { ...x, is_active: !c.is_active } : x)));
      if (selected?.id === c.id) setSelected({ ...selected, is_active: !c.is_active });
      toast(c.is_active ? 'Customer deactivated' : 'Customer activated');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Customers</h1>
      <p className="mb-6 text-sm text-slate-500">{total} registered customers</p>

      <Toolbar>
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, email, phone…" />
      </Toolbar>

      {error && <AdminError error={error} />}
      {loading ? (
        <LoadingBlock label="Loading customers…" />
      ) : (
        <>
          <Table head={<><Th>Customer</Th><Th>Contact</Th><Th>Orders</Th><Th>Spent</Th><Th>Services</Th><Th>Status</Th><Th>Joined</Th><Th /></>}>
            {customers.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-slate-50" onClick={() => open(c)}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    {c.avatar_url ? <img src={c.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="h-8 w-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold">{c.full_name[0]}</span>}
                    <span className="font-medium">{c.full_name}</span>
                  </div>
                </Td>
                <Td className="text-slate-500">{c.email}<div className="text-xs">{c.phone}</div></Td>
                <Td className="font-semibold">{c.order_count}</Td>
                <Td className="font-semibold">{formatMoney(c.total_spent)}</Td>
                <Td>{c.service_count}</Td>
                <Td>
                  <span className={`badge ${c.is_active ? 'status-completed' : 'status-cancelled'}`}>{c.is_active ? 'Active' : 'Disabled'}</span>
                </Td>
                <Td className="text-slate-500">{formatDate(c.created_at)}</Td>
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
              <div className="flex items-center gap-3">
                {selected.avatar_url ? <img src={selected.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="h-10 w-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">{selected.full_name[0]}</span>}
                <div>
                  <h2 className="text-lg font-bold">{selected.full_name}</h2>
                  <p className="text-xs text-slate-500">{selected.email} · Joined {formatDate(selected.created_at)}</p>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`badge ${selected.is_active ? 'status-completed' : 'status-cancelled'}`}>{selected.is_active ? 'Active' : 'Disabled'}</span>
                <button className="btn btn-outline btn-sm" onClick={() => toggleActive(selected)}>
                  {selected.is_active ? 'Deactivate Account' : 'Activate Account'}
                </button>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold text-slate-700">Recent Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-sm text-slate-400">No orders.</p>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                    {orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                        <span className="font-medium">{o.order_number}</span>
                        <span className="flex items-center gap-3">
                          <span className="font-semibold">{formatMoney(o.total)}</span>
                          <span className={`badge status-${o.status}`}>{o.status.replace(/_/g, ' ')}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold text-slate-700">Service Requests</h3>
                {requests.length === 0 ? (
                  <p className="text-sm text-slate-400">No service requests.</p>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                    {requests.map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                        <span className="font-medium">{r.request_number} · {r.service_name}</span>
                        <span className={`badge status-${r.status}`}>{r.status.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                No sensitive authentication data is displayed. Passwords are never stored in plain text.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}