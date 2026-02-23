'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Info, CheckCircle2, AlertCircle, Calendar, MessageSquare, Menu } from 'lucide-react';
import { NotificationService } from '@/services/db';
import { Notification } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function NotificationCenter() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        if (user) {
            fetchNotifications();

            // Subscribe to real-time notifications
            const channel = supabase
                .channel(`notifications-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        const newNotif = payload.new as Notification;
                        setNotifications(prev => [newNotif, ...prev]);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await NotificationService.getNotifications(user.id);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await NotificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;
        try {
            await NotificationService.markAllAsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'WARNING': return <AlertCircle className="w-5 h-5 text-amber-500" />;
            case 'ERROR': return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'APPOINTMENT': return <Calendar className="w-5 h-5 text-primary" />;
            case 'REVIEW': return <MessageSquare className="w-5 h-5 text-purple-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-all group"
            >
                <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-primary fill-primary/10' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                        {/* Header */}
                        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white">
                            <h3 className="font-bold text-lg text-gray-900">Bildirimler</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" />
                                    Tümünü oku
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[420px] overflow-y-auto no-scrollbar">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                                    <p className="text-sm text-gray-500">Yükleniyor...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">Henüz bildirim yok</h4>
                                    <p className="text-sm text-gray-500">Yeni bir gelişme olduğunda burada görünecek.</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!notif.is_read ? 'bg-primary/5' : ''}`}
                                        onClick={() => handleMarkAsRead(notif.id)}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className={`text-sm font-bold ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notif.title}
                                                </h5>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: tr })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                                {notif.content}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50/50 text-center border-t border-gray-100">
                            <button className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                                Tüm bildirimleri gör
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
