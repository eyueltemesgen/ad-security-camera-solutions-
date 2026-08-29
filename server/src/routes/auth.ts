import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { query, queryOne } from '../db';
import { HttpError, signToken, writeAudit, notify, notifyAdmins } from '../utils';
import { requireAuth } from '../auth';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

// ------------------------------------------------------------- register ----

router.post('/register', async (req, res, next) => {
  try {
    const { full_name, email, phone, password } = req.body ?? {};
    if (!full_name || !String(full_name).trim()) throw new HttpError(400, 'Full name is required');
    if (!email || !validateEmail(String(email))) throw new HttpError(400, 'A valid email is required');
    if (!password || String(password).length < 6) throw new HttpError(400, 'Password must be at least 6 characters');

    const existing = await queryOne('select id from users where lower(email) = lower($1)', [String(email).trim()]);
    if (existing) throw new HttpError(409, 'An account with this email already exists');

    const hash = await bcrypt.hash(String(password), 10);
    const user = await queryOne<{ id: string; email: string; full_name: string; role: string }>(
      `insert into users (full_name, email, phone, password_hash, role, is_active)
       values ($1, $2, $3, $4, 'customer', true)
       returning id, email, full_name, role`,
      [String(full_name).trim(), String(email).trim().toLowerCase(), String(phone ?? '').trim(), hash]
    );
    if (!user) throw new HttpError(500, 'Failed to create account');

    await notify({ userId: user.id, title: 'Welcome to AD Security Camera Solution', message: 'Your account has been created. Browse products, place orders and request services.', type: 'account' });
    await notifyAdmins('New customer registered', `${user.full_name} (${user.email}) created an account.`, 'new_customer');

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------- login ----

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) throw new HttpError(400, 'Email and password are required');

    const user = await queryOne<{
      id: string; email: string; full_name: string; phone: string; avatar_url: string;
      password_hash: string; role: string; is_active: boolean;
    }>('select * from users where lower(email) = lower($1)', [String(email).trim()]);
    if (!user) throw new HttpError(401, 'Invalid email or password');

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) throw new HttpError(401, 'Invalid email or password');
    if (!user.is_active) throw new HttpError(403, 'This account has been deactivated. Contact support.');

    if (user.role === 'admin') {
      await writeAudit({ adminId: user.id, adminName: user.full_name, action: 'admin_login', targetType: 'auth', description: `${user.email} signed in to the admin dashboard` });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------- forgot pw ------

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    if (!email) throw new HttpError(400, 'Email is required');
    const user = await queryOne<{ id: string; full_name: string }>('select id, full_name from users where lower(email) = lower($1)', [String(email).trim()]);
    if (!user) {
      // Do not reveal whether the account exists.
      return res.json({ ok: true });
    }
    const token = nanoid(32);
    await query(
      `insert into password_resets (user_id, token, expires_at) values ($1, $2, now() + interval '1 hour')
       on conflict (token) do nothing`,
      [user.id, token]
    );
    // In production this would email a reset link. We return it in the response
    // for demo purposes so the flow is fully testable without an SMTP server.
    res.json({ ok: true, reset_token: token });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------- reset pw -------

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body ?? {};
    if (!token || !password || String(password).length < 6) {
      throw new HttpError(400, 'A valid token and a password of at least 6 characters are required');
    }
    const reset = await queryOne<{ id: string; user_id: string; expires_at: string; used: boolean }>(
      'select * from password_resets where token = $1',
      [String(token)]
    );
    if (!reset || reset.used || new Date(reset.expires_at) < new Date()) {
      throw new HttpError(400, 'This reset link is invalid or has expired');
    }
    const hash = await bcrypt.hash(String(password), 10);
    await query('update users set password_hash = $1 where id = $2', [hash, reset.user_id]);
    await query('update password_resets set used = true where id = $1', [reset.id]);
    await notify({ userId: reset.user_id, title: 'Password changed', message: 'Your password was successfully reset.', type: 'account' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------- profile -----

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await queryOne(
      `select id, full_name, email, phone, avatar_url, role, is_active, created_at, updated_at
       from users where id = $1`,
      [req.user!.id]
    );
    if (!user) throw new HttpError(404, 'User not found');
    const addresses = await query('select * from user_addresses where user_id = $1 order by is_default desc, created_at', [req.user!.id]);
    res.json({ user, addresses });
  } catch (err) {
    next(err);
  }
});

router.put('/me', requireAuth, async (req, res, next) => {
  try {
    const { full_name, phone, avatar_url } = req.body ?? {};
    const user = await queryOne(
      `update users set
         full_name = coalesce(nullif($2, ''), full_name),
         phone = coalesce(nullif($3, ''), phone),
         avatar_url = coalesce(nullif($4, ''), avatar_url)
       where id = $1
       returning id, full_name, email, phone, avatar_url, role`,
      [req.user!.id, full_name ?? '', phone ?? '', avatar_url ?? '']
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.put('/me/password', requireAuth, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body ?? {};
    if (!current_password || !new_password || String(new_password).length < 6) {
      throw new HttpError(400, 'Current password and a new password of at least 6 characters are required');
    }
    const row = await queryOne<{ password_hash: string }>('select password_hash from users where id = $1', [req.user!.id]);
    if (!row) throw new HttpError(404, 'User not found');
    const ok = await bcrypt.compare(String(current_password), row.password_hash);
    if (!ok) throw new HttpError(400, 'Current password is incorrect');
    const hash = await bcrypt.hash(String(new_password), 10);
    await query('update users set password_hash = $1 where id = $2', [hash, req.user!.id]);
    await notify({ userId: req.user!.id, title: 'Password changed', message: 'Your password was updated successfully.', type: 'account' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------- addresses ---

router.get('/me/addresses', requireAuth, async (req, res, next) => {
  try {
    const rows = await query('select * from user_addresses where user_id = $1 order by is_default desc, created_at', [req.user!.id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/me/addresses', requireAuth, async (req, res, next) => {
  try {
    const { label, full_name, phone, address, city, country, is_default } = req.body ?? {};
    if (!address) throw new HttpError(400, 'Address is required');
    if (is_default) {
      await query('update user_addresses set is_default = false where user_id = $1', [req.user!.id]);
    }
    const row = await queryOne(
      `insert into user_addresses (user_id, label, full_name, phone, address, city, country, is_default)
       values ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
      [req.user!.id, label ?? 'Home', full_name ?? '', phone ?? '', address, city ?? '', country ?? '', Boolean(is_default)]
    );
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/me/addresses/:id', requireAuth, async (req, res, next) => {
  try {
    const { label, full_name, phone, address, city, country, is_default } = req.body ?? {};
    const row = await queryOne(
      `update user_addresses set
         label = coalesce(nullif($3, ''), label),
         full_name = coalesce(nullif($4, ''), full_name),
         phone = coalesce(nullif($5, ''), phone),
         address = coalesce(nullif($6, ''), address),
         city = coalesce(nullif($7, ''), city),
         country = coalesce(nullif($8, ''), country),
         is_default = coalesce($9, is_default)
       where id = $1 and user_id = $2 returning *`,
      [req.params.id, req.user!.id, label ?? '', full_name ?? '', phone ?? '', address ?? '', city ?? '', country ?? '', is_default]
    );
    if (!row) throw new HttpError(404, 'Address not found');
    if (row.is_default) {
      await query('update user_addresses set is_default = false where user_id = $1 and id <> $2', [req.user!.id, row.id]);
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/me/addresses/:id', requireAuth, async (req, res, next) => {
  try {
    const row = await queryOne('delete from user_addresses where id = $1 and user_id = $2 returning id', [req.params.id, req.user!.id]);
    if (!row) throw new HttpError(404, 'Address not found');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;