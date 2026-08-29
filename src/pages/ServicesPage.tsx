import { Link } from 'react-router-dom';
import { useServiceCategories, useServices } from '../hooks/useData';
import { EmptyState, PageTitle } from '../components/ui';

export default function ServicesPage() {
  const { services, loading } = useServices();
  const { categories } = useServiceCategories();

  const byCategory = categories
    .map((c) => ({
      category: c,
      services: services.filter((s) => s.category_id === c.id),
    }))
    .filter((g) => g.services.length > 0);

  return (
    <div>
      <PageTitle
        title="Our Services"
        subtitle="Complete security and technology solutions — design, supply, installation, maintenance and support."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
      />
      <div className="container-x py-10">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-44" />)}
          </div>
        ) : services.length === 0 ? (
          <EmptyState title="No services listed yet" subtitle="Check back soon." />
        ) : (
          byCategory.map((group) => (
            <div key={group.category.id} className="mb-12">
              <div className="mb-5 border-l-4 border-[var(--accent)] pl-4">
                <h2 className="text-xl font-bold">{group.category.name}</h2>
                {group.category.description && <p className="mt-1 text-sm text-slate-500">{group.category.description}</p>}
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.services.map((s) => (
                  <Link key={s.id} to={`/services/${s.slug}`} className="card group p-6 transition-shadow hover:shadow-lg">
                    <h3 className="text-lg font-bold text-slate-900">{s.name}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-500">{s.short_description}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--primary)]">
                        Learn More
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      <span className="btn btn-sm btn-accent">Request</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}