'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { ApprovalService } from '@/services/db';
import {
    CheckCircle2,
    XCircle,
    Clock,
    ChevronRight,
    Info,
    Database,
    Eye,
    AlertCircle,
    Loader2
} from 'lucide-react';

export default function AdminApprovalsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await ApprovalService.getPendingRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error loading requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Bu talebi onaylamak istediğinize emin misiniz? Değişiklikler anında yayına alınacaktır.')) return;
        setProcessing(id);
        try {
            await ApprovalService.approveRequest(id);
            setRequests((prev) => prev.filter((r) => r.id !== id));
            setSelectedRequest(null);
            alert('Talep başarıyla onaylandı.');
        } catch (error: any) {
            alert('Onaylama hatası: ' + error.message);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!adminNote) {
            alert('Lütfen bir ret nedeni giriniz.');
            return;
        }
        setProcessing(id);
        try {
            await ApprovalService.rejectRequest(id, adminNote);
            setRequests((prev) => prev.filter((r) => r.id !== id));
            setSelectedRequest(null);
            alert('Talep reddedildi.');
        } catch (error: any) {
            alert('İşlem hatası: ' + error.message);
        } finally {
            setProcessing(null);
        }
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'SALON_CREATE': 'Yeni Salon',
            'SALON_UPDATE': 'Bilgi Güncelleme',
            'SERVICE_ADD': 'Yeni Hizmet',
            'SERVICE_UPDATE': 'Hizmet Düzenleme',
            'SERVICE_DELETE': 'Hizmet Silme',
            'STAFF_ADD': 'Yeni Personel',
            'STAFF_UPDATE': 'Personel Düzenleme',
            'STAFF_DELETE': 'Personel Silme',
        };
        return labels[type] || type;
    };

    if (loading) return <AdminLayout><div className="flex justify-center items-center h-64 text-primary font-bold">Yükleniyor...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-text-main">Onay Bekleyen Talepler</h2>
                    <p className="text-text-secondary">Salon sahipleri tarafından yapılan değişiklikleri inceleyin.</p>
                </div>
                <div className="bg-primary/10 text-primary px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2">
                    <Database className="w-4 h-4" /> {requests.length} Bekleyen Talep
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List of Requests */}
                <div className="lg:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {requests.length > 0 ? (
                        requests.map((req) => (
                            <button
                                key={req.id}
                                onClick={() => { setSelectedRequest(req); setAdminNote(''); }}
                                className={`w-full text-left p-5 rounded-[24px] border transition-all flex items-center gap-4 group ${selectedRequest?.id === req.id ? 'bg-primary border-primary shadow-xl shadow-primary/20 text-white' : 'bg-white border-border hover:border-primary/50 text-text-main'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${selectedRequest?.id === req.id ? 'bg-white/20' : 'bg-gray-100 text-primary'}`}>
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <p className={`font-black text-sm uppercase tracking-tight ${selectedRequest?.id === req.id ? 'text-white' : 'text-primary'}`}>
                                            {getTypeLabel(req.type)}
                                        </p>
                                        <span className={`text-[10px] font-bold opacity-60`}>
                                            {new Date(req.created_at).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                    <h4 className="font-bold truncate text-base">{req.salon?.name || 'Yeni Salon Talebi'}</h4>
                                    <p className={`text-xs truncate ${selectedRequest?.id === req.id ? 'text-white/70' : 'text-text-secondary'}`}>
                                        Gönderen: {req.requester?.full_name || req.requester?.email}
                                    </p>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${selectedRequest?.id === req.id ? 'text-white' : 'text-gray-300'}`} />
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-border">
                            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-4" />
                            <h3 className="font-bold text-text-main">Her Şey Güncel</h3>
                            <p className="text-xs text-text-secondary">Onay bekleyen talep bulunmuyor.</p>
                        </div>
                    )}
                </div>

                {/* Details Viewer */}
                <div className="lg:col-span-7">
                    {selectedRequest ? (
                        <div className="bg-white rounded-[40px] border border-border shadow-card overflow-hidden h-full flex flex-col">
                            <div className="p-8 border-b border-border bg-gray-50/30">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-text-main tracking-tight">Talep Detayları</h3>
                                        <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                            <span className="px-2 py-0.5 bg-white border border-border rounded-md text-primary">{getTypeLabel(selectedRequest.type)}</span>
                                            <span>•</span>
                                            <span>ID: {selectedRequest.id.split('-')[0]}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-text-main">{selectedRequest.requester?.full_name}</p>
                                        <p className="text-[10px] font-medium text-text-secondary">{selectedRequest.requester?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="space-y-6">
                                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-4">
                                            <Eye className="w-4 h-4" /> GÖNDERİLEN VERİ
                                        </div>
                                        <pre className="text-xs font-mono bg-white p-4 rounded-xl border border-border overflow-x-auto text-text-main leading-relaxed">
                                            {JSON.stringify(selectedRequest.data, null, 2)}
                                        </pre>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-text-main uppercase tracking-widest ml-1">Admin Notu (Ret durumunda zorunlu)</label>
                                        <textarea
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            placeholder="Salon sahibine iletilecek notu yazın..."
                                            className="w-full p-5 rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all text-sm font-medium resize-none min-h-[100px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-border bg-gray-50/50 flex gap-4">
                                <button
                                    onClick={() => handleReject(selectedRequest.id)}
                                    disabled={processing === selectedRequest.id}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 font-black rounded-2xl border border-red-100 hover:bg-red-100 transition-all disabled:opacity-50"
                                >
                                    <XCircle className="w-5 h-5" /> Reddet
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedRequest.id)}
                                    disabled={processing === selectedRequest.id}
                                    className="flex-[2] flex items-center justify-center gap-2 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-hover hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {processing === selectedRequest.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    Onayla ve Yayınla
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-[40px] border border-dashed border-border p-12 text-center text-text-secondary opacity-60">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <AlertCircle className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold">Talep Seçilmedi</h3>
                            <p className="max-w-xs mx-auto text-sm mt-2 font-medium">Detayları incelemek ve işlem yapmak için soldaki listeden bir talep seçin.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
