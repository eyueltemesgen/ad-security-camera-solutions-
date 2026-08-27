import { Link } from 'react-router-dom';
import { ClipboardList, Phone, Wrench } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';
import { useBusinessInfo, toTel } from '../hooks/useBusinessInfo';
import { Spinner } from '../components/ui';

export function ServicesPage() {
  const { services, servicesLoading } = useSiteContent();
  const info = useBusinessInfo();

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="section-eyebrow">
            <Wrench className="w-3 h-3" /> Our Services
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2">
            Professional <span className="text-gradient">Security Solutions</span>
          </h1>
          <p className="mt-2 text-sm md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            From single cameras to full building security systems
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          <Link to="/request-service" className="btn-orange h-11 inline-flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Book a Service
          </Link>
          <a href={`tel:${toTel(info.phone)}`} className="btn-outline h-11 inline-flex items-center gap-2">
            <Phone className="w-4 h-4" /> Call us
          </a>
        </div>

        {servicesLoading ? (
          <Spinner />
        ) : services.length === 0 ? (
          <p className="text-center" style={{ color: 'var(--text-muted)' }}>No services listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-brand-500/20 to-brand-700/20">
                  {service.icon ? (
                    <img src={service.icon} alt="" className="w-7 h-7 object-contain" />
                  ) : (
                    <Wrench className="w-6 h-6 text-brand-400" />
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2">{service.name}</h3>
                <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>
                  {service.description}
                </p>
                <span className="mt-4 text-sm text-brand-400 font-medium">Learn more →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}