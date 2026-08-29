import { Router } from 'express';
import { query, queryOne } from '../db';
import { HttpError, writeAudit } from '../utils';
import { requireAdmin, requireAuth } from '../auth';

const router = Router();

// ------------------------------------------------------------ public ------

/** Everything the public site needs in one payload (published content only). */
router.get('/public', async (_req, res, next) => {
  try {
    const [settings, homepage, pages, nav, footer, social, testimonials, faqs, gallery, announcements] = await Promise.all([
      query('select section, key, value from website_settings'),
      query('select slug, title, content, is_active, sort_order from homepage_sections where is_active = true order by sort_order'),
      query('select slug, title, subtitle, content, meta_title, meta_description from pages where is_active = true'),
      query('select label, url, sort_order from navigation_items where is_active = true order by sort_order'),
      query('select title, links, sort_order from footer_sections where is_active = true order by sort_order'),
      query('select platform, username, url, icon from social_links where is_active = true order by sort_order'),
      query('select id, name, company, image_url, rating, content from testimonials where is_active = true order by sort_order'),
      query('select id, category, question, answer from faqs where is_active = true order by sort_order'),
      query(`select id, image_url, title, description, category from gallery where is_active = true order by sort_order`),
      query(`select id, title, message, image_url, cta_label, cta_url from announcements
             where is_active = true and (start_at is null or start_at <= now()) and (end_at is null or end_at >= now())
             order by created_at desc limit 5`),
    ]);

    const settingsMap: Record<string, Record<string, unknown>> = {};
    for (const row of settings) {
      if (!settingsMap[row.section]) settingsMap[row.section] = {};
      settingsMap[row.section][row.key] = row.value;
    }

    res.json({
      settings: settingsMap,
      homepage,
      pages,
      navigation: nav,
      footer,
      social,
      testimonials,
      faqs,
      gallery,
      announcements,
    });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------- admin ------

router.get('/settings', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query('select section, key, value from website_settings order by section, key');
    const map: Record<string, Record<string, unknown>> = {};
    for (const row of rows) {
      if (!map[row.section]) map[row.section] = {};
      map[row.section][row.key] = row.value;
    }
    res.json(map);
  } catch (err) {
    next(err);
  }
});

router.put('/settings', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const changes: string[] = [];
    for (const [section, entries] of Object.entries(body)) {
      if (typeof entries !== 'object' || entries === null) continue;
      for (const [key, value] of Object.entries(entries as Record<string, unknown>)) {
        const existing = await queryOne('select value from website_settings where section = $1 and key = $2', [section, key]);
        await query(
          `insert into website_settings (section, key, value) values ($1,$2,$3::jsonb)
           on conflict (section, key) do update set value = excluded.value, updated_at = now()`,
          [section, key, JSON.stringify(value)]
        );
        changes.push(`${section}.${key}`);
        if (existing) {
          await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'setting_updated', targetType: 'setting', targetId: `${section}.${key}`, description: `Updated setting ${section}.${key}`, oldValue: existing.value, newValue: value });
        }
      }
    }
    res.json({ ok: true, changes });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------- homepage ---

