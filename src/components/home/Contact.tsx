import { useState, type FormEvent } from 'react';
import { Building2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { createContactMessage } from '../../services/misc';
import { useReveal } from '../../hooks/useReveal';
import { toTel, useBusinessInfo } from '../../hooks/useBusinessInfo';

/**
 * Mobile quick-inquiry form — single screen, large touch inputs.
 * Submits to Supabase `contact_messages`. Business info comes from site_settings.
 */
export function Contact() {
  const { showToast } = useToast();
  const info = useBusinessInfo();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const ref = useReveal<HTMLDivElement>();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createContactMessage(form);
      showToast('Message sent! We will get back to you shortly.', 'success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" ref={ref} className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-panel relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Info */}
        <div className="reveal">
          <span className="section-eyebrow">
            <Mail className="w-3 h-3" />
            Contact
          </span>
          <h2 className="text-2xl md:text-5xl font-extrabold tracking-tight">
            Get a <span className="text-gradient">Quote</span>
          </h2>
          <p className="mt-2 md:mt-3 text-sm md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Tell us what you need — we reply fast.
          </p>

          <div className="space-y-4 mt-6">
            <a href={`tel:${toTel(info.phone)}`} className="flex items-start gap-3 group active:scale-[0.99] transition-transform">
              <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="font-semibold">{info.phone}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{info.secondaryPhone}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Tap to call</p>
              </div>
            </a>
            <a href={`mailto:${info.email}`} className="flex items-start gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{info.email}</p>
              </div>
            </a>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-semibold">{info.companyName}</p>
                <p className="text-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin className="w-3 h-3" /> {info.address}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{info.website}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick-inquiry form */}
        <div className="glass-card p-6 md:p-8 rounded-3xl reveal" style={{ transitionDelay: '0.15s' }}>
          <h3 className="text-xl md:text-2xl font-bold mb-5">Quick Inquiry</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Name *"
              required
              className="form-input h-12 text-base"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="tel"
                placeholder="Phone *"
                required
                className="form-input h-12 text-base"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="form-input h-12 text-base"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <textarea
              rows={4}
              placeholder="What do you need? (e.g. 4 cameras for a shop) *"
              required
              className="form-input resize-none text-base"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <button type="submit" disabled={submitting} className="btn-orange w-full h-13 py-3.5 text-base font-semibold">
              {submitting ? 'Sending…' : <>Send Inquiry <Send className="w-4 h-4" /></>}
            </button>
            <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              Or call us directly: <a href={`tel:${toTel(info.phone)}`} className="underline">{info.phone}</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
