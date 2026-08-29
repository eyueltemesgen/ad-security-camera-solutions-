import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, Toolbar, Table, Th, Td, CancelButton } from './AdminUi';
import type { Category, ServiceCategory } from '../../types';

type Tab = 'products' | 'services';

function CategoryManager({ kind }: { kind: Tab }) {
  const { toast } = useToast();
  const base = kind === 'products' ? '/api/products/categories' : '/api/services/categories';
  const [items, setItems] = useState<Array<Category & ServiceCategory>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string | null; name: string; description: string; sort_order: string; is_active: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiGet<Array<Category & ServiceCategory>>(`${base}/all/admin`);
      setItems(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => setEditing({ id: null, name: '', description: '', sort_order: '0', is_active: true });
  const openEdit = (c: Category & ServiceCategory) => setEditing({ id: c.id, name: c.name, description: c.description, sort_order: String(c.sort_order), is_active: c.is_active });

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast('Name is required', 'error');
    try {
      const payload = { name: editing.name, description: editing.description, sort_order: Number(editing.sort_order) || 0, is_active: editing.is_active };
      if (editing.id) {
        await apiPut(`${base}/${editing.id}`, payload);
        toast('Category updated');
      } else {
        await apiPost(base, payload);
        toast('Category created');
      }
      setEditing(null);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const remove = async (c: Category & ServiceCategory) => {
    const extra = 'product_count' in c && c.product_count ? ` (${c.product_count} products)` : 'service_count' in c && c.service_count ? ` (${c.service_count} services)` : '';
    if (!window.confirm(`Delete category "${c.name}"?${extra} Products/services will keep their data but lose the category.`)) return;
    try {
      await apiDelete(`${base}/${c.id}`);
      toast('Category deleted');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const toggle = async (c: Category & ServiceCategory) => {
    try {
      await apiPut(`${base}/${c.id}`, { is_active: !c.is_active });
      setItems((xs) => xs.map((x) => (x.id === c.id ? { ...x, is_active: !c.is_active } : x)));
      toast(c.is_active ? 'Category hidden' : 'Category published');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  if (error) return <AdminError error={error} />;
  if (loading) return <LoadingBlock />;

  return (
    <div>
      <Toolbar>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add {kind === 'products' ? 'Product' : 'Service'} Category</button>
      </Toolbar>
      <Table head={<><Th>Name</Th><Th>Slug</Th><Th>Description</Th><Th>Order</Th><Th>Items</Th><Th>Status</Th><Th /></>}>
        {items.map((c) => (
          <tr key={c.id} className="hover:bg-slate-50">
            <Td className="font-medium">{c.name}</Td>
            <Td className="font-mono text-xs text-slate-400">{c.slug}</Td>
            <Td className="max-w-md truncate text-slate-500">{c.description || '—'}</Td>
            <Td>{c.sort_order}</Td>
            <Td>{'product_count' in c && c.product_count ? c.product_count : 'service_count' in c ? (c.service_count ?? 0) : '—'}</Td>
            <Td>
              <button className="text-lg" onClick={() => toggle(c)}>{c.is_active ? '🟢' : '🔴'}</button>
            </Td>
            <Td>
              <div className="flex items-center gap-2">
                <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                <button className="btn btn-ghost btn-sm text-red-600" onClick={() => remove(c)}>Delete</button>
              </div>
            </Td>
          </tr>
        ))}
      </Table>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">{editing.id ? 'Edit' : 'New'} Category</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} autoFocus />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Sort Order</label>
                  <input className="input" type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Published
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <CancelButton onClick={() => setEditing(null)} />
              <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCategories() {
  const [tab, setTab] = useState<Tab>('products');
  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Categories</h1>
      <p className="mb-6 text-sm text-slate-500">Manage product and service categories.</p>
      <div className="mb-5 flex gap-2">
        <button className={`badge cursor-pointer ${tab === 'products' ? 'badge-active' : 'badge-option'}`} onClick={() => setTab('products')}>Product Categories</button>
        <button className={`badge cursor-pointer ${tab === 'services' ? 'badge-active' : 'badge-option'}`} onClick={() => setTab('services')}>Service Categories</button>
      </div>
      <CategoryManager key={tab} kind={tab} />
    </div>
  );
}