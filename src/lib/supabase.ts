import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  url && anonKey && /^https?:\/\//.test(url) && !url.includes('your-project')
);

function createSafeClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    // Inert client — never leaves the browser; all callers are gated by
    // isSupabaseConfigured and surface a friendly setup notice instead.
    return createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
  }
  return createClient(url!, anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = createSafeClient();

export function assertSupabase(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
}
