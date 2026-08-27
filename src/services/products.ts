import { assertSupabase, supabase } from '../lib/supabase';
import { slugify } from '../lib/utils';
import type { Category, Product } from '../types';

const PRODUCT_SELECT = '*, category:product_categories(*)';

function assertRows<T>(data: T[] | null, error: { message: string } | null): T[] {
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchCategories(): Promise<Category[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name');
  return assertRows<Category>(data, error);
}

export async function fetchActiveProducts(): Promise<Product[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  return assertRows<Product>(data, error);
}

export async function fetchAllProducts(): Promise<Product[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false });
  return assertRows<Product>(data, error);
}

export interface ProductInput {
  name: string;
  description: string;
  short_description: string;
  price: number;
  sale_price: number | null;
  stock: number;
  rating: number;
  sku: string;
  brand: string;
  category_id: string | null;
  image_url: string;
  is_active: boolean;
  featured: boolean;
  warranty: string;
  resolution: string;
  night_vision_m: number | null;
  specifications: { name: string; value: string }[];
  features: string[];
}

function toInsert(input: ProductInput) {
  return {
    name: input.name,
    slug: slugify(input.name),
    description: input.description,
    short_description: input.short_description || '',
    price: input.price,
    sale_price: input.sale_price ?? null,
    stock: input.stock,
    rating: input.rating,
    sku: input.sku || null,
    brand: input.brand || '',
    category_id: input.category_id,
    image_url: input.image_url,
    is_active: input.is_active,
    featured: input.featured,
    warranty: input.warranty || '',
    resolution: input.resolution || null,
    night_vision_m: input.night_vision_m ?? null,
    specifications: input.specifications || [],
    features: input.features || [],
  };
}

export async function createProduct(input: ProductInput): Promise<Product> {
  assertSupabase();
  const { data, error } = await supabase
    .from('products')
    .insert(toInsert(input))
    .select(PRODUCT_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data as Product;
}

export async function updateProduct(id: string, input: ProductInput): Promise<void> {
  assertSupabase();
  const { error } = await supabase
    .from('products')
    .update(toInsert(input))
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function toggleProductFeature(id: string, featured: boolean): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('products').update({ featured }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateStock(id: string, stock: number): Promise<void> {
  assertSupabase();
  const { error } = await supabase
    .from('products')
    .update({ stock: Math.max(0, Math.round(stock)) })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// --------------------------------------------------------------- images ----

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

/** Validate and upload a product image; returns the public URL + storage path. */
export async function uploadProductImage(file: File): Promise<{ url: string; path: string }> {
  assertSupabase();

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only PNG, JPG, WebP or GIF images are allowed.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image must be smaller than 2MB.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Best-effort cleanup when a product image is replaced or removed. */
export async function deleteProductImageByUrl(url: string): Promise<void> {
  if (!url) return;
  const marker = '/product-images/';
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await supabase.storage.from('product-images').remove([path]);
}
