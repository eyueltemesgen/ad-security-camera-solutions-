import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPatch } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, Table, Th, Td } from './AdminUi';
import { formatDate } from '../../components/ui';
import type { AppNotification } from '../../types';

export default function AdminNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'no-user'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiGet<AppNotification[]>(`/api/admin/notifications?admin=true`);
      setNotifications(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (n: AppNotification) => {
    try {
      await apiDelete(`/api/admin/notifications/${n.id}`);
      setNotifications((ns) => ns.filter((x) => x.id !== n.id));
      toast('Notification deleted');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const visible = filter === 'all' ? notifications : notifications.filter((n) => n.user_id === null);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Notifications</h1>
      <p className="mb-6 text-sm text-slate-500">System notifications including new orders, requests and messages.</p>

      <div className="mb-4 flex gap-2">
        <button className={`badge cursor-pointer ${filter === 'all' ? 'badge-active' : 'badge-option'}`} onClick={() => setFilter('all')}>All</button>
        <button className={`badge cursor-pointer ${filter === 'no-user' ? 'badge-active' : 'badge-option'}`} onClick={() => setFilter('no-user')}>Admin Alerts</button>
      </div>

      {error && <AdminError error={error} />}
      {loading ? (
        <LoadingBlock />
      ) : (
        <Table head={<><Th>Title</Th><Th>Message</Th><Th>Type</Th><Th>Audience</Th><Th>Date</Th><Th /></>}>
          {visible.map((n) => (
            <tr key={n.id} className="hover:bg-slate-50">
              <Td className="font-medium">{n.title}</Td>
              <Td className="max-w-md truncate text-slate-500">{n.message}</Td>
              <Td><span className="badge badge-option">{n.type}</span></Td>
              <Td>{n.user_id === null ? <span className="badge status-confirmed">Admins</span> : <span className="badge badge-option">Customer</span>}</Td>
              <Td className="text-slate-500">{formatDate(n.created_at)}</Td>
              <Td><button className="btn btn-ghost btn-sm text-red-600" onClick={() => remove(n)}>Delete</button></Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}