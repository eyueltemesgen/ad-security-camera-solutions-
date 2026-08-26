# AD Security Camera Solutions

Professional security storefront + admin dashboard for **AD Security Camera Solutions** (Ethiopia): CCTV, access control, time attendance, video intercom, networking & IT solutions.

Rebuilt from scratch with **React/Vite + Supabase + Vercel**. Original design references are in `docs/index.html` and `docs/admin.html`.

## Architecture

```
GitHub  →  Vercel  →  React/Vite SPA  →  Supabase
                                          ├─ PostgreSQL (+ RLS)
                                          ├─ Auth
                                          ├─ Storage
                                          └─ Realtime
```

## Quick Start

```bash
npm install
cp .env.example .env   # fill in your Supabase URL + anon key
npm run dev
```

Build: `npm run build` • Preview: `npm run preview`

## Supabase Setup

**Fastest path (no CLI needed):**

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** in the Supabase dashboard → **New query**
3. Paste the entire contents of `supabase/setup/all_migrations.sql` and click **Run**
   (this single file creates all tables, RLS policies, storage buckets, seed data, and refreshes the API schema cache)
4. Create an **admin user**: register through the app (confirm the email), then run in SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = '<you@email>';
   ```
5. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (see `.env.example`) and in Vercel env vars

**Errors like "Could not find the table 'public.orders' in the schema cache"?** That means step 3 was skipped (or run on the wrong project). If you already ran the SQL and still see it, run `notify pgrst, 'reload schema';` in the SQL Editor to force a cache refresh.

**Alternative — individual migration files** (for Supabase CLI or manual tracking), in order:
- `20260826000001_initial_schema.sql` — tables, indexes, `place_order` RPC, triggers
- `20260826000002_rls_policies.sql` — Row Level Security for every table
- `20260826000003_storage.sql` — buckets (`product-images`, `avatars`, `company-assets`) + policies
- `20260826000004_seed.sql` — starter categories + site settings
- `20260826000005_realtime.sql` — publication for notifications/orders

## Vercel Deployment

- `vercel.json` rewrites every path to `/index.html` (SPA-safe refresh + direct links)
- Framework preset: **Vite** (build `npm run build`, output `dist`) — autodetected
- Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in Vercel → Settings → Environment Variables

## Database

- `profiles` — extends `auth.users`, roles `customer|admin`, auto-created on signup
- `product_categories` + seeded categories: CCTV, Time Attendance, Video Intercom, Network
- `products` — stock is the single inventory source of truth
- `orders`, `order_items` — `order_number` auto-generated (`AD-######`), financials & items
- `wishlist_items` — authenticated user tied
- `service_requests` — bookings from the Services form
- `notifications` — per-user or NULL = admin broadcast
- `contact_messages` — contact form submissions
- `site_settings` — business contact info, singleton row

Checkout is a server-side transaction via the `place_order` RPC (validates, computes 15% VAT + totals, decrements stock atomically, notifies, doesn't trust browser totals).

## Storage

Images upload to Supabase Storage; only URLs live in DB rows (no base64). Buckets: `product-images`, `avatars`, `company-assets`.

## Admin Panel (`/admin`)

Tabs: Dashboard, Products, Orders, Services, Customers, Inventory, Settings. Staff-only through `profiles.role = 'admin'` enforced by RLS — not just UI. Customers trying `/admin` see Access Denied.

## Env Vars

| Name | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key (safe for frontend) |

Never commit the Supabase **service-role** key anywhere — only the anon key is used by the frontend.

## Auth Troubleshooting (login/register failing)

New Supabase projects have **email confirmation ON**, so `register` creates an *unconfirmed* user and login then fails with “Email not confirmed”. Pick **one** of these:

**Option A — quick test mode (disable confirmation):**

1. Supabase dashboard → **Authentication → Sign in / up** → toggle off **Confirm email**
2. Keep production `Email Templates` the way they are; users can then register and log in immediately.

**Option B — keep confirmation on (recommended for production):**

1. Supabase dashboard → **Authentication → URL Configuration**
2. Set **Site URL** to your deployed domain, e.g. `https://your-app.vercel.app`
3. Add **Redirect URLs**: `https://your-app.vercel.app/**` and `http://localhost:5173/**`
4. Users register → click the emailed link → get redirected back and log in.

If login still fails after disabling confirmation, also check:
- Your users were *created before* you turned confirmation off — delete them in **Authentication → Users** and register again.
- Wrong/anonymous env values — the app shows a config notice banner at the top when env vars are missing/placeholder.

## Verification (run at build time)

- `npm run build` — `tsc --noEmit` + Vite bundle passes
- SQL migrations were validated against real Postgres (PGlite) — schema, RLS, RPC totals, triggers all verified
- Playwright E2E smoke — hero, services/about/contact, cart drawer, auth modal, `/admin` login render (all passing)
