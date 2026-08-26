import { assertSupabase, supabase } from '../lib/supabase';
import type { Product } from '../types';

/** Returns the set of product IDs the user has wishlisted. */
export async function fetchWishlistIds(userId: string): Promise<Set<string>> {
  assertSupabase();
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row: { product_id: string }) => row.product_id));
}

export async function fetchWishlistProducts(userId: string): Promise<Product[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('product:products(*, category:product_categories(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data as unknown as { product: Product | null }[] | null) ?? [])
    .map((row) => row.product)
    .filter((p): p is Product => Boolean(p));
}

export async function addToWishlist(userId: string, productId: string): Promise<boolean> {
  assertSupabase();
  const { error } = await supabase
    .from('wishlist_items')
    .insert({ user_id: userId, product_id: productId });
  if (error) {
    if (error.code === '23505') return false; // already wishlisted
    throw new Error(error.message);
  }
  return true;
}

export async function removeFromWishlist(userId: string, productId: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw new Error(error.message);
}
