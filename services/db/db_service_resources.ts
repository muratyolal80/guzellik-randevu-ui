import { supabase as defaultSupabase } from "@/lib/supabase";
import { type SupabaseClient } from "@supabase/supabase-js";

/**
 * Sprint D (R2) — Hizmet ↔ Kaynak junction
 * salon_service_resources tablosu (New-19 migration).
 *
 * Bir hizmetin tamamlanması için hangi salon kaynaklarına kaç adet ihtiyaç var?
 * Örnek: "Saç Boya" hizmeti → 1 koltuk + 1 boya istasyonu.
 */

export interface ServiceResourceLink {
  id?: string;
  service_id: string;
  resource_id: string;
  qty: number;
}

export const ServiceResourceService = {
  /**
   * Bir hizmete bağlı tüm kaynak gereksinimleri.
   */
  async getLinksByService(
    serviceId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<ServiceResourceLink[]> {
    const { data, error } = await supabase
      .from("salon_service_resources")
      .select("id, service_id, resource_id, qty")
      .eq("service_id", serviceId);

    if (error) throw error;
    return (data || []) as ServiceResourceLink[];
  },

  /**
   * Hizmet için kaynak gereksinim listesini topluca güncelle.
   * Mevcut tüm link'ler silinir, yenisi eklenir (idempotent).
   */
  async replaceLinks(
    serviceId: string,
    links: Array<{ resource_id: string; qty: number }>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error: delErr } = await supabase
      .from("salon_service_resources")
      .delete()
      .eq("service_id", serviceId);
    if (delErr) throw delErr;

    if (links.length === 0) return;

    const rows = links.map((l) => ({
      service_id: serviceId,
      resource_id: l.resource_id,
      qty: Math.max(1, l.qty),
    }));

    const { error: insErr } = await supabase
      .from("salon_service_resources")
      .insert(rows);
    if (insErr) throw insErr;
  },

  /**
   * RPC: Belirli bir slot için kaynak yeterli mi?
   * (New-19 RPC check_resource_availability)
   */
  async checkAvailability(
    salonId: string,
    serviceId: string,
    slotStart: Date,
    slotEnd: Date,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc("check_resource_availability", {
      p_salon_id: salonId,
      p_service_id: serviceId,
      p_slot_start: slotStart.toISOString(),
      p_slot_end: slotEnd.toISOString(),
    });
    if (error) {
      console.error("[ServiceResource] availability RPC error:", error.message);
      return true; // Hata durumunda engelleme (defansif)
    }
    return Boolean(data);
  },
};
