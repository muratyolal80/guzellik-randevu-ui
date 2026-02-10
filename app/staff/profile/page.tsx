'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
    User,
    Camera,
    Save,
    ShieldCheck,
    Briefcase,
    Mail,
    Phone,
    CheckCircle2
} from 'lucide-react';

export default function StaffProfile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [staffData, setStaffData] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [bio, setBio] = useState('');
    const [photo, setPhoto] = useState('');

    useEffect(() => {
        if (user) {
            fetchStaffProfile();
        }
    }, [user]);

    const fetchStaffProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('staff')
                .select('*')
                .eq('user_id', user?.id)
                .single();

            if (data) {
                setStaffData(data);
                setName(data.name || '');
                setSpecialty(data.specialty || '');
                setBio(data.bio || '');
                setPhoto(data.photo || '');
            }
        } catch (err) {
            console.error('Profil yüklenirken hata:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('staff')
                .update({
                    name,
                    specialty,
                    bio,
                    photo,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user?.id);

            if (error) throw error;

            // Profile tablosunu da güncelle (isim değiştiyse)
            await supabase
                .from('profiles')
                .update({ full_name: name })
                .eq('id', user?.id);

            setMessage({ type: 'success', text: 'Profiliniz başarıyla güncellendi.' });
        } catch (err) {
            console.error('Güncelleme hatası:', err);
            setMessage({ type: 'error', text: 'Güncelleme sırasında bir hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            <div>
                <h1 className="text-3xl font-black text-text-main tracking-tight">Profilim</h1>
                <p className="text-text-secondary font-medium">Uzmanlık bilgilerinizi ve profil detaylarınızı buradan düzenleyin.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    <span className="text-sm font-bold">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Sol Kolon: Fotoğraf ve Kart */}
                <div className="md:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl border border-border shadow-card p-8 flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer mb-6">
                            <div className="w-32 h-32 rounded-3xl bg-surface-alt border-2 border-border overflow-hidden flex items-center justify-center text-text-muted transition-all group-hover:border-primary/50">
                                {photo ? (
                                    <img src={photo} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                                <Camera className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="font-black text-text-main text-lg leading-tight">{name || 'İsimsiz Personel'}</h3>
                        <p className="text-primary text-xs font-black uppercase tracking-widest mt-1 italic">{specialty || 'Branş Belirtilmedi'}</p>

                        <div className="w-full pt-6 mt-6 border-t border-gray-100 space-y-3">
                            <div className="flex items-center gap-3 text-text-secondary">
                                <Mail className="w-4 h-4" />
                                <span className="text-xs font-medium truncate">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-text-secondary">
                                <Phone className="w-4 h-4" />
                                <span className="text-xs font-medium">{user?.phone || 'Telefon Yok'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                        <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Güvenlik Logosu
                        </h4>
                        <p className="text-[11px] text-primary/70 leading-relaxed font-medium">Bilgileriniz sistem yöneticisi tarafından doğrulanmıştır. Uzmanlık alanınızdaki değişiklikler yöneticiniz tarafından onaylanabilir.</p>
                    </div>
                </div>

                {/* Sağ Kolon: Form Alanları */}
                <div className="md:col-span-8 space-y-6">
                    <div className="bg-white rounded-3xl border border-border shadow-card p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Tam İsim</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Adınız Soyadınız"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Uzmanlık Alanı</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Örn: Kıdemli Berber, Makyaj Uzmanı"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Profil Fotoğrafı URL</label>
                            <input
                                type="text"
                                value={photo}
                                onChange={(e) => setPhoto(e.target.value)}
                                className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-bold text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Hakkımda / Biyografi</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm font-medium text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[150px] resize-none"
                                placeholder="Deneyimlerinizden ve uzmanlıklarınızdan kısaca bahsedin..."
                            ></textarea>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? 'Güncelleniyor...' : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Değişiklikleri Kaydet
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-border shadow-card p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-text-main">Şifre Değiştir</h4>
                                <p className="text-xs text-text-secondary font-medium">Hesap güvenliğiniz için düzenli şifre güncelleyin.</p>
                            </div>
                        </div>
                        <button type="button" className="px-5 py-2.5 bg-gray-50 border border-border rounded-xl text-xs font-bold text-text-main hover:bg-gray-100 transition-all">Şifreyi Güncelle</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
