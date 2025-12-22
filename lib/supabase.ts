import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
// For Next.js, use NEXT_PUBLIC_ prefix for client-side variables
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Supabase client may not work properly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
