import { Router } from 'express';
import { query, queryOne } from '../db';
import { HttpError } from '../utils';
import { requireAuth } from '../auth';

const router = Router();

// -------------------------------------------------- persistent cart ------

/** Merge guest-local cart into the server cart for the authenticated user. */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    // Ensure a cart exists
    const cart = await queryOne(`insert into carts (user_id) values ($1) on conflict (user_id) do update set updated_at = now() returning id, user_id`, [req.user!.id]);
    if (!cart) throw new HttpError(500, 'Failed to create cart');

    const rows = await query(
      `select ci.id as cart_item_id, ci.quantity, ci.created_at as added_at,
              p.*, 
              (select row_to_json(c) from product_categories c where c.id = p.category_id) as category
       from cart_items ci
       join products p on p.id = ci.product_id
       where ci.cart_id = $1
       order by ci.created_at`,
      [cart.id]
    );
    res.json({ cart_id: cart.id, items: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/items', requireAuth, async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body ?? {};
    if (!product_id) throw new HttpError(400, 'Product is required');
    const qty = Number(quantity) || 1;
    if (qty < 1) throw new HttpError(400, 'Invalid quantity');

    const product = await queryOne('select id, stock, is_active from products where id = $1', [product_id]);
    if (!product || !product.is_active) throw new HttpError(404, 'Product not found');

    const cart = await queryOne(`insert into carts (user_id) values ($1) on conflict (user_id) do update set updated_at = now() returning id`, [req.user!.id]);

    const existing = await queryOne('select id, quantity from cart_items where cart_id = $1 and product_id = $2', [cart.id, product_id]);
    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > Number(product.stock)) throw new HttpError(400, `Only ${product.stock} in stock`);
      await query('update cart_items set quantity = $1 where id = $2', [newQty, existing.id]);
      res.json({ ok: true, quantity: newQty });
    } else {
      if (qty > Number(product.stock)) throw new HttpError(400, `Only ${product.stock} in stock`);
      await query('insert into cart_items (cart_id, product_id, quantity) values ($1, $2, $3)', [cart.id, product_id, qty]);
      res.status(201).json({ ok: true, quantity: qty });
    }
  } catch (err) {
    next(err);
  }
});

router.patch('/items/:id', requireAuth, async (req, res, next) => {
  try {
    const { quantity } = req.body ?? {};
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) throw new HttpError(400, 'Invalid quantity');

    const item = await queryOne(
      `select ci.id, ci.cart_id, p.stock from cart_items ci
       join carts c on c.id = ci.cart_id
       join products p on p.id = ci.product_id
       where ci.id = $1 and c.user_id = $2`,
      [req.params.id, req.user!.id]
    );
    if (!item) throw new HttpError(404, 'Cart item not found');
    if (qty > Number(item.stock)) throw new HttpError(400, `Only ${item.stock} in stock`);
    await query('update cart_items set quantity = $1 where id = $2', [qty, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/items/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await queryOne(
      `select ci.id from cart_items ci join carts c on c.id = ci.cart_id
       where ci.id = $1 and c.user_id = $2`,
      [req.params.id, req.user!.id]
    );
    if (!item) throw new HttpError(404, 'Cart item not found');
    await query('delete from cart_items where id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/', requireAuth, async (req, res, next) => {
  try {
    await query(
      `delete from cart_items where cart_id in (select id from carts where user_id = $1)`,
      [req.user!.id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;