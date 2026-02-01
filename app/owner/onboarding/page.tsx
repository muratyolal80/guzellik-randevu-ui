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
    const [selectedServices, setSelectedServices] = useState<{ global_service_id: string, price: number, duration_min: number }[]>([]);
    const [staffMembers, setStaffMembers] = useState<{ name: string, role: string, phone: string, email: string, is_owner: boolean }[]>([]);
    const [newStaff, setNewStaff] = useState({ name: '', role: '', phone: '', email: '' });

    const [salonData, setSalonData] = useState<any>({
        name: '',
        phone: '',
        type_id: '',
        city_id: '',
        district_id: '',
        address: '',
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
            setSelectedServices([...selectedServices, { global_service_id: serviceId, price: 0, duration_min: 30 }]);
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
                newServices.push({ global_service_id: gs.id, price: 0, duration_min: 30 });
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
        setNewStaff({ name: '', role: '', phone: '', email: '' });
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
            is_owner: true
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

    useEffect(() => {
        if (salonData.city_id) {
            MasterDataService.getDistrictsByCity(salonData.city_id).then(setDistricts);
        }
    }, [salonData.city_id]);

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
                salon = await SalonDataService.createSalon({
                    ...salonData,
                    owner_id: user?.id
                }, workingHours, selectedServices);
            }

            console.log('Onboarding step 2: Submitting for approval...');
            // 2. Submit for Approval
            await SalonDataService.submitForApproval(salon.id);

            // 3. Clear active salon cache for this user to force refresh
            // 3. Clear active salon cache for this user to force refresh
            // 3. Create Staff Members
            if (staffMembers.length > 0) {
                console.log('Onboarding step 3: Creating staff...');
                await Promise.all(staffMembers.map(staff =>
                    StaffService.createStaff({
                        salon_id: salon.id,
                        name: staff.name,
                        role: staff.role,
                        phone: staff.phone,
                        email: staff.email,
                        is_active: true
                    })
                ));
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
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label-sm">Salon İsmi</label>
                                <input className="input-field" placeholder="Lüks Güzellik Merkezi" value={salonData.name} onChange={e => setSalonData({ ...salonData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="label-sm">İşletme Telefonu</label>
                                <input className="input-field" placeholder="0212 XXX XX XX" value={salonData.phone} onChange={e => setSalonData({ ...salonData, phone: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="label-sm">İşletme Tipi</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {salonTypes.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={() => setSalonData({ ...salonData, type_id: t.id })}
                                        className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition-all ${salonData.type_id === t.id ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-primary/20'}`}
                                    >
                                        <p className="text-xs font-black uppercase text-text-main">{t.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="label-sm">Kısa Açıklama</label>
                            <textarea className="input-field h-32 pt-4" placeholder="Müşterilerinize salonunuzu tanıtın..." value={salonData.description} onChange={e => setSalonData({ ...salonData, description: e.target.value })}></textarea>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-sm">Şehir</label>
                                <select className="input-field" value={salonData.city_id} onChange={e => setSalonData({ ...salonData, city_id: e.target.value, district_id: '' })}>
                                    <option value="">Şehir Seçin</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-sm">İlçe</label>
                                <select className="input-field" disabled={!salonData.city_id} value={salonData.district_id} onChange={e => setSalonData({ ...salonData, district_id: e.target.value })}>
                                    <option value="">İlçe Seçin</option>
                                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="label-sm">Açık Adres</label>
                            <textarea className="input-field h-24 pt-3" placeholder="Sokak, No, Kapı..." value={salonData.address} onChange={e => setSalonData({ ...salonData, address: e.target.value })}></textarea>
                        </div>

                        {/* Coordinate Display for User Feedback */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative group">
                                <label className="label-sm">Enlem (Latitude)</label>
                                <div className="flex items-center">
                                    <input className="input-field bg-gray-50 cursor-default" readOnly value={salonData.geo_latitude.toFixed(6)} />
                                    <MapPin className="absolute right-4 w-4 h-4 text-text-muted" />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="label-sm">Boylam (Longitude)</label>
                                <div className="flex items-center">
                                    <input className="input-field bg-gray-50 cursor-default" readOnly value={salonData.geo_longitude.toFixed(6)} />
                                    <MapPin className="absolute right-4 w-4 h-4 text-text-muted" />
                                </div>
                            </div>
                        </div>

                        <div className="h-[450px] rounded-3xl overflow-hidden border-2 border-border shadow-inner mt-4 relative">
                            <AdminSalonMap
                                center={[salonData.geo_latitude, salonData.geo_longitude]}
                                markerPosition={{ lat: salonData.geo_latitude, lng: salonData.geo_longitude }}
                                onLocationSelect={(lat, lng) => setSalonData({ ...salonData, geo_latitude: lat, geo_longitude: lng })}
                            />
                            <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-border text-[10px] font-black uppercase text-text-main shadow-sm flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-primary" /> Konumunuzu haritadan işaretleyin
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
                                <span className="text-sm font-bold text-text-main truncate max-w-[200px]">{salonData.address || '-'}</span>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    className="px-4 py-3 rounded-xl border border-border bg-white text-sm font-medium outline-none focus:border-primary"
                                    placeholder="Ad Soyad *"
                                    value={newStaff.name}
                                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                />
                                <input
                                    className="px-4 py-3 rounded-xl border border-border bg-white text-sm font-medium outline-none focus:border-primary"
                                    placeholder="Görevi (Örn: Kıdemli Kuaför) *"
                                    value={newStaff.role}
                                    onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                                />
                                <input
                                    className="px-4 py-3 rounded-xl border border-border bg-white text-sm font-medium outline-none focus:border-primary"
                                    placeholder="Telefon (Opsiyonel)"
                                    value={newStaff.phone}
                                    onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                                />
                                <input
                                    className="px-4 py-3 rounded-xl border border-border bg-white text-sm font-medium outline-none focus:border-primary"
                                    placeholder="E-posta (Opsiyonel)"
                                    value={newStaff.email}
                                    onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                />
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
                                                <p className="text-xs text-text-muted">{staff.role}</p>
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
                .label-sm {
                    display: block;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #475569; /* Slate 600 */
                    margin-bottom: 8px;
                    padding-left: 4px;
                }
                .input-field {
                    width: 100%;
                    height: 58px;
                    padding: 0 20px;
                    border-radius: 18px;
                    border: 1.5px solid #cbd5e1; /* Slightly thicker and darker */
                    background-color: #f8fafc; /* Slate 50 for contrast */
                    font-weight: 600;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    color: #0f172a;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
                }
                .input-field:hover {
                    border-color: #94a3b8;
                    background-color: #ffffff;
                }
                .input-field:focus {
                    background-color: white;
                    border-color: #f17290;
                    box-shadow: 0 0 0 4px rgba(241, 114, 144, 0.15), 0 4px 12px rgba(241, 114, 144, 0.08);
                    border-width: 1.5px;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                `}</style>
            </div>
        </div>
    );
}
