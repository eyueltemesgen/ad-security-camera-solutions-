import React, { useState } from 'react';
import { Link, getRouteApi } from '@tanstack/react-router';
import {
  ArrowLeft,
  Cctv,
  Settings,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize,
  CalendarClock,
  Activity,
  Camera as CameraIcon,
} from 'lucide-react';
import { useAppStore } from '../../store';

const route = getRouteApi('/cameras/$cameraId');

export const CameraDetailPage: React.FC = () => {
  const { cameraId } = route.useParams();
  const { cameras, openCameraConfig } = useAppStore();
  const camera = cameras.find(c => c.id === cameraId);

  const [ptzState, setPtzState] = useState({ pan: 0, tilt: 0, zoom: 1.0 });
  const [isRecording, setIsRecording] = useState(false);

  if (!camera) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Cctv className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Camera Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">
            Camera ID <span className="font-mono text-red-400">{cameraId}</span> could not be located in the system registry.
          </p>
          <Link
            to="/cameras"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Camera Grid
          </Link>
        </div>
      </div>
    );
  }

  const handlePtz = (direction: string, amount: number = 5) => {
    setPtzState(prev => {
      switch (direction) {
        case 'pan':
          return { ...prev, pan: Math.max(-180, Math.min(180, prev.pan + amount)) };
        case 'tilt':
          return { ...prev, tilt: Math.max(-90, Math.min(90, prev.tilt + amount)) };
        case 'zoom':
          return { ...prev, zoom: Math.max(1, Math.min(30, prev.zoom + amount / 10)) };
        default:
          return prev;
      }
    });
  };

  const telemetryData = [
    { label: 'Pan Position', value: `${ptzState.pan.toFixed(1)}°`, color: 'text-blue-400' },
    { label: 'Tilt Angle', value: `${ptzState.tilt.toFixed(1)}°`, color: 'text-cyan-400' },
    { label: 'Zoom Level', value: `${ptzState.zoom.toFixed(1)}x`, color: 'text-purple-400' },
    { label: 'Bitrate', value: '4.8 Mbps', color: 'text-amber-400' },
    { label: 'Frame Rate', value: '30 fps', color: 'text-emerald-400' },
    { label: 'AI Inference', value: 'Active', color: 'text-emerald-400' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 space-y-6">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/cameras"
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Grid
          </Link>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              camera.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' :
              camera.status === 'ai_alert' ? 'bg-red-500/20 text-red-400' :
              camera.status === 'motion_detected' ? 'bg-amber-500/20 text-amber-400' :
              'bg-slate-800 text-slate-500'
            }`}>
              <CameraIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">{camera.name}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono">{camera.ip_address}</span>
                <span className="text-slate-700">·</span>
                <span>{camera.location_zone}</span>
                <span className="text-slate-700">·</span>
                <span className={`font-semibold ${
                  camera.status === 'online' ? 'text-emerald-400' :
                  camera.status === 'ai_alert' ? 'text-red-400' :
                  'text-amber-400'
                }`}>
                  {camera.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
              isRecording
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isRecording ? (
              <>
                <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                REC (00:03:42)
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" />
                Start Recording
              </>
            )}
          </button>
          <button
            onClick={() => openCameraConfig(camera.id)}
            className="flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Settings className="h-4 w-4" /> Configure Stream
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main video area */}
        <div className="xl:col-span-3 space-y-4">
          {/* Stream viewport */}
          <div className="relative rounded-xl border border-slate-800 bg-slate-950 aspect-video overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center gap-3">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] opacity-10"></div>
              <div className="relative flex items-center justify-center">
                <div className={`h-24 w-24 rounded-full border-2 flex items-center justify-center ${
                  camera.status === 'online'
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-slate-600 bg-slate-800/50'
                }`}>
                  <Cctv className={`h-12 w-12 ${
                    camera.status === 'online' ? 'text-blue-400' : 'text-slate-500'
                  }`} />
                </div>
              </div>
              <div className="relative text-center">
                <p className="text-xs text-slate-300 font-mono mb-1">
                  HLS/WebRTC Stream: {camera.resolution} @ H.265
                </p>
                <p className="text-[11px] text-slate-600 font-mono">
                  {camera.rtsp_url}
                </p>
              </div>
            </div>

            {/* Stream overlay info */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="rounded-md bg-black/70 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm border border-white/10 font-medium">
                {camera.name}
              </span>
              <span className="rounded-md bg-blue-600/80 px-2.5 py-1 text-[11px] text-white font-medium backdrop-blur-sm">
                {camera.resolution}
              </span>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button className="rounded-md bg-black/60 p-2 text-slate-300 backdrop-blur-sm hover:bg-black/80 transition-colors">
                <Maximize className="h-4 w-4" />
              </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="text-[11px] text-white bg-black/60 rounded px-2 py-1 backdrop-blur-sm font-mono">
                2026-08-26 14:32:{String(Math.floor(Date.now() / 1000) % 60).padStart(2, '0')} EAT
              </span>
              <span className="text-[11px] text-emerald-400 bg-black/60 rounded px-2 py-1 backdrop-blur-sm font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>
          </div>

          {/* Recording Schedule Panel */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Recording Schedule & Retention</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Retention</div>
                <div className="text-lg font-bold text-white mt-1">30 Days</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Storage Used</div>
                <div className="text-lg font-bold text-blue-400 mt-1">142.5 GB</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cloud Sync</div>
                <div className="text-sm font-bold text-emerald-400 mt-2 flex items-center justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Synced
                </div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Uptime</div>
                <div className="text-lg font-bold text-white mt-1">99.8%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: PTZ Controls + Telemetry */}
        <div className="space-y-4">
          {/* PTZ Dynamic Controls */}
          {camera.ptz_supported && (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Settings className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Dynamic PTZ Controls</h3>
              </div>

              {/* Joystick pad */}
              <div className="relative mx-auto w-48 h-48 rounded-full border-2 border-slate-700 bg-slate-950 mb-6 flex items-center justify-center">
                {/* Direction buttons */}
                <button
                  onClick={() => handlePtz('tilt', 10)}
                  className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-800 p-1.5 text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors border border-slate-700"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handlePtz('tilt', -10)}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-800 p-1.5 text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors border border-slate-700"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handlePtz('pan', -10)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-800 p-1.5 text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors border border-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handlePtz('pan', 10)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-800 p-1.5 text-slate-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors border border-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Center indicator */}
                <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
              </div>

              {/* Zoom & Reset */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ZoomOut className="h-4 w-4 text-slate-400" />
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.5"
                    value={ptzState.zoom}
                    onChange={e => setPtzState(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                    className="flex-1 accent-blue-500"
                  />
                  <ZoomIn className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-blue-400 font-mono w-10 text-right">{ptzState.zoom.toFixed(1)}x</span>
                </div>

                <button
                  onClick={() => setPtzState({ pan: 0, tilt: 0, zoom: 1 })}
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-slate-700 bg-slate-800 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Home Position
                </button>
              </div>
            </div>
          )}

          {/* Stream Telemetry */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Stream Telemetry</h3>
            </div>
            <div className="space-y-3">
              {telemetryData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{item.label}</span>
                  <span className={`font-mono font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                <span>Schedule Snapshot Capture</span>
                <span className="text-slate-600">→</span>
              </button>
              <button className="w-full flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                <span>View AI Detection History</span>
                <span className="text-slate-600">→</span>
              </button>
              <button className="w-full flex items-center justify-between rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs font-medium text-red-400 hover:bg-red-950/50 transition-colors">
                <span>Force Disconnect & Restart Stream</span>
                <span className="text-red-600">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
