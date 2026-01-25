'use client';

import React, { useEffect, useState } from 'react';
import { Camera, Save, Lock, Mail, Phone, Calendar, User as UserIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        birth_date: ''
    });
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

                // Initial data from auth user
                let initialData = {
                    first_name: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
                    last_name: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    birth_date: ''
                };

                // Get extended profile data
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    initialData = {
                        ...initialData,
                        first_name: profile.first_name || initialData.first_name,
                        last_name: profile.last_name || initialData.last_name,
                        phone: profile.phone || initialData.phone,
                        email: user.email || '', // Always trust auth email first
                        birth_date: profile.birth_date || ''
                    };
                    setAvatarUrl(profile.avatar_url || user.user_metadata?.avatar_url || null);
                }

                setFormData(initialData);

            } catch (error) {
                console.error('Error fetching profile:', error);
                // Even on error, we might have set some data if we refactored differently, 
                // but here user flow starts from auth.getUser.
            } finally {
                setLoading(false);
            }
        }


        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            if (loading) {
                console.warn('Profile fetch timed out, forcing load completion');
                setLoading(false);
            }
        }, 3000);

        fetchProfile();

        return () => clearTimeout(timeoutId);
    }, [router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            const updates = {
                id: user.id,
                email: user.email, // Required field for upsert if row doesn't exist
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                birth_date: formData.birth_date || null,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            alert('Profiliniz başarıyla güncellendi.');
        } catch (error: any) {
            alert(`Profil güncellenirken bir hata oluştu: ${error.message || error}`);
            console.error('Update Error:', error);
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
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden ring-4 ring-white shadow-lg">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <UserIcon className="w-10 h-10" />
                                </div>
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-amber-500 text-white rounded-full shadow-md hover:bg-amber-600 transition-colors">
                            <Camera className="w-4 h-4" />
                        </button>
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
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: formData.newPassword
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi.' });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Şifre güncellenirken bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handlePasswordChange} className="space-y-4">
            {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                <input
                    type="password"
                    required
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                    <input
                        type="password"
                        required
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                    <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                </div>
            </div>
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-70"
                >
                    {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </button>
            </div>
        </form>
    );
}
