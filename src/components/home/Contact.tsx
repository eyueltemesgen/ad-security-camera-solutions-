import { useState, type FormEvent } from 'react';
import { Building2, Clock, Facebook, Instagram, Mail, MapPin, Music2, Phone, Send } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useQuery } from '../../hooks/useQuery';
import { createContactMessage, fetchSiteSettings } from '../../services/misc';
import { useReveal } from '../../hooks/useReveal';

const SERVICE_OPTIONS = [
  'CCTV Systems',
  'Network Solutions',
  'Time Attendance',
  'Video Intercom',
  'Web & IT Solutions',
  'Access Control',
  'Other',
];

const SOCIALS = [
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com/adsecuritycamera' },
  { label: 'Telegram', icon: Send, href: 'https://t.me/adsecuritycamera' },
  { label: 'TikTok', icon: Music2, href: 'https://tiktok.com/@adsecuritycamera' },
  { label: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
];

export function Contact() {
  const { showToast } = useToast();
  const settings = useQuery(() => fetchSiteSettings(), []);
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

  const info = settings.data;

  return (
    <section id="contact" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-panel relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="reveal">
          <span className="section-eyebrow">
            <Mail className="w-3 h-3" />
            Contact
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Get in <span className="text-gradient">Touch</span>
          </h2>
          <p className="mt-3 text-lg" style={{ color: 'var(--text-secondary)' }}>
            We're ready to help — reach out anytime.
          </p>

          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="font-semibold">{info?.company_name ?? 'AD Security Camera Solutions'}</p>
                <p className="text-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin className="w-3 h-3" /> {info?.address ?? 'Addis Ababa, Ethiopia'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{info?.email ?? 'adcctvcamera16@gmail.com'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-semibold">Phone</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{info?.phone ?? '+251 985 959 697'}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{info?.secondary_phone ?? '+251 918 109 779'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-semibold mb-3">Connect With Us</h4>
            <div className="flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  title={social.label}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-lg hover:shadow-brand-500/30"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl mt-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" /> Business Hours
            </h4>
            <div className="space-y-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p className="flex justify-between"><span>Monday – Friday</span><span className="font-medium">8:00 AM – 6:00 PM</span></p>
              <p className="flex justify-between"><span>Saturday</span><span className="font-medium">9:00 AM – 2:00 PM</span></p>
              <p className="flex justify-between"><span>Sunday</span><span className="font-medium text-red-400">Closed</span></p>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl reveal" style={{ transitionDelay: '0.15s' }}>
          <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name *"
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
            </div>
            <input
              type="tel"
              placeholder="Phone"
              className="form-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <textarea
              rows={5}
              placeholder="Message *"
              required
              className="form-input resize-none"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <button type="submit" disabled={submitting} className="btn-orange w-full py-3.5 text-base">
              {submitting ? (
                <>Sending…</>
              ) : (
                <>Send Message <Send className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
