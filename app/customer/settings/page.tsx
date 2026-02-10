'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Bell, Shield, User, Trash2, Mail, MessageSquare } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState({
        email_marketing: true,
        email_transactional: true,
        sms_marketing: false,
        sms_transactional: true
    });

    const handleToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        // TODO: Call API to update preferences
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hesap Ayarları</h1>
                    <p className="text-gray-500 mt-1">Bildirim ve güvenlik tercihlerinizi yönetin.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 text-amber-600 mb-1">
                        <Bell className="w-5 h-5" />
                        <h2 className="font-bold text-gray-900">Bildirim Tercihleri</h2>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">E-Posta Bildirimleri</h3>
                                <p className="text-sm text-gray-500 max-w-md">Randevu hatırlatmaları ve kampanya duyuruları.</p>
                            </div>
                        </div>
                    </div>

                    <div className="ml-14 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-700">Randevu Durum Güncellemeleri</label>
                            <Toggle
                                checked={notifications.email_transactional}
                                onChange={() => handleToggle('email_transactional')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-700">Kampanyalar ve Fırsatlar</label>
                            <Toggle
                                checked={notifications.email_marketing}
                                onChange={() => handleToggle('email_marketing')}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 my-4"></div>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg h-fit">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">SMS Bildirimleri</h3>
                                <p className="text-sm text-gray-500 max-w-md">Acil durumlar ve anlık hatırlatmalar.</p>
                            </div>
                        </div>
                    </div>
                    <div className="ml-14 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-700">Randevu Hatırlatmaları (1 saat önce)</label>
                            <Toggle
                                checked={notifications.sms_transactional}
                                onChange={() => handleToggle('sms_transactional')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-700">SMS Kampanyaları</label>
                            <Toggle
                                checked={notifications.sms_marketing}
                                onChange={() => handleToggle('sms_marketing')}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 text-gray-700 mb-1">
                        <Shield className="w-5 h-5" />
                        <h2 className="font-bold text-gray-900">Güvenlik</h2>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        import Link from 'next/link';

                        // ... (inside component)

                        <div>
                            <h3 className="font-medium text-gray-900">Şifre Değiştir</h3>
                            <p className="text-sm text-gray-500">Güvenliğiniz için belirli aralıklarla şifrenizi değiştirin.</p>
                        </div>
                        <Link href="/customer/profile#password-section" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Şifre Yenile
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-red-50 bg-red-50/30">
                    <div className="flex items-center gap-3 text-red-600 mb-1">
                        <Trash2 className="w-5 h-5" />
                        <h2 className="font-bold text-red-700">Tehlikeli Bölge</h2>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900">Hesabımı Sil</h3>
                            <p className="text-sm text-gray-500 max-w-md">Bu işlem geri alınamaz. Tüm randevularınız ve verileriniz silinecektir.</p>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200">
                            Hesabı Sil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${checked ? 'bg-amber-500' : 'bg-gray-200'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );
}
