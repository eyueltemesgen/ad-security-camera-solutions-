import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { formatMoney } from '../ui';
import type { Product } from '../../types';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();

  const inStock = product.stock > 0;
  const price = product.sale_price ?? product.price;
  const image = product.image_url || product.images?.[0]?.url || '';

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast('Please login to add items to your cart', 'info');
      return;
    }
    try {
      await addItem(product.id);
      toast('Added to cart');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group card flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {image ? (
          <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="12" cy="13" r="3" /></svg>
          </div>
        )}
        {product.sale_price && product.sale_price < product.price ? (
          <span className="absolute left-3 top-3 badge bg-red-600 text-white">Sale</span>
        ) : null}
        {!inStock && (
          <span className="absolute right-3 top-3 badge bg-slate-900 text-white">Out of Stock</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {product.category?.name ?? 'Security Equipment'}
        </span>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</h3>
        {product.brand && <span className="mt-0.5 text-xs text-slate-400">{product.brand}</span>}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            {product.sale_price && (
              <span className="mr-2 text-xs text-slate-400 line-through">{formatMoney(product.price)}</span>
            )}
            <span className="text-base font-bold text-[var(--primary)]">{formatMoney(price)}</span>
          </div>
          <span className="text-xs font-medium text-emerald-600">{inStock ? `${product.stock} in stock` : '—'}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            className="btn btn-primary btn-sm flex-1"
            disabled={!inStock}
            onClick={handleAdd}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Add to Cart
          </button>
          <span className="btn btn-outline btn-sm shrink-0">Details</span>
        </div>
      </div>
    </Link>
  );
}