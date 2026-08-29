import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../lib/api';
import { PageLoader, statusBadge, formatDate, formatMoney, EmptyState } from '../components/ui';
import type { Order } from '../types';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGet<Order>(`/api/orders/${id}`)
      .then(setOrder)
      .catch(() => setError(true));
  }, [id]);

  if (!order && !error) return <PageLoader label="Loading order…" />;

  if (error || !order) {
    return (
      <div className="container-x py-16">
        <EmptyState
          title="Order not found"
          subtitle="We could not find this order in your account."
          action={<Link to="/dashboard/orders" className="btn btn-primary">My Orders</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <div className="card card-pad border-emerald-200 bg-emerald-50/50">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">Thank you! Your order was placed.</h1>
            <p className="mt-1 text-sm text-slate-600">
              Order <span className="font-bold">{order.order_number}</span> · {formatDate(order.created_at)} · {statusBadge(order.status)}
            </p>
          </div>
          <Link to="/dashboard/orders" className="btn btn-outline btn-sm">Track in My Orders</Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card card-pad">
            <h2 className="text-lg font-bold">Order Items</h2>
            <div className="mt-3 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b border-slate-50 pb-3 text-sm last:border-0 last:pb-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-300">▣</span>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{item.product_name}</div>
                    <div className="text-xs text-slate-400">SKU: {item.sku} · Qty {item.quantity}</div>
                  </div>
                  <div className="font-semibold">{formatMoney(item.subtotal)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-pad mt-5">
            <h2 className="text-lg font-bold">Delivery Details</h2>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-400">Name</dt><dd className="font-medium">{order.customer_name}</dd></div>
              <div><dt className="text-slate-400">Phone</dt><dd className="font-medium">{order.customer_phone || '—'}</dd></div>
              <div className="sm:col-span-2"><dt className="text-slate-400">Address</dt><dd className="font-medium">{order.delivery_address}, {order.delivery_city}</dd></div>
              {order.delivery_notes && (
                <div className="sm:col-span-2"><dt className="text-slate-400">Notes</dt><dd className="font-medium">{order.delivery_notes}</dd></div>
              )}
            </dl>
          </div>
        </div>

        <div className="lg:sticky lg:top-20 h-fit">
          <div className="card card-pad">
            <h2 className="text-lg font-bold">Payment Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">VAT (15%)</dt><dd>{formatMoney(order.tax)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Delivery</dt><dd>{formatMoney(order.total - order.subtotal - order.tax)}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="font-extrabold text-[var(--primary)]">{formatMoney(order.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Payment</dt>
                <dd className="font-medium capitalize">{order.payment_method.replace(/_/g, ' ')}</dd>
              </div>
            </dl>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              You will be contacted when your order is ready for delivery. Track the status anytime from your dashboard.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}