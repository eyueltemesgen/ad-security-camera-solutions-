import {
  AlertTriangle,
  Bell,
  DollarSign,
  Package,
  ShoppingCart,
  Tag,
  Truck,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../hooks/useToast';
import { fetchDashboardStats, type DashboardStats } from '../../services/admin';
import { fetchNotifications } from '../../services/misc';
import { fetchServiceRequests } from '../../services/misc';
import { formatDateTime, formatETB } from '../../lib/utils';
import { EmptyState, ErrorBox, Spinner } from '../../components/ui';
import { StatusBadge } from '../../components/modals/OrderDetailModal';

type NavId = 'dashboard' | 'products' | 'orders' | 'services' | 'customers' | 'inventory' | 'settings';

export function DashboardTab({
  refreshSignal,
  onNavigate,
}: {
  refreshSignal: number;
  onNavigate: (tab: NavId) => void;
}) {
  const stats = useQuery<DashboardStats>(() => fetchDashboardStats(), [refreshSignal]);
  const serviceRequests = useQuery(() => fetchServiceRequests(), [refreshSignal]);
  const notifications = useQuery(() => fetchNotifications({ admin: true }), [refreshSignal]);

  if (stats.loading) return <Spinner />;
  if (stats.error) return <ErrorBox message={stats.error} onRetry={() => void stats.refetch()} />;

  const data = stats.data;
  const serviceChart = (serviceRequests.data ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.service] = (acc[r.service] ?? 0) + 1;
    return acc;
  }, {});
  const serviceChartData = Object.entries(serviceChart).map(([name, value]) => ({
    name,
    requests: value,
  }));

  return (
    <div className="space-y-8">
      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Stat value={String(data?.totalProducts ?? 0)} label="Products" color="text-blue-400" />
        <Stat value={String(data?.totalOrders ?? 0)} label="Orders" color="text-emerald-400" />
        <Stat value={String(data?.pendingOrders ?? 0)} label="Pending" color="text-yellow-400" />
        <Stat
          value={formatETB(data?.revenue ?? 0)}
          label="Revenue"
          color="text-purple-400"
        />
        <Stat value={String(data?.customers ?? 0)} label="Customers" color="text-pink-400" />
        <Stat
          value={String(serviceRequests.data?.length ?? 0)}
          label="Service Requests"
          color="text-orange-400"
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat
          icon={<ShoppingCart className="w-5 h-5 text-blue-400" />}
          label="Today's Orders"
          value={String(data?.todayOrders ?? 0)}
        />
        <QuickStat
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          label="Today's Revenue"
          value={formatETB(data?.todayRevenue ?? 0)}
          valueClass="text-emerald-400"
        />
        <QuickStat
          icon={<Users className="w-5 h-5 text-yellow-400" />}
          label="New Customers (7d)"
          value={String(data?.newCustomersWeek ?? 0)}
        />
        <QuickStat
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
          label="Low Stock Items"
          value={String(data?.lowStockCount ?? 0)}
          valueClass="text-red-400"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" /> Sales Overview (14 days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.salesByDay ?? []}>
                <defs>
                  <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a5bff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#1a5bff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#141b28',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                  }}
                  formatter={(value: number) => [formatETB(value, 2), 'Revenue']}
                />
                <Area type="monotone" dataKey="total" stroke="#1a5bff" fill="url(#sales)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-400" /> Service Categories
          </h3>
          <div className="h-64">
            {serviceChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                No service requests yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={serviceChartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#141b28',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                    }}
                  />
                  <Area type="monotone" dataKey="requests" stroke="#10b981" fill="rgba(16,185,129,0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl lg:col-span-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" /> Recent Orders
          </h3>
          {(data?.recentOrders ?? []).length === 0 ? (
            <EmptyState message="No orders yet." />
          ) : (
            <div className="space-y-2">
              {(data?.recentOrders ?? []).map((order) => (
                <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 bg-white/5 rounded-xl p-3 text-sm">
                  <div>
                    <p className="font-semibold">{order.order_number}</p>
                    <p className="text-xs text-gray-400">{order.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-orange-400 font-semibold">{formatETB(order.total, 2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-yellow-400" /> Quick Actions
          </h3>
          <div className="space-y-3">
            <button onClick={() => onNavigate('products')} className="btn-primary w-full py-2 text-sm">
              <Package className="w-4 h-4" /> Add Product
            </button>
            <button onClick={() => onNavigate('orders')} className="btn-outline w-full py-2 text-sm">
              <Truck className="w-4 h-4" /> View Orders
            </button>
            <button onClick={() => onNavigate('services')} className="btn-outline w-full py-2 text-sm">
              <WrenchIcon /> Manage Services
            </button>
            <button onClick={() => onNavigate('customers')} className="btn-outline w-full py-2 text-sm">
              <Users className="w-4 h-4" /> Customers
            </button>
          </div>
        </div>
      </div>

      {/* Top products + activity feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400" /> Top Products
          </h3>
          {(data?.topProducts ?? []).length === 0 ? (
            <EmptyState message="No sales yet." />
          ) : (
            <div className="space-y-2">
              {(data?.topProducts ?? []).map((product) => (
                <div key={product.name} className="flex justify-between text-sm bg-white/5 rounded-lg p-2.5">
                  <span className="truncate">{product.name}</span>
                  <span className="text-gray-400">{product.quantity} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" /> Activity Feed
          </h3>
          {(notifications.data ?? []).length === 0 ? (
            <EmptyState message="No activity yet." />
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(notifications.data ?? []).slice(0, 10).map((n) => (
                <div key={n.id} className="text-sm bg-white/5 rounded-lg p-2.5">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-gray-400">{n.message}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{formatDateTime(n.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WrenchIcon() {
  return <Package className="w-4 h-4" />;
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div className="admin-stat">
      <div className={`text-2xl font-bold ${color ?? ''}`}>{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="quick-stat-card">
      <div className="quick-stat-icon bg-white/5">{icon}</div>
      <div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className={`text-xl font-bold ${valueClass ?? ''}`}>{value}</div>
      </div>
    </div>
  );
}
