import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  Cctv,
  ShieldAlert,
  MapPin,
  Flame,
  Activity,
  Radio,
  Sliders,
  Settings,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../../store';

export const Header: React.FC = () => {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { broadcastFeed, incidents } = useAppStore();

  const activeIncidentsCount = incidents.filter(i => i.status !== 'resolved' && i.status !== 'false_alarm').length;
  const criticalFeedCount = broadcastFeed.filter(b => b.priority === 'critical').length;

  const navItems = [
    { to: '/cameras', label: 'Cameras', icon: Cctv },
    { to: '/events', label: 'AI Events', icon: ShieldAlert },
    { to: '/soc/map', label: 'SOC Map', icon: MapPin },
    { to: '/incidents', label: 'Escalations', icon: Flame, badge: activeIncidentsCount },
    { to: '/analytics', label: 'Analytics', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Link to="/cameras" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Cctv className="h-5 w-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                AD Security Camera Solutions
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 uppercase tracking-wider border border-blue-500/30">
                  SOC v2.4
                </span>
              </span>
              <span className="text-xs text-slate-400">Enterprise AI Surveillance & Incident Response</span>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.to || (item.to !== '/' && currentPath.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-inner'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0.2 text-[11px] font-bold text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side live status & actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Inference Engine: Online</span>
          </div>

          <button
            title="Realtime dispatch feed"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Bell className="h-4 w-4" />
            {criticalFeedCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-950" />
            )}
          </button>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-semibold text-white ring-1 ring-slate-700">
              OP
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-200">Operator Duty</span>
              <span className="text-[10px] text-slate-400">Addis Ababa SOC</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
