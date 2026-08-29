import { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { to: '/dashboard/orders', label: 'My Orders', icon: 'M6 2h12l2 4v16H4V6l2-4zm2 4h8l-1-2H9l-1 2zm-1 7h10v-2H7v2zm0 4h10v-2H7v2z' },
  { to: '/dashboard/services', label: 'Service Requests', icon: 'M17 2H7v20l5-3 5 3V2z' },
  { to: '/dashboard/notifications', label: 'Notifications', icon: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0' },
  { to: '/dashboard/profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
];

export default function CustomerLayout() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return <div className="skeleton h-40" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  const nav = (
    <nav className="space-y-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/dashboard'}
          className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-[var(--primary)] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-80"><path d={l.icon} /></svg>
          {l.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="bg-slate-50">
      <div className="container-x py-8">
        {/* Mobile nav toggle */}
        <button className="btn btn-outline btn-sm mb-4 md:hidden" onClick={() => setMobileOpen((o) => !o)}>
          {mobileOpen ? 'Hide Menu' : 'Account Menu'}
        </button>
        {mobileOpen && (
          <div className="card p-3 md:hidden">{nav}</div>
        )}

        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <aside className="hidden md:block">
            <div className="card card-pad">
              <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] font-bold text-white">
                    {user.full_name?.[0]?.toUpperCase()}
                  </span>
                )}
                <div>
                  <div className="truncate text-sm font-bold text-slate-800">{user.full_name}</div>
                  <div className="text-xs text-slate-400">Customer account</div>
                </div>
              </div>
              {nav}
            </div>
          </aside>
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}