import React from 'react';
import { HardDrive, Cloud, Activity, ShieldCheck, Flame, PieChart, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../store';

export const AnalyticsPage: React.FC = () => {
  const { storageData, cameras } = useAppStore();

  const totalCloudStorageGB = storageData.reduce((acc, s) => acc + s.storage_used_gb, 0);
  const totalEdgeStorageGB = storageData.reduce((acc, s) => acc + s.edge_storage_gb, 0);
  const avgUptime = (storageData.reduce((acc, s) => acc + s.uptime_pct, 0) / storageData.length).toFixed(1);

  // Mock detection heatmap by hour
  const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
  const zones = ['Zone A (Reception)', 'Zone B (Parking)', 'Zone C (Data Center)', 'Zone D (Perimeter)'];

  const heatmapMatrix = [
    [2, 1, 0, 12, 18, 14, 22, 5],
    [1, 0, 2, 8, 11, 9, 28, 14],
    [0, 0, 0, 1, 3, 2, 1, 0],
    [3, 2, 4, 1, 2, 0, 9, 11],
  ];

  const zoneBreakdown = [
    { zone: 'Zone B - Parking Garage', alerts: 142, pct: 45, color: 'bg-amber-500' },
    { zone: 'Zone A - Reception & Lobby', alerts: 88, pct: 28, color: 'bg-blue-500' },
    { zone: 'Zone D - Perimeter Fence', alerts: 54, pct: 17, color: 'bg-emerald-500' },
    { zone: 'Zone C - Server Data Center', alerts: 31, pct: 10, color: 'bg-purple-500' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
            <Activity className="h-4 w-4 text-purple-400" />
            System Health & Storage Operations
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">System Health & Storage Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Edge NVR recording vs. Cloud backup retention, total storage telemetry, and AI detection heatmap.
          </p>
        </div>
      </div>

      {/* Storage KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Cloud Storage Consumed</span>
            <Cloud className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {(totalCloudStorageGB / 1024).toFixed(2)} <span className="text-sm font-normal text-slate-400">TB</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> AWS S3 / MinIO Replicated
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Edge NVR Storage</span>
            <HardDrive className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {(totalEdgeStorageGB / 1024).toFixed(2)} <span className="text-sm font-normal text-slate-400">TB</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Local SSD circular buffer</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">System Fleet Uptime</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{avgUptime}%</div>
          <div className="mt-2 text-[11px] text-slate-400">Past 30-day average</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Storage Retention Policy</span>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">30-90 Days</div>
          <div className="mt-2 text-[11px] text-slate-400">Auto-purge compliant</div>
        </div>
      </div>

      {/* Heatmap & Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" />
              Daily AI Detection Heatmap (24h Window)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Intensity of security triggers grouped by facility zone and time of day.
            </p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left">
              <thead>
                <tr>
                  <th className="pb-3 text-slate-500 font-medium text-[11px]">Zone</th>
                  {hours.map(h => (
                    <th key={h} className="pb-3 text-center text-slate-500 font-medium text-[11px] px-1">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="space-y-1">
                {zones.map((zoneName, zIdx) => (
                  <tr key={zoneName}>
                    <td className="py-2 text-slate-300 font-medium text-[11px] pr-3 whitespace-nowrap">{zoneName}</td>
                    {heatmapMatrix[zIdx].map((val, hIdx) => {
                      const intensity =
                        val === 0
                          ? 'bg-slate-950 text-slate-700'
                          : val < 5
                          ? 'bg-blue-950/60 text-blue-300'
                          : val < 15
                          ? 'bg-amber-950/70 text-amber-300'
                          : 'bg-red-900/80 text-red-100 font-bold';

                      return (
                        <td key={hIdx} className="p-1 text-center">
                          <div
                            className={`h-7 w-full rounded flex items-center justify-center font-mono text-[10px] ${intensity}`}
                            title={`${val} events at ${hours[hIdx]}`}
                          >
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Triggered Zones Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-400" />
              Top Triggered Zones Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Most frequent detection hot spots.</p>
          </div>

          <div className="space-y-4 pt-2">
            {zoneBreakdown.map(item => (
              <div key={item.zone} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{item.zone}</span>
                  <span className="text-slate-400 font-mono">{item.alerts} alerts ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Storage Retention Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-cyan-400" />
            Camera Storage Allocation & Retention Roster
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/50 uppercase tracking-wider text-[10px] text-slate-400">
              <tr>
                <th className="px-4 py-3">Camera Node</th>
                <th className="px-4 py-3">Cloud Storage</th>
                <th className="px-4 py-3">Edge Storage</th>
                <th className="px-4 py-3">Retention Policy</th>
                <th className="px-4 py-3">Cloud Sync Status</th>
                <th className="px-4 py-3">Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {storageData.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-sans font-medium text-white">{item.camera_name}</td>
                  <td className="px-4 py-3 text-blue-400">{item.storage_used_gb.toFixed(1)} GB</td>
                  <td className="px-4 py-3 text-cyan-400">{item.edge_storage_gb.toFixed(1)} GB</td>
                  <td className="px-4 py-3 text-slate-300">{item.retention_days} Days</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-sans font-semibold uppercase ${
                      item.cloud_sync_status === 'synced'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.cloud_sync_status === 'syncing'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {item.cloud_sync_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-emerald-400">{item.uptime_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
