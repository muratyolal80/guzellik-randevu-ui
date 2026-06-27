/**
 * Audit Service
 * Provides methods for manual audit logging from application code.
 *
 * Tablo şeması (audit_logs):
 *   salon_id NOT NULL, user_id, action, resource_type, resource_id, changes (jsonb)
 *
 * Eski API geriye dönük çağrı uyumluluğu için korunur — table_name → resource_type,
 * record_id → resource_id, old_values+new_values → changes JSON.
 */

import { supabase } from '@/lib/supabase';

export interface AuditLogEntry {
    salon_id?: string;            // şema NOT NULL ama bilmediğimiz durumda sessiz atla
    user_id?: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'EXPORT';
    table_name: string;           // → resource_type'a map'lenir
    record_id: string;            // → resource_id'a map'lenir
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    description?: string;
}

export const AuditService = {
    /**
     * Log an audit entry. Hata oluşursa sessizce warn'a düşer — audit critical değil,
     * UI akışını engellememeli.
     */
    async log(entry: AuditLogEntry): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = entry.user_id || user?.id;

            // Audit kaydı user_id zorunlu (RLS policy: WITH CHECK user_id = auth.uid())
            if (!userId) {
                console.warn('[AuditService] skipped: no user_id (anonymous action)');
                return;
            }

            // salon_id şu an NOT NULL — yoksa boş UUID (00000000...) ile platform-level kayıt
            const salonId = entry.salon_id || '00000000-0000-0000-0000-000000000000';

            const changes =
                entry.old_values || entry.new_values
                    ? {
                          old: entry.old_values || null,
                          new: entry.new_values || null,
                          description: entry.description,
                      }
                    : entry.description
                      ? { description: entry.description }
                      : null;

            const { error } = await supabase.from('audit_logs').insert({
                salon_id: salonId,
                user_id: userId,
                action: entry.action,
                resource_type: entry.table_name,
                resource_id: entry.record_id,
                changes,
                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            });

            if (error) {
                // Boş {} veya RLS hatasını sessiz warn'a indir — audit non-critical
                const msg = error.message || error.code || 'unknown';
                console.warn('[AuditService] insert failed (silent):', msg, error);
            }
        } catch (err: any) {
            console.warn('[AuditService] threw (silent):', err?.message || err);
        }
    },

    /**
     * Get audit logs for a specific record
     */
    async getRecordHistory(tableName: string, recordId: string) {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('resource_type', tableName)
            .eq('resource_id', recordId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get recent audit logs (admin only)
     */
    async getRecentLogs(limit: number = 100) {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    /**
     * Get audit logs for a specific user
     */
    async getUserActivity(userId: string, limit: number = 50) {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    /**
     * Helper: Log appointment status change
     */
    async logAppointmentStatusChange(
        appointmentId: string,
        oldStatus: string,
        newStatus: string,
        userId?: string,
        salonId?: string,
    ) {
        await this.log({
            salon_id: salonId,
            user_id: userId,
            action: 'UPDATE',
            table_name: 'appointments',
            record_id: appointmentId,
            old_values: { status: oldStatus },
            new_values: { status: newStatus },
        });
    },

    /**
     * Helper: Log price change
     */
    async logPriceChange(
        tableName: string,
        recordId: string,
        oldPrice: number,
        newPrice: number,
        userId?: string,
        salonId?: string,
    ) {
        await this.log({
            salon_id: salonId,
            user_id: userId,
            action: 'UPDATE',
            table_name: tableName,
            record_id: recordId,
            old_values: { price: oldPrice },
            new_values: { price: newPrice },
        });
    },
};
