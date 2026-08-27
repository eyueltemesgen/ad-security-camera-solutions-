import { assertSupabase, supabase } from '../lib/supabase';
import type {
  AppNotification,
  ContactMessage,
  ServiceRequest,
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
  location: string;
  description: string;
  userId: string | null;
}

export async function createServiceRequest(input: ServiceRequestInput): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('service_requests').insert({
    user_id: input.userId,
    customer_name: input.customerName,
    phone: input.phone,
    email: input.email,
    service: input.service,
    preferred_date: input.preferredDate,
    location: input.location,
    description: input.description,
  });
  if (error) throw new Error(error.message);
}

export async function fetchMyServiceRequests(userId: string): Promise<ServiceRequest[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ServiceRequest[] | null) ?? [];
}

export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
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

// ------------------------------------------------------------------ contact

export async function createContactMessage(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('contact_messages').insert({
    name: input.name,
    email: input.email,
    phone: input.phone,
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

export async function saveSiteSettings(settings: Omit<SiteSettings, 'id' | 'updated_at'>): Promise<void> {
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
  });
  if (error) throw new Error(error.message);
}
