'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SupportService } from '@/services/db';
import { useAuth } from '@/context/AuthContext';
import { Send, ArrowLeft, Loader2, User, UserCog, CheckCircle2, XCircle } from 'lucide-react';
import type { SupportTicket, TicketMessage } from '@/types';
import Link from 'next/link';

export default function TicketDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();

    // States
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const ticketId = typeof id === 'string' ? id : '';

    const fetchDetail = async () => {
        if (!ticketId || !user) return;
        try {
            const [ticketData, messageData] = await Promise.all([
                SupportService.getTicketById(ticketId),
                SupportService.getTicketMessages(ticketId)
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
        if (!confirm('Bu talebi çözüldü olarak kapatmak istediğinize emin misiniz?')) return;

        try {
            await SupportService.resolveTicket(ticket.id);
            // Refresh detail
            fetchDetail();
        } catch (error) {
            console.error('Error resolving ticket:', error);
            alert('Talep kapatılırken bir hata oluştu.');
        }
    };

    useEffect(() => {
        fetchDetail();
        // Setup polling for new messages every 10 seconds
        const interval = setInterval(fetchDetail, 10000);
        return () => clearInterval(interval);
    }, [ticketId, user]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setSending(true);
        try {
            await SupportService.addMessage(ticketId, user.id, 'CUSTOMER', newMessage);
            setNewMessage('');
            // Refresh messages immediately
            const updatedMessages = await SupportService.getTicketMessages(ticketId);
            setMessages(updatedMessages);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Mesaj gönderilemedi.');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
    }

    if (!ticket) {
        return <div className="text-center py-20">Talep bulunamadı.</div>;
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'OPEN': return { label: 'Açık', bg: 'bg-green-100 text-green-700' };
            case 'IN_PROGRESS': return { label: 'İşleniyor', bg: 'bg-blue-100 text-blue-700' };
            case 'RESOLVED': return { label: 'Çözüldü', bg: 'bg-gray-100 text-gray-700' };
            default: return { label: status, bg: 'bg-gray-100 text-gray-700' };
        }
    };

    const statusConfig = getStatusConfig(ticket.status);

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/customer/support" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-mono text-gray-400">#{ticket.id.slice(0, 8)}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusConfig.bg}`}>
                                {statusConfig.label}
                            </span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
                    </div>
                </div>

                {ticket.status !== 'RESOLVED' && (
                    <button
                        onClick={handleResolveTicket}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 hover:text-red-500 transition-colors shadow-sm"
                    >
                        <XCircle className="w-4 h-4" />
                        Talebi Kapat
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                    {/* Initial User Info / Ticket Info */}
                    <div className="flex justify-center">
                        <div className="bg-amber-50 text-amber-800 text-xs px-3 py-1 rounded-full font-medium">
                            Talep oluşturuldu: {new Date(ticket.created_at).toLocaleDateString('tr-TR')}
                        </div>
                    </div>

                    {messages.map((msg) => {
                        const isMe = msg.sender_role === 'CUSTOMER';
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {isMe ? <User className="w-4 h-4" /> : <UserCog className="w-4 h-4" />}
                                </div>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMe ? 'bg-amber-500 text-white rounded-tr-none' : 'bg-white border border-gray-100 rounded-tl-none shadow-sm'}`}>
                                    <p className={`text-sm leading-relaxed ${isMe ? 'text-white' : 'text-gray-700'}`}>{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-amber-100' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    {ticket.status === 'RESOLVED' ? (
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
