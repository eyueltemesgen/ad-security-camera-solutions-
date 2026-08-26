import { Camera, CreditCard, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useStorefront } from '../../hooks/useStorefront';
import { formatETB } from '../../lib/utils';
import { Modal } from '../ui';

export function CartDrawer() {
  const { modal, closeModal, openCheckout, openAuth } = useStorefront();
  const { items, subtotal, tax, total, removeItem, setQuantity } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      openAuth();
      return;
    }
    closeModal();
    openCheckout();
  };

  return (
    <Modal open={modal === 'cart'} onClose={closeModal} wide>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-blue-400" /> Shopping Cart
      </h2>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <ShoppingCart className="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p>Your cart is empty</p>
          <button onClick={closeModal} className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-4 glass-card p-3 rounded-xl">
                <div className="bg-white/5 rounded-xl w-14 h-14 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-blue-400/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                  <div className="text-orange-400 font-bold text-sm">
                    {formatETB(product.price)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(product.id, quantity - 1)}
                    className="bg-white/5 hover:bg-white/15 w-7 h-7 rounded-full flex items-center justify-center"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(product.id, Math.min(quantity + 1, product.stock))}
                    className="bg-white/5 hover:bg-white/15 w-7 h-7 rounded-full flex items-center justify-center"
                    aria-label="Increase"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(product.id)}
                  className="text-red-400 hover:text-red-300"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span>{formatETB(subtotal, 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VAT (15%):</span>
                <span>{formatETB(tax, 2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                <span>Total:</span>
                <span className="text-orange-400">{formatETB(total, 2)}</span>
              </div>
            </div>
          </div>
          <button onClick={handleCheckout} className="btn-success w-full mt-4 py-3">
            <CreditCard className="w-4 h-4" /> Proceed to Checkout
          </button>
        </>
      )}
    </Modal>
  );
}
