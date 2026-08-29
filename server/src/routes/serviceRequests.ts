import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query, queryOne } from '../db';
import { config } from '../config';
import { HttpError, writeAudit, notify, safeFileName, isAllowedDocument } from '../utils';
import { requireAuth, requireAdmin, optionalAuth } from '../auth';

const router = Router();

// Secure file upload config: whitelist MIME types, size limits, safe names.
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(config.uploadDir, 'service-files');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const { name, ext } = safeFileName(file.originalname);
      cb(null, `${name}.${ext || 'bin'}`);
    },
  }),
  limits: { fileSize: config.maxFileBytes, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (isAllowedDocument(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, 'Only PDF and image files are allowed'));
  },
});

const STATUSES = ['submitted', 'under_review', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled'];

// --------------------------------------------------------------- create ----

router.post('/', upload.array('files', 5), optionalAuth, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.customer_name?.trim()) throw new HttpError(400, 'Full name is required');
    if (!b.phone?.trim()) throw new HttpError(400, 'Phone number is required');
    if (b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) throw new HttpError(400, 'A valid email is required');

    let serviceName = '';
    let serviceId: string | null = null;
    if (b.service_id) {
      const svc = await queryOne('select id, name from services where id = $1', [b.service_id]);
      if (svc) { serviceId = svc.id; serviceName = svc.name; }
    } else if (b.service_name) {
      serviceName = String(b.service_name);
    }

    const insert = await queryOne(
      `insert into service_requests (
         user_id, customer_name, phone, email, service_id, service_name, location,
         property_type, preferred_date, preferred_time, device_count, current_system,
         description, notes
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) returning *`,
      [
        req.user?.id ?? null, b.customer_name.trim(), b.phone.trim(), b.email ?? '',
        serviceId, serviceName, b.location ?? '', b.property_type ?? '',
        b.preferred_date || null, b.preferred_time ?? '',
        b.device_count === '' || b.device_count == null ? null : Number(b.device_count),
        b.current_system ?? '', b.description ?? '', b.notes ?? '',
      ]
    );
    if (!insert) throw new HttpError(500, 'Failed to create service request');

    // Store uploaded files
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    for (const file of files) {
      const url = `/uploads/service-files/${path.basename(file.path)}`;
      await query(
        `insert into service_request_files (request_id, file_url, file_name, file_type, file_size)
         values ($1,$2,$3,$4,$5)`,
        [insert.id, url, file.originalname, file.mimetype, file.size]
      );
    }
    // Also accept pre-uploaded file URLs (uploaded via POST /api/uploads/service-file)
    if (Array.isArray(b.file_urls)) {
      for (const url of b.file_urls) {
        if (typeof url !== 'string' || !url.startsWith('/uploads/service-files/')) continue;
        await query(
          `insert into service_request_files (request_id, file_url, file_name, file_type, file_size)
           values ($1,$2,'uploaded file','application/octet-stream',0)`,
          [insert.id, url]
        );
      }
    }

    await notify({
      userId: req.user?.id ?? null,
      title: `Service request ${insert.request_number} received`,
      message: `Your request for "${serviceName || 'a service'}" was submitted and is under review.`,
      type: 'service_created',
    });
    await query(
      `insert into notifications (user_id, title, message, type) values (null, 'New service request', $1, 'new_service')`,
      [`${insert.customer_name} requested "Service: ${serviceName || 'unspecified'}" (${insert.request_number}).`]
    );

    res.status(201).json(insert);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------- public ------

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const rows = await query(
      `select sr.*, 
        (select coalesce(jsonb_agg(jsonb_build_object('id', f.id, 'file_url', f.file_url, 'file_name', f.file_name, 'file_type', f.file_type, 'file_size', f.file_size)), '[]'::jsonb)
         from service_request_files f where f.request_id = sr.id) as files
       from service_requests sr where sr.user_id = $1 order by sr.created_at desc`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const row = await queryOne(
      `select sr.*, 
        (select coalesce(jsonb_agg(jsonb_build_object('id', f.id, 'file_url', f.file_url, 'file_name', f.file_name, 'file_type', f.file_type, 'file_size', f.file_size)), '[]'::jsonb)
         from service_request_files f where f.request_id = sr.id) as files
       from service_requests sr where sr.id = $1 and (sr.user_id = $2 or $3)`,
      [req.params.id, req.user!.id, req.user!.role === 'admin']
    );
    if (!row) throw new HttpError(404, 'Service request not found');
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------- admin ------

router.get('/all/admin', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, search, page = 1, per_page = 50 } = req.query;
    const where: string[] = ['true'];
    const params: unknown[] = [];
    if (status && status !== 'all') {
      params.push(String(status));
      where.push(`sr.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${String(search).toLowerCase()}%`);
      where.push(`(lower(sr.request_number) like $${params.length} or lower(sr.customer_name) like $${params.length} or lower(sr.service_name) like $${params.length} or lower(sr.email) like $${params.length} or sr.phone like $${params.length})`);
    }
    const limit = Math.min(Math.max(Number(per_page) || 50, 1), 200);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;
    const rows = await query(
      `select sr.*,
        (select coalesce(jsonb_agg(jsonb_build_object('id', f.id, 'file_url', f.file_url, 'file_name', f.file_name, 'file_type', f.file_type, 'file_size', f.file_size)), '[]'::jsonb)
         from service_request_files f where f.request_id = sr.id) as files
       from service_requests sr where ${where.join(' and ')} order by sr.created_at desc limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, limit, offset]
    );
    const count = await query<{ count: string }>(
      `select count(*)::int as count from service_requests sr where ${where.join(' and ')}`,
      params
    );
    res.json({ requests: rows, total: Number(count[0]?.count ?? 0) });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from service_requests where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Service request not found');

    const statusChanged = b.status && b.status !== existing.status;
    if (b.status && !STATUSES.includes(b.status)) throw new HttpError(400, 'Invalid status');

    const completedAt = b.status === 'completed' && statusChanged ? new Date().toISOString() : existing.completed_at;
    const updated = await queryOne(
      `update service_requests set
         status = coalesce(nullif($2, ''), status),
         admin_notes = coalesce(nullif($3, ''), admin_notes),
         assigned_technician = coalesce(nullif($4, ''), assigned_technician),
         scheduled_date = coalesce($5::date, scheduled_date),
         completed_at = $6
       where id = $1 returning *`,
      [req.params.id, b.status ?? '', b.admin_notes ?? '', b.assigned_technician ?? '', b.scheduled_date ?? null, completedAt]
    );

    if (statusChanged && existing.user_id) {
      await notify({
        userId: existing.user_id,
        title: `Service request ${existing.request_number} updated`,
        message: `Your service request status is now: ${(b.status as string).replace(/_/g, ' ')}.`,
        type: 'service_status',
      });
    }
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'service_request_updated', targetType: 'service_request', targetId: req.params.id, description: `Updated service request ${existing.request_number}${statusChanged ? ` → ${b.status}` : ''}`, oldValue: { status: existing.status }, newValue: { status: b.status, admin_notes: b.admin_notes, assigned_technician: b.assigned_technician, scheduled_date: b.scheduled_date } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from service_requests where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Service request not found');
    await query('delete from service_requests where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'service_request_deleted', targetType: 'service_request', targetId: req.params.id, description: `Deleted service request ${existing.request_number}`, oldValue: existing });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;