import { CheckCircle2 } from 'lucide-react';

const STATS = [
  { value: '6+', label: 'Years Experience', color: 'text-blue-400' },
  { value: '1200+', label: 'Happy Customers', color: 'text-blue-400' },
  { value: '98%', label: 'Satisfaction Rate', color: 'text-emerald-400' },
  { value: '24/7', label: 'Support Available', color: 'text-purple-400' },
];

const REASONS = [
  { title: 'Certified Technicians', body: 'Expert professionals' },
  { title: 'Genuine Products', body: '100% authentic' },
  { title: 'Fast Service', body: 'Quick response' },
  { title: 'Warranty', body: '12-month guarantee' },
  { title: 'Affordable Prices', body: 'Competitive pricing' },
];

export function About() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-night">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">
            About <span className="text-gradient">AD Security Camera Solutions</span>
          </h2>
          <p className="text-gray-300 mt-4 leading-relaxed">
            AD Security Camera Solutions is a leading technology company in Ethiopia, specializing
            in CCTV, access control, time attendance, video intercom, network infrastructure and IT
            solutions. We deliver high-quality products and professional services to safeguard your
            business and home.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card p-4 rounded-xl text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-semibold mb-4">Why Choose Us?</h3>
          <div className="space-y-3">
            {REASONS.map((reason) => (
              <div key={reason.title} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>{reason.title}</strong>
                  <p className="text-sm text-gray-400">{reason.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
