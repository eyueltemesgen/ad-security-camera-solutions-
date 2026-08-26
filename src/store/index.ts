import { create } from 'zustand';
import type { Camera, CameraEvent, Incident, CameraStatus, EventSeverity, EventSeverity as _ES } from '../types';

// ─── Mock data for live demo ───────────────────────────────────────────────────

const MOCK_CAMERAS: Camera[] = [
  {
    id: 'cam-001',
    name: 'Main Entrance',
    rtsp_url: 'rtsp://192.168.1.101:554/live',
    ip_address: '192.168.1.101',
    location_zone: 'Zone A - Reception',
    status: 'online',
    ptz_supported: true,
    resolution: '4K',
    fov_angle: 120,
    fov_direction: 0,
    map_x: 25,
    map_y: 20,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'cam-002',
    name: 'Parking Garage - Level B1',
    rtsp_url: 'rtsp://192.168.1.102:554/live',
    ip_address: '192.168.1.102',
    location_zone: 'Zone B - Parking',
    status: 'motion_detected',
    ptz_supported: true,
    resolution: '1080p',
    fov_angle: 90,
    fov_direction: 270,
    map_x: 80,
    map_y: 70,
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 'cam-003',
    name: 'Server Room Corridor',
    rtsp_url: 'rtsp://192.168.1.103:554/live',
    ip_address: '192.168.1.103',
    location_zone: 'Zone C - Data Center',
    status: 'ai_alert',
    ptz_supported: false,
    resolution: '4K',
    fov_angle: 95,
    fov_direction: 90,
    map_x: 50,
    map_y: 50,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'cam-004',
    name: 'East Loading Dock',
    rtsp_url: 'rtsp://192.168.1.104:554/live',
    ip_address: '192.168.1.104',
    location_zone: 'Zone B - Parking',
    status: 'offline',
    ptz_supported: false,
    resolution: '1080p',
    fov_angle: 85,
    fov_direction: 45,
    map_x: 90,
    map_y: 30,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'cam-005',
    name: 'Cafeteria Overview',
    rtsp_url: 'rtsp://192.168.1.105:554/live',
    ip_address: '192.168.1.105',
    location_zone: 'Zone A - Reception',
    status: 'online',
    ptz_supported: true,
    resolution: '1080p',
    fov_angle: 110,
    fov_direction: 180,
    map_x: 35,
    map_y: 65,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'cam-006',
    name: 'Perimeter Gate South',
    rtsp_url: 'rtsp://192.168.1.106:554/live',
    ip_address: '192.168.1.106',
    location_zone: 'Zone D - Perimeter',
    status: 'online',
    ptz_supported: true,
    resolution: '4K',
    fov_angle: 130,
    fov_direction: 210,
    map_x: 20,
    map_y: 90,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'cam-007',
    name: 'Executive Suite Floor',
    rtsp_url: 'rtsp://192.168.1.107:554/live',
    ip_address: '192.168.1.107',
    location_zone: 'Zone C - Data Center',
    status: 'online',
    ptz_supported: false,
    resolution: '4K',
    fov_angle: 90,
    fov_direction: 0,
    map_x: 65,
    map_y: 15,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cam-008',
    name: 'Warehouse Exit North',
    rtsp_url: 'rtsp://192.168.1.108:554/live',
    ip_address: '192.168.1.108',
    location_zone: 'Zone D - Perimeter',
    status: 'motion_detected',
    ptz_supported: true,
    resolution: '1080p',
    fov_angle: 100,
    fov_direction: 330,
    map_x: 45,
    map_y: 88,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const MOCK_EVENTS: CameraEvent[] = [
  {
    id: 'evt-001',
    camera_id: 'cam-003',
    event_type: 'intrusion',
    severity: 'critical',
    confidence_score: 94.3,
    snapshot_url: 'https://placehold.co/640x480/1a1a2e/ff3333?text=Intrusion+Detected',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    status: 'new',
    metadata: {
      bounding_boxes: [{ label: 'Person', confidence: 94.3, x: 35, y: 20, w: 30, h: 70 }],
    },
  },
  {
    id: 'evt-002',
    camera_id: 'cam-002',
    event_type: 'person_detection',
    severity: 'warning',
    confidence_score: 87.6,
    snapshot_url: 'https://placehold.co/640x480/1a1a2e/ffa500?text=Person+in+Zone',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    status: 'acknowledged',
    metadata: {
      bounding_boxes: [{ label: 'Person', confidence: 87.6, x: 40, y: 15, w: 25, h: 80 }],
    },
  },
  {
    id: 'evt-003',
    camera_id: 'cam-006',
    event_type: 'license_plate_recognition',
    severity: 'info',
    confidence_score: 91.2,
    snapshot_url: 'https://placehold.co/640x480/1a1a2e/3388ff?text=LPR+Plate',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    status: 'resolved',
    metadata: { license_plate: 'ETH-A123' },
  },
  {
    id: 'evt-004',
    camera_id: 'cam-005',
    event_type: 'object_left_behind',
    severity: 'warning',
    confidence_score: 78.9,
    snapshot_url: 'https://placehold.co/640x480/1a1a2e/ffa500?text=Left+Behind+Object',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    status: 'new',
    metadata: { object_type: 'Backpack' },
  },
  {
    id: 'evt-005',
    camera_id: 'cam-003',
    event_type: 'thermal_alert',
    severity: 'warning',
    confidence_score: 99.1,
    snapshot_url: 'https://placehold.co/640x480/1a1a2e/ff6633?text=Thermal+Hotspot',
    timestamp: new Date(Date.now() - 45000).toISOString(),
    status: 'new',
    metadata: { thermal_temp_c: 82.4 },
  },
  {
    id: 'evt-006',
    camera_id: 'cam-008',
    event_type: 'person_detection',
    severity: 'info',
    confidence_score: 92.0,
    snapshot_url: 'https://placehold.co/640x480/1a1a2e/3388ff?text=Person+Exit',
    timestamp: new Date(Date.now() - 540000).toISOString(),
    status: 'false_alarm',
    metadata: {
      bounding_boxes: [{ label: 'Person', confidence: 92.0, x: 30, y: 10, w: 40, h: 85 }],
    },
  },
];

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    event_id: 'evt-001',
    assigned_guard_id: 'guard-kebra',
    assigned_guard_name: 'Kebra Mekonen',
    status: 'dispatched',
    escalation_level: 3,
    notes: 'Guard dispatched from Zone C checkpoint. ETA: 45 seconds.',
    dispatched_at: new Date(Date.now() - 90000).toISOString(),
    created_at: new Date(Date.now() - 120000).toISOString(),
    updated_at: new Date(Date.now() - 90000).toISOString(),
    timer_seconds_remaining: 195,
  },
  {
    id: 'inc-002',
    event_id: 'evt-004',
    assigned_guard_id: null,
    assigned_guard_name: null,
    status: 'open',
    escalation_level: 1,
    notes: '',
    dispatched_at: null,
    created_at: new Date(Date.now() - 880000).toISOString(),
    updated_at: new Date(Date.now() - 880000).toISOString(),
    timer_seconds_remaining: 7200,
  },
  {
    id: 'inc-003',
    event_id: 'evt-005',
    assigned_guard_id: 'guard-abebe',
    assigned_guard_name: 'Abebe Tadesse',
    status: 'acknowledged',
    escalation_level: 2,
    notes: 'Operator assigned. Checking server room HVAC system.',
    dispatched_at: null,
    created_at: new Date(Date.now() - 44000).toISOString(),
    updated_at: new Date(Date.now() - 30000).toISOString(),
    timer_seconds_remaining: 3600,
  },
];

