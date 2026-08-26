import React, { useState, useEffect } from 'react';
import { Flame, Radio, Clock, UserCheck, ShieldAlert, CheckCircle2, AlertTriangle, Send, History } from 'lucide-react';
import { useAppStore } from '../../store';
import type { Incident } from '../../types';

export const IncidentsPage: React.FC = () => {
  const { incidents, addBroadcast } = useAppStore();
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'info' | 'warning' | 'critical'>('warning');

  // Simulated countdown timers
  const [timers, setTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize timers
    const initial: Record<string, number> = {};
    incidents.forEach(inc => {
      initial[inc.id] = inc.timer_seconds_remaining || 300;
    });
    setTimers(initial);

    const interval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (next[k] > 0) next[k] -= 1;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [incidents]);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    addBroadcast({
      title: `SOC Team Dispatch (${broadcastPriority.toUpperCase()})`,
      message: broadcastMessage,
      priority: broadcastPriority,
    });

    setBroadcastMessage('');
    alert('Realtime dispatch broadcast sent to all field operators via Supabase.');
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
            <Flame className="h-4 w-4 text-orange-400" />
            Incident Escalation Management
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Guard & Incident Escalation Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Active security tickets, assigned field guard response tracking, countdown response SLA timers, and team broadcasts.
          </p>
        </div>
      </div>

      {/* Broadcast Box */}
      <div className="rounded-2xl border border-blue-900/50 bg-gradient-to-r from-blue-950/30 to-indigo-950/30 p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
          <Radio className="h-4 w-4 text-blue-400 animate-pulse" />
          One-Click Realtime Team Dispatch Broadcast
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Instantly notify all on-duty guards & SOC operators via Supabase Realtime channel subscriptions.
        </p>

        <form onSubmit={handleBroadcast} className="flex flex-col sm:flex-row gap-3">
          <select
            value={broadcastPriority}
            onChange={e => setBroadcastPriority(e.target.value as 'info' | 'warning' | 'critical')}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:outline-none"
          >
            <option value="critical">Critical Escalation</option>
            <option value="warning">Warning / Notice</option>
            <option value="info">General Info</option>
          </select>
          <input
            type="text"
            required
            value={broadcastMessage}
            onChange={e => setBroadcastMessage(e.target.value)}
            placeholder="e.g. Guard Unit 04, proceed to Perimeter Gate immediately..."
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all"
          >
            <Send className="h-3.5 w-3.5" /> Broadcast Alert
          </button>
        </form>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Active Incident Escalation Tickets</span>
          <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
            {incidents.filter(i => i.status !== 'resolved' && i.status !== 'false_alarm').length} Open
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {incidents.map(incident => {
            const remaining = timers[incident.id] ?? 0;
            const isUrgent = remaining < 60 && remaining > 0;

            return (
              <div
                key={incident.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400 uppercase">
                      {incident.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        incident.escalation_level >= 3
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        Level {incident.escalation_level} Escalation
                      </span>
                    </div>
                  </div>

                  {/* Incident Title & Event info */}
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-white">
                      {incident.event?.event_type.replace(/_/g, ' ').toUpperCase() || 'Security Escalation'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Camera: <strong className="text-slate-300">{incident.event?.camera_name || 'Main Feed'}</strong>
                    </p>
                  </div>

                  {/* Guard tracking */}
                  <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          {incident.assigned_guard_name || 'Unassigned Guard'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {incident.assigned_guard_id ? 'On Patrol' : 'Pending Operator Assign'}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[11px] font-semibold capitalize ${
                      incident.status === 'dispatched'
                        ? 'text-blue-400'
                        : incident.status === 'acknowledged'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}>
                      {incident.status}
                    </span>
                  </div>

                  {/* SLA Response Timer */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>SLA Response Countdown:</span>
                    </div>
                    <div className={`font-mono text-sm font-bold ${
                      isUrgent
                        ? 'text-red-500 animate-pulse'
                        : remaining > 0
                        ? 'text-amber-400'
                        : 'text-red-500'
                    }`}>
                      {remaining > 0 ? formatTimer(remaining) : 'EXPIRED'}
                    </div>
                  </div>

                  {/* Notes */}
                  {incident.notes && (
                    <div className="mt-3 text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                      "{incident.notes}"
                    </div>
                  )}
                </div>

                {/* Audit Trail Snippet */}
                <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <History className="h-3 w-3" /> Audit Logged
                  </span>
                  <span>{new Date(incident.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
