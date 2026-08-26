import { CheckCircle2, Clock, Code, DoorOpen, Network, Star, Video } from 'lucide-react';

const TRUST = [
  { icon: CheckCircle2, label: '6+ Years', color: 'text-blue-500' },
  { icon: CheckCircle2, label: '1200+ Clients', color: 'text-blue-500' },
  { icon: CheckCircle2, label: 'Certified', color: 'text-blue-500' },
  { icon: Star, label: '4.9/5 Rating', color: 'text-yellow-500' },
];

const HERO_PANEL = [
  { icon: Video, label: 'CCTV', color: 'text-blue-400' },
  { icon: Network, label: 'Network', color: 'text-emerald-400' },
  { icon: Clock, label: 'Time Attendance', color: 'text-yellow-400' },
  { icon: DoorOpen, label: 'Video Intercom', color: 'text-purple-400' },
  { icon: Code, label: 'Web & IT Solutions', color: 'text-orange-400', span: true },
];

export function Hero() {
  return (
    <section
      id="home"
      className="bg-gradient-hero min-h-[85vh] flex items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            <span className="text-gradient">Welcome to</span>
            <br />
            <span className="text-white">AD Security Camera Solutions</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
            Professional CCTV, access control, time attendance, video intercom, networking and IT
            solutions — installation, repair and maintenance across Ethiopia.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#services" className="btn-primary">
              Our Services
            </a>
            <a href="#contact" className="btn-orange">
              Get a Quote
            </a>
            <a href="#products" className="btn-outline">
              Shop Products
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
            {TRUST.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="glass-card rounded-3xl p-10 border border-white/10">
            <div className="grid grid-cols-2 gap-6 text-center">
              {HERO_PANEL.map((item) => (
                <div key={item.label} className={item.span ? 'col-span-2' : undefined}>
                  <item.icon className={`w-10 h-10 mx-auto ${item.color}`} />
                  <p className="text-xs text-gray-400 mt-2">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
