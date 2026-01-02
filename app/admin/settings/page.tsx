'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';

export default function Settings() {
    const [usercode, setUsercode] = useState('');
    const [password, setPassword] = useState('');
    const [header, setHeader] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load from LocalStorage on mount
        setUsercode(localStorage.getItem('netgsm_usercode') || '');
        setPassword(localStorage.getItem('netgsm_password') || '');
        setHeader(localStorage.getItem('netgsm_header') || '');
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('netgsm_usercode', usercode);
        localStorage.setItem('netgsm_password', password);
        localStorage.setItem('netgsm_header', header);

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const hasConfig = usercode.length > 0 && password.length > 0 && header.length > 0;

    return (
        <AdminLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-main">Sistem Ayarları</h2>
                <p className="text-text-secondary">Uygulama genelindeki entegrasyonlar ve yapılandırmalar.</p>
            </div>

            <div className="max-w-2xl space-y-8">

                {/* SMS Settings Card */}
                <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden relative">
                    {/* Status Indicator Bar */}
                    <div className={`h-1.5 w-full ${hasConfig ? 'bg-green-500' : 'bg-yellow-400'}`}></div>

                    <div className="p-6 border-b border-border bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined">sms</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-text-main">SMS Ayarları (Netgsm)</h3>
                                <p className="text-xs text-text-secondary flex items-center gap-1">
                                    Durum:
                                    <span className={`font-bold ${hasConfig ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {hasConfig ? 'Aktif (Gerçek Gönderim)' : 'Demo Modu'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <a href="https://www.netgsm.com.tr/" target="_blank" rel="noreferrer" className="text-xs text-primary font-bold hover:underline">Panel &rarr;</a>
                    </div>

                    <form onSubmit={handleSave} className="p-6 space-y-6">
                        {!hasConfig && (
                             <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm text-yellow-800 flex gap-3">
                                <span className="material-symbols-outlined shrink-0">warning</span>
                                <div>
                                    <p className="font-bold">Demo Modu Aktif</p>
                                    <p className="mt-1 text-xs">API bilgileri girilmediği için SMS gönderimi simüle edilmektedir. Onay ekranında kod olarak <strong>123456</strong> kullanılarak işlem tamamlanabilir.</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">Netgsm Kullanıcı Adı (Usercode)</label>
                            <input
                                type="text"
                                className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                value={usercode}
                                onChange={(e) => setUsercode(e.target.value)}
                                placeholder="850xxxxxxx"
                            />
                            <p className="text-[10px] text-text-secondary mt-1">API kullanıcısı veya abone numaranız.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">Şifre (Password)</label>
                            <input
                                type="password"
                                className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">Mesaj Başlığı (MsgHeader)</label>
                            <input
                                type="text"
                                className="w-full h-11 px-4 rounded-lg border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                value={header}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeader(e.target.value)}
                                placeholder="Örn: FIRMAADI"
                            />
                            <p className="text-[10px] text-text-secondary mt-1">Netgsm panelinde onaylı olan SMS başlığınız.</p>
                        </div>

                        <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                            {saved ? (
                                <span className="text-green-600 text-sm font-bold flex items-center gap-1 animate-fade-in-up">
                                    <span className="material-symbols-outlined text-lg">check_circle</span> Ayarlar Kaydedildi
                                </span>
                            ) : (
                                <span></span>
                            )}
                            <button
                                type="submit"
                                className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">save</span>
                                Kaydet
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                    <span className="material-symbols-outlined text-blue-600">info</span>
                    <div className="text-sm text-blue-800">
                        <p className="font-bold mb-1">Entegrasyon Bilgisi</p>
                        <ul className="list-disc ml-4 mt-2 space-y-1 text-xs">
                            <li>OTP mesajları <code>/otp</code> endpoint'i üzerinden filtresiz gönderilir.</li>
                            <li>Randevu bilgileri <code>iysfilter: "0"</code> ile gönderilir.</li>
                            <li>Gönderim kayıtlarına <strong>İYS Kayıtları</strong> menüsünden ulaşabilirsiniz.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

