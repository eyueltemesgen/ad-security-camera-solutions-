import { Camera } from 'lucide-react';
import type { Order } from '../../types';
import { formatDateTime, formatETB, paymentMethodLabel, statusLabel } from '../../lib/utils';
import { Modal } from '../ui';

export function OrderDetailModal({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  return (
    <Modal open={Boolean(order)} onClose={onClose} wide>
      {order && (
        <div>
          <h2 className="text-2xl font-bold mb-1">Order {order.order_number}</h2>
          <p className="text-sm text-gray-400 mb-6">{formatDateTime(order.created_at)}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6">
            <div className="space-y-1">
              <p>
                <span className="text-gray-400">Customer:</span> {order.customer_name}
              </p>
              <p>
                <span className="text-gray-400">Email:</span> {order.customer_email}
              </p>
              <p>
                <span className="text-gray-400">Phone:</span> {order.customer_phone || '—'}
              </p>
              <p>
                <span className="text-gray-400">Address:</span> {order.delivery_address || '—'}
              </p>
            </div>
            <div className="space-y-1">
              <p>
                <span className="text-gray-400">Payment:</span>{' '}
                {paymentMethodLabel(order.payment_method)}
              </p>
              <p>
                <span className="text-gray-400">Payment status:</span>{' '}
                <span className="text-yellow-400">{statusLabel(order.payment_status)}</span>
              </p>
              <p>
                <span className="text-gray-400">Order status:</span>{' '}
                <StatusBadge status={order.status} />
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-3">Items</h3>
          <div className="space-y-2 mb-6">
            {(order.items ?? []).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 glass-card rounded-xl p-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-white/5 rounded-lg w-9 h-9 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-4 h-4 text-blue-400/60" />
                  </div>
                  <span className="truncate">{item.product_name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-gray-400 text-xs">
                    {item.quantity} × {formatETB(item.unit_price, 2)}
                  </span>
                  <div>{formatETB(item.subtotal, 2)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-sm border-t border-white/10 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span>{formatETB(order.subtotal, 2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">VAT (15%)</span>
              <span>{formatETB(order.tax, 2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-orange-400">{formatETB(order.total, 2)}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'delivered'
      ? 'bg-emerald-500/15 text-emerald-400'
      : status === 'cancelled'
        ? 'bg-red-500/15 text-red-400'
        : status === 'pending'
          ? 'bg-yellow-500/15 text-yellow-400'
          : 'bg-blue-500/15 text-blue-400';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {statusLabel(status)}
    </span>
  );
}
