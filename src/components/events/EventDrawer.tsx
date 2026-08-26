import React from 'react';
import { AlertTriangle, Info, ShieldAlert, CheckCircle2, XCircle, Bell } from 'lucide-react';
import { useAppStore } from '../../store';
import type { EventSeverity } from '../../types';

const SEVERITY_STYLE: Record<EventSeverity, { bg: string; text: string; icon: React.FC<{ className?: string }>; label: string }> = {
  critical: {
    bg: 'border-red-500/50 bg-red-950/20 hover:bg-red-950/40',
    text: 'text-red-400',
    icon: AlertTriangle,
    label: 'Critical',
  },
  warning: {
    bg: 'border-amber-500/50 bg-amber-950/20 hover:bg-amber-950/40',
    text: 'text-amber-400',
    icon: ShieldAlert,
    label: 'Warning',
  },
  info: {
    bg: 'border-blue-500/50 bg-blue-950/20 hover:bg-blue-950/40',
    text: 'text-blue-400',
    icon: Info,
    label: 'Info',
  },
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  person_detection: 'Person Detection',
  intrusion: 'Intrusion Detected',
  license_plate_recognition: 'License Plate Recognition',
  thermal_alert: 'Thermal Hotspot Alert',
  object_left_behind: 'Object Left Behind',
};

export const EventDrawer: React.FC = () => {
  const { eventDrawerOpen, selectedEventId, events, setEventDrawerOpen, acknowledgeEvent, resolveEvent, dispatchGuard } =
    useAppStore();

  const selectedEvent = events.find(e => e.id === selectedEventId);

  if (!eventDrawerOpen || !selectedEvent) return null;

  const severityStyle = SEVERITY_STYLE[selectedEvent.severity];
  const SeverityIcon = severityStyle.icon;

  const handleAcknowledge = () => {
    acknowledgeEvent(selectedEvent.id);
    setEventDrawerOpen(false);
  };

  const handleResolve = (resolution: 'resolved' | 'false_alarm') => {
    resolveEvent(selectedEvent.id, resolution);
  };

  const handleDispatch = () => {
    dispatchGuard(selectedEvent.id, 'guard-auto');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      {/* Backdrop */}
      <div className="w-full h-full" onClick={() => setEventDrawerOpen(false)}></div>

      {/* Drawer panel */}
      <div className="relative w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 overflow-y-auto animate-in slide-in-from-right fade-in">
        {/* Close button */}
        <button
          onClick={() => setEventDrawerOpen(false)}
          className="absolute top-4 right-4 rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white z-10 transition-colors"
        >
          <XCircle className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className={`border-b px-6 py-5 ${selectedEvent.severity === 'critical' ? 'border-red-800/50 bg-red-950/30' : 'border-slate-800'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${severityStyle.bg}`}>
              <SeverityIcon className={`h-5 w-5 ${severityStyle.text}`} />
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${severityStyle.text}`}>
                {severityStyle.label} Severity
              </div>
              <h2 className="text-lg font-bold text-white">{EVENT_TYPE_LABELS[selectedEvent.event_type]}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
            <span className="text-slate-500">ID: {selectedEvent.id}</span>
            <span className="text-slate-500">·</span>
            <span>{selectedEvent.camera_name}</span>
            <span className="text-slate-500">·</span>
            <span className="text-white">{new Date(selectedEvent.timestamp).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Snapshot + Confidence */}
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <div className="aspect-video bg-slate-950 relative">
              <img
                src={selectedEvent.snapshot_url}
                alt="Event snapshot"
                className="w-full h-full object-cover opacity-80"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Bounding box mock overlay */}
              {selectedEvent.metadata?.bounding_boxes && selectedEvent.metadata.bounding_boxes.map((box, i) => (
                <div
                  key={i}
                  className="absolute border-2 border-emerald-400 rounded-sm"
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.w}%`,
                    height: `${box.h}%`,
                  }}
                >
                  <div className="absolute top-[-20px] left-0 bg-emerald-600/90 text-[10px] text-white px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                    {box.label} {box.confidence.toFixed(1)}%
                  </div>
                </div>
              ))}
              <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] text-white font-medium backdrop-blur-sm border border-white/10">
                AI Detection Confidence: {selectedEvent.confidence_score}%
              </div>
            </div>
          </div>

          {/* AI Analysis Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-blue-400" />
              AI Analysis & Confidence Breakdown
            </h3>

            <div className="space-y-4">
              {/* Confidence bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Confidence Score</span>
                  <span className={`font-semibold ${
                    selectedEvent.confidence_score >= 90
                      ? 'text-red-400'
                      : selectedEvent.confidence_score >= 70
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {selectedEvent.confidence_score}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      selectedEvent.confidence_score >= 90
                        ? 'bg-red-500'
                        : selectedEvent.confidence_score >= 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedEvent.confidence_score}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Detection Model:</span>
                  <span className="ml-2 text-slate-200 font-medium">YOLOv9-AE Secure v3.1</span>
                </div>
                <div>
                  <span className="text-slate-500">Processing Time:</span>
                  <span className="ml-2 text-slate-200 font-medium">12ms (GPU)</span>
                </div>
                <div>
                  <span className="text-slate-500">Camera Zone:</span>
                  <span className="ml-2 text-slate-200 font-medium">{selectedEvent.location_zone}</span>
                </div>
                <div>
                  <span className="text-slate-500">Algorithm:</span>
                  <span className="ml-2 text-slate-200 font-medium">Edge TensorRT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Response Actions */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-400" />
              Incident Response Actions
            </h3>

            <div className="space-y-3">
              {selectedEvent.status === 'new' && (
                <>
                  <button
                    onClick={handleAcknowledge}
                    className="w-full flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-950/40 p-4 text-sm font-medium text-amber-300 hover:bg-amber-900/40 transition-all"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold text-white">Acknowledge Event</div>
                      <div className="text-[11px] text-amber-400/70">Mark as reviewed by SOC operator</div>
                    </div>
                  </button>
                  <button
                    onClick={handleDispatch}
                    className="w-full flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm font-medium text-red-300 hover:bg-red-900/40 transition-all"
                  >
                    <Bell className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold text-white">Dispatch Security Guard</div>
                      <div className="text-[11px] text-red-400/70">Broadcast alert to nearest on-duty guard via Supabase Realtime</div>
                    </div>
                  </button>
                </>
              )}

              <button
                onClick={() => handleResolve('false_alarm')}
                className="w-full flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-all"
              >
                <XCircle className="h-5 w-5 text-slate-500" />
                <div className="text-left">
                  <div className="font-semibold text-white">Mark False Alarm</div>
                  <div className="text-[11px] text-slate-400">Used to improve AI model accuracy</div>
                </div>
              </button>

              {selectedEvent.status !== 'new' && (
                <div className={`rounded-xl border p-4 text-sm font-medium ${
                  selectedEvent.status === 'acknowledged'
                    ? 'border-amber-500/30 bg-amber-950/20 text-amber-300'
                    : selectedEvent.status === 'dispatched'
                    ? 'border-blue-500/30 bg-blue-950/20 text-blue-300'
                    : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                }`}>
                  <span className="capitalize">Status: {selectedEvent.status}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
