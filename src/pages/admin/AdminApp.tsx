import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Camera,
  Home,
  LogOut,
  Package,
  Settings,
  ShieldAlert,
  Truck,
  Users,
  Warehouse,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useQuery } from '../../hooks/useQuery';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { fetchNotifications, markNotificationRead } from '../../services/misc';
import { formatDateTime } from '../../lib/utils';
import { DashboardTab } from './DashboardTab';
import { ProductsTab } from './ProductsTab';
import { OrdersTab } from './OrdersTab';
import { ServicesTab } from './ServicesTab';
import { CustomersTab } from './CustomersTab';
import { InventoryTab } from './InventoryTab';
import { SettingsTab } from './SettingsTab';

type TabId = 'dashboard' | 'products' | 'orders' | 'services' | 'customers' | 'inventory' | 'settings';

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: Truck },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminApp() {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [refreshSignal, setRefreshSignal] = useState(0);

  // Realtime: refresh visible tab + toast on new records
  useEffect(() => {
    if (!isSupabaseConfigured || !isAdmin) return;

    const bump = (label: string) => {
      setRefreshSignal((n) => n + 1);
      showToast(label, 'info');
    };

    const channel = supabase
      .channel('admin-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () =>
        bump('New order received')
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'service_requests' }, () =>
        bump('New service request')
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () =>
        setRefreshSignal((n) => n + 1)
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isAdmin, showToast]);

  if (loading) {
    return (
      <div className="admin-root min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-root">
        <AdminLogin />
      </div>
    );
  }

  if (!profile?.role || !isAdmin) {
    return (
      <div className="admin-root min-h-[60vh] flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm text-gray-400 mb-4">
            Your account ({user.email}) does not have admin privileges.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="btn-outline py-2 text-sm">
              Back to Store
            </Link>
            <button
              onClick={() => void signOut()}
              className="btn-danger py-2 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-brand-500/40 flex items-center justify-center bg-gradient-to-br from-brand-500/20 to-brand-700/20">
            <Camera className="w-5 h-5 text-brand-400" />
          </div>
          <h1 className="text-xl font-bold">
            <span className="text-gradient">AD</span> Admin
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationsBell refreshSignal={refreshSignal} />
          <Link to="/" className="text-gray-300 hover:text-white text-sm transition">
            View Store
          </Link>
          <button
            onClick={() => void signOut()}
            className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`tab-btn px-4 py-2 text-sm font-medium flex items-center gap-1.5 ${
              tab === id ? 'tab-active' : 'tab-inactive'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="min-h-[60vh]">
        {tab === 'dashboard' && <DashboardTab refreshSignal={refreshSignal} onNavigate={(t: TabId) => setTab(t)} />}
        {tab === 'products' && <ProductsTab refreshSignal={refreshSignal} />}
        {tab === 'orders' && <OrdersTab refreshSignal={refreshSignal} />}
        {tab === 'services' && <ServicesTab refreshSignal={refreshSignal} />}
        {tab === 'customers' && <CustomersTab refreshSignal={refreshSignal} />}
        {tab === 'inventory' && <InventoryTab refreshSignal={refreshSignal} />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
    </div>
  );
}

// ---------------------------------------------------------------- login ----

function AdminLogin() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const handle = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await signIn(form.email, form.password);
    setBusy(false);
    if (error) showToast(error, 'error');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-[radial-gradient(circle,rgba(26,91,255,0.05),transparent_70%)] pointer-events-none" />
        <div className="flex flex-col items-center mb-5 relative">
          <div className="w-16 h-16 rounded-full border-2 border-brand-500/40 shadow-glow flex items-center justify-center bg-gradient-to-br from-brand-500/20 to-brand-700/20">
            <Camera className="w-7 h-7 text-brand-400" />
          </div>
          <div className="text-center mt-3">
            <div className="text-2xl font-extrabold">
              <span className="text-gradient">AD</span> <span className="text-gray-900 dark:text-white">Security</span>
            </div>
            <div className="text-[9px] text-gray-500 uppercase tracking-[2.5px]">
              Camera Solutions
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mb-5">Admin sign in</p>
        <form onSubmit={handle} className="space-y-3 relative">
          <input
            type="email"
            placeholder="Email"
            required
            className="form-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="form-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit" disabled={busy} className="btn-primary w-full py-2.5">
            {busy ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <div className="text-center text-xs text-gray-500 mt-4 pt-3 border-t border-white/5">
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------- notifications ---

function NotificationsBell({ refreshSignal }: { refreshSignal: number }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const notifications = useQuery(
    () => fetchNotifications({ admin: true }),
    [refreshSignal, open]
  );

  const unread = (notifications.data ?? []).filter((n) => !n.is_read).length;

  const toggle = () => setOpen((prev) => !prev);

  let content: ReactNode;
  if (!open) {
    content = null;
  } else if (notifications.loading) {
    content = <p className="text-sm text-gray-400 text-center py-4">Loading…</p>;
  } else if (notifications.error) {
    content = <p className="text-sm text-red-400 text-center py-4">{notifications.error}</p>;
  } else if ((notifications.data ?? []).length === 0) {
    content = <p className="text-sm text-gray-400 text-center py-4">No notifications</p>;
  } else {
    content = (notifications.data ?? []).map((n) => (
      <button
        key={n.id}
        onClick={() => {
          void markNotificationRead(n.id).catch((err: unknown) =>
            showToast(err instanceof Error ? err.message : 'Failed', 'error')
          );
          void notifications.refetch();
        }}
        className={`w-full text-left rounded-lg p-2.5 transition hover:bg-white/5 ${
          n.is_read ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{n.title}</p>
          {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-400">{n.message}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{formatDateTime(n.created_at)}</p>
      </button>
    ));
  }

  return (
    <div className="relative">
      <button onClick={toggle} className="relative" aria-label="Notifications">
        <Bell className="w-5 h-5 text-gray-300 hover:text-white transition" />
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl p-3 z-50 max-h-96 overflow-y-auto">
          {content}
        </div>
      )}
    </div>
  );
}
