import { Router } from 'express';
import { query, queryOne, transaction } from '../db';
import { HttpError, writeAudit, notify, notifyAdmins } from '../utils';
import { requireAuth, requireAdmin } from '../auth';

const router = Router();

const TAX_RATE = 0.15;
const PAYMENT_METHODS = ['telebirr', 'cbe_birr', 'chapa', 'cash_on_delivery'];
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];

function itemsSelect(): string {
  return `(select coalesce(jsonb_agg(jsonb_build_object('id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name, 'sku', oi.sku, 'image_url', oi.image_url, 'quantity', oi.quantity, 'unit_price', oi.unit_price, 'subtotal', oi.subtotal) order by oi.created_at), '[]'::jsonb)
          from order_items oi where oi.order_id = o.id) as items`;
}

const ORDER_SELECT = (where: string, orderBy: string) => `select o.*, ${itemsSelect()} from orders o ${where} order by ${orderBy}`;

// -------------------------------------------------------------- checkout ---

/**
 * Place an order. All totals are computed server-side and stock is decremented
 * atomically inside a transaction so the browser can never inflate prices.
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!b.customer_name?.trim()) throw new HttpError(400, 'Full name is required');
    if (!b.customer_email?.trim()) throw new HttpError(400, 'Email is required');
    if (!Array.isArray(b.items) || b.items.length === 0) throw new HttpError(400, 'Your cart is empty');
    if (b.payment_method && !PAYMENT_METHODS.includes(b.payment_method)) throw new HttpError(400, 'Invalid payment method');

    const order = await transaction(async (client) => {
      // Lock products in stable order and compute totals server-side.
      const ids = [...new Set(b.items.map((i: any) => i.product_id))].sort();
      const rows = await client.query(
        `select * from products where id = any($1::uuid[]) for update`,
        [ids]
      );
      const productById = new Map(rows.rows.map((r: any) => [r.id, r]));
      if (productById.size !== ids.length) throw new HttpError(400, 'Some products are no longer available');

      let subtotal = 0;
      const lines: { product: any; quantity: number }[] = [];
      const seen = new Set<string>();
      for (const item of b.items) {
        const qty = Number(item.quantity);
        if (!Number.isInteger(qty) || qty < 1) throw new HttpError(400, 'Invalid quantity');
        const product = productById.get(item.product_id);
        if (!product || !product.is_active) throw new HttpError(400, 'A product in your cart is no longer available');
        if (seen.has(item.product_id)) throw new HttpError(400, 'Duplicate product in cart');
        seen.add(item.product_id);
        if (product.stock < qty) {
          throw new HttpError(400, `Insufficient stock for "${product.name}" (only ${product.stock} available)`);
        }
        const unitPrice = Number(product.sale_price ?? product.price);
        lines.push({ product, quantity: qty });
        subtotal += unitPrice * qty;
      }

      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      const inserted = await client.query(
        `insert into orders (user_id, customer_name, customer_email, customer_phone, delivery_address, delivery_city, delivery_notes, status, payment_method, payment_status, subtotal, tax, total)
         values ($1,$2,$3,$4,$5,$6,$7,'pending',$8,'pending',$9,$10,$11) returning *`,
        [
          req.user!.id, b.customer_name.trim(), b.customer_email.trim(), b.customer_phone ?? '',
          b.delivery_address ?? '', b.delivery_city ?? '', b.delivery_notes ?? '',
          b.payment_method ?? 'cash_on_delivery', subtotal, tax, total,
        ]
      );
      const orderRow = inserted.rows[0];

      for (const line of lines) {
        await client.query(
          `insert into order_items (order_id, product_id, product_name, sku, image_url, quantity, unit_price, subtotal)
           values ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [orderRow.id, line.product.id, line.product.name, line.product.sku, line.product.image_url, line.quantity, line.product.sale_price ?? line.product.price, (line.product.sale_price ?? line.product.price) * line.quantity]
        );
        await client.query('update products set stock = stock - $1 where id = $2', [line.quantity, line.product.id]);
        // Notify if now low stock
        const updated = (await client.query('select stock, low_stock_threshold from products where id = $1', [line.product.id])).rows[0];
        if (Number(updated.stock) <= Number(updated.low_stock_threshold)) {
          await client.query(
            `insert into notifications (user_id, title, message, type) values (null, 'Low stock alert', $1, 'stock')`,
            [`"${line.product.name}" is at ${updated.stock} units. Consider restocking.`]
          );
        }
      }

      // Clear the customer's server-side cart
      const cart = await client.query('select id from carts where user_id = $1', [req.user!.id]);
      if (cart.rows[0]) {
        await client.query('delete from cart_items where cart_id = $1', [cart.rows[0].id]);
      }

      await client.query(
        `insert into notifications (user_id, title, message, type) values ($1, $2, $3, 'order_placed')`,
        [req.user!.id, `Order ${orderRow.order_number} placed`, `Your order was received and is pending confirmation. Total: ${total.toLocaleString()} ETB.`]
      );
      await client.query(
        `insert into notifications (user_id, title, message, type) values (null, 'New order received', $1, 'new_order')`,
        [`${orderRow.customer_name} placed order ${orderRow.order_number} worth ${total.toLocaleString()} ETB.`]
      );
      return orderRow;
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------- public ------

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const rows = await query(
      ORDER_SELECT('where o.user_id = $1', 'o.created_at desc'),
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const order = await queryOne(
      ORDER_SELECT('where o.id = $1 and (o.user_id = $2 or $3)', 'o.created_at desc'),
      [req.params.id, req.user!.id, req.user!.role === 'admin']
    );
    if (!order) throw new HttpError(404, 'Order not found');
    res.json(order);
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
      where.push(`o.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${String(search).toLowerCase()}%`);
      where.push(`(lower(o.order_number) like $${params.length} or lower(o.customer_name) like $${params.length} or lower(o.customer_email) like $${params.length})`);
    }
    const { limit, offset } = paginate2(Number(page), Number(per_page));
    const rows = await query(
      ORDER_SELECT(`where ${where.join(' and ')}`, 'o.created_at desc') + ` limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, limit, offset]
    );
    const count = await query<{ count: string }>(
      `select count(*)::int as count from orders o where ${where.join(' and ')}`,
      params
    );
    res.json({ orders: rows, total: Number(count[0]?.count ?? 0) });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { status, admin_notes } = req.body ?? {};
    if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'Invalid order status');
    const existing = await queryOne('select * from orders where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Order not found');

    const updated = await queryOne(
      `update orders set status = $2, admin_notes = coalesce(nullif($3, ''), admin_notes) where id = $1 returning *`,
      [req.params.id, status, admin_notes ?? '']
    );

    await notify({
      userId: existing.user_id,
      title: `Order ${existing.order_number} updated`,
      message: `Your order status is now: ${status.replace(/_/g, ' ')}.`,
      type: 'order_status',
    });
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'order_status_changed', targetType: 'order', targetId: req.params.id, description: `Changed order ${existing.order_number} status to ${status}`, oldValue: { status: existing.status }, newValue: { status } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/payment', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { payment_status } = req.body ?? {};
    if (!['pending', 'paid', 'failed'].includes(payment_status)) throw new HttpError(400, 'Invalid payment status');
    const existing = await queryOne('select * from orders where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Order not found');
    const updated = await queryOne('update orders set payment_status = $2 where id = $1 returning *', [req.params.id, payment_status]);
    await notify({ userId: existing.user_id, title: `Payment ${payment_status}`, message: `Payment status for order ${existing.order_number} is now ${payment_status}.`, type: 'payment' });
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'payment_status_changed', targetType: 'order', targetId: req.params.id, description: `Changed payment for order ${existing.order_number} to ${payment_status}`, oldValue: { payment_status: existing.payment_status }, newValue: { payment_status } });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('select * from orders where id = $1', [req.params.id]);
    if (!existing) throw new HttpError(404, 'Order not found');
    await query('delete from orders where id = $1', [req.params.id]);
    // Restore stock for cancelled/deleted orders
    const items = await query('select product_id, quantity from order_items where order_id = $1', [req.params.id]);
    for (const item of items) {
      if (item.product_id) {
        await query('update products set stock = stock + $1 where id = $2', [item.quantity, item.product_id]);
      }
    }
    await writeAudit({ adminId: req.user!.id, adminName: req.user!.full_name, action: 'order_deleted', targetType: 'order', targetId: req.params.id, description: `Deleted order ${existing.order_number}`, oldValue: existing });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

function paginate2(page: number, perPage: number): { limit: number; offset: number } {
  const limit = Math.min(Math.max(Number(perPage) || 50, 1), 200);
  const offset = Math.max(Number(page) || 1, 1);
  return { limit, offset: (offset - 1) * limit };
}

export default router;