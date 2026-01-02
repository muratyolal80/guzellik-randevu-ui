'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Only redirect if we're ABSOLUTELY SURE there's no user
        if (!authLoading && !user) {
            // Small delay to ensure auth state has fully settled
            const timer = setTimeout(() => {
                router.push('/login?redirect=/profile');
            }, 100);

            return () => clearTimeout(timer);
        } else if (user) {
            setFullName(user.full_name || '');
            setPhone(user.phone || '');
            setAvatarUrl(user.avatar_url || '');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone: phone,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user?.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Profil güncellenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <Layout>
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-secondary">Yükleniyor...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Layout>
            <div className="flex-1 bg-gray-50 py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl border border-border shadow-card p-8">
                        <h1 className="text-3xl font-bold text-text-main mb-2">Profilim</h1>
                        <p className="text-text-secondary mb-8">Hesap bilgilerinizi güncelleyin</p>

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-700 text-sm">✓ Profil başarıyla güncellendi!</p>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email (Read-only) */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">E-posta</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full h-12 px-4 rounded-lg border border-border bg-gray-100 text-text-secondary cursor-not-allowed"
                                />
                                <p className="text-xs text-text-muted mt-1">E-posta adresi değiştirilemez</p>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    disabled={loading}
                                    placeholder="Adınız Soyadınız"
                                    className="w-full h-12 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Telefon</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    disabled={loading}
                                    placeholder="0555 123 45 67"
                                    className="w-full h-12 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50"
                                />
                            </div>

                            {/* Avatar URL */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Profil Fotoğrafı URL</label>
                                <input
                                    type="url"
                                    value={avatarUrl}
                                    onChange={e => setAvatarUrl(e.target.value)}
                                    disabled={loading}
                                    placeholder="https://example.com/photo.jpg"
                                    className="w-full h-12 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none disabled:opacity-50"
                                />
                                {avatarUrl && (
                                    <div className="mt-3">
                                        <div
                                            className="size-20 rounded-full bg-cover bg-center border-2 border-border"
                                            style={{ backgroundImage: `url("${avatarUrl}")` }}
                                        ></div>
                                    </div>
                                )}
                            </div>

                            {/* Role (Read-only) */}
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Rol</label>
                                <input
                                    type="text"
                                    value={
                                        user.role === 'SUPER_ADMIN' ? 'Süper Yönetici' :
                                        user.role === 'SALON_OWNER' ? 'Salon Sahibi' :
                                        user.role === 'STAFF' ? 'Personel' :
                                        'Müşteri'
                                    }
                                    disabled
                                    className="w-full h-12 px-4 rounded-lg border border-border bg-gray-100 text-text-secondary cursor-not-allowed"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Güncelleniyor...</span>
                                    </>
                                ) : (
                                    'Profili Güncelle'
                                )}
                            </button>
                        </form>

                        {/* Account Info */}
                        <div className="mt-8 pt-8 border-t border-border">
                            <h3 className="text-lg font-bold text-text-main mb-4">Hesap Bilgileri</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary">Hesap ID:</span>
                                    <span className="text-text-main font-mono text-xs">{user.id}</span>
                                </div>
                                {user.created_at && (
                                    <div className="flex justify-between">
                                        <span className="text-text-secondary">Kayıt Tarihi:</span>
                                        <span className="text-text-main">{new Date(user.created_at).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

