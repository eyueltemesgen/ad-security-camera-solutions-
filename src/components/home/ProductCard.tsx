import { Camera, Eye, Heart, Moon, Package, ShoppingCart, Zap } from 'lucide-react';
import type { Product } from '../../types';
import { cn, formatETB, stockLabel, stockLevel } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useStorefront } from '../../hooks/useStorefront';
import { useToast } from '../../hooks/useToast';
import { useWishlist } from '../../hooks/useWishlist';
import { Stars } from '../ui';

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { openProduct, openInquire, openAuth, openCheckout } = useStorefront();
  const { showToast } = useToast();

  const level = stockLevel(product);
  const outOfStock = level === 'out';

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product);
    showToast(`${product.name} added to cart`, 'success');
  };

  const handleOrderNow = () => {
    if (outOfStock) return;
    if (!user) {
      openAuth();
      showToast('Sign in to place an order', 'info');
      return;
    }
    openCheckout([{ product, quantity: 1 }]);
  };

  const handleWishlist = async () => {
    const result = await toggle(product.id);
    if (result === 'needs-auth') {
      openAuth();
      showToast('Sign in to use your wishlist', 'info');
    }
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden group">
      {/* Image area */}
      <div className="relative h-52 md:h-48 overflow-hidden" style={{ background: 'var(--bg-input)' }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-12 h-12 text-brand-400/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <span className={cn('stock-badge absolute top-3 right-3 backdrop-blur-sm', `stock-${level}`)}>
          {stockLabel(product)}
        </span>

        <button
          onClick={() => void handleWishlist()}
          className={cn(
            'absolute top-3 left-3 w-11 h-11 flex items-center justify-center rounded-full border backdrop-blur-sm transition-all active:scale-95',
            isWishlisted(product.id)
              ? 'bg-red-500/20 text-red-500 border-red-500/40'
              : 'bg-black/20 text-white border-white/20'
          )}
          title="Wishlist"
          aria-label="Wishlist"
        >
          <Heart className={cn('w-5 h-5', isWishlisted(product.id) && 'fill-red-500')} />
        </button>

        <button
          onClick={() => openProduct(product)}
          className="absolute bottom-0 left-0 right-0 text-white py-3 text-xs font-semibold flex items-center justify-center gap-1.5 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300"
          style={{ background: 'linear-gradient(145deg, rgba(59,179,127,0.95), rgba(31,127,87,0.95))' }}
        >
          <Eye className="w-3.5 h-3.5" /> Quick View
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-bold text-base leading-tight line-clamp-2">{product.name}</h4>

        {/* Key specs (Resolution, Night Vision) */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {product.resolution && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
              <Camera className="w-3 h-3" /> {product.resolution}
            </span>
          )}
          {product.night_vision_m != null && product.night_vision_m > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
              <Moon className="w-3 h-3" /> Night vision {product.night_vision_m}m
            </span>
          )}
          {!product.resolution && !(product.night_vision_m != null && product.night_vision_m > 0) && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
              <Package className="w-3 h-3" /> {product.category?.name ?? 'Camera'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs mt-2">
          <Stars rating={product.rating} />
          <span style={{ color: 'var(--text-muted)' }}>({product.rating.toFixed(1)})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xl md:text-2xl font-extrabold text-orange-500">{formatETB(product.price)}</span>
          <span className="text-xs px-2 py-1 rounded-full" style={{ color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
            {product.category?.name ?? 'General'}
          </span>
        </div>

        {/* Broad Order / Inquire */}
        <button
          onClick={() => openInquire(product)}
          disabled={outOfStock}
          className="btn-orange w-full h-12 mt-4 text-sm font-semibold"
        >
          <Zap className="w-4 h-4" /> Order / Inquire
        </button>

        <div className="flex gap-2 mt-2">
          <button onClick={handleAdd} disabled={outOfStock} className="btn-primary flex-1 text-xs h-11 px-3">
            <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
          </button>
          <button onClick={handleOrderNow} disabled={outOfStock} className="btn-purple flex-1 text-xs h-11 px-3">
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}
