// Shared server utilities: token signing, upload helpers, audit logging, notifications.
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { config } from './config';
import { query } from './db';
import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
}

export function signToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { uid: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as {
      uid: string;
      email: string;
      role: string;
    };
    return {
      id: payload.uid,
      email: payload.email,
      full_name: '',
      role: payload.role as AuthUser['role'],
    };
  } catch {
    return null;
  }
}

/** Get the bearer token from an Express request. */
export function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

// ------------------------------------------------------------------ uploads

let uploadSeq = 0;
export function safeFileName(original: string): { name: string; ext: string } {
  const clean = (original || 'file')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/_+/g, '-')
    .slice(0, 80);
  const idx = clean.lastIndexOf('.');
  const base = idx > 0 ? clean.slice(0, idx) : clean;
  const ext = (idx > 0 ? clean.slice(idx + 1) : '').toLowerCase();
  uploadSeq += 1;
  return { name: `${base}-${Date.now()}-${nanoid(6)}${uploadSeq}`, ext };
}

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const DOC_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export function isAllowedImage(mime: string): boolean {
  return IMAGE_TYPES.has(mime);
}

export function isAllowedDocument(mime: string): boolean {
  return DOC_TYPES.has(mime);
}

// ------------------------------------------------------------- audit log ----

export async function writeAudit(opts: {
  adminId?: string | null;
  adminName?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  description?: string;
  oldValue?: unknown;
  newValue?: unknown;
}): Promise<void> {
  try {
    await query(
      `insert into audit_logs (admin_id, admin_name, action, target_type, target_id, description, old_value, new_value)
       values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb)`,
      [
        opts.adminId ?? null,
        opts.adminName ?? '',
        opts.action,
        opts.targetType ?? '',
        opts.targetId ?? '',
        opts.description ?? '',
        opts.oldValue === undefined ? null : JSON.stringify(opts.oldValue),
        opts.newValue === undefined ? null : JSON.stringify(opts.newValue),
      ]
    );
  } catch (err) {
    console.error('Audit write failed:', err);
  }
}

// --------------------------------------------------------- notifications ----

export async function notify(opts: {
  userId?: string | null;
  title: string;
  message: string;
  type?: string;
}): Promise<void> {
  try {
    await query(
      `insert into notifications (user_id, title, message, type) values ($1, $2, $3, $4)`,
      [opts.userId ?? null, opts.title, opts.message, opts.type ?? 'info']
    );
  } catch (err) {
    console.error('Notification insert failed:', err);
  }
}

/** Notify all admins (user_id NULL rows). */
export async function notifyAdmins(title: string, message: string, type = 'info'): Promise<void> {
  await notify({ userId: null, title, message, type });
}

// ------------------------------------------------------------- http enc ----

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function asError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;
  const message = err instanceof Error ? err.message : 'Unexpected server error';
  return new HttpError(500, message);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120);
}

export function paginate(page?: number, perPage?: number): { limit: number; offset: number } {
  const limit = Math.min(Math.max(Number(perPage) || 20, 1), 100);
  const offset = Math.max(Number(page) || 1, 1);
  return { limit, offset: (offset - 1) * limit };
}