import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, Toolbar, Table, Th, Td, CancelButton } from './AdminUi';
import { Spinner } from '../../components/ui';
import type { GalleryItem } from '../../types';

const CATEGORIES = ['CCTV Installation', 'Access Control', 'Networking', 'Time Attendance', 'Video Intercom', 'Security Projects', 'Other'];

export default function AdminGallery() {
  const { toast } = useToast();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<GalleryItem | 'new' | null>(null);
  const [editingForm, setEditingForm] = useState({ title: '', description: '', category: CATEGORIES[0], is_active: true, is_featured: false, sort_order: '0', image_url: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiGet<GalleryItem[]>('/api/cms/gallery');
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

  const openNew = () => { setEditing('new'); setEditingForm({ title: '', description: '', category: CATEGORIES[0], is_active: true, is_featured: false, sort_order: '0', image_url: '' }); };
  const openEdit = (g: GalleryItem) => { setEditing(g); setEditingForm({ title: g.title, description: g.description, category: g.category, is_active: g.is_active, is_featured: g.is_featured, sort_order: String(g.sort_order), image_url: g.image_url }); };

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
    if (!editing) return;
    if (!editingForm.title.trim()) return toast('Title is required', 'error');
    setSaving(true);
    try {
      const payload = {
        title: editingForm.title,
        description: editingForm.description,
        category: editingForm.category,
        is_active: editingForm.is_active,
        is_featured: editingForm.is_featured,
        sort_order: Number(editingForm.sort_order) || 0,
        ...(editing === 'new' ? { image_url: editingForm.image_url } : {}),
      };
      if (editing === 'new') {
        await apiPost('/api/cms/gallery', payload);
        toast('Gallery item created');
      } else {
        await apiPut(`/api/cms/gallery/${editing.id}`, payload);
        toast('Gallery item updated');
      }
      setEditing(null);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (g: GalleryItem) => {
    if (!window.confirm(`Delete gallery item "${g.title}"?`)) return;
    try {
      await apiDelete(`/api/cms/gallery/${g.id}`);
      toast('Deleted');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const toggle = async (g: GalleryItem, field: 'is_active' | 'is_featured') => {
    try {
      await apiPut(`/api/cms/gallery/${g.id}`, { [field]: !g[field] });
      setItems((xs) => xs.map((x) => (x.id === g.id ? { ...x, [field]: !g[field] } : x)));
      toast('Updated');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  if (error) return <AdminError error={error} />;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Gallery</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add Image</button>
      </div>
      <p className="mb-6 text-sm text-slate-500">{items.length} gallery items · Featured images appear on the homepage.</p>

      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((g) => (
            <div key={g.id} className="card overflow-hidden">
              <div className="relative aspect-video">
                <img src={g.image_url} alt={g.title} className="h-full w-full object-cover" />
                <div className="absolute right-2 top-2 flex gap-1">
                  <span className={`badge ${g.is_featured ? 'status-completed' : 'badge-option'}`}>{g.is_featured ? '✨ Featured' : '—'}</span>
                </div>
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-semibold">{g.title}</div>
                <div className="text-xs text-slate-400">{g.category}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(g)}>Edit</button>
                  <button className="text-sm" title="Featured" onClick={() => toggle(g, 'is_featured')}>{g.is_featured ? '⭐' : '☆'}</button>
                  <button className="text-sm" title="Publish" onClick={() => toggle(g, 'is_active')}>{g.is_active ? '🟢' : '🔴'}</button>
                  <button className="btn btn-ghost btn-sm ml-auto text-red-600" onClick={() => remove(g)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold">{editing === 'new' ? 'Add Gallery Image' : 'Edit Gallery Item'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>✕ Close</button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {editing === 'new' && (
                <div>
                  <label className="label">Image *</label>
                  <div className="flex items-start gap-3">
                    {editingForm.image_url ? <img src={editingForm.image_url} alt="" className="h-20 w-20 rounded-lg object-cover" /> : <span className="h-20 w-20 rounded-lg bg-slate-100" />}
                    <label className="btn btn-outline btn-sm cursor-pointer">
                      {uploading ? <Spinner className="h-3 w-3" /> : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={upload} />
                    </label>
                  </div>
                </div>
              )}
              <div>
                <label className="label">Title</label>
                <input className="input" value={editingForm.title} onChange={(e) => setEditingForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={editingForm.description} onChange={(e) => setEditingForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={editingForm.category} onChange={(e) => setEditingForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Sort Order</label>
                  <input className="input" type="number" value={editingForm.sort_order} onChange={(e) => setEditingForm((f) => ({ ...f, sort_order: e.target.value }))} />
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={editingForm.is_active} onChange={(e) => setEditingForm((f) => ({ ...f, is_active: e.target.checked }))} /> Published
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={editingForm.is_featured} onChange={(e) => setEditingForm((f) => ({ ...f, is_featured: e.target.checked }))} /> Featured
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <CancelButton onClick={() => setEditing(null)} />
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