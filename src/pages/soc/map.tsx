import React, { useState } from 'react';
import { MapPin, Satellite, Eye, AlertTriangle, EyeOff, Target } from 'lucide-react';
import { useAppStore } from '../../store';
import type { Camera, CameraStatus } from '../../types';

const STATUS_DOT: Record<CameraStatus, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-red-500',
  motion_detected: 'bg-amber-500',
  ai_alert: 'bg-red-500 animate-pulse',
};

const STATUS_RING: Record<CameraStatus, string> = {
  online: 'ring-emerald-500/50',
  offline: 'ring-red-500/30',
  motion_detected: 'ring-amber-500/50',
  ai_alert: 'ring-red-500/60 animate-pulse',
};

export const SocMapPage: React.FC = () => {
  const { cameras, mapMode, showFOV, showAlertPings, setMapMode, toggleFOV, toggleAlertPings,} = useAppStore();
  const [hoveredCam, setHoveredCam] = useState<string | null>(null);
  const [previewCamId, setPreviewCamId] = useState<string | null>(null);

  const previewCam = cameras.find(c => c.id === previewCamId);

  return (
    <div className="flex-1 overflow-y-hidden bg-slate-950 p-4 sm:p-6 flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
            <MapPin className="h-4 w-4 text-blue-400" />
            Security Operations Center
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Facility Operations Map</h1>
          <p className="text-slate-400 text-sm mt-1">Satellite/floorplan overlay with camera FOV cones and real-time alert ping badges</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapMode('floorplan')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all border ${
              mapMode === 'floorplan'
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Target className="h-3.5 w-3.5" /> Floorplan
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all border ${
              mapMode === 'satellite'
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Satellite className="h-3.5 w-3.5" /> Satellite
          </button>
          <div className="w-px h-6 bg-slate-800"></div>
          <button
            onClick={toggleFOV}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all border ${
              showFOV
                ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {showFOV ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />} FOV Cones
          </button>
          <button
            onClick={toggleAlertPings}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all border ${
              showAlertPings
                ? 'bg-red-600/20 text-red-400 border-red-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Alert Pings
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden relative shadow-2xl shadow-black/40">
        {/* Map background */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          mapMode === 'satellite'
            ? 'bg-[#0a1628]'
            : 'bg-slate-950'
        }`}>
          {/* Simulated floorplan/satellite grid */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Zone outlines - simulated */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Zone A - Reception */}
            <rect x="5" y="5" width="40" height="40" rx="2"
              fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.3" strokeDasharray="2" />
            <text x="10" y="10" className="fill-blue-500/50 text-[2px] font-medium" style={{ fontSize: '2.2px', fontFamily: 'system-ui' }}>
              ZONE A — RECEPTION
            </text>

            {/* Zone B - Parking */}
            <rect x="60" y="30" width="35" height="50" rx="2"
              fill="none" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="0.3" strokeDasharray="2" />
            <text x="65" y="35" className="fill-amber-500/50 text-[2px] font-medium" style={{ fontSize: '2.2px', fontFamily: 'system-ui' }}>
              ZONE B — PARKING
            </text>

            {/* Zone C - Data Center */}
            <rect x="30" y="35" width="30" height="30" rx="2"
              fill="none" stroke="rgba(168, 85, 247, 0.2)" strokeWidth="0.3" strokeDasharray="2" />
            <text x="35" y="40" className="fill-purple-500/50 text-[2px] font-medium" style={{ fontSize: '2.2px', fontFamily: 'system-ui' }}>
              ZONE C — DATA CENTER
            </text>

            {/* Zone D - Perimeter */}
            <path d="M5,70 L5,95 L95,95 L95,80 L60,80 L60,70 Z" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="0.3" strokeDasharray="2" />
            <text x="10" y="75" className="fill-emerald-500/50 text-[2px] font-medium" style={{ fontSize: '2.2px', fontFamily: 'system-ui' }}>
              ZONE D — PERIMETER
            </text>
          </svg>

          {/* Camera markers */}
          {cameras.map(cam => {
            const x = cam.map_x ?? 50;
            const y = cam.map_y ?? 50;

            return (
              <React.Fragment key={cam.id}>
                {/* FOV cone */}
                {showFOV && cam.status !== 'offline' && (
                  <svg
                    className="absolute pointer-events-none transition-opacity duration-300"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: '120px',
                      height: '120px',
                      transform: 'translate(-50%, -50%)',
                      opacity: hoveredCam === cam.id ? 0.6 : 0.3,
                    }}
                    viewBox="0 0 100 100"
                  >
                    <defs>
                      <linearGradient id={`fov-${cam.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={cam.status === 'ai_alert' ? '#ef4444' : cam.status === 'motion_detected' ? '#f59e0b' : '#3b82f6'} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={cam.status === 'ai_alert' ? '#ef4444' : cam.status === 'motion_detected' ? '#f59e0b' : '#3b82f6'} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M50,50 L10,${10} L90,${10} Z`}
                      fill={`url(#fov-${cam.id})`}
                      stroke={cam.status === 'ai_alert' ? '#ef4444' : cam.status === 'motion_detected' ? '#f59e0b' : '#3b82f6'}
                      strokeWidth="0.5"
                      style={{
                        transform: `rotate(${(cam.fov_direction ?? 0) - 90}deg)`,
                        transformOrigin: '50px 50px',
                      }}
                    />
                  </svg>
                )}

                {/* Alert ping ring */}
                {showAlertPings && (cam.status === 'ai_alert' || cam.status === 'motion_detected') && (
                  <div
                    className="absolute rounded-full animate-pulse-ring"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: '24px',
                      height: '24px',
                      transform: 'translate(-50%, -50%)',
                      border: `2px solid ${cam.status === 'ai_alert' ? '#ef4444' : '#f59e0b'}`,
                    }}
                  />
                )}

                {/* Camera marker */}
                <button
                  onClick={() => setPreviewCamId(cam.id)}
                  onMouseEnter={() => setHoveredCam(cam.id)}
                  onMouseLeave={() => setHoveredCam(null)}
                  className="absolute z-10"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 bg-slate-900 transition-all duration-200 hover:scale-125 ${
                    cam.status === 'ai_alert'
                      ? 'border-red-500 shadow-lg shadow-red-500/50 ring-2 ring-red-500/30'
                      : cam.status === 'motion_detected'
                      ? 'border-amber-500 shadow-lg shadow-amber-500/40'
                      : 'border-blue-500/50 hover:border-blue-400'
                  }`}>
                    <MapPin className={`h-3.5 w-3.5 ${
                      cam.status === 'ai_alert'
                        ? 'text-red-400'
                        : cam.status === 'offline'
                        ? 'text-slate-500'
                        : 'text-blue-400'
                    }`} />
                    <span className={`absolute -bottom-2 -right-2 h-3 w-3 rounded-full border-2 border-slate-900 ${STATUS_DOT[cam.status]}`} />
                  </div>

                  {/* Label tooltip on hover */}
                  {hoveredCam === cam.id && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-[11px] shadow-xl z-20 pointer-events-none">
                      <div className="font-semibold text-white">{cam.name}</div>
                      <div className="text-slate-400 font-mono mt-0.5">{cam.ip_address}</div>
                      <div className={`font-medium mt-0.5 ${
                        cam.status === 'online'
                          ? 'text-emerald-400'
                          : cam.status === 'ai_alert'
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}>
                        {cam.status.toUpperCase()}
                      </div>
                    </div>
                  )}
                </button>
              </React.Fragment>
            );
          })}

          {/* Compass */}
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full border border-slate-700 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-[10px] font-semibold">
              <div className="text-red-400">N</div>
              <div className="text-slate-600 mt-0.5">S</div>
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-1">
                <span className="text-slate-600">W</span>
                <span className="text-slate-600">E</span>
              </div>
            </div>
          </div>

          {/* Scale bar */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur-sm rounded px-2 py-1 border border-slate-800">
            <div className="w-16 h-px bg-slate-500"></div>
            <span>50m</span>
          </div>
        </div>
      </div>

      {/* Camera preview modal on click */}
      {previewCam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setPreviewCamId(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
          >
            <div className="relative aspect-video bg-slate-950">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <MapPin className="h-12 w-12 text-blue-500/30" />
                <div className="absolute text-center">
                  <div className="text-sm font-semibold text-white">{previewCam.name}</div>
                  <div className="text-xs text-slate-400 mt-1">HLS/WebRTC Stream Preview</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{previewCam.rtsp_url}</div>
                </div>
              </div>

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] text-white backdrop-blur-sm font-medium">
                  {previewCam.resolution}
                </span>
                <span className={`rounded-md px-2 py-1 text-[11px] font-semibold backdrop-blur-sm ${
                  previewCam.status === 'online'
                    ? 'bg-emerald-500/30 text-emerald-400'
                    : previewCam.status === 'ai_alert'
                    ? 'bg-red-500/30 text-red-400'
                    : 'bg-amber-500/30 text-amber-400'
                }`}>
                  {previewCam.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{previewCam.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">{previewCam.ip_address} · {previewCam.location_zone}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500">
                    View Full Stream
                  </button>
                  <button
                    onClick={() => setPreviewCamId(null)}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-2 pb-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Online
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Motion Detected
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span> AI Alert
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500"></span> Offline
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5 text-blue-400" /> Field of View Cone
        </div>
      </div>
    </div>
  );
};
