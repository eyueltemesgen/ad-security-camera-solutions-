import React, { useState } from 'react';
import { X, Save, Server } from 'lucide-react';
import { useAppStore } from '../../store';

export const CameraConfigModal: React.FC = () => {
  const { cameraConfigOpen, cameraConfigTargetId, cameras, closeCameraConfig } = useAppStore();

  const targetCamera = cameras.find(c => c.id === cameraConfigTargetId);

  const [formData, setFormData] = useState({
    name: targetCamera?.name || '',
    rtsp_url: targetCamera?.rtsp_url || 'rtsp://192.168.1.120:554/stream1',
    ip_address: targetCamera?.ip_address || '192.168.1.120',
    location_zone: targetCamera?.location_zone || 'Zone A - Reception',
    resolution: targetCamera?.resolution || '4K',
    ptz_supported: targetCamera?.ptz_supported ?? true,
    fov_angle: targetCamera?.fov_angle || 90,
  });

  if (!cameraConfigOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Configuration saved for ${formData.name || 'New Camera'}`);
    closeCameraConfig();
  };

  const zones = ['Zone A - Reception', 'Zone B - Parking', 'Zone C - Data Center', 'Zone D - Perimeter'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {targetCamera ? `Configure Camera: ${targetCamera.name}` : 'Register New AI Stream'}
              </h3>
              <p className="text-xs text-slate-400">RTSP/ONVIF network protocol & zone assignment</p>
            </div>
          </div>
          <button
            onClick={closeCameraConfig}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Camera Stream Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. North Gate PTZ-01"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">IP Address / ONVIF Host</label>
              <input
                type="text"
                required
                value={formData.ip_address}
                onChange={e => setFormData({ ...formData, ip_address: e.target.value })}
                placeholder="192.168.1.xxx"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono text-xs placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Site Location / Zone</label>
              <select
                value={formData.location_zone}
                onChange={e => setFormData({ ...formData, location_zone: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                {zones.map(z => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">RTSP Stream URI</label>
            <input
              type="text"
              required
              value={formData.rtsp_url}
              onChange={e => setFormData({ ...formData, rtsp_url: e.target.value })}
              placeholder="rtsp://user:pass@192.168.1.100:554/stream"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono text-xs placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Stream Resolution</label>
              <select
                value={formData.resolution}
                onChange={e => setFormData({ ...formData, resolution: e.target.value as '1080p' | '4K' })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="1080p">1080p (Full HD 60fps)</option>
                <option value="4K">4K UHD (3840x2160 AI Optimized)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">FOV Angle (Degrees)</label>
              <input
                type="number"
                min="30"
                max="180"
                value={formData.fov_angle}
                onChange={e => setFormData({ ...formData, fov_angle: parseInt(e.target.value) || 90 })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="ptz_check"
              checked={formData.ptz_supported}
              onChange={e => setFormData({ ...formData, ptz_supported: e.target.checked })}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="ptz_check" className="text-xs text-slate-300 font-medium">
              Enable Dynamic PTZ Motor Controls (Pan, Tilt, Zoom)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeCameraConfig}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
