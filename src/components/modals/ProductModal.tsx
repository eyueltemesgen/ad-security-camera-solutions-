import { Camera, Heart, ShoppingCart, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useStorefront } from '../../hooks/useStorefront';
import { useToast } from '../../hooks/useToast';
import { useWishlist } from '../../hooks/useWishlist';
import { cn, formatETB, stockLabel, stockLevel } from '../../lib/utils';
import { Modal, Stars } from '../ui';

export function ProductModal() {
  const { modal, selectedProduct, closeModal, openAuth, openCheckout } = useStorefront();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { showToast } = useToast();

  if (!selectedProduct) {
    return <Modal open={modal === 'product'} onClose={closeModal}><div /></Modal>;
  }

  const product = selectedProduct;
  const level = stockLevel(product);
  const outOfStock = level === 'out';

  const handleAdd = () => {
    addItem(product);
    showToast(`${product.name} added to cart`, 'success');
  };

  const handleQuickOrder = () => {
    if (!user) {
      openAuth();
      showToast('Sign in to place an order', 'info');
      return;
    }
    closeModal();
    openCheckout([{ product, quantity: 1 }]);
  };

  return (
    <Modal open={modal === 'product'} onClose={closeModal} wide>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative bg-white/5 rounded-2xl h-64 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-16 h-16 text-blue-400/50" />
          )}
          <span className={cn('stock-badge absolute top-3 right-3', `stock-${level}`)}>
            {stockLabel(product)}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-sm text-gray-400">{product.category?.name ?? 'General'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Stars rating={product.rating} />
            <span className="text-sm text-gray-400">{product.rating.toFixed(1)} / 5</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {product.description || 'No description available.'}
          </p>
          <div className="text-sm text-gray-400 space-y-1">
            <p>
              SKU: <span className="text-gray-200">{product.sku ?? 'N/A'}</span>
            </p>
            <p>
              Stock: <span className="text-gray-200">{product.stock} units</span>
            </p>
          </div>
          <div className="text-3xl font-bold text-orange-400">{formatETB(product.price)}</div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={handleAdd} disabled={outOfStock} className="btn-primary flex-1 py-2.5 text-sm">
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
            <button onClick={handleQuickOrder} disabled={outOfStock} className="btn-purple flex-1 py-2.5 text-sm">
              <Zap className="w-4 h-4" /> Place Order
            </button>
            <button
              onClick={() => void toggle(product.id)}
              className={cn(
                'p-2.5 rounded-full border transition-all',
                isWishlisted(product.id)
                  ? 'bg-red-500/10 text-red-500 border-red-500/30'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:text-red-500'
              )}
              title="Toggle wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
          {outOfStock && (
            <p className="text-xs text-red-400">This product is currently out of stock.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
