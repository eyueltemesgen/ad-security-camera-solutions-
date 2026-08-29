import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, SearchBox, Toolbar, Table, Th, Td, PaginationControls, CancelButton } from './AdminUi';
import { formatMoney, Spinner } from '../../components/ui';
import type { Product, Category } from '../../types';

const PAGE_SIZE = 25;
const EMPTY = {
  name: '',
  sku: '',
  brand: '',
  category_id: '',
  price: '',
  sale_price: '',
  cost_price: '',
  stock: '0',
  low_stock_threshold: '5',
  short_description: '',
  description: '',
  warranty_info: '',
  is_featured: false,
  is_active: true,
  image_url: '',
  images: [] as string[],
  specifications: [] as { key: string; value: string }[],
};

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<{ product: Product | null; form: typeof EMPTY } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), per_page: String(PAGE_SIZE), search, category });
      const r = await apiGet<{ products: Product[]; total: number }>(`/api/products/all/admin?${qs}`);
      setProducts(r.products);
      setTotal(r.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    load();
    apiGet<Category[]>('/api/products/categories/all/admin').then(setCategories).catch(() => setCategories([]));
  }, [load]);

  const fromProduct = (p: Product): typeof EMPTY => ({
    name: p.name,
    sku: p.sku,
    brand: p.brand,
    category_id: p.category_id ?? '',
    price: String(p.price),
    sale_price: p.sale_price == null ? '' : String(p.sale_price),
    cost_price: String(p.cost_price ?? ''),
    stock: String(p.stock),
    low_stock_threshold: String(p.low_stock_threshold ?? 5),
    short_description: p.short_description,
    description: p.description,
    warranty_info: p.warranty_info,
    is_featured: p.is_featured,
    is_active: p.is_active,
    image_url: p.image_url,
    images: p.images?.map((i) => i.url) ?? [],
    specifications: p.specifications?.map((s) => ({ key: s.key, value: s.value })) ?? [],
  });

  const openNew = () => setEditing({ product: null, form: { ...EMPTY } });
  const openEdit = (p: Product) => setEditing({ product: p, form: fromProduct(p) });

  const save = async () => {
    if (!editing) return;
    const f = editing.form;
    if (!f.name.trim()) return toast('Product name is required', 'error');
    if (!f.price || Number.isNaN(Number(f.price))) return toast('A valid price is required', 'error');
    setSaving(true);
    try {
      const payload = {
        name: f.name,
        sku: f.sku,
        category_id: f.category_id || null,
        brand: f.brand,
        price: Number(f.price),
        sale_price: f.sale_price === '' ? null : Number(f.sale_price),
        cost_price: Number(f.cost_price) || 0,
        stock: Number(f.stock) || 0,
        low_stock_threshold: Number(f.low_stock_threshold) || 5,
        short_description: f.short_description,
        description: f.description,
        warranty_info: f.warranty_info,
        is_featured: f.is_featured,
        is_active: f.is_active,
        image_url: f.image_url,
        images: f.images,
        specifications: f.specifications,
      };
      if (editing.product) {
        await apiPut(`/api/products/${editing.product.id}`, payload);
        toast('Product updated');
      } else {
        await apiPost('/api/products', payload);
        toast('Product created');
      }
      setEditing(null);
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete product "${p.name}"?`)) return;
    try {
      await apiDelete(`/api/products/${p.id}`);
      toast('Product deleted');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const quickToggle = async (p: Product, field: 'is_active' | 'is_featured') => {
    try {
      await apiPut(`/api/products/${p.id}`, { [field]: !p[field] });
      setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, [field]: !p[field] } : x)));
      toast(field === 'is_active' ? (p.is_active ? 'Product unpublished' : 'Product published') : p.is_featured ? 'Removed from featured' : 'Added to featured');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image_url' | 'images') => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload<{ url: string }>('/api/uploads/image', fd);
      if (target === 'image_url') {
        setEditing({ ...editing, form: { ...editing.form, image_url: res.url } });
      } else {
        setEditing({ ...editing, form: { ...editing.form, images: [...editing.form.images, res.url] } });
      }
      toast('Image uploaded');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Products</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add Product</button>
      </div>
      <p className="mb-6 text-sm text-slate-500">{total} products</p>

      <Toolbar>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, SKU…" />
          <select className="input input-sm" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Toolbar>

      {error && <AdminError error={error} />}
      {loading ? (
        <LoadingBlock label="Loading products…" />
      ) : (
        <>
          <Table head={<><Th>Product</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Featured</Th><Th>Status</Th><Th /></>}>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <Td>
                  <div className="flex items-center gap-2.5">
                    {p.image_url ? <img src={p.image_url} alt="" className="h-9 w-9 rounded object-cover" /> : <span className="h-9 w-9 rounded bg-slate-100" />}
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.brand} · {p.sku}</div>
                    </div>
                  </div>
                </Td>
                <Td className="text-slate-500">{p.category?.name ?? '—'}</Td>
                <Td>
                  <div className="font-semibold">{formatMoney(p.sale_price ?? p.price)}</div>
                  {p.sale_price && <div className="text-xs text-slate-400 line-through">{formatMoney(p.price)}</div>}
                </Td>
                <Td>
                  <span className={`badge ${p.stock <= p.low_stock_threshold ? 'status-cancelled' : 'status-completed'}`}>{p.stock} in stock</span>
                </Td>
                <Td>
                  <button className="text-lg" title="Toggle featured" onClick={() => quickToggle(p, 'is_featured')}>{p.is_featured ? '⭐' : '☆'}</button>
                </Td>
                <Td>
                  <button className="text-lg" title="Toggle publish" onClick={() => quickToggle(p, 'is_active')}>{p.is_active ? '🟢' : '🔴'}</button>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-ghost btn-sm text-red-600" onClick={() => remove(p)}>Delete</button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {/* Edit drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setEditing(null)} />
          <div className="relative z-10 flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="text-lg font-bold">{editing.product ? `Edit: ${editing.product.name}` : 'Add Product'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>✕ Close</button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Product Name *</label>
                  <input className="input" value={editing.form.name} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, name: e.target.value } })} />
                </div>
                <div>
                  <label className="label">SKU</label>
                  <input className="input" value={editing.form.sku} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, sku: e.target.value } })} />
                </div>
                <div>
                  <label className="label">Brand</label>
                  <input className="input" value={editing.form.brand} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, brand: e.target.value } })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Category</label>
                  <select className="input" value={editing.form.category_id} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, category_id: e.target.value } })}>
                    <option value="">— None —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Price (ETB) *</label>
                  <input className="input" type="number" min={0} value={editing.form.price} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, price: e.target.value } })} />
                </div>
                <div>
                  <label className="label">Sale Price (ETB)</label>
                  <input className="input" type="number" min={0} value={editing.form.sale_price} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, sale_price: e.target.value } })} />
                </div>
                <div>
                  <label className="label">Cost Price (ETB)</label>
                  <input className="input" type="number" min={0} value={editing.form.cost_price} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, cost_price: e.target.value } })} />
                </div>
                <div>
                  <label className="label">Low Stock Threshold</label>
                  <input className="input" type="number" min={0} value={editing.form.low_stock_threshold} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, low_stock_threshold: e.target.value } })} />
                </div>
                <div>
                  <label className="label">Stock Quantity</label>
                  <input className="input" type="number" min={0} value={editing.form.stock} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, stock: e.target.value } })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" checked={editing.form.is_active} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, is_active: e.target.checked } })} /> Published
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" checked={editing.form.is_featured} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, is_featured: e.target.checked } })} /> Featured
                  </label>
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
                <label className="label">Warranty Information</label>
                <input className="input" value={editing.form.warranty_info} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, warranty_info: e.target.value } })} />
              </div>

              {/* Main image */}
              <div>
                <label className="label">Main Image</label>
                <div className="flex items-start gap-3">
                  {editing.form.image_url ? <img src={editing.form.image_url} alt="" className="h-20 w-20 rounded-lg object-cover" /> : <span className="h-20 w-20 rounded-lg bg-slate-100" />}
                  <label className="btn btn-outline btn-sm cursor-pointer">
                    {uploading ? <Spinner className="h-3 w-3" /> : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, 'image_url')} />
                  </label>
                  {editing.form.image_url && <button className="btn btn-ghost btn-sm text-red-600" onClick={() => setEditing({ ...editing, form: { ...editing.form, image_url: '' } })}>Remove</button>}
                </div>
              </div>

              {/* Gallery */}
              <div>
                <label className="label">Image Gallery</label>
                <div className="flex flex-wrap gap-3">
                  {editing.form.images.map((url, i) => (
                    <div key={i} className="group relative">
                      <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <button className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-600 text-xs text-white" onClick={() => setEditing({ ...editing, form: { ...editing.form, images: editing.form.images.filter((_, j) => j !== i) } })}>✕</button>
                    </div>
                  ))}
                  <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400">
                    {uploading ? <Spinner className="h-4 w-4" /> : '+ Add'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e, 'images')} />
                  </label>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <label className="label">Specifications</label>
                <div className="space-y-2">
                  {editing.form.specifications.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input className="input input-sm" placeholder="Key (e.g. Resolution)" value={s.key} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, specifications: editing.form.specifications.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)) } })} />
                      <input className="input input-sm" placeholder="Value (e.g. 4MP)" value={s.value} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, specifications: editing.form.specifications.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) } })} />
                      <button className="btn btn-ghost btn-sm text-red-600" onClick={() => setEditing({ ...editing, form: { ...editing.form, specifications: editing.form.specifications.filter((_, j) => j !== i) } })}>✕</button>
                    </div>
                  ))}
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing({ ...editing, form: { ...editing.form, specifications: [...editing.form.specifications, { key: '', value: '' }] } })}>+ Add Specification</button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
              <CancelButton onClick={() => setEditing(null)} />
              <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
                {saving ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : editing.product ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}