import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCategories, useProducts } from '../hooks/useData';
import ProductCard from '../components/home/ProductCard';
import { EmptyState, Pagination, PageTitle, Select } from '../components/ui';

const PER_PAGE = 12;

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const { categories } = useCategories();

  const category = params.get('category') ?? '';
  const search = params.get('search') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const minPrice = params.get('min_price') ?? '';
  const maxPrice = params.get('max_price') ?? '';
  const availability = params.get('availability') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const { products, total, loading } = useProducts({
    category: category || undefined,
    search: search || undefined,
    sort: sort || undefined,
    min_price: minPrice || undefined,
    max_price: maxPrice || undefined,
    availability: availability || undefined,
    page,
    per_page: PER_PAGE,
  });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <PageTitle
        title="Products"
        subtitle="Professional security equipment — cameras, recorders, access control and more."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Products' }]}
      />
      <div className="container-x py-8">
        {/* Search + filters */}
        <div className="card card-pad sticky top-[var(--header-h)] z-10 mb-6 bg-white shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <input
                className="input"
                placeholder="Search by name, SKU, brand…"
                defaultValue={search}
                onKeyDown={(e) => { if (e.key === 'Enter') setParam('search', (e.target as HTMLInputElement).value); }}
              />
            </div>
            <div>
              <Select value={category} onChange={(v) => setParam('category', v)}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <Select value={availability} onChange={(v) => setParam('availability', v)}>
                <option value="">Any Availability</option>
                <option value="in_stock">In Stock</option>
                <option value="out">Out of Stock</option>
              </Select>
            </div>
            <div>
              <Select value={sort} onChange={(v) => setParam('sort', v)}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="featured">Featured</option>
                <option value="popular">Popular</option>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input className="input" placeholder="Min ETB" value={minPrice} onChange={(e) => setParam('min_price', e.target.value)} inputMode="numeric" />
              <input className="input" placeholder="Max ETB" value={maxPrice} onChange={(e) => setParam('max_price', e.target.value)} inputMode="numeric" />
            </div>
          </div>
          {(search || category || minPrice || maxPrice || availability) && (
            <button className="mt-3 text-xs font-medium text-[var(--primary)] hover:underline" onClick={() => setParams(new URLSearchParams())}>
              Clear all filters
            </button>
          )}
        </div>

        <p className="mb-4 text-sm text-slate-500">{total} product{total === 1 ? '' : 's'} found</p>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-72" />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            subtitle="Try adjusting your search or filters."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={(p) => setParam('page', String(p))} />
          </>
        )}
      </div>
    </div>
  );
}