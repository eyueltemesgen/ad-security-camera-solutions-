import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '../db';
import { HttpError, writeAudit, notify, notifyAdmins } from '../utils';
import { requireAdmin, requireAuth } from '../auth';

const router = Router();

// ------------------------------------------------------------ messages ----

// Public contact form
router.post('/contacts', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.name?.trim() || !b.message?.trim()) throw new HttpError(400, 'Name and message are required');
    if (b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) throw new HttpError(400, 'A valid email is required');
    const row = await queryOne(
      `insert into contact_messages (name, email, phone, subject, message) values ($1,$2,$3,$4,$5) returning *`,
      [b.name.trim(), b.email ?? '', b.phone ?? '', b.subject ?? '', b.message.trim()]
    );
    await notifyAdmins('New contact message', `${row.name} sent a message: ${row.subject || 'General'}`, 'new_message');
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

// Admin: list messages
router.get('/messages', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, search, page = 1, per_page = 50 } = req.query;
    const where: string[] = ['true'];
    const params: unknown[] = [];
    if (status && status !== 'all') {
      params.push(String(status));
      where.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${String(search).toLowerCase()}%`);
      where.push(`(lower(name) like $${params.length} or lower(email) like $${params.length} or lower(subject) like $${params.length} or lower(message) like $${params.length})`);
    }
    const limit = Math.min(Math.max(Number(per_page) || 50, 1), 200);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;
    const rows = await query(
      `select * from contact_messages where ${where.join(' and ')} order by created_at desc limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, limit, offset]
    );
    const count = await query<{ count: string }>(
      `select count(*)::int as count from contact_messages where ${where.join(' and ')}`,
      params
    );
    res.json({ messages: rows, total: Number(count[0]?.count ?? 0) });
  } catch (err) {
    next(err);
  }
});

