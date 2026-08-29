import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { apiPost } from '../lib/api';
import { EmptyState, Spinner, formatMoney } from '../components/ui';
import type { Order } from '../types';

export default function CheckoutPage() {
  const { items, loading, subtotal, clear } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: user?.full_name ?? '',
    customer_email: user?.email ?? '',
    customer_phone: user?.phone ?? '',
    delivery_address: '',
    delivery_city: '',
    delivery_notes: '',
    payment_method: 'cash_on_delivery',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const deliveryFee = subtotal >= 10000 || subtotal === 0 ? 0 : 400;
  const vat = subtotal * 0.15;
  const total = subtotal + deliveryFee + vat;

  if (!user) {
    return (
      <div className="container-x py-16">
        <EmptyState
          title="Please login to checkout"
          subtitle="You need an account to place an order."
          action={<Link to="/login" className="btn btn-primary">Login</Link>}
        />
      </div>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.customer_name.trim().length < 3) e.customer_name = 'Enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) e.customer_email = 'Enter a valid email';
    if (form.customer_phone.trim() && !/^[+0-9\s-]{7,15}$/.test(form.customer_phone)) e.customer_phone = 'Enter a valid phone';
    if (!form.delivery_address.trim()) e.delivery_address = 'Delivery address is required';
    if (!form.delivery_city.trim()) e.delivery_city = 'City is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast('Please fix the highlighted fields', 'error');
      return;
    }
    setBusy(true);
    try {
      const order = await apiPost<Order>('/api/orders', {
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        delivery_address: form.delivery_address,
        delivery_city: form.delivery_city,
        delivery_notes: form.delivery_notes,
        payment_method: form.payment_method,
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      });
      await clear();
      toast('Order placed successfully!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="container-x py-10">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">Complete your order details below.</p>

      {loading ? (
        <div className="skeleton mt-6 h-40" />
      ) : items.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="Your cart is empty" subtitle="Add products before checking out." action={<Link to="/products" className="btn btn-primary">Browse Products</Link>} />
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 grid gap-8 lg:grid-cols-3" noValidate>
          {/* Details */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card card-pad">
              <h2 className="text-lg font-bold">Delivery Information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" value={form.customer_name} onChange={set('customer_name')} />
                  {errors.customer_name && <p className="mt-1 text-xs font-medium text-red-600">{errors.customer_name}</p>}
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input className="input" value={form.customer_phone} onChange={set('customer_phone')} placeholder="+251 9XX XXX XXX" />
                  {errors.customer_phone && <p className="mt-1 text-xs font-medium text-red-600">{errors.customer_phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Email *</label>
                  <input className="input" type="email" value={form.customer_email} onChange={set('customer_email')} />
                  {errors.customer_email && <p className="mt-1 text-xs font-medium text-red-600">{errors.customer_email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Delivery Address *</label>
                  <textarea className="input" value={form.delivery_address} onChange={set('delivery_address')} rows={2} />
                  {errors.delivery_address && <p className="mt-1 text-xs font-medium text-red-600">{errors.delivery_address}</p>}
                </div>
                <div>
                  <label className="label">City *</label>
                  <input className="input" value={form.delivery_city} onChange={set('delivery_city')} />
                  {errors.delivery_city && <p className="mt-1 text-xs font-medium text-red-600">{errors.delivery_city}</p>}
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select className="input" value={form.payment_method} onChange={set('payment_method')}>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                    <option value="telebirr">Telebirr</option>
                    <option value="cbe_birr">CBE Birr</option>
                    <option value="chapa">Chapa</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Additional Delivery Notes</label>
                  <textarea className="input" value={form.delivery_notes} onChange={set('delivery_notes')} rows={2} placeholder="Optional — e.g. landmark, preferred delivery time…" />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="card card-pad">
              <h2 className="text-lg font-bold">Order Items</h2>
              <div className="mt-3 space-y-3">
                {items.map((item) => (
                  <div key={item.cart_item_id} className="flex items-center gap-3 text-sm">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                      {item.image_url ? <img src={item.image_url} alt="" className="h-11 w-11 rounded-lg object-cover" /> : '▣'}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{item.name}</div>
                      <div className="text-xs text-slate-400">Qty {item.quantity}</div>
                    </div>
                    <div className="font-semibold">{formatMoney((item.sale_price ?? item.price) * item.quantity)}</div>
                  </div>
                ))}
              </div>
            </div>
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
                  <dt className="font-bold">Total</dt>
                  <dd className="font-extrabold text-[var(--primary)]">{formatMoney(total)}</dd>
                </div>
              </dl>
              <button className="btn btn-primary btn-lg mt-4 w-full" disabled={busy}>
                {busy ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : `Place Order · ${formatMoney(total)}`}
              </button>
              <Link to="/cart" className="btn btn-ghost mt-2 w-full">Back to Cart</Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}