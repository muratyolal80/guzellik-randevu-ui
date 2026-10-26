import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from '../supabase-admin';

/** Signed-in user of an API request (cookie session), or null. */
export async function getRequestUser(request: NextRequest): Promise<User | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Owner, active staff/member of the salon, or admin — mirrors DB can_act_for_salon() (New-34). */
export async function canActForSalon(userId: string, salonId: string): Promise<boolean> {
  if (await canManageSalon(userId, salonId)) return true;
  const [{ data: staff }, { data: member }] = await Promise.all([
    supabaseAdmin.from('staff').select('id').eq('salon_id', salonId).eq('user_id', userId).eq('is_active', true).limit(1),
    supabaseAdmin.from('salon_memberships').select('id').eq('salon_id', salonId).eq('user_id', userId).eq('is_active', true).limit(1),
  ]);
  return !!(staff?.length || member?.length);
}

/** True when the user owns the salon or is SUPER_ADMIN/ADMIN. Server-side (service role). */
export async function canManageSalon(userId: string, salonId: string): Promise<boolean> {
  const [{ data: salon }, { data: profile }] = await Promise.all([
    supabaseAdmin.from('salons').select('owner_id').eq('id', salonId).maybeSingle(),
    supabaseAdmin.from('profiles').select('role').eq('id', userId).maybeSingle(),
  ]);
  if (!salon) return false;
  return salon.owner_id === userId || profile?.role === 'SUPER_ADMIN' || profile?.role === 'ADMIN';
}
