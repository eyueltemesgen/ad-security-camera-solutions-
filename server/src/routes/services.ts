import { Router } from 'express';
import { query, queryOne } from '../db';
import { HttpError, slugify, writeAudit } from '../utils';
import { requireAdmin, requireAuth } from '../auth';

const router = Router();

// ------------------------------------------------------------ public ------

router.get('/categories', async (_req, res, next) => {
  try {
    const rows = await query(
      `select sc.*, (select count(*)::int from services s where s.category_id = sc.id and s.is_active = true) as service_count
       from service_categories sc where sc.is_active = true order by sc.sort_order, sc.name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------- category admin ------

router.get('/categories/all/admin', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query(
      `select sc.*, (select count(*)::int from services s where s.category_id = sc.id) as service_count
       from service_categories sc order by sc.sort_order, sc.name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/categories', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.name?.trim()) throw new HttpError(400, 'Category name is required');
    const slug = slugify(b.name);
    const existing = await queryOne('select id from service_categories where slug = $1', [slug]);
    if (existing) throw new HttpError(409, 'A category with this name already exists');
    const row = await queryOne(
      `insert into service_categories (name, slug, description, sort_order, is_active)
       values ($1,$2,$3,$4,$5) returning *`,
      [b.name.trim(), slug, b.description ?? '', Number(b.sort_order) || 0, b.is_active !== false]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'service_category_created', targetType: 'service_category', targetId: row.id, description: `Created service category "${row.name}"`, newValue: row });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/categories/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from service_categories where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Category not found');
    const row = await queryOne(
      `update service_categories set
         name = coalesce(nullif($2, ''), name),
         slug = coalesce(nullif($3, ''), slug),
         description = coalesce($4, description),
         sort_order = coalesce($5, sort_order),
         is_active = coalesce($6, is_active)
       where id = $1 returning *`,
      [req.params.id, b.name?.trim() ?? '', slugify(b.name ?? existing.name), b.description ?? existing.description, b.sort_order != null ? Number(b.sort_order) : existing.sort_order, b.is_active != null ? Boolean(b.is_active) : existing.is_active]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'service_category_updated', targetType: 'service_category', targetId: row.id, description: `Updated service category "${row.name}"`, oldValue: existing, newValue: row });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/categories/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from service_categories where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Category not found');
    await query('delete from service_categories where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'service_category_deleted', targetType: 'service_category', targetId: req.params.id, description: `Deleted service category "${existing.name}"`, oldValue: existing });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const rows = await query(
      `select s.*, (select row_to_json(sc) from service_categories sc where sc.id = s.category_id) as category
       from services s where s.is_active = true order by s.sort_order, s.name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const service = await queryOne(
      `select s.*, (select row_to_json(sc) from service_categories sc where sc.id = s.category_id) as category
       from services s where s.slug = $1 and s.is_active = true`,
      [req.params.slug]
    );
    if (!service) throw new HttpError(404, 'Service not found');
    const related = await query(
      `select * from services where is_active = true and id <> $1 order by sort_order limit 3`,
      [service.id]
    );
    res.json({ service, related });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------- admin ------

// All services (including inactive) for the admin panel.
router.get('/all/admin', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query(
      `select s.*, (select row_to_json(sc) from service_categories sc where sc.id = s.category_id) as category
       from services s order by s.sort_order, s.name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.name?.trim()) throw new HttpError(400, 'Service name is required');
    const slug = slugify(b.name);
    const existing = await queryOne('select id from services where slug = $1', [slug]);
    if (existing) throw new HttpError(409, 'A service with this name already exists');

    const service = await queryOne(
      `insert into services (name, slug, category_id, icon, image_url, short_description, description, features, is_featured, is_active, sort_order, meta_title, meta_description)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning *`,
      [
        b.name.trim(), slug, b.category_id ?? null, b.icon ?? 'wrench', b.image_url ?? '',
        b.short_description ?? '', b.description ?? '', JSON.stringify(Array.isArray(b.features) ? b.features : []),
        Boolean(b.is_featured), Boolean(b.is_active), Number(b.sort_order) || 0,
        b.meta_title ?? '', b.meta_description ?? '',
      ]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'service_created', targetType: 'service', targetId: service.id, description: `Created service "${service.name}"`, newValue: service });
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from services where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Service not found');
    const service = await queryOne(
      `update services set
         name = $2, slug = $3, category_id = $4, icon = $5, image_url = $6,
         short_description = $7, description = $8, features = $9,
         is_featured = $10, is_active = $11, sort_order = $12, meta_title = $13, meta_description = $14
       where id = $1 returning *`,
      [
        req.params.id, b.name?.trim() ?? existing.name, slugify(b.name ?? existing.name),
        b.category_id ?? existing.category_id, b.icon ?? existing.icon, b.image_url ?? existing.image_url,
        b.short_description ?? existing.short_description, b.description ?? existing.description,
        JSON.stringify(Array.isArray(b.features) ? b.features : existing.features),
        Boolean(b.is_featured ?? existing.is_featured), Boolean(b.is_active ?? existing.is_active),
        Number(b.sort_order) ?? existing.sort_order, b.meta_title ?? existing.meta_title,
        b.meta_description ?? existing.meta_description,
      ]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'service_updated', targetType: 'service', targetId: service.id, description: `Updated service "${service.name}"`, oldValue: existing, newValue: service });
    res.json(service);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from services where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Service not found');
    await query('delete from services where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'service_deleted', targetType: 'service', targetId: req.params.id, description: `Deleted service "${existing.name}"`, oldValue: existing });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;