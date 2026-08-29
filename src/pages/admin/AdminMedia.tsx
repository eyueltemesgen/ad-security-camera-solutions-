import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiUpload } from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { AdminError, LoadingBlock, Toolbar, SearchBox, CancelButton } from './AdminUi';
import { Spinner, formatDate } from '../../components/ui';
import type { MediaItem } from '../../types';

export default function AdminMedia() {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [usage, setUsage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiGet<MediaItem[]>('/api/cms/media');
      setItems(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('usage', usage);
      const res = await apiUpload<MediaItem>('/api/uploads/image', fd);
      toast('Image uploaded to media library');
      load();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const remove = async (m: MediaItem) => {
    if (!window.confirm(`Delete "${m.file_name || m.file_url}" from the media library?`)) return;
    try {
      await apiDelete(`/api/cms/media/${m.id}`);
      toast('Deleted');
      load();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const visible = items.filter((m) => !search || m.file_name?.toLowerCase().includes(search.toLowerCase()) || m.alt_text?.toLowerCase().includes(search.toLowerCase()));

  if (error) return <AdminError error={error} />;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Media Library</h1>
        <div className="flex items-center gap-2">
          <input className="input input-sm w-40" value={usage} onChange={(e) => setUsage(e.target.value)} placeholder="Usage (e.g. logo)" />
          <label className="btn btn-primary btn-sm cursor-pointer">
            {uploading ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : '+ Upload'}
            <input type="file" accept="image/*" className="hidden" onChange={upload} />
          </label>
        </div>
      </div>
      <p className="mb-6 text-sm text-slate-500">{items.length} files · upload images with an optional usage label.</p>

      <Toolbar>
        <SearchBox value={search} onChange={setSearch} placeholder="Search files…" />
      </Toolbar>

      {loading ? (
        <LoadingBlock />
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">No images yet. Upload your first image.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((m) => (
            <div key={m.id} className="card overflow-hidden">
              <img src={m.file_url} alt={m.alt_text || m.file_name} className="aspect-square w-full object-cover" />
              <div className="p-3">
                <a href={m.file_url} target="_blank" rel="noreferrer" className="block truncate text-xs font-medium text-[var(--primary)] hover:underline">{m.file_name}</a>
                <div className="mt-1 text-xs text-slate-400">{m.usage ? `Used for: ${m.usage}` : 'No usage tag'}</div>
                <div className="text-xs text-slate-400">{formatDate(m.created_at)}</div>
                <button className="btn btn-ghost btn-sm mt-2 w-full text-red-600" onClick={() => remove(m)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}