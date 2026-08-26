import { useMemo, useState } from 'react';
import { Search, Wrench } from 'lucide-react';
import { useQuery } from '../../hooks/useQuery';
import { useToast } from '../../hooks/useToast';
import { fetchServiceRequests, updateServiceRequestStatus } from '../../services/misc';
import { SERVICES } from '../../data/services';
import { formatDate, statusLabel } from '../../lib/utils';
import { SERVICE_STATUSES, type ServiceStatus } from '../../types';
import { EmptyState, ErrorBox, Spinner } from '../../components/ui';
import { StatusBadge } from '../../components/modals/OrderDetailModal';

export function ServicesTab({ refreshSignal }: { refreshSignal: number }) {
  const { showToast } = useToast();
  const requests = useQuery(() => fetchServiceRequests(), [refreshSignal]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (requests.data ?? []).filter((request) => {
      if (filter !== 'all' && request.status !== filter) return false;
      if (!term) return true;
      return (
        request.customer_name.toLowerCase().includes(term) ||
        request.service.toLowerCase().includes(term) ||
        request.email.toLowerCase().includes(term) ||
        request.phone.includes(term)
      );
    });
  }, [requests.data, filter, search]);

  const setStatus = async (id: string, status: ServiceStatus) => {
    try {
      await updateServiceRequestStatus(id, status);
      showToast(`Service request → ${statusLabel(status)}`, 'success');
      await requests.refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Wrench className="w-4 h-4 text-blue-400" /> Manage Services
      </h3>

      <div className="glass-card p-6 rounded-2xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((service) => (
            <div key={service.name} className="bg-white/5 rounded-xl p-4 text-center">
              <service.icon className={`w-8 h-8 mx-auto mb-2 ${service.color}`} />
              <h4 className="font-semibold text-sm">{service.name}</h4>
              <p className="text-xs text-gray-400">{service.description}</p>
              <span className="inline-block mt-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h4 className="font-semibold">Service Requests</h4>
          <div className="flex gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-input !w-auto">
              <option value="all">All Status</option>
              {SERVICE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input !w-44 pl-9"
              />
            </div>
          </div>
        </div>

        {requests.loading ? (
          <Spinner />
        ) : requests.error ? (
          <ErrorBox message={requests.error} onRetry={() => void requests.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState message="No service requests." />
        ) : (
          <div className="space-y-3">
            {filtered.map((request) => (
              <div key={request.id} className="bg-white/5 rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{request.service}</p>
                    <p className="text-sm text-gray-300">
                      {request.customer_name} • {request.phone || 'no phone'} •{' '}
                      {request.email || 'no email'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested {formatDate(request.created_at)}
                      {request.preferred_date && ` • preferred ${formatDate(request.preferred_date)}`}
                    </p>
                    {request.location && (
                      <p className="text-xs text-gray-500">Location: {request.location}</p>
                    )}
                    {request.description && (
                      <p className="text-sm text-gray-400 mt-1">{request.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={request.status} />
                    <select
                      value={request.status}
                      onChange={(e) => void setStatus(request.id, e.target.value as ServiceStatus)}
                      className="form-input !w-auto text-xs py-1.5"
                    >
                      {SERVICE_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
