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
    <section id="products" ref={ref} className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-panel relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-6 md:mb-10 reveal">
          <span className="section-eyebrow">
            <SlidersHorizontal className="w-3 h-3" />
            Shop
          </span>
          <h2 className="text-2xl md:text-5xl font-extrabold tracking-tight">
            Featured <span className="text-gradient">Products</span>
          </h2>
          <p className="mt-2 md:mt-3 text-sm md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Genuine security equipment with warranty
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-4 relative reveal">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category…"
            className="form-input pl-10 h-12"
          />
        </div>

        {/* Horizontal scrolling filter pills (swipeable on mobile) */}
        <div className="reveal mb-8 md:mb-10 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            <FilterPill active={category === 'all'} onClick={() => setCategory('all')}>
              All
            </FilterPill>
            {(categories.data ?? []).map((cat) => (
              <FilterPill key={cat.id} active={category === cat.slug} onClick={() => setCategory(cat.slug)}>
                {cat.name}
              </FilterPill>
            ))}
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
                : 'No products match your search.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 reveal-stagger">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-shrink-0 h-10 px-5 rounded-full text-sm font-medium border transition-all duration-300 whitespace-nowrap active:scale-95',
        active
          ? 'text-white border-transparent shadow-lg'
          : 'hover:bg-brand-500/5'
      )}
      style={
        active
          ? { background: 'linear-gradient(145deg, #3bb37f, #1f7f57)', boxShadow: '0 6px 20px rgba(85,201,151,0.3)' }
          : { borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }
      }
    >
      {children}
    </button>
  );
}
