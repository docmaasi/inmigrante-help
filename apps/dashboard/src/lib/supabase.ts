import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Re-export Database type for use in hooks
export type { Database };

// Type alias for typed Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const cookieDomain = import.meta.env.VITE_COOKIE_DOMAIN;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables'
  );
}

const cookieStorage = {
  getItem: (key: string): string | null => {
    const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  },
  setItem: (key: string, value: string): void => {
    const domain = cookieDomain ? `; domain=${cookieDomain}` : '';
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/${domain}; max-age=31536000; SameSite=Lax`;
  },
  removeItem: (key: string): void => {
    const domain = cookieDomain ? `; domain=${cookieDomain}` : '';
    document.cookie = `${key}=; path=/${domain}; max-age=0`;
  },
};

export const supabase: TypedSupabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorage,
    storageKey: 'sb-auth-token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
