import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Robust URL validation to prevent build-time crashes
const getValidUrl = (url?: string) => {
  if (!url || url === 'undefined') return 'https://placeholder.supabase.co';
  try {
    new URL(url);
    return url;
  } catch {
    return 'https://placeholder.supabase.co';
  }
};

const finalUrl = getValidUrl(supabaseUrl);
const finalKey = supabaseAnonKey || 'placeholder';

export const supabase = createClient(finalUrl, finalKey);

