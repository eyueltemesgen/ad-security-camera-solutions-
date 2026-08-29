import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { formatMoney, statusBadge, formatDate } from '../../components/ui';
import type { Order, ServiceRequest, AppNotification } from '../../types';

interface Stat {
  label: string;
  value: number;
  to?: string;
  accent?: boolean;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    apiGet<Order[]>('/api/orders/mine').then(setOrders).catch(() => setOrders([]));
    apiGet<ServiceRequest[]>('/api/service-requests/mine').then(setRequests).catch(() => setRequests([]));
    apiGet<AppNotification[]>('/api/admin/notifications').then(setNotifications).catch(() => setNotifications([]));
  }, []);

  const activeOrders = orders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const activeRequests = requests.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
  const unread = notifications.filter((n) => !n.is_read).length;

  const stats: Stat[] = [
    { label: 'Total Orders', value: orders.length, to: '/dashboard/orders' },
    { label: 'Active Orders', value: activeOrders, to: '/dashboard/orders', accent: true },
    { label: 'Completed Orders', value: completedOrders, to: '/dashboard/orders' },
    { label: 'Service Requests', value: requests.length, to: '/dashboard/services' },
    { label: 'Active Requests', value: activeRequests, to: '/dashboard/services', accent: true },
    { label: 'Unread Notifications', value: unread, to: '/dashboard/notifications' },
  ];

  const latestOrders = orders.slice(0, 4);
  const latestRequests = requests.slice(0, 4);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">
        Welcome back, {user?.full_name?.split(' ')[0]}
      </h1>
      <p className="mt-1 text-sm text-slate-500">Here's an overview of your account activity.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to ?? '#'}
            className={`card card-pad transition-shadow hover:shadow-md ${s.accent ? 'border-l-4 border-l-[var(--accent)]' : ''}`}
          >
            <div className="text-2xl font-extrabold text-[var(--primary)]">{s.value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-xs font-semibold text-[var(--primary)] hover:underline">View all</Link>
          </div>
          {latestOrders.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-slate-400">No orders yet.</p>
              <Link to="/products" className="btn btn-primary btn-sm mt-3">Browse Products</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {latestOrders.map((o) => (
                <Link key={o.id} to={`/dashboard/orders/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{o.order_number}</div>
                    <div className="text-xs text-slate-400">{formatDate(o.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">{formatMoney(o.total)}</span>
                    {statusBadge(o.status)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent requests */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold">Service Requests</h2>
            <Link to="/dashboard/services" className="text-xs font-semibold text-[var(--primary)] hover:underline">View all</Link>
          </div>
          {latestRequests.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-slate-400">No service requests yet.</p>
              <Link to="/request-service" className="btn btn-accent btn-sm mt-3">Request a Service</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {latestRequests.map((r) => (
                <Link key={r.id} to={`/dashboard/services/${r.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{r.request_number} · {r.service_name}</div>
                    <div className="text-xs text-slate-400">{formatDate(r.created_at)}</div>
                  </div>
                  {statusBadge(r.status)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}