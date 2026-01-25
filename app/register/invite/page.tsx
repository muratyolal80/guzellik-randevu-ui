'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { InviteService } from '@/services/db';
import { Invite } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, ShieldCheck, Mail, Loader2, Sparkles } from 'lucide-react';

export default function InviteRegister() {
    return (
        <Layout>
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
            }>
                <InviteRegisterContent />
            </Suspense>
        </Layout>
    );
}

function InviteRegisterContent() {
    const { signUp, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [invite, setInvite] = useState<Invite | null>(null);
    const [inviteLoading, setInviteLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Geçersiz veya eksik davet linki.');
            setInviteLoading(false);
            return;
        }

        const fetchInvite = async () => {
            try {
                const data = await InviteService.getInviteByToken(token);
                if (!data) {
                    setError('Davet linki geçersiz, süresi dolmuş veya kullanılmış.');
                } else {
                    setInvite(data);
                }
            } catch (err) {
                setError('Davet bilgisi yüklenirken hata oluştu.');
            } finally {
                setInviteLoading(false);
            }
        };
        fetchInvite();
    }, [token]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invite) return;

        setError(null);
        setLoading(true);

        if (!firstName || !lastName || !password) {
            setError('Lütfen tüm alanları doldurunuz.');
            setLoading(false);
            return;
        }

        try {
            // 1. Sign up user
            const data = await signUp(invite.email, password, firstName, lastName, invite.role);

            if (!data?.user) {
                throw new Error('Kullanıcı oluşturulamadı.');
            }

            // 2. Accept invite and create membership
            await InviteService.acceptInvite(invite.id, data.user.id);

            setSuccess(true);

            // 3. Redirect to dashboard after a bit
            setTimeout(() => {
                router.push('/owner/dashboard');
            }, 2000);
        } catch (err) {
            console.error('Invite acceptance error:', err);
            setError('Kayıt sırasında bir hata oluştu. E-posta zaten kayıtlı olabilir.');
        } finally {
            setLoading(false);
        }
    };

    if (inviteLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-sm font-black text-text-secondary uppercase tracking-widest">Davet Doğrulanıyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md mx-auto">

                {error ? (
                    <div className="bg-white rounded-[32px] border border-red-100 shadow-card p-10 text-center space-y-6 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto border border-red-100">
                            <ShieldCheck className="w-10 h-10 opacity-50" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-text-main">Hata!</h2>
                            <p className="text-sm font-medium text-text-secondary leading-relaxed">{error}</p>
                        </div>
                        <button onClick={() => router.push('/login')} className="w-full h-12 bg-gray-100 text-text-main font-bold rounded-2xl hover:bg-gray-200 transition-all">Giriş Ekranına Dön</button>
                    </div>
                ) : invite && (
                    <div className="bg-white rounded-[32px] border border-border shadow-card overflow-hidden">
                        <div className="bg-primary/5 p-8 border-b border-primary/10 text-center">
                            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20 mb-4">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Ekibe Katılın!</h2>
                            <p className="text-xs font-bold text-text-secondary mt-2">
                                <span className="text-primary">{invite.salon?.name}</span> sizi <span className="text-primary">{invite.role}</span> olarak davet etti.
                            </p>
                        </div>

                        <div className="p-8 sm:p-10">
                            {success ? (
                                <div className="py-10 text-center space-y-4 animate-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto border border-green-100">
                                        <ShieldCheck className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-xl font-black text-text-main">Hoş Geldiniz!</h3>
                                    <p className="text-sm font-medium text-text-secondary">Hesabınız oluşturuldu. Paneliniz yükleniyor...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-5">
                                    <div className="bg-gray-100/50 p-4 rounded-2xl flex items-center gap-3 border border-gray-100">
                                        <Mail className="w-4 h-4 text-text-muted" />
                                        <span className="text-sm font-black text-text-secondary">{invite.email}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-sm">AD</label>
                                            <input className="input-field" placeholder="Adınız" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label-sm">SOYAD</label>
                                            <input className="input-field" placeholder="Soyadınız" value={lastName} onChange={e => setLastName(e.target.value)} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label-sm">ŞİFRE</label>
                                        <input type="password" className="input-field" placeholder="Şifrenizi belirleyin" value={password} onChange={e => setPassword(e.target.value)} />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/25 hover:bg-primary-hover transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
                                    >
                                        {loading ? 'KAYDINIZ TAMAMLANIYOR...' : 'DAVETİ KABUL ET VE KAYDOL'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

            </div>

            <style jsx>{`
            .label-sm {
                display: block;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: #64748b;
                margin-bottom: 8px;
                padding-left: 4px;
            }
            .input-field {
                width: 100%;
                height: 56px;
                padding: 0 20px;
                border-radius: 18px;
                border: 1.5px solid #e2e8f0;
                background-color: #f8fafc;
                font-weight: 600;
                font-size: 14px;
                outline: none;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                color: #0f172a;
            }
            .input-field:focus {
                background-color: white;
                border-color: #f17290;
                box-shadow: 0 0 0 4px rgba(241, 114, 144, 0.1);
            }
            `}</style>
        </div>
    );
}
