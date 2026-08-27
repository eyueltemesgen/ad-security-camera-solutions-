import { assertSupabase, supabase } from '../lib/supabase';
import type {
  AppNotification,
  ContactMessage,
  ServiceRequest,
  ServiceRequestFile,
  ServiceStatus,
  SiteSettings,
} from '../types';

// -------------------------------------------------------- service requests

export interface ServiceRequestInput {
  customerName: string;
  phone: string;
  email: string;
  service: string;
  preferredDate: string | null;
  preferredTime: string;
  location: string;
  propertyType: string;
  numDevices: number | null;
  currentSystem: string;
  description: string;
  notes: string;
  userId: string | null;
}

export async function createServiceRequest(input: ServiceRequestInput): Promise<string> {
  assertSupabase();
  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      user_id: input.userId,
      customer_name: input.customerName,
      phone: input.phone,
      email: input.email,
      service: input.service,
      preferred_date: input.preferredDate,
      preferred_time: input.preferredTime,
      location: input.location,
      property_type: input.propertyType,
      num_devices: input.numDevices || null,
      current_system: input.currentSystem,
      description: input.description,
      notes: input.notes,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

export async function fetchMyServiceRequests(userId: string): Promise<ServiceRequest[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('service_requests')
    .select('*, files:service_request_files(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ServiceRequest[] | null) ?? [];
}

export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('service_requests')
    .select('*, files:service_request_files(*)')
    .order('created_at', { ascending: false })
    .limit(250);
  if (error) throw new Error(error.message);
  return (data as ServiceRequest[] | null) ?? [];
}

export async function updateServiceRequestStatus(
  id: string,
  status: ServiceStatus
): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('service_requests').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateServiceRequestNotes(
  id: string,
  notes: string,
  assignedStaff: string,
  scheduledDate: string | null
): Promise<void> {
  assertSupabase();
  const { error } = await supabase
    .from('service_requests')
    .update({ admin_notes: notes, assigned_staff: assignedStaff, scheduled_date: scheduledDate })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function attachServiceRequestFile(
  requestId: string,
  file: { url: string; file_name: string; file_type: string; file_size: number; kind: 'image' | 'document' }
): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('service_request_files').insert({
    request_id: requestId,
    url: file.url,
    file_name: file.file_name,
    file_type: file.file_type,
    file_size: file.file_size,
    kind: file.kind,
  });
  if (error) throw new Error(error.message);
}

export async function fetchServiceRequestFiles(requestId: string): Promise<ServiceRequestFile[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('service_request_files')
    .select('*')
    .eq('request_id', requestId);
  if (error) throw new Error(error.message);
  return (data as ServiceRequestFile[] | null) ?? [];
}

// ------------------------------------------------------------------ contact

export async function createContactMessage(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<void> {
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

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(250);
  if (error) throw new Error(error.message);
  return (data as ContactMessage[] | null) ?? [];
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessage['status']
): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

// ------------------------------------------------------------- notifications

export async function fetchNotifications(opts: {
  userId?: string;
  admin: boolean;
}): Promise<AppNotification[]> {
  assertSupabase();
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(60);
  if (!opts.admin) {
    query = query.eq('user_id', opts.userId ?? '');
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as AppNotification[] | null) ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(userId: string, admin: boolean): Promise<void> {
  assertSupabase();
  if (admin) return; // shared admin feed shouldn't be cleared by one admin
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw new Error(error.message);
}

// ----------------------------------------------------------------- settings

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  assertSupabase();
  const { data, error } = await supabase.from('site_settings').select('*').maybeSingle();
  if (error) throw new Error(error.message);
  return (data as SiteSettings | null) ?? null;
}

export type SiteSettingsInput = Omit<SiteSettings, 'id' | 'updated_at'>;

export async function saveSiteSettings(settings: SiteSettingsInput): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('site_settings').upsert({
    id: true,
    company_name: settings.company_name,
    phone: settings.phone,
    secondary_phone: settings.secondary_phone,
    email: settings.email,
    website: settings.website,
    address: settings.address,
    currency: settings.currency,
    logo_url: settings.logo_url,
    favicon_url: settings.favicon_url,
    tagline: settings.tagline,
    description: settings.description,
    working_hours: settings.working_hours,
    facebook: settings.facebook,
    youtube: settings.youtube,
    whatsapp: settings.whatsapp,
    tiktok: settings.tiktok,
    telegram: settings.telegram,
    instagram: settings.instagram,
    linkedin: settings.linkedin,
    primary_color: settings.primary_color,
    accent_color: settings.accent_color,
    seo_title: settings.seo_title,
    seo_description: settings.seo_description,
    seo_image: settings.seo_image,
    footer_text: settings.footer_text,
  });
  if (error) throw new Error(error.message);
}
