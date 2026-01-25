/**
 * Audit Service
 * Provides methods for manual audit logging from application code
 */

import { supabase } from '@/lib/supabase';

export interface AuditLogEntry {
    user_id?: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'EXPORT';
    table_name: string;
    record_id: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    description?: string;
}

export const AuditService = {
    /**
     * Log an audit entry
     */
    async log(entry: AuditLogEntry): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase.rpc('log_audit', {
                p_user_id: entry.user_id || user?.id || null,
                p_action: entry.action,
                p_table_name: entry.table_name,
                p_record_id: entry.record_id,
                p_old_values: entry.old_values || null,
                p_new_values: entry.new_values || null,
                p_ip_address: entry.ip_address || null,
                p_user_agent: entry.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : null)
            });

            if (error) {
                console.error('[AuditService] Failed to log audit:', error);
            }
        } catch (err) {
            console.error('[AuditService] Error logging audit:', err);
        }
    },

    /**
     * Get audit logs for a specific record
     */
    async getRecordHistory(tableName: string, recordId: string) {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('table_name', tableName)
            .eq('record_id', recordId)
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
        userId?: string
    ) {
        await this.log({
            user_id: userId,
            action: 'UPDATE',
            table_name: 'appointments',
            record_id: appointmentId,
            old_values: { status: oldStatus },
            new_values: { status: newStatus }
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
        userId?: string
    ) {
        await this.log({
            user_id: userId,
            action: 'UPDATE',
            table_name: tableName,
            record_id: recordId,
            old_values: { price: oldPrice },
            new_values: { price: newPrice }
        });
    }
};
