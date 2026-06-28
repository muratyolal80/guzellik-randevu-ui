'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { SupportService } from '@/services/db';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Send, ArrowLeft, Loader2, User, UserCog, CheckCircle2, XCircle, Tag, Flag, Clock } from 'lucide-react';
import type { SupportTicket, TicketMessage } from '@/types';
import Link from 'next/link';
import { getStatusMeta, getPriorityMeta, getCategoryLabel, formatRelativeTime } from '@/lib/support';

export default function TicketDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [confirmingResolve, setConfirmingResolve] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const ticketId = typeof id === 'string' ? id : '';

    const fetchDetail = async () => {
        if (!ticketId || !user) return;
        try {
            const [ticketData, messageData] = await Promise.all([
                SupportService.getTicketById(ticketId),
                SupportService.getTicketMessages(ticketId),
            ]);
            setTicket(ticketData);
            setMessages(messageData);
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveTicket = async () => {
        if (!ticket || !user) return;
        try {
            setResolving(true);
            await SupportService.resolveTicket(ticket.id);
            setConfirmingResolve(false);
            showToast('Talep çözüldü olarak kapatıldı.', 'success');
            fetchDetail();
        } catch (error) {
            console.error('Error resolving ticket:', error);
            showToast('Talep kapatılırken bir hata oluştu.', 'error');
        } finally {
            setResolving(false);
        }
    };

    useEffect(() => {
        fetchDetail();
        // Poll for new replies every 10 seconds.
        const interval = setInterval(fetchDetail, 10000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !user) return;

        // Optimistic append — show the message instantly, reconcile after server round-trip.
        const tempId = `temp-${Date.now()}`;
        const optimistic: TicketMessage = {
            id: tempId,
            ticket_id: ticketId,
            sender_id: user.id,
            sender_role: 'CUSTOMER',
            content,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimistic]);
        setNewMessage('');
        setSending(true);

        try {
            await SupportService.addMessage(ticketId, user.id, 'CUSTOMER', content);
            const updated = await SupportService.getTicketMessages(ticketId);
            setMessages(updated);
        } catch (error) {
            console.error('Error sending message:', error);
            // Roll back the optimistic message and restore the input.
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setNewMessage(content);
            showToast('Mesaj gönderilemedi. Lütfen tekrar deneyin.', 'error');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <TicketDetailSkeleton />;

    if (!ticket) {
        return (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center">
                <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-8 h-8 text-gray-300" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Talep bulunamadı</h2>
                <p className="text-gray-500 text-sm mt-1">Bu talep silinmiş veya erişiminiz olmayabilir.</p>
                <Link href="/customer/support" className="mt-5 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                    Taleplerime Dön
                </Link>
            </div>
        );
    }

    const status = getStatusMeta(ticket.status);
    const prio = getPriorityMeta(ticket.priority);
    const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4 flex-shrink-0">
                <div className="flex items-start gap-3 min-w-0">
                    <Link href="/customer/support" className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-0.5">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono text-gray-400">#{ticket.id.slice(0, 8)}</span>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${status.bg} ${status.color} ${status.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                            </span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 truncate">{ticket.subject}</h1>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
                            <span className="inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> {getCategoryLabel(ticket.category)}</span>
                            <span className={`inline-flex items-center gap-1 font-bold ${prio.color}`}><Flag className="w-3.5 h-3.5" /> {prio.label}</span>
                            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatRelativeTime(ticket.updated_at || ticket.created_at)}</span>
                        </div>
                    </div>
                </div>

                {!isResolved && !confirmingResolve && (
                    <button
                        onClick={() => setConfirmingResolve(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 hover:text-emerald-600 transition-colors shadow-sm flex-shrink-0"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Çözüldü
                    </button>
                )}
            </div>

            {/* Inline resolve confirmation */}
            {confirmingResolve && !isResolved && (
                <div className="flex items-center justify-between gap-4 mb-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex-shrink-0 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-sm font-medium text-amber-900">Bu talebi çözüldü olarak kapatmak istiyor musunuz?</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => setConfirmingResolve(false)} className="px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-white rounded-lg transition-colors">Vazgeç</button>
                        <button
                            onClick={handleResolveTicket}
                            disabled={resolving}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                            {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Evet, kapat
                        </button>
                    </div>
                </div>
            )}

            {/* Chat area */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                    <div className="flex justify-center">
                        <div className="bg-white text-gray-500 text-xs px-3 py-1 rounded-full font-medium border border-gray-100">
                            Talep oluşturuldu · {new Date(ticket.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    {messages.map((msg) => {
                        const isMe = msg.sender_role === 'CUSTOMER';
                        const isPending = msg.id.startsWith('temp-');
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {isMe ? <User className="w-4 h-4" /> : <UserCog className="w-4 h-4" />}
                                </div>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMe ? 'bg-amber-500 text-white rounded-tr-none' : 'bg-white border border-gray-100 rounded-tl-none shadow-sm'} ${isPending ? 'opacity-70' : ''}`}>
                                    {!isMe && <p className="text-[11px] font-bold text-blue-600 mb-1">Destek Ekibi</p>}
                                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isMe ? 'text-white' : 'text-gray-700'}`}>{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-amber-100' : 'text-gray-400'}`}>
                                        {isPending ? 'Gönderiliyor…' : new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                    {isResolved ? (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-500">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">Bu talep çözüldüğü için yeni mesajlara kapatılmıştır.</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Mesajınızı yazın..."
                                className="flex-1 px-4 py-3 bg-gray-50 border-gray-100 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function TicketDetailSkeleton() {
    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="size-9 bg-gray-200 rounded-lg" />
                <div className="space-y-2">
                    <div className="h-4 w-40 bg-gray-200 rounded" />
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                </div>
            </div>
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
                <div className="flex gap-3"><div className="size-8 bg-gray-200 rounded-full" /><div className="h-16 w-2/3 bg-gray-200 rounded-2xl" /></div>
                <div className="flex gap-3 flex-row-reverse"><div className="size-8 bg-gray-200 rounded-full" /><div className="h-12 w-1/2 bg-gray-200 rounded-2xl" /></div>
                <div className="flex gap-3"><div className="size-8 bg-gray-200 rounded-full" /><div className="h-20 w-3/5 bg-gray-200 rounded-2xl" /></div>
            </div>
        </div>
    );
}
