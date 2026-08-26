import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { Header } from './Header';
import { Radio, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store';

export const Layout: React.FC = () => {
  const { broadcastFeed } = useAppStore();
  const latestAlert = broadcastFeed[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      {/* Top Banner for Critical Alerts if any */}
      {latestAlert && latestAlert.priority === 'critical' && (
        <div className="bg-red-950/80 border-b border-red-800/50 px-4 py-2 text-xs flex items-center justify-between text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 animate-bounce" />
            <span className="font-semibold text-white">CRITICAL ALERT:</span>
            <span>{latestAlert.title} — {latestAlert.message}</span>
          </div>
          <span className="text-red-400 font-mono text-[11px]">{latestAlert.time}</span>
        </div>
      )}

      {/* Main workspace */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>

      {/* Footer / SOC Status Bar */}
      <footer className="border-t border-slate-800 bg-slate-950/90 px-4 py-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            AD Security Camera Solutions SOC Node #01
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">Addis Ababa, Ethiopia · +251 985 959 697</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Latency: <strong className="text-emerald-400 font-mono">14ms</strong></span>
          <span>WebRTC Streams: <strong className="text-blue-400 font-mono">Active (TLS)</strong></span>
          <span>Supabase RLS: <strong className="text-emerald-400 font-mono">Enforced</strong></span>
        </div>
      </footer>
    </div>
  );
};
