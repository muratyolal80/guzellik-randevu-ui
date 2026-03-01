'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import {
    Zap,
    ShieldCheck,
    Users,
    Smartphone,
    Calendar,
    BarChart3,
    ArrowRight,
    CheckCircle2,
    Star,
    Award
} from 'lucide-react';
import Link from 'next/link';

export default function SaaSLandingPage() {
    return (
        <Layout>
            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="relative pt-20 pb-32 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-5 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
                        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-400 rounded-full blur-[100px]" />
                    </div>

                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Star className="w-3 h-3 fill-primary" /> Salon Yönetiminde Yeni Nesil Deneyim
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-text-main tracking-tight leading-[1.1] mb-8 font-display animate-in fade-in slide-in-from-bottom-6 duration-700">
                            Güzellik İşletmenizi <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">Tek Noktadan</span> Yönetin
                        </h1>
                        <p className="text-lg md:text-xl text-text-secondary font-medium max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            Randevu takibi, personel yönetimi, gelişmiş analitikler ve müşteri ilişkileri yönetimi. Hepsi tek bir premium platformda.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                            <Link href="/auth/signup?role=owner" className="w-full sm:w-auto px-10 py-5 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                Ücretsiz Başla <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/contact" className="w-full sm:w-auto px-10 py-5 bg-white border border-border text-text-main font-bold rounded-3xl hover:bg-gray-50 transition-all">
                                Demo Talebi
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-32 bg-gray-50/50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-black text-text-main tracking-tight mb-4">Her Şey Kontrolünüz Altında</h2>
                            <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Modern Salonlar İçin Güçlü Özellikler</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: 'Smart Randevu Sistemi', desc: 'Müşterileriniz 7/24 online randevu alabilsin, salon trafiğiniz otomatik düzene girsin.', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { title: 'Personel Yönetimi', desc: 'Çalışanlarınızın çalışma saatlerini, performanslarını ve hakedişlerini kolayca takip edin.', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { title: 'Gelişmiş Analitik', desc: 'Gelir trendleri, popüler hizmetler ve şubeler arası performans karşılaştırmaları.', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
                                { title: 'Mobile First Deneyim', desc: 'İşletmenizi her yerden, her cihazdan web app kalitesinde yönetin.', icon: Smartphone, color: 'text-rose-600', bg: 'bg-rose-50' },
                                { title: 'Güvenli Altyapı', desc: 'Verileriniz endüstri standardı şifreleme ve Supabase güvenliği ile korunur.', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { title: 'Hızlı Entegrasyon', desc: 'Dakikalar içinde salonunuzu kurun ve hemen müşteri kabul etmeye başlayın.', icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
                            ].map((feature, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-[40px] border border-border shadow-card hover:translate-y-[-8px] transition-all group">
                                    <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-black text-text-main mb-3">{feature.title}</h3>
                                    <p className="text-sm font-medium text-text-secondary leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="py-32">
                    <div className="container mx-auto px-6 text-center">
                        <div className="mb-20">
                            <h2 className="text-3xl md:text-5xl font-black text-text-main tracking-tight mb-4">Şeffaf Fiyatlandırma</h2>
                            <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">İşletmenize Uygun Paketi Seçin</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {[
                                { name: 'Başlangıç', price: '0', features: ['1 Şube', '3 Personel', 'Online Randevu', 'Temel Analitik'], popular: false },
                                { name: 'Profesyonel', price: '499', features: ['3 Şube', '10 Personel', 'Gelişmiş Analitik', 'SMS Bildirimleri', 'Öncelikli Destek'], popular: true },
                                { name: 'Kurumsal', price: '999', features: ['Sınırsız Şube', 'Sınırsız Personel', 'Özel API Erişimi', 'E-Fatura Entegrasyonu', 'Özel Danışman'], popular: false },
                            ].map((plan, idx) => (
                                <div key={idx} className={`relative p-10 rounded-[48px] border ${plan.popular ? 'border-primary ring-4 ring-primary/5 shadow-2xl' : 'border-border shadow-card'} bg-white flex flex-col`}>
                                    {plan.popular && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">En Popüler</div>
                                    )}
                                    <div className="mb-10 text-left">
                                        <h3 className="text-xl font-black text-text-main mb-2 tracking-tight">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-text-main">₺{plan.price}</span>
                                            <span className="text-text-muted font-bold text-sm">/ay</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4 mb-12 flex-1 text-left">
                                        {plan.features.map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> {f}
                                            </div>
                                        ))}
                                    </div>
                                    <Link
                                        href="/auth/signup?role=owner"
                                        className={`w-full py-5 rounded-3xl font-black text-sm transition-all ${plan.popular ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-gray-50 text-text-main hover:bg-gray-100'}`}
                                    >
                                        Hemen Başla
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-32 bg-primary overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-white opacity-5 rounded-l-[500px] pointer-events-none" />
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <Award className="w-16 h-16 text-white/40 mx-auto mb-8 animate-bounce" />
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">Salonunuzun Geleceği Burada Başlıyor</h2>
                        <p className="text-white/80 font-bold text-lg mb-12 max-w-2xl mx-auto">Siz de binlerce memnun salon sahibi gibi bugün dijital dönüşümünüzü başlatın.</p>
                        <Link href="/auth/signup?role=owner" className="inline-flex items-center gap-2 px-12 py-6 bg-white text-primary font-black rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-lg">
                            Şimdi Ücretsiz Kayıt Ol <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>
                </section>

                <footer className="py-20 border-t border-border bg-gray-50/30">
                    <div className="container mx-auto px-6 text-center">
                        <div className="flex justify-center items-center gap-2 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                                <Zap className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-black text-text-main font-display">Güzellik Randevu SaaS</span>
                        </div>
                        <p className="text-sm font-bold text-text-muted uppercase tracking-[0.2em]">© 2025 Antigravity Cloud Framework</p>
                    </div>
                </footer>
            </div>
        </Layout>
    );
}
