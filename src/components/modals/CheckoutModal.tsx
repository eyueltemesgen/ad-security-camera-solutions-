import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useStorefront } from '../../hooks/useStorefront';
import { useToast } from '../../hooks/useToast';
import { placeOrder } from '../../services/orders';
import { calcTotals, formatETB, paymentMethodLabel } from '../../lib/utils';
import { PAYMENT_METHODS, type Order, type PaymentMethod } from '../../types';
import { Modal } from '../ui';

export function CheckoutModal() {
  const { modal, checkoutItems, closeModal, openAuth } = useStorefront();
  const cart = useCart();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const items = checkoutItems ?? cart.items;
  const totals = useMemo(
    () => calcTotals(items.map((i) => ({ price: i.product.price, quantity: i.quantity }))),
    [items]
  );

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    payment: 'telebirr' as PaymentMethod,
  });
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState<Order | null>(null);

  // Safety net — every entry point demands auth, but enforce it here too.
  useEffect(() => {
    if (modal === 'checkout' && !user) {
      closeModal();
      openAuth();
    }
  }, [modal, user, closeModal, openAuth]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      openAuth();
      return;
    }
    if (items.length === 0) {
      showToast('Your cart is empty.', 'warning');
      return;
    }

    setBusy(true);
    try {
      const order = await placeOrder({
        customerName: form.name || profile?.full_name || '',
        customerEmail: form.email || user.email || '',
        customerPhone: form.phone,
        deliveryAddress: form.address,
        paymentMethod: form.payment,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      });
      if (!checkoutItems) cart.clearCart();
      setConfirmed(order);
      showToast(`Order ${order.order_number} placed!`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Checkout failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    setConfirmed(null);
    closeModal();
  };

  return (
    <Modal open={modal === 'checkout'} onClose={handleClose} wide>
      {confirmed ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-gray-400 mb-1">
            Order number:{' '}
            <span className="text-white font-semibold">{confirmed.order_number}</span>
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Payment is <span className="text-yellow-400">pending</span> — we'll confirm your{' '}
            {paymentMethodLabel(confirmed.payment_method)} payment shortly. Track the order in your
            account page.
          </p>
          <button onClick={handleClose} className="btn-primary px-8 py-2.5">
            Done
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-400" /> Checkout
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name *"
                required
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email *"
                required
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone *"
                required
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <textarea
                rows={2}
                placeholder="Delivery Address *"
                required
                className="form-input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <select
                className="form-input"
                value={form.payment}
                onChange={(e) => setForm({ ...form, payment: e.target.value as PaymentMethod })}
                aria-label="Payment method"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                No online charge is made. Your payment status stays{' '}
                <span className="text-yellow-400">pending</span> until we confirm with you.
              </p>
              <button type="submit" disabled={busy} className="btn-success w-full py-3">
                {busy ? 'Placing order…' : 'Place Order'}
              </button>
            </form>

            <div>
              <h3 className="font-semibold mb-3 text-sm text-gray-300">Order Summary</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {product.name} <span className="text-gray-500">× {quantity}</span>
                    </span>
                    <span>{formatETB(product.price * quantity, 2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 mt-4 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>{formatETB(totals.subtotal, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">VAT (15%)</span>
                  <span>{formatETB(totals.tax, 2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-orange-400">{formatETB(totals.total, 2)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Totals are verified and recalculated server-side when the order is placed.
              </p>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
