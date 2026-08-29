import { Router } from 'express';
import { query, queryOne } from '../db';
import { HttpError, slugify, writeAudit, paginate } from '../utils';
import { requireAdmin, requireAuth } from '../auth';

const router = Router();

function productSelect(): string {
  return `select p.*,
    ${subqueryCategory()},
    ${subquerySpecs()},
    ${subqueryImages()}
    from products p`;
}

function subqueryCategory(): string {
  return `(select row_to_json(c) from product_categories c where c.id = p.category_id) as category`;
}

function subquerySpecs(): string {
  return `(select coalesce(jsonb_agg(jsonb_build_object('id', ps.id, 'key', ps.key, 'value', ps.value, 'sort_order', ps.sort_order) order by ps.sort_order), '[]'::jsonb)
          from product_specifications ps where ps.product_id = p.id) as specifications`;
}

function subqueryImages(): string {
  return `(select coalesce(jsonb_agg(jsonb_build_object('id', pi.id, 'url', pi.url, 'alt_text', pi.alt_text, 'sort_order', pi.sort_order) order by pi.sort_order), '[]'::jsonb)
          from product_images pi where pi.product_id = p.id) as images`;
}

// ------------------------------------------------------------ public ------

router.get('/categories', async (_req, res, next) => {
  try {
    const rows = await query(
      `select c.*, (select count(*)::int from products p where p.category_id = c.id and p.is_active = true) as product_count
       from product_categories c where c.is_active = true order by c.sort_order, c.name`
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
      `select c.*, (select count(*)::int from products p where p.category_id = c.id) as product_count
       from product_categories c order by c.sort_order, c.name`
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
    const existing = await queryOne('select id from product_categories where slug = $1', [slug]);
    if (existing) throw new HttpError(409, 'A category with this name already exists');
    const row = await queryOne(
      `insert into product_categories (name, slug, description, image_url, sort_order, is_active)
       values ($1,$2,$3,$4,$5,$6) returning *`,
      [b.name.trim(), slug, b.description ?? '', b.image_url ?? '', Number(b.sort_order) || 0, b.is_active !== false]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'category_created', targetType: 'product_category', targetId: row.id, description: `Created product category "${row.name}"`, newValue: row });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put('/categories/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from product_categories where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Category not found');
    const row = await queryOne(
      `update product_categories set
         name = coalesce(nullif($2, ''), name),
         slug = coalesce(nullif($3, ''), slug),
         description = coalesce($4, description),
         image_url = coalesce($5, image_url),
         sort_order = coalesce($6, sort_order),
         is_active = coalesce($7, is_active)
       where id = $1 returning *`,
      [req.params.id, b.name?.trim() ?? '', slugify(b.name ?? existing.name), b.description ?? existing.description, b.image_url ?? existing.image_url, b.sort_order != null ? Number(b.sort_order) : existing.sort_order, b.is_active != null ? Boolean(b.is_active) : existing.is_active]
    );
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'category_updated', targetType: 'product_category', targetId: row.id, description: `Updated product category "${row.name}"`, oldValue: existing, newValue: row });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/categories/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from product_categories where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Category not found');
    await query('delete from product_categories where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'category_deleted', targetType: 'product_category', targetId: req.params.id, description: `Deleted product category "${existing.name}"`, oldValue: existing });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { search, category, brand, min_price, max_price, availability, sort, featured, page, per_page } = req.query;
    const { limit, offset } = paginate(Number(page), Number(per_page));

    const where: string[] = [];
    const params: unknown[] = [];

    const push = (clause: string, value?: unknown) => {
      if (value !== undefined) params.push(value);
      where.push(clause.replace(/\?/g, `$${params.length}`));
    };

    push('p.is_active = true');
    if (featured === 'true') push('p.is_featured = true');
    if (category) {
      params.push(String(category));
      where.push(`(p.category_id::text = $${params.length} or exists (
        select 1 from product_categories c where c.id = p.category_id and c.slug = $${params.length}
      ))`);
    }
    if (brand) {
      params.push(String(brand));
      where.push(`lower(p.brand) = lower($${params.length})`);
    }
    if (search) {
      params.push(`%${String(search).toLowerCase()}%`);
      where.push(`(lower(p.name) like $${params.length} or lower(p.sku) like $${params.length} or lower(p.brand) like $${params.length} or lower(p.short_description) like $${params.length})`);
    }
    if (min_price) {
      push('coalesce(p.sale_price, p.price) >= ?', Number(min_price));
    }
    if (max_price) {
      push('coalesce(p.sale_price, p.price) <= ?', Number(max_price));
    }
    if (availability === 'in') push('p.stock > 0');
    if (availability === 'out') push('p.stock <= 0');

    const orderBy = {
      newest: 'p.created_at desc',
      'price-asc': 'coalesce(p.sale_price, p.price) asc',
      'price-desc': 'coalesce(p.sale_price, p.price) desc',
      featured: 'p.is_featured desc, p.created_at desc',
      name: 'p.name asc',
    }[String(sort || 'newest')] ?? 'p.created_at desc';

    const countRows = await query<{ count: string }>(
      `select count(*)::int as count from products p where ${where.join(' and ')}`,
      params
    );
    // The count query above doesn't need product select joins; params align.
    const total = Number(countRows[0]?.count ?? 0);

    const rows = await query(
      `${productSelect()} where ${where.join(' and ')} order by ${orderBy} limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, limit, offset]
    );
    res.json({ products: rows, total, page: Math.max(1, Number(page) || 1), per_page: limit });
  } catch (err) {
    next(err);
  }
});

router.get('/brands', async (_req, res, next) => {
  try {
    const rows = await query(
      `select distinct brand from products where is_active = true and brand <> '' order by brand`
    );
    res.json(rows.map((r) => r.brand));
  } catch (err) {
    next(err);
  }
});

router.get('/featured', async (_req, res, next) => {
  try {
    const rows = await query(
      `${productSelect()} where p.is_active = true and p.is_featured = true order by p.created_at desc limit 8`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------- admin ------

router.get('/all/admin', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { search, category, page = 1, per_page = 100 } = req.query;
    const where: string[] = ['true'];
    const params: unknown[] = [];
    if (search) {
      params.push(`%${String(search).toLowerCase()}%`);
      where.push(`(lower(p.name) like $${params.length} or lower(p.sku) like $${params.length})`);
    }
    if (category && category !== 'all') {
      params.push(String(category));
      where.push(`(p.category_id::text = $${params.length} or exists (select 1 from product_categories c where c.id = p.category_id and c.slug = $${params.length}))`);
    }
    const { limit, offset } = paginate(Number(page), Number(per_page));
    const rows = await query(
      `${productSelect()} where ${where.join(' and ')} order by p.created_at desc limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, limit, offset]
    );
    const count = await query<{ count: string }>(
      `select count(*)::int as count from products p where ${where.join(' and ')}`,
      params
    );
    res.json({ products: rows, total: Number(count[0]?.count ?? 0) });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const product = await queryOne(
      `${productSelect()} where p.slug = $1 and p.is_active = true`,
      [req.params.slug]
    );
    if (!product) throw new HttpError(404, 'Product not found');

    const related = await query(
      `${productSelect()} where p.is_active = true and p.id <> $1
       and (p.category_id = (select category_id from products where id = $1) or p.is_featured = true)
       order by p.created_at desc limit 4`,
      [product.id]
    );
    res.json({ product, related });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.name?.trim()) throw new HttpError(400, 'Product name is required');
    const price = Number(b.price);
    if (!Number.isFinite(price) || price < 0) throw new HttpError(400, 'A valid price is required');

    const slug = slugify(b.name);
    const existing = await queryOne('select id from products where slug = $1', [slug]);
    if (existing) throw new HttpError(409, 'A product with this name already exists');

    const product = await queryOne(
      `insert into products (
         name, sku, slug, category_id, brand, short_description, description,
         price, sale_price, cost_price, stock, low_stock_threshold, image_url,
         is_featured, is_active, warranty_info, rating, meta_title, meta_description
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       returning *`,
      [
        b.name.trim(), b.sku ?? '', slug, b.category_id ?? null, b.brand ?? '',
        b.short_description ?? '', b.description ?? '', price,
        b.sale_price === '' || b.sale_price == null ? null : Number(b.sale_price),
        Number(b.cost_price) || 0, Number(b.stock) || 0, Number(b.low_stock_threshold) || 5,
        b.image_url ?? '', Boolean(b.is_featured), Boolean(b.is_active),
        b.warranty_info ?? '', Number(b.rating) || 0, b.meta_title ?? '', b.meta_description ?? '',
      ]
    );
    if (b.specifications?.length) {
      for (const [i, spec] of (b.specifications as { key: string; value: string }[]).entries()) {
        if (spec.key?.trim() && spec.value?.trim()) {
          await query(
            'insert into product_specifications (product_id, key, value, sort_order) values ($1,$2,$3,$4)',
            [product.id, spec.key.trim(), spec.value.trim(), i]
          );
        }
      }
    }
    if (b.images?.length) {
      for (const [i, url] of (b.images as string[]).entries()) {
        if (url) await query('insert into product_images (product_id, url, sort_order) values ($1,$2,$3)', [product.id, url, i]);
      }
    }
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'product_created', targetType: 'product', targetId: product.id, description: `Created product "${product.name}"`, newValue: product });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const existing = await queryOne('select * from products where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Product not found');

    const product = await queryOne(
      `update products set
         name = $2, sku = $3, slug = $4, category_id = $5, brand = $6,
         short_description = $7, description = $8, price = $9, sale_price = $10,
         cost_price = $11, stock = $12, low_stock_threshold = $13, image_url = $14,
         is_featured = $15, is_active = $16, warranty_info = $17, rating = $18,
         meta_title = $19, meta_description = $20
       where id = $1 returning *`,
      [
        req.params.id, b.name?.trim() ?? existing.name, b.sku ?? existing.sku,
        slugify(b.name ?? existing.name), b.category_id ?? existing.category_id,
        b.brand ?? existing.brand, b.short_description ?? existing.short_description,
        b.description ?? existing.description, Number(b.price) ?? existing.price,
        b.sale_price === '' || b.sale_price == null ? null : Number(b.sale_price),
        Number(b.cost_price) ?? existing.cost_price, Number(b.stock) ?? existing.stock,
        Number(b.low_stock_threshold) ?? existing.low_stock_threshold,
        b.image_url ?? existing.image_url, Boolean(b.is_featured ?? existing.is_featured),
        Boolean(b.is_active ?? existing.is_active), b.warranty_info ?? existing.warranty_info,
        Number(b.rating) ?? existing.rating, b.meta_title ?? existing.meta_title,
        b.meta_description ?? existing.meta_description,
      ]
    );

    if (Array.isArray(b.specifications)) {
      await query('delete from product_specifications where product_id = $1', [req.params.id]);
      for (const [i, spec] of (b.specifications as { key: string; value: string }[]).entries()) {
        if (spec.key?.trim() && spec.value?.trim()) {
          await query('insert into product_specifications (product_id, key, value, sort_order) values ($1,$2,$3,$4)', [req.params.id, spec.key.trim(), spec.value.trim(), i]);
        }
      }
    }
    if (Array.isArray(b.images)) {
      await query('delete from product_images where product_id = $1', [req.params.id]);
      for (const [i, url] of (b.images as string[]).entries()) {
        if (url) await query('insert into product_images (product_id, url, sort_order) values ($1,$2,$3)', [req.params.id, url, i]);
      }
    }

    // Stock change audit
    if (Number(existing.stock) !== Number(product.stock)) {
      await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'stock_updated', targetType: 'product', targetId: product.id, description: `Changed stock for "${product.name}" from ${existing.stock} to ${product.stock}`, oldValue: { stock: existing.stock }, newValue: { stock: product.stock } });
    }
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'product_updated', targetType: 'product', targetId: product.id, description: `Updated product "${product.name}"`, oldValue: existing, newValue: product });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from products where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Product not found');
    await query('delete from products where id = $1', [req.params.id]);
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'product_deleted', targetType: 'product', targetId: req.params.id, description: `Deleted product "${existing.name}"`, oldValue: existing });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;