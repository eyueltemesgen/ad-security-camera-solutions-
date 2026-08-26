import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { fetchActiveProducts, fetchCategories } from '../../services/products';
import { cn } from '../../lib/utils';
import { EmptyState, ErrorBox, Spinner } from '../ui';
import { ProductCard } from './ProductCard';
import { useReveal } from '../../hooks/useReveal';

export function Products() {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const products = useQuery(() => fetchActiveProducts(), []);
  const categories = useQuery(() => fetchCategories(), []);
  const ref = useReveal<HTMLDivElement>();

  const filtered = useMemo(() => {
    const list = products.data ?? [];
    const term = search.trim().toLowerCase();
    return list.filter((product) => {
      if (category !== 'all' && product.category?.slug !== category) return false;
      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        (product.sku ?? '').toLowerCase().includes(term) ||
        (product.category?.name ?? '').toLowerCase().includes(term)
      );
    });
  }, [products.data, category, search]);

  return (
    <section id="products" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-panel relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10 reveal">
          <span className="section-eyebrow">
            <SlidersHorizontal className="w-3 h-3" />
            Shop
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Featured <span className="text-gradient">Products</span>
          </h2>
          <p className="mt-3 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Genuine security equipment with warranty
          </p>
        </div>

        <div className="max-w-md mx-auto mb-6 relative reveal">
          <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category…"
            className="form-input pl-10"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10 reveal">
          <button
            onClick={() => setCategory('all')}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium border transition-all duration-300',
              category === 'all'
                ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'border-white/10 text-gray-300 hover:border-brand-500/50 hover:bg-brand-500/5'
            )}
          >
            All
          </button>
          {(categories.data ?? []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium border transition-all duration-300',
                category === cat.slug
                  ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'border-white/10 text-gray-300 hover:border-brand-500/50 hover:bg-brand-500/5'
              )}
            >
              {cat.name}
            </button>
          ))}
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
                : 'No products match your search.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 reveal-stagger">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
