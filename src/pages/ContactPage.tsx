import { useState, type FormEvent } from 'react';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useBusinessInfo, toTel } from '../hooks/useBusinessInfo';
import { useToast } from '../hooks/useToast';
import { createContactMessage } from '../services/misc';

export function ContactPage() {
  const info = useBusinessInfo();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createContactMessage(form);
      showToast('Message sent! We will get back to you shortly.', 'success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="section-eyebrow">
            <MessageCircle className="w-3 h-3" /> Contact
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2">
            Get In <span className="text-gradient">Touch</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-2xl p-5 flex items-start gap-3">
              <Phone className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Call us</h3>
                <a href={`tel:${toTel(info.phone)}`} className="text-sm text-brand-400 hover:underline">{info.phone}</a>
                {info.secondaryPhone && (
                  <a href={`tel:${toTel(info.secondaryPhone)}`} className="block text-sm text-brand-400 hover:underline">{info.secondaryPhone}</a>
                )}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 flex items-start gap-3">
              <Mail className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <a href={`mailto:${info.email}`} className="text-sm text-brand-400 hover:underline break-all">{info.email}</a>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Visit us</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{info.address}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name *" required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input type="email" placeholder="Email *" required className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="tel" placeholder="Phone" className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input type="text" placeholder="Subject" className="form-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <textarea rows={5} placeholder="Your message *" required className="form-input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}