import { useEffect, useState } from 'react';
import { ArrowRight, CircleCheck as CheckCircle2, Clock, Code, DoorOpen, Network, Shield, Star, Video, Zap } from 'lucide-react';

const TRUST = [
  { icon: CheckCircle2, label: '6+ Years' },
  { icon: CheckCircle2, label: '1200+ Clients' },
  { icon: Shield, label: 'Certified' },
  { icon: Star, label: '4.9/5 Rating' },
];

const HERO_PANEL = [
  { icon: Video, label: 'CCTV', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Network, label: 'Network', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { icon: Clock, label: 'Time Attendance', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { icon: DoorOpen, label: 'Video Intercom', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { icon: Code, label: 'Web & IT Solutions', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
];

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="home"
      className="bg-gradient-hero min-h-[88vh] flex items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-5 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-5 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
        {/* Left: copy */}
        <div className="space-y-7">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-brand-500/10 border border-brand-500/20 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Trusted Security Partner in Ethiopia
          </div>

          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            <span className="text-gradient-animate">Securing What</span>
            <br />
            <span className="text-gray-900 dark:text-white">Matters Most</span>
          </h1>

          <p className={`text-lg max-w-xl leading-relaxed ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s', color: 'var(--text-secondary)' }}>
            Professional CCTV, access control, time attendance, video intercom, networking and IT
            solutions — installation, repair and maintenance across Ethiopia.
          </p>

          <div className={`flex flex-wrap gap-3 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <a href="#services" className="btn-primary">
              Our Services <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#contact" className="btn-orange">
              Get a Quote
            </a>
            <a href="#products" className="btn-outline">
              Shop Products
            </a>
          </div>

          <div className={`flex flex-wrap items-center gap-6 text-sm ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s', color: 'var(--text-muted)' }}>
            {TRUST.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <item.icon className="w-4 h-4 text-brand-400" />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: animated security visual */}
        <div className={`flex justify-center lg:justify-end ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <div className="glass-card rounded-3xl p-8 border border-brand-500/10 relative w-full max-w-md">
            {/* Scanning line effect */}
            <div className="absolute inset-x-0 top-0 h-full overflow-hidden rounded-3xl pointer-events-none">
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent animate-scan" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse-ring" />
                </div>
                <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>Live Monitor</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Zap className="w-3 h-3 text-emerald-400" />
                <span className="animate-blink">REC</span>
              </div>
            </div>

            {/* Service grid */}
            <div className="grid grid-cols-2 gap-4">
              {HERO_PANEL.map((item, idx) => (
                <div
                  key={item.label}
                  className={`group relative ${item.label === 'Web & IT Solutions' ? 'col-span-2' : ''}`}
                  style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
                >
                  <div className={`flex items-center gap-3 p-4 rounded-2xl border ${item.border} ${item.bg} transition-all duration-300 hover:scale-[1.03] hover:shadow-lg`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg} icon-glow`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-sm font-semibold">{item.label}</span>
                    {item.label === 'Web & IT Solutions' && (
                      <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer status bar */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                All Systems Active
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                24/7 Monitoring
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-transparent pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-page))' }} />
    </section>
  );
}
