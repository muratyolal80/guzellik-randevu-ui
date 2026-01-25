'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MasterDataService, SalonDataService, ApprovalService } from '@/services/db';
import { Layout } from '@/components/Layout';
import { City, District, SalonType } from '@/types';
import { Store, ChevronLeft, MapPin, Phone, Image as ImageIcon, Tag, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewSalonPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Master data
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        city_id: '',
        district_id: '',
        type_id: '',
        address: '',
        phone: '',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
        description: '',
        geo_latitude: 41.0082,
        geo_longitude: 28.9784,
    });

    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [citiesData, typesData] = await Promise.all([
                    MasterDataService.getCities(),
                    MasterDataService.getSalonTypes()
                ]);
                setCities(citiesData);
                setSalonTypes(typesData);
            } catch (err) {
                console.error('Master data error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadMasterData();
    }, []);

    useEffect(() => {
        const loadDistricts = async () => {
            if (formData.city_id) {
                const data = await MasterDataService.getDistrictsByCity(formData.city_id);
                setDistricts(data);
            } else {
                setDistricts([]);
            }
        };
        loadDistricts();
    }, [formData.city_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // This will call the intercepted createSalon which creates a change_request
            await SalonDataService.createSalon(formData as any);
            alert('Talebiniz başarıyla oluşturuldu ve admin onayına gönderildi.');
            router.push('/owner/dashboard');
        } catch (err: any) {
            alert('Hata: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/owner/dashboard" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors font-bold">
                    <ChevronLeft className="w-5 h-5" /> Geri Dön
                </Link>

                <div className="bg-white rounded-[40px] border border-border shadow-card overflow-hidden">
                    <div className="p-10 bg-gray-50/50 border-b border-border">
                        <div className="flex items-center gap-5 mb-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                                <Store className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-text-main tracking-tight">Yeni Salon Başvurusu</h1>
                                <p className="text-text-secondary font-medium">Salonunuzun bilgilerini girin, admin onayından sonra yayına alınacaktır.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Salon Adı</label>
                                    <input required className="w-full h-14 px-5 rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                                        placeholder="Örn: Modern Güzellik Merkezi"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-text-main mb-2">Şehir</label>
                                        <select required className="w-full h-14 px-5 rounded-2xl border border-border bg-gray-50 outline-none font-medium"
                                            value={formData.city_id} onChange={e => setFormData({ ...formData, city_id: e.target.value, district_id: '' })}>
                                            <option value="">Seçiniz</option>
                                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-text-main mb-2">İlçe</label>
                                        <select required disabled={!formData.city_id} className="w-full h-14 px-5 rounded-2xl border border-border bg-gray-50 outline-none disabled:opacity-50 font-medium"
                                            value={formData.district_id} onChange={e => setFormData({ ...formData, district_id: e.target.value })}>
                                            <option value="">Seçiniz</option>
                                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Salon Tipi</label>
                                    <select required className="w-full h-14 px-5 rounded-2xl border border-border bg-gray-50 outline-none font-medium"
                                        value={formData.type_id} onChange={e => setFormData({ ...formData, type_id: e.target.value })}>
                                        <option value="">Seçiniz</option>
                                        {salonTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Telefon</label>
                                    <div className="relative">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input required className="w-full h-14 pl-14 pr-5 rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium"
                                            placeholder="05XX XXX XX XX"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Görsel URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input required className="w-full h-14 pl-14 pr-5 rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium"
                                            placeholder="https://..."
                                            value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-text-main mb-2">Açık Adres</label>
                                    <textarea required rows={3} className="w-full p-5 rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium resize-none"
                                        placeholder="Sokak, No, Kat..."
                                        value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}></textarea>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">Salon Açıklaması</label>
                            <textarea rows={4} className="w-full p-5 rounded-2xl border border-border bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all font-medium resize-none"
                                placeholder="Müşterilerinize salonunuzu tanıtın..."
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-3 px-12 py-4 bg-primary text-white text-lg font-black rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary-hover hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                                Başvuruyu Gönder
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
