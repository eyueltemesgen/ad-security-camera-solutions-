import { Award, CircleCheck as CheckCircle2, ShieldCheck, Truck, Wrench, Zap } from 'lucide-react';
import { useReveal } from '../../hooks/useReveal';

const STATS = [
  { value: '6+', label: 'Years Experience', color: 'text-blue-400', icon: Award },
  { value: '1200+', label: 'Happy Customers', color: 'text-emerald-400', icon: CheckCircle2 },
  { value: '98%', label: 'Satisfaction Rate', color: 'text-yellow-400', icon: Zap },
  { value: '24/7', label: 'Support Available', color: 'text-purple-400', icon: ShieldCheck },
];

const REASONS = [
  { title: 'Certified Technicians', body: 'Expert professionals with industry certifications', icon: Award },
  { title: 'Genuine Products', body: '100% authentic equipment from trusted brands', icon: ShieldCheck },
  { title: 'Fast Service', body: 'Quick response and same-day installation available', icon: Zap },
  { title: '12-Month Warranty', body: 'Full guarantee on all products and installations', icon: CheckCircle2 },
  { title: 'Affordable Prices', body: 'Competitive pricing with flexible payment options', icon: Wrench },
  { title: 'Nationwide Delivery', body: 'Serving customers across all of Ethiopia', icon: Truck },
];

export function About() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="about" ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-page relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="reveal">
          <span className="section-eyebrow">
            <ShieldCheck className="w-3 h-3" />
            About Us
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            About <span className="text-gradient">AD Security</span>
            <br />Camera Solutions
          </h2>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            AD Security Camera Solutions is a leading technology company in Ethiopia, specializing
            in CCTV, access control, time attendance, video intercom, network infrastructure and IT
            solutions. We deliver high-quality products and professional services to safeguard your
            business and home.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card glass-card-hover p-5 rounded-2xl text-center group">
                <stat.icon className={`w-7 h-7 mx-auto mb-2 ${stat.color} transition-transform group-hover:scale-110`} />
                <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl reveal" style={{ transitionDelay: '0.15s' }}>
          <h3 className="text-2xl font-bold mb-6">Why Choose Us?</h3>
          <div className="space-y-1">
            {REASONS.map((reason) => (
              <div key={reason.title} className="flex items-start gap-4 p-3 rounded-xl hover:bg-brand-500/5 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <reason.icon className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <strong className="text-base">{reason.title}</strong>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{reason.body}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-1 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