const MOCK_STORAGE = [
  { id: 'sr-001', camera_id: 'cam-001', storage_used_gb: 142.5, edge_storage_gb: 85.3, retention_days: 30, cloud_sync_status: 'synced' as const, uptime_pct: 99.8 },
  { id: 'sr-002', camera_id: 'cam-002', storage_used_gb: 218.9, edge_storage_gb: 218.9, retention_days: 45, cloud_sync_status: 'syncing' as const, uptime_pct: 98.2 },
  { id: 'sr-003', camera_id: 'cam-003', storage_used_gb: 387.1, edge_storage_gb: 120.0, retention_days: 60, cloud_sync_status: 'synced' as const, uptime_pct: 100.0 },
  { id: 'sr-004', camera_id: 'cam-004', storage_used_gb: 0.0, edge_storage_gb: 64.0, retention_days: 7, cloud_sync_status: 'offline' as const, uptime_pct: 89.1 },
  { id: 'sr-005', camera_id: 'cam-005', storage_used_gb: 98.4, edge_storage_gb: 42.1, retention_days: 14, cloud_sync_status: 'synced' as const, uptime_pct: 99.5 },
  { id: 'sr-006', camera_id: 'cam-006', storage_used_gb: 256.8, edge_storage_gb: 256.8, retention_days: 30, cloud_sync_status: 'synced' as const, uptime_pct: 99.9 },
  { id: 'sr-007', camera_id: 'cam-007', storage_used_gb: 412.3, edge_storage_gb: 150.2, retention_days: 90, cloud_sync_status: 'synced' as const, uptime_pct: 100.0 },
  { id: 'sr-008', camera_id: 'cam-008', storage_used_gb: 75.2, edge_storage_gb: 75.2, retention_days: 14, cloud_sync_status: 'syncing' as const, uptime_pct: 97.6 },
];

