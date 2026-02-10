'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, ChevronRight, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
import { SupportService } from '@/services/db';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import type { SupportTicket } from '@/types';

const CATEGORIES = [
    { id: 'PAYMENT', label: 'Ödeme Sorunları' },
    { id: 'BOOKING', label: 'Randevu İşlemleri' },
    { id: 'ACCOUNT', label: 'Hesap ve Profil' },
    { id: 'SALON', label: 'Salon Şikayet/Öneri' },
    { id: 'OTHER', label: 'Diğer' }
];

export default function SupportPage() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);

    // Form state
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('OTHER');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchTickets();
        }
    }, [user]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await SupportService.getTickets(user!.id);
            setTickets(data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message || !user) return;

        try {
            setSubmitting(true);
            await SupportService.createTicket(user.id, subject, category, message);
            setShowNewTicketForm(false);
            setSubject('');
            setMessage('');
            fetchTickets();
        } catch (error) {
            console.error('Error creating ticket:', error);
            alert('Talep oluşturulurken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN':
                return { label: 'Açık', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' };
            case 'IN_PROGRESS':
                return { label: 'İşleniyor', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
            case 'RESOLVED':
                return { label: 'Çözüldü', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100' };
            default:
                return { label: 'Kapalı', color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100' };
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Destek Taleplerim</h1>
                    <p className="text-gray-500 text-sm mt-1">Tüm sorun ve taleplerinizi bu ekrandan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-200 active:scale-95"
                >
                    {showNewTicketForm ? 'Vazgeç' : <><Plus className="w-5 h-5" /> Yeni Talep Oluştur</>}
                </button>
            </div>

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
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium bg-white"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mesajınız</label>
                            <textarea
                                required
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Lütfen sorununuzu detaylı bir şekilde açıklayın..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium resize-none"
                            ></textarea>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-bold shadow-lg shadow-amber-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Talebi Gönder</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-3">
                        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                        <p className="text-gray-500 font-medium">Talepler yükleniyor...</p>
                    </div>
                ) : tickets.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {tickets.map((ticket) => {
                            const config = getStatusConfig(ticket.status);
                            return (
                                <Link href={`/customer/support/${ticket.id}`} key={ticket.id} className="block p-6 hover:bg-gray-50/80 transition-all group cursor-pointer border-l-4 border-transparent hover:border-amber-500">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    {CATEGORIES.find(c => c.id === ticket.category)?.label || 'GENEL'}
                                                </span>
                                                <span className="text-gray-400 text-xs font-medium">#{ticket.id.slice(0, 8)}</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-amber-600 transition-colors">{ticket.subject}</h4>
                                            <p className="text-gray-500 text-sm mt-1 line-clamp-1">{ticket.message}</p>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">SON GÜNCELLEME</p>
                                                <p className="text-sm font-medium text-gray-600">{new Date(ticket.created_at).toLocaleDateString('tr-TR')}</p>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider ${config.bg} ${config.color} ${config.border}`}>
                                                {config.label}
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Henüz talebiniz yok</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs">Sorun bildirmek veya yardım almak için yeni bir destek talebi oluşturabilirsiniz.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
