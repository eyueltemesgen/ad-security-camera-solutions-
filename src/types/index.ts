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

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const SERVICE_STATUSES: { value: ServiceStatus; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'telebirr', label: 'Telebirr' },
  { value: 'cbe_birr', label: 'CBE Birr' },
  { value: 'chapa', label: 'Chapa' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
];

export const TAX_RATE = 0.15;

export const statusLabel = (v: string, list: { value: string; label: string }[]): string =>
  list.find((s) => s.value === v)?.label ?? v;

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

// ------------------------------------------------------------------ users --

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  is_default: boolean;
}

// ---------------------------------------------------------------- catalog --

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  product_count?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string;
  sort_order: number;
}

export interface Specification {
  id: string;
  key: string;
  value: string;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  category_id: string | null;
  category: Category | null;
  brand: string;
  short_description: string;
  description: string;
  price: number;
  sale_price: number | null;
  cost_price: number;
  stock: number;
  low_stock_threshold: number;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  warranty_info: string;
  rating: number;
  meta_title: string;
  meta_description: string;
  specifications: Specification[];
  images: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
}

// -------------------------------------------------------------- services --

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  service_count?: number;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  category: ServiceCategory | null;
  icon: string;
  image_url: string;
  short_description: string;
  description: string;
  features: { label: string }[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------- orders --

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  image_url: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_notes: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  tax: number;
  total: number;
  admin_notes: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CartLine {
  cart_item_id: string;
  quantity: number;
  added_at: string;
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string;
  stock: number;
  slug: string;
  category: Category | null;
}

// -------------------------------------------------------- service reqs ----

export interface ServiceRequestFile {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

export interface ServiceRequest {
  id: string;
  request_number: string;
  user_id: string | null;
  customer_name: string;
  phone: string;
  email: string;
  service_id: string | null;
  service_name: string;
  location: string;
  property_type: string;
  preferred_date: string | null;
  preferred_time: string;
  device_count: number | null;
  current_system: string;
  description: string;
  notes: string;
  status: ServiceStatus;
  admin_notes: string;
  assigned_technician: string;
  scheduled_date: string | null;
  completed_at: string | null;
  files: ServiceRequestFile[];
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------- content ----

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  image_url: string;
  rating: number;
  content: string;
  is_active: boolean;
  sort_order: number;
}

export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  description: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface MediaItem {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  alt_text: string;
  usage: string;
  created_at: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
  sort_order: number;
  is_active: boolean;
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

export interface Announcement {
  id: string;
  title: string;
  message: string;
  image_url: string;
  cta_label: string;
  cta_url: string;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'archived';
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

export interface AuditLog {
  id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string;
  description: string;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
}

// ------------------------------------------------------------------ CMS ----

export interface HomepageSection {
  id: string;
  slug: string;
  title: string;
  content: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: Record<string, unknown>;
  meta_title: string;
  meta_description: string;
  is_active: boolean;
  published_at: string | null;
}

export type CmsSettings = Record<string, Record<string, unknown>>;

export interface PublicSiteData {
  settings: CmsSettings;
  homepage: Pick<HomepageSection, 'slug' | 'title' | 'content' | 'is_active' | 'sort_order'>[];
  pages: Pick<PageContent, 'slug' | 'title' | 'subtitle' | 'content' | 'meta_title' | 'meta_description'>[];
  navigation: Pick<NavigationItem, 'label' | 'url' | 'sort_order'>[];
  footer: Pick<FooterSection, 'title' | 'links' | 'sort_order'>[];
  social: Pick<SocialLink, 'platform' | 'username' | 'url' | 'icon'>[];
  testimonials: Pick<Testimonial, 'id' | 'name' | 'company' | 'image_url' | 'rating' | 'content'>[];
  faqs: Pick<Faq, 'id' | 'category' | 'question' | 'answer'>[];
  gallery: Pick<GalleryItem, 'id' | 'image_url' | 'title' | 'description' | 'category'>[];
  announcements: Pick<Announcement, 'id' | 'title' | 'message' | 'image_url' | 'cta_label' | 'cta_url'>[];
}

// ------------------------------------------------------------- customer ----

export interface CustomerSummary {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  order_count: number;
  total_spent: number;
  service_count: number;
}

export interface DashboardAnalytics {
  totals: {
    customers: number;
    newCustomersWeek: number;
    orders: number;
    pendingOrders: number;
    completedOrders: number;
    revenue: number;
    products: number;
    lowStock: number;
    serviceRequests: number;
    pendingServiceRequests: number;
    contactMessages: number;
    unreadMessages: number;
    revenueToday: number;
    revenueWeek: number;
  };
  salesByDay: { date: string; total: string; orders: number }[];
  customerGrowth: { date: string; count: number }[];
  serviceByType: { name: string; requests: number }[];
  topProducts: { name: string; quantity: number }[];
  recentOrders: { id: string; order_number: string; customer_name: string; total: string; status: OrderStatus; created_at: string }[];
}