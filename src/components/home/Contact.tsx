import { useState, type FormEvent } from 'react';
import { Building2, Clock, Facebook, Instagram, Mail, Music2, Phone, Send } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useQuery } from '../../hooks/useQuery';
import { createContactMessage, fetchSiteSettings } from '../../services/misc';

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
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-panel">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">
            Get in <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-gray-400 mt-2">We're ready to help — reach out anytime.</p>

          <div className="space-y-4 mt-6 text-gray-300">
            <p className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              {info?.company_name ?? 'AD Security Camera Solutions'},{' '}
              {info?.address ?? 'Addis Ababa, Ethiopia'}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              {info?.email ?? 'adcctvcamera16@gmail.com'}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              {info?.phone ?? '+251 985 959 697'}
            </p>
            <p className="text-sm text-gray-400 ml-6">
              {info?.secondary_phone ?? '+251 918 109 779'}
            </p>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-white mb-3">Connect With Us</h4>
            <div className="flex gap-4">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  title={social.label}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white transition-transform hover:scale-110"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click the icons to find us on your favourite apps
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl mt-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Business Hours
            </h4>
            <p className="text-sm text-gray-400">Monday – Friday: 8:00 AM – 6:00 PM</p>
            <p className="text-sm text-gray-400">Saturday: 9:00 AM – 2:00 PM</p>
            <p className="text-sm text-gray-400">Sunday: Closed</p>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-semibold mb-4">Send a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              required
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              required
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone"
              className="form-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <select
              className="form-input"
              value=""
              aria-label="Service (optional)"
              onChange={() => undefined}
            >
              <option value="">— Select Service —</option>
              {SERVICE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <textarea
              rows={4}
              placeholder="Message"
              required
              className="form-input"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <button type="submit" disabled={submitting} className="btn-orange w-full py-3">
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
