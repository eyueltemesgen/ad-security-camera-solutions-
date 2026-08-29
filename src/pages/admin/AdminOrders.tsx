import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPatch } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, SearchBox, Toolbar, Table, Th, Td, PaginationControls } from './AdminUi';
import { statusBadge, formatMoney, formatDate } from '../../components/ui';
import { ORDER_STATUSES } from '../../types';
import type { Order } from '../../types';

const PAGE_SIZE = 20;

export default function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), per_page: String(PAGE_SIZE), search, status });
      const r = await apiGet<{ orders: Order[]; total: number }>(`/api/orders/all/admin?${qs}`);
      setOrders(r.orders);
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
      const o = await apiGet<Order>(`/api/orders/${id}`);
      setSelected(o);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const saveStatus = async (next: string) => {
    if (!selected) return;
    try {
      await apiPatch(`/api/orders/${selected.id}/status`, { status: next });
      setSelected({ ...selected, status: next as Order['status'] });
      toast(`Order marked ${next.replace(/_/g, ' ')}`);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const saveNotes = async (notes: string) => {
    if (!selected) return;
    try {
      await apiPatch(`/api/orders/${selected.id}/status`, { admin_notes: notes });
      setSelected({ ...selected, admin_notes: notes });
      toast('Internal notes saved');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Orders</h1>
      <p className="mb-6 text-sm text-slate-500">{total} orders total</p>

      <Toolbar>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search order, customer, email…" />
          <select className="input input-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </Toolbar>

      {error && <AdminError error={error} />}
      {loading ? (
        <LoadingBlock label="Loading orders…" />
      ) : (
        <>
          <Table
            head={<><Th>Order</Th><Th>Customer</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th><Th /></>}
          >
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => open(o.id)}>
                <Td className="font-semibold">{o.order_number}</Td>
                <Td>
                  <div className="font-medium">{o.customer_name}</div>
                  <div className="text-xs text-slate-400">{o.customer_email}</div>
                </Td>
                <Td className="font-semibold">{formatMoney(o.total)}</Td>
                <Td>{statusBadge(o.status)}</Td>
                <Td className="text-slate-500">{formatDate(o.created_at)}</Td>
                <Td className="text-right text-xs text-[var(--primary)]">Open</Td>
              </tr>
            ))}
          </Table>
          <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">{selected.order_number}</h2>
                <p className="text-xs text-slate-500">{formatDate(selected.created_at)}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕ Close</button>
            </div>

            <div className="space-y-6 p-6">
              {/* Status */}
              <div>
                <label className="label">Order Status</label>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      className={`badge cursor-pointer ${s.value === selected.status ? 'badge-active' : 'badge-option'}`}
                      onClick={() => saveStatus(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer */}
              <div>
                <h3 className="mb-2 text-sm font-bold text-slate-700">Customer</h3>
                <dl className="grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                  <div className="flex justify-between"><dt className="text-slate-400">Name</dt><dd className="font-medium">{selected.customer_name}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Phone</dt><dd className="font-medium">{selected.customer_phone || '—'}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Email</dt><dd className="font-medium truncate">{selected.customer_email}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Payment</dt><dd className="font-medium capitalize">{selected.payment_method.replace(/_/g, ' ')} · {selected.payment_status}</dd></div>
                </dl>
              </div>

              {/* Delivery */}
              <div>
                <h3 className="mb-2 text-sm font-bold text-slate-700">Delivery</h3>
                <p className="text-sm text-slate-600">{selected.delivery_address}, {selected.delivery_city}</p>
                {selected.delivery_notes && <p className="mt-1 text-xs text-slate-400">{selected.delivery_notes}</p>}
              </div>

              {/* Items */}
              <div>
                <h3 className="mb-2 text-sm font-bold text-slate-700">Items ({selected.items.length})</h3>
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                  {selected.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                      {it.image_url ? <img src={it.image_url} alt="" className="h-10 w-10 rounded object-cover" /> : <span className="h-10 w-10 rounded bg-slate-100" />}
                      <div className="flex-1">
                        <div className="font-medium">{it.product_name}</div>
                        <div className="text-xs text-slate-400">{it.sku} · {formatMoney(it.unit_price)} × {it.quantity}</div>
                      </div>
                      <div className="font-semibold">{formatMoney(it.subtotal)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <dl className="space-y-1 rounded-lg bg-slate-50 p-4 text-sm">
                <div className="flex justify-between"><dt className="text-slate-400">Subtotal</dt><dd>{formatMoney(selected.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">VAT</dt><dd>{formatMoney(selected.tax)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Delivery</dt><dd>{formatMoney(selected.total - selected.subtotal - selected.tax)}</dd></div>
                <div className="flex justify-between text-base"><dt className="font-bold">Total</dt><dd className="font-bold text-[var(--primary)]">{formatMoney(selected.total)}</dd></div>
              </dl>

              {/* Internal notes */}
              <div>
                <label className="label">Internal Notes</label>
                <textarea className="input" rows={3} defaultValue={selected.admin_notes} onBlur={(e) => saveNotes(e.target.value)} placeholder="Add internal notes…" />
              </div>

              <div className="flex gap-2">
                <Link to={`/admin/orders`} onClick={() => setSelected(null)} className="btn btn-outline btn-sm">Done</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}