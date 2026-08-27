export type Role = 'customer' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'telebirr' | 'cbe_birr' | 'chapa' | 'cash_on_delivery';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type ServiceStatus =
  | 'submitted'
  | 'under_review'
  | 'contacted'
  | 'scheduled'
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
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string | null;
  description: string;
  short_description: string;
  price: number;
  sale_price: number | null;
  stock: number;
  rating: number;
  sku: string | null;
  brand: string;
  category_id: string | null;
  image_url: string;
  is_active: boolean;
  featured: boolean;
  warranty: string;
  resolution: string | null;
  night_vision_m: number | null;
  specifications: SpecRow[];
  features: string[];
  created_at: string;
  updated_at: string;
  category?: Category | null;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
}

export interface SpecRow {
  name: string;
  value: string;
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
  city: string;
  delivery_notes: string;
  admin_notes: string;
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
  preferred_time: string;
  location: string;
  property_type: string;
  num_devices: number | null;
  current_system: string;
  description: string;
  notes: string;
  admin_notes: string;
  assigned_staff: string;
  scheduled_date: string | null;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
  files?: ServiceRequestFile[];
}

export interface ServiceRequestFile {
  id: string;
  request_id: string;
  url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  kind: 'image' | 'document';
  created_at: string;
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
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  is_default: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  features: string[];
  image_url: string;
  featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  company: string;
  image_url: string;
  rating: number;
  content: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NavItem {
  id: string;
  title: string;
  url: string;
  is_external: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  username: string;
  url: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

export interface FooterSection {
  id: string;
  title: string;
  links: { label: string; url: string }[];
  is_active: boolean;
  sort_order: number;
}

export interface MediaItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  url: string;
  path: string;
  alt_text: string;
  usage: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  image_url: string;
  cta_label: string;
  cta_url: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  admin_email: string;
  action: string;
  target: string;
  target_id: string;
  before: unknown;
  after: unknown;
  description: string;
  created_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  seo_title: string;
  seo_description: string;
  status: 'draft' | 'published';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HomepageSection {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  content: unknown;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface SiteSettings {
  id: boolean;
  company_name: string;
  phone: string;
  secondary_phone: string;
  email: string;
  website: string;
  address: string;
  currency: string;
  logo_url: string;
  favicon_url: string;
  tagline: string;
  description: string;
  working_hours: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
  tiktok: string;
  telegram: string;
  instagram: string;
  linkedin: string;
  primary_color: string;
  accent_color: string;
  seo_title: string;
  seo_description: string;
  seo_image: string;
  footer_text: string;
  updated_at: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled',
];

export const SERVICE_STATUSES: ServiceStatus[] = [
  'submitted',
  'under_review',
  'contacted',
  'scheduled',
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
