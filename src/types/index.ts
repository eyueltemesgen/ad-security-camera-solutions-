export type Role = 'customer' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'telebirr' | 'cbe_birr' | 'chapa' | 'cash_on_delivery';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type ServiceStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string | null;
  description: string;
  price: number;
  stock: number;
  rating: number;
  sku: string | null;
  category_id: string | null;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string | null;
  customer_name: string;
  phone: string;
  email: string;
  service: string;
  preferred_date: string | null;
  location: string;
  description: string;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  created_at: string;
}

export interface SiteSettings {
  id: boolean;
  company_name: string;
  phone: string;
  secondary_phone: string;
  email: string;
  address: string;
  currency: string;
  updated_at: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export const SERVICE_STATUSES: ServiceStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'telebirr', label: 'Telebirr' },
  { value: 'cbe_birr', label: 'CBE Birr' },
  { value: 'chapa', label: 'Chapa' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
];

export const LOW_STOCK_THRESHOLD = 5;
export const TAX_RATE = 0.15;
