'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApprovalService } from '@/services/db';
import { Layout } from '@/components/Layout';
import { Clock, CheckCircle2, XCircle, ChevronLeft, Info, Search } from 'lucide-react';
import Link from 'next/link';

export default function OwnerApprovalsPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadRequests();
    }, [user]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await ApprovalService.getMyRequests(user?.id!);
            setRequests(data);
        } catch (error) {
            console.error('Error loading requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'APPROVED': return 'bg-green-50 text-green-600 border-green-100';
            case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-4 h-4" />;
            case 'APPROVED': return <CheckCircle2 className="w-4 h-4" />;
            case 'REJECTED': return <XCircle className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'SALON_CREATE': 'Yeni Salon Başvurusu',
            'SALON_UPDATE': 'Salon Bilgisi Güncelleme',
            'SERVICE_ADD': 'Hizmet Ekleme',
            'SERVICE_UPDATE': 'Hizmet Güncelleme',
            'SERVICE_DELETE': 'Hizmet Silme',
            'STAFF_ADD': 'Personel Ekleme',
            'STAFF_UPDATE': 'Personel Güncelleme',
            'STAFF_DELETE': 'Personel Silme',
        };
        return labels[type] || type;
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen animate-pulse font-bold text-primary">Yükleniyor...</div>;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <Link href="/owner/dashboard" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-4 transition-colors font-bold">
                            <ChevronLeft className="w-4 h-4" /> Dashboard'a Dön
                        </Link>
                        <h1 className="text-4xl font-black text-text-main tracking-tight">Değişiklik Taleplerim</h1>
                        <p className="text-text-secondary font-medium">Yaptığınız tüm değişikliklerin onay durumunu buradan takip edebilirsiniz.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {requests.length > 0 ? (
                        requests.map((req) => (
                            <div key={req.id} className="bg-white p-6 rounded-[32px] border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${getStatusStyle(req.status)} shadow-sm`}>
                                        {getStatusIcon(req.status)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main text-lg">{getTypeLabel(req.type)}</h3>
                                        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                                            {new Date(req.created_at).toLocaleDateString('tr-TR')} • {new Date(req.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                                    {req.admin_note && (
                                        <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs text-text-secondary max-w-xs italic">
                                            <span className="font-bold block not-italic mb-1 opacity-60">Admin Notu:</span>
                                            "{req.admin_note}"
                                        </div>
                                    )}
                                    <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyle(req.status)} shadow-sm shrink-0`}>
                                        {req.status === 'PENDING' ? 'Beklemede' : req.status === 'APPROVED' ? 'Onaylandı' : 'Reddedildi'}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-border">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-sm">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-text-main mb-2">Talep Bulunmuyor</h3>
                            <p className="text-text-secondary max-w-sm mx-auto">Henüz herhangi bir değişiklik talebi oluşturmamışsınız.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
