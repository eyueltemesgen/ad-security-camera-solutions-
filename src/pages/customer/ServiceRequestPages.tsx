import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import { EmptyState, PageLoader, formatDate, statusBadge } from '../../components/ui';
import type { ServiceRequest } from '../../types';

export function MyServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ServiceRequest[]>('/api/service-requests/mine')
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Service Requests</h1>
          <p className="mt-1 text-sm text-slate-500">Track the status of your service requests.</p>
        </div>
        <Link to="/request-service" className="btn btn-accent btn-sm">New Request</Link>
      </div>

      {requests.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No service requests" subtitle="Request installation, maintenance, repair or a consultation." action={<Link to="/request-service" className="btn btn-accent">Request a Service</Link>} />
        </div>
      ) : (
        <div className="card mt-5 divide-y divide-slate-50 overflow-hidden">
          {requests.map((r) => (
            <Link key={r.id} to={`/dashboard/services/${r.id}`} className="block px-5 py-4 hover:bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-800">{r.request_number} · {r.service_name}</div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {formatDate(r.created_at)} · {r.location || 'No location'}
                  </div>
                </div>
                {statusBadge(r.status)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function ServiceRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGet<ServiceRequest>(`/api/service-requests/${id}`).then(setRequest).catch(() => setError(true));
  }, [id]);

  if (!request && !error) return <PageLoader />;
  if (error || !request) {
    return <EmptyState title="Request not found" action={<Link to="/dashboard/services" className="btn btn-primary">Back to Requests</Link>} />;
  }

  return (
    <div>
      <Link to="/dashboard/services" className="text-sm font-medium text-[var(--primary)] hover:underline">← All Requests</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{request.request_number}</h1>
        {statusBadge(request.status)}
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {request.service_name} · Submitted {formatDate(request.created_at)}
      </p>

      <div className="card card-pad mt-5">
        <h2 className="font-bold">Request Details</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-400">Location</dt><dd className="font-medium">{request.location || '—'}</dd></div>
          <div><dt className="text-slate-400">Property Type</dt><dd className="font-medium">{request.property_type || '—'}</dd></div>
          <div><dt className="text-slate-400">Preferred Date</dt><dd className="font-medium">{request.preferred_date ? formatDate(String(request.preferred_date)) : '—'}</dd></div>
          <div><dt className="text-slate-400">Preferred Time</dt><dd className="font-medium">{request.preferred_time || '—'}</dd></div>
          <div><dt className="text-slate-400">Devices</dt><dd className="font-medium">{request.device_count ?? '—'}</dd></div>
          <div><dt className="text-slate-400">Current System</dt><dd className="font-medium">{request.current_system || '—'}</dd></div>
          <div className="sm:col-span-2"><dt className="text-slate-400">Description</dt><dd className="font-medium">{request.description}</dd></div>
          {request.notes && <div className="sm:col-span-2"><dt className="text-slate-400">Notes</dt><dd className="font-medium">{request.notes}</dd></div>}
          {request.admin_notes && <div className="sm:col-span-2"><dt className="text-slate-400">Staff Notes</dt><dd className="font-medium">{request.admin_notes}</dd></div>}
          {request.assigned_technician && <div className="sm:col-span-2"><dt className="text-slate-400">Assigned Technician</dt><dd className="font-medium">{request.assigned_technician}</dd></div>}
        </dl>
      </div>

      {request.files.length > 0 && (
        <div className="card card-pad mt-5">
          <h2 className="font-bold">Uploaded Files</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {request.files.map((f) => (
              <a key={f.id} href={f.file_url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-lg border border-slate-200">
                {f.file_type?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(f.file_url) ? (
                  <img src={f.file_url} alt={f.file_name} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square flex-col items-center justify-center gap-1 bg-slate-50 text-slate-400">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 15V3m0 12-4-4m4 4 4-4M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="px-1 text-center text-[10px]">{f.file_name}</span>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <Link to="/request-service" className="btn btn-accent btn-sm">Request Another Service</Link>
        <Link to="/contact" className="btn btn-outline btn-sm">Contact Us</Link>
      </div>
    </div>
  );
}