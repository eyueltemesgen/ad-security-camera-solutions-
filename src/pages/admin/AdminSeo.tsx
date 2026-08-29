import { useEffect, useState } from 'react';
import { apiGet, apiPut, apiUpload } from '../../lib/api';
import { useCms } from '../../hooks/useCms';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, SectionCard } from './AdminUi';
import { Spinner } from '../../components/ui';
import type { CmsSettings } from '../../types';

export default function AdminSeo() {
  const { toast } = useToast();
  const { refetch } = useCms();
  const [settings, setSettings] = useState<CmsSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet<CmsSettings>('/api/cms/settings').then(setSettings).catch((e) => setError((e as Error).message)).finally(() => setLoading(false));
  }, []);

  const seo = (settings.seo ?? {}) as Record<string, unknown>;

  const save = async () => {
    setSaving(true);
    try {
      await apiPut('/api/cms/settings', { seo });
      toast('SEO settings saved');
      refetch();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = (k: string, v: string) => setSettings((s) => ({ ...s, seo: { ...(s.seo ?? {}), [k]: v } }));

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload<{ url: string }>('/api/uploads/image', fd);
      set('default_image', res.url);
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  if (error) return <AdminError error={error} />;
  if (loading) return <LoadingBlock />;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">SEO Management</h1>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : 'Save SEO Settings'}
        </button>
      </div>
      <p className="mb-6 text-sm text-slate-500">Search engine and social sharing metadata.</p>

      <div className="space-y-5">
        <SectionCard title="Search Engine" subtitle="Used in Google results and browser tabs.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Meta Title</label>
              <input className="input" value={String(seo.meta_title ?? '')} onChange={(e) => set('meta_title', e.target.value)} />
            </div>
            <div>
              <label className="label">Meta Description</label>
              <textarea className="input" rows={2} value={String(seo.meta_description ?? '')} onChange={(e) => set('meta_description', e.target.value)} />
            </div>
            <div>
              <label className="label">Default SEO Image</label>
              <div className="flex items-start gap-3">
                {seo.default_image ? <img src={String(seo.default_image)} alt="" className="h-12 w-12 rounded object-cover" /> : <span className="h-12 w-12 rounded bg-slate-100" />}
                <label className="btn btn-outline btn-sm">Upload<input type="file" accept="image/*" className="hidden" onChange={pickImage} /></label>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Social Sharing (Open Graph)" subtitle="Shown when your site is shared on social media.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">OG Title</label>
              <input className="input" value={String(seo.og_title ?? '')} onChange={(e) => set('og_title', e.target.value)} />
            </div>
            <div>
              <label className="label">OG Description</label>
              <textarea className="input" rows={2} value={String(seo.og_description ?? '')} onChange={(e) => set('og_description', e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
          Tip: individual products and services have their own meta title/description fields in their editors. Clean URL slugs are generated automatically from names.
        </div>
      </div>
    </div>
  );
}