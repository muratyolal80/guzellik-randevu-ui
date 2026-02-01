'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SalonDataService, MasterDataService, StaffService, ServiceService } from '@/services/db';
import { City, District, SalonType } from '@/types';
import {
    Store, MapPin, Clock, Copy, Users,
    CheckCircle2, ChevronRight, ChevronLeft,
    Camera, Phone, Info, Star, Save, ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GeocodingService } from '@/lib/geocoding';

// Dynamic Map Component (Disabled SSR)
import dynamic from 'next/dynamic';
const AdminSalonMap = dynamic(() => import('@/components/Admin/AdminSalonMap'), { ssr: false });

const STEPS = [
    { id: 1, title: 'Temel Bilgiler', icon: Store, desc: 'Salon adı ve iletişim' },
    { id: 2, title: 'Konum & Harita', icon: MapPin, desc: 'Adres ve harita pini' },
    { id: 3, title: 'Çalışma Saatleri', icon: Clock, desc: 'Mesai başlangıç/bitiş' },
    { id: 4, title: 'Hizmetler', icon: Star, desc: 'Saç, Sakal vb. servisler' },
    { id: 5, title: 'Personel', icon: Users, desc: 'Çalışan ekibi kurun' },
    { id: 6, title: 'Önizleme', icon: ShieldCheck, desc: 'Kontrol ve onay' }
];

