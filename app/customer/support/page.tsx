'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    MessageSquare, Plus, ChevronRight, Loader2, Send, Search,
    AlertCircle, Inbox, RefreshCw, LifeBuoy, X,
} from 'lucide-react';
import { SupportService } from '@/services/db';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Skeleton from '@/components/Skeleton';
import Link from 'next/link';
import type { SupportTicket } from '@/types';
import {
    SUPPORT_CATEGORIES, PRIORITY_OPTIONS, getCategoryLabel, getStatusMeta,
    getPriorityMeta, isTicketActive, formatRelativeTime,
} from '@/lib/support';

type StatusFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
    { id: 'ALL', label: 'Tümü' },
    { id: 'OPEN', label: 'Açık' },
    { id: 'IN_PROGRESS', label: 'İşleniyor' },
    { id: 'RESOLVED', label: 'Çözüldü' },
];

const SUBJECT_MIN = 5;
const MESSAGE_MIN = 15;
const MESSAGE_MAX = 1000;

export default function SupportPage() {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [search, setSearch] = useState('');

    // Form state
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('OTHER');
    const [priority, setPriority] = useState('NORMAL');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) fetchTickets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchTickets = async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError(false);
            const data = await SupportService.getTickets(user.id);
            setTickets(data);
        } catch (err) {
            console.error('Error fetching tickets:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => ({
        total: tickets.length,
        open: tickets.filter((t) => t.status === 'OPEN').length,
        inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
    }), [tickets]);

    const filteredTickets = useMemo(() => {
        const q = search.trim().toLowerCase();
        return tickets
            .filter((t) => {
                if (statusFilter === 'RESOLVED') {
                    if (t.status !== 'RESOLVED' && t.status !== 'CLOSED') return false;
                } else if (statusFilter !== 'ALL' && t.status !== statusFilter) {
                    return false;
                }
                if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
                if (q && !(
                    t.subject?.toLowerCase().includes(q) ||
                    t.message?.toLowerCase().includes(q) ||
                    t.id.toLowerCase().includes(q)
                )) return false;
                return true;
            })
            // Active tickets first, then most recently updated.
            .sort((a, b) => {
                const activeDiff = Number(isTicketActive(b.status)) - Number(isTicketActive(a.status));
                if (activeDiff !== 0) return activeDiff;
                return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
            });
    }, [tickets, statusFilter, categoryFilter, search]);

    const subjectValid = subject.trim().length >= SUBJECT_MIN;
    const messageValid = message.trim().length >= MESSAGE_MIN && message.length <= MESSAGE_MAX;
    const formValid = subjectValid && messageValid;

    const resetForm = () => {
        setSubject(''); setMessage(''); setCategory('OTHER'); setPriority('NORMAL');
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !formValid) return;
        try {
            setSubmitting(true);
            await SupportService.createTicket(user.id, subject.trim(), category, message.trim(), priority);
            setShowNewTicketForm(false);
            resetForm();
            showToast('Destek talebiniz oluşturuldu. En kısa sürede dönüş yapılacak.', 'success');
            fetchTickets();
        } catch (err) {
            console.error('Error creating ticket:', err);
            showToast('Talep oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const hasFiltersApplied = statusFilter !== 'ALL' || categoryFilter !== 'ALL' || search.trim() !== '';

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Destek Taleplerim</h1>
                    <p className="text-gray-500 text-sm mt-1">Tüm sorun ve taleplerinizi bu ekrandan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={() => setShowNewTicketForm((v) => !v)}
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-200 active:scale-95"
                >
                    {showNewTicketForm ? <><X className="w-5 h-5" /> Vazgeç</> : <><Plus className="w-5 h-5" /> Yeni Talep Oluştur</>}
                </button>
            </div>

            {/* Stat cards */}
            {!loading && !error && tickets.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Toplam" value={stats.total} dot="bg-gray-300" />
                    <StatCard label="Açık" value={stats.open} dot="bg-emerald-500" />
                    <StatCard label="İşleniyor" value={stats.inProgress} dot="bg-blue-500" />
                    <StatCard label="Çözüldü" value={stats.resolved} dot="bg-gray-400" />
                </div>
            )}

            {/* New ticket form */}
            {showNewTicketForm && (
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-amber-100 shadow-xl shadow-amber-500/5 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="font-bold text-xl mb-6 text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-amber-500" />
                        Yeni Destek Talebi
                    </h3>
                    <form onSubmit={handleCreateTicket} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Talep Konusu</label>
                                <input
                                    required
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Örn: Ödeme hatası hakkında"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                                />
                                {subject.length > 0 && !subjectValid && (
                                    <p className="text-xs text-rose-500 mt-1.5">Konu en az {SUBJECT_MIN} karakter olmalı.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium bg-white"
                                >
                                    {SUPPORT_CATEGORIES.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Öncelik</label>
                            <div className="flex flex-wrap gap-2">
                                {PRIORITY_OPTIONS.map((opt) => {
                                    const meta = getPriorityMeta(opt.id);
                                    const active = priority === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setPriority(opt.id)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${active ? `${meta.bg} ${meta.color} ${meta.border} ring-2 ring-offset-1 ring-amber-400/40` : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-700">Mesajınız</label>
                                <span className={`text-xs font-medium ${message.length > MESSAGE_MAX ? 'text-rose-500' : 'text-gray-400'}`}>
                                    {message.length}/{MESSAGE_MAX}
                                </span>
                            </div>
                            <textarea
                                required
                                rows={4}
                                maxLength={MESSAGE_MAX}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Lütfen sorununuzu detaylı bir şekilde açıklayın..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium resize-none"
                            />
                            {message.length > 0 && !messageValid && (
                                <p className="text-xs text-rose-500 mt-1.5">Mesaj en az {MESSAGE_MIN} karakter olmalı.</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={submitting || !formValid}
                                className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-bold shadow-lg shadow-amber-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Talebi Gönder</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters bar */}
            {!loading && !error && tickets.length > 0 && (
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setStatusFilter(f.id)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${statusFilter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 lg:w-64">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Talep ara..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        >
                            <option value="ALL">Tüm kategoriler</option>
                            {SUPPORT_CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* List / states */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
                {loading ? (
                    <div className="divide-y divide-gray-100">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-6 flex items-center justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-5 w-2/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-7 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="size-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-rose-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Talepler yüklenemedi</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs">Bağlantı sırasında bir sorun oluştu.</p>
                        <button
                            onClick={fetchTickets}
                            className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" /> Tekrar Dene
                        </button>
                    </div>
                ) : filteredTickets.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredTickets.map((ticket) => {
                            const status = getStatusMeta(ticket.status);
                            const prio = getPriorityMeta(ticket.priority);
                            const showPriority = ticket.priority === 'HIGH' || ticket.priority === 'URGENT';
                            return (
                                <Link
                                    href={`/customer/support/${ticket.id}`}
                                    key={ticket.id}
                                    className={`block p-5 md:p-6 hover:bg-gray-50/80 transition-all group border-l-4 ${prio.accent}`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    {getCategoryLabel(ticket.category)}
                                                </span>
                                                {showPriority && (
                                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${prio.bg} ${prio.color}`}>
                                                        {prio.label}
                                                    </span>
                                                )}
                                                <span className="text-gray-400 text-xs font-mono">#{ticket.id.slice(0, 8)}</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-amber-600 transition-colors truncate">{ticket.subject}</h4>
                                            <p className="text-gray-500 text-sm mt-1 line-clamp-1">{ticket.message}</p>
                                        </div>

                                        <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                                            <div className="text-left md:text-right">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Güncelleme</p>
                                                <p className="text-sm font-medium text-gray-600">{formatRelativeTime(ticket.updated_at || ticket.created_at)}</p>
                                            </div>
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${status.bg} ${status.color} ${status.border}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                {status.label}
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors hidden md:block" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : hasFiltersApplied ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Sonuç bulunamadı</h3>
                        <p className="text-gray-500 text-sm mt-1">Filtre ve aramayı değiştirmeyi deneyin.</p>
                        <button
                            onClick={() => { setStatusFilter('ALL'); setCategoryFilter('ALL'); setSearch(''); }}
                            className="mt-4 text-sm font-bold text-amber-600 hover:text-amber-700"
                        >
                            Filtreleri temizle
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <div className="size-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                            <Inbox className="w-8 h-8 text-amber-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Henüz talebiniz yok</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs">Sorun bildirmek veya yardım almak için yeni bir destek talebi oluşturabilirsiniz.</p>
                        <button
                            onClick={() => setShowNewTicketForm(true)}
                            className="mt-5 flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> İlk Talebini Oluştur
                        </button>
                    </div>
                )}
            </div>

            {/* Self-service hint */}
            {!loading && !error && (
                <div className="flex items-start gap-3 bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-sm">
                    <LifeBuoy className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-800/80">
                        <span className="font-bold text-blue-900">İpucu:</span> Randevu ve ödeme sorunlarının çoğu ilgili
                        ekranlardan çözülebilir. Yine de yardıma ihtiyacınız olursa talebinizi olabildiğince ayrıntılı yazın;
                        böylece daha hızlı dönüş yapabiliriz.
                    </p>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, dot }: { label: string; value: number; dot: string }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
    );
}