router.get('/homepage', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query('select * from homepage_sections order by sort_order');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.put('/homepage/:slug', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from homepage_sections where slug = $1', [req.params.slug]);
    if (!existing) throw new HttpError(404, 'Homepage section not found');
    const updated = await queryOne(
      `update homepage_sections set title = $2, content = $3::jsonb, is_active = $4, sort_order = $5 where slug = $1 returning *`,
      [req.params.slug, b.title ?? existing.title, JSON.stringify(b.content ?? existing.content), b.is_active === undefined ? existing.is_active : Boolean(b.is_active), b.sort_order ?? existing.sort_order]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'homepage_updated', targetType: 'homepage_section', targetId: req.params.slug, description: `Updated homepage section "${existing.title}"`, oldValue: existing.content, newValue: updated.content });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------- pages ---

router.get('/pages', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query('select * from pages order by created_at');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.put('/pages/:slug', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from pages where slug = $1', [req.params.slug]);
    if (!existing) throw new HttpError(404, 'Page not found');
    const updated = await queryOne(
      `update pages set
         title = $2, subtitle = $3, content = $4::jsonb, meta_title = $5, meta_description = $6, is_active = $7
       where slug = $1 returning *`,
      [req.params.slug, b.title ?? existing.title, b.subtitle ?? existing.subtitle, JSON.stringify(b.content ?? existing.content), b.meta_title ?? existing.meta_title, b.meta_description ?? existing.meta_description, b.is_active === undefined ? existing.is_active : Boolean(b.is_active)]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'page_updated', targetType: 'page', targetId: req.params.slug, description: `Updated page "${existing.title}"`, oldValue: existing.content, newValue: updated.content });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------ navigation ---

router.get('/navigation', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query('select * from navigation_items order by sort_order');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/navigation', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.label?.trim()) throw new HttpError(400, 'Label is required');
    const row = await queryOne(
      `insert into navigation_items (label, url, sort_order, is_active) values ($1,$2,$3,$4) returning *`,
      [b.label.trim(), b.url ?? '/', Number(b.sort_order) || 0, b.is_active === undefined ? true : Boolean(b.is_active)]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'navigation_created', targetType: 'navigation', targetId: row.id, description: `Added navigation item "${row.label}"` });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/navigation/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from navigation_items where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Navigation item not found');
    const row = await queryOne(
      `update navigation_items set label = $2, url = $3, sort_order = $4, is_active = $5 where id = $1 returning *`,
      [req.params.id, b.label ?? existing.label, b.url ?? existing.url, b.sort_order ?? existing.sort_order, b.is_active === undefined ? existing.is_active : Boolean(b.is_active)]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'navigation_updated', targetType: 'navigation', targetId: req.params.id, description: `Updated navigation item "${row.label}"` });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/navigation/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from navigation_items where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Navigation item not found');
    await query('delete from navigation_items where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'navigation_deleted', targetType: 'navigation', targetId: req.params.id, description: `Deleted navigation item "${existing.label}"` });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------- footer -----

router.get('/footer', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query('select * from footer_sections order by sort_order');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.put('/footer/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from footer_sections where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Footer section not found');
    const row = await queryOne(
      `update footer_sections set title = $2, links = $3::jsonb, sort_order = $4, is_active = $5 where id = $1 returning *`,
      [req.params.id, b.title ?? existing.title, JSON.stringify(b.links ?? existing.links), b.sort_order ?? existing.sort_order, b.is_active === undefined ? existing.is_active : Boolean(b.is_active)]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'footer_updated', targetType: 'footer', targetId: req.params.id, description: `Updated footer section "${row.title}"` });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------ social ------

router.get('/social', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query('select * from social_links order by sort_order');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.put('/social/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from social_links where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Social link not found');
    const row = await queryOne(
      `update social_links set platform = $2, username = $3, url = $4, icon = $5, is_active = $6, sort_order = $7 where id = $1 returning *`,
      [req.params.id, b.platform ?? existing.platform, b.username ?? existing.username, b.url ?? existing.url, b.icon ?? existing.icon, b.is_active === undefined ? existing.is_active : Boolean(b.is_active), b.sort_order ?? existing.sort_order]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'social_updated', targetType: 'social', targetId: req.params.id, description: `Updated ${row.platform} social link` });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------- testimonials ---

router.get('/testimonials', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query('select * from testimonials order by sort_order');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/testimonials', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.name?.trim() || !b.content?.trim()) throw new HttpError(400, 'Name and content are required');
    const row = await queryOne(
      `insert into testimonials (name, company, image_url, rating, content, is_active, sort_order) values ($1,$2,$3,$4,$5,$6,$7) returning *`,
      [b.name.trim(), b.company ?? '', b.image_url ?? '', Number(b.rating) || 5, b.content.trim(), b.is_active === undefined ? true : Boolean(b.is_active), Number(b.sort_order) || 0]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'testimonial_created', targetType: 'testimonial', targetId: row.id, description: `Created testimonial by ${row.name}` });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/testimonials/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from testimonials where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Testimonial not found');
    const row = await queryOne(
      `update testimonials set name = $2, company = $3, image_url = $4, rating = $5, content = $6, is_active = $7, sort_order = $8 where id = $1 returning *`,
      [req.params.id, b.name ?? existing.name, b.company ?? existing.company, b.image_url ?? existing.image_url, Number(b.rating) ?? existing.rating, b.content ?? existing.content, b.is_active === undefined ? existing.is_active : Boolean(b.is_active), b.sort_order ?? existing.sort_order]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'testimonial_updated', targetType: 'testimonial', targetId: req.params.id, description: `Updated testimonial by ${row.name}` });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/testimonials/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from testimonials where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Testimonial not found');
    await query('delete from testimonials where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'testimonial_deleted', targetType: 'testimonial', targetId: req.params.id, description: `Deleted testimonial by ${existing.name}` });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------------ faqs ---

router.get('/faqs', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query('select * from faqs order by sort_order');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/faqs', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.question?.trim() || !b.answer?.trim()) throw new HttpError(400, 'Question and answer are required');
    const row = await queryOne(
      `insert into faqs (category, question, answer, is_active, sort_order) values ($1,$2,$3,$4,$5) returning *`,
      [b.category ?? 'General', b.question.trim(), b.answer.trim(), b.is_active === undefined ? true : Boolean(b.is_active), Number(b.sort_order) || 0]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'faq_created', targetType: 'faq', targetId: row.id, description: `Created FAQ "${row.question}"` });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/faqs/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from faqs where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'FAQ not found');
    const row = await queryOne(
      `update faqs set category = $2, question = $3, answer = $4, is_active = $5, sort_order = $6 where id = $1 returning *`,
      [req.params.id, b.category ?? existing.category, b.question ?? existing.question, b.answer ?? existing.answer, b.is_active === undefined ? existing.is_active : Boolean(b.is_active), b.sort_order ?? existing.sort_order]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'faq_updated', targetType: 'faq', targetId: req.params.id, description: `Updated FAQ "${row.question}"` });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/faqs/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from faqs where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'FAQ not found');
    await query('delete from faqs where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'faq_deleted', targetType: 'faq', targetId: req.params.id, description: `Deleted FAQ "${existing.question}"` });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------- gallery -----

router.get('/gallery', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query('select * from gallery order by sort_order');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/gallery', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.image_url) throw new HttpError(400, 'Image is required');
    const row = await queryOne(
      `insert into gallery (image_url, title, description, category, is_featured, is_active, sort_order) values ($1,$2,$3,$4,$5,$6,$7) returning *`,
      [b.image_url, b.title ?? '', b.description ?? '', b.category ?? 'Security Projects', Boolean(b.is_featured), b.is_active === undefined ? true : Boolean(b.is_active), Number(b.sort_order) || 0]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'gallery_created', targetType: 'gallery', targetId: row.id, description: `Added gallery image "${row.title}"` });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/gallery/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from gallery where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Gallery item not found');
    const row = await queryOne(
      `update gallery set image_url = $2, title = $3, description = $4, category = $5, is_featured = $6, is_active = $7, sort_order = $8 where id = $1 returning *`,
      [req.params.id, b.image_url ?? existing.image_url, b.title ?? existing.title, b.description ?? existing.description, b.category ?? existing.category, b.is_featured === undefined ? existing.is_featured : Boolean(b.is_featured), b.is_active === undefined ? existing.is_active : Boolean(b.is_active), b.sort_order ?? existing.sort_order]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'gallery_updated', targetType: 'gallery', targetId: req.params.id, description: `Updated gallery image "${row.title}"` });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/gallery/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from gallery where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Gallery item not found');
    await query('delete from gallery where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'gallery_deleted', targetType: 'gallery', targetId: req.params.id, description: `Deleted gallery image "${existing.title}"` });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------- media ------

router.get('/media', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query('select * from media order by created_at desc');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/media', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.file_url) throw new HttpError(400, 'File URL is required');
    const row = await queryOne(
      `insert into media (file_url, file_name, file_type, file_size, alt_text, usage) values ($1,$2,$3,$4,$5,$6) returning *`,
      [b.file_url, b.file_name ?? '', b.file_type ?? '', Number(b.file_size) || 0, b.alt_text ?? '', b.usage ?? '']
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'media_uploaded', targetType: 'media', targetId: row.id, description: `Uploaded media "${row.file_name || row.file_url}"` });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/media/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from media where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Media item not found');
    await query('delete from media where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'media_deleted', targetType: 'media', targetId: req.params.id, description: `Deleted media "${existing.file_name || existing.file_url}"` });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------- announcements ----

router.get('/announcements', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await query('select * from announcements order by created_at desc');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/announcements', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.title?.trim()) throw new HttpError(400, 'Title is required');
    const row = await queryOne(
      `insert into announcements (title, message, image_url, cta_label, cta_url, start_at, end_at, is_active) values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
      [b.title.trim(), b.message ?? '', b.image_url ?? '', b.cta_label ?? '', b.cta_url ?? '', b.start_at || null, b.end_at || null, b.is_active === undefined ? true : Boolean(b.is_active)]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'announcement_created', targetType: 'announcement', targetId: row.id, description: `Created announcement "${row.title}"` });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/announcements/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from announcements where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Announcement not found');
    const row = await queryOne(
      `update announcements set title = $2, message = $3, image_url = $4, cta_label = $5, cta_url = $6, start_at = $7, end_at = $8, is_active = $9 where id = $1 returning *`,
      [req.params.id, b.title ?? existing.title, b.message ?? existing.message, b.image_url ?? existing.image_url, b.cta_label ?? existing.cta_label, b.cta_url ?? existing.cta_url, b.start_at ?? existing.start_at, b.end_at ?? existing.end_at, b.is_active === undefined ? existing.is_active : Boolean(b.is_active)]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'announcement_updated', targetType: 'announcement', targetId: req.params.id, description: `Updated announcement "${row.title}"` });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/announcements/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from announcements where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Announcement not found');
    await query('delete from announcements where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'announcement_deleted', targetType: 'announcement', targetId: req.params.id, description: `Deleted announcement "${existing.title}"` });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;