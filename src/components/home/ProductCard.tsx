import { Camera, Eye, Heart, ShoppingCart, Zap } from 'lucide-react';
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
  const { openProduct, openCheckout, openAuth } = useStorefront();
  const { showToast } = useToast();

  const level = stockLevel(product);
  const outOfStock = level === 'out';

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product);
    showToast(`${product.name} added to cart`, 'success');
  };

  const handleQuickOrder = () => {
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
      <div className="relative h-48 overflow-hidden" style={{ background: 'var(--bg-input)' }}>
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

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Stock badge */}
        <span className={cn('stock-badge absolute top-3 right-3 backdrop-blur-sm', `stock-${level}`)}>
          {stockLabel(product)}
        </span>

        {/* Wishlist button */}
        <button
          onClick={() => void handleWishlist()}
          className={cn(
            'absolute top-3 left-3 p-2 rounded-full border backdrop-blur-sm transition-all',
            isWishlisted(product.id)
              ? 'bg-red-500/20 text-red-500 border-red-500/40'
              : 'bg-black/20 text-white border-white/20 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/40'
          )}
          title="Wishlist"
        >
          <Heart className={cn('w-4 h-4', isWishlisted(product.id) && 'fill-red-500')} />
        </button>

        {/* Quick view button — slides up on hover */}
        <button
          onClick={() => openProduct(product)}
          className="absolute bottom-0 left-0 right-0 bg-brand-500/90 backdrop-blur-sm text-white py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          <Eye className="w-3.5 h-3.5" /> Quick View
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-base leading-tight line-clamp-2">{product.name}</h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs mt-1.5">
          <Stars rating={product.rating} />
          <span style={{ color: 'var(--text-muted)' }}>({product.rating.toFixed(1)})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-2xl font-extrabold text-orange-500">{formatETB(product.price)}</span>
          <span className="text-xs px-2 py-1 rounded-full" style={{ color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
            {product.category?.name ?? 'General'}
          </span>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="btn-primary flex-1 text-xs py-2.5 px-3"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
          </button>
          <button
            onClick={handleQuickOrder}
            disabled={outOfStock}
            className="btn-purple flex-1 text-xs py-2.5 px-3"
          >
            <Zap className="w-3.5 h-3.5" /> Order Now
          </button>
        </div>
      </div>
    </div>
  );
}
