import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPut, apiUpload } from '../../lib/api';
import { useCms } from '../../hooks/useCms';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock } from './AdminUi';
import { Spinner } from '../../components/ui';
import type { HomepageSection, PageContent } from '../../types';

type Json = Record<string, unknown>;

function str(v: unknown, fallback = ''): string {
  if (v == null) return fallback;
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch { return fallback; }
}

const gene = { 'shield': 'Shield', 'award': 'Award', 'headphones': 'Headphones', 'clock': 'Clock', 'badge-check': 'Badge Check', 'settings': 'Settings', 'heart': 'Heart', 'camera': 'Camera', 'lock': 'Lock', 'wrench': 'Wrench', 'users': 'Users', 'globe': 'Globe', 'fingerprint': 'Fingerprint', 'video': 'Video', 'network': 'Network', 'server': 'Server', 'phone': 'Phone', 'sparkles': 'Sparkles', 'star': 'Star' };

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function AreaInput({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea className="input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ImagePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { toast } = useToast();
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiUpload<{ url: string }>('/api/uploads/image', fd);
      onChange(res.url);
      toast('Image uploaded');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-start gap-3">
        {value ? <img src={value} alt="" className="h-16 w-16 rounded-lg object-cover" /> : <span className="h-16 w-16 rounded-lg bg-slate-100" />}
        <div className="flex flex-col gap-2">
          <label className="btn btn-outline btn-sm cursor-pointer">Upload<input type="file" accept="image/*" className="hidden" onChange={pick} /></label>
          {value && <button className="btn btn-ghost btn-sm text-red-600" onClick={() => onChange('')}>Remove</button>}
        </div>
      </div>
    </div>
  );
}

function ListEditor({ label, items, onChange, keyLabel = 'Text' }: { label: string; items: string[]; onChange: (v: string[]) => void; keyLabel?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input className="input input-sm" value={item} placeholder={keyLabel} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <button className="btn btn-ghost btn-sm text-red-600" onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={() => onChange([...items, ''])}>+ Add</button>
      </div>
    </div>
  );
}

