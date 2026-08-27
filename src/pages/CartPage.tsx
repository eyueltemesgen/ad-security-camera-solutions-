import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useStorefront } from '../hooks/useStorefront';
import { formatETB } from '../lib/utils';

export function CartPage() {
  const { items, subtotal, tax, total, removeItem, setQuantity } = useCart();
  const { openCheckout } = useStorefront();

  if (items.length === 0) {
    return (
      <div className="py-24 px-4 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary inline-flex px-8 py-3">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="glass-card rounded-xl p-4 flex gap-4">
                <Link to={`/products/${product.slug}`} className="w-20 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  <img src={product.image_url || '/camera-placeholder.png'} alt={product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product.slug}`} className="font-semibold hover:text-brand-400 block">{product.name}</Link>
                  <p className="text-sm mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{product.category?.name ?? ''}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity(product.id, Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ borderColor: 'var(--border-medium)' }} aria-label="Decrease">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-semibold">{quantity}</span>
                      <button onClick={() => setQuantity(product.id, Math.min(product.stock, quantity + 1))} className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ borderColor: 'var(--border-medium)' }} aria-label="Increase">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-500">{formatETB((product.sale_price ?? product.price) * quantity)}</p>
                      {(product.sale_price ?? product.price) !== product.price && (
                        <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{formatETB(product.price * quantity)}</p>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => removeItem(product.id)} className="self-start p-1.5 text-red-400 hover:text-red-500" aria-label="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-20">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex justify-between"><span>Subtotal</span><span>{formatETB(subtotal)}</span></div>
                <div className="flex justify-between"><span>Tax (15%)</span><span>{formatETB(tax)}</span></div>
                <div className="flex justify-between border-t pt-2 font-bold text-base" style={{ borderColor: 'var(--border-soft)', color: 'var(--text-primary)' }}>
                  <span>Total</span><span>{formatETB(total)}</span>
                </div>
              </div>
              <button onClick={() => openCheckout()} className="btn-orange w-full py-3 mt-6">Proceed to Checkout</button>
              <Link to="/products" className="block text-center text-sm mt-3 hover:text-brand-400" style={{ color: 'var(--text-muted)' }}>
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}