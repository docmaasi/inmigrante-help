import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const cookieDomain = import.meta.env.VITE_COOKIE_DOMAIN;

const cookieStorage = {
  getItem: (key) => {
    const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  },
  setItem: (key, value) => {
    const domain = cookieDomain ? `; domain=${cookieDomain}` : '';
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/${domain}; max-age=31536000; SameSite=Lax`;
  },
  removeItem: (key) => {
    const domain = cookieDomain ? `; domain=${cookieDomain}` : '';
    document.cookie = `${key}=; path=/${domain}; max-age=0`;
  },
};

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: cookieStorage,
        storageKey: 'sb-auth-token',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
