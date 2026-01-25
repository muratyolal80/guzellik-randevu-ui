'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SupportService } from '@/services/db';
import {
    MessageSquare,
    Search,
    Filter,
    CheckCircle2,
    AlertCircle,
    Clock,
    Send,
    ChevronRight,
    User,
    Mail,
    Tag,
    Info,
    XCircle,
    ArrowLeft
} from 'lucide-react';

export default function AdminSupportManagement() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        if (user) {
            fetchTickets();
        }
    }, [user]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await SupportService.getAllTickets();
            setTickets(data);
        } catch (err) {
            console.error('Biletler çekilemedi:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTicket = async (ticket: any) => {
        setSelectedTicket(ticket);
        try {
            const ticketMsgs = await SupportService.getTicketMessages(ticket.id);
            setMessages(ticketMsgs);
        } catch (err) {
            console.error('Mesajlar çekilemedi:', err);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || !selectedTicket || !user) return;

        setSending(true);
        try {
            await SupportService.replyToTicket(selectedTicket.id, user.id, reply);
            setReply('');
            // Refresh messages and tickets
            const ticketMsgs = await SupportService.getTicketMessages(selectedTicket.id);
            setMessages(ticketMsgs);
            fetchTickets();
        } catch (err) {
            console.error('Yanıt gönderilemedi:', err);
        } finally {
            setSending(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedTicket) return;
        try {
            await SupportService.resolveTicket(selectedTicket.id);
            setSelectedTicket((prev: any) => ({ ...prev, status: 'RESOLVED' }));
            fetchTickets();
        } catch (err) {
            console.error('Çözümleme hatası:', err);
        }
    };

    const filteredTickets = filterStatus === 'ALL'
        ? tickets
        : tickets.filter(t => t.status === filterStatus);

    if (loading && tickets.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col gap-8 animate-fade-in relative">
            {/* Header */}
            <div className="bg-white p-8 rounded-[40px] border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tight flex items-center gap-3 italic">
                        <MessageSquare className="w-8 h-8 text-primary" /> Destek Merkezi
                    </h1>
                    <p className="text-text-secondary font-medium">Kullanıcı taleplerini ve sistem biletlerini buradan yönetin.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            placeholder="Talep Ara..."
                            className="pl-11 pr-6 py-3 bg-surface-alt border border-border rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-8 min-h-0 overflow-hidden">
                {/* Sol: Bilet Listesi */}
                <div className={`w-full lg:w-[420px] bg-white rounded-[40px] border border-border shadow-card overflow-hidden flex flex-col ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-6 border-b border-border bg-gray-50/50 flex items-center justify-between">
                        <div className="flex gap-2">
                            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(st => (
                                <button
                                    key={st}
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filterStatus === st ? 'bg-primary text-white shadow-md' : 'bg-white border border-border text-text-muted hover:bg-gray-50'}`}
                                >
                                    {st === 'ALL' ? 'Hepsi' : st === 'OPEN' ? 'Yeni' : st === 'IN_PROGRESS' ? 'Süreci' : 'Bitti'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-2 no-scrollbar">
                        {filteredTickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => handleSelectTicket(ticket)}
                                className={`w-full p-6 text-left rounded-[32px] transition-all relative group ${selectedTicket?.id === ticket.id ? 'bg-primary/5 border-2 border-primary/20 scale-[0.98]' : 'bg-white border border-transparent hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">#{ticket.id.split('-')[0]}</span>
                                    {ticket.status === 'OPEN' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                                </div>
                                <h4 className="text-sm font-black text-text-main group-hover:text-primary transition-colors line-clamp-1">{ticket.subject}</h4>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-[10px] text-text-muted border border-white uppercase shadow-sm">
                                        {ticket.user?.full_name?.substring(0, 2) || 'KU'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] font-bold text-text-main truncate">{ticket.user?.full_name}</p>
                                        <p className="text-[9px] font-medium text-text-muted italic">{new Date(ticket.created_at).toLocaleDateString('tr-TR')}</p>
                                    </div>
                                </div>
                                <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5 text-primary" />
                                </div>
                            </button>
                        ))}
                        {filteredTickets.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                                <Info className="w-12 h-12" />
                                <p className="font-bold italic">Nal sesleri... (Bilet Yok)</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sağ: Mesajlaşma Alanı */}
                <div className={`flex-1 bg-white rounded-[40px] border border-border shadow-card overflow-hidden flex flex-col relative ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                    {selectedTicket ? (
                        <>
                            {/* Ticket Header */}
                            <div className="p-8 border-b border-border bg-gray-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSelectedTicket(null)} className="lg:hidden p-2 hover:bg-gray-200 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedTicket.category}</p>
                                        <h3 className="text-lg font-black text-text-main tracking-tight">{selectedTicket.subject}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedTicket.status !== 'RESOLVED' && (
                                        <button onClick={handleResolve} className="px-6 py-2.5 bg-green-50 text-green-600 border border-green-100 rounded-xl text-xs font-black hover:bg-green-100 transition-all">Talebi Çözüldü İşaretle</button>
                                    )}
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white shadow-sm ${selectedTicket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                        selectedTicket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {selectedTicket.status}
                                    </span>
                                </div>
                            </div>

                            {/* Thread */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar bg-[url('/grid.svg')] bg-center">
                                {/* İlk Mesaj (Konu Özeti) */}
                                <div className="p-8 bg-surface-alt rounded-[40px] border border-border shadow-sm max-w-2xl">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                                        <Info className="w-4 h-4" /> Talep Başlangıcı
                                    </p>
                                    <p className="text-sm text-text-main font-medium leading-relaxed">{selectedTicket.message}</p>
                                </div>

                                {messages.filter(m => m.id !== selectedTicket.id).map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender_role === 'SUPER_ADMIN' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xl p-6 rounded-[32px] shadow-sm flex flex-col gap-2 ${msg.sender_role === 'SUPER_ADMIN' ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-border rounded-tl-none'
                                            }`}>
                                            <div className="flex items-center justify-between gap-10">
                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{msg.sender_role}</span>
                                                <span className="text-[9px] font-medium opacity-50">
                                                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Box */}
                            <div className="p-8 border-t border-border bg-white">
                                {selectedTicket.status === 'RESOLVED' ? (
                                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-green-700 text-center font-bold text-sm">
                                        Bu talep başarıyla çözümlendi ve kapatıldı.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendReply} className="relative">
                                        <textarea
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="Yanıtınızı buraya yazın..."
                                            className="w-full pl-6 pr-24 py-5 bg-surface-alt border border-border rounded-[32px] text-sm font-bold text-text-main focus:border-primary outline-none transition-all min-h-[120px] resize-none scroll-pt-5"
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !reply.trim()}
                                            className="absolute right-4 bottom-4 p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-8 grayscale-[0.5]">
                            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-primary blur-in">
                                <MessageSquare className="w-16 h-16" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-text-main tracking-tight">Kimi Mutlu Etmek İsteriz?</h3>
                                <p className="text-text-secondary font-medium max-w-sm">Soldaki listeden bir talep seçerek kullanıcılarımıza yardımcı olmaya başlayabilirsiniz.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
