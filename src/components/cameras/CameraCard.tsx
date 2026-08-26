import React from 'react';
import { Link } from '@tanstack/react-router';
import { Cctv, Settings, WifiOff, MonitorDot, Eye, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../../store';
import type { Camera, CameraStatus } from '../../types';

const STATUS_CONFIG: Record<CameraStatus, { bg: string; text: string; label: string; icon: React.FC<{ className?: string }> }> = {
  online: {
    bg: 'bg-emerald-500/15 border-emerald-500/40',
    text: 'text-emerald-400',
    label: 'Online',
    icon: MonitorDot,
  },
  offline: {
    bg: 'bg-red-500/15 border-red-500/40',
    text: 'text-red-400',
    label: 'Offline',
    icon: WifiOff,
  },
  motion_detected: {
    bg: 'bg-amber-500/15 border-amber-500/40',
    text: 'text-amber-400',
    label: 'Motion Detected',
    icon: Eye,
  },
  ai_alert: {
    bg: 'bg-red-500/20 border-red-500/50',
    text: 'text-red-300',
    label: 'AI Alert',
    icon: ShieldAlert,
  },
};

interface CameraCardProps {
  camera: Camera;
}

export const CameraCard: React.FC<CameraCardProps> = ({ camera }) => {
  const { openCameraConfig } = useAppStore();
  const cfg = STATUS_CONFIG[camera.status];
  const StatusIcon = cfg.icon;

  return (
    <div
      className={`group relative rounded-xl border bg-slate-900 overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 ${
        camera.status === 'ai_alert'
          ? 'border-red-500/50 ring-1 ring-red-500/20'
          : camera.status === 'motion_detected'
          ? 'border-amber-500/50 ring-1 ring-amber-500/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Simulated live preview */}
      <Link to="/cameras/$cameraId" params={{ cameraId: camera.id }} className="block aspect-video bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="relative w-full h-full overflow-hidden">
            {/* Noise pattern to simulate live feed */}
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Cctv className="h-10 w-10 text-slate-600" />
              <span className="text-xs font-mono">{camera.resolution} H.265 Stream</span>
              <span className="text-[10px] text-slate-600">{camera.rtsp_url}</span>
            </div>

            {/* Status overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {cfg.label}
              </div>
              {camera.ptz_supported && (
                <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 text-[11px] text-slate-300 font-medium">
                  PTZ
                </span>
              )}
            </div>

            {/* Zone tag */}
            <div className="absolute bottom-3 left-3">
              <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] text-slate-200 backdrop-blur-sm font-medium border border-white/10">
                {camera.location_zone}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Card info footer */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm leading-tight">{camera.name}</h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{camera.ip_address}</p>
          </div>
          <button
            onClick={() => openCameraConfig(camera.id)}
            className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Camera configuration"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
          <span>Created: {new Date(camera.created_at).toLocaleDateString()}</span>
          {camera.resolution === '4K' ? (
            <span className="flex items-center gap-1 text-blue-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span> 4K UHD
            </span>
          ) : (
            <span>1080p</span>
          )}
        </div>
      </div>
    </div>
  );
};
