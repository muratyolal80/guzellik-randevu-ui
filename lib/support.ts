import type { SupportTicket } from '@/types';

/**
 * Shared support-domain config & helpers.
 * Centralizes ticket category / status / priority presentation so the
 * customer list, ticket detail and admin panels stay in sync.
 */

export type TicketStatus = SupportTicket['status'];
export type TicketPriority = SupportTicket['priority'];
export type TicketCategory = SupportTicket['category'];

export interface SupportCategory {
    id: TicketCategory;
    label: string;
}

export const SUPPORT_CATEGORIES: SupportCategory[] = [
    { id: 'PAYMENT', label: 'Ödeme Sorunları' },
    { id: 'BOOKING', label: 'Randevu İşlemleri' },
    { id: 'ACCOUNT', label: 'Hesap ve Profil' },
    { id: 'SALON', label: 'Salon Şikayet/Öneri' },
    { id: 'OTHER', label: 'Diğer' },
];

export function getCategoryLabel(category?: string): string {
    return SUPPORT_CATEGORIES.find((c) => c.id === category)?.label ?? 'Genel';
}

interface StatusMeta {
    label: string;
    /** text color class */
    color: string;
    /** subtle background class */
    bg: string;
    /** border class */
    border: string;
    /** solid dot color class for indicators */
    dot: string;
}

export const STATUS_CONFIG: Record<string, StatusMeta> = {
    OPEN: { label: 'Açık', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' },
    IN_PROGRESS: { label: 'İşleniyor', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500' },
    RESOLVED: { label: 'Çözüldü', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' },
    CLOSED: { label: 'Kapalı', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-300' },
};

export function getStatusMeta(status?: string): StatusMeta {
    return STATUS_CONFIG[status ?? ''] ?? STATUS_CONFIG.CLOSED;
}

interface PriorityMeta {
    label: string;
    color: string;
    bg: string;
    border: string;
    /** left-accent border color for cards */
    accent: string;
    /** sort weight, higher = more urgent */
    weight: number;
}

export const PRIORITY_CONFIG: Record<string, PriorityMeta> = {
    LOW: { label: 'Düşük', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', accent: 'border-l-gray-300', weight: 0 },
    NORMAL: { label: 'Normal', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', accent: 'border-l-slate-300', weight: 1 },
    HIGH: { label: 'Yüksek', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', accent: 'border-l-orange-400', weight: 2 },
    URGENT: { label: 'Acil', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', accent: 'border-l-rose-500', weight: 3 },
};

export function getPriorityMeta(priority?: string): PriorityMeta {
    return PRIORITY_CONFIG[priority ?? ''] ?? PRIORITY_CONFIG.NORMAL;
}

export const PRIORITY_OPTIONS: { id: TicketPriority; label: string }[] = [
    { id: 'LOW', label: 'Düşük' },
    { id: 'NORMAL', label: 'Normal' },
    { id: 'HIGH', label: 'Yüksek' },
    { id: 'URGENT', label: 'Acil' },
];

/** A ticket counts as "active" (needs attention) when not resolved/closed. */
export function isTicketActive(status?: string): boolean {
    return status === 'OPEN' || status === 'IN_PROGRESS';
}

/**
 * Human-friendly relative time in Turkish ("az önce", "5 dk önce", "Dün", ...).
 * Falls back to a localized date for anything older than a week.
 */
export function formatRelativeTime(dateInput?: string | number | Date): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const ms = Date.now() - date.getTime();
    if (Number.isNaN(ms)) return '';

    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hour = Math.floor(min / 60);
    const day = Math.floor(hour / 24);

    if (sec < 45) return 'az önce';
    if (min < 60) return `${min} dk önce`;
    if (hour < 24) return `${hour} sa önce`;
    if (day === 1) return 'Dün';
    if (day < 7) return `${day} gün önce`;

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}