function ObjListEditor({ label, items, onChange, keys }: { label: string; items: Json[]; onChange: (v: Json[]) => void; keys: string[] }) {
  const [omit] = useState<string[]>([]);
  void omit;
  const patch = (i: number, key: string, value: string) => {
    const next = items.map((item, j) => (j === i ? { ...item, [key]: value } : item));
    onChange(next);
  };
  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-3">
            <div className="grid gap-2">
              {keys.map((k) => (
                <div key={k}>
                  <label className="label text-xs capitalize">{k.replace(/_/g, ' ')}</label>
                  <input className="input input-sm" value={str(item[k])} onChange={(e) => patch(i, k, e.target.value)} />
                  {k === 'icon' && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(gene).map(([v, lbl]) => (
                        <button key={v} type="button" className={`border rounded px-1.5 py-0.5 text-[10px] ${item[k] === v ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-slate-200 text-slate-400'}`} onClick={() => patch(i, k, v)}>{lbl}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm mt-2 text-red-600" onClick={() => onChange(items.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button className="btn btn-outline btn-sm" onClick={() => onChange([...items, Object.fromEntries(keys.map((k) => [k, '']))])}>+ Add</button>
      </div>
    </div>
  );
}

function SectionEditor({ section, onChange, onSave, saving, onToggle }: {
  section: HomepageSection & { content: Json };
  onChange: (content: Json) => void;
  onSave: () => void;
  saving: boolean;
  onToggle: () => void;
}) {
  const c = section.content ?? {};
  const set = (key: string, value: unknown) => onChange({ ...c, [key]: value });

  const Render = () => {
    switch (section.slug) {
      case 'hero':
      case 'final_cta':
        return (
          <div className="space-y-4">
            <TextInput label="Heading" value={str(c.heading)} onChange={(v) => set('heading', v)} />
            <AreaInput label="Subtitle" value={str(c.subtitle)} onChange={(v) => set('subtitle', v)} />
            {'badge' in c || section.slug === 'hero' ? <TextInput label="Badge Text" value={str(c.badge, '')} onChange={(v) => set('badge', v)} /> : null}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <TextInput label="CTA 1 Label" value={str(c.cta1_label)} onChange={(v) => set('cta1_label', v)} />
                <TextInput label="CTA 1 URL" value={str(c.cta1_url)} onChange={(v) => set('cta1_url', v)} />
              </div>
              <div>
                <TextInput label="CTA 2 Label" value={str(c.cta2_label)} onChange={(v) => set('cta2_label', v)} />
                <TextInput label="CTA 2 URL" value={str(c.cta2_url)} onChange={(v) => set('cta2_url', v)} />
              </div>
            </div>
            <ImagePicker label="Background Image" value={str(c.image)} onChange={(v) => set('image', v)} />
          </div>
        );
      case 'trust':
        return <ObjListEditor label="Trust Points" items={Array.isArray(c.items) ? (c.items as Json[]) : []} onChange={(v) => set('items', v)} keys={['label', 'icon']} />;
      case 'services':
      case 'featured_products':
      case 'testimonials':
      case 'gallery':
      case 'faq':
        return (
          <div className="space-y-4">
            <TextInput label="Section Title" value={str(c.title)} onChange={(v) => set('title', v)} />
            <TextInput label="Section Subtitle" value={str(c.subtitle)} onChange={(v) => set('subtitle', v)} />
            {'show_all' in c && (
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={Boolean(c.show_all)} onChange={(e) => set('show_all', e.target.checked)} /> Show all services
              </label>
            )}
            {'limit' in c && <TextInput label="Limit" value={str(c.limit)} onChange={(v) => set('limit', v ? Number(v) : '')} />}
            {section.slug === 'gallery' && (
              <>
                <TextInput label="CTA Label" value={str(c.cta_label)} onChange={(v) => set('cta_label', v)} />
                <TextInput label="CTA URL" value={str(c.cta_url)} onChange={(v) => set('cta_url', v)} />
              </>
            )}
          </div>
        );
      case 'installation':
        return (
          <div className="space-y-4">
            <TextInput label="Heading" value={str(c.heading)} onChange={(v) => set('heading', v)} />
            <AreaInput label="Subtitle" value={str(c.subtitle)} onChange={(v) => set('subtitle', v)} />
            <ImagePicker label="Image" value={str(c.image)} onChange={(v) => set('image', v)} />
            <TextInput label="CTA Label" value={str(c.cta_label)} onChange={(v) => set('cta_label', v)} />
            <TextInput label="CTA URL" value={str(c.cta_url)} onChange={(v) => set('cta_url', v)} />
            <ListEditor label="Steps" items={Array.isArray(c.steps) ? (c.steps as string[]) : []} onChange={(v) => set('steps', v)} />
          </div>
        );
      case 'why_choose_us':
        return (
          <div className="space-y-4">
            <TextInput label="Title" value={str(c.title)} onChange={(v) => set('title', v)} />
            <TextInput label="Subtitle" value={str(c.subtitle)} onChange={(v) => set('subtitle', v)} />
            <ObjListEditor label="Benefits" items={Array.isArray(c.items) ? (c.items as Json[]) : []} onChange={(v) => set('items', v)} keys={['title', 'body', 'icon']} />
          </div>
        );
      case 'how_it_works':
        return (
          <div className="space-y-4">
            <TextInput label="Title" value={str(c.title)} onChange={(v) => set('title', v)} />
            <TextInput label="Subtitle" value={str(c.subtitle)} onChange={(v) => set('subtitle', v)} />
            <ObjListEditor label="Steps" items={Array.isArray(c.steps) ? (c.steps as Json[]) : []} onChange={(v) => set('steps', v)} keys={['title', 'body']} />
          </div>
        );
      default:
        return <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-500">{JSON.stringify(c, null, 2)}</pre>;
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="badge badge-option">{section.sort_order}</span>
          <h3 className="font-bold text-slate-900">{section.title}</h3>
          {section.is_active ? <span className="badge status-completed">Published</span> : <span className="badge status-cancelled">Hidden</span>}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm" onClick={onToggle}>{section.is_active ? 'Hide' : 'Publish'}</button>
          <button className="btn btn-primary btn-sm" onClick={onSave} disabled={saving}>
            {saving ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : 'Save Draft'}
          </button>
        </div>
      </div>
      <div className="p-5">
        <Render />
      </div>
    </div>
  );
}

function PageEditor({ page, onSave }: { page: PageContent; onSave: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ title: page.title, subtitle: page.subtitle, content: JSON.stringify(page.content ?? {}, null, 2), is_active: page.is_active });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      let content: Json = {};
      try {
        content = JSON.parse(form.content);
      } catch {
        return toast('Content must be valid JSON', 'error');
      }
      await apiPut(`/api/cms/pages/${page.slug}`, { title: form.title, subtitle: form.subtitle, content, is_active: form.is_active });
      toast(`"${form.title}" saved & published`);
      onSave();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="font-bold text-slate-900">{page.title} <span className="ml-1 font-mono text-xs font-normal text-slate-400">/{page.slug}</span></h3>
          {form.is_active ? <span className="badge status-completed">Published</span> : <span className="badge status-cancelled">Hidden</span>}
        </div>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : 'Save & Publish'}
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Page Title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
          <TextInput label="Subtitle" value={form.subtitle} onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))} />
        </div>
        <div>
          <label className="label">Content (JSON) — e.g. {"{"}"story":"..."{"}"}</label>
          <textarea className="input font-mono text-xs" rows={12} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Published (visible to customers)
        </label>
      </div>
    </div>
  );
}

