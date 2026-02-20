import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Re-export Database type for use in hooks
export type { Database };

// Type alias for typed Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables'
  );
}

// Use localStorage (the Supabase default) for session persistence.
// Cookie storage was causing logout-on-refresh because JWT tokens
// exceed the browser's ~4KB cookie size limit.
export const supabase: TypedSupabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
