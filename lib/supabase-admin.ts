import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not set');
}

// Delay initialization to runtime if the key isn't provided during build
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'dummy_key_for_build', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
