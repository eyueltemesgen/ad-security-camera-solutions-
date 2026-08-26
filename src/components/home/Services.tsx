import { SERVICES } from '../../data/services';
import { useStorefront } from '../../hooks/useStorefront';

export function Services() {
  const { openService } = useStorefront();

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-night">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Our <span className="text-gradient">Services</span>
          </h2>
          <p className="text-gray-400 mt-2">End-to-end security and networking solutions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <div
              key={service.name}
              className="glass-card glass-card-hover service-card p-6 rounded-2xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.iconBg}`}>
                  <service.icon className={`w-5 h-5 ${service.color}`} />
                </div>
                <h3 className="text-xl font-semibold">{service.name}</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">{service.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {service.features.map((feature) => (
                  <span
                    key={feature.label}
                    className={`text-xs px-2 py-1 rounded-full ${feature.chipClass}`}
                  >
                    {feature.label}
                  </span>
                ))}
              </div>
              <button
                onClick={() => openService(service.name)}
                className="btn-orange w-full text-sm py-2"
              >
                Book Service
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
