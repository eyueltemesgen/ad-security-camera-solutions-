import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { EmptyState, formatMoney } from '../components/ui';

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem, subtotal } = useCart();
  const { user } = useAuth();

  const deliveryFee = subtotal > 0 ? (subtotal >= 10000 ? 0 : 400) : 0;
  const vat = subtotal * 0.15;
  const total = subtotal + deliveryFee + vat;

  if (loading) {
    return (
      <div className="container-x py-12">
        <div className="skeleton h-40" />
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <h1 className="text-2xl font-bold">Shopping Cart</h1>
      <p className="mt-1 text-sm text-slate-500">{items.length} item{items.length === 1 ? '' : 's'} in your cart</p>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your cart is empty"
            subtitle="Browse our products and add security equipment to your cart."
            action={<Link to="/products" className="btn btn-primary">Browse Products</Link>}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.sale_price ?? item.price;
              return (
                <div key={item.cart_item_id} className="card flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="12" cy="13" r="3" /></svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${item.slug}`} className="truncate font-semibold text-slate-800 hover:text-[var(--primary)]">
                      {item.name}
                    </Link>
                    <div className="mt-1 text-sm text-slate-500">
                      {formatMoney(price)} {item.sale_price && <span className="line-through text-slate-400">{formatMoney(item.price)}</span>}
                    </div>
                    {item.stock <= 5 && <div className="mt-0.5 text-xs text-amber-600">Only {item.stock} left</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  <div className="w-24 text-right font-bold text-slate-900">{formatMoney(price * item.quantity)}</div>
                  <button className="text-slate-400 hover:text-red-600" onClick={() => removeItem(item.cart_item_id)} aria-label="Remove">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-20 h-fit">
            <div className="card card-pad">
              <h2 className="text-lg font-bold">Order Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-medium">{formatMoney(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Delivery</dt>
                  <dd className="font-medium">{deliveryFee === 0 ? 'Free' : formatMoney(deliveryFee)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">VAT (15%)</dt>
                  <dd className="font-medium">{formatMoney(vat)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                  <dt className="font-bold text-slate-900">Total</dt>
                  <dd className="font-extrabold text-[var(--primary)]">{formatMoney(total)}</dd>
                </div>
              </dl>
              {!user && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  You need to <Link to="/login" className="underline">login</Link> to checkout.
                </p>
              )}
              <Link to="/checkout" className={`btn btn-primary btn-lg mt-4 w-full ${!user ? 'pointer-events-none opacity-50' : ''}`}>
                Proceed to Checkout
              </Link>
              <Link to="/products" className="btn btn-ghost mt-2 w-full">Continue Shopping</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}