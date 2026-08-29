import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, Toolbar, Table, Th, Td, CancelButton } from './AdminUi';
import { Spinner, formatDate } from '../../components/ui';
import type { Announcement } from '../../types';

export default function AdminAnnouncements() {
  const { toast } = useToast();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState({ id: null as string | null, title: '', message: '', cta_label: '', cta_url: '', start_at: '', end_at: '', is_active: true, image_url: '' });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiGet<Announcement[]>('/api/cms/announcements');
      setItems(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!editingForm.title.trim()) return toast('Title is required', 'error');
    setSaving(true);
    try {
      const payload = {
        title: editingForm.title,
        message: editingForm.message,
        cta_label: editingForm.cta_label,
        cta_url: editingForm.cta_url,
        start_at: editingForm.start_at ? new Date(editingForm.start_at).toISOString() : null,
        end_at: editingForm.end_at ? new Date(editingForm.end_at).toISOString() : null,
        is_active: editingForm.is_active,
        image_url: editingForm.image_url,
      };
      if (editingForm.id) {
        await apiPut(`/api/cms/announcements/${editingForm.id}`, payload);
        toast('Announcement updated');
      } else {
        await apiPost('/api/cms/announcements', payload);
        toast('Announcement created');
      }
      setOpen(false);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a: Announcement) => {
    if (!window.confirm(`Delete announcement "${a.title}"?`)) return;
    try {
      await apiDelete(`/api/cms/announcements/${a.id}`);
      toast('Deleted');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const toggle = async (a: Announcement) => {
    try {
      await apiPut(`/api/cms/announcements/${a.id}`, { is_active: !a.is_active });
      setItems((xs) => xs.map((x) => (x.id === a.id ? { ...x, is_active: !a.is_active } : x)));
      toast(a.is_active ? 'Paused' : 'Active');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload<{ url: string }>('/api/uploads/image', fd);
      setEditingForm((f) => ({ ...f, image_url: res.url }));
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  const isLive = (a: Announcement) => {
    if (!a.is_active) return false;
    const now = new Date();
    if (a.start_at && new Date(a.start_at) > now) return false;
    if (a.end_at && new Date(a.end_at) < now) return false;
    return true;
  };

  if (error) return <AdminError error={error} />;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Announcements</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingForm({ id: null, title: '', message: '', cta_label: '', cta_url: '', start_at: '', end_at: '', is_active: true, image_url: '' }); setOpen(true); }}>+ Add Announcement</button>
      </div>
      <p className="mb-6 text-sm text-slate-500">Scheduled announcements displayed as a banner on the website.</p>

      {loading ? (
        <LoadingBlock />
      ) : (
        <Table head={<><Th>Title</Th><Th>Schedule</Th><Th>Status</Th><Th /></>}>
          {items.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50">
              <Td>
                <div className="font-medium">{a.title}</div>
                <div className="truncate text-xs text-slate-400">{a.message}</div>
              </Td>
              <Td className="text-slate-500">
                {a.start_at ? formatDate(a.start_at) : 'Any time'} → {a.end_at ? formatDate(a.end_at) : 'No end'}
              </Td>
              <Td>
                <span className={`badge ${isLive(a) ? 'status-completed' : a.is_active ? 'status-pending' : 'status-cancelled'}`}>
                  {isLive(a) ? 'Live' : a.is_active ? 'Scheduled/Paused' : 'Draft'}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditingForm({ id: a.id, title: a.title, message: a.message, cta_label: a.cta_label, cta_url: a.cta_url, start_at: a.start_at ? a.start_at.slice(0, 10) : '', end_at: a.end_at ? a.end_at.slice(0, 10) : '', is_active: a.is_active, image_url: a.image_url }); setOpen(true); }}>Edit</button>
                  <button className="text-[var(--primary)]" title="Toggle" onClick={() => toggle(a)}>{a.is_active ? '⏸' : '▶'}</button>
                  <button className="btn btn-ghost btn-sm text-red-600" onClick={() => remove(a)}>Delete</button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">{editingForm.id ? 'Edit Announcement' : 'Add Announcement'}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input className="input" value={editingForm.title} onChange={(e) => setEditingForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input" rows={3} value={editingForm.message} onChange={(e) => setEditingForm((f) => ({ ...f, message: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">CTA Label</label>
                  <input className="input" value={editingForm.cta_label} onChange={(e) => setEditingForm((f) => ({ ...f, cta_label: e.target.value }))} />
                </div>
                <div>
                  <label className="label">CTA URL</label>
                  <input className="input" value={editingForm.cta_url} onChange={(e) => setEditingForm((f) => ({ ...f, cta_url: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input className="input" type="date" value={editingForm.start_at} onChange={(e) => setEditingForm((f) => ({ ...f, start_at: e.target.value }))} />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input className="input" type="date" value={editingForm.end_at} onChange={(e) => setEditingForm((f) => ({ ...f, end_at: e.target.value }))} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={editingForm.is_active} onChange={(e) => setEditingForm((f) => ({ ...f, is_active: e.target.checked }))} /> Active
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <CancelButton onClick={() => setOpen(false)} />
              <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
                {saving ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}