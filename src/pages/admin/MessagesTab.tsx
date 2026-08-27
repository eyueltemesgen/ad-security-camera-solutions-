import { useMemo, useState } from 'react';
import { Inbox, Mail, MailCheck, Archive } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../hooks/useToast';
import { fetchContactMessages, updateContactMessageStatus } from '../../services/misc';
import { formatDateTime } from '../../lib/utils';
import { EmptyState, ErrorBox, Spinner } from '../../components/ui';
import { cn } from '../../lib/utils';

export function MessagesTab() {
  const { showToast } = useToast();
  const query = useQuery(() => fetchContactMessages(), []);
  const [selected, setSelected] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all');

  const filtered = useMemo(
    () => (query.data ?? []).filter((m) => statusFilter === 'all' || m.status === statusFilter),
    [query.data, statusFilter]
  );
  const unread = (query.data ?? []).filter((m) => m.status === 'new').length;
  const current = selected ? (query.data ?? []).find((m) => m.id === selected) : null;

  const setStatus = async (id: string, status: 'new' | 'read' | 'archived') => {
    try {
      await updateContactMessageStatus(id, status);
      await query.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="w-4 h-4 text-brand-400" /> Contact Messages
        </h3>
        <div className="flex gap-1.5">
          {(['all', 'new', 'read', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn('px-3 py-1.5 rounded-full text-xs border border-white/10 transition', statusFilter === s ? 'bg-brand-500/20 text-white' : 'text-gray-400 hover:text-white')}
            >
              {s === 'all' ? `All (${(query.data ?? []).length})` : `${s} (${(query.data ?? []).filter((m) => m.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      {unread > 0 && (
        <p className="text-xs text-amber-400 mb-3 flex items-center gap-1.5">
          <Archive className="w-3.5 h-3.5" /> {unread} new message(s) awaiting attention.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {query.loading ? (
            <Spinner />
          ) : query.error ? (
            <ErrorBox message={query.error} onRetry={() => void query.refetch()} />
          ) : filtered.length === 0 ? (
            <EmptyState message="No messages." icon={<Inbox className="w-14 h-14 opacity-30" />} />
          ) : (
            filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelected(m.id);
                  if (m.status === 'new') void setStatus(m.id, 'read');
                }}
                className={cn('w-full text-left glass-card rounded-xl p-4 transition', selected === m.id && 'ring-2 ring-brand-500/50')}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-semibold text-sm flex items-center gap-2">
                    {m.status === 'new' && <span className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />}
                    {m.name}
                  </p>
                  <span className="text-[10px] text-gray-500">{formatDateTime(m.created_at)}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{m.subject || 'No subject'}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{m.message}</p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 min-h-[200px]">
            {!current ? (
              <p className="text-sm text-gray-500 text-center py-10">Select a message to read it.</p>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-bold">{current.name}</h4>
                    <p className="text-xs text-gray-400">{current.email}</p>
                    {current.phone && <p className="text-xs text-gray-400">{current.phone}</p>}
                  </div>
                  <Mail className="w-8 h-8 text-brand-500/30" />
                </div>
                <p className="text-sm font-medium mb-2">{current.subject || 'No subject'}</p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{current.message}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => void setStatus(current.id, 'read')} className="btn-outline text-xs py-1.5 px-3">Mark read</button>
                  <button onClick={() => void setStatus(current.id, 'archived')} className="btn-outline text-xs py-1.5 px-3 text-amber-400">Archive</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}