// ─── Store ─────────────────────────────────────────────────────────────────────

interface AppStore {
  // Camera data
  cameras: Camera[];
  selectedCameraId: string | null;
  cameraStatusFilter: CameraStatus | 'all';
  cameraZoneFilter: string;

  // Event data
  events: CameraEvent[];
  eventSeverityFilter: EventSeverity | 'all';
  eventTypeFilter: string;
  selectedEventId: string | null;
  eventDrawerOpen: boolean;

  // Incident data
  incidents: Incident[];

  // Map state
  mapMode: 'satellite' | 'floorplan';
  showFOV: boolean;
  showAlertPings: boolean;

  // Analytics / Storage
  storageData: { id: string; camera_id: string; camera_name: string; storage_used_gb: number; edge_storage_gb: number; retention_days: number; cloud_sync_status: string; uptime_pct: number }[];

  // Notification feed
  broadcastFeed: { id: string; title: string; message: string; priority: string; time: string }[];

  // Camera config modal
  cameraConfigOpen: boolean;
  cameraConfigTargetId: string | null;

  // Actions
  setSelectedCamera: (id: string | null) => void;
  setCameraStatusFilter: (status: CameraStatus | 'all') => void;
  setCameraZoneFilter: (zone: string) => void;
  setEventSeverityFilter: (severity: EventSeverity | 'all') => void;
  setEventTypeFilter: (eventType: string) => void;
  selectEvent: (id: string | null) => void;
  setEventDrawerOpen: (open: boolean) => void;
  acknowledgeEvent: (eventId: string) => void;
  resolveEvent: (eventId: string, resolution: 'resolved' | 'false_alarm') => void;
  dispatchGuard: (eventId: string, guardId: string) => void;
  setMapMode: (mode: 'satellite' | 'floorplan') => void;
  toggleFOV: () => void;
  toggleAlertPings: () => void;
  openCameraConfig: (cameraId: string | null) => void;
  closeCameraConfig: () => void;
  addBroadcast: (broadcast: { title: string; message: string; priority: string }) => void;
}

const zones = [...new Set(MOCK_CAMERAS.map(c => c.location_zone))];
const guardNames = ['Kebra Mekonen', 'Abebe Tadesse', 'Lidya Belachew', 'Mulugeta Demeke'];

const INITIAL_STORAGE = MOCK_STORAGE.map(s => {
  const cam = MOCK_CAMERAS.find(c => c.id === s.camera_id)!;
  return { ...s, camera_name: cam.name };
});

