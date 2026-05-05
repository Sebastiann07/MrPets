import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const IS_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const SAFE_URL = IS_CONFIGURED ? SUPABASE_URL : 'http://localhost';
const SAFE_KEY = IS_CONFIGURED ? SUPABASE_ANON_KEY : 'missing-supabase-anon-key';

export const supabase = createClient(SAFE_URL, SAFE_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

export function assertSupabaseConfigured() {
  if (!IS_CONFIGURED) {
    throw new Error('Supabase no configurado. Revisa EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
}

export function isSupabaseConfigured() {
  return IS_CONFIGURED;
}
