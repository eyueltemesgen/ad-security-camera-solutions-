import { Quote, Star } from 'lucide-react';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useReveal } from '../../hooks/useReveal';

export function Testimonials() {
  const { testimonials } = useSiteContent();
  const ref = useReveal<HTMLDivElement>();

  if (testimonials.length === 0) return null;

  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-panel)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12" ref={ref}>
          <span className="section-eyebrow">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">
            What Our <span className="text-gradient">Customers Say</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((t) => (
            <div key={t.id} className="glass-card glass-card-hover rounded-2xl p-6">
              <Quote className="w-8 h-8 text-brand-400/30 mb-3" fill="currentColor" />
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                “{t.content}”
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-500/30 to-brand-700/30 font-bold text-sm">
                  {t.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.customer_name}</p>
                  {t.company && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.company}</p>}
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < (t.rating ?? 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}