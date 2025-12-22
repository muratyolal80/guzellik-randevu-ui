'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
    const { signInWithGoogle, signInWithEmail } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await signInWithEmail(email, password);
            router.push('/');
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <Layout>
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl border border-border shadow-card p-8">
                        <h2 className="text-2xl font-bold text-center text-text-main mb-2">Giriş Yap</h2>
                        <p className="text-center text-text-secondary mb-8">Hesabınıza giriş yaparak randevularınızı yönetin.</p>

                        <button onClick={signInWithGoogle} className="w-full h-12 flex items-center justify-center gap-3 border border-border rounded-lg hover:bg-gray-50 transition-colors font-bold text-text-main">
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="size-5" />
                            Google ile Giriş Yap
                        </button>

                        <div className="flex items-center my-6">
                            <hr className="flex-grow border-t border-border" />
                            <span className="mx-4 text-xs text-text-muted">VEYA</span>
                            <hr className="flex-grow border-t border-border" />
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">E-posta</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-main mb-2">Şifre</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none" />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <button type="submit" className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors">Giriş Yap</button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

