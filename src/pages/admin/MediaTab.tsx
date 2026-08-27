import { useRef, useState } from 'react';
import { Copy, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../hooks/useToast';
import { deleteMedia, fetchMedia, uploadMedia } from '../../services/cms';
import { formatETB } from '../../lib/utils';
import { EmptyState, ErrorBox, Spinner } from '../../components/ui';

export function MediaTab() {
  const { showToast } = useToast();
  const query = useQuery(() => fetchMedia(), []);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        await uploadMedia(file);
      }
      showToast('Uploaded', 'success');
      await query.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (id: string, path: string) => {
    if (!window.confirm('Delete this file from the library and storage?')) return;
    try {
      await deleteMedia(id, path);
      showToast('Deleted', 'info');
      await query.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-brand-400" /> Media Library
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{(query.data ?? []).length} files</span>
          <button onClick={() => inputRef.current?.click()} disabled={busy} className="btn-primary text-sm py-2 px-3 flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> {busy ? 'Uploading…' : 'Upload'}
          </button>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={(e) => void handleUpload(e.target.files)} />
        </div>
      </div>

      {query.loading ? (
        <Spinner />
      ) : query.error ? (
        <ErrorBox message={query.error} onRetry={() => void query.refetch()} />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState message="No files yet. Upload your first image." icon={<ImageIcon className="w-14 h-14 opacity-30" />} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(query.data ?? []).map((item) => (
            <div key={item.id} className="glass-card rounded-xl overflow-hidden">
              <div className="aspect-square bg-white/5 overflow-hidden">
                <img src={item.url} alt={item.alt_text || item.filename} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs font-medium truncate" title={item.filename}>{item.filename}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {formatETB(item.file_size / 1024, 1)} KB
                </p>
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => {
                      void navigator.clipboard.writeText(item.url).then(() => showToast('URL copied', 'info'));
                    }}
                    className="flex-1 text-[11px] py-1 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                  <button onClick={() => void remove(item.id, item.path)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}