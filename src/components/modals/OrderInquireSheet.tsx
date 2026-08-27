import { useState, type FormEvent } from 'react';
import { Package, Send, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStorefront } from '../../hooks/useStorefront';
import { useToast } from '../../hooks/useToast';
import { useBusinessInfo, toTel } from '../../hooks/useBusinessInfo';
import { createServiceRequest } from '../../services/misc';
import { formatETB } from '../../lib/utils';
import { BottomSheet } from '../BottomSheet';

/**
 * Tapping "Order / Inquire" on a product opens this pre-loaded bottom sheet.
 * Submits an inquiry (service_request) to Supabase; also offers quick order /
 * add-to-cart shortcuts that reuse the existing checkout flow.
 */
export function OrderInquireSheet() {
  const { modal, selectedProduct, closeModal, openAuth, openCheckout, openCart } = useStorefront();
  const { user } = useAuth();
  const { showToast } = useToast();
  const info = useBusinessInfo();

  const product = selectedProduct;
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const open = modal === 'inquire';

  const handleInquiry = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    try {
      await createServiceRequest({
        customerName: form.name,
        phone: form.phone,
        email: form.email,
        service: 'Product Inquiry',
        preferredDate: null,
        location: '',
        description: `Inquiry about: ${product.name} (${product.sku ?? 'no SKU'}) — ${formatETB(product.price)}. ${form.notes}`,
        userId: user?.id ?? null,
      });
      showToast('Inquiry sent! We will get back to you shortly.', 'success');
      setForm({ name: '', phone: '', email: '', notes: '' });
      closeModal();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send inquiry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickOrder = () => {
    if (!product) return;
    if (!user) {
      closeModal();
      openAuth();
      showToast('Sign in to place an order', 'info');
      return;
    }
    closeModal();
    openCheckout([{ product, quantity: 1 }]);
  };

  if (!product) return <BottomSheet open={open} onClose={closeModal}><div /></BottomSheet>;

  return (
    <BottomSheet open={open} onClose={closeModal} title="Order / Inquire">
      {/* Pre-loaded item */}
      <div
        className="flex items-center gap-3 rounded-2xl p-3 mb-4 border"
        style={{ background: 'var(--bg-input)', borderColor: 'var(--border-soft)' }}
      >
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-6 h-6" style={{ color: 'var(--brand-accent, #55c997)' }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-tight truncate">{product.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {[product.resolution, product.night_vision_m ? `Night vision ${product.night_vision_m}m` : null]
              .filter(Boolean)
              .join(' · ') || product.category?.name || 'Camera'}
          </p>
        </div>
        <p className="text-base font-extrabold text-orange-500 flex-shrink-0">{formatETB(product.price)}</p>
      </div>

      {/* Fast actions */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <button
          onClick={handleQuickOrder}
          className="h-12 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
          style={{ background: 'linear-gradient(145deg, #f97316, #ea580c)' }}
        >
          <ShoppingCart className="w-4 h-4" /> Order Now
        </button>
        <a
          href={`tel:${toTel(info.phone)}`}
          className="h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 border active:scale-[0.98] transition"
          style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)' }}
        >
          Call to Order
        </a>
      </div>

      {/* Inquiry form */}
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
        Send an inquiry
      </p>
      <form onSubmit={handleInquiry} className="space-y-2.5">
        <input
          type="text"
          placeholder="Your name *"
          required
          className="form-input h-12"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <input
            type="tel"
            placeholder="Phone *"
            required
            className="form-input h-12"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="form-input h-12"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <textarea
          rows={2}
          placeholder="Anything else? (optional)"
          className="form-input resize-none"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full h-12 text-sm"
        >
          <Send className="w-4 h-4" /> {submitting ? 'Sending…' : 'Send Inquiry'}
        </button>
      </form>
      <button onClick={openCart} className="w-full text-center text-xs mt-3 underline" style={{ color: 'var(--text-muted)' }}>
        or open full cart / checkout
      </button>
    </BottomSheet>
  );
}
