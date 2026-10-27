'use client';

import React, { useEffect, useState } from 'react';
import { Monitor, Smartphone, Globe, XCircle, Loader2, Clock, ShieldCheck } from 'lucide-react';
import { ProfileService } from '@/services/db';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import Skeleton from '@/components/Skeleton';

interface UserSession {
    id: string;
    ip_address: string;
    user_agent: string;
    device_name: string;
    last_active_at: string;
    is_revoked: boolean;
    created_at: string;
}

export function SessionManager({ userId }: { userId: string }) {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [terminatingId, setTerminatingId] = useState<string | null>(null);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await ProfileService.getActiveSessions(userId);
            setSessions(data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            showToast('Oturumlar yüklenemedi.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchSessions();
    }, [userId]);

    const handleTerminate = async (sessionId: string) => {
        try {
            setTerminatingId(sessionId);
            await ProfileService.terminateSession(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch (error) {
            showToast('Oturum sonlandırılırken bir hata oluştu.', 'error');
        } finally {
            setTerminatingId(null);
        }
    };

    const handleTerminateOthers = async () => {
        if (!(await confirm({ title: 'Diğer oturumlar kapatılsın mı?', message: 'Diğer tüm cihazlardaki oturumlarınızı kapatmak istediğinize emin misiniz?', tone: 'danger', confirmText: 'Kapat' }))) return;

        try {
            // Not: Mevcut oturum ID'sini tespit etmek için logic gerekebilir, 
            // şimdilik basit tutuyoruz.
            setLoading(true);
            await ProfileService.terminateAllOtherSessions(userId, 'current-id-placeholder');
            await fetchSessions();
        } catch (error) {
            showToast('İşlem başarısız.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (userAgent: string) => {
        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return <Smartphone className="w-5 h-5" aria-hidden="true" />;
        return <Monitor className="w-5 h-5" aria-hidden="true" />;
    };

    if (loading && sessions.length === 0) {
        return (
            <div className="space-y-3" aria-busy="true" aria-label="Yükleniyor">
                {[0, 1].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Hesabınıza erişimi olan cihazlar.</p>
                {sessions.length > 1 && (
                    <button
                        onClick={handleTerminateOthers}
                        className="text-xs font-bold text-primary hover:text-primary underline underline-offset-4"
                    >
                        Diğer Cihazları Kapat
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {sessions.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                        <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" aria-hidden="true" />
                        <p className="text-sm text-text-muted">Aktif oturum kaydı bulunamadı.</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-hover hover:border-amber-100">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400">
                                    {getDeviceIcon(session.user_agent)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-gray-900">{session.device_name || 'Bilinmeyen Cihaz'}</h4>
                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase">Aktif</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                                        <span className="flex items-center gap-1 font-medium"><Clock className="w-3 h-3" aria-hidden="true" /> {new Date(session.last_active_at).toLocaleString('tr-TR')}</span>
                                        <span className="flex items-center gap-1 font-medium"><Globe className="w-3 h-3" aria-hidden="true" /> {session.ip_address}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleTerminate(session.id)}
                                disabled={terminatingId === session.id}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Oturumu Kapat"
                            >
                                {terminatingId === session.id ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <XCircle className="w-5 h-5" aria-hidden="true" />}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
