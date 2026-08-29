import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useCms } from '../../hooks/useCms';
import { apiGet, apiPatch } from '../../lib/api';
import type { AppNotification } from '../../types';
import { formatDate } from '../ui';

function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="10" fill="var(--primary)" />
      <path d="M16.5 12h15l4 4.5H24a9 9 0 0 0-9 9v10.5H10.5V21a9 9 0 0 1 6-9z" fill="var(--accent)" />
      <circle cx="29" cy="27" r="6.5" stroke="var(--primary)" strokeWidth="2.5" fill="none" />
      <path d="M31.5 24.5l3-3" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    apiGet<AppNotification[]>('/api/admin/notifications').then(setNotifications).catch(() => setNotifications([]));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id: string) => {
    await apiPatch(`/api/admin/notifications/${id}/read`);
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAll = async () => {
    await apiPatch('/api/admin/notifications/read-all');
    setNotifications((ns) => ns.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 card overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-800">Notifications</span>
            {unread > 0 && (
              <button className="text-xs font-medium text-[var(--primary)] hover:underline" onClick={markAll}>
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</p>
            )}
            {notifications.slice(0, 20).map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`block w-full border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                  {n.title}
                </span>
                {n.message && <span className="mt-0.5 block text-xs text-slate-500">{n.message}</span>}
                <span className="mt-1 block text-[11px] text-slate-400">{formatDate(n.created_at)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="relative" ref={ref}>
      <button className="flex items-center gap-2" onClick={() => setOpen((o) => !o)}>
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full border border-slate-200 object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
            {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </span>
        )}
        <span className="hidden text-sm font-medium text-slate-700 md:block">{user?.full_name?.split(' ')[0]}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden text-slate-400 md:block"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-52 card overflow-hidden py-1 shadow-xl">
          {isAdmin ? (
            <>
              <Link to="/admin" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Admin Dashboard</Link>
              <Link to="/admin/messages" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Messages</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Dashboard</Link>
              <Link to="/dashboard/orders" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Orders</Link>
              <Link to="/dashboard/services" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Service Requests</Link>
              <Link to="/dashboard/notifications" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Notifications</Link>
              <Link to="/dashboard/profile" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</Link>
            </>
          )}
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={() => {
              logout();
              setOpen(false);
              navigate('/');
            }}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { site, brand } = useCms();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const navigation = site?.navigation ?? [];
  const companyName = String(brand.company_name ?? 'AD Security Camera Solution');
  const logoUrl = String(brand.logo_url ?? '');

  const logoutAction = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          {logoUrl ? (
            <img src={logoUrl} alt={`${companyName} logo`} className="h-10 w-10 rounded-md object-contain" />
          ) : (
            <LogoMark />
          )}
          <span className="hidden text-lg font-bold leading-tight sm:block">
            {companyName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {navigation.filter((n) => n.url !== '/').map((n) => (
            <NavLink
              key={n.label}
              to={n.url}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link to="/products?search=" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Search">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
          </Link>
          <Link to={user ? '/dashboard' : '/login'} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Account">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" /><circle cx="12" cy="7" r="4" /></svg>
          </Link>
          {user && <NotificationsMenu />}
          <Link to="/cart" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-slate-900">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden md:block">
              <AccountMenu />
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm hidden md:inline-flex">
              Login
            </Link>
          )}
          <Link to="/request-service" className="btn btn-accent btn-sm ml-1 hidden sm:inline-flex">
            Request Service
          </Link>
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{mobileOpen ? <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /> : <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />}</svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="container-x flex flex-col py-3">
            <NavLink to="/" className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>
              Home
            </NavLink>
            {navigation.filter((n) => n.url !== '/').map((n) => (
              <NavLink key={n.label} to={n.url} className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>
                {n.label}
              </NavLink>
            ))}
            <div className="my-1 border-t border-slate-100" />
            {user ? (
              <>
                <NavLink to="/dashboard" className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>
                  My Dashboard
                </NavLink>
                {user.role === 'admin' && (
                  <NavLink to="/admin" className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>
                    Admin Dashboard
                  </NavLink>
                )}
                <button
                  className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setMobileOpen(false);
                    logoutAction();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3 py-2">
                <Link to="/login" className="btn btn-primary btn-sm flex-1" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-outline btn-sm flex-1" onClick={() => setMobileOpen(false)}>Register</Link>
              </div>
            )}
            <Link to="/request-service" className="btn btn-accent m-3" onClick={() => setMobileOpen(false)}>
              Request Service
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}