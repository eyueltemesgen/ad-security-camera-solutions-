import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import { EmptyState, PageLoader, formatDate, formatMoney, statusBadge } from '../../components/ui';
import type { Order } from '../../types';

export function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Order[]>('/api/orders/mine')
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-xl font-bold">My Orders</h1>
      <p className="mt-1 text-sm text-slate-500">Track the status of your product orders.</p>
      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No orders yet" subtitle="When you place an order, it will appear here." action={<Link to="/products" className="btn btn-primary">Shop Products</Link>} />
        </div>
      ) : (
        <div className="card mt-5 divide-y divide-slate-50 overflow-hidden">
          {orders.map((o) => (
            <Link key={o.id} to={`/dashboard/orders/${o.id}`} className="block px-5 py-4 hover:bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-800">{o.order_number}</div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {formatDate(o.created_at)} · {o.items.length} item{o.items.length === 1 ? '' : 's'} · {o.payment_method.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">{formatMoney(o.total)}</span>
                  {statusBadge(o.status)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGet<Order>(`/api/orders/${id}`).then(setOrder).catch(() => setError(true));
  }, [id]);

  if (!order && !error) return <PageLoader />;
  if (error || !order) {
    return <EmptyState title="Order not found" action={<Link to="/dashboard/orders" className="btn btn-primary">Back to Orders</Link>} />;
  }

  return (
    <div>
      <Link to="/dashboard/orders" className="text-sm font-medium text-[var(--primary)] hover:underline">← All Orders</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{order.order_number}</h1>
        <div className="flex items-center gap-3">
          {statusBadge(order.status)}
          <span className="badge status-confirmed capitalize">{order.payment_method.replace(/_/g, ' ')} · {order.payment_status.replace(/_/g, ' ')}</span>
        </div>
      </div>
      <p className="mt-1 text-sm text-slate-500">Placed {formatDate(order.created_at)}</p>

      <div className="card card-pad mt-5">
        <h2 className="font-bold">Items</h2>
        <div className="mt-3 divide-y divide-slate-50">
          {order.items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 py-3 text-sm">
              {it.image_url ? (
                <img src={it.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-300">▣</span>
              )}
              <div className="flex-1">
                <div className="font-medium">{it.product_name}</div>
                <div className="text-xs text-slate-400">{it.sku} · {formatMoney(it.unit_price)} × {it.quantity}</div>
              </div>
              <div className="font-semibold">{formatMoney(it.subtotal)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad mt-5">
        <h2 className="font-bold">Delivery & Payment</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-400">Recipient</dt><dd className="font-medium">{order.customer_name} · {order.customer_phone}</dd></div>
          <div><dt className="text-slate-400">Address</dt><dd className="font-medium">{order.delivery_address}, {order.delivery_city}</dd></div>
          {order.delivery_notes && <div className="sm:col-span-2"><dt className="text-slate-400">Notes</dt><dd>{order.delivery_notes}</dd></div>}
          <div><dt className="text-slate-400">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
          <div><dt className="text-slate-400">VAT</dt><dd>{formatMoney(order.tax)}</dd></div>
          <div><dt className="text-slate-400">Delivery</dt><dd>{formatMoney(order.total - order.subtotal - order.tax)}</dd></div>
          <div><dt className="text-slate-400 font-bold">Total</dt><dd className="font-bold">{formatMoney(order.total)}</dd></div>
        </dl>
      </div>
    </div>
  );
}