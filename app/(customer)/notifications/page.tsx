'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Info, Calendar, Tag, Check, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (!error) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            }
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'REMINDER': return <Calendar className="w-5 h-5 text-amber-600" />;
            case 'PROMOTION': return <Tag className="w-5 h-5 text-pink-600" />;
            case 'SYSTEM': return <Info className="w-5 h-5 text-blue-600" />;
            default: return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'REMINDER': return 'bg-amber-100';
            case 'PROMOTION': return 'bg-pink-100';
            case 'SYSTEM': return 'bg-blue-100';
            default: return 'bg-gray-100';
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
                <span className="text-sm text-gray-500">{notifications.filter(n => !n.is_read).length} okunmamış</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {notifications.length > 0 ? notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`p-6 flex gap-4 transition-colors hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-amber-50/30' : ''}`}
                    >
                        <div className={`p-3 rounded-full h-fit flex-shrink-0 ${getBgColor(notif.type)}`}>
                            {getIcon(notif.type)}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className={`font-bold text-gray-900 ${!notif.is_read ? 'text-black' : 'text-gray-700'}`}>{notif.title}</h3>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                    {new Date(notif.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-600 mt-1 text-sm leading-relaxed">{notif.message}</p>
                        </div>

                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.is_read && (
                                <button
                                    onClick={(e) => markAsRead(notif.id, e)}
                                    className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-amber-600" title="Okundu işaretle"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}
                            <button className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500" title="Sil">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center text-gray-500">
                        Hiç bildiriminiz yok.
                    </div>
                )}
            </div>
        </div>
    );
}
