import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, ClipboardList, Clock, Wrench } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { createServiceRequest } from '../services/misc';
import { Spinner } from '../components/ui';

export function RequestServicePage() {
  const { services, servicesLoading } = useSiteContent();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    location: '',
    propertyType: '',
    numDevices: '',
    currentSystem: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await createServiceRequest({
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        service: form.service,
        preferredDate: form.date || null,
        preferredTime: form.time,
        location: form.location,
        propertyType: form.propertyType,
        numDevices: form.numDevices === '' ? null : Number(form.numDevices),
        currentSystem: form.currentSystem,
        description: form.description,
        notes: '',
        userId: user?.id ?? null,
      });
      setSubmitted(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to submit request', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (servicesLoading) return <Spinner className="min-h-[50vh]" />;

  if (submitted) {
    return (
      <div className="py-20 px-4 text-center">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold mb-3">Request Received!</h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Our team will contact you shortly to schedule your {form.service || 'service'}.
        </p>
        <Link to="/services" className="btn-primary px-8 py-3">Browse Services</Link>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <span className="section-eyebrow">
            <ClipboardList className="w-3 h-3" /> Book a Service
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
            Request a <span className="text-gradient">Service</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Full Name *" required className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input type="tel" placeholder="Phone *" required className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="email" placeholder="Email *" required className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <select required className="form-input" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
              <option value="">Select a service *</option>
              {services.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
              <option value="Consultation">Consultation</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <CalendarDays className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="date" className="form-input pl-10" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="time" className="form-input pl-10" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>

          <input type="text" placeholder="Location / Address" className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select className="form-input" value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
              <option value="">Property type</option>
              <option>Home</option>
              <option>Shop / Retail</option>
              <option>Office</option>
              <option>Warehouse</option>
              <option>Other</option>
            </select>
            <input type="number" min="0" placeholder="No. of cameras" className="form-input" value={form.numDevices} onChange={(e) => setForm({ ...form, numDevices: e.target.value })} />
            <input type="text" placeholder="Existing system?" className="form-input" value={form.currentSystem} onChange={(e) => setForm({ ...form, currentSystem: e.target.value })} />
          </div>

          <textarea rows={3} placeholder="Tell us about your needs / project description" className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <button type="submit" disabled={busy} className="btn-orange w-full py-3 inline-flex items-center justify-center gap-2">
            <Wrench className="w-4 h-4" /> {busy ? 'Submitting…' : 'Submit Request'}
          </button>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            We'll get back to you within one business day.
          </p>
        </form>
      </div>
    </div>
  );
}