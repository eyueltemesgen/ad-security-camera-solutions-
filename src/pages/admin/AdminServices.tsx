import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, Toolbar, Table, Th, Td, CancelButton } from './AdminUi';
import { Spinner } from '../../components/ui';
import type { Service, ServiceCategory } from '../../types';

const EMPTY = {
  name: '',
  category_id: '',
  icon: 'wrench',
  image_url: '',
  short_description: '',
  description: '',
  features: [] as { label: string }[],
  is_featured: false,
  is_active: true,
  sort_order: '0',
};

export default function AdminServices() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ service: Service | null; form: typeof EMPTY } | null>(null);
  const [saving, setSaving] = useState(false);
  const [featureText, setFeatureText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiGet<{ services: Service[]; total: number }>('/api/services/all/admin');
      if (Array.isArray(r)) {
        setServices(r as unknown as Service[]);
      } else {
        setServices(r.services);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    apiGet<ServiceCategory[]>('/api/services/categories/all/admin').then(setCategories).catch(() => setCategories([]));
  }, [load]);

  const fromService = (s: Service): typeof EMPTY => ({
    name: s.name,
    category_id: s.category_id ?? '',
    icon: s.icon,
    image_url: s.image_url,
    short_description: s.short_description,
    description: s.description,
    features: s.features ?? [],
    is_featured: s.is_featured,
    is_active: s.is_active,
    sort_order: String(s.sort_order),
  });

  const openNew = () => setEditing({ service: null, form: { ...EMPTY } });
  const openEdit = (s: Service) => setEditing({ service: s, form: fromService(s) });

  const save = async () => {
    if (!editing) return;
    const f = editing.form;
    if (!f.name.trim()) return toast('Service name is required', 'error');
    setSaving(true);
    try {
      const payload = {
        name: f.name,
        category_id: f.category_id || null,
        icon: f.icon,
        image_url: f.image_url,
        short_description: f.short_description,
        description: f.description,
        features: f.features,
        is_featured: f.is_featured,
        is_active: f.is_active,
        sort_order: Number(f.sort_order) || 0,
      };
      if (editing.service) {
        await apiPut(`/api/services/${editing.service.id}`, payload);
        toast('Service updated');
      } else {
        await apiPost('/api/services', payload);
        toast('Service created');
      }
      setEditing(null);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Service) => {
    if (!window.confirm(`Delete service "${s.name}"?`)) return;
    try {
      await apiDelete(`/api/services/${s.id}`);
      toast('Service deleted');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const toggle = async (s: Service, field: 'is_active' | 'is_featured') => {
    try {
      await apiPut(`/api/services/${s.id}`, { [field]: !s[field] });
      setServices((xs) => xs.map((x) => (x.id === s.id ? { ...x, [field]: !s[field] } : x)));
      toast('Updated');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload<{ url: string }>('/api/uploads/image', fd);
      setEditing({ ...editing, form: { ...editing.form, image_url: res.url } });
      toast('Image uploaded');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  if (error) return <AdminError error={error} />;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Services</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add Service</button>
      </div>
      <p className="mb-6 text-sm text-slate-500">Services shown on the customer website.</p>

      {loading ? (
        <LoadingBlock />
      ) : (
        <Table head={<><Th>Service</Th><Th>Category</Th><Th>Description</Th><Th>Featured</Th><Th>Status</Th><Th /></>}>
          {services.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <Td>
                <div className="flex items-center gap-2.5">
                  {s.image_url ? <img src={s.image_url} alt="" className="h-9 w-9 rounded object-cover" /> : <span className={`h-9 w-9 rounded bg-slate-100 text-lg flex items-center justify-center`}>🔧</span>}
                  <span className="font-medium">{s.name}</span>
                </div>
              </Td>
              <Td className="text-slate-500">{s.category?.name ?? '—'}</Td>
              <Td className="max-w-md truncate text-slate-500">{s.short_description || '—'}</Td>
              <Td><button className="text-lg" onClick={() => toggle(s, 'is_featured')}>{s.is_featured ? '⭐' : '☆'}</button></Td>
              <Td><button className="text-lg" onClick={() => toggle(s, 'is_active')}>{s.is_active ? '🟢' : '🔴'}</button></Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                  <button className="btn btn-ghost btn-sm text-red-600" onClick={() => remove(s)}>Delete</button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setEditing(null)} />
          <div className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="text-lg font-bold">{editing.service ? `Edit: ${editing.service.name}` : 'Add Service'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>✕ Close</button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Service Name *</label>
                  <input className="input" value={editing.form.name} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, name: e.target.value } })} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={editing.form.category_id} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, category_id: e.target.value } })}>
                    <option value="">— None —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Icon</label>
                  <select className="input" value={editing.form.icon} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, icon: e.target.value } })}>
                    {['wrench', 'camera', 'network', 'fingerprint', 'users', 'globe', 'shield', 'clock', 'video', 'lock', 'server', 'phone'].map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Sort Order</label>
                  <input className="input" type="number" value={editing.form.sort_order} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, sort_order: e.target.value } })} />
                </div>
                <div className="grid grid-cols-2 items-end gap-3 pb-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" checked={editing.form.is_active} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, is_active: e.target.checked } })} /> Published
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" checked={editing.form.is_featured} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, is_featured: e.target.checked } })} /> Featured
                  </label>
                </div>
              </div>

              <div>
                <label className="label">Service Image</label>
                <div className="flex items-start gap-3">
                  {editing.form.image_url ? <img src={editing.form.image_url} alt="" className="h-20 w-20 rounded-lg object-cover" /> : <span className="h-20 w-20 rounded-lg bg-slate-100" />}
                  <label className="btn btn-outline btn-sm cursor-pointer">Upload<input type="file" accept="image/*" className="hidden" onChange={uploadImage} /></label>
                  {editing.form.image_url && <button className="btn btn-ghost btn-sm text-red-600" onClick={() => setEditing({ ...editing, form: { ...editing.form, image_url: '' } })}>Remove</button>}
                </div>
              </div>

              <div>
                <label className="label">Short Description</label>
                <input className="input" value={editing.form.short_description} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, short_description: e.target.value } })} />
              </div>
              <div>
                <label className="label">Full Description</label>
                <textarea className="input min-h-24" rows={5} value={editing.form.description} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, description: e.target.value } })} />
              </div>

              <div>
                <label className="label">Features</label>
                <div className="space-y-2">
                  {editing.form.features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input className="input input-sm" value={f.label} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, features: editing.form.features.map((x, j) => (j === i ? { label: e.target.value } : x)) } })} />
                      <button className="btn btn-ghost btn-sm text-red-600" onClick={() => setEditing({ ...editing, form: { ...editing.form, features: editing.form.features.filter((_, j) => j !== i) } })}>✕</button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input className="input input-sm" value={featureText} onChange={(e) => setFeatureText(e.target.value)} placeholder="Add a feature…" />
                    <button className="btn btn-outline btn-sm" onClick={() => { if (featureText.trim()) { setEditing({ ...editing, form: { ...editing.form, features: [...editing.form.features, { label: featureText.trim() }] } }); setFeatureText(''); } }}>+ Add</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
              <CancelButton onClick={() => setEditing(null)} />
              <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
                {saving ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : editing.service ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}