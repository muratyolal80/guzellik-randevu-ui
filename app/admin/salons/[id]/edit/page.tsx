'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/AdminLayout';
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
    type_id: string;
    type_ids: string[];
    primary_type_id: string;
    image: string;
    geo_latitude: number;
    geo_longitude: number;
}

export default function AdminEditSalonPage() {
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

            const result = await GeocodingService.searchAddress(searchQuery);
            if (result) {
                setFormData(prev => ({
                    ...prev,
                    geo_latitude: result.lat,
                    geo_longitude: result.lon
                }));
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
                let initialTypeIds = data.assigned_types?.map(t => t.id) || (data.type_id ? [data.type_id] : []);
                let initialPrimaryId = data.assigned_types?.find(t => t.is_primary)?.id || data.type_id || '';

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
            }
        } catch (error) {
            console.error('Salon data load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await SalonDataService.updateSalon(salonId, {
                ...formData,
                type_id: formData.primary_type_id,
            });
            alert('Bilgiler admin tarafından güncellendi.');
            router.push('/admin/salons/approvals');
        } catch (error) {
            console.error('Update error:', error);
            alert('Güncelleme sırasında hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center">Yükleniyor...</div>;

    const tabs = [
        { id: 'profile', label: 'Profil & Konum', icon: Store },
        { id: 'hours', label: 'Çalışma Saatleri', icon: Clock },
        { id: 'services', label: 'Hizmetler', icon: Scissors },
        { id: 'staff', label: 'Personel', icon: Users },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/salons/approvals" className="p-2 hover:bg-gray-200 rounded-lg">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-2xl font-black text-text-main">Salon Düzenle (Yönetici)</h1>
                    </div>
                    {activeTab === 'profile' && (
                        <button
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Kaydediliyor...' : 'Yönetici Olarak Kaydet'}
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border gap-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-text-muted'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="py-6">
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
                                    <h3 className="text-lg font-black mb-6">İşletme Bilgileri</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Salon Adı</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Şehir</label>
                                            <select
                                                value={formData.city_id}
                                                onChange={(e) => setFormData({ ...formData, city_id: e.target.value, district_id: '' })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl font-bold"
                                            >
                                                <option value="">Seçiniz</option>
                                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-text-muted uppercase mb-2 block">İlçe</label>
                                            <select
                                                value={formData.district_id}
                                                onChange={(e) => setFormData({ ...formData, district_id: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl font-bold"
                                            >
                                                <option value="">Seçiniz</option>
                                                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Mahalle</label>
                                            <input
                                                type="text"
                                                value={formData.neighborhood}
                                                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Cadde</label>
                                            <input
                                                type="text"
                                                value={formData.avenue}
                                                onChange={(e) => setFormData({ ...formData, avenue: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
                                    <h3 className="text-lg font-black mb-6">Konum (Harita)</h3>
                                    <div className="h-[400px] rounded-2xl overflow-hidden border border-border relative z-0">
                                        <AdminSalonMap
                                            center={[formData.geo_latitude, formData.geo_longitude]}
                                            markerPosition={{ lat: formData.geo_latitude, lng: formData.geo_longitude }}
                                            onLocationSelect={(lat, lng) => setFormData({ ...formData, geo_latitude: lat, geo_longitude: lng })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
                                    <h3 className="text-lg font-black mb-6">Görsel</h3>
                                    <ImageUpload
                                        bucket="salon-images"
                                        currentImage={formData.image}
                                        onUpload={(url) => setFormData({ ...formData, image: url })}
                                    />
                                </div>
                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 italic text-sm text-blue-800">
                                    <AlertCircle className="w-5 h-5 mb-2" />
                                    Yönetici olarak yaptığınız değişiklikler doğrudan veritabanına kaydedilir ve onay statüsünü değiştirmez.
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hours' && <WorkingHoursTab salonId={salonId} />}
                    {activeTab === 'staff' && <StaffManagementTab salonId={salonId} />}
                    {activeTab === 'services' && <ServicesTab salonId={salonId} />}
                </div>
            </div>
        </AdminLayout>
    );
}
