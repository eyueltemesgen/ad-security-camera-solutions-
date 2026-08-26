import { assertSupabase, supabase } from '../lib/supabase';
import type { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus } from '../types';

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  items: { product_id: string; quantity: number }[];
}

/**
 * Checkout goes through the place_order RPC: totals are computed server-side,
 * stock is verified and decremented atomically, notifications are created.
 */
export async function placeOrder(input: CheckoutInput): Promise<Order> {
  assertSupabase();
  if (input.items.length === 0) throw new Error('Your cart is empty.');

  const { data, error } = await supabase.rpc('place_order', {
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail,
    p_customer_phone: input.customerPhone,
    p_delivery_address: input.deliveryAddress,
    p_payment_method: input.paymentMethod,
    p_items: input.items,
  });
  if (error) throw new Error(error.message);
  return data as Order;
}

export async function fetchMyOrders(userId: string): Promise<Order[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Order[] | null) ?? [];
}

export async function fetchOrders(): Promise<Order[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false })
    .limit(250);
  if (error) throw new Error(error.message);
  return (data as Order[] | null) ?? [];
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<void> {
  assertSupabase();
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: paymentStatus })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export type { OrderItem, OrderStatus };
