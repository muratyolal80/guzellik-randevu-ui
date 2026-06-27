import { createBrowserClient } from '@supabase/ssr';

/**
 * Sprint D (R4) — Slot lock servisi.
 *
 * Müşteri booking step 3'te slot seçince acquire_slot_lock RPC çağrılır.
 * Lock alınamazsa (başkası tutmuş veya appointment var) null döner.
 * 5 dakika TTL — adım 4'te randevu oluşturulunca lock silinir.
 */

export interface SlotLockResult {
  reservationId: string | null;
  reason?: 'taken' | 'error';
}

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function acquireSlotLock(params: {
  salonId: string;
  staffId: string | null;
  serviceId: string | null;
  slotStart: Date;
  slotEnd: Date;
  userId?: string | null;
  sessionId?: string | null;
}): Promise<SlotLockResult> {
  try {
    const supabase = getClient();
    const { data, error } = await supabase.rpc('acquire_slot_lock', {
      p_salon_id: params.salonId,
      p_staff_id: params.staffId,
      p_service_id: params.serviceId,
      p_slot_start: params.slotStart.toISOString(),
      p_slot_end: params.slotEnd.toISOString(),
      p_user_id: params.userId ?? null,
      p_session_id: params.sessionId ?? null,
    });

    if (error) {
      console.error('[slot-lock] acquire RPC error:', error.message);
      return { reservationId: null, reason: 'error' };
    }

    if (!data) return { reservationId: null, reason: 'taken' };
    return { reservationId: data as string };
  } catch (err: any) {
    console.error('[slot-lock] acquire threw:', err?.message || err);
    return { reservationId: null, reason: 'error' };
  }
}

export async function releaseSlotLock(reservationId: string): Promise<boolean> {
  try {
    const supabase = getClient();
    const { error } = await supabase
      .from('slot_reservations')
      .delete()
      .eq('id', reservationId);
    if (error) {
      console.error('[slot-lock] release error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[slot-lock] release threw:', err?.message || err);
    return false;
  }
}
