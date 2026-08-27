import { Link, useParams } from 'react-router-dom';
import { Check, ClipboardList, Phone, Wrench } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useBusinessInfo, toTel } from '../hooks/useBusinessInfo';
import { EmptyState, Spinner } from '../components/ui';

export function ServiceDetailPage() {
  const { slug } = useParams();
  const { services, servicesLoading } = useSiteContent();
  const info = useBusinessInfo();

  if (servicesLoading) return <Spinner className="min-h-[50vh]" />;
  const service = services.find((s) => s.slug === slug);
  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState message="Service not found." />
      </div>
    );
  }

  const includes = Array.isArray(service.features) ? service.features : [];

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <Link to="/" className="hover:text-brand-400">Home</Link> /{' '}
          <Link to="/services" className="hover:text-brand-400">Services</Link> /{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{service.name}</span>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-500/20 to-brand-700/20">
              {service.icon ? (
                <img src={service.icon} alt="" className="w-8 h-8 object-contain" />
              ) : (
                <Wrench className="w-7 h-7 text-brand-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold">{service.name}</h1>
            </div>
          </div>

          <p className="text-sm leading-relaxed md:text-base" style={{ color: 'var(--text-secondary)' }}>
            {service.description}
          </p>

          {includes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4">What's included</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link to="/request-service" className="btn-orange h-12 inline-flex items-center gap-2 flex-1 justify-center">
              <ClipboardList className="w-4 h-4" /> Request This Service
            </Link>
            <a href={`tel:${toTel(info.phone)}`} className="btn-outline h-12 inline-flex items-center gap-2 flex-1 justify-center">
              <Phone className="w-4 h-4" /> Call to Book
            </a>
          </div>
        </div>

        {/* Other services */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Other services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.filter((s) => s.id !== service.id).slice(0, 3).map((s) => (
              <Link key={s.id} to={`/services/${s.slug}`} className="glass-card rounded-xl p-4 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-1">{s.name}</h3>
                <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{s.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}