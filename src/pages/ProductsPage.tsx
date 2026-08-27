import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '../hooks/useQuery';
import { fetchActiveProducts, fetchCategories } from '../services/products';
import { cn, formatETB } from '../lib/utils';
import { EmptyState, ErrorBox, Spinner } from '../components/ui';
import { ProductCard } from '../components/home/ProductCard';
import { useReveal } from '../hooks/useReveal';

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'featured';

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('featured');
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [availability, setAvailability] = useState<'all' | 'in_stock'>('all');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const products = useQuery(() => fetchActiveProducts(), []);
  const categories = useQuery(() => fetchCategories(), []);
  const ref = useReveal<HTMLDivElement>();

  const filtered = useMemo(() => {
    let list = products.data ?? [];
    const term = search.trim().toLowerCase();
    if (category !== 'all') list = list.filter((p) => p.category?.slug === category);
    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.sku ?? '').toLowerCase().includes(term) ||
          (p.brand ?? '').toLowerCase().includes(term) ||
          (p.category?.name ?? '').toLowerCase().includes(term)
      );
    }
    const maxP = Number(maxPrice.replace(/[, ]/g, ''));
    if (!Number.isNaN(maxP) && maxP > 0) list = list.filter((p) => p.price <= maxP);
    if (availability === 'in_stock') list = list.filter((p) => p.stock > 0);

    const priceOf = (p: (typeof list)[number]) => p.sale_price ?? p.price;
    if (sort === 'price_asc') list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === 'price_desc') list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === 'featured') list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    if (sort === 'newest') list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [products.data, category, search, sort, availability, maxPrice]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setParams(value ? { q: value } : {});
  };

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <span className="section-eyebrow">
            <SlidersHorizontal className="w-3 h-3" /> Shop
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2">
            Security <span className="text-gradient">Products</span>
          </h1>
          <p className="mt-2 text-sm md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Genuine security equipment with warranty
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 mb-8 space-y-3" ref={ref}>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, SKU, brand or category…"
                className="form-input pl-10 h-12"
              />
            </div>
            <select className="form-input md:w-52" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="form-input md:w-48" value={availability} onChange={(e) => setAvailability(e.target.value as typeof availability)}>
              <option value="all">All availability</option>
              <option value="in_stock">In stock</option>
            </select>
            <input
              type="number"
              min="0"
              placeholder={`Max price (${formatETB(0).replace('0', '')})`}
              className="form-input md:w-48"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <FilterPill active={category === 'all'} onClick={() => setCategory('all')}>All</FilterPill>
              {(categories.data ?? []).map((cat) => (
                <FilterPill key={cat.id} active={category === cat.slug} onClick={() => setCategory(cat.slug)}>
                  {cat.name}
                </FilterPill>
              ))}
            </div>
          </div>
        </div>

        {products.loading ? (
          <Spinner />
        ) : products.error ? (
          <ErrorBox message={products.error} onRetry={() => void products.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            message={
              (products.data ?? []).length === 0
                ? 'No products available yet. Check back soon.'
                : 'No products match your filters.'
            }
          />
        ) : (
          <>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} product{filtered.length === 1 ? '' : 's'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-10 px-4 rounded-full text-sm font-medium border transition-all whitespace-nowrap',
        active ? 'text-white border-transparent' : 'hover:bg-brand-500/5'
      )}
      style={
        active
          ? { background: 'linear-gradient(145deg, #3bb37f, #1f7f57)' }
          : { borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }
      }
    >
      {children}
    </button>
  );
}