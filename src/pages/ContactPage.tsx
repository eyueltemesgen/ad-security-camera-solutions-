import { useState } from 'react';
import { useCms } from '../hooks/useCms';
import { useToast } from '../hooks/useToast';
import { apiPost } from '../lib/api';
import { PageTitle, Spinner } from '../components/ui';

export default function ContactPage() {
  const { brand, contact, site } = useCms();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const companyName = String(brand.company_name ?? 'AD Security Camera Solution');
  const email = String(contact.email ?? 'adsecuritycamerasolution@gmail.com');
  const phone = String(contact.phone ?? '');
  const address = String(contact.address ?? '');
  const workingHours = String(contact.working_hours ?? '');

  const social = site?.social ?? [];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim() || form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await apiPost('/api/admin/contacts', form, false);
      toast('Message sent. We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <PageTitle
        title="Contact Us"
        subtitle="Have a question or need a quote? Reach out — we respond within 24 hours."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />
      <div className="container-x py-10">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Info */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold">{companyName}</h2>
            <p className="mt-2 text-sm text-slate-500">We're here to help with all your security and technology needs.</p>

            <div className="mt-6 space-y-4">
              <div className="card card-pad flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">Email</div>
                  <a className="break-all font-medium text-slate-800 hover:text-[var(--primary)]" href={`mailto:${email}`}>{email || '—'}</a>
                </div>
              </div>
              {phone && (
                <div className="card card-pad flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.6 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">Phone</div>
                    <a className="font-medium text-slate-800 hover:text-[var(--primary)]" href={`tel:${phone}`}>{phone}</a>
                  </div>
                </div>
              )}
              {address && (
                <div className="card card-pad flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </span>
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">Address</div>
                    <div className="font-medium text-slate-800">{address}</div>
                  </div>
                </div>
              )}
              {workingHours && (
                <div className="card card-pad flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">Working Hours</div>
                    <div className="font-medium text-slate-800">{workingHours}</div>
                  </div>
                </div>
              )}
            </div>

            {social.filter((s) => s.username).length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Follow us</h3>
                <div className="mt-3 space-y-2">
                  {social.filter((s) => s.username).map((s) => (
                    <a key={s.platform} href={s.url || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-slate-700 hover:text-[var(--primary)]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10 font-semibold text-[var(--primary)]">
                        {s.platform[0]}
                      </span>
                      {s.platform}: <span className="font-medium">{s.username}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form className="card card-pad" onSubmit={submit} noValidate>
              <h2 className="text-lg font-bold">Send us a message</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Full Name *</label>
                  <input className="input" value={form.name} onChange={set('name')} />
                  {errors.name && <p className="mt-1 text-xs font-medium text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input className="input" type="email" value={form.email} onChange={set('email')} />
                  {errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={form.phone} onChange={set('phone')} />
                </div>
                <div>
                  <label className="label">Subject *</label>
                  <input className="input" value={form.subject} onChange={set('subject')} />
                  {errors.subject && <p className="mt-1 text-xs font-medium text-red-600">{errors.subject}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Message *</label>
                  <textarea className="input min-h-32" value={form.message} onChange={set('message')} />
                  {errors.message && <p className="mt-1 text-xs font-medium text-red-600">{errors.message}</p>}
                </div>
              </div>
              <button className="btn btn-primary btn-lg mt-5" disabled={busy}>
                {busy ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}