import { useMemo, useState } from 'react';
import { Search, Truck } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../hooks/useToast';
import { fetchOrders, updateOrderStatus, updatePaymentStatus } from '../../services/orders';
import { formatDateTime, formatETB, paymentMethodLabel, statusLabel } from '../../lib/utils';
import { ORDER_STATUSES, type Order, type OrderStatus } from '../../types';
import { EmptyState, ErrorBox, Spinner } from '../../components/ui';
import { OrderDetailModal, StatusBadge } from '../../components/modals/OrderDetailModal';

export function OrdersTab({ refreshSignal }: { refreshSignal: number }) {
  const { showToast } = useToast();
  const orders = useQuery(() => fetchOrders(), [refreshSignal]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (orders.data ?? []).filter((order) => {
      if (filter !== 'all' && order.status !== filter) return false;
      if (!term) return true;
      return (
        order.order_number.toLowerCase().includes(term) ||
        order.customer_name.toLowerCase().includes(term) ||
        order.customer_email.toLowerCase().includes(term)
      );
    });
  }, [orders.data, filter, search]);

  const setStatus = async (order: Order, status: OrderStatus) => {
    try {
      await updateOrderStatus(order.id, status);
      showToast(`Order ${order.order_number} → ${statusLabel(status)}`, 'success');
      await orders.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  const setPayment = async (order: Order, status: 'pending' | 'paid' | 'failed') => {
    try {
      await updatePaymentStatus(order.id, status);
      showToast(`Payment marked ${statusLabel(status)}`, 'success');
      await orders.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-400" /> Manage Orders
        </h3>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-input !w-auto">
            <option value="all">All Status</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Order # / customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input !w-52 pl-9"
            />
          </div>
        </div>
      </div>

      {orders.loading ? (
        <Spinner />
      ) : orders.error ? (
        <ErrorBox message={orders.error} onRetry={() => void orders.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No orders found." />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="glass-card rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button onClick={() => setSelected(order)} className="text-left">
                  <p className="font-semibold">{order.order_number}</p>
                  <p className="text-xs text-gray-400">
                    {order.customer_name} • {formatDateTime(order.created_at)}
                  </p>
                </button>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-orange-400 font-bold">{formatETB(order.total, 2)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                <span>Payment: {paymentMethodLabel(order.payment_method)}</span>
                <span>
                  Status: <span className="text-yellow-400">{statusLabel(order.payment_status)}</span>
                </span>
                <span>{(order.items ?? []).length} item(s)</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <select
                  value={order.status}
                  onChange={(e) => void setStatus(order, e.target.value as OrderStatus)}
                  className="form-input !w-auto text-xs py-1.5"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
                <select
                  value={order.payment_status}
                  onChange={(e) => void setPayment(order, e.target.value as 'pending' | 'paid' | 'failed')}
                  className="form-input !w-auto text-xs py-1.5"
                >
                  <option value="pending">Payment: Pending</option>
                  <option value="paid">Payment: Paid</option>
                  <option value="failed">Payment: Failed</option>
                </select>
                <button onClick={() => setSelected(order)} className="btn-outline px-4 py-1.5 text-xs">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
