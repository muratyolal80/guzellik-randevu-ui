'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PaymentService } from '@/services/db';
import { Transaction } from '@/types';
import { CreditCard, History, Search, Filter, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function CustomerPaymentsPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) {
            loadTransactions();
        }
    }, [user]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const data = await PaymentService.getCustomerTransactions(user!.id);
            setTransactions(data);
        } catch (error) {
            console.error('Ödemeler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        (t as any).salons?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.includes(searchTerm)
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'PENDING': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'REFUNDED': return <ArrowDownLeft className="w-4 h-4 text-blue-500" />;
            default: return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'Tamamlandı';
            case 'PENDING': return 'Bekliyor';
            case 'FAILED': return 'Hata';
            case 'REFUNDED': return 'İade Edildi';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Ödemelerim</h1>
                    <p className="text-text-secondary text-sm">Geçmiş randevu ödemeleriniz ve işlem dökümleriniz.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-border px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-text-main">Bakiyem: ₺0.00</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                    <div className="bg-green-50 p-3 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary font-medium">Toplam Harcama</p>
                        <p className="text-xl font-black text-text-main">₺{transactions.reduce((acc, t) => acc + (t.payment_status === 'COMPLETED' ? Number(t.amount) : 0), 0).toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                    <div className="bg-amber-50 p-3 rounded-xl">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary font-medium">Bekleyen Ödemeler</p>
                        <p className="text-xl font-black text-text-main">₺{transactions.reduce((acc, t) => acc + (t.payment_status === 'PENDING' ? Number(t.amount) : 0), 0).toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl">
                        <History className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary font-medium">İşlem Sayısı</p>
                        <p className="text-xl font-black text-text-main">{transactions.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Salon veya İşlem ID ara..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors font-medium">
                        <Filter className="w-4 h-4" />
                        Filtrele
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-text-secondary text-[10px] uppercase font-bold tracking-wider">
                                <th className="px-6 py-4">İşlem Detayı</th>
                                <th className="px-6 py-4">Yöntem</th>
                                <th className="px-6 py-4">Tarih</th>
                                <th className="px-6 py-4 text-right">Tutar</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4 text-center">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-6"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                                        <td className="px-6 py-6"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-gray-200 rounded w-10 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <CreditCard className="w-12 h-12 text-gray-200" />
                                            <p className="text-text-secondary font-medium">Henüz bir ödeme işleminiz bulunmuyor.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-text-main group-hover:text-primary transition-colors">{(t as any).salons?.name || '---'}</p>
                                            <p className="text-[10px] text-text-muted font-mono">{t.id.split('-')[0]}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-text-secondary flex items-center gap-1">
                                            {t.payment_method === 'CREDIT_CARD' ? <CreditCard className="w-3 h-3" /> : null}
                                            {t.payment_method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-text-main font-medium">{format(new Date(t.created_at), 'd MMM yyyy', { locale: tr })}</p>
                                        <p className="text-[10px] text-text-muted">{format(new Date(t.created_at), 'HH:mm')}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-black text-text-main">₺{Number(t.amount).toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black w-fit
                                            ${t.payment_status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                                                t.payment_status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                                                    t.payment_status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}
                                        >
                                            {getStatusIcon(t.payment_status)}
                                            {getStatusLabel(t.payment_status)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-all text-text-muted hover:text-primary">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
