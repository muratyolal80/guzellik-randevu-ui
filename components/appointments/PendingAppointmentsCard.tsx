'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, AlertCircle, Loader2 } from 'lucide-react';
import PendingApprovalActions from './PendingApprovalActions';

interface PendingAppointmentsCardProps {
    salonId: string;
    /** Sadece bu staff'ın PENDING'lerini göster (staff dashboard için) */
    onlyStaffUserId?: string;
}

interface PendingRow {
    id: string;
    start_time: string;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
    salon_service?: { duration_min?: number; global_service?: { name?: string } };
    staff?: { id: string; name: string; user_id?: string };
}

/**
 * Mode B PENDING randevuları listeler ve owner/staff için onay/red butonu
 * gösterir. Otomatik refresh: onay sonrası listede sayfa yenilenmeden gizler.
 */
export default function PendingAppointmentsCard({
    salonId,
    onlyStaffUserId,
}: PendingAppointmentsCardProps) {
    const [rows, setRows] = useState<PendingRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function fetchRows() {
            setLoading(true);
            setError(null);
            try {
                let query = supabase
                    .from('appointments')
                    .select(`
                        id, start_time, customer_name, customer_phone, notes, staff_id,
                        salon_service:salon_services(duration_min, global_service:global_services(name)),
                        staff:staff(id, name, user_id)
                    `)
                    .eq('salon_id', salonId)
                    .eq('status', 'PENDING')
                    .gte('start_time', new Date().toISOString())
                    .order('start_time', { ascending: true })
                    .limit(20);

                const { data, error: err } = await query;
                if (err) throw err;

                let list = (data || []) as any[];
                if (onlyStaffUserId) {
                    list = list.filter((r) => r.staff?.user_id === onlyStaffUserId);
                }
                if (!cancelled) setRows(list as PendingRow[]);
            } catch (err: any) {
                if (!cancelled) setError(err?.message || 'Yüklenemedi');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        if (salonId) fetchRows();
        return () => { cancelled = true; };
    }, [salonId, onlyStaffUserId]);

    const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

    return (
        <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                            ONAY BEKLEYENLER
                        </p>
                        <h3 className="text-base font-black text-text-main">
                            {loading ? '...' : rows.length} randevu salon onayını bekliyor
                        </h3>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {loading ? (
                <div className="py-8 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
            ) : rows.length === 0 ? (
                <div className="py-6 text-center">
                    <p className="text-sm font-bold text-text-muted">
                        Onay bekleyen yeni randevu yok 🎉
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {rows.map((r) => (
                        <div key={r.id} className="py-3 flex flex-col md:flex-row md:items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-text-main truncate">
                                    {r.customer_name || 'Müşteri'} ·{' '}
                                    <span className="font-bold">
                                        {r.salon_service?.global_service?.name || 'Hizmet'}
                                    </span>
                                </p>
                                <div className="text-[11px] font-bold text-text-muted mt-0.5 flex flex-wrap items-center gap-2">
                                    <span>
                                        {new Date(r.start_time).toLocaleString('tr-TR', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    {r.salon_service?.duration_min && (
                                        <span>· {r.salon_service.duration_min} dk</span>
                                    )}
                                    {r.staff?.name && <span>· Uzman: {r.staff.name}</span>}
                                    {r.customer_phone && (
                                        <a
                                            href={`tel:${r.customer_phone}`}
                                            className="text-primary underline"
                                        >
                                            {r.customer_phone}
                                        </a>
                                    )}
                                </div>
                                {r.notes && (
                                    <p className="text-[11px] text-text-muted mt-1 italic">
                                        Not: {r.notes.length > 80 ? r.notes.substring(0, 80) + '...' : r.notes}
                                    </p>
                                )}
                            </div>
                            <PendingApprovalActions
                                appointmentId={r.id}
                                status="PENDING"
                                size="sm"
                                onUpdated={() => removeRow(r.id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
