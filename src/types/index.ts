export type UserRole = 'admin' | 'operator' | 'client_viewer';

export type CameraStatus = 'online' | 'offline' | 'motion_detected' | 'ai_alert';

export type EventSeverity = 'critical' | 'warning' | 'info';

export type EventType =
  | 'person_detection'
  | 'intrusion'
  | 'license_plate_recognition'
  | 'thermal_alert'
  | 'object_left_behind';

export type IncidentStatus = 'open' | 'acknowledged' | 'dispatched' | 'resolved' | 'false_alarm';

export interface Camera {
  id: string;
  name: string;
  rtsp_url: string;
  ip_address: string;
  location_zone: string;
  status: CameraStatus;
  ptz_supported: boolean;
  resolution: '1080p' | '4K';
  fov_angle?: number; // degrees
  fov_direction?: number; // heading 0-360
  map_x?: number; // percentage coordinates 0-100 on floorplan
  map_y?: number;
  created_at: string;
  updated_at?: string;
}

export interface BoundingBox {
  label: string;
  confidence: number;
  x: number; // percentage
  y: number;
  w: number;
  h: number;
}

export interface CameraEvent {
  id: string;
  camera_id: string;
  camera_name?: string;
  location_zone?: string;
  event_type: EventType;
  severity: EventSeverity;
  confidence_score: number;
  snapshot_url: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'dispatched' | 'resolved' | 'false_alarm';
  metadata?: {
    bounding_boxes?: BoundingBox[];
    license_plate?: string;
    thermal_temp_c?: number;
    object_type?: string;
  };
}

export interface Incident {
  id: string;
  event_id: string;
  event?: CameraEvent;
  assigned_guard_id: string | null;
  assigned_guard_name?: string | null;
  status: IncidentStatus;
  escalation_level: number; // 1 to 5
  notes: string;
  dispatched_at: string | null;
  created_at: string;
  updated_at: string;
  timer_seconds_remaining?: number;
}

export interface StorageRetention {
  id: string;
  camera_id: string;
  camera_name?: string;
  storage_used_gb: number;
  edge_storage_gb: number;
  retention_days: number;
  cloud_sync_status: 'synced' | 'syncing' | 'failed' | 'offline';
  uptime_pct?: number;
  updated_at?: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  priority: 'info' | 'warning' | 'critical';
  sender_id: string;
  target_zone?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  incident_id?: string;
  actor_id: string;
  action: string;
  details?: Record<string, unknown>;
  created_at: string;
}
