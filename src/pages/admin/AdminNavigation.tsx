import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, Toolbar, Table, Th, Td, CancelButton } from './AdminUi';
import { Spinner } from '../../components/ui';
import type { NavigationItem } from '../../types';

const PRESETS = [
  '/', '/products', '/services', '/about', '/gallery', '/faq', '/contact', '/request-service', '/cart',
];

export default function AdminNavigation() {
  const { toast } = useToast();
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState({ id: null as string | null, label: '', url: '/', sort_order: '0', is_active: true });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiGet<NavigationItem[]>('/api/cms/navigation');
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
    if (!editingForm.label.trim() || !editingForm.url.trim()) return toast('Label and URL are required', 'error');
    setSaving(true);
    try {
      const payload = { label: editingForm.label, url: editingForm.url, sort_order: Number(editingForm.sort_order) || 0, is_active: editingForm.is_active };
      if (editingForm.id) {
        await apiPut(`/api/cms/navigation/${editingForm.id}`, payload);
        toast('Navigation item updated');
      } else {
        await apiPost('/api/cms/navigation', payload);
        toast('Navigation item created');
      }
      setOpen(false);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (n: NavigationItem) => {
    if (!window.confirm(`Delete nav item "${n.label}"?`)) return;
    try {
      await apiDelete(`/api/cms/navigation/${n.id}`);
      toast('Deleted');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const toggle = async (n: NavigationItem) => {
    try {
      await apiPut(`/api/cms/navigation/${n.id}`, { is_active: !n.is_active });
      setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, is_active: !n.is_active } : x)));
      toast(n.is_active ? 'Hidden' : 'Visible');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  if (error) return <AdminError error={error} />;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Navigation</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingForm({ id: null, label: '', url: '/', sort_order: String(items.length), is_active: true }); setOpen(true); }}>+ Add Item</button>
      </div>
      <p className="mb-6 text-sm text-slate-500">Menu items shown in the website header. Reorder with the sort field.</p>

      <Toolbar>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((u) => (
            <button key={u} className="btn btn-ghost btn-sm" onClick={() => setEditingForm((f) => ({ ...f, url: u }))}>{u}</button>
          ))}
        </div>
      </Toolbar>

      {loading ? (
        <LoadingBlock />
      ) : (
        <Table head={<><Th>Order</Th><Th>Label</Th><Th>URL</Th><Th>Status</Th><Th /></>}>
          {items.map((n) => (
            <tr key={n.id} className="hover:bg-slate-50">
              <Td>
                <input
                  className="input input-sm w-16"
                  type="number"
                  value={n.sort_order}
                  onChange={(e) => apiPut(`/api/cms/navigation/${n.id}`, { sort_order: Number(e.target.value) }).then(load).catch((err) => toast((err as Error).message, 'error'))}
                />
              </Td>
              <Td className="font-medium">{n.label}</Td>
              <Td className="font-mono text-xs text-slate-500">{n.url}</Td>
              <Td>
                <button className="text-lg" onClick={() => toggle(n)}>{n.is_active ? '🟢' : '🔴'}</button>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditingForm({ id: n.id, label: n.label, url: n.url, sort_order: String(n.sort_order), is_active: n.is_active }); setOpen(true); }}>Edit</button>
                  <button className="btn btn-ghost btn-sm text-red-600" onClick={() => remove(n)}>Delete</button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">{editingForm.id ? 'Edit Nav Item' : 'Add Nav Item'}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Label *</label>
                <input className="input" value={editingForm.label} onChange={(e) => setEditingForm((f) => ({ ...f, label: e.target.value }))} />
              </div>
              <div>
                <label className="label">URL *</label>
                <input className="input font-mono text-sm" value={editingForm.url} onChange={(e) => setEditingForm((f) => ({ ...f, url: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Sort Order</label>
                  <input className="input" type="number" value={editingForm.sort_order} onChange={(e) => setEditingForm((f) => ({ ...f, sort_order: e.target.value }))} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" checked={editingForm.is_active} onChange={(e) => setEditingForm((f) => ({ ...f, is_active: e.target.checked }))} /> Visible
                  </label>
                </div>
              </div>
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