import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Camera, Heart, Minus, Package, Plus, ShieldCheck, ShoppingCart, Star } from 'lucide-react';
import { useQuery } from '../hooks/useQuery';
import { fetchAllProducts } from '../services/products';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useStorefront } from '../hooks/useStorefront';
import { useToast } from '../hooks/useToast';
import { useWishlist } from '../hooks/useWishlist';
import { cn, formatETB, stockLabel, stockLevel } from '../lib/utils';
import { EmptyState, ErrorBox, Spinner, Stars } from '../components/ui';
import { ProductCard } from '../components/home/ProductCard';

export function ProductDetailPage() {
  const { slug } = useParams();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { openCheckout, openAuth } = useStorefront();
  const { toggle, isWishlisted } = useWishlist();
  const products = useQuery(() => fetchAllProducts(), []);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const product = useMemo(
    () => (products.data ?? []).find((p) => p.slug === slug && p.is_active) ?? null,
    [products.data, slug]
  );

  if (products.loading) return <Spinner className="min-h-[50vh]" />;
  if (products.error) return <ErrorBox message={products.error} onRetry={() => void products.refetch()} />;
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState message="Product not found." />
      </div>
    );
  }

  const level = stockLevel(product);
  const outOfStock = level === 'out';
  const price = product.sale_price ?? product.price;
  const images = [product.image_url, ...(product.images ?? []).map((i) => i.url)].filter(Boolean);
  const specifications = Array.isArray(product.specifications) ? product.specifications : [];
  const features = Array.isArray(product.features) ? product.features : [];
  const related = (products.data ?? [])
    .filter((p) => p.is_active && p.id !== product.id)
    .filter((p) => p.category_id === product.category_id)
    .slice(0, 4);
  const relatedList = related.length >= 4 ? related : (products.data ?? [])
    .filter((p) => p.is_active && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    addItem(product, qty);
    showToast(`${product.name} added to cart`, 'success');
  };
  const handleBuyNow = () => {
    if (!user) {
      openAuth();
      showToast('Sign in to place an order', 'info');
      return;
    }
    openCheckout([{ product, quantity: qty }]);
  };

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <Link to="/" className="hover:text-brand-400">Home</Link> /{' '}
          <Link to="/products" className="hover:text-brand-400">Products</Link> /{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="relative bg-white/5 rounded-2xl h-72 md:h-96 flex items-center justify-center overflow-hidden">
              <img src={images[activeImage] || '/camera-placeholder.png'} alt={product.name} className="w-full h-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              {!images[activeImage] && <Camera className="w-20 h-20 text-blue-400/40" />}
              {product.sale_price != null && (
                <span className="stock-badge absolute top-3 left-3" style={{ background: 'rgba(249,115,22,0.9)', color: '#fff' }}>
                  SALE
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={cn('w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0', activeImage === i ? 'border-brand-500' : 'border-transparent')}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              {product.brand && (
                <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{product.brand}</p>
              )}
              <h1 className="text-3xl font-extrabold">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Stars rating={product.rating} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{product.rating.toFixed(1)} / 5</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>•</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{product.category?.name ?? 'General'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-orange-500">{formatETB(price, 2)}</span>
              {product.sale_price != null && (
                <span className="text-lg line-through" style={{ color: 'var(--text-muted)' }}>{formatETB(product.price, 2)}</span>
              )}
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {product.short_description || product.description || 'No description available.'}
            </p>

            <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="inline-flex items-center gap-1.5"><Package className="w-4 h-4 text-brand-400" /> SKU: {product.sku ?? 'N/A'}</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Warranty: {product.warranty || '12 months'}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className={cn('stock-badge', `stock-${level}`)}>{stockLabel(product)} ({product.stock} units)</span>
            </div>

            {/* Quantity + actions */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-3">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-full border flex items-center justify-center" style={{ borderColor: 'var(--border-medium)' }} aria-label="Decrease">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="w-9 h-9 rounded-full border flex items-center justify-center" style={{ borderColor: 'var(--border-medium)' }} aria-label="Increase">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => void toggle(product.id).then(() => undefined)}
                className={cn('p-2.5 rounded-full border transition-all', isWishlisted(product.id) ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'text-gray-400 border-white/10 hover:text-red-500')}
                aria-label="Wishlist"
              >
                <Heart className={cn('w-5 h-5', isWishlisted(product.id) && 'fill-red-500')} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={handleAdd} disabled={outOfStock} className="btn-primary flex-1 h-12">
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={outOfStock} className="btn-orange flex-1 h-12">
                Buy Now
              </button>
            </div>
            {outOfStock && <p className="text-xs text-red-400">This product is currently out of stock.</p>}
          </div>
        </div>

        {/* Description / Specifications / Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-14">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
              {product.description || 'No description available.'}
            </p>
          </div>
          <div className="space-y-6">
            {specifications.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Specifications</h2>
                <div className="space-y-2 text-sm">
                  {specifications.map((spec, i) => (
                    <div key={i} className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--border-soft)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{spec.name}</span>
                      <span className="font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {features.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-400" /> Features
                </h2>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2"><Star className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" /> {f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {relatedList.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedList.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}