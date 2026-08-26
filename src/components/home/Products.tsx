import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { fetchActiveProducts, fetchCategories } from '../../services/products';
import { cn } from '../../lib/utils';
import { EmptyState, ErrorBox, Spinner } from '../ui';
import { ProductCard } from './ProductCard';

export function Products() {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const products = useQuery(() => fetchActiveProducts(), []);
  const categories = useQuery(() => fetchCategories(), []);

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
    <section id="products" className="py-20 px-4 sm:px-6 lg:px-8 bg-panel">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Featured <span className="text-gradient">Products</span>
          </h2>
          <p className="text-gray-400 mt-2">Genuine security equipment with warranty</p>
        </div>

        <div className="max-w-md mx-auto mb-6 relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category…"
            className="form-input pl-10"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setCategory('all')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
              category === 'all'
                ? 'bg-brand-500 border-brand-500 text-white'
                : 'border-white/10 text-gray-300 hover:border-brand-500/50'
            )}
          >
            All
          </button>
          {(categories.data ?? []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium border transition-all',
                category === cat.slug
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-white/10 text-gray-300 hover:border-brand-500/50'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