export default function OnboardingWizard() {
    const { user } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [globalServices, setGlobalServices] = useState<any[]>([]);
    const [selectedServices, setSelectedServices] = useState<{ global_service_id: string, name: string, price: number, duration_min: number }[]>([]);
    const [staffMembers, setStaffMembers] = useState<{ name: string, role: string, phone: string, email: string, is_owner: boolean, service_ids: string[] }[]>([]);
    const [newStaff, setNewStaff] = useState({ name: '', role: '', phone: '', email: '', service_ids: [] as string[] });

    const [salonData, setSalonData] = useState<any>({
        name: '',
        phone: '',
        type_ids: [] as string[], // Changed from type_id
        primary_type_id: '', // New field
        city_id: '',
        district_id: '',
        address: '',
        neighborhood: '',
        avenue: '',
        street: '',
        building_no: '',
        apartment_no: '',
        description: '',
        geo_latitude: 41.0082,
        geo_longitude: 28.9784,
        features: [],
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop',
        status: 'DRAFT'
    });

    const [workingHours, setWorkingHours] = useState([
        { day_of_week: 1, start_time: '09:00', end_time: '19:00', is_closed: false }, // Pazartesi
        { day_of_week: 2, start_time: '09:00', end_time: '19:00', is_closed: false }, // Salı
        { day_of_week: 3, start_time: '09:00', end_time: '19:00', is_closed: false }, // Çarşamba
        { day_of_week: 4, start_time: '09:00', end_time: '19:00', is_closed: false }, // Perşembe
        { day_of_week: 5, start_time: '09:00', end_time: '19:00', is_closed: false }, // Cuma
        { day_of_week: 6, start_time: '09:00', end_time: '19:00', is_closed: false }, // Cumartesi
        { day_of_week: 0, start_time: '09:00', end_time: '19:00', is_closed: true },  // Pazar
    ]);

    const handleHourChange = (index: number, field: 'start_time' | 'end_time', value: string) => {
        const newHours = [...workingHours];
        newHours[index] = { ...newHours[index], [field]: value };
        setWorkingHours(newHours);
    };

    const toggleDay = (index: number) => {
        const newHours = [...workingHours];
        newHours[index] = { ...newHours[index], is_closed: !newHours[index].is_closed };
        setWorkingHours(newHours);
    };

    const toggleService = (serviceId: string) => {
        const exists = selectedServices.find(s => s.global_service_id === serviceId);
        if (exists) {
            setSelectedServices(selectedServices.filter(s => s.global_service_id !== serviceId));
        } else {
            const gs = globalServices.find(g => g.id === serviceId);
            setSelectedServices([...selectedServices, {
                global_service_id: serviceId,
                name: gs?.name || 'Hizmet',
                price: 0,
                duration_min: 30
            }]);
        }
    };

    const updateServiceDetails = (serviceId: string, field: 'price' | 'duration_min', value: number) => {
        setSelectedServices(selectedServices.map(s =>
            s.global_service_id === serviceId ? { ...s, [field]: value } : s
        ));
    };

    const addCategoryServices = (categoryId: string) => {
        const categoryServices = globalServices.filter(s => s.category_id === categoryId);
        const newServices = [...selectedServices];

        categoryServices.forEach(gs => {
            if (!newServices.find(s => s.global_service_id === gs.id)) {
                newServices.push({
                    global_service_id: gs.id,
                    name: gs.name,
                    price: 0,
                    duration_min: 30
                });
            }
        });
        setSelectedServices(newServices);
    };

    const removeCategoryServices = (categoryId: string) => {
        const categoryServices = globalServices.filter(s => s.category_id === categoryId);
        const serviceIdsToRemove = categoryServices.map(s => s.id);
        setSelectedServices(selectedServices.filter(s => !serviceIdsToRemove.includes(s.global_service_id)));
    };

    const addStaff = () => {
        if (!newStaff.name || !newStaff.role) return;
        setStaffMembers([...staffMembers, { ...newStaff, is_owner: false }]);
        setNewStaff({ name: '', role: '', phone: '', email: '', service_ids: [] });
    };

    const removeStaff = (index: number) => {
        const newStaffMembers = [...staffMembers];
        newStaffMembers.splice(index, 1);
        setStaffMembers(newStaffMembers);
    };

    const addMyselfAsStaff = () => {
        if (!user) return;
        // Check if already added
        if (staffMembers.find(s => s.is_owner)) return;

        setStaffMembers([{
            name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Salon Sahibi',
            role: 'Yönetici & Uzman',
            phone: user.phone || '',
            email: user.email || '',
            is_owner: true,
            service_ids: selectedServices.map(s => s.global_service_id)
        }, ...staffMembers]);
    };

    useEffect(() => {
        const fetchMasterData = async () => {
            const [c, t, cats, gs] = await Promise.all([
                MasterDataService.getCities(),
                MasterDataService.getSalonTypes(),
                MasterDataService.getServiceCategories(),
                MasterDataService.getAllGlobalServices()
            ]);
            setCities(c);
            setSalonTypes(t);
            setCategories(cats);
            setGlobalServices(gs);
        };
        fetchMasterData();
    }, []);

    // Auto-load services when salon types change
    useEffect(() => {
        console.log('🔍 useEffect tetiklendi - type_ids:', salonData.type_ids);

        const loadServicesForSelectedTypes = async () => {
            // Salon tipi seçilmemişse hizmetleri temizle
            if (!salonData.type_ids || salonData.type_ids.length === 0) {
                console.log('⚠️ Salon tipi seçili değil, hizmetler temizleniyor');
                setSelectedServices([]);
                return;
            }

            console.log('✅ Salon tipleri seçili, hizmetler yükleniyor...', salonData.type_ids);

            try {
                // 1. Seçilen salon tiplerine göre kategorileri al
                console.log('1️⃣ Kategoriler getiriliyor...');
                const relatedCategories = await MasterDataService.getServiceCategoriesForSalonTypes(salonData.type_ids);
                console.log('📁 Bulunan kategoriler:', relatedCategories);

                if (relatedCategories.length === 0) {
                    console.warn('⚠️ Bu salon tipleri için tanımlanmış kategori bulunamadı');
                    setSelectedServices([]);
                    return;
                }

                // 2. Bu kategorilerdeki tüm hizmetleri al
                const categoryIds = relatedCategories.map(c => c.id);
                console.log('2️⃣ Hizmetler getiriliyor, kategori IDs:', categoryIds);
                const services = await MasterDataService.getGlobalServicesByCategories(categoryIds);
                console.log('📋 Bulunan hizmetler:', services);

                // 3. Varsayılan fiyat ve süre ile otomatik ekle
                const autoServices = services.map(service => ({
                    global_service_id: service.id,
                    name: service.name,
                    price: 0, // Kullanıcı belirleyecek
                    duration_min: 30 // Varsayılan süre
                }));

                setSelectedServices(autoServices);
                console.log(`✅ ${autoServices.length} hizmet otomatik yüklendi`);
            } catch (error) {
                console.error('❌ Hizmetler yüklenirken hata:', error);
            }
        };

        loadServicesForSelectedTypes();
    }, [salonData.type_ids]); // type_ids değiştiğinde çalış


    useEffect(() => {
        if (salonData.city_id) {
            MasterDataService.getDistrictsByCity(salonData.city_id).then(setDistricts);
        }
    }, [salonData.city_id]);

    // Automatic Geocoding Effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            const cityName = cities.find(c => c.id === salonData.city_id)?.name;
            const districtName = districts.find(d => d.id === salonData.district_id)?.name;

            if (!cityName) return;

            // Build full address search string
            const searchParts = [
                salonData.avenue,
                salonData.street,
                salonData.building_no ? `No: ${salonData.building_no}` : '',
                salonData.neighborhood,
                districtName,
                cityName,
                'Türkiye'
            ].filter(Boolean);

            if (searchParts.length < 3) return; // Need at least city, district and neighborhood/street

            const searchQuery = searchParts.join(', ');
            console.log('🔍 Geocoding search:', searchQuery);

            const result = await GeocodingService.searchAddress(searchQuery);
            if (result) {
                console.log('📍 Geocoding result found:', result);
                setSalonData((prev: any) => ({
                    ...prev,
                    geo_latitude: result.lat,
                    geo_longitude: result.lon
                }));
            }
        }, 1500); // 1.5s debounce

        return () => clearTimeout(timer);
    }, [salonData.city_id, salonData.district_id, salonData.neighborhood, salonData.avenue, salonData.street, salonData.building_no, cities, districts]);

    const handleNext = () => {
        if (currentStep < 6) setCurrentStep(prev => prev + 1);
        else handleComplete();
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            console.log('Onboarding step 1: Saving salon...');
            // 1. Create/Update Salon
            let salon: any;
            if (salonData.id) {
                salon = await SalonDataService.updateSalon(salonData.id, salonData);
            } else {
                // Ensure we pass type_id for backward compatibility if needed by the service type definition, 
                // but the service should handle the new fields.
                // We'll map type_ids to the expected format for the creation service
                salon = await SalonDataService.createSalon({
                    ...salonData,
                    // Map primary_type_id to type_id for schema compatibility if the service expects it
                    // The service implementation of createSalon needs to handle type_ids and primary_type_id
                    type_id: salonData.primary_type_id,
                    owner_id: user?.id
                }, workingHours, selectedServices);
            }

            console.log('Onboarding step 2: Submitting for approval...');
            // 2. Submit for Approval
            await SalonDataService.submitForApproval(salon.id);

            // 3. Clear active salon cache for this user to force refresh
            // 3. Clear active salon cache for this user to force refresh
            // 3. Create Staff Members & Link Services
            if (staffMembers.length > 0) {
                console.log('Onboarding step 3: Creating staff and linking services...');

                // Fetch created salon services to get their DB ids
                // We match by name because global_service_id might not be in salon_services table
                const dbServices = await ServiceService.getServicesBySalon(salon.id);
                const serviceMapping: Record<string, string> = {};
                dbServices.forEach(s => {
                    serviceMapping[s.service_name] = s.id;
                });

                await Promise.all(staffMembers.map(async (staff) => {
                    const createdStaff = await StaffService.createStaff({
                        salon_id: salon.id,
                        user_id: staff.is_owner ? user?.id : undefined,
                        name: staff.name,
                        role: staff.role,
                        phone: staff.phone,
                        is_active: true
                    });

                    if (createdStaff && staff.service_ids?.length > 0) {
                        // Map global_service_ids to database salon_service_ids via name
                        const dbServiceIds = staff.service_ids.map(gsId => {
                            const gsName = selectedServices.find(s => s.global_service_id === gsId)?.name;
                            return gsName ? serviceMapping[gsName] : null;
                        }).filter(Boolean) as string[];

                        if (dbServiceIds.length > 0) {
                            await StaffService.linkStaffToServices(createdStaff.id, salon.id, dbServiceIds);
                        }
                    }
                    return createdStaff;
                }));
            }

            console.log('Onboarding step 4: Success, redirecting...');

            // 4. Clear active salon cache for this user to force refresh
            if (user?.id) {
                localStorage.removeItem(`active_branch_${user.id}`);
            }

            // Force hard reload to update ActiveBranchContext with new salon
            window.location.href = '/owner/dashboard?onboarding=success';
        } catch (err) {
            console.error('Onboarding complete error:', err);
            alert('İşlem tamamlanırken bir hata oluştu. Lütfen detaylar için konsolu kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                    <Store className="w-3.5 h-3.5" /> Salon İsmi
                                </label>
                                <input
                                    className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl md:rounded-[24px] font-black text-text-main text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Lüks Güzellik Merkezi"
                                    value={salonData.name}
                                    onChange={e => setSalonData({ ...salonData, name: e.target.value })}
                                />
                            </div>
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                    <Phone className="w-3.5 h-3.5" /> İşletme Telefonu
                                </label>
                                <input
                                    className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="0212 XXX XX XX"
                                    value={salonData.phone}
                                    onChange={e => setSalonData({ ...salonData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-1">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                    <Info className="w-3.5 h-3.5" /> İşletme Tipleri
                                </label>
                                <p className="text-[11px] text-text-muted font-medium ml-1">Birden fazla seçilebilir. İlk seçilen ana kategori olur.</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {salonTypes.map(t => {
                                    const isSelected = salonData.type_ids.includes(t.id);
                                    const isPrimary = salonData.primary_type_id === t.id;

                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => {
                                                let newTypeIds = [...salonData.type_ids];
                                                if (isSelected) {
                                                    newTypeIds = newTypeIds.filter(id => id !== t.id);
                                                    if (isPrimary && newTypeIds.length > 0) {
                                                        setSalonData({ ...salonData, type_ids: newTypeIds, primary_type_id: newTypeIds[0] });
                                                    } else if (newTypeIds.length === 0) {
                                                        setSalonData({ ...salonData, type_ids: [], primary_type_id: '' });
                                                    } else {
                                                        setSalonData({ ...salonData, type_ids: newTypeIds });
                                                    }
                                                } else {
                                                    newTypeIds.push(t.id);
                                                    if (newTypeIds.length === 1) {
                                                        setSalonData({ ...salonData, type_ids: newTypeIds, primary_type_id: t.id });
                                                    } else {
                                                        setSalonData({ ...salonData, type_ids: newTypeIds });
                                                    }
                                                }
                                            }}
                                            className={`relative p-5 rounded-[24px] border-2 text-center cursor-pointer transition-all duration-300 ${isSelected
                                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                                                : 'border-border bg-white hover:border-primary/20 hover:scale-[1.02]'}`}
                                        >
                                            {isPrimary && (
                                                <span className="absolute -top-2.5 -right-2 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                                    ANA
                                                </span>
                                            )}
                                            <p className={`text-xs font-black uppercase tracking-tight ${isSelected ? 'text-primary' : 'text-text-main'}`}>{t.name}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {salonData.type_ids.length > 1 && (
                                <div className="p-4 bg-primary/5 rounded-[20px] border border-primary/10 animate-in fade-in duration-500">
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-3">Ana Kategori Seçimi:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {salonData.type_ids.map((id: string) => {
                                            const type = salonTypes.find(t => t.id === id);
                                            if (!type) return null;
                                            return (
                                                <button
                                                    key={id}
                                                    onClick={() => setSalonData({ ...salonData, primary_type_id: id })}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${salonData.primary_type_id === id
                                                        ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                                        : 'bg-white border border-primary/10 text-text-secondary hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {type.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                                <Info className="w-3.5 h-3.5" /> Kısa Açıklama
                            </label>
                            <textarea
                                className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl md:rounded-[24px] font-medium text-text-secondary outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all min-h-[140px] resize-none leading-relaxed"
                                placeholder="Müşterilerinize salonunuzu tanıtın..."
                                value={salonData.description}
                                onChange={e => setSalonData({ ...salonData, description: e.target.value })}
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right duration-300">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                    <MapPin className="w-3.5 h-3.5" /> Şehir
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                                        value={salonData.city_id}
                                        onChange={e => setSalonData({ ...salonData, city_id: e.target.value, district_id: '' })}
                                    >
                                        <option value="">Şehir Seçin</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                    <MapPin className="w-3.5 h-3.5" /> İlçe
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer disabled:opacity-40"
                                        disabled={!salonData.city_id}
                                        value={salonData.district_id}
                                        onChange={e => setSalonData({ ...salonData, district_id: e.target.value })}
                                    >
                                        <option value="">İlçe Seçin</option>
                                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                    <MapPin className="w-3.5 h-3.5" /> Mahalle
                                </label>
                                <input
                                    className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Örn: Barbaros Mah."
                                    value={salonData.neighborhood}
                                    onChange={e => setSalonData({ ...salonData, neighborhood: e.target.value })}
                                />
                            </div>
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                    <MapPin className="w-3.5 h-3.5" /> Cadde
                                </label>
                                <input
                                    className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Örn: Atatürk Cad."
                                    value={salonData.avenue || ''}
                                    onChange={e => setSalonData({ ...salonData, avenue: e.target.value })}
                                />
                            </div>
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                    <MapPin className="w-3.5 h-3.5" /> Sokak
                                </label>
                                <input
                                    className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Örn: Karanfil Sokak"
                                    value={salonData.street}
                                    onChange={e => setSalonData({ ...salonData, street: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                        Bina No
                                    </label>
                                    <input
                                        className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="No: 12"
                                        value={salonData.building_no}
                                        onChange={e => setSalonData({ ...salonData, building_no: e.target.value })}
                                    />
                                </div>
                                <div className="group">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                        Daire / Kat
                                    </label>
                                    <input
                                        className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="D: 5"
                                        value={salonData.apartment_no}
                                        onChange={e => setSalonData({ ...salonData, apartment_no: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                    <Info className="w-3.5 h-3.5" /> Ek Bilgiler (Opsiyonel)
                                </label>
                                <input
                                    className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Örn: Market yanı, 2. kat"
                                    value={salonData.address}
                                    onChange={e => setSalonData({ ...salonData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Coordinate Display */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                    <MapPin className="w-3.5 h-3.5" /> Enlem (Latitude)
                                </label>
                                <div className="relative">
                                    <input className="w-full px-6 py-4.5 bg-gray-100/50 border border-border rounded-2xl font-black text-text-muted outline-none cursor-default" readOnly value={salonData.geo_latitude.toFixed(6)} />
                                </div>
                            </div>
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                                    <MapPin className="w-3.5 h-3.5" /> Boylam (Longitude)
                                </label>
                                <div className="relative">
                                    <input className="w-full px-6 py-4.5 bg-gray-100/50 border border-border rounded-2xl font-black text-text-muted outline-none cursor-default" readOnly value={salonData.geo_longitude.toFixed(6)} />
                                </div>
                            </div>
                        </div>

                        <div className="relative group p-1.5 bg-surface border border-border rounded-[40px] shadow-card overflow-hidden">
                            <div className="h-[450px] rounded-[32px] overflow-hidden border border-border relative z-0">
                                <AdminSalonMap
                                    center={[salonData.geo_latitude, salonData.geo_longitude]}
                                    markerPosition={{ lat: salonData.geo_latitude, lng: salonData.geo_longitude }}
                                    onLocationSelect={(lat, lng) => setSalonData({ ...salonData, geo_latitude: lat, geo_longitude: lng })}
                                />
                                <div className="absolute top-6 left-6 z-[1000] bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-border/50 text-[10px] font-black uppercase tracking-widest text-text-main shadow-2xl flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    Konumunuzu Haritadan İşaretleyin
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-8 text-center py-10 animate-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-green-50 rounded-[30px] flex items-center justify-center text-green-600 mx-auto shadow-inner border border-green-100">
                            <ShieldCheck className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-text-main">Her şey hazır mı?</h2>
                            <p className="text-text-secondary font-medium">"Onaya Gönder" butonuna bastığınızda salonunuz admin incelemesine gidecektir. Bu süreçte bazı alanlar düzenlemeye kapalı olabilir.</p>
                        </div>
                        <div className="max-w-md mx-auto bg-gray-50 rounded-3xl p-6 border border-border text-left space-y-4">
                            <div className="flex justify-between border-b border-white pb-3">
                                <span className="text-[10px] font-black text-text-muted uppercase">Salon İsmi</span>
                                <span className="text-sm font-bold text-text-main">{salonData.name || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-white pb-3">
                                <span className="text-[10px] font-black text-text-muted uppercase">Adres</span>
                                <span className="text-sm font-bold text-text-main truncate max-w-[200px]">
                                    {salonData.neighborhood || salonData.avenue || salonData.street
                                        ? `${salonData.neighborhood} ${salonData.avenue ? salonData.avenue + ' ' : ''}${salonData.street} No:${salonData.building_no}`
                                        : (salonData.address || '-')}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white pb-3">
                                <span className="text-[10px] font-black text-text-muted uppercase">Statü</span>
                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase">Hazırlanıyor</span>
                            </div>
                            <div className="flex justify-between border-b border-white pb-3">
                                <span className="text-[10px] font-black text-text-muted uppercase">Seçilen Hizmetler</span>
                                <span className="text-sm font-bold text-text-main">{selectedServices.length} Adet</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] font-black text-text-muted uppercase">Personel Sayısı</span>
                                <span className="text-sm font-bold text-text-main">{staffMembers.length > 0 ? `${staffMembers.length} Kişi` : 'Belirlenmedi'}</span>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-blue-900 mb-1">Çalışma Saatleri</h3>
                                <p className="text-sm text-blue-800/80 font-medium">İşletmenizin standart çalışma saatlerini belirleyin. Bu saatler personel vardiyaları için de varsayılan olarak kullanılacaktır. Daha sonra dilediğiniz zaman değiştirebilirsiniz.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {workingHours.map((h, index) => (
                                <div
                                    key={h.day_of_week}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${h.is_closed
                                        ? 'bg-gray-50 border-gray-200 opacity-60'
                                        : 'bg-white border-border shadow-sm hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${h.is_closed ? 'bg-gray-200 text-text-muted' : 'bg-primary/10 text-primary'
                                            }`}>
                                            {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][h.day_of_week]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-main">
                                                {['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][h.day_of_week]}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {!h.is_closed && (
                                            <div className="flex items-center gap-2 bg-surface-alt px-3 py-2 rounded-xl border border-border">
                                                <input
                                                    type="time"
                                                    value={h.start_time}
                                                    onChange={(e) => handleHourChange(index, 'start_time', e.target.value)}
                                                    className="bg-transparent font-bold text-sm outline-none w-20 text-center"
                                                />
                                                <span className="text-text-muted font-black">-</span>
                                                <input
                                                    type="time"
                                                    value={h.end_time}
                                                    onChange={(e) => handleHourChange(index, 'end_time', e.target.value)}
                                                    className="bg-transparent font-bold text-sm outline-none w-20 text-center"
                                                />
                                            </div>
                                        )}

                                        <button
                                            onClick={() => toggleDay(index)}
                                            className={`w-28 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${h.is_closed
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                }`}
                                        >
                                            {h.is_closed ? 'Açık Yap' : 'Kapat'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <Star className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text-main mb-1">Hizmet Seçimi</h3>
                                <p className="text-sm text-text-secondary font-medium">Salonunuzun sunduğu hizmetleri belirleyin. Fiyat ve süreleri daha sonra da güncelleyebilirsiniz.</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {categories.map(category => {
                                const categoryServices = globalServices.filter(s => s.category_id === category.id);
                                if (categoryServices.length === 0) return null;

                                return (
                                    <div key={category.id} className="space-y-4">
                                        <div className="flex justify-between items-center group">
                                            <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">{category.name}</h4>
                                            <button
                                                onClick={() => addCategoryServices(category.id)}
                                                className="text-[10px] font-black text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                + TÜMÜNÜ EKLE
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {categoryServices.map(service => {
                                                const selected = selectedServices.find(s => s.global_service_id === service.id);
                                                return (
                                                    <div
                                                        key={service.id}
                                                        className={`p-4 rounded-2xl border transition-all ${selected
                                                            ? 'bg-white border-primary shadow-md ring-1 ring-primary/20'
                                                            : 'bg-white border-border hover:border-primary/30'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => toggleService(service.id)}
                                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selected ? 'bg-primary border-primary text-white' : 'border-border'
                                                                        }`}
                                                                >
                                                                    {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                                </button>
                                                                <span className={`text-sm font-bold ${selected ? 'text-text-main' : 'text-text-secondary'}`}>
                                                                    {service.name}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {selected && (
                                                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                                                                <div className="flex-1">
                                                                    <label className="text-[9px] font-black text-text-muted uppercase mb-1 block">Fiyat (₺)</label>
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-gray-50 border border-border rounded-lg px-2 py-1 text-sm font-bold outline-none focus:border-primary"
                                                                        value={selected.price}
                                                                        onChange={e => updateServiceDetails(service.id, 'price', parseInt(e.target.value) || 0)}
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="text-[9px] font-black text-text-muted uppercase mb-1 block">Süre (Dk)</label>
                                                                    <input
                                                                        type="number"
                                                                        className="w-full bg-gray-50 border border-border rounded-lg px-2 py-1 text-sm font-bold outline-none focus:border-primary"
                                                                        value={selected.duration_min}
                                                                        onChange={e => updateServiceDetails(service.id, 'duration_min', parseInt(e.target.value) || 0)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 flex items-start gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-orange-900 mb-1">Ekibinizi Oluşturun</h3>
                                <p className="text-sm text-orange-800/80 font-medium">Salonunuzda çalışan personelleri ekleyin. Randevu takvimi ve hizmetler personellere göre özelleştirilecektir. Kendinizi eklemeyi unutmayın!</p>
                            </div>
                        </div>

                        {/* Add Staff Form */}
                        <div className="bg-gray-50 rounded-2xl p-5 border border-border space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-text-main">Yeni Personel Ekle</h4>
                                <button
                                    onClick={addMyselfAsStaff}
                                    disabled={staffMembers.some(s => s.is_owner)}
                                    className="text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    + KENDİMİ EKLE
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black text-text-muted uppercase tracking-wider">Uzmanlık Alanları (Hizmetler)</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setNewStaff({ ...newStaff, service_ids: selectedServices.map(s => s.global_service_id) })}
                                            className="text-[10px] font-bold text-primary hover:underline"
                                        >
                                            TÜMÜNÜ SEÇ
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            onClick={() => setNewStaff({ ...newStaff, service_ids: [] })}
                                            className="text-[10px] font-bold text-text-muted hover:underline"
                                        >
                                            TEMİZLE
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded-xl border border-border max-h-[200px] overflow-y-auto">
                                    {selectedServices.map(s => {
                                        const globalService = globalServices.find(gs => gs.id === s.global_service_id);
                                        const isChecked = (newStaff as any).service_ids?.includes(s.global_service_id);
                                        return (
                                            <label key={s.global_service_id} className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${isChecked ? 'bg-primary/5 border-primary/20' : 'bg-gray-50/50 border-transparent hover:border-gray-200'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        const current = (newStaff as any).service_ids || [];
                                                        const next = current.includes(s.global_service_id)
                                                            ? current.filter((id: string) => id !== s.global_service_id)
                                                            : [...current, s.global_service_id];
                                                        setNewStaff({ ...newStaff, service_ids: next });
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                                                />
                                                <span className="text-xs font-medium text-text-main truncate">{globalService?.name || 'Hizmet'}</span>
                                            </label>
                                        );
                                    })}
                                    {selectedServices.length === 0 && (
                                        <p className="col-span-2 text-center py-4 text-xs text-text-muted italic">Önce hizmet seçmelisiniz.</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={addStaff}
                                disabled={!newStaff.name || !newStaff.role}
                                className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                Listeye Ekle
                            </button>
                        </div>

                        {/* Staff List */}
                        {staffMembers.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-bold text-text-muted text-xs uppercase tracking-wider pl-2">Eklenecek Personeller ({staffMembers.length})</h4>
                                {staffMembers.map((staff, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-border rounded-xl shadow-sm group hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${staff.is_owner ? 'bg-primary' : 'bg-gray-400'}`}>
                                                {staff.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h5 className="font-bold text-text-main">{staff.name}</h5>
                                                    {staff.is_owner && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black">YÖNETİCİ</span>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-text-muted">{staff.role}</p>
                                                    <span className="text-[8px] text-gray-300">•</span>
                                                    <p className="text-[10px] text-primary font-bold uppercase tracking-tight">{staff.service_ids?.length || 0} Hizmet</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeStaff(idx)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                        >
                                            <div className="w-5 h-5 flex items-center justify-center border border-current rounded-full">×</div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">

                {/* Wizard Header */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-primary rounded-[22px] flex items-center justify-center text-white mx-auto shadow-xl shadow-primary/20 mb-6 font-display">
                        <Store className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black text-text-main tracking-tight font-display">İşletmenizi Tanıtın</h1>
                    <p className="text-text-secondary font-medium italic">Profesyonel güzellik dünyasına ilk adımınızı atın.</p>
                </div>

                {/* Progress Bar */}
                <div className="relative group">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(241,114,144,0.5)]" style={{ width: `${(currentStep / 6) * 100}%` }}></div>
                    </div>
                    <div className="relative flex justify-between">
                        {STEPS.map((step) => (
                            <div key={step.id} className="flex flex-col items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 border-4 ${currentStep >= step.id ? 'bg-primary border-white text-white shadow-lg' : 'bg-white border-gray-100 text-text-muted group-hover:border-gray-200'}`}>
                                    <step.icon className={`w-5 h-5 ${currentStep === step.id ? 'animate-pulse' : ''}`} />
                                </div>
                                <div className="hidden sm:block text-center">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= step.id ? 'text-primary' : 'text-text-muted'}`}>{step.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-[30px] sm:rounded-[40px] border border-border shadow-card overflow-hidden">
                    <div className="p-6 sm:p-12">
                        {/* Step Label */}
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-1">ADIM {currentStep}</p>
                                <h2 className="text-2xl font-black text-text-main tracking-tight font-display">{STEPS[currentStep - 1].title}</h2>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-[11px] font-black text-text-muted border border-border">
                                {currentStep}/6
                            </div>
                        </div>

                        {renderStepContent()}

                        {/* Navigation Footer */}
                        <div className="mt-12 pt-10 border-t border-gray-100 flex justify-between items-center">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1 || loading}
                                className={`flex items-center gap-2 font-black text-sm uppercase tracking-widest px-6 py-4 rounded-2xl transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-text-muted hover:text-text-main hover:bg-gray-50'}`}
                            >
                                <ChevronLeft className="w-4 h-4" /> Geri
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={loading}
                                className="group flex items-center gap-3 bg-primary text-white font-black text-sm uppercase tracking-widest px-12 py-5 rounded-2xl shadow-xl shadow-primary/25 hover:bg-primary-hover hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Tamamlanıyor...</span>
                                    </div>
                                ) : (
                                    <>
                                        {currentStep === 6 ? 'Onaya Gönder' : 'Sonraki Adım'}
                                        <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${currentStep === 6 ? 'hidden' : ''}`} />
                                        {currentStep === 6 && <Save className="w-4 h-4" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }

                `}</style>
            </div>
        </div>
    );
}
