import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, Phone } from 'lucide-react';
import { useBusinessInfo, toTel } from '../hooks/useBusinessInfo';
import { formatETB, formatDateTime, statusLabel } from '../lib/utils';
import type { Order } from '../types';

export function OrderConfirmationPage() {
  const location = useLocation();
  const info = useBusinessInfo();
  const order = location.state?.order as Order | undefined;

  return (
    <div className="py-14 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Order Confirmed!</h1>
        <p className="mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Thank you for shopping with {info.companyName}. We've received your order and will contact
          you to confirm the next steps.
        </p>

        {order && (
          <div className="glass-card rounded-2xl p-6 mt-6 text-left">
            <div className="flex flex-wrap justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--border-soft)' }}>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Order number</p>
                <p className="font-bold text-lg">{order.order_number}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Status</p>
                <p className="font-semibold text-emerald-500">{statusLabel(order.status)}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Placed</p>
                <p className="font-semibold">{formatDateTime(order.created_at)}</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="flex justify-between gap-3">
                  <span>{item.product_name || 'Product'}</span>
                  <span className="flex-shrink-0">
                    {formatETB(item.unit_price)} × {item.quantity}
                  </span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-3 font-bold" style={{ borderColor: 'var(--border-soft)', color: 'var(--text-primary)' }}>
                <span>Total paid</span>
                <span>{formatETB(order.total ?? 0)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'var(--bg-panel)' }}>
              <Phone className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                We'll call you to confirm your order. You can also track it any time from your{' '}
                <Link to="/account" className="text-brand-400 hover:underline">account dashboard</Link>,
                or reach us at <a href={`tel:${toTel(info.phone)}`} className="text-brand-400 hover:underline">{info.phone}</a>.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/products" className="btn-primary px-8 py-3">Continue Shopping</Link>
          {order && (
            <Link to="/account?tab=orders" className="btn-outline px-8 py-3">Track My Order</Link>
          )}
        </div>
      </div>
    </div>
  );
}