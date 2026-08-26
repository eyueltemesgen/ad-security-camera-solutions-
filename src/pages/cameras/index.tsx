import React from 'react';
import { Cctv, Filter, PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '../../store';
import { CameraCard } from '../../components/cameras/CameraCard';
import { CameraConfigModal } from '../../components/cameras/CameraConfigModal';
import type { CameraStatus } from '../../types';

export const CamerasPage: React.FC = () => {
  const {
    cameras,
    cameraStatusFilter,
    cameraZoneFilter,
    setCameraStatusFilter,
    setCameraZoneFilter,
    openCameraConfig,
  } = useAppStore();

  const zones = [...new Set(cameras.map(c => c.location_zone))];

  const filteredCameras = cameras.filter(cam => {
    const statusMatch = cameraStatusFilter === 'all' || cam.status === cameraStatusFilter;
    const zoneMatch = cameraZoneFilter === 'All Zones' || cam.location_zone === cameraZoneFilter;
    return statusMatch && zoneMatch;
  });

  const stats = {
    total: cameras.length,
    online: cameras.filter(c => c.status === 'online').length,
    offline: cameras.filter(c => c.status === 'offline').length,
    motion: cameras.filter(c => c.status === 'motion_detected').length,
    aiAlert: cameras.filter(c => c.status === 'ai_alert').length,
  };

  const statusTabs: { id: CameraStatus | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All Cameras', count: stats.total },
    { id: 'online', label: 'Online', count: stats.online },
    { id: 'offline', label: 'Offline', count: stats.offline },
    { id: 'motion_detected', label: 'Motion', count: stats.motion },
    { id: 'ai_alert', label: 'AI Alerts', count: stats.aiAlert },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
            <Cctv className="h-4 w-4" />
            Operations Center
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Live Camera Grid</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time AI video surveillance monitoring. {stats.online} streams online, {stats.offline} offline.
          </p>
        </div>
        <button
          onClick={() => openCameraConfig(null)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all hover:shadow-lg"
        >
          <PlusCircle className="h-4 w-4" />
          Register Camera Stream
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs text-slate-400 font-medium">Total Deployed</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4">
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <Wifi className="h-3 w-3" /> Streams Online
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.online}</div>
        </div>
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4">
          <div className="text-xs text-red-400 font-medium flex items-center gap-1">
            <WifiOff className="h-3 w-3" /> Offline Cameras
          </div>
          <div className="text-2xl font-bold text-red-400 mt-1">{stats.offline}</div>
        </div>
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-4">
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <Cctv className="h-3 w-3" /> Motion Activity
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{stats.motion}</div>
        </div>
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 col-span-2 sm:col-span-1">
          <div className="text-xs text-red-400 font-medium flex items-center gap-1">
            <Cctv className="h-3 w-3" /> Active AI Alerts
          </div>
          <div className="text-2xl font-bold text-red-400 mt-1">{stats.aiAlert}</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900 p-1.5 flex flex-wrap gap-1">
          {statusTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCameraStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                cameraStatusFilter === tab.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
              <span className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                cameraStatusFilter === tab.id ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={cameraZoneFilter}
            onChange={e => setCameraZoneFilter(e.target.value)}
            className="bg-transparent text-sm text-white border-none outline-none focus:ring-0"
          >
            <option value="All Zones">All Zones</option>
            {zones.map(z => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredCameras.length > 0 ? (
          filteredCameras.map(cam => <CameraCard key={cam.id} camera={cam} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
            <Cctv className="h-12 w-12 mb-3 text-slate-700" />
            <p className="text-sm">No cameras match the selected filters.</p>
            <button
              onClick={() => {
                setCameraStatusFilter('all');
                setCameraZoneFilter('All Zones');
              }}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <CameraConfigModal />
    </div>
  );
};
