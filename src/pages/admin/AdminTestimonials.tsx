import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, Toolbar, Table, Th, Td, CancelButton } from './AdminUi';
import { Spinner } from '../../components/ui';
import type { Testimonial } from '../../types';

export default function AdminTestimonials() {
  const { toast } = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<{ id: string | null; name: string; company: string; rating: number; content: string; is_active: boolean; sort_order: string; image_url: string }>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiGet<Testimonial[]>('/api/cms/testimonials');
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

  const openNew = () => { setEditingForm({ ...EMPTY }); setOpen(true); };
  const openEdit = (t: Testimonial) => {
    setEditingForm({ id: t.id, name: t.name, company: t.company, rating: t.rating, content: t.content, is_active: t.is_active, sort_order: String(t.sort_order), image_url: t.image_url });
    setOpen(true);
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload<{ url: string }>('/api/uploads/image', fd);
      setEditingForm((f) => ({ ...f, image_url: res.url }));
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!editingForm.name.trim() || !editingForm.content.trim()) return toast('Name and testimonial text are required', 'error');
    setSaving(true);
    try {
      const payload = { name: editingForm.name, company: editingForm.company, rating: Number(editingForm.rating) || 5, content: editingForm.content, is_active: editingForm.is_active, sort_order: Number(editingForm.sort_order) || 0, image_url: editingForm.image_url };
      if (editingForm.id) {
        await apiPut(`/api/cms/testimonials/${editingForm.id}`, payload);
        toast('Testimonial updated');
      } else {
        await apiPost('/api/cms/testimonials', payload);
        toast('Testimonial created');
      }
      setOpen(false);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t: Testimonial) => {
    if (!window.confirm(`Delete testimonial from ${t.name}?`)) return;
    try {
      await apiDelete(`/api/cms/testimonials/${t.id}`);
      toast('Deleted');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const toggle = async (t: Testimonial) => {
    try {
      await apiPut(`/api/cms/testimonials/${t.id}`, { is_active: !t.is_active });
      setItems((xs) => xs.map((x) => (x.id === t.id ? { ...x, is_active: !t.is_active } : x)));
      toast(t.is_active ? 'Unpublished' : 'Published');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  if (error) return <AdminError error={error} />;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Testimonials</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add Testimonial</button>
      </div>
      <p className="mb-6 text-sm text-slate-500">Customer testimonials shown on the homepage and about page.</p>

      {loading ? (
        <LoadingBlock />
      ) : (
        <Table head={<><Th>Customer</Th><Th>Company</Th><Th>Rating</Th><Th>Testimonial</Th><Th>Status</Th><Th /></>}>
          {items.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <Td>
                <div className="flex items-center gap-2.5">
                  {t.image_url ? <img src={t.image_url} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="h-8 w-8 rounded-full bg-slate-100" />}
                  <span className="font-medium">{t.name}</span>
                </div>
              </Td>
              <Td className="text-slate-500">{t.company || '—'}</Td>
              <Td className="text-amber-500">{'★'.repeat(Math.max(1, Math.min(5, t.rating)))}{'☆'.repeat(5 - Math.max(1, Math.min(5, t.rating)))}</Td>
              <Td className="max-w-md truncate text-slate-500">{t.content}</Td>
              <Td><button className="text-lg" onClick={() => toggle(t)}>{t.is_active ? '🟢' : '🔴'}</button></Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Edit</button>
                  <button className="btn btn-ghost btn-sm text-red-600" onClick={() => remove(t)}>Delete</button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">{editingForm.id ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Customer Name *</label>
                <input className="input" value={editingForm.name} onChange={(e) => setEditingForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Company</label>
                  <input className="input" value={editingForm.company} onChange={(e) => setEditingForm((f) => ({ ...f, company: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Rating (1–5)</label>
                  <input className="input" type="number" min={1} max={5} value={editingForm.rating} onChange={(e) => setEditingForm((f) => ({ ...f, rating: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="label">Testimonial *</label>
                <textarea className="input" rows={4} value={editingForm.content} onChange={(e) => setEditingForm((f) => ({ ...f, content: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Sort Order</label>
                  <input className="input" type="number" value={editingForm.sort_order} onChange={(e) => setEditingForm((f) => ({ ...f, sort_order: e.target.value }))} />
                </div>
                <label className="flex items-end gap-2 pb-1 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={editingForm.is_active} onChange={(e) => setEditingForm((f) => ({ ...f, is_active: e.target.checked }))} /> Published
                </label>
                <div>
                  <label className="label">Photo</label>
                  <div className="flex items-center gap-2">
                    {editingForm.image_url ? <img src={editingForm.image_url} alt="" className="h-9 w-9 rounded-full object-cover" /> : null}
                    <label className="btn btn-outline btn-sm cursor-pointer">
                      {uploading ? <Spinner className="h-3 w-3" /> : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={upload} />
                    </label>
                  </div>
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

const EMPTY = { id: null, name: '', company: '', rating: 5, content: '', is_active: true, sort_order: '0', image_url: '' };