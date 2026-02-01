'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { SalonDataService, MasterDataService } from '@/services/db';
import { GeocodingService } from '@/lib/geocoding';
import { City, SalonDetail, SalonType, District } from '@/types';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/ImageUpload';
import {
    Store,
    MapPin,
    Clock,
    Scissors,
    Users,
    TrendingUp,
    Save,
    Image as ImageIcon,
    AlertCircle,
    XCircle,
    ChevronLeft,
    Layout
} from 'lucide-react';
import Link from 'next/link';

const AdminSalonMap = dynamic(() => import('@/components/Admin/AdminSalonMap'), { ssr: false });

// Import Tabs
import WorkingHoursTab from '@/components/owner/WorkingHoursTab';
import StaffManagementTab from '@/components/owner/StaffManagementTab';
import ServicesTab from '@/components/owner/ServicesTab';
import StaffAnalytics from '@/components/owner/StaffAnalytics';



interface SalonFormData {
    name: string;
    description: string;
    address: string;
    neighborhood: string;
    avenue: string;
    street: string;
    building_no: string;
    apartment_no: string;
    phone: string;
    city_id: string;
    district_id: string;
    type_id: string; // Legacy/Primary fallback
    type_ids: string[];
    primary_type_id: string;
    image: string;
    geo_latitude: number;
    geo_longitude: number;
}

