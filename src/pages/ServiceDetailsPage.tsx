import { Link, useParams } from 'react-router-dom';
import { useService } from '../hooks/useData';
import { EmptyState, PageLoader, PageTitle } from '../components/ui';

export default function ServiceDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { service, related, loading, error } = useService(slug);

  if (loading) return <PageLoader label="Loading service…" />;

  if (error || !service) {
    return (
      <div className="container-x py-16">
        <EmptyState title="Service not found" subtitle="The service you are looking for does not exist." action={<Link to="/services" className="btn btn-primary">View All Services</Link>} />
      </div>
    );
  }

  const features = Array.isArray(service.features) ? service.features.filter((f) => f && f.label) : [];

  return (
    <div>
      <PageTitle
        title={service.name}
        subtitle={service.short_description}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Services', to: '/services' }, { label: service.name }]}
      />
      <div className="container-x py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              {service.image_url ? (
                <img src={service.image_url} alt={service.name} className="aspect-[16/7] w-full object-cover" />
              ) : (
                <div className="flex aspect-[16/7] items-center justify-center bg-[var(--primary)]/5 text-[var(--primary)]">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.9"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="13" r="3" /></svg>
                </div>
              )}
            </div>
            <div className="card card-pad mt-6">
              <h2 className="text-lg font-bold">About this service</h2>
              <div className="prose-cms mt-3">{service.description}</div>
            </div>
            {features.length > 0 && (
              <div className="card card-pad mt-6">
                <h2 className="text-lg font-bold">What's included</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <svg className="mt-0.5 shrink-0 text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {f.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="card card-pad">
              <h3 className="font-bold">Ready to get started?</h3>
              <p className="mt-2 text-sm text-slate-500">Submit a service request and our team will get back to you within 24 hours.</p>
              <Link to="/request-service" className="btn btn-accent mt-4 w-full">Request This Service</Link>
              <Link to="/contact" className="btn btn-outline mt-2 w-full">Contact Us</Link>
            </div>
            {service.category && (
              <div className="card card-pad">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</h3>
                <p className="mt-1 text-sm font-semibold">{service.category.name}</p>
              </div>
            )}
            <div className="card card-pad bg-[var(--primary)] text-white">
              <h3 className="font-bold text-white">Need a custom solution?</h3>
              <p className="mt-2 text-sm text-slate-300">We design security systems tailored to your property and requirements.</p>
              <Link to="/contact" className="btn btn-sm mt-4 bg-white text-[var(--primary)] hover:bg-white/90">Get a Consultation</Link>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 text-lg font-bold">Related Services</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {related.map((s) => (
                <Link key={s.id} to={`/services/${s.slug}`} className="card p-5 transition-shadow hover:shadow-lg">
                  <h3 className="font-bold text-slate-900">{s.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{s.short_description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}