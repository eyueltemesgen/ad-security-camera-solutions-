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
    <div className="glass-card glass-card-hover rounded-2xl p-4">
      <div className="relative mb-3 h-44 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <Camera className="w-12 h-12 text-blue-400/50" />
        )}
        <span className={cn('stock-badge absolute top-2 right-2', `stock-${level}`)}>
          {stockLabel(product)}
        </span>
        <button
          onClick={() => void handleWishlist()}
          className={cn(
            'absolute top-2 left-2 p-1.5 rounded-full border transition-all',
            isWishlisted(product.id)
              ? 'bg-red-500/10 text-red-500 border-red-500/30'
              : 'bg-white/5 text-gray-400 border-white/10 hover:text-red-500'
          )}
          title="Wishlist"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => openProduct(product)}
          className="absolute bottom-2 left-2 bg-black/50 hover:bg-black/70 px-3 py-1 rounded-full text-xs flex items-center gap-1 transition"
        >
          <Eye className="w-3 h-3" /> Quick View
        </button>
      </div>

      <h4 className="font-semibold text-base truncate">{product.name}</h4>
      <div className="flex items-center gap-1.5 text-xs mt-1">
        <Stars rating={product.rating} />
        <span className="text-gray-400">({product.rating.toFixed(1)})</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xl font-bold text-orange-400">{formatETB(product.price)}</span>
        <span className="text-xs text-gray-400">{product.category?.name ?? 'General'}</span>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn-primary flex-1 text-xs py-2 px-3"
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
        </button>
        <button
          onClick={handleQuickOrder}
          disabled={outOfStock}
          className="btn-purple flex-1 text-xs py-2 px-3"
        >
          <Zap className="w-3.5 h-3.5" /> Place Order
        </button>
      </div>
    </div>
  );
}
