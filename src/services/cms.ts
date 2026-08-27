import { assertSupabase, supabase } from '../lib/supabase';
import type {
  Announcement,
  AuditLog,
  FAQ,
  FooterSection,
  GalleryItem,
  HomepageSection,
  MediaItem,
  NavItem,
  Page,
  Service,
  ServiceCategory,
  ServiceRequest,
  SiteSettings,
  SocialLink,
  Testimonial,
} from '../types';

// ============================================================================
// Generic helpers
// ============================================================================

function rows<T>(data: T[] | null, error: { message: string } | null): T[] {
  if (error) throw new Error(error.message);
  return data ?? [];
}

interface RowResult<T> {
  data: T | null;
  error: { message: string } | null;
}

async function singleRow<T>(build: PromiseLike<RowResult<T>>): Promise<T | null> {
  const { data, error } = await build;
  if (error) throw new Error(error.message);
  return data ?? null;
}

export function logAudit(
  action: string,
  target: string,
  targetId: string,
  description: string,
  email: string,
  before?: unknown,
  after?: unknown
): void {
  // best-effort audit write (fire and forget)
  supabase
    .from('audit_logs')
    .insert({ action, target, target_id: targetId, description, admin_email: email, before, after })
    .then();
}

// ============================================================================
// Services CMS
// ============================================================================

export async function fetchServices(activeOnly = false): Promise<Service[]> {
  assertSupabase();
  let q = supabase.from('services').select('*').order('sort_order', { ascending: true });
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  return rows<Service>(data, error);
}

export async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  assertSupabase();
  return singleRow(supabase.from('services').select('*').eq('slug', slug).maybeSingle());
}

export type ServiceInput = Partial<
  Pick<Service, 'name' | 'slug' | 'description' | 'icon' | 'features' | 'image_url' | 'featured' | 'is_active' | 'sort_order'>
>;

export async function createService(input: ServiceInput): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('services').insert(input);
  if (error) throw new Error(error.message);
}

export async function updateService(id: string, input: ServiceInput): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('services').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteService(id: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// Service categories
// ============================================================================

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  assertSupabase();
  const { data, error } = await supabase.from('service_categories').select('*').order('sort_order');
  return rows<ServiceCategory>(data, error);
}

export async function createServiceCategory(input: Partial<ServiceCategory>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('service_categories').insert(input);
  if (error) throw new Error(error.message);
}

