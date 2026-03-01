'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Bell, Shield, User, Trash2, Mail, MessageSquare, Globe, MapPin, Loader2, Monitor } from 'lucide-react';
import { ProfileService, MasterDataService } from '@/services/db';
import { SessionManager } from '@/components/account/SessionManager';
import { City } from '@/types';

export default function SettingsPage() {
    const { user, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState<City[]>([]);
    const [notifications, setNotifications] = useState({
        marketing_opt_in: user?.marketing_opt_in || false,
        language_preference: user?.language_preference || 'tr',
        default_city_id: user?.default_city_id || ''
    });

    useEffect(() => {
        async function loadCities() {
            try {
                const data = await MasterDataService.getCities();
                setCities(data);
            } catch (err) {
                console.error(err);
            }
        }
        loadCities();
    }, []);

    const handleUpdatePref = async (updates: any) => {
        if (!user) return;
        setLoading(true);
        try {
            await ProfileService.updateProfile(user.id, updates);
            await refreshProfile();
            setNotifications(prev => ({ ...prev, ...updates }));
        } catch (error) {
            console.error('Update preference error:', error);
            alert('Ayarlar kaydedilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
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
                            <label className="text-sm text-gray-700">Pazarlama ve Kampanya İzinleri (KVKK)</label>
                            <Toggle
                                checked={notifications.marketing_opt_in}
                                onChange={() => handleUpdatePref({ marketing_opt_in: !notifications.marketing_opt_in })}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 my-6"></div>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg h-fit">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">Bölgesel Tercihler</h3>
                                <p className="text-sm text-gray-500">Dil ve varsayılan şehir ayarlarınız.</p>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Dil</label>
                                        <select
                                            value={notifications.language_preference}
                                            onChange={(e) => handleUpdatePref({ language_preference: e.target.value })}
                                            className="w-full text-sm border-gray-200 rounded-lg focus:ring-amber-500"
                                        >
                                            <option value="tr">Türkçe</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Varsayılan Şehir</label>
                                        <select
                                            value={notifications.default_city_id}
                                            onChange={(e) => handleUpdatePref({ default_city_id: e.target.value })}
                                            className="w-full text-sm border-gray-200 rounded-lg focus:ring-amber-500"
                                        >
                                            <option value="">Seçiniz</option>
                                            {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Oturum Yönetimi (Faz 1 Bonus) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 text-blue-600 mb-1">
                        <Monitor className="w-5 h-5" />
                        <h2 className="font-bold text-gray-900">Aktif Oturumlar</h2>
                    </div>
                </div>
                <div className="p-6">
                    {user && <SessionManager userId={user.id} />}
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
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900">Hesabı Geçici Dondur</h3>
                            <p className="text-sm text-gray-500 max-w-md">Hesabınızı dondurduğunuzda profiliniz görünmez olur ancak verileriniz saklanır.</p>
                        </div>
                        <button
                            onClick={() => handleUpdatePref({ is_active: false })}
                            className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                            Hesabı Dondur
                        </button>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900">Hesabımı Sil</h3>
                            <p className="text-sm text-gray-500 max-w-md">Profilinize silme talebi eklenir. 30 gün içinde giriş yaparak geri alabilirsiniz.</p>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm('Hesabınızı silmek istediğinize emin misiniz? 30 gün içinde geri alabilirsiniz.')) {
                                    try {
                                        await ProfileService.requestAccountDeletion();
                                        alert('Hesap silme talebiniz alındı. Oturumunuz kapatılıyor.');
                                        // Sign out logic...
                                    } catch (e) { alert('Hata oluştu.'); }
                                }
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                        >
                            Silme Talebi Oluştur
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void, disabled?: boolean }) {
    return (
        <button
            onClick={onChange}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 ${checked ? 'bg-amber-500' : 'bg-gray-200'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );
}
