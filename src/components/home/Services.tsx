import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SERVICES } from '../../data/services';
import { useStorefront } from '../../hooks/useStorefront';
import { useReveal } from '../../hooks/useReveal';
import { ArrowRight } from 'lucide-react';

export function Services() {
  const { openService } = useStorefront();
  const ref = useReveal<HTMLDivElement>();
  const [openName, setOpenName] = useState<string | null>(SERVICES[0]?.name ?? null);

  return (
    <section id="services" ref={ref} className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-page relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-14 reveal">
          <span className="section-eyebrow">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            What We Do
          </span>
          <h2 className="text-2xl md:text-5xl font-extrabold tracking-tight">
            Our <span className="text-gradient">Services</span>
          </h2>
          <p className="mt-2 md:mt-3 text-sm md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            End-to-end security and networking solutions
          </p>
        </div>

        {/* Mobile: accordion. Desktop: grid cards. */}
        <div className="md:hidden space-y-3 reveal">
          {SERVICES.map((service) => {
            const open = openName === service.name;
            return (
              <div key={service.name} className="glass-card rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border-soft)' }}>
                <button
                  onClick={() => setOpenName(open ? null : service.name)}
                  className="w-full flex items-center gap-3 p-4 text-left active:bg-brand-500/5"
                  aria-expanded={open}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${service.iconBg}`}>
                    <service.icon className={`w-5 h-5 ${service.color}`} />
                  </div>
                  <span className="font-bold text-base flex-1">{service.name}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
                </button>
                {open && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.features.map((f) => (
                        <span key={f.label} className={`text-xs px-2.5 py-1 rounded-full ${f.chipClass}`}>{f.label}</span>
                      ))}
                    </div>
                    <button onClick={() => openService(service.name)} className="btn-orange w-full h-12 text-sm font-semibold">
                      Book Service <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
          {SERVICES.map((service) => (
            <div
              key={service.name}
              className="glass-card glass-card-hover service-card p-7 rounded-2xl transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-brand-500/0 group-hover:from-brand-500/5 transition-all duration-500 pointer-events-none" />
              <div className="flex items-center gap-3 mb-4 relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${service.iconBg} icon-glow transition-transform group-hover:scale-110`}>
                  <service.icon className={`w-6 h-6 ${service.color}`} />
                </div>
                <h3 className="text-xl font-bold">{service.name}</h3>
              </div>
              <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {service.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {service.features.map((feature) => (
                  <span key={feature.label} className={`text-xs px-2.5 py-1 rounded-full ${feature.chipClass}`}>
                    {feature.label}
                  </span>
                ))}
              </div>
              <button onClick={() => openService(service.name)} className="btn-orange w-full text-sm py-2.5 group/btn">
                Book Service <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