export const useAppStore = create<AppStore>((set, get) => ({
  cameras: MOCK_CAMERAS,
  selectedCameraId: null,
  cameraStatusFilter: 'all',
  cameraZoneFilter: zones[0],

  events: MOCK_EVENTS.map(e => {
    const cam = MOCK_CAMERAS.find(c => c.id === e.camera_id);
    return { ...e, camera_name: cam?.name, location_zone: cam?.location_zone };
  }),
  eventSeverityFilter: 'all',
  eventTypeFilter: '',
  selectedEventId: null,
  eventDrawerOpen: false,

  incidents: MOCK_INCIDENTS.map(inc => {
    const evt = MOCK_EVENTS.find(e => e.id === inc.event_id);
    const cam = evt ? MOCK_CAMERAS.find(c => c.id === evt.camera_id) : undefined;
    return {
      ...inc,
      event: evt ? { ...evt, camera_name: cam?.name } : undefined,
      assigned_guard_name: inc.assigned_guard_id
        ? guardNames[parseInt(inc.assigned_guard_id.split('-')[1]) || 0]
        : null,
    };
  }),

  mapMode: 'satellite',
  showFOV: true,
  showAlertPings: true,

  storageData: INITIAL_STORAGE,

  broadcastFeed: [
    { id: 'bc-001', title: 'Zone C Thermal Alert', message: 'HVAC system needs inspection at server room', priority: 'critical', time: '45s ago' },
    { id: 'bc-002', title: 'Parking Motion Alert', message: 'Vehicle detected in Zone B parking level B1', priority: 'warning', time: '5m ago' },
  ],

  cameraConfigOpen: false,
  cameraConfigTargetId: null,

  setSelectedCamera: id => set({ selectedCameraId: id }),
  setCameraStatusFilter: status => set({ cameraStatusFilter: status }),
  setCameraZoneFilter: zone => set({ cameraZoneFilter: zone }),
  setEventSeverityFilter: severity => set({ eventSeverityFilter: severity }),
  setEventTypeFilter: eventType => set({ eventTypeFilter: eventType }),
  selectEvent: id => set({ selectedEventId: id, eventDrawerOpen: id !== null }),
  setEventDrawerOpen: open => set({ eventDrawerOpen: open }),

  acknowledgeEvent: eventId =>
    set(state => ({
      events: state.events.map(e => (e.id === eventId ? { ...e, status: 'acknowledged' } : e)),
    })),

  resolveEvent: (eventId, resolution) =>
    set(state => ({
      events: state.events.map(e => (e.id === eventId ? { ...e, status: resolution } : e)),
      eventDrawerOpen: false,
    })),

  dispatchGuard: (eventId, _guardId) =>
    set(state => ({
      events: state.events.map(e => (e.id === eventId ? { ...e, status: 'dispatched' } : e)),
      incidents: [
        ...state.incidents,
        {
          id: `inc-${Date.now()}`,
          event_id: eventId,
          assigned_guard_id: _guardId,
          assigned_guard_name: guardNames[Math.floor(Math.random() * guardNames.length)],
          status: 'dispatched' as const,
          escalation_level: 2,
          notes: 'Guard dispatched via SOC dashboard.',
          dispatched_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          timer_seconds_remaining: 180,
          event: state.events.find(e => e.id === eventId),
        },
      ],
      eventDrawerOpen: false,
    })),

  setMapMode: mode => set({ mapMode: mode }),
  toggleFOV: () => set(state => ({ showFOV: !state.showFOV })),
  toggleAlertPings: () => set(state => ({ showAlertPings: !state.showAlertPings })),

  openCameraConfig: id => set({ cameraConfigOpen: true, cameraConfigTargetId: id }),
  closeCameraConfig: () => set({ cameraConfigOpen: false, cameraConfigTargetId: null }),

  addBroadcast: broadcast =>
    set(state => ({
      broadcastFeed: [
        {
          id: `bc-${Date.now()}`,
          ...broadcast,
          time: 'Just now',
        },
        ...state.broadcastFeed,
      ],
    })),
}));
