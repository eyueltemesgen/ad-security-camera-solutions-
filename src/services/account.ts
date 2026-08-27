import { assertSupabase, supabase } from '../lib/supabase';
import type { Address } from '../types';

export async function fetchAddresses(userId: string): Promise<Address[]> {
  assertSupabase();
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Address[] | null) ?? [];
}

export interface AddressInput {
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  is_default: boolean;
}

export async function createAddress(userId: string, input: AddressInput): Promise<void> {
  assertSupabase();
  // if setting as default, clear existing defaults first
  if (input.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
  }
  const { error } = await supabase.from('addresses').insert({ user_id: userId, ...input });
  if (error) throw new Error(error.message);
}

export async function updateAddress(userId: string, id: string, input: AddressInput): Promise<void> {
  assertSupabase();
  if (input.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
  }
  const { error } = await supabase.from('addresses').update(input).eq('id', id).eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function deleteAddress(userId: string, id: string): Promise<void> {
  assertSupabase();
  const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', userId);
  if (error) throw new Error(error.message);
}