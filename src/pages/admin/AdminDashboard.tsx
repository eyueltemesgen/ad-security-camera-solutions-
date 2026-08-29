import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { apiGet } from '../../lib/api';
import { StatCard, LoadingBlock } from './AdminUi';
import { statusBadge, formatMoney, formatDate } from '../../components/ui';
import type { DashboardAnalytics } from '../../types';

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<DashboardAnalytics>('/api/admin/analytics')
      .then(setData)
      .catch((e) => setError((e as Error).message));
  }, []);

  const salesData = useMemo(
    () =>
      (data?.salesByDay ?? []).map((d) => ({
        ...d,
        total: Number(d.total),
      })),
    [data],
  );

  const growthData = useMemo(() => (data?.customerGrowth ?? []).map((d) => ({ ...d, count: Number(d.count) })), [data]);

  if (error) return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>;
  if (!data) return <LoadingBlock label="Loading analytics…" />;

  const t = data.totals;

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500">Real-time business overview from the database.</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatMoney(t.revenue)} diff={`${formatMoney(t.revenueWeek)} this week`} />
        <StatCard label="Orders" value={t.orders} diff={`${t.pendingOrders} pending`} />
        <StatCard label="Customers" value={t.customers} diff={`${t.newCustomersWeek} new this week`} />
        <StatCard label="Service Requests" value={t.serviceRequests} diff={`${t.pendingServiceRequests} pending`} />
        <StatCard label="Products" value={t.products} diff={`${t.lowStock} low stock`} color={t.lowStock > 0 ? 'amber' : 'primary'} />
        <StatCard label="Contact Messages" value={t.contactMessages} diff={`${t.unreadMessages} unread`} color={t.unreadMessages > 0 ? 'red' : 'primary'} />
        <StatCard label="Revenue Today" value={formatMoney(t.revenueToday)} />
        <StatCard label="Completed Orders" value={t.completedOrders} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card card-pad">
          <h2 className="font-bold">Sales — last 14 days</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0e2a47" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0e2a47" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [formatMoney(Number(v)), 'Sales']} />
                <Area type="monotone" dataKey="total" stroke="#0e2a47" fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="font-bold">Customer Growth — last 14 days</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="New customers" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="font-bold">Orders over time</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" name="Orders" stroke="#16406b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="font-bold">Service requests by type</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.serviceByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Bar dataKey="requests" name="Requests" fill="#0e2a47" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold">Top Products</h2>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-400">No product sales yet.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="flex items-center gap-3 font-medium text-slate-700">
                    <span className="text-xs font-bold text-slate-400">#{i + 1}</span> {p.name}
                  </span>
                  <span className="font-semibold">{p.quantity} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-[var(--primary)] hover:underline">View all</Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-400">No orders yet.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {data.recentOrders.map((o) => (
                <Link key={o.id} to={`/admin/order/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-slate-50">
                  <span className="font-medium text-slate-700">
                    {o.order_number} <span className="ml-1 text-xs text-slate-400">· {o.customer_name}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold">{formatMoney(Number(o.total))}</span>
                    {statusBadge(o.status)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}