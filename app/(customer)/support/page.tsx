'use client';

import React, { useState } from 'react';
import { MessageSquare, Plus, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SupportPage() {
    const [tickets, setTickets] = useState([
        {
            id: "T-1023",
            subject: "Ödeme Sorunu",
            message: "Kartımdan iki kere çekim yapıldı, iade talep ediyorum.",
            status: "OPEN",
            lastUpdate: "10.10.2025 17:20:00"
        },
        {
            id: "T-998",
            subject: "Randevu İptali",
            message: "Son dakika işim çıktı, randevumu iptal edemiyorum.",
            status: "RESOLVED",
            lastUpdate: "15.09.2025 14:30:00"
        }
    ]);

    const [showNewTicketForm, setShowNewTicketForm] = useState(false);

    // Status badge helper
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN':
                return <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">Açık</span>;
            case 'IN_PROGRESS':
                return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">İşleniyor</span>;
            case 'RESOLVED':
                return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">Çözüldü</span>;
            default:
                return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Kapalı</span>;
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Destek Taleplerim</h1>
                    <p className="text-gray-500">Sorunlarınızı ve taleplerinizi buradan takip edebilirsiniz.</p>
                </div>
                <button
                    onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-amber-200"
                >
                    <Plus className="w-5 h-5" /> Yeni Talep Oluştur
                </button>
            </div>

            {showNewTicketForm && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
                    <h3 className="font-bold text-lg mb-4">Yeni Talep</h3>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                            <input type="text" placeholder="Sorununuzu kısaca özetleyin" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mesajınız</label>
                            <textarea rows={4} placeholder="Detaylı bilgi verin..." className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"></textarea>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowNewTicketForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">İptal</button>
                            <button type="button" className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium">Gönder</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-6 md:col-span-5">KONU</div>
                    <div className="col-span-4 md:col-span-3 hidden md:block">SON GÜNCELLEME</div>
                    <div className="col-span-3 md:col-span-2 text-right md:text-left">DURUM</div>
                    <div className="col-span-3 md:col-span-2 text-right hidden md:block"></div>
                </div>

                {/* List */}
                <div className="divide-y divide-gray-100">
                    {tickets.map((ticket) => (
                        <div key={ticket.id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-gray-50 transition-colors group cursor-pointer">
                            <div className="col-span-6 md:col-span-5">
                                <h4 className="font-bold text-gray-900 text-sm md:text-base">{ticket.subject}</h4>
                                <p className="text-gray-500 text-xs md:text-sm mt-1 truncate">{ticket.message}</p>
                            </div>
                            <div className="col-span-4 md:col-span-3 hidden md:block text-sm text-gray-500">
                                {ticket.lastUpdate}
                            </div>
                            <div className="col-span-6 md:col-span-2 flex justify-end md:justify-start">
                                {getStatusBadge(ticket.status)}
                            </div>
                            <div className="col-span-12 md:col-span-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-gray-400 hover:text-amber-600">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
