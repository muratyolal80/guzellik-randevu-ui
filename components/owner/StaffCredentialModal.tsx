'use client';

import { useState } from 'react';
import { X, Key, UserPlus, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, Lock, Trash2 } from 'lucide-react';
import { PASSWORD_HINT_TR } from '@/lib/auth/password';

interface StaffCredentialModalProps {
    staffId: string;
    staffName: string;
    hasAccount: boolean;
    onClose: () => void;
    onUpdated?: () => void;
}

/**
 * Salon sahibinin personel login hesabını yönetmek için modal.
 *
 * Üç sekme:
 *   - hasAccount=false → "Hesap Oluştur" (email + şifre)
 *   - hasAccount=true → "Şifre Sıfırla" + "Login Devre Dışı Bırak"
 *
 * Tüm işlemler /api/owner/staff/[id]/{create-account,reset-password,disable-login}
 * üzerinden service_role ile yürütülür.
 */
export default function StaffCredentialModal({
    staffId,
    staffName,
    hasAccount,
    onClose,
    onUpdated,
}: StaffCredentialModalProps) {
    const [tab, setTab] = useState<'create' | 'reset' | 'disable'>(
        hasAccount ? 'reset' : 'create',
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-indigo-50/50 rounded-t-3xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-text-main">Hesap Yönetimi</h3>
                            <p className="text-xs font-bold text-text-muted">{staffName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-text-muted hover:bg-gray-100 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs (sadece hesap varsa) */}
                {hasAccount && (
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setTab('reset')}
                            className={`flex-1 px-4 py-3 text-xs font-black uppercase tracking-widest transition border-b-2 ${
                                tab === 'reset'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-muted hover:text-text-main'
                            }`}
                        >
                            Şifre Sıfırla
                        </button>
                        <button
                            onClick={() => setTab('disable')}
                            className={`flex-1 px-4 py-3 text-xs font-black uppercase tracking-widest transition border-b-2 ${
                                tab === 'disable'
                                    ? 'border-rose-500 text-rose-600'
                                    : 'border-transparent text-text-muted hover:text-text-main'
                            }`}
                        >
                            Login Kapat
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="p-6">
                    {tab === 'create' && (
                        <CreateAccountForm
                            staffId={staffId}
                            onSuccess={() => {
                                onUpdated?.();
                                setTimeout(onClose, 1500);
                            }}
                        />
                    )}
                    {tab === 'reset' && (
                        <ResetPasswordForm
                            staffId={staffId}
                            onSuccess={() => {
                                onUpdated?.();
                                setTimeout(onClose, 1500);
                            }}
                        />
                    )}
                    {tab === 'disable' && (
                        <DisableLoginForm
                            staffId={staffId}
                            onSuccess={() => {
                                onUpdated?.();
                                setTimeout(onClose, 1500);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function FormField({
    label,
    children,
    hint,
}: {
    label: string;
    children: React.ReactNode;
    hint?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                {label}
            </label>
            {children}
            {hint && <p className="text-[10px] text-text-muted">{hint}</p>}
        </div>
    );
}

function StatusMsg({
    error,
    success,
}: { error?: string | null; success?: string | null }) {
    if (!error && !success) return null;
    return error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
    ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs font-bold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
    );
}

function CreateAccountForm({
    staffId,
    onSuccess,
}: { staffId: string; onSuccess: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch(`/api/owner/staff/${staffId}/create-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.error || 'Oluşturulamadı');
                return;
            }
            setSuccess('Hesap oluşturuldu! Şifreyi personele iletebilirsin.');
            onSuccess();
        } catch (err: any) {
            setError(err?.message || 'Ağ hatası');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs font-bold text-blue-800 flex items-start gap-2">
                <UserPlus className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                    <p>Hesabı sen oluştur; personele email ve şifreyi ilet.</p>
                    <p className="opacity-80 mt-0.5">Personel ilk giriş sonrası şifresini değiştirebilir.</p>
                </div>
            </div>

            <FormField label="Email">
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="personel@isletme.com"
                    className="w-full h-11 px-3 rounded-xl border border-border bg-white text-text-main font-medium focus:border-primary focus:outline-none"
                />
            </FormField>

            <FormField label="Şifre" hint={PASSWORD_HINT_TR}>
                <div className="relative">
                    <input
                        type={showPw ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="En az 8 karakter"
                        className="w-full h-11 px-3 pr-10 rounded-xl border border-border bg-white text-text-main font-medium focus:border-primary focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPw((p) => !p)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-main"
                    >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </FormField>

            <StatusMsg error={error} success={success} />

            <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                Hesabı Oluştur
            </button>
        </form>
    );
}

function ResetPasswordForm({
    staffId,
    onSuccess,
}: { staffId: string; onSuccess: () => void }) {
    const [newPassword, setNewPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch(`/api/owner/staff/${staffId}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.error || 'Sıfırlanamadı');
                return;
            }
            setSuccess('Şifre güncellendi! Personele yeni şifreyi ilet.');
            onSuccess();
        } catch (err: any) {
            setError(err?.message || 'Ağ hatası');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs font-bold text-amber-800 flex items-start gap-2">
                <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Personel şifresini hatırlamıyor mu? Yeni bir şifre belirle ve kendisine ilet.</p>
            </div>

            <FormField label="Yeni Şifre" hint={PASSWORD_HINT_TR}>
                <div className="relative">
                    <input
                        type={showPw ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="En az 8 karakter"
                        className="w-full h-11 px-3 pr-10 rounded-xl border border-border bg-white text-text-main font-medium focus:border-primary focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPw((p) => !p)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-main"
                    >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </FormField>

            <StatusMsg error={error} success={success} />

            <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                Şifreyi Sıfırla
            </button>
        </form>
    );
}

function DisableLoginForm({
    staffId,
    onSuccess,
}: { staffId: string; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const submit = async () => {
        if (!window.confirm('Personelin login hesabını devre dışı bırakmak istediğinize emin misiniz?\n\n• Personel artık /staff/dashboard\'a giriş yapamayacak\n• Staff kaydı silinmeyecek (takvimde görünmeye devam edecek)\n• Sonradan tekrar hesap oluşturabilirsin')) return;

        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch(`/api/owner/staff/${staffId}/disable-login`, {
                method: 'POST',
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.error || 'İşlem başarısız');
                return;
            }
            setSuccess('Login devre dışı bırakıldı.');
            onSuccess();
        } catch (err: any) {
            setError(err?.message || 'Ağ hatası');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-2 text-xs font-bold text-rose-800">
                <p className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                        Personelin login hesabını devre dışı bırakırsan kendi paneline
                        giriş yapamaz. Ama:
                    </span>
                </p>
                <ul className="ml-6 list-disc space-y-1 opacity-90">
                    <li>Staff kaydı silinmez (takvimde görünür)</li>
                    <li>Geçmiş randevu/yorum verisi kaybolmaz</li>
                    <li>Sonradan tekrar hesap oluşturabilirsin</li>
                </ul>
            </div>

            <StatusMsg error={error} success={success} />

            <button
                onClick={submit}
                disabled={loading}
                className="w-full h-11 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                <Trash2 className="w-3 h-3" />
                Login Hesabını Devre Dışı Bırak
            </button>
        </div>
    );
}
