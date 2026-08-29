import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useServices, useServiceCategories } from '../hooks/useData';
import { useToast } from '../hooks/useToast';
import { apiPost, apiUpload } from '../lib/api';
import { PageTitle, Spinner } from '../components/ui';
import type { ServiceRequest } from '../types';

interface PendingFile {
  url: string;
  name: string;
}

const PROPERTY_TYPES = ['Home / Residential', 'Apartment', 'Office', 'Shop / Retail', 'Warehouse', 'Factory', 'School / Institution', 'Hotel / Hospitality', 'Government Building', 'Other'];
const TIME_SLOTS = ['Morning (8am – 12pm)', 'Afternoon (12pm – 5pm)', 'Evening (5pm – 8pm)', 'Flexible'];

export default function RequestServicePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { services } = useServices();
  const { categories } = useServiceCategories();

  const serviceOptions = categories
    .filter((c) => services.some((s) => s.category_id === c.id))
    .map((c) => ({
      category: c.name,
      services: services.filter((s) => s.category_id === c.id),
    }));

  const [form, setForm] = useState({
    service_slug: '',
    full_name: user?.full_name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    location: '',
    property_type: '',
    preferred_date: '',
    preferred_time: '',
    device_count: '',
    current_system: '',
    description: '',
    notes: '',
  });
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.service_slug) e.service_slug = 'Select a service';
    if (form.full_name.trim().length < 3) e.full_name = 'Enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.phone.trim() && !/^[+0-9\s-]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone';
    if (!form.location.trim()) e.location = 'Location is required';
    if (form.description.trim().length < 10) e.description = 'Describe your requirements (at least 10 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length + files.length > 5) {
      toast('Maximum 5 files allowed', 'error');
      return;
    }
    setUploading(true);
    try {
      for (const file of selected) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await apiUpload<{ url: string; original_name?: string }>('/api/uploads/service-file', fd);
        setFiles((f) => [...f, { url: res.url, name: res.original_name ?? file.name }]);
      }
      toast('Files uploaded');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeFile = (url: string) => setFiles((f) => f.filter((x) => x.url !== url));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast('Please fix the highlighted fields', 'error');
      return;
    }
    setBusy(true);
    try {
      const selectedService = services.find((s) => s.slug === form.service_slug);
      const body: Record<string, unknown> = {
        customer_name: form.full_name,
        email: form.email,
        phone: form.phone,
        service_id: selectedService?.id ?? null,
        service_name: selectedService?.name ?? '',
        location: form.location,
        property_type: form.property_type,
        preferred_date: form.preferred_date,
        preferred_time: form.preferred_time,
        device_count: form.device_count ? Number(form.device_count) : null,
        current_system: form.current_system,
        description: form.description,
        notes: form.notes,
        file_urls: files.map((f) => f.url),
      };
      const req = await apiPost<ServiceRequest>('/api/service-requests', body, true);
      toast('Service request submitted successfully!');
      navigate(user ? '/dashboard/services' : `/request-service/success?ref=${req.request_number}`);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <PageTitle
        title="Request a Service"
        subtitle="Tell us about your security needs — our team will assess and get back to you quickly."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Request Service' }]}
      />
      <div className="container-x py-10">
        <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6" noValidate>
          {/* Service selection */}
          <div className="card card-pad">
            <h2 className="text-lg font-bold">1 · Service Type</h2>
            <div className="mt-4">
              <label className="label">Select a service *</label>
              <select className="input" value={form.service_slug} onChange={set('service_slug')}>
                <option value="">— Choose a service —</option>
                {serviceOptions.map((g) => (
                  <optgroup key={g.category} label={g.category}>
                    {g.services.map((s) => <option key={s.id} value={s.slug}>{s.name}</option>)}
                  </optgroup>
                ))}
              </select>
              {errors.service_slug && <p className="mt-1 text-xs font-medium text-red-600">{errors.service_slug}</p>}
            </div>
          </div>

          {/* Contact */}
          <div className="card card-pad">
            <h2 className="text-lg font-bold">2 · Your Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" value={form.full_name} onChange={set('full_name')} />
                {errors.full_name && <p className="mt-1 text-xs font-medium text-red-600">{errors.full_name}</p>}
              </div>
              <div>
                <label className="label">Phone *</label>
                <input className="input" value={form.phone} onChange={set('phone')} placeholder="+251 9XX XXX XXX" />
                {errors.phone && <p className="mt-1 text-xs font-medium text-red-600">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email *</label>
                <input className="input" type="email" value={form.email} onChange={set('email')} />
                {errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Property / scheduling */}
          <div className="card card-pad">
            <h2 className="text-lg font-bold">3 · Location & Schedule</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Location / Address *</label>
                <input className="input" value={form.location} onChange={set('location')} placeholder="Sub-city, woreda, landmark…" />
                {errors.location && <p className="mt-1 text-xs font-medium text-red-600">{errors.location}</p>}
              </div>
              <div>
                <label className="label">Property Type</label>
                <select className="input" value={form.property_type} onChange={set('property_type')}>
                  <option value="">Select…</option>
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Preferred Date</label>
                <input className="input" type="date" value={form.preferred_date} onChange={set('preferred_date')} />
              </div>
              <div>
                <label className="label">Preferred Time</label>
                <select className="input" value={form.preferred_time} onChange={set('preferred_time')}>
                  <option value="">Select…</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Number of Cameras / Devices</label>
                <input className="input" type="number" min={1} max={100} value={form.device_count} onChange={set('device_count')} />
              </div>
              <div>
                <label className="label">Current System (if any)</label>
                <input className="input" value={form.current_system} onChange={set('current_system')} placeholder="e.g. 4-channel DVR with 2 cameras" />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card card-pad">
            <h2 className="text-lg font-bold">4 · Requirements</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Describe your requirements *</label>
                <textarea className="input min-h-28" value={form.description} onChange={set('description')} placeholder="What do you need? Which areas need coverage? Any specific features…" />
                {errors.description && <p className="mt-1 text-xs font-medium text-red-600">{errors.description}</p>}
              </div>
              <div>
                <label className="label">Additional Notes</label>
                <textarea className="input" rows={2} value={form.notes} onChange={set('notes')} placeholder="Anything else we should know…" />
              </div>
            </div>
          </div>

          {/* Uploads */}
          <div className="card card-pad">
            <h2 className="text-lg font-bold">5 · Photos & Documents</h2>
            <p className="mt-1 text-sm text-slate-500">Upload photos of your property or current system (max 5 files, images or documents).</p>
            <label className="btn btn-outline mt-4 cursor-pointer">
              {uploading ? <Spinner className="h-4 w-4" /> : '+ Add Files'}
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFiles} disabled={uploading} />
            </label>
            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((f) => (
                  <li key={f.url} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-emerald-600"><path d="M12 15V3m0 12-4-4m4 4 4-4M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="flex-1 truncate font-medium text-slate-700">{f.name}</span>
                    <button type="button" className="text-slate-400 hover:text-red-600" onClick={() => removeFile(f.url)}>✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-slate-500">
              {user ? 'Your request will be linked to your account.' : <Link to="/login" className="font-semibold text-[var(--primary)] hover:underline">Login</Link> + ' to track your request online.'}
            </p>
            <button className="btn btn-accent btn-lg" disabled={busy}>
              {busy ? <Spinner className="h-4 w-4" /> : 'Submit Service Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}