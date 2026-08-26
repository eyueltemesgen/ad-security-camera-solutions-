import { assertSupabase, supabase } from '../lib/supabase';
import { LOW_STOCK_THRESHOLD, type Order, type Profile, type Product } from '../types';

export interface CustomerSummary {
  profile: Profile;
  orderCount: number;
  totalSpent: number;
}

/**
 * Customers with aggregated order stats. Passwords are never exposed —
 * only the profiles table is queried.
 */
export async function fetchCustomers(): Promise<CustomerSummary[]> {
  assertSupabase();
  const [profilesRes, ordersRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }),
    supabase.from('orders').select('user_id, total, status'),
  ]);
  if (profilesRes.error) throw new Error(profilesRes.error.message);
  if (ordersRes.error) throw new Error(ordersRes.error.message);

  const orders = (ordersRes.data ?? []) as Pick<Order, 'user_id' | 'total' | 'status'>[];
  const byUser = new Map<string, { count: number; spent: number }>();
  for (const order of orders) {
    const entry = byUser.get(order.user_id) ?? { count: 0, spent: 0 };
    entry.count += 1;
    if (order.status !== 'cancelled') entry.spent += Number(order.total);
    byUser.set(order.user_id, entry);
  }

  return ((profilesRes.data as Profile[] | null) ?? []).map((profile) => ({
    profile,
    orderCount: byUser.get(profile.id)?.count ?? 0,
    totalSpent: byUser.get(profile.id)?.spent ?? 0,
  }));
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  customers: number;
  todayOrders: number;
  todayRevenue: number;
  newCustomersWeek: number;
  lowStockCount: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
  salesByDay: { date: string; total: number }[];
  topProducts: { name: string; quantity: number }[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  assertSupabase();

  const [productsRes, ordersRes, itemsRes, customersRes] = await Promise.all([
    supabase.from('products').select('id, stock, is_active'),
    supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('order_items').select('product_name, quantity').limit(2000),
    supabase.from('profiles').select('id, created_at').eq('role', 'customer'),
  ]);

  if (productsRes.error) throw new Error(productsRes.error.message);
  if (ordersRes.error) throw new Error(ordersRes.error.message);
  if (itemsRes.error) throw new Error(itemsRes.error.message);
  if (customersRes.error) throw new Error(customersRes.error.message);

  const products = (productsRes.data as Pick<Product, 'id' | 'stock' | 'is_active'>[] | null) ?? [];
  const orders = (ordersRes.data as Order[] | null) ?? [];
  const customers = (customersRes.data as Pick<Profile, 'id' | 'created_at'>[] | null) ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const revenue = activeOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const todayOrders = orders.filter((o) => new Date(o.created_at) >= today);
  const todayRevenue = todayOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total), 0);

  // last 14 days sales series
  const salesByDay: { date: string; total: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = day.toISOString().slice(0, 10);
    const total = activeOrders
      .filter((o) => o.created_at.slice(0, 10) === key)
      .reduce((sum, o) => sum + Number(o.total), 0);
    salesByDay.push({
      date: day.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      total,
    });
  }

  const itemAgg = new Map<string, number>();
  for (const item of (itemsRes.data as { product_name: string; quantity: number }[] | null) ?? []) {
    itemAgg.set(item.product_name, (itemAgg.get(item.product_name) ?? 0) + Number(item.quantity));
  }
  const topProducts = [...itemAgg.entries()]
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // low stock detail (full product rows)
  const { data: lowStock } = await supabase
    .from('products')
    .select('*, category:product_categories(*)')
    .lte('stock', LOW_STOCK_THRESHOLD)
    .order('stock', { ascending: true })
    .limit(8);

  return {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    revenue,
    customers: customers.length,
    todayOrders: todayOrders.length,
    todayRevenue,
    newCustomersWeek: customers.filter((c) => new Date(c.created_at) >= weekAgo).length,
    lowStockCount: products.filter((p) => p.is_active && p.stock <= LOW_STOCK_THRESHOLD).length,
    recentOrders: orders.slice(0, 5),
    lowStockProducts: (lowStock as Product[] | null) ?? [],
    salesByDay,
    topProducts,
  };
}
