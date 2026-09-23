import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vohtlwiowantxuevcubq.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaHRsd2lvd2FudHh1ZXZjdWJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MDY3OTMsImV4cCI6MjEwNTQ4Mjc5M30.dKtFRurcGZAt1iAdlD6JOJM0cSwPVO3TogtqBAv4EOs';

// A valid JWT has three dot-separated base64 segments
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (!supabaseUrl.startsWith('http')) return false;
  const parts = supabaseAnonKey.trim().split('.');
  return parts.length === 3 && parts[2].length > 0;
};

let client = null;

if (isSupabaseConfigured()) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[Supabase] Successfully connected to project:', supabaseUrl);
  } catch (err) {
    console.warn('[Supabase] Initialization error:', err);
    client = null;
  }
} else {
  console.warn(
    '[Supabase] Incomplete anon key detected. Set VITE_SUPABASE_ANON_KEY in .env to the complete JWT key from your Supabase dashboard (Project Settings > API).'
  );
}

export const supabase = client;
