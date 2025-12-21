import { createClient } from '@supabase/supabase-js';

// NOTE: In a real Next.js app, use process.env.NEXT_PUBLIC_SUPABASE_URL
// We provide a fallback placeholder to prevent the app from crashing if keys are missing.
// The service layer (services/db.ts) handles the error by falling back to mock data.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);