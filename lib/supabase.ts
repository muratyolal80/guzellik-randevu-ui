import { createBrowserClient } from '@supabase/ssr';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing in lib/supabase.ts');
}

// createBrowserClient automatically detects and uses the cookies set by your API
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);