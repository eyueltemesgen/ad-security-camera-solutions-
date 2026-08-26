import React from 'react';
import { ShieldAlert, Filter, Search, CheckCircle2, XCircle, ArrowRight, ShieldCheck, UserCheck, Flame, Cpu } from 'lucide-react';
import { useAppStore } from '../../store';
import { EventDrawer } from '../../components/events/EventDrawer';
import type { EventSeverity, EventType } from '../../types';

const EVENT_TYPES: { id: string; label: string }[] = [
  { id: '', label: 'All Event Types' },
  { id: 'person_detection', label: 'Person Detection' },
  { id: 'intrusion', label: 'Intrusion' },
  { id: 'license_plate_recognition', label: 'License Plate (LPR)' },
  { id: 'thermal_alert', label: 'Thermal Alert' },
  { id: 'object_left_behind', label: 'Object Left Behind' },
];

export const EventsPage: React.FC = () => {
  const {
    events,
    eventSeverityFilter,
    eventTypeFilter,
    setEventSeverityFilter,
    setEventTypeFilter,
    selectEvent,
  } = useAppStore();

  const filteredEvents = events.filter(e => {
    const severityMatch = eventSeverityFilter === 'all' || e.severity === eventSeverityFilter;
    const typeMatch = !eventTypeFilter || e.event_type === eventTypeFilter;
    return severityMatch && typeMatch;
  });

  const counts = {
    total: events.length,
    critical: events.filter(e => e.severity === 'critical').length,
    warning: events.filter(e => e.severity === 'warning').length,
    info: events.filter(e => e.severity === 'info').length,
  };

  const severityBadges: Record<EventSeverity, { bg: string; text: string }> = {
    critical: { bg: 'bg-red-500/20 border-red-500/40', text: 'text-red-400' },
    warning: { bg: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-400' },
    info: { bg: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-400' },
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
            <Cpu className="h-4 w-4 text-blue-400" />
            Neural AI Analytics
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Real-Time Security Event Log</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time multi-camera edge AI inference events, thermal triggers, and LPR recognitions.
          </p>
        </div>
      </div>

      {/* Severity filter summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setEventSeverityFilter('all')}
          className={`rounded-xl border p-4 text-left transition-all ${
            eventSeverityFilter === 'all'
              ? 'border-blue-500 bg-blue-950/20 ring-1 ring-blue-500'
              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
          }`}
        >
          <div className="text-xs text-slate-400">Total Stream Events</div>
          <div className="text-2xl font-bold text-white mt-1">{counts.total}</div>
        </button>

        <button
          onClick={() => setEventSeverityFilter('critical')}
          className={`rounded-xl border p-4 text-left transition-all ${
            eventSeverityFilter === 'critical'
              ? 'border-red-500 bg-red-950/40 ring-1 ring-red-500'
              : 'border-red-900/40 bg-red-950/20 hover:border-red-800'
          }`}
        >
          <div className="text-xs text-red-400 font-medium">Critical Alerts</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{counts.critical}</div>
        </button>

        <button
          onClick={() => setEventSeverityFilter('warning')}
          className={`rounded-xl border p-4 text-left transition-all ${
            eventSeverityFilter === 'warning'
              ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500'
              : 'border-amber-900/40 bg-amber-950/20 hover:border-amber-800'
          }`}
        >
          <div className="text-xs text-amber-400 font-medium">Warning Thresholds</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{counts.warning}</div>
        </button>

        <button
          onClick={() => setEventSeverityFilter('info')}
          className={`rounded-xl border p-4 text-left transition-all ${
            eventSeverityFilter === 'info'
              ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500'
              : 'border-blue-900/40 bg-blue-950/20 hover:border-blue-800'
          }`}
        >
          <div className="text-xs text-blue-400 font-medium">Informational</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{counts.info}</div>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 flex-1">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by camera, zone, or event metadata..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={eventTypeFilter}
            onChange={e => setEventTypeFilter(e.target.value)}
            className="bg-transparent text-sm text-white border-none outline-none focus:ring-0"
          >
            {EVENT_TYPES.map(t => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table / List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/50 uppercase tracking-wider text-[10px] text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Severity</th>
                <th className="px-4 py-3.5">Event Type</th>
                <th className="px-4 py-3.5">Camera / Zone</th>
                <th className="px-4 py-3.5">AI Confidence</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.map(evt => {
                const sBadge = severityBadges[evt.severity];
                return (
                  <tr
                    key={evt.id}
                    onClick={() => selectEvent(evt.id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${sBadge.bg} ${sBadge.text}`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-white">
                      {evt.event_type.replace(/_/g, ' ').toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-white">{evt.camera_name}</div>
                      <div className="text-[10px] text-slate-400">{evt.location_zone}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              evt.confidence_score >= 90
                                ? 'bg-red-500'
                                : evt.confidence_score >= 70
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${evt.confidence_score}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-300">{evt.confidence_score}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-400">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        evt.status === 'new'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : evt.status === 'acknowledged'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : evt.status === 'dispatched'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          selectEvent(evt.id);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors"
                      >
                        Inspect <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <EventDrawer />
    </div>
  );
};
