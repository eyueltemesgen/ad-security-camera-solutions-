import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { placeOrder } from '../services/orders';
import { formatETB } from '../lib/utils';
import { PAYMENT_METHODS } from '../types';
import type { Order, PaymentMethod } from '../types';

export function CheckoutPage() {
  const { user, profile } = useAuth();
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    payment: 'telebirr' as PaymentMethod,
  });
  const [busy, setBusy] = useState(false);

  if (items.length === 0) {
    return (
      <div className="py-24 px-4 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <Link to="/products" className="btn-primary px-8 py-3 inline-flex mt-4">Browse Products</Link>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.address) return;
    setBusy(true);
    try {
      const order: Order = await placeOrder({
        customerName: form.name || profile?.full_name || '',
        customerEmail: form.email || '',
        customerPhone: form.phone,
        deliveryAddress: form.address,
        city: form.city,
        deliveryNotes: form.notes,
        paymentMethod: form.payment,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      });
      clearCart();
      navigate(`/order-confirmation?number=${encodeURIComponent(order.order_number)}&id=${order.id}`, {
        state: { order },
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Checkout failed', 'error');
      setBusy(false);
    }
  };

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Delivery Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name *" required className="form-input" value={form.name || profile?.full_name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input type="email" placeholder="Email *" required className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input type="tel" placeholder="Phone *" required className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input type="text" placeholder="City" className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <textarea rows={2} required placeholder="Delivery Address *" className="form-input mt-4" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input type="text" placeholder="Delivery notes (optional)" className="form-input mt-4" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.value} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer" style={{ borderColor: form.payment === method.value ? 'rgba(27,77,46,0.5)' : 'var(--border-soft)' }}>
                    <input type="radio" name="payment" value={method.value} checked={form.payment === method.value} onChange={() => setForm({ ...form, payment: method.value as PaymentMethod })} />
                    <span className="text-sm font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> No online charge is made. Payment is settled on confirmation.
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-20">
              <h2 className="text-lg font-bold mb-4">Summary</h2>
              <div className="space-y-2 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between gap-3">
                    <span className="truncate">{product.name} × {quantity}</span>
                    <span className="flex-shrink-0">{formatETB((product.sale_price ?? product.price) * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t pt-3" style={{ borderColor: 'var(--border-soft)', color: 'var(--text-secondary)' }}>
                <div className="flex justify-between"><span>Subtotal</span><span>{formatETB(subtotal)}</span></div>
                <div className="flex justify-between"><span>Tax (15%)</span><span>{formatETB(tax)}</span></div>
                <div className="flex justify-between font-bold text-base" style={{ color: 'var(--text-primary)' }}><span>Total</span><span>{formatETB(total)}</span></div>
              </div>
              <button type="submit" disabled={busy} className="btn-orange w-full py-3 mt-6">{busy ? 'Placing order…' : 'Place Order'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}