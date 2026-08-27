import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../hooks/useToast';
import { EmptyState, ErrorBox, Spinner } from '../../components/ui';

export interface FieldSpec {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'switch';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  className?: string;
}

type FieldDef = FieldSpec;

export interface CmsEntityConfig<T> {
  label: string;
  singular: string;
  fetch: () => Promise<T[]>;
  create: (input: Record<string, unknown>) => Promise<void>;
  update: (id: string, input: Record<string, unknown>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  fields: FieldSpec[];
  getValue: (row: T, key: string) => unknown;
  /** Key(s) used when filtering rows for search (dot-joined). */
  searchKeys: (string | ((row: T) => string))[];
}

export function CmsEntityManager({ config }: { config: CmsEntityConfig<any> }) {
  const { showToast } = useToast();
  const query = useQuery(() => config.fetch(), []);

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<{ row: any; id?: string } | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return query.data ?? [];
    return (query.data ?? []).filter((row) =>
      config.searchKeys.some((k) => {
        const raw = typeof k === 'function' ? k(row) : (row as Record<string, unknown>)[k];
        return String(raw ?? '').toLowerCase().includes(term);
      })
    );
  }, [query.data, search, config]);

  const startNew = () => {
    const init: Record<string, unknown> = {};
    for (const f of config.fields) {
      if (f.type === 'switch' || f.type === 'checkbox') init[f.key] = init[f.key] ?? false;
      else if (f.type === 'select') init[f.key] = init[f.key] ?? (f.options?.[0]?.value ?? '');
      else init[f.key] = init[f.key] ?? '';
    }
    setForm(init);
    setEditing({ row: '' });
  };

  const startEdit = (id: string) => {
    const row = query.data?.find((r) => (r as { id: string }).id === id);
    const init: Record<string, unknown> = {};
    for (const f of config.fields) init[f.key] = (row as Record<string, unknown>)?.[f.key] ?? '';
    setForm(init);
    setEditing({ row: id, id });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (editing?.id) await config.update(editing.id, form);
      else await config.create(form);
      showToast(`${config.singular} saved`, 'success');
      setEditing(null);
      await query.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(`Delete this ${config.singular.toLowerCase()}?`)) return;
    try {
      await config.remove(id);
      showToast(`${config.singular} deleted`, 'info');
      await query.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  const setField = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold">{config.label}</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input !w-48 pl-9"
            />
          </div>
          <button onClick={startNew} className="btn-primary text-sm py-2 px-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add {config.singular}
          </button>
        </div>
      </div>

      {query.loading ? (
        <Spinner />
      ) : query.error ? (
        <ErrorBox message={query.error} onRetry={() => void query.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState message={`No ${config.singular.toLowerCase()}s found.`} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-white/10">
                {config.fields.slice(0, 4).map((f) => (
                  <th key={f.key} className="py-2 pr-4 font-medium">
                    {f.label}
                  </th>
                ))}
                <th className="py-2 pr-4">Active</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const id = (row as { id: string }).id;
                return (
                  <tr key={id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    {config.fields.slice(0, 4).map((f) => (
                      <td key={f.key} className="py-3 px-4">
                        {f.type === 'switch' || f.type === 'checkbox' ? (
                          <span className={config.getValue(row, f.key) ? 'text-emerald-400' : 'text-gray-600'}>
                            {config.getValue(row, f.key) ? 'On' : 'Off'}
                          </span>
                        ) : (
                          <span className="line-clamp-2 max-w-[260px]">{toValue(config.getValue(row, f.key), f)}</span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4">
                      {config.getValue(row, 'is_active') ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500 text-xs">
                          <X className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <button onClick={() => startEdit(id)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => void remove(id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold">
                {editing.id ? `Edit ${config.singular}` : `New ${config.singular}`}
              </h4>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              {config.fields.map((f) => (
                                <FieldInput key={f.key} field={f} value={form[f.key]} onChange={(v) => setField(f.key, v)} />
                              ))}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={busy} className="btn-primary flex-1 py-2 text-sm">
                  {busy ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setEditing(null)} className="btn-outline px-5 py-2 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function toValue(value: unknown, _f: FieldDef): ReactNode {
  return renderVal(value);
}

function renderVal(value: unknown): ReactNode {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map((v) => (typeof v === 'object' && v ? (v as { label?: string; url?: string }).label ?? (v as { url?: string }).url ?? JSON.stringify(v) : String(v))).join(', ');
  if (value === null || value === undefined || value === '') return <span className="text-gray-600">—</span>;
  return String(value);
}

function FieldInput({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const base = 'form-input';
  if (field.type === 'textarea') {
    return (
      <label className="block">
        <span className="text-xs text-gray-400 block mb-1">{field.label}</span>
        <textarea rows={3} className={base} placeholder={field.placeholder} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
      </label>
    );
  }
  if (field.type === 'select') {
    return (
      <label className="block">
        <span className="text-xs text-gray-400 block mb-1">{field.label}</span>
        <select className={base} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o: { value: string; label: string }) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
    );
  }
  if (field.type === 'checkbox' || field.type === 'switch') {
    return (
      <label className="flex items-center justify-between py-2 rounded-lg px-3 bg-white/5">
        <span className="text-sm text-gray-300">{field.label}</span>
        <input type="checkbox" className="w-4 h-4" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
      </label>
    );
  }
  return (
    <label className="block">
      <span className="text-xs text-gray-400 block mb-1">{field.label}</span>
      <input className={base} type="text" placeholder={field.placeholder} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}