export default function AdminWebsite() {
  const { toast } = useToast();
  const { refetch } = useCms();
  const [sections, setSections] = useState<Array<HomepageSection & { content: Json }>>([]);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [tab, setTab] = useState<'home' | 'pages'>('home');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, p] = await Promise.all([
        apiGet<Array<HomepageSection & { content: Json }>>('/api/cms/homepage'),
        apiGet<PageContent[]>('/api/cms/pages'),
      ]);
      setSections(s);
      setPages(p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveSection = async (slug: string, content: Json, is_active?: boolean) => {
    setSavingSlug(slug);
    try {
      const s = sections.find((x) => x.slug === slug);
      await apiPut(`/api/cms/homepage/${slug}`, { content, is_active: is_active ?? s?.is_active ?? true, title: s?.title });
      toast(`"${slug}" draft saved`);
      await refetch();
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSavingSlug(null);
    }
  };

  const toggleSection = (section: HomepageSection & { content: Json }) => {
    if (window.confirm(`${section.is_active ? 'Hide' : 'Publish'} the "${section.title}" section on the homepage?`)) {
      saveSection(section.slug, section.content ?? {}, !section.is_active);
    }
  };

  if (error) return <AdminError error={error} />;
  if (loading) return <LoadingBlock label="Loading website CMS…" />;

  return (
    <div>
      <div className="mb-1">
        <h1 className="text-xl font-bold text-slate-900">Website Management</h1>
      </div>
      <p className="mb-6 text-sm text-slate-500">Control every section of the customer website. Changes appear instantly after saving.</p>

      <div className="mb-5 flex gap-2">
        <button className={`badge cursor-pointer ${tab === 'home' ? 'badge-active' : 'badge-option'}`} onClick={() => setTab('home')}>Homepage Sections</button>
        <button className={`badge cursor-pointer ${tab === 'pages' ? 'badge-active' : 'badge-option'}`} onClick={() => setTab('pages')}>Pages</button>
      </div>

      {tab === 'home' ? (
        <div className="space-y-5">
          {sections.map((s) => (
            <SectionEditor
              key={s.id}
              section={s}
              onChange={(content) => setSections((xs) => xs.map((x) => (x.id === s.id ? { ...x, content } : x)))}
              onSave={() => saveSection(s.slug, sections.find((x) => x.id === s.id)?.content ?? {})}
              saving={savingSlug === s.slug}
              onToggle={() => toggleSection(s)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {pages.map((p) => (
            <PageEditor key={p.id} page={p} onSave={load} />
          ))}
        </div>
      )}
    </div>
  );
}