export async function updateServiceCategory(id: string, input: Partial<ServiceCategory>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('service_categories').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteServiceCategory(id: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('service_categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// Gallery
// ============================================================================

export async function fetchGallery(activeOnly = false): Promise<GalleryItem[]> {
  assertSupabase();
  let q = supabase.from('gallery').select('*').order('sort_order', { ascending: true });
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  return rows<GalleryItem>(data, error);
}

export async function createGalleryItem(input: Partial<GalleryItem>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('gallery').insert(input);
  if (error) throw new Error(error.message);
}

export async function updateGalleryItem(id: string, input: Partial<GalleryItem>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('gallery').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteGalleryItem(id: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// Testimonials
// ============================================================================

export async function fetchTestimonials(activeOnly = false): Promise<Testimonial[]> {
  assertSupabase();
  let q = supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  return rows<Testimonial>(data, error);
}

export async function createTestimonial(input: Partial<Testimonial>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('testimonials').insert(input);
  if (error) throw new Error(error.message);
}

export async function updateTestimonial(id: string, input: Partial<Testimonial>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('testimonials').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteTestimonial(id: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// FAQs
// ============================================================================

export async function fetchFAQs(activeOnly = false): Promise<FAQ[]> {
  assertSupabase();
  let q = supabase.from('faqs').select('*').order('sort_order', { ascending: true });
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  return rows<FAQ>(data, error);
}

export async function createFAQ(input: Partial<FAQ>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('faqs').insert(input);
  if (error) throw new Error(error.message);
}

export async function updateFAQ(id: string, input: Partial<FAQ>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('faqs').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteFAQ(id: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('faqs').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// Navigation
// ============================================================================

export async function fetchNavigation(activeOnly = false): Promise<NavItem[]> {
  assertSupabase();
  let q = supabase.from('navigation_items').select('*').order('sort_order', { ascending: true });
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  return rows<NavItem>(data, error);
}

export async function createNavItem(input: Partial<NavItem>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('navigation_items').insert(input);
  if (error) throw new Error(error.message);
}

export async function updateNavItem(id: string, input: Partial<NavItem>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('navigation_items').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteNavItem(id: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('navigation_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// Social links
// ============================================================================

export async function fetchSocialLinks(activeOnly = false): Promise<SocialLink[]> {
  assertSupabase();
  let q = supabase.from('social_links').select('*').order('sort_order', { ascending: true });
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  return rows<SocialLink>(data, error);
}

export async function createSocialLink(input: Partial<SocialLink>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('social_links').insert(input);
  if (error) throw new Error(error.message);
}

export async function updateSocialLink(id: string, input: Partial<SocialLink>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('social_links').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteSocialLink(id: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('social_links').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// Footer sections
// ============================================================================

export async function fetchFooterSections(): Promise<FooterSection[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('footer_sections')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return rows<FooterSection>(data, error);
}

export async function saveFooterSections(sections: { title: string; links: { label: string; url: string }[] }[]): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('footer_sections').upsert(
    sections.map((s, i) => ({ title: s.title, links: s.links, sort_order: i + 1, is_active: true }))
  );
  if (error) throw new Error(error.message);
}

// ============================================================================
// Media library
// ============================================================================

export async function fetchMedia(): Promise<MediaItem[]> {
  assertSupabase();
  const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
  return rows<MediaItem>(data, error);
}

export async function uploadMedia(file: File, altText = ''): Promise<{ record: MediaItem }> {
  assertSupabase();
  const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Only PNG, JPG, WebP or GIF images are allowed.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be smaller than 5MB.');
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `library/${crypto.randomUUID()}.${ext}`;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  const { error: upErr } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (upErr) throw new Error(upErr.message);
  const { error, data: record } = await supabase
    .from('media')
    .insert({
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      url: data.publicUrl,
      path,
      alt_text: altText,
      usage: 'library',
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { record: record as MediaItem };
}

export async function deleteMedia(id: string, path: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('media').delete().eq('id', id);
  if (error) throw new Error(error.message);
  if (path) {
    await supabase.storage.from('media').remove([path]);
  }
}

// ============================================================================
// Announcements
// ============================================================================

export async function fetchAnnouncements(activeOnly = false): Promise<Announcement[]> {
  assertSupabase();
  let q = supabase.from('announcements').select('*').order('created_at', { ascending: false });
  if (activeOnly) q = q.eq('is_active', true);
  const { data, error } = await q;
  return rows<Announcement>(data, error);
}

export async function fetchActiveAnnouncement(): Promise<Announcement | null> {
  assertSupabase();
  const list = await fetchAnnouncements(true);
  const now = new Date();
  const active = list.find((a) => {
    if (a.start_date && new Date(a.start_date) > now) return false;
    if (a.end_date && new Date(a.end_date) < now) return false;
    return true;
  });
  return active ?? null;
}

export async function createAnnouncement(input: Partial<Announcement>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('announcements').insert(input);
  if (error) throw new Error(error.message);
}

export async function updateAnnouncement(id: string, input: Partial<Announcement>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('announcements').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// Pages
// ============================================================================

export async function fetchPageBySlug(slug: string): Promise<Page | null> {
  assertSupabase();
  return singleRow(supabase.from('pages').select('*').eq('slug', slug).maybeSingle());
}

export async function fetchPages(): Promise<Page[]> {
  assertSupabase();
  const { data, error } = await supabase.from('pages').select('*').order('sort_order', { ascending: true });
  return rows<Page>(data, error);
}

export async function updatePage(id: string, input: Partial<Page>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('pages').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// Homepage sections
// ============================================================================

export async function fetchHomepageSections(): Promise<HomepageSection[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('homepage_sections')
    .select('*')
    .order('sort_order', { ascending: true });
  return rows<HomepageSection>(data, error);
}

export async function updateHomepageSection(id: string, input: Partial<HomepageSection>): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('homepage_sections').update(input).eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================================================
// Contact messages (subject added)
// ============================================================================

export async function updateContactStatus(id: string, status: 'new' | 'read' | 'archived'): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export interface ContactMessageInput {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export async function submitContactMessage(input: ContactMessageInput): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('contact_messages').insert({
    name: input.name,
    email: input.email,
    phone: input.phone,
    subject: input.subject,
    message: input.message,
  });
  if (error) throw new Error(error.message);
}

// ============================================================================
// Audit logs
// ============================================================================

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  assertSupabase();
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(300);
  return rows<AuditLog>(data, error);
}