'use client';

import React, { useState, useEffect } from 'react';
import { Save, Lock, Mail, Phone, Calendar, User as UserIcon, Loader2 } from 'lucide-react';
import { ProfileService } from '@/services/db';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

export default function ProfilePage() {
    const router = useRouter();
    const { user, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(!user);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        birth_date: user?.birth_date || ''
    });
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar_url || undefined);

    useEffect(() => {
        if (!user && !loading) {
            router.push('/login');
            return;
        }

        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                email: user.email || '',
                birth_date: user.birth_date || ''
            });
            setAvatarUrl(user.avatar_url || undefined);
            setLoading(false);
        }
    }, [user, router, loading]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        try {
            await ProfileService.updateProfile(user.id, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                birth_date: formData.birth_date || undefined,
                avatar_url: avatarUrl || undefined,
            });
            await refreshProfile();
            alert('Profiliniz başarıyla güncellendi.');
        } catch (error: any) {
            alert(`Profil güncellenirken bir hata oluştu: ${error.message || error}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profil Ayarları</h1>
                <p className="text-gray-500">Kişisel bilgilerinizi buradan güncelleyebilirsiniz.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                    <div className="w-32 h-32 mb-4">
                        <ImageUpload
                            bucket="avatars"
                            currentImage={avatarUrl}
                            onUpload={(url) => setAvatarUrl(url)}
                            label="Profil Fotoğrafı"
                            className="bg-gray-100"
                        />
                    </div>
                    <h2 className="font-bold text-lg text-gray-900">{formData.first_name} {formData.last_name}</h2>
                    <p className="text-gray-500 text-sm mb-4">{formData.email}</p>
                </div>

                {/* Settings Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-gray-400" /> Kişisel Bilgiler
                        </h3>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            {/* ... existing profile inputs ... */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                                    <div className="relative">
                                        <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                                    <div className="relative">
                                        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Doğum Tarihi</label>
                                <div className="relative">
                                    <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm shadow-amber-200 transition-colors flex items-center gap-2 disabled:opacity-70"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div id="password-section" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-gray-400" /> Şifre Değiştir
                        </h3>
                        <PasswordChangeForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

function PasswordChangeForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Şifreler eşleşmiyor!');
            return;
        }

        setLoading(true);
        try {
            const { supabase } = await import('@/lib/supabase');
            const { error: authError } = await supabase.auth.updateUser({
                password: formData.newPassword
            });

            if (authError) throw authError;

            alert('Şifreniz başarıyla güncellendi.');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            alert(`Hata: ${error.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                <input
                    type="password"
                    required
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                />
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-70 transition-all"
                >
                    {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </button>
            </div>
        </form>
    );
}
