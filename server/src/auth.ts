import type { NextFunction, Request, Response } from 'express';
import { bearerToken, HttpError, verifyToken, type AuthUser } from './utils';
import { queryOne } from './db';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Require a valid authenticated customer or admin. */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = bearerToken(req);
    if (!token) throw new HttpError(401, 'Authentication required');
    const payload = verifyToken(token);
    if (!payload) throw new HttpError(401, 'Invalid or expired session');

    // Re-check the user still exists and is active.
    const user = await queryOne<{ id: string; email: string; full_name: string; role: string; is_active: boolean }>(
      'select id, email, full_name, role, is_active from users where id = $1',
      [payload.id]
    );
    if (!user) throw new HttpError(401, 'Account no longer exists');
    if (!user.is_active) throw new HttpError(403, 'Account has been deactivated');

    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role as 'customer' | 'admin',
    };
    next();
  } catch (err) {
    next(err);
  }
}

/** Require an admin role (after requireAuth). */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    next(new HttpError(403, 'Admin access required'));
    return;
  }
  next();
}

/** Require an authenticated non-admin (customer) user. */
export function requireCustomer(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }
  if (req.user.role !== 'customer') {
    next(new HttpError(403, 'Customer account required'));
    return;
  }
  next();
}

/**
 * Optional authentication — populates req.user when a valid bearer token is
 * present, but does not reject anonymous requests. Used for public-ish routes
 * that should still link activity to a logged-in customer when available.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = bearerToken(req);
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const user = await queryOne<{ id: string; email: string; full_name: string; role: string; is_active: boolean }>(
          'select id, email, full_name, role, is_active from users where id = $1',
          [payload.id]
        );
        if (user && user.is_active) {
          req.user = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role as 'customer' | 'admin',
          };
        }
      }
    }
    next();
  } catch {
    next();
  }
}