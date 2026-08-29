import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../../lib/api';
import { EmptyState, formatDate } from '../../components/ui';
import type { AppNotification } from '../../types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    apiGet<AppNotification[]>('/api/admin/notifications')
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markRead = async (id: string) => {
    await apiPatch(`/api/admin/notifications/${id}/read`);
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAll = async () => {
    await apiPatch('/api/admin/notifications/read-all');
    setNotifications((ns) => ns.map((n) => ({ ...n, is_read: true })));
  };

  if (loading) return <div className="skeleton h-40" />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">{notifications.filter((n) => !n.is_read).length} unread</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button className="text-sm font-semibold text-[var(--primary)] hover:underline" onClick={markAll}>Mark all as read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No notifications" subtitle="Updates about your orders and services will appear here." />
        </div>
      ) : (
        <div className="card mt-5 divide-y divide-slate-50 overflow-hidden">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex w-full gap-3 px-5 py-4 text-left hover:bg-slate-50 ${!n.is_read ? 'bg-blue-50/40' : ''}`}
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? 'bg-slate-200' : 'bg-blue-500'}`} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">{n.title}</div>
                {n.message && <div className="mt-0.5 text-sm text-slate-500">{n.message}</div>}
                <div className="mt-1 text-xs text-slate-400">{formatDate(n.created_at)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}