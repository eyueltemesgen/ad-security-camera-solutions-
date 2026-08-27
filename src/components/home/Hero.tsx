import { useEffect, useState } from 'react';
import { ArrowRight, CircleCheck as CheckCircle2, Clock, DoorOpen, Network, Phone, Shield, Star, Video } from 'lucide-react';
import { toTel, useBusinessInfo } from '../../hooks/useBusinessInfo';

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
];

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const info = useBusinessInfo();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="home"
      className="bg-gradient-hero flex items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[70vh] md:min-h-[88vh] py-12 md:py-0"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-5 w-64 h-64 md:w-80 md:h-80 bg-brand-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-5 w-72 h-72 md:w-96 md:h-96 bg-brand-500/10 rounded-full blur-3xl animate-float-slow" />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Copy */}
        <div className="space-y-5 md:space-y-7">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-brand-500/10 border border-brand-500/20 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Trusted Security Partner in Ethiopia
          </div>

          <h1 className={`text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            <span className="text-gradient-animate">HD CCTV &</span>
            <br />
            <span className="text-gray-900 dark:text-white">Night-Vision Security</span>
          </h1>

          <p className={`text-base md:text-lg max-w-xl leading-relaxed ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s', color: 'var(--text-secondary)' }}>
            Crystal-clear cameras, remote viewing and professional installation across Ethiopia. We protect your home and business — day and night.
          </p>

          {/* Mobile-first CTAs */}
          <div className={`flex flex-col sm:flex-row gap-3 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <a
              href={`tel:${toTel(info.phone)}`}
              className="h-12 px-6 rounded-full text-white font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg"
              style={{ background: 'linear-gradient(145deg, #3bb37f, #1f7f57)', boxShadow: '0 8px 30px rgba(85,201,151,0.3)' }}
            >
              <Phone className="w-4 h-4" /> Click to Call
            </a>
            <a href="#products" className="btn-orange h-12 px-6 justify-center">
              Browse Cameras <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className={`flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s', color: 'var(--text-muted)' }}>
            {TRUST.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <item.icon className="w-4 h-4 text-brand-400" />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Visual panel */}
        <div className={`flex justify-center lg:justify-end ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <div className="glass-card rounded-3xl p-6 md:p-8 border border-brand-500/10 relative w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse-ring" />
                </div>
                <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>Live Monitor</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {HERO_PANEL.map((item) => (
                <div key={item.label} className={`flex items-center gap-3 p-3 md:p-4 rounded-2xl border ${item.border} ${item.bg}`}>
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${item.bg}`}>
                    <item.icon className={`w-4 h-4 md:w-5 md:h-5 ${item.color}`} />
                  </div>
                  <span className="text-xs md:text-sm font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> All Systems Active
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> 24/7 Monitoring
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
