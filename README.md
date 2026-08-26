# AD Security Camera Solutions - Enterprise AI Surveillance & SOC Platform

An enterprise-grade AI video surveillance and camera management platform built as a Security Operations Center (SOC) dashboard. Transforms traditional marketplace/delivery application into a high-performance security monitoring system.

## Features

### 🎥 Camera Management (`/cameras`)
- Live Camera Grid with stream status indicators (Online, Offline, Motion Detected, AI Alert)
- Camera Configuration Modal (RTSP/ONVIF URL, IP address, resolution 1080p/4K, site location, zone assignment)
- Single Camera View (`/cameras/$cameraId`) with PTZ (Pan-Tilt-Zoom) dynamic controls, HLS/WebRTC streaming interface placeholder, stream telemetry, and recording schedule

### 🚨 AI Event & Incident Center (`/events`)
- Real-Time Security Event Log
- Filters for Severity (Critical, Warning, Info) and Event Type (Person Detection, Intrusion, License Plate Recognition, Thermal Alert, Object Left Behind)
- Event Detail Drawer with snapshot display, AI confidence score %, bounding box overlay mock, and quick response triggers (Acknowledge, Dispatch Guard, False Alarm)

### 🗺️ Live Operations Map (`/soc/map`)
- Security Operations Facility Map with satellite/floorplan interactive overlay
- Camera markers with Field of View (FOV) cones and real-time alert ping badges
- Interactive stream preview modal on camera marker click

### 🔔 Guard & Incident Escalation Dashboard (`/incidents`)
- Active Incident Tickets with assigned operator/guard tracking
- Countdown response timers and audit trail logs
- One-click team dispatch broadcast using Supabase Realtime notifications

### 📊 System Health & Storage Analytics (`/analytics`)
- Storage metrics panel (Edge vs. Cloud recording retention, total GB used, uptime graphs)
- Daily AI detection heatmaps and top triggered zone breakdowns

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TanStack Router + Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Auth, RLS, Realtime, Edge Functions)
- **Runtime**: Bun package manager and runtime
- **Database**: PostgreSQL with Row Level Security (RLS) policies

## Database Schema

### Tables

- `cameras` (id, name, rtsp_url, ip_address, location_zone, status, ptz_supported, resolution, created_at)
- `camera_events` (id, camera_id, event_type, severity, confidence_score, snapshot_url, timestamp, status)
- `incidents` (id, event_id, assigned_guard_id, status, escalation_level, notes, created_at)
- `storage_retention` (id, camera_id, storage_used_gb, retention_days, cloud_sync_status)
- `broadcasts` (id, title, message, priority, sender_id, target_zone, created_at)
- `audit_logs` (id, incident_id, actor_id, action, details, created_at)

### RLS Policies (Three Primary Roles)

- **Admin**: Full access to all tables and operations
- **Guard/Operator**: Read access to cameras/events/incidents, write access to incidents and broadcasts
- **Client Viewer**: Read-only access to cameras, events, incidents, and analytics

## Getting Started

### Prerequisites
- Bun runtime (v1.4+)
- Node.js (v18+)

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Run migrations from `supabase/migrations/` directory
3. Update `.env` with your project URL and anon key
4. Configure Row Level Security policies as defined in migrations

## Brand Identity

- **Platform Name**: AD Security Camera Solutions
- **Tagline**: Enterprise AI Surveillance & Incident Response
- **Location**: Addis Ababa, Ethiopia
- **Contact**: +251 985 959 697 | +251 918 109 779

## License

© 2026 AD Security Camera Solutions. All Rights Reserved.

## Legacy Documentation

Original HTML files are preserved in `docs/` directory:
- `docs/index.html` - Public website
- `docs/admin.html` - Admin dashboard

## Security

- Row Level Security (RLS) enforced on all Supabase tables
- AI inference engine with confidence scoring
- Real-time WebRTC streams with TLS encryption
- Audit logging for all incident responses
