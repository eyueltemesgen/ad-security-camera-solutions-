import { useState } from 'react';
import { Navigate, NavLink, Route, Routes, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

import AdminDashboard from './AdminDashboard';
import AdminOrders from './AdminOrders';
import AdminServiceRequests from './AdminServiceRequests';
import AdminCustomers from './AdminCustomers';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminServices from './AdminServices';
import AdminMessages from './AdminMessages';
import AdminNotifications from './AdminNotifications';
import AdminGallery from './AdminGallery';
import AdminTestimonials from './AdminTestimonials';
import AdminFaqs from './AdminFaqs';
import AdminMedia from './AdminMedia';
import AdminWebsite from './AdminWebsite';
import AdminNavigation from './AdminNavigation';
import AdminSeo from './AdminSeo';
import AdminSettings from './AdminSettings';
import AdminAnnouncements from './AdminAnnouncements';
import AdminAuditLogs from './AdminAuditLogs';
import { UnauthorizedPage } from '../ErrorPages';

const SIDEBAR = [
  { to: '/admin', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z', end: true },
  { to: '/admin/orders', label: 'Orders', icon: 'M6 2h12l2 4v16H4V6l2-4zm2 4h8l-1-2H9l-1 2zm-1 7h10v-2H7v2zm0 4h10v-2H7v2z' },
  { to: '/admin/service-requests', label: 'Service Requests', icon: 'M17 2H7v20l5-3 5 3V2z' },
  { to: '/admin/customers', label: 'Customers', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
  { to: '/admin/products', label: 'Products', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M7 15h10M7 11h6' },
  { to: '/admin/categories', label: 'Categories', icon: 'M4 4h16v5H4zM4 13h16v7H4z' },
  { to: '/admin/services', label: 'Services', icon: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4L15 12l-3-3 2.7-2.7z' },
  { to: '/admin/messages', label: 'Messages', icon: 'M21 3H3v14h4v4l4-4h10V3zM7 8h10M7 12h6' },
  { to: '/admin/notifications', label: 'Notifications', icon: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0' },
  { to: '/admin/gallery', label: 'Gallery', icon: 'M3 5h18v14H3zM3 15l4-4 3 3 4-5 7 7' },
  { to: '/admin/testimonials', label: 'Testimonials', icon: 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z' },
  { to: '/admin/faqs', label: 'FAQs', icon: 'M8 10h8M8 14h5M9.1 6h5.8a7 7 0 1 1 0 14H9.1a7 7 0 1 1 0-14z' },
  { to: '/admin/media', label: 'Media Library', icon: 'M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11M10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM15 21l2.5 2.5L20 14l2.5 9.5L25 12' },
  { to: '/admin/website', label: 'Website', icon: 'M4 2h18v20H4zM4 6h18M7 3h.01M10 3h.01M8 10h12M8 14h8' },
  { to: '/admin/navigation', label: 'Navigation', icon: 'M3 12h18M3 5h18M3 19h18M6 4v2M6 11v2M6 18v2' },
  { to: '/admin/seo', label: 'SEO', icon: 'M9 3v18M15 3v18M3 9h18M3 15h18' },
  { to: '/admin/announcements', label: 'Announcements', icon: 'M6 12a6 6 0 0 1 12 0v4h2v4H4v-4h2v-4zM10 20a2 2 0 0 0 4 0' },
  { to: '/admin/settings', label: 'Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'M3 3h5v18H3zM16 3h5v18h-5zM8 9h8M8 15h8' },
];

function NavLinkItem({ to, label, icon, end }: { to: string; label: string; icon: string; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 opacity-90"><path d={icon} /></svg>
      {label}
    </NavLink>
  );
}

function AdminShell() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-[#0b1f33] transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-black text-slate-900">AD</span>
          <div>
            <div className="text-sm font-bold text-white">Admin Panel</div>
            <div className="text-xs text-slate-400">AD Security Camera</div>
          </div>
        </div>
        <nav className="h-[calc(100vh-76px)] space-y-0.5 overflow-y-auto px-3 pb-8">
          {SIDEBAR.map((item) => (
            <NavLinkItem key={item.to} {...item} />
          ))}
          <div className="my-3 border-t border-white/10" />
          <Link to="/" className="sidebar-link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 opacity-90"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
            View Website
          </Link>
          <button
            className="sidebar-link w-full"
            onClick={() => {
              logout();
              toast('Logged out');
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 opacity-90"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Logout
          </button>
        </nav>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="min-w-0 flex-1">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" /></svg>
          </button>
          <div className="text-sm font-semibold text-slate-700">Admin Control Center</div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Link to="/admin/messages" className="text-xs font-medium text-slate-500 hover:text-[var(--primary)]">Messages</Link>
            <Link to="/admin/notifications" className="text-xs font-medium text-slate-500 hover:text-[var(--primary)]">Notifications</Link>
            <div className="flex items-center gap-2">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                  {user?.full_name?.[0] ?? 'A'}
                </span>
              )}
              <span className="hidden text-xs font-semibold text-slate-700 sm:block">{user?.full_name}</span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="order/:id" element={<AdminOrders />} />
            <Route path="service-requests" element={<AdminServiceRequests />} />
            <Route path="service-request/:id" element={<AdminServiceRequests />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="faqs" element={<AdminFaqs />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="website" element={<AdminWebsite />} />
            <Route path="navigation" element={<AdminNavigation />} />
            <Route path="seo" element={<AdminSeo />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="*" element={<UnauthorizedPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-100">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <UnauthorizedPage />;

  return <AdminShell />;
}