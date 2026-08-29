import { useEffect, useState } from 'react';
import { apiGet, apiPut, apiUpload } from '../../lib/api';
import { useCms } from '../../hooks/useCms';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, SectionCard } from './AdminUi';
import { Spinner } from '../../components/ui';
import type { CmsSettings } from '../../types';

export default function AdminSettings() {
  const { toast } = useToast();
  const { refetch } = useCms();
  const { changePassword } = useAuth();
  const [settings, setSettings] = useState<CmsSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    apiGet<CmsSettings>('/api/cms/settings').then(setSettings).catch((e) => setError((e as Error).message)).finally(() => setLoading(false));
  }, []);

  const brand = (settings.branding ?? {}) as Record<string, unknown>;
  const contact = (settings.contact ?? {}) as Record<string, unknown>;
  const socialRefs = (settings.social ?? {}) as Record<string, unknown>;

  const setIn = (section: string, k: string, v: string) => setSettings((s) => ({ ...s, [section]: { ...(s[section] ?? {}), [k]: v } }));

  const saveSection = async (section: string) => {
    setSaving(true);
    try {
      await apiPut('/api/cms/settings', { [section]: settings[section] ?? {} });
      toast('Settings saved');
      refetch();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadFor = async (section: string, key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload<{ url: string }>('/api/uploads/image', fd);
      setIn(section, key, res.url);
      toast('Uploaded — click Save to apply');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  const changePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 6) return toast('New password must be at least 6 characters', 'error');
    if (pw.next !== pw.confirm) return toast('Passwords do not match', 'error');
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      toast('Admin password changed');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  if (error) return <AdminError error={error} />;
  if (loading) return <LoadingBlock />;

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Settings</h1>
      <p className="mb-6 text-sm text-slate-500">Company identity, contact details and account security.</p>

      <div className="space-y-6">
        {/* General / Branding */}
        <SectionCard
          title="General & Branding"
          subtitle="Company name, logo and favicon — updates apply everywhere automatically."
          action={<button className="btn btn-primary btn-sm" disabled={saving} onClick={() => saveSection('branding')}>{saving ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : 'Save Branding'}</button>}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Company Name</label>
              <input className="input" value={String(brand.company_name ?? '')} onChange={(e) => setIn('branding', 'company_name', e.target.value)} />
            </div>
            <div>
              <label className="label">Site Title</label>
              <input className="input" value={String(brand.site_title ?? '')} onChange={(e) => setIn('branding', 'site_title', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={String(brand.description ?? '')} onChange={(e) => setIn('branding', 'description', e.target.value)} />
            </div>
            <div>
              <label className="label">Logo</label>
              <div className="flex items-start gap-3">
                {brand.logo_url ? <img src={String(brand.logo_url)} alt="" className="h-12 w-12 rounded object-contain" /> : <span className="flex h-12 w-12 items-center justify-center rounded bg-slate-100 text-xs text-slate-400">Logo</span>}
                <label className="btn btn-outline btn-sm">Upload<input type="file" accept="image/*" className="hidden" onChange={(e) => uploadFor('branding', 'logo_url', e)} /></label>
              </div>
            </div>
            <div>
              <label className="label">Favicon</label>
              <div className="flex items-start gap-3">
                {brand.favicon_url ? <img src={String(brand.favicon_url)} alt="" className="h-8 w-8 rounded object-contain" /> : <span className="h-8 w-8 rounded bg-slate-100" />}
                <label className="btn btn-outline btn-sm">Upload<input type="file" accept="image/*" className="hidden" onChange={(e) => uploadFor('branding', 'favicon_url', e)} /></label>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Contact */}
        <SectionCard
          title="Contact Information"
          subtitle="Shown in the header, footer and contact page."
          action={<button className="btn btn-primary btn-sm" disabled={saving} onClick={() => saveSection('contact')}>{saving ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : 'Save Contact'}</button>}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={String(contact.email ?? '')} onChange={(e) => setIn('contact', 'email', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={String(contact.phone ?? '')} onChange={(e) => setIn('contact', 'phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Secondary Phone</label>
              <input className="input" value={String(contact.secondary_phone ?? '')} onChange={(e) => setIn('contact', 'secondary_phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Working Hours</label>
              <input className="input" value={String(contact.working_hours ?? '')} onChange={(e) => setIn('contact', 'working_hours', e.target.value)} />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" value={String(contact.address ?? '')} onChange={(e) => setIn('contact', 'address', e.target.value)} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" value={String(contact.website ?? '')} onChange={(e) => setIn('contact', 'website', e.target.value)} />
            </div>
          </div>
        </SectionCard>

        {/* Social */}
        <SectionCard
          title="Social Media Links"
          subtitle="URLs point to your actual pages. Store editable URLs."
          action={<button className="btn btn-primary btn-sm" disabled={saving} onClick={() => saveSection('social')}>{saving ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : 'Save Social Links'}</button>}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {['Instagram', 'Telegram', 'TikTok', 'Facebook', 'YouTube', 'WhatsApp', 'LinkedIn'].map((platform) => (
              <div key={platform}>
                <label className="label">{platform} URL</label>
                <input className="input" placeholder={`https://...`} value={String(socialRefs[platform.toLowerCase()] ?? socialRefs[platform] ?? '')} onChange={(e) => setIn('social', platform.toLowerCase(), e.target.value)} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard title="Security" subtitle="Change your admin password.">
          <form onSubmit={changePasswordSubmit} className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Current Password</label>
              <input className="input" type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input className="input" type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} required />
            </div>
            <div className="sm:col-span-3">
              <button className="btn btn-primary btn-sm" type="submit">Change Password</button>
            </div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}