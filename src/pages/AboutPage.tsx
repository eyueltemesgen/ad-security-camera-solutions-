import { CheckCircle2, MapPin, Phone, Star, Wrench } from 'lucide-react';
import { useBusinessInfo } from '../hooks/useBusinessInfo';
import { useSiteContent } from '../hooks/useSiteContent';
import { useReveal } from '../hooks/useReveal';

const VALUES = [
  {
    icon: Star,
    title: 'Genuine Quality',
    text: 'We supply original, branded security equipment from trusted global manufacturers — never counterfeit.',
  },
  {
    icon: Wrench,
    title: 'Professional Installation',
    text: 'Certified technicians install and configure your system correctly, with minimized disruption to your space.',
  },
  {
    icon: CheckCircle2,
    title: 'After-Sales Support',
    text: 'Service contracts, maintenance, and responsive troubleshooting keep your system running year-round.',
  },
  {
    icon: Phone,
    title: '24/7 Assistance',
    text: 'Reach us by phone or on popular messaging apps whenever you need help or an inspection.',
  },
];

export function AboutPage() {
  const info = useBusinessInfo();
  const { testimonials } = useSiteContent();
  const ref = useReveal<HTMLDivElement>();

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="section-eyebrow">About Us</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2">
            Protecting <span className="text-gradient">Ethiopia</span>, One Camera at a Time
          </h1>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-10 mb-10" ref={ref}>
          <p className="text-base leading-relaxed md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            {info.description}
          </p>
          <p className="mt-4 text-base leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>
            We combine trusted hardware with professional installation and dependable after-sales
            service, helping homes, shops, offices and organizations across Ethiopia protect what
            matters most.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {VALUES.map((v) => (
            <div key={v.title} className="glass-card glass-card-hover rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-brand-500/20 to-brand-700/20">
                <v.icon className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">{v.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v.text}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <MapPin className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold">Find Us</h2>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{info.address}</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            {info.phone} {info.secondaryPhone ? `• ${info.secondaryPhone}` : ''}
          </p>
          <a href={`mailto:${info.email}`} className="text-sm text-brand-400 mt-1 inline-block">{info.email}</a>
          <div className="flex gap-2 items-center justify-center mt-4">
            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span className="text-sm font-medium">
              Rated {testimonials.length ? 'by our customers' : 'for our service quality'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}