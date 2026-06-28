'use client';

import { useEffect, useState } from 'react';
import {
    X,
    Calendar,
    Clock,
    Phone,
    User,
    Scissors,
    CreditCard,
    FileText,
    AlertCircle,
    CheckCircle2,
    XCircle,
    UserCheck,
    Hourglass,
    SkipForward,
    Copy,
    Sparkles,
    Loader2,
    UserPlus,
    Printer,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AppointmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: any;
    onSuccess: () => void;
    /** İptal edilen randevunun saatine yeni müşteri almak için (opsiyonel). */
    onRebook?: (appointment: any) => void;
}

interface FullAppointment {
    id: string;
    status: string;
    start_time: string;
    end_time: string;
    customer_id?: string;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
    coupon_code?: string;
    discount_amount?: number;
    deposit_amount?: number;
    participant_count?: number;
    confirmed_by?: string | null;
    confirmed_at?: string | null;
    completed_by?: string | null;
    completed_at?: string | null;
    cancelled_by?: string | null;
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
    created_at: string;
    salon?: { id: string; name: string; address?: string; phone?: string };
    staff?: { id: string; name: string; role?: string; specialty?: string };
    salon_service?: {
        id: string;
        price: number;
        duration_min: number;
        global_service?: { name: string };
    };
    confirmed_by_profile?: { id: string; first_name?: string; last_name?: string; email?: string };
    completed_by_profile?: { id: string; first_name?: string; last_name?: string; email?: string };
    cancelled_by_profile?: { id: string; first_name?: string; last_name?: string; email?: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    PENDING: { label: 'Onay Bekliyor', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-200', icon: Hourglass },
    CONFIRMED: { label: 'Onaylandı', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200', icon: CheckCircle2 },
    COMPLETED: { label: 'Tamamlandı', color: 'text-blue-700', bg: 'bg-blue-100 border-blue-200', icon: UserCheck },
    CANCELLED: { label: 'İptal', color: 'text-rose-700', bg: 'bg-rose-100 border-rose-200', icon: XCircle },
    NO_SHOW: { label: 'Gelmedi', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200', icon: SkipForward },
};

function formatTr(iso?: string | null) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function fullName(p?: { first_name?: string; last_name?: string; email?: string } | null) {
    if (!p) return '';
    const n = `${p.first_name || ''} ${p.last_name || ''}`.trim();
    return n || p.email || 'Sistem';
}

export default function AppointmentDetailModal({
    isOpen,
    onClose,
    appointment,
    onSuccess,
    onRebook,
}: AppointmentDetailModalProps) {
    const [apt, setApt] = useState<FullAppointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    const appointmentId = appointment?.id;

    const fetchDetail = async () => {
        if (!appointmentId) return;
        setLoading(true);
        setError(null);
        try {
            const { data, error: err } = await supabase
                .from('appointments')
                .select(`
                    id, status, start_time, end_time, customer_id, customer_name, customer_phone,
                    notes, coupon_code, discount_amount, deposit_amount, participant_count,
                    confirmed_by, confirmed_at, completed_by, completed_at,
                    cancelled_by, cancelled_at, cancellation_reason, created_at,
                    salon:salons(id, name, address, phone),
                    staff:staff(id, name, role, specialty),
                    salon_service:salon_services(
                        id, price, duration_min,
                        global_service:global_services(name)
                    ),
                    confirmed_by_profile:profiles!appointments_confirmed_by_fkey(id, first_name, last_name, email),
                    completed_by_profile:profiles!appointments_completed_by_fkey(id, first_name, last_name, email),
                    cancelled_by_profile:profiles!appointments_cancelled_by_fkey(id, first_name, last_name, email)
                `)
                .eq('id', appointmentId)
                .maybeSingle();

            if (err) throw err;
            if (!data) {
                setError('Randevu bulunamadı.');
                return;
            }
            setApt(data as any);
        } catch (e: any) {
            setError(e?.message || JSON.stringify(e) || 'Yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && appointmentId) {
            fetchDetail();
        } else {
            setApt(null);
            setActionMsg(null);
            setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, appointmentId]);

    if (!isOpen || !appointment) return null;

    const copy = async (txt: string, key: string) => {
        try {
            await navigator.clipboard.writeText(txt);
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        } catch { }
    };

    const action = async (
        kind: 'confirm' | 'reject' | 'complete' | 'noshow',
        body?: any,
    ) => {
        if (!apt) return;
        setActionLoading(kind);
        setActionMsg(null);
        try {
            let url = '';
            let bodyPayload: any = body;
            if (kind === 'confirm') url = `/api/appointments/${apt.id}/confirm`;
            else if (kind === 'reject') {
                url = `/api/appointments/${apt.id}/reject`;
                bodyPayload = body || {};
            } else if (kind === 'complete' || kind === 'noshow') {
                url = `/api/appointments/${apt.id}/complete`;
                bodyPayload = { isNoShow: kind === 'noshow' };
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: bodyPayload ? { 'Content-Type': 'application/json' } : undefined,
                body: bodyPayload ? JSON.stringify(bodyPayload) : undefined,
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setActionMsg({ type: 'error', msg: data.error || 'İşlem başarısız' });
                return;
            }
            setActionMsg({ type: 'success', msg: 'Güncellendi' });
            await fetchDetail();
            onSuccess();
        } catch (e: any) {
            setActionMsg({ type: 'error', msg: e?.message || 'Ağ hatası' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = () => {
        const reason = window.prompt('Reddetme sebebi (opsiyonel, müşteriye SMS ile gider):', '');
        if (reason === null) return;
        action('reject', { reason: reason || undefined });
    };

    const status = apt?.status || appointment.status || 'PENDING';
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    const StatusIcon = cfg.icon;

    const totalPrice = apt?.salon_service?.price || 0;
    const discount = apt?.discount_amount || 0;
    const finalPrice = Math.max(0, totalPrice - discount);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-amber-50/40 rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl border ${cfg.bg} flex items-center justify-center`}>
                            <StatusIcon className={`w-6 h-6 ${cfg.color}`} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-text-main">Randevu Detayı</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.color}`}>
                                    <StatusIcon className="w-3 h-3" /> {cfg.label}
                                </span>
                                {apt?.id && (
                                    <span className="text-[10px] font-bold text-text-muted">
                                        #{apt.id.split('-')[0].toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-text-muted hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-bold text-text-muted">Yükleniyor...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />
                            <p className="text-sm font-bold text-rose-700">{error}</p>
                        </div>
                    ) : apt ? (
                        <>
                            {/* Zaman */}
                            <section className="bg-gradient-to-br from-primary/5 to-amber-50/40 rounded-2xl p-5 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted">
                                    <Calendar className="w-3.5 h-3.5" /> Tarih & Saat
                                </div>
                                <p className="text-2xl font-black text-text-main">
                                    {new Date(apt.start_time).toLocaleDateString('tr-TR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                                <p className="text-sm font-bold text-text-secondary flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    {' → '}
                                    {new Date(apt.end_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    {apt.salon_service?.duration_min && (
                                        <span className="text-text-muted">({apt.salon_service.duration_min} dk)</span>
                                    )}
                                </p>
                            </section>

                            {/* Müşteri */}
                            <section className="bg-white border border-border rounded-2xl p-5 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted">
                                    <User className="w-3.5 h-3.5" /> Müşteri
                                </div>
                                <div className="space-y-2">
                                    <p className="text-lg font-black text-text-main">
                                        {apt.customer_name || 'Misafir Müşteri'}
                                    </p>
                                    {apt.customer_phone && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Phone className="w-4 h-4 text-emerald-600" />
                                            <a
                                                href={`tel:${apt.customer_phone}`}
                                                className="text-sm font-bold text-text-main hover:text-emerald-700 underline"
                                            >
                                                {apt.customer_phone}
                                            </a>
                                            <button
                                                onClick={() => copy(apt.customer_phone!, 'phone')}
                                                className="p-1.5 rounded-lg text-text-muted hover:bg-gray-100"
                                                title="Kopyala"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                            {copied === 'phone' && (
                                                <span className="text-[10px] font-bold text-emerald-600">Kopyalandı</span>
                                            )}
                                            <a
                                                href={`https://wa.me/${apt.customer_phone.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener"
                                                className="ml-2 text-[11px] font-bold text-emerald-700 hover:underline"
                                            >
                                                WhatsApp →
                                            </a>
                                        </div>
                                    )}
                                    {apt.participant_count && apt.participant_count > 1 && (
                                        <p className="text-xs font-bold text-text-secondary">
                                            {apt.participant_count} kişilik
                                        </p>
                                    )}
                                </div>
                            </section>

                            {/* Hizmet + Personel */}
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-white border border-border rounded-2xl p-4">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted">
                                        <Scissors className="w-3.5 h-3.5" /> Hizmet
                                    </div>
                                    <p className="text-sm font-black text-text-main mt-1.5">
                                        {apt.salon_service?.global_service?.name || 'Hizmet'}
                                    </p>
                                    <p className="text-[11px] font-bold text-text-muted">
                                        {apt.salon_service?.duration_min} dk · {apt.salon_service?.price}₺
                                    </p>
                                </div>
                                <div className="bg-white border border-border rounded-2xl p-4">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted">
                                        <UserCheck className="w-3.5 h-3.5" /> Uzman
                                    </div>
                                    <p className="text-sm font-black text-text-main mt-1.5">
                                        {apt.staff?.name || 'Atanmamış'}
                                    </p>
                                    <p className="text-[11px] font-bold text-text-muted">
                                        {apt.staff?.role || apt.staff?.specialty || 'Personel'}
                                    </p>
                                </div>
                            </section>

                            {/* Ödeme */}
                            <section className="bg-white border border-border rounded-2xl p-5 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted">
                                    <CreditCard className="w-3.5 h-3.5" /> Ödeme
                                </div>
                                <div className="space-y-1 text-sm font-bold">
                                    <div className="flex justify-between text-text-secondary">
                                        <span>Hizmet Bedeli</span>
                                        <span>{totalPrice}₺</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-rose-600">
                                            <span>
                                                İndirim
                                                {apt.coupon_code && <span className="text-[10px] ml-1 opacity-70">({apt.coupon_code})</span>}
                                            </span>
                                            <span>-{discount}₺</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-base font-black text-text-main pt-2 border-t border-gray-100">
                                        <span>TOPLAM</span>
                                        <span>{finalPrice}₺</span>
                                    </div>
                                    {apt.deposit_amount && apt.deposit_amount > 0 ? (
                                        <p className="text-[11px] text-emerald-600 font-bold italic mt-1">
                                            Kapora: {apt.deposit_amount}₺
                                        </p>
                                    ) : (
                                        <p className="text-[11px] text-text-muted italic mt-1">
                                            Ödeme salonda gerçekleşecek
                                        </p>
                                    )}
                                </div>
                            </section>

                            {/* Notlar */}
                            {apt.notes && (
                                <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-800 mb-1">
                                        <FileText className="w-3.5 h-3.5" /> Notlar
                                    </div>
                                    <p className="text-sm font-medium text-amber-900 whitespace-pre-wrap">
                                        {apt.notes}
                                    </p>
                                </section>
                            )}

                            {/* Aktivite Geçmişi */}
                            <section className="bg-gray-50 rounded-2xl p-5 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted">
                                    <Sparkles className="w-3.5 h-3.5" /> Aktivite Geçmişi
                                </div>
                                <ul className="space-y-2 text-xs">
                                    <li className="flex items-baseline gap-2">
                                        <span className="font-bold text-text-muted shrink-0">Oluşturuldu:</span>
                                        <span className="font-bold text-text-main">{formatTr(apt.created_at)}</span>
                                    </li>
                                    {apt.confirmed_at && (
                                        <li className="flex items-baseline gap-2">
                                            <span className="font-bold text-emerald-700 shrink-0">✓ Onaylandı:</span>
                                            <span className="font-bold text-text-main">
                                                {fullName(apt.confirmed_by_profile) || 'Sistem'} · {formatTr(apt.confirmed_at)}
                                            </span>
                                        </li>
                                    )}
                                    {apt.completed_at && (
                                        <li className="flex items-baseline gap-2">
                                            <span className="font-bold text-blue-700 shrink-0">
                                                {status === 'NO_SHOW' ? '⊘ No-show:' : '✓ Tamamlandı:'}
                                            </span>
                                            <span className="font-bold text-text-main">
                                                {fullName(apt.completed_by_profile) || 'Sistem'} · {formatTr(apt.completed_at)}
                                            </span>
                                        </li>
                                    )}
                                    {apt.cancelled_at && (
                                        <li className="flex items-baseline gap-2">
                                            <span className="font-bold text-rose-700 shrink-0">✗ İptal edildi:</span>
                                            <span className="font-bold text-text-main">
                                                {fullName(apt.cancelled_by_profile) || 'Müşteri/Sistem'} · {formatTr(apt.cancelled_at)}
                                                {apt.cancellation_reason && (
                                                    <span className="block text-rose-600 italic mt-0.5">
                                                        Sebep: {apt.cancellation_reason}
                                                    </span>
                                                )}
                                            </span>
                                        </li>
                                    )}
                                </ul>
                            </section>

                            {actionMsg && (
                                <div
                                    className={`rounded-2xl border p-3 text-xs font-bold ${
                                        actionMsg.type === 'success'
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                            : 'bg-rose-50 border-rose-100 text-rose-700'
                                    }`}
                                >
                                    {actionMsg.msg}
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {/* Footer Actions */}
                {apt && (
                    <div className="p-5 border-t border-border bg-gray-50/40 rounded-b-3xl flex flex-wrap gap-2 justify-end">
                        {status === 'PENDING' && (
                            <>
                                <button
                                    onClick={() => action('confirm')}
                                    disabled={!!actionLoading}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {actionLoading === 'confirm' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                    Onayla
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!!actionLoading}
                                    className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-black text-xs uppercase tracking-widest hover:bg-rose-100 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <XCircle className="w-3 h-3" /> Reddet
                                </button>
                            </>
                        )}
                        {status === 'CONFIRMED' && (
                            <>
                                <button
                                    onClick={() => action('complete')}
                                    disabled={!!actionLoading}
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {actionLoading === 'complete' ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                                    Tamamlandı
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Müşteri gelmedi olarak işaretlensin mi?')) action('noshow');
                                    }}
                                    disabled={!!actionLoading}
                                    className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-slate-200 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <SkipForward className="w-3 h-3" /> Gelmedi
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!!actionLoading}
                                    className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-black text-xs uppercase tracking-widest hover:bg-rose-100 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <XCircle className="w-3 h-3" /> İptal Et
                                </button>
                            </>
                        )}
                        {status === 'CANCELLED' && onRebook && (
                            <button
                                onClick={() => { onRebook(appointment); onClose(); }}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest flex items-center gap-1.5"
                            >
                                <UserPlus className="w-3 h-3" /> Bu Saate Yeni Müşteri
                            </button>
                        )}
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 rounded-xl bg-gray-50 border border-border text-text-main font-black text-xs uppercase tracking-widest hover:bg-gray-100 flex items-center gap-1.5"
                        >
                            <Printer className="w-3 h-3" /> Yazdır
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-border bg-white text-text-main font-black text-xs uppercase tracking-widest hover:bg-gray-50"
                        >
                            Kapat
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
