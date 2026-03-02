import { createBrowserClient } from '@supabase/ssr';

// Fallback to dummy keys so Next.js local/static prerendering can bypass build errors
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key_for_build';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing in lib/supabase.ts');
}

// createBrowserClient automatically detects and uses the cookies set by your API
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);