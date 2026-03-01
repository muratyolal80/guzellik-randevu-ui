'use client';

import React, { useEffect, useState } from 'react';
import { Monitor, Smartphone, Globe, XCircle, Loader2, Clock, ShieldCheck } from 'lucide-react';
import { ProfileService } from '@/services/db';

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
            alert('Oturum sonlandırılırken bir hata oluştu.');
        } finally {
            setTerminatingId(null);
        }
    };

    const handleTerminateOthers = async () => {
        if (!confirm('Diğer tüm cihazlardaki oturumlarınızı kapatmak istediğinize emin misiniz?')) return;

        try {
            // Not: Mevcut oturum ID'sini tespit etmek için logic gerekebilir, 
            // şimdilik basit tutuyoruz.
            setLoading(true);
            await ProfileService.terminateAllOtherSessions(userId, 'current-id-placeholder');
            await fetchSessions();
        } catch (error) {
            alert('İşlem başarısız.');
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (userAgent: string) => {
        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return <Smartphone className="w-5 h-5" />;
        return <Monitor className="w-5 h-5" />;
    };

    if (loading && sessions.length === 0) {
        return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">Hesabınıza erişimi olan cihazlar.</p>
                {sessions.length > 1 && (
                    <button
                        onClick={handleTerminateOthers}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 underline underline-offset-4"
                    >
                        Diğer Cihazları Kapat
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {sessions.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                        <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Aktif oturum kaydı bulunamadı.</p>
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
                                        <span className="flex items-center gap-1 font-medium"><Clock className="w-3 h-3" /> {new Date(session.last_active_at).toLocaleString('tr-TR')}</span>
                                        <span className="flex items-center gap-1 font-medium"><Globe className="w-3 h-3" /> {session.ip_address}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleTerminate(session.id)}
                                disabled={terminatingId === session.id}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Oturumu Kapat"
                            >
                                {terminatingId === session.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-5 h-5" />}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
