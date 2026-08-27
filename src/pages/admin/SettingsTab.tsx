import { useEffect, useState, type FormEvent } from 'react';
import { Save, Settings } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../hooks/useToast';
import { fetchSiteSettings, saveSiteSettings, type SiteSettingsInput } from '../../services/misc';
import { ErrorBox, Spinner } from '../../components/ui';

const DEFAULTS: SiteSettingsInput = {
  company_name: '',
  phone: '',
  secondary_phone: '',
  email: '',
  website: '',
  address: '',
  currency: 'ETB',
  logo_url: '',
  favicon_url: '',
  tagline: '',
  description: '',
  working_hours: '',
  facebook: '',
  youtube: '',
  whatsapp: '',
  tiktok: '',
  telegram: '',
  instagram: '',
  linkedin: '',
  primary_color: '#1b4d2e',
  accent_color: '#55c997',
  seo_title: '',
  seo_description: '',
  seo_image: '',
  footer_text: '',
};

export function SettingsTab() {
  const { showToast } = useToast();
  const settings = useQuery(() => fetchSiteSettings(), []);
  const [form, setForm] = useState<SiteSettingsInput>(DEFAULTS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setForm({
        company_name: settings.data.company_name,
        phone: settings.data.phone,
        secondary_phone: settings.data.secondary_phone,
        email: settings.data.email,
        website: settings.data.website,
        address: settings.data.address,
        currency: settings.data.currency,
        logo_url: settings.data.logo_url,
        favicon_url: settings.data.favicon_url,
        tagline: settings.data.tagline,
        description: settings.data.description,
        working_hours: settings.data.working_hours,
        facebook: settings.data.facebook,
        youtube: settings.data.youtube,
        whatsapp: settings.data.whatsapp,
        tiktok: settings.data.tiktok,
        telegram: settings.data.telegram,
        instagram: settings.data.instagram,
        linkedin: settings.data.linkedin,
        primary_color: settings.data.primary_color,
        accent_color: settings.data.accent_color,
        seo_title: settings.data.seo_title,
        seo_description: settings.data.seo_description,
        seo_image: settings.data.seo_image,
        footer_text: settings.data.footer_text,
      });
    }
  }, [settings.data]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await saveSiteSettings(form);
      showToast('Settings saved', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl max-w-2xl">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-4 h-4 text-blue-400" /> Business Settings
      </h3>

      {settings.loading ? (
        <Spinner />
      ) : settings.error ? (
        <ErrorBox message={settings.error} onRetry={() => void settings.refetch()} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Company Name</label>
            <input
              className="form-input"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Phone</label>
              <input
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Secondary Phone</label>
              <input
                className="form-input"
                value={form.secondary_phone}
                onChange={(e) => setForm({ ...form, secondary_phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Email</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Website</label>
            <input
              className="form-input"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Address</label>
            <input
              className="form-input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Currency</label>
            <select
              className="form-input"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="ETB">ETB (Br)</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <button type="submit" disabled={busy} className="btn-success py-2.5">
            <Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  );
}