router.patch('/messages/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body ?? {};
    if (!['new', 'read', 'responded', 'archived'].includes(status)) throw new HttpError(400, 'Invalid status');
    const existing = await queryOne('select * from contact_messages where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Message not found');
    const row = await queryOne('update contact_messages set status = $2 where id = $1 returning *', [req.params.id, status]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'message_updated', targetType: 'message', targetId: req.params.id, description: `Marked message from ${row.name} as ${status}` });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/messages/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from contact_messages where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Message not found');
    await query('delete from contact_messages where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'message_deleted', targetType: 'message', targetId: req.params.id, description: `Deleted message from ${existing.name}` });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------- notifications ---

router.get('/notifications', requireAuth, async (req, res, next) => {
  try {
    const { admin } = req.query;
    if (admin === 'true') {
      if (req.user!.role !== 'admin') throw new HttpError(403, 'Admin access required');
      const rows = await query('select * from notifications where user_id is null order by created_at desc limit 60');
      return res.json(rows);
    }
    const rows = await query(
      'select * from notifications where user_id = $1 order by created_at desc limit 60',
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.patch('/notifications/:id/read', requireAuth, async (req, res, next) => {
  try {
    const row = await queryOne(
      `update notifications set is_read = true where id = $1 and (user_id = $2 or $3) returning *`,
      [req.params.id, req.user!.id, req.user!.role === 'admin']
    );
    if (!row) throw new HttpError(404, 'Notification not found');
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.patch('/notifications/read-all', requireAuth, async (req, res, next) => {
  try {
    await query('update notifications set is_read = true where user_id = $1 and is_read = false', [req.user!.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Admin: create a notification (broadcast or to a customer)
router.post('/notifications', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.title?.trim()) throw new HttpError(400, 'Title is required');
    const row = await queryOne(
      `insert into notifications (user_id, title, message, type) values ($1,$2,$3,$4) returning *`,
      [b.user_id ?? null, b.title.trim(), b.message ?? '', b.type ?? 'info']
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'notification_created', targetType: 'notification', targetId: row.id, description: `Sent notification "${row.title}"` });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/notifications/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from notifications where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Notification not found');
    await query('delete from notifications where id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------- admin -----

router.get('/customers', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { search, page = 1, per_page = 50 } = req.query;
    const where: string[] = [`role = 'customer'`];
    const params: unknown[] = [];
    if (search) {
      params.push(`%${String(search).toLowerCase()}%`);
      where.push(`(lower(full_name) like $${params.length} or lower(email) like $${params.length} or phone like $${params.length})`);
    }
    const limit = Math.min(Math.max(Number(per_page) || 50, 1), 200);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;
    const rows = await query(
      `select u.id, u.full_name, u.email, u.phone, u.avatar_url, u.is_active, u.created_at, u.updated_at,
        (select count(*)::int from orders o where o.user_id = u.id) as order_count,
        (select coalesce(sum(o.total), 0)::numeric(12,2) from orders o where o.user_id = u.id and o.status <> 'cancelled') as total_spent,
        (select count(*)::int from service_requests sr where sr.user_id = u.id) as service_count
       from users u where ${where.join(' and ')} order by u.created_at desc limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, limit, offset]
    );
    const count = await query<{ count: string }>(
      `select count(*)::int as count from users u where ${where.join(' and ')}`,
      params
    );
    res.json({ customers: rows, total: Number(count[0]?.count ?? 0) });
  } catch (err) {
    next(err);
  }
});

router.patch('/customers/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne(`select * from users where id = $1 and role = 'customer'`, [req.params.id]);
    if (!existing) throw new HttpError(404, 'Customer not found');
    const updated = await queryOne(
      `update users set full_name = $2, phone = $3, is_active = $4 where id = $1 returning id, full_name, email, phone, is_active`,
      [req.params.id, b.full_name ?? existing.full_name, b.phone ?? existing.phone, b.is_active === undefined ? existing.is_active : Boolean(b.is_active)]
    );
    if (b.is_active === false) {
      await notify({ userId: existing.id, title: 'Account deactivated', message: 'Your account has been deactivated. Contact us for support.', type: 'account' });
    }
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'customer_updated', targetType: 'customer', targetId: req.params.id, description: `Updated customer ${existing.email}`, oldValue: { is_active: existing.is_active }, newValue: { is_active: updated.is_active } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.get('/admins', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query(`select id, full_name, email, phone, role, created_at from users where role = 'admin' order by created_at`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/admins', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.full_name?.trim() || !b.email?.trim()) throw new HttpError(400, 'Name and email are required');
    if (!b.password || String(b.password).length < 6) throw new HttpError(400, 'Password must be at least 6 characters');
    const existing = await queryOne('select id from users where lower(email) = lower($1)', [String(b.email).trim()]);
    if (existing) throw new HttpError(409, 'An account with this email already exists');
    const hash = await bcrypt.hash(String(b.password), 10);
    const row = await queryOne(
      `insert into users (full_name, email, phone, password_hash, role, is_active) values ($1,$2,$3,$4,'admin',true) returning id, full_name, email, role`,
      [b.full_name.trim(), String(b.email).trim().toLowerCase(), b.phone ?? '', hash]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'admin_created', targetType: 'admin', targetId: row.id, description: `Created admin account for ${row.email}` });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------ analytics ---

router.get('/analytics', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [customerCount, newCustomersWeek, orderStats, productStats, serviceStats, messageStats, revenueToday, revenueWeek] = await Promise.all([
      queryOne(`select count(*)::int as count from users where role = 'customer'`),
      queryOne(`select count(*)::int as count from users where role = 'customer' and created_at >= now() - interval '7 days'`),
      queryOne(`select count(*)::int as total, count(*) filter (where status = 'pending')::int as pending, count(*) filter (where status = 'completed')::int as completed, coalesce(sum(total) filter (where status <> 'cancelled'), 0)::numeric(12,2) as revenue from orders`),
      queryOne(`select count(*)::int as count, count(*) filter (where is_active and stock <= low_stock_threshold)::int as low_stock from products`),
      queryOne(`select count(*)::int as total, count(*) filter (where status = 'submitted')::int as pending from service_requests`),
      queryOne(`select count(*)::int as count, count(*) filter (where status = 'new')::int as unread from contact_messages`),
      queryOne(`select coalesce(sum(total) filter (where status <> 'cancelled' and created_at >= date_trunc('day', now())), 0)::numeric(12,2) as total from orders`),
      queryOne(`select coalesce(sum(total) filter (where status <> 'cancelled' and created_at >= now() - interval '7 days'), 0)::numeric(12,2) as total from orders`),
    ]);

    const salesByDay = await query(
      `select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date, coalesce(sum(total) filter (where status <> 'cancelled'), 0)::numeric(12,2) as total, count(*)::int as orders
       from orders where created_at >= now() - interval '14 days' group by 1 order by 1`
    );
    const customerGrowth = await query(
      `select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date, count(*)::int as count
       from users where role = 'customer' and created_at >= now() - interval '14 days' group by 1 order by 1`
    );
    const serviceByType = await query(
      `select service_name as name, count(*)::int as requests from service_requests group by 1 order by 2 desc limit 10`
    );
    const topProducts = await query(
      `select product_name as name, sum(quantity)::int as quantity from order_items group by 1 order by 2 desc limit 8`
    );
    const recentOrders = await query(
      `select o.id, o.order_number, o.customer_name, o.total, o.status, o.created_at from orders o order by o.created_at desc limit 8`
    );

    res.json({
      totals: {
        customers: customerCount?.count ?? 0,
        newCustomersWeek: newCustomersWeek?.count ?? 0,
        orders: orderStats?.total ?? 0,
        pendingOrders: orderStats?.pending ?? 0,
        completedOrders: orderStats?.completed ?? 0,
        revenue: Number(orderStats?.revenue ?? 0),
        products: productStats?.count ?? 0,
        lowStock: productStats?.low_stock ?? 0,
        serviceRequests: serviceStats?.total ?? 0,
        pendingServiceRequests: serviceStats?.pending ?? 0,
        contactMessages: messageStats?.count ?? 0,
        unreadMessages: messageStats?.unread ?? 0,
        revenueToday: Number(revenueToday?.total ?? 0),
        revenueWeek: Number(revenueWeek?.total ?? 0),
      },
      salesByDay,
      customerGrowth,
      serviceByType,
      topProducts,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------- audit logs --

router.get('/audit-logs', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, per_page = 50, action } = req.query;
    const params: unknown[] = [];
    const where: string[] = ['true'];
    if (action && action !== 'all') {
      params.push(String(action));
      where.push(`action = $${params.length}`);
    }
    const limit = Math.min(Math.max(Number(per_page) || 50, 1), 200);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;
    const rows = await query(
      `select al.*, u.email as admin_email from audit_logs al left join users u on u.id = al.admin_id
       where ${where.join(' and ')} order by al.created_at desc limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, limit, offset]
    );
    const count = await query<{ count: string }>(
      `select count(*)::int as count from audit_logs al where ${where.join(' and ')}`,
      params
    );
    res.json({ logs: rows, total: Number(count[0]?.count ?? 0) });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------- admin password ---

router.put('/account/password', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body ?? {};
    if (!current_password || !new_password || String(new_password).length < 6) {
      throw new HttpError(400, 'Current and new password (6+ chars) are required');
    }
    const row = await queryOne('select password_hash from users where id = $1', [req.user!.id]);
    if (!row) throw new HttpError(404, 'User not found');
    const ok = await bcrypt.compare(String(current_password), row.password_hash);
    if (!ok) throw new HttpError(400, 'Current password is incorrect');
    const hash = await bcrypt.hash(String(new_password), 10);
    await query('update users set password_hash = $1 where id = $2', [hash, req.user!.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'admin_password_changed', targetType: 'auth', description: 'Admin changed their password' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;