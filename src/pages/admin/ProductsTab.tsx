import { useMemo, useRef, useState, type FormEvent } from 'react';
import {
  Camera,
  CloudUpload,
  EyeOff,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../hooks/useToast';
import {
  createProduct,
  deleteProduct,
  deleteProductImageByUrl,
  fetchAllProducts,
  fetchCategories,
  setProductActive,
  updateProduct,
  uploadProductImage,
  type ProductInput,
} from '../../services/products';
import { formatETB, stockLabel, stockLevel } from '../../lib/utils';
import type { Category, Product } from '../../types';
import { EmptyState, ErrorBox, Spinner } from '../../components/ui';

const PAGE_SIZE = 6;

interface FormState {
  id: string | null;
  name: string;
  brand: string;
  price: string;
  salePrice: string;
  stock: string;
  rating: string;
  sku: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  warranty: string;
  imageUrl: string;
  isActive: boolean;
  featured: boolean;
  resolution: string;
  nightVisionM: string;
}

const EMPTY_FORM: FormState = {
  id: null,
  name: '',
  brand: '',
  price: '',
  salePrice: '',
  stock: '10',
  rating: '0',
  sku: '',
  categoryId: '',
  description: '',
  shortDescription: '',
  warranty: '',
  imageUrl: '',
  isActive: true,
  featured: false,
  resolution: '',
  nightVisionM: '',
};

export function ProductsTab({ refreshSignal }: { refreshSignal: number }) {
  const { showToast } = useToast();
  const products = useQuery(() => fetchAllProducts(), [refreshSignal]);
  const categories = useQuery(() => fetchCategories(), []);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products.data ?? []).filter((p) => {
      if (categoryFilter !== 'all' && p.category?.slug !== categoryFilter) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.sku ?? '').toLowerCase().includes(term) ||
        (p.category?.name ?? '').toLowerCase().includes(term)
      );
    });
  }, [products.data, search, categoryFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      brand: product.brand ?? '',
      price: String(product.price),
      salePrice: product.sale_price == null ? '' : String(product.sale_price),
      stock: String(product.stock),
      rating: String(product.rating),
      sku: product.sku ?? '',
      categoryId: product.category_id ?? '',
      description: product.description,
      shortDescription: product.short_description ?? '',
      warranty: product.warranty ?? '',
      imageUrl: product.image_url,
      isActive: product.is_active,
      featured: product.featured ?? false,
      resolution: product.resolution ?? '',
      nightVisionM: product.night_vision_m == null ? '' : String(product.night_vision_m),
    });
    setShowForm(true);
  };

  const handleImage = async (file: File) => {
    try {
      const { url } = await uploadProductImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      showToast('Image uploaded', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Image upload failed', 'error');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const price = Number(form.price.replace(/[, ]/g, ''));
    const salePrice = form.salePrice === '' ? null : Number(form.salePrice.replace(/[, ]/g, ''));
    const stock = Number(form.stock);
    const rating = Number(form.rating || '0');
    if (!Number.isFinite(price) || price < 0) {
      showToast('Enter a valid price', 'error');
      return;
    }
    if (salePrice != null && (!Number.isFinite(salePrice) || salePrice < 0)) {
      showToast('Enter a valid sale price', 'error');
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      showToast('Enter a valid stock quantity', 'error');
      return;
    }
    if (rating < 0 || rating > 5) {
      showToast('Rating must be between 0 and 5', 'error');
      return;
    }

    const input: ProductInput = {
      name: form.name.trim(),
      short_description: form.shortDescription.trim(),
      description: form.description.trim(),
      warranty: form.warranty.trim(),
      brand: form.brand.trim(),
      price,
      sale_price: salePrice,
      stock,
      rating,
      sku: form.sku.trim(),
      category_id: form.categoryId || null,
      image_url: form.imageUrl,
      is_active: form.isActive,
      featured: form.featured,
      resolution: form.resolution.trim(),
      night_vision_m: form.nightVisionM === '' ? null : Number(form.nightVisionM),
      specifications: [],
      features: [],
    };

    setBusy(true);
    try {
      if (form.id) {
        await updateProduct(form.id, input);
        showToast('Product updated', 'success');
      } else {
        await createProduct(input);
        showToast('Product added', 'success');
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      await products.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product.id);
      if (product.image_url) {
        await deleteProductImageByUrl(product.image_url);
      }
      showToast('Product deleted', 'success');
      await products.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await setProductActive(product.id, !product.is_active);
      showToast(product.is_active ? 'Product deactivated' : 'Product activated', 'success');
      await products.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" /> Manage Products
        </h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={openAdd} className="btn-primary py-2 text-sm">
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="form-input !w-auto"
          >
            <option value="all">All Categories</option>
            {(categories.data ?? []).map((cat: Category) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input !w-44 pl-9"
            />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="glass-card p-6 rounded-2xl mb-6">
          <h4 className="font-semibold mb-4 text-blue-300">
            {form.id ? 'Edit Product' : 'Add New Product'}
          </h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              required
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Price (e.g. 8500)"
              required
              className="form-input"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              type="number"
              min="0"
              placeholder="Stock"
              className="form-input"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              placeholder="Rating (0-5)"
              className="form-input"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
            <select
              className="form-input"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">— Category —</option>
              {(categories.data ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="SKU (e.g. AD-CCTV-001)"
              className="form-input"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <input
              type="text"
              placeholder="Resolution (e.g. 4MP, 1080p)"
              className="form-input"
              value={form.resolution}
              onChange={(e) => setForm({ ...form, resolution: e.target.value })}
            />
            <input
              type="number"
              min="0"
              placeholder="Night vision range (m)"
              className="form-input"
              value={form.nightVisionM}
              onChange={(e) => setForm({ ...form, nightVisionM: e.target.value })}
            />

            <div className="md:col-span-2">
              <label className="text-sm text-gray-400 block mb-2">Product Image</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-white/15 rounded-xl px-4 py-6 text-center hover:border-brand-500/40 transition"
              >
                <CloudUpload className="w-6 h-6 text-blue-400/60 mx-auto mb-1" />
                <p className="text-sm text-gray-400">Click to upload product image</p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP (max 2MB)</p>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImage(file);
                  e.target.value = '';
                }}
              />
              {form.imageUrl && (
                <div className="mt-3 flex items-center gap-4">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover bg-white/5"
                  />
                  <div>
                    <p className="text-sm text-emerald-400">Image ready</p>
                    <button
                      type="button"
                      onClick={() => {
                        void deleteProductImageByUrl(form.imageUrl);
                        setForm({ ...form, imageUrl: '' });
                      }}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 mt-1"
                    >
                      <X className="w-3 h-3" /> Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            <textarea
              rows={2}
              placeholder="Description"
              className="md:col-span-2 form-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="accent-brand-500"
              />
              Active (visible in store)
            </label>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={busy} className="btn-primary py-2.5 flex-1">
                {form.id ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-outline py-2.5 flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {products.loading ? (
        <Spinner />
      ) : products.error ? (
        <ErrorBox message={products.error} onRetry={() => void products.refetch()} />
      ) : pageItems.length === 0 ? (
        <EmptyState message="No products found." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map((product) => {
              const level = stockLevel(product);
              return (
                <div key={product.id} className="glass-card rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-blue-400/60" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-gray-400">
                        {product.category?.name ?? 'Uncategorized'}
                        {product.sku && ` • ${product.sku}`}
                      </p>
                      <p className="text-orange-400 font-bold">{formatETB(product.price)}</p>
                      <span className={`stock-badge stock-${level}`}>{stockLabel(product)} ({product.stock})</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(product)} className="btn-outline flex-1 py-1.5 text-xs">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => void handleToggleActive(product)}
                      className="btn-outline flex-1 py-1.5 text-xs"
                      title={product.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {product.is_active ? (
                        <>
                          <PowerOff className="w-3 h-3" /> Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="w-3 h-3" /> Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => void handleDelete(product)}
                      className="p-1.5 rounded-full bg-white/5 text-red-400 hover:text-red-300 border border-white/10"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {!product.is_active && (
                    <p className="text-[10px] text-yellow-400 mt-1 flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Hidden from store
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {pageCount > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm ${
                    p === page ? 'bg-brand-500 text-white' : 'bg-white/5 text-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