export default function EditSalonPage() {
    const router = useRouter();
    const params = useParams();
    const salonId = params.id as string;

    const [activeTab, setActiveTab] = useState('profile');
    const [salon, setSalon] = useState<SalonDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [manualSearchQuery, setManualSearchQuery] = useState('');

    // Form Data
    const [formData, setFormData] = useState<SalonFormData>({
        name: '',
        description: '',
        address: '',
        neighborhood: '',
        avenue: '',
        street: '',
        building_no: '',
        apartment_no: '',
        phone: '',
        city_id: '',
        district_id: '',
        type_id: '',
        type_ids: [],
        primary_type_id: '',
        image: '',
        geo_latitude: 41.0082,
        geo_longitude: 28.9784,
    });

    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);

    useEffect(() => {
        if (salonId) {
            fetchSalonData();
            fetchMasterData();
        }
    }, [salonId]);

    useEffect(() => {
        if (formData.city_id) {
            fetchDistricts(formData.city_id);
        }
    }, [formData.city_id]);

    // Automatic Geocoding Effect (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!formData.city_id || !formData.district_id) return;
            // Only auto-sync if we have at least 3 parts (City + District + something else)
            if (formData.neighborhood || formData.avenue || formData.street) {
                handleGeocode(false);
            }
        }, 1200); // 1.2s auto-debounce is safer than 800ms to avoid API limits while typing

        return () => clearTimeout(timer);
    }, [formData.city_id, formData.district_id, formData.neighborhood, formData.avenue, formData.street, formData.building_no]);

    const handleGeocode = async (isManual = false, customQuery?: string) => {
        if (!formData.city_id && !customQuery) return;

        setIsGeocoding(true);
        try {
            let searchQuery = '';

            if (customQuery) {
                searchQuery = customQuery;
            } else {
                const cityName = cities.find(c => c.id === formData.city_id)?.name;
                const districtName = districts.find(d => d.id === formData.district_id)?.name;

                const searchParts = [
                    formData.avenue,
                    formData.street,
                    formData.building_no ? `No: ${formData.building_no}` : '',
                    formData.neighborhood,
                    districtName,
                    cityName,
                    'Türkiye'
                ].filter(Boolean);

                searchQuery = searchParts.join(', ');
            }

            console.log(`🔍 Geocoding search (${isManual ? 'Manual' : 'Auto'}):`, searchQuery);
            const result = await GeocodingService.searchAddress(searchQuery);

            if (result) {
                console.log('📍 Geocoding result found:', result);
                setFormData(prev => ({
                    ...prev,
                    geo_latitude: result.lat,
                    geo_longitude: result.lon
                }));
            } else if (isManual) {
                alert('Belirtilen adres haritada bulunamadı. Lütfen kontrol edip tekrar deneyin veya haritadan manuel işaretleyin.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        } finally {
            setIsGeocoding(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [citiesData, typesData] = await Promise.all([
                MasterDataService.getCities(),
                MasterDataService.getSalonTypes(),
            ]);
            setCities(citiesData);
            setSalonTypes(typesData);
        } catch (error) {
            console.error('Master data load error:', error);
        }
    };

    const fetchDistricts = async (cityId: string) => {
        try {
            const data = await MasterDataService.getDistrictsByCity(cityId);
            setDistricts(data);
        } catch (error) {
            console.error("Districts error:", error);
        }
    };

    const fetchSalonData = async () => {
        try {
            setLoading(true);
            const data = await SalonDataService.getSalonById(salonId);
            if (data) {
                setSalon(data);

                // Process assigned types
                let initialTypeIds: string[] = [];
                let initialPrimaryId = data.type_id || '';

                if (data.assigned_types && data.assigned_types.length > 0) {
                    initialTypeIds = data.assigned_types.map(t => t.id);
                    const primary = data.assigned_types.find(t => t.is_primary);
                    if (primary) initialPrimaryId = primary.id;
                } else if (data.type_id) {
                    // Fallback to legacy type_id if no assigned_types
                    initialTypeIds = [data.type_id];
                }

                setFormData({
                    name: data.name,
                    description: data.description || '',
                    address: data.address || '',
                    neighborhood: data.neighborhood || '',
                    avenue: data.avenue || '',
                    street: data.street || '',
                    building_no: data.building_no || '',
                    apartment_no: data.apartment_no || '',
                    phone: data.phone || '',
                    city_id: data.city_id || '',
                    district_id: data.district_id || '',
                    type_id: data.type_id || '',
                    type_ids: initialTypeIds,
                    primary_type_id: initialPrimaryId,
                    image: data.image || '',
                    geo_latitude: data.geo_latitude || 41.0082,
                    geo_longitude: data.geo_longitude || 28.9784,
                });
            } else {
                // Handle 404 or redirect
                router.push('/owner/salons');
            }
        } catch (error) {
            console.error('Salon data load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for mandatory address fields
        const requiredFields = {
            city_id: 'Şehir',
            district_id: 'İlçe',
            neighborhood: 'Mahalle',
            avenue: 'Cadde',
            street: 'Sokak',
            building_no: 'Bina No'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key]) => !formData[key as keyof SalonFormData])
            .map(([, label]) => label);

        if (missingFields.length > 0) {
            alert(`Lütfen şu zorunlu alanları doldurunuz: ${missingFields.join(', ')}`);
            return;
        }

        setSaving(true);
        try {
            const updatedSalon = await SalonDataService.updateSalon(salonId, {
                name: formData.name,
                description: formData.description,
                address: formData.address,
                neighborhood: formData.neighborhood,
                avenue: formData.avenue,
                street: formData.street,
                building_no: formData.building_no,
                apartment_no: formData.apartment_no,
                phone: formData.phone,
                city_id: formData.city_id,
                district_id: formData.district_id,
                type_id: formData.primary_type_id, // Sync legacy column
                primary_type_id: formData.primary_type_id,
                type_ids: formData.type_ids,
                image: formData.image,
                geo_latitude: formData.geo_latitude,
                geo_longitude: formData.geo_longitude,
            });

            // Update local state with fresh data from server
            const data = await SalonDataService.getSalonById(salonId);
            if (data) {
                setSalon(data);
                // We don't necessarily need to reset formData here as it's already in sync, 
                // but setting salon state ensures the "Status" badge etc are correct.
            }

            await SalonDataService.submitForApproval(salonId);
            alert('Şube bilgileri güncellendi ve onaya gönderildi.');
        } catch (error) {
            console.error('Update error:', error);
            alert('Güncelleme sırasında bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profil & Konum', icon: Store },
        { id: 'hours', label: 'Çalışma Saatleri', icon: Clock },
        { id: 'services', label: 'Hizmetler', icon: Scissors },
        { id: 'staff', label: 'Personel', icon: Users },
        { id: 'analytics', label: 'Performans', icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-border sticky top-0 z-40 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20 md:h-24">
                        <div className="flex items-center gap-2 md:gap-6">
                            <Link href="/owner/salons" className="p-2.5 hover:bg-gray-50 rounded-2xl text-text-secondary hover:text-primary transition-all group">
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                            </Link>
                            <div>
                                <h1 className="text-lg md:text-2xl font-black text-text-main tracking-tight leading-none">{formData.name || 'Salon Düzenle'}</h1>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full flex items-center gap-2 border shadow-sm transition-all duration-500 ${salon?.status === 'APPROVED'
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                        : 'bg-amber-50 border-amber-100 text-amber-700'
                                        }`}>
                                        <div className="relative flex h-2 w-2">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${salon?.status === 'APPROVED' ? 'bg-emerald-400' : 'bg-amber-400'
                                                }`}></span>
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${salon?.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-amber-500'
                                                }`}></span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest antialiased">
                                            {salon?.status === 'APPROVED' ? 'Sistemde Aktif' : 'Onay Bekliyor'}
                                        </span>
                                    </div>

                                    {salon?.status === 'APPROVED' && (
                                        <div className="hidden sm:flex px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full items-center gap-2">
                                            <span className="material-symbols-outlined text-[14px]">verified</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest antialiased">Doğrulanmış</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            {activeTab === 'profile' && (
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={saving}
                                    className="px-8 py-3.5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex overflow-x-auto no-scrollbar gap-6 md:gap-10 -mb-px">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 pb-4 px-1 text-sm md:text-base font-black border-b-[3px] transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-muted hover:text-text-main hover:border-gray-200'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 md:w-5 md:h-5 ${activeTab === tab.id ? 'text-primary' : 'text-text-muted'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Save Button (Sticky Bottom) */}
            {activeTab === 'profile' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-border z-40 md:hidden animate-slide-up">
                    <button
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        className="w-full py-4 bg-primary text-white rounded-[24px] font-black shadow-xl shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-8 md:space-y-12">
                            <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-border shadow-card relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
                                <h3 className="text-xl md:text-2xl font-black text-text-main mb-8 md:mb-10 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <Layout className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                    </div>
                                    Temel Bilgiler
                                    <button
                                        type="button"
                                        onClick={() => handleGeocode(true)}
                                        disabled={isGeocoding}
                                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black hover:bg-blue-100 transition-all border border-blue-200 disabled:opacity-50"
                                    >
                                        <MapPin className={`w-3.5 h-3.5 ${isGeocoding ? 'animate-bounce' : ''}`} />
                                        {isGeocoding ? 'Aranıyor...' : 'Adresi Haritada Bul'}
                                    </button>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:gap-y-10">
                                    <div className="md:col-span-2 group">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                            <Store className="w-3.5 h-3.5" /> Şube Adı
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl md:rounded-[24px] font-black text-text-main text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                            placeholder="İşletmenizin tabeladaki adı"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            <MapPin className="w-3.5 h-3.5" /> Şehir
                                        </label>
                                        <div className="relative group">
                                            <select
                                                value={formData.city_id}
                                                onChange={(e) => setFormData({ ...formData, city_id: e.target.value, district_id: '' })}
                                                className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">Seçiniz</option>
                                                {cities.map(city => (
                                                    <option key={city.id} value={city.id}>{city.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            <MapPin className="w-3.5 h-3.5" /> İlçe
                                        </label>
                                        <div className="relative group">
                                            <select
                                                value={formData.district_id}
                                                onChange={(e) => setFormData({ ...formData, district_id: e.target.value })}
                                                disabled={!formData.city_id}
                                                className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer disabled:opacity-40"
                                            >
                                                <option value="">Seçiniz</option>
                                                {districts.map(dist => (
                                                    <option key={dist.id} value={dist.id}>{dist.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="md:col-span-1 space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            <MapPin className="w-3.5 h-3.5" /> Mahalle
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.neighborhood}
                                            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                            className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                            placeholder="Örn: Barbaros Mah."
                                        />
                                    </div>

                                    <div className="md:col-span-1 space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            <MapPin className="w-3.5 h-3.5" /> Cadde
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.avenue}
                                            onChange={(e) => setFormData({ ...formData, avenue: e.target.value })}
                                            className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                            placeholder="Örn: Atatürk Cad."
                                        />
                                    </div>
                                    <div className="md:col-span-1 space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            <MapPin className="w-3.5 h-3.5" /> Sokak
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.street}
                                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                            className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                            placeholder="Örn: Karanfil Sokak"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 md:col-span-1">
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                                Bina No
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.building_no}
                                                onChange={(e) => setFormData({ ...formData, building_no: e.target.value })}
                                                className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                                placeholder="No"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                                Daire
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.apartment_no}
                                                onChange={(e) => setFormData({ ...formData, apartment_no: e.target.value })}
                                                className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                                placeholder="D:"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> Diğer Adres Detayları (İsteğe Bağlı)
                                        </label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-6 py-3 bg-surface-alt border border-border rounded-2xl font-bold text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all min-h-[80px] resize-none"
                                            placeholder="Kat bilgisi, tarif vb..."
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            <Clock className="w-3.5 h-3.5" /> Telefon
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                            placeholder="0212 000 00 00"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            <Scissors className="w-3.5 h-3.5" /> İşletme Tipi
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {salonTypes.map(type => {
                                                const isSelected = formData.type_ids.includes(type.id);
                                                const isPrimary = formData.primary_type_id === type.id;

                                                return (
                                                    <div
                                                        key={type.id}
                                                        onClick={() => {
                                                            let newTypeIds = [...formData.type_ids];
                                                            if (isSelected) {
                                                                newTypeIds = newTypeIds.filter(id => id !== type.id);
                                                                // If removing primary, reassign primary
                                                                if (isPrimary && newTypeIds.length > 0) {
                                                                    setFormData({ ...formData, type_ids: newTypeIds, primary_type_id: newTypeIds[0] });
                                                                } else if (newTypeIds.length === 0) {
                                                                    setFormData({ ...formData, type_ids: [], primary_type_id: '' });
                                                                } else {
                                                                    setFormData({ ...formData, type_ids: newTypeIds });
                                                                }
                                                            } else {
                                                                newTypeIds.push(type.id);
                                                                if (newTypeIds.length === 1) {
                                                                    setFormData({ ...formData, type_ids: newTypeIds, primary_type_id: type.id });
                                                                } else {
                                                                    setFormData({ ...formData, type_ids: newTypeIds });
                                                                }
                                                            }
                                                        }}
                                                        className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border bg-white hover:border-gray-300'
                                                            }`}
                                                    >
                                                        {isPrimary && (
                                                            <div className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                                                                ANA
                                                            </div>
                                                        )}
                                                        <div className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                                                            {type.name}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {formData.type_ids.length > 1 && (
                                            <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                                <p className="text-[10px] font-bold text-blue-800 uppercase mb-2">Ana İşletme Türü Seçimi</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.type_ids.map(tid => {
                                                        const t = salonTypes.find(st => st.id === tid);
                                                        if (!t) return null;
                                                        const isPrim = formData.primary_type_id === tid;
                                                        return (
                                                            <button
                                                                key={tid}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, primary_type_id: tid })}
                                                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${isPrim
                                                                    ? 'bg-primary text-white shadow-sm'
                                                                    : 'bg-white border border-blue-200 text-blue-800 hover:bg-blue-50'
                                                                    }`}
                                                            >
                                                                {t.name}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                            <TrendingUp className="w-3.5 h-3.5" /> Açıklama
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl md:rounded-[24px] font-medium text-text-secondary outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all min-h-[140px] resize-none leading-relaxed"
                                            placeholder="İşletmeniz hakkında kısa bir tanıtım yazısı..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[32px] md:rounded-[48px] border border-border shadow-card overflow-hidden">
                                <h3 className="text-xl md:text-2xl font-black text-text-main mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                    </div>
                                    Konum İşaretleme
                                </h3>
                                <div className="mb-4 flex gap-2">
                                    <div className="relative flex-1 group">
                                        <input
                                            type="text"
                                            value={manualSearchQuery}
                                            onChange={(e) => setManualSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleGeocode(false, manualSearchQuery)}
                                            placeholder="Haritada yer arayın (örn: Kadıköy Meydan, Akasya AVM...)"
                                            className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-bold text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                                        />
                                        <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <button
                                        onClick={() => handleGeocode(false, manualSearchQuery)}
                                        disabled={isGeocoding || !manualSearchQuery}
                                        className="px-6 py-3.5 bg-text-main text-white rounded-2xl font-black text-sm hover:bg-black transition-all disabled:opacity-50"
                                    >
                                        Ara
                                    </button>
                                </div>
                                <div className="h-[400px] md:h-[500px] rounded-[24px] md:rounded-[32px] overflow-hidden border-2 border-border shadow-inner mt-4 relative z-0">
                                    <AdminSalonMap
                                        center={[formData.geo_latitude || 41.0082, formData.geo_longitude || 28.9784]}
                                        markerPosition={{ lat: formData.geo_latitude || 41.0082, lng: formData.geo_longitude || 28.9784 }}
                                        onLocationSelect={(lat, lng) => setFormData({ ...formData, geo_latitude: lat, geo_longitude: lng })}
                                    />
                                </div>
                                <p className="text-sm text-text-muted mt-6 font-medium flex items-center gap-3 p-4 bg-surface-alt rounded-2xl">
                                    <AlertCircle className="w-5 h-5 text-primary shrink-0" /> Harita üzerinde işletmenizin tam konumunu işaretleyin. Müşterileriniz yol tarifi alırken bu konumu kullanacaktır.
                                </p>
                            </div>
                        </div>

                        {/* Right Column - Image & Status */}
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[32px] md:rounded-[40px] border border-border shadow-card">
                                <h3 className="text-lg font-black text-text-main mb-6">Kapak Fotoğrafı</h3>
                                <div className="aspect-video md:aspect-square w-full rounded-2xl overflow-hidden bg-surface-alt border-2 border-dashed border-border hover:border-primary transition-all group relative">
                                    <ImageUpload
                                        bucket="salon-images"
                                        currentImage={formData.image}
                                        onUpload={(url) => setFormData({ ...formData, image: url })}
                                        label="Görsel Değiştir"
                                        className="h-full"
                                    />
                                </div>
                                <p className="text-xs text-text-muted mt-4 text-center font-medium">
                                    Önerilen boyut: 1920x1080px. <br />Maksimum 5MB.
                                </p>
                            </div>

                            {salon?.rejected_reason && (
                                <div className="bg-red-50 p-6 rounded-[24px] border border-red-100 animate-pulse">
                                    <h4 className="text-red-800 font-black text-sm mb-2 flex items-center gap-2">
                                        <XCircle className="w-4 h-4" /> Düzenleme Gerekli
                                    </h4>
                                    <p className="text-red-700 text-sm font-medium leading-relaxed">{salon.rejected_reason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Other Tabs */}
                {activeTab === 'hours' && <WorkingHoursTab salonId={salonId} />}
                {activeTab === 'staff' && <StaffManagementTab salonId={salonId} />}
                {activeTab === 'services' && <ServicesTab salonId={salonId} />}
                {activeTab === 'analytics' && <StaffAnalytics salonId={salonId} />}
            </div>
        </div>
    );
}

// Helper icon
