<<<<<<< HEAD
"use client";

import React, { useState, useEffect } from "react";
import { 
  SalonDataService, 
  MasterDataService, 
  SubscriptionService,
} from "@/services/db";
import { supabase } from "@/lib/supabase";
import { City, District, SalonType, Profile } from "@/types";
import {
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { getErrorMessage } from "@/lib/error-mapping";
import { AdminLayout } from "@/components/AdminLayout";
import { Breadcrumbs } from "@/components/Admin/Breadcrumbs";

// New Components
import { QuickOwnerModal } from "@/components/Admin/QuickOwnerModal";
import { SalonPreviewCard } from "@/components/Admin/SalonPreviewCard";
import { 
  Step1OwnerSelection, 
  Step2PlanLimits, 
  Step3BasicInfo, 
  Step4LocationMap,
  Step8FinalPreview
} from "./_components/WizardSteps";

// Step Managers
import SalonWorkingHoursForm from "@/components/shared/salon/SalonWorkingHoursForm";
import SalonServicesManager from "@/components/shared/salon/SalonServicesManager";
import SalonStaffManager from "@/components/shared/salon/SalonStaffManager";

const STEPS = [
  { id: 1, title: "Owner Seçimi" },
  { id: 2, title: "Paket & Limit" },
  { id: 3, title: "Temel Bilgiler" },
  { id: 4, title: "Konum & Harita" },
  { id: 5, title: "Çalışma Saatleri" },
  { id: 6, title: "Hizmetler" },
  { id: 7, title: "Personel" },
  { id: 8, title: "Önizleme & Onay" },
];

export default function AdminNewSalonPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  
  // Data States
  const [selectedOwner, setSelectedOwner] = useState<Profile | null>(null);
  const [ownerSubscription, setOwnerSubscription] = useState<any>(null);
  const [limitStatus, setLimitStatus] = useState<{ allowed: boolean; limit: number; current: number } | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const [salonData, setSalonData] = useState<any>({
    name: "",
    phone: "",
    type_ids: [] as string[],
    primary_type_id: "",
    city_id: "",
    district_id: "",
    address: "",
    description: "",
    geo_latitude: 41.0082,
    geo_longitude: 28.9784,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop",
    status: "APPROVED",
  });

  const [workingHours] = useState([
    { day_of_week: 1, start_time: "09:00", end_time: "19:00", is_closed: false },
    { day_of_week: 2, start_time: "09:00", end_time: "19:00", is_closed: false },
    { day_of_week: 3, start_time: "09:00", end_time: "19:00", is_closed: false },
    { day_of_week: 4, start_time: "09:00", end_time: "19:00", is_closed: false },
    { day_of_week: 5, start_time: "09:00", end_time: "19:00", is_closed: false },
    { day_of_week: 6, start_time: "09:00", end_time: "19:00", is_closed: false },
    { day_of_week: 0, start_time: "09:00", end_time: "19:00", is_closed: true },
  ]);

  // Load Master Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, st, p] = await Promise.all([
          MasterDataService.getCities(),
          MasterDataService.getSalonTypes(),
          SubscriptionService.getPlans()
        ]);
        setCities(c || []);
        setSalonTypes(st || []);
        setPlans(p || []);
      } catch (err) {
        console.error("Master data load error:", err);
      }
    };
    fetchData();
  }, []);

  // Reload districts on city change
  useEffect(() => {
    if (salonData.city_id) {
      MasterDataService.getDistrictsByCity(salonData.city_id).then(d => setDistricts(d || []));
    }
  }, [salonData.city_id]);

  // Check Limits when owner selected
  useEffect(() => {
    if (!selectedOwner) {
      setOwnerSubscription(null);
      setLimitStatus(null);
      return;
    }
    const checkOwnerStats = async () => {
      try {
        const sub = await SubscriptionService.getOwnerActiveSubscription(selectedOwner.id);
        const { count: salonCount } = await supabase
          .from('salons')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', selectedOwner.id)
          .not('status', 'eq', 'DELETED');
        
        const limit = sub?.subscription_plans?.max_branches ?? 0;
        const current = salonCount || 0;
        const allowed = limit === -1 || current < limit;

        setOwnerSubscription(sub);
        setLimitStatus({ allowed, limit, current });
      } catch (err) {
        console.error("Limit check error:", err);
      }
    };
    checkOwnerStats();
  }, [selectedOwner]);

  const handleNext = async () => {
    if (currentStep === 1 && !selectedOwner) {
      showToast("Lütfen bir salon sahibi seçin.", "warning");
      return;
    }
    if (currentStep === 3) {
      if (!salonData.name || !salonData.primary_type_id) {
        showToast("Lütfen salon adı ve ana kategori seçin.", "warning");
        return;
      }
    }
    if (currentStep === 4) {
      if (!salonData.city_id || !salonData.district_id) {
        showToast("Lütfen şehir ve ilçe seçin.", "warning");
        return;
      }
      
      setLoading(true);
      try {
        if (!salonData.id) {
          const newSalon = await SalonDataService.createSalon(
            {
              ...salonData,
              owner_id: selectedOwner!.id,
              type_id: salonData.primary_type_id,
              status: 'DRAFT'
            },
            workingHours,
            [],
            supabase,
            true
          );
          setSalonData((prev: any) => ({ ...prev, id: newSalon.id }));
          showToast("Salon taslağı oluşturuldu.", "success");
        } else {
          await SalonDataService.updateSalon(salonData.id, {
            ...salonData,
            type_id: salonData.primary_type_id
          });
        }
      } catch (err) {
        showToast(getErrorMessage(err), "error");
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    if (currentStep < 8) setCurrentStep(prev => prev + 1);
    else handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    if (!ownerSubscription && !selectedPlanId) {
      showToast("Lütfen bir abonelik planı seçin.", "warning");
      return;
    }
    setLoading(true);
    try {
      if (salonData.id) {
        await SalonDataService.setSalonStatus(salonData.id, 'APPROVED');
        if (!ownerSubscription && selectedPlanId) {
          await SubscriptionService.adminAssignSubscription(salonData.id, selectedPlanId, "MONTHLY");
        }
        showToast("Salon başarıyla oluşturuldu ve aktifleştirildi.", "success");
        router.push("/admin/salons/approvals");
      }
    } catch (err) {
      showToast(getErrorMessage(err), "error");
=======
'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Breadcrumbs } from '@/components/Admin/Breadcrumbs';
import {
  SalonDataService,
  MasterDataService,
  SubscriptionService,
  ProfileService,
} from '@/services/db';
import { City, District, SalonType, Profile } from '@/types';
import {
  User,
  Store,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Camera,
  Phone,
  Info,
  Star,
  ShieldCheck,
  Search,
  AlertTriangle,
  Package,
  ExternalLink,
  AlertCircle,
  Check,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GeocodingService } from '@/lib/geocoding/geocoding';
import dynamic from 'next/dynamic';
import SalonWorkingHoursForm from '@/components/shared/salon/SalonWorkingHoursForm';
import SalonServicesManager from '@/components/shared/salon/SalonServicesManager';
import SalonStaffManager from '@/components/shared/salon/SalonStaffManager';
import SalonGalleryManager from '@/components/shared/salon/SalonGalleryManager';

const AdminSalonMap = dynamic(
  () => import('@/components/Admin/AdminSalonMap'),
  { ssr: false },
);

// ─── STEP CONFIG ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Owner Seçimi', icon: User, desc: 'Salon sahibini belirleyin' },
  { id: 2, title: 'Paket Kontrolü', icon: Package, desc: 'Limit ve abonelik durumu' },
  { id: 3, title: 'Temel Bilgiler', icon: Store, desc: 'Salon adı ve iletişim' },
  { id: 4, title: 'Konum & Harita', icon: MapPin, desc: 'Adres ve harita pini' },
  { id: 5, title: 'Çalışma Saatleri', icon: Clock, desc: 'Mesai başlangıç/bitiş' },
  { id: 6, title: 'Hizmetler', icon: Star, desc: 'Servis tanımları' },
  { id: 7, title: 'Personel', icon: Users, desc: 'Çalışan ekibi' },
  { id: 8, title: 'Galeri & Onay', icon: Camera, desc: 'Fotoğraflar ve önizleme' },
];

// ─── TYPES ───────────────────────────────────────────────────────────────────────
interface PackageStatus {
  loading: boolean;
  hasActivePlan: boolean;
  planName: string;
  planDisplayName: string;
  branchLimit: number;
  currentBranches: number;
  canAdd: boolean;
  reason: 'OK' | 'NO_PLAN' | 'LIMIT_REACHED' | 'TRIAL_EXPIRED';
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────────
export default function AdminAddSalonPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);

  // Step 1: Owner
  const [owners, setOwners] = useState<Profile[]>([]);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<Profile | null>(null);

  // Step 2: Package status
  const [pkgStatus, setPkgStatus] = useState<PackageStatus>({
    loading: false,
    hasActivePlan: false,
    planName: '',
    planDisplayName: '',
    branchLimit: 0,
    currentBranches: 0,
    canAdd: false,
    reason: 'NO_PLAN',
  });

  // Master data
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);
  const [globalServices, setGlobalServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [assigningPlan, setAssigningPlan] = useState(false);
  const [showPlanSelector, setShowPlanSelector] = useState(false);

  // Salon form data
  const [salonData, setSalonData] = useState<any>({
    name: '',
    phone: '',
    type_ids: [] as string[],
    primary_type_id: '',
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
    status: 'DRAFT',
  });

  const [salonId, setSalonId] = useState<string | null>(null);
  const [workingHours, setWorkingHours] = useState([
    { day_of_week: 1, start_time: '09:00', end_time: '19:00', is_closed: false },
    { day_of_week: 2, start_time: '09:00', end_time: '19:00', is_closed: false },
    { day_of_week: 3, start_time: '09:00', end_time: '19:00', is_closed: false },
    { day_of_week: 4, start_time: '09:00', end_time: '19:00', is_closed: false },
    { day_of_week: 5, start_time: '09:00', end_time: '19:00', is_closed: false },
    { day_of_week: 6, start_time: '09:00', end_time: '19:00', is_closed: false },
    { day_of_week: 0, start_time: '09:00', end_time: '19:00', is_closed: true },
  ]);

  const [selectedServices, setSelectedServices] = useState<{
    global_service_id: string;
    name: string;
    price: number;
    duration_min: number;
  }[]>([]);

  const [autoApprove, setAutoApprove] = useState(true);

  // ─── LOAD OWNERS ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setOwnersLoading(true);
        const result = await ProfileService.adminGetProfiles({
          role: 'SALON_OWNER',
          pageSize: 100,
        });
        setOwners(result.profiles);
      } catch (err) {
        console.error('Owner fetch error:', err);
      } finally {
        setOwnersLoading(false);
      }
    };
    fetchOwners();
  }, []);

  // ─── LOAD MASTER DATA ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [citiesData, typesData, categoriesData, servicesData, plansData] = await Promise.all([
          MasterDataService.getCities(),
          MasterDataService.getSalonTypes(),
          MasterDataService.getServiceCategories(),
          MasterDataService.getAllGlobalServices(),
          SubscriptionService.getPlans(),
        ]);
        setCities(citiesData || []);
        setSalonTypes(typesData || []);
        setCategories(categoriesData || []);
        setGlobalServices(servicesData || []);
        setAllPlans(plansData || []);
      } catch (err) {
        console.error('Master data fetch error:', err);
      }
    };
    fetchMasterData();
  }, []);

  // ─── LOAD DISTRICTS ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (salonData.city_id) {
      MasterDataService.getDistrictsByCity(salonData.city_id).then(setDistricts);
    }
  }, [salonData.city_id]);

  // ─── LOAD SERVICES BY SALON TYPE ───────────────────────────────────────────────
  useEffect(() => {
    const loadServices = async () => {
      if (!salonData.type_ids || salonData.type_ids.length === 0) {
        setSelectedServices([]);
        return;
      }
      try {
        const relatedCategories = await MasterDataService.getServiceCategoriesForSalonTypes(salonData.type_ids);
        if (relatedCategories.length === 0) { setSelectedServices([]); return; }
        const categoryIds = relatedCategories.map((c: any) => c.id);
        const services = await MasterDataService.getGlobalServicesByCategories(categoryIds);
        setSelectedServices(
          services.map((s: any) => ({
            global_service_id: s.id,
            name: s.name,
            price: 0,
            duration_min: 30,
          })),
        );
      } catch (err) {
        console.error('Services load error:', err);
      }
    };
    loadServices();
  }, [salonData.type_ids]);

  // ─── CHECK PACKAGE STATUS ──────────────────────────────────────────────────────
  const checkPackageStatus = async (owner: Profile) => {
    setPkgStatus(prev => ({ ...prev, loading: true }));
    try {
      const activeSub = await SubscriptionService.getOwnerActiveSubscription(owner.id);
      if (!activeSub || !activeSub.subscription_plans) {
        setPkgStatus({
          loading: false,
          hasActivePlan: false,
          planName: '',
          planDisplayName: '',
          branchLimit: 0,
          currentBranches: 0,
          canAdd: false,
          reason: 'NO_PLAN',
        });
        return;
      }

      const plan = activeSub.subscription_plans;
      // Check branch limit using the salon id
      const limitResult = await SubscriptionService.checkLimit(activeSub.salon_id, 'branch');

      const reason = limitResult.limit === -2
        ? 'TRIAL_EXPIRED'
        : !limitResult.allowed
          ? 'LIMIT_REACHED'
          : 'OK';

      setPkgStatus({
        loading: false,
        hasActivePlan: true,
        planName: plan.name,
        planDisplayName: plan.display_name,
        branchLimit: limitResult.limit,
        currentBranches: limitResult.current,
        canAdd: limitResult.allowed,
        reason,
      });
    } catch (err) {
      console.error('Package check error:', err);
      setPkgStatus(prev => ({ ...prev, loading: false, reason: 'NO_PLAN', canAdd: false }));
    }
  };

  // ─── ADMIN: ASSIGN PLAN ───────────────────────────────────────────────────────
  const handleAdminAssignPlan = async (planId: string) => {
    if (!selectedOwner) return;
    setAssigningPlan(true);
    try {
      // 1. Önce geçici bir salon oluştur (Abonelik için salon_id gerekli)
      const draftSalon = await SalonDataService.createSalon(
        {
          ...salonData,
          name: salonData.name || 'Yeni Salon (Taslak)',
          owner_id: selectedOwner.id,
          status: 'DRAFT',
        },
        [],
        [],
        undefined,
        true, // bypass limit
      );
      
      setSalonId(draftSalon.id);

      // 2. Aboneliği ata
      await SubscriptionService.adminAssignSubscription(draftSalon.id, planId);
      
      // 3. Durumu güncelle
      await checkPackageStatus(selectedOwner);
      setShowPlanSelector(false);
      alert('Paket başarıyla tanımlandı. Sürece devam edebilirsiniz.');
    } catch (err: any) {
      console.error('Plan assignment error:', err);
      alert('Hata: ' + (err.message || 'Paket atanırken bir sorun oluştu'));
    } finally {
      setAssigningPlan(false);
    }
  };

  // ─── ADDRESS GEOCODING ─────────────────────────────────────────────────────────
  const handleAddressBlur = async () => {
    if (!salonData.city_id) return;
    const cityName = cities.find(c => c.id === salonData.city_id)?.name;
    const districtName = districts.find(d => d.id === salonData.district_id)?.name;
    if (!cityName) return;

    const hasDetailedAddress = salonData.avenue || salonData.street || salonData.neighborhood;
    let searchQuery = '';
    if (hasDetailedAddress) {
      const parts = [salonData.avenue, salonData.street, salonData.building_no ? `No: ${salonData.building_no}` : '', salonData.neighborhood, districtName, cityName, 'Türkiye'].filter(Boolean);
      if (parts.length < 3) return;
      searchQuery = parts.join(', ');
    } else if (districtName) {
      searchQuery = `${districtName}, ${cityName}, Türkiye`;
    } else { return; }

    setMapLoading(true);
    try {
      const result = await GeocodingService.searchAddress(searchQuery);
      if (result) {
        setSalonData((prev: any) => ({ ...prev, geo_latitude: result.lat, geo_longitude: result.lon }));
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setMapLoading(false);
    }
  };

  // ─── NAVIGATION ────────────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (currentStep === 1) {
      if (!selectedOwner) { alert('Lütfen bir salon sahibi seçin.'); return; }
      await checkPackageStatus(selectedOwner);
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!pkgStatus.canAdd) { return; } // Button disabled anyway
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!salonData.name || !salonData.primary_type_id) {
        alert('Lütfen geçerli bir salon adı ve işletme tipi seçin.');
        return;
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!salonData.city_id || !salonData.district_id) {
        alert('Lütfen şehir ve ilçe seçimini yapın.');
        return;
      }
      // Create salon record here so sub-components can live-save
      if (!salonId) {
        setLoading(true);
        try {
          const salon = await SalonDataService.createSalon(
            {
              ...salonData,
              type_id: salonData.primary_type_id,
              owner_id: selectedOwner!.id,
            },
            workingHours,
            [],
            undefined, // default supabase client
            true, // bypassLimitCheck — admin privilege
          );
          setSalonId(salon.id);
        } catch (err: any) {
          console.error('Salon oluşturma hatası:', err);
          alert('Salon oluşturulurken hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
          setLoading(false);
          return;
        }
        setLoading(false);
      }
      setCurrentStep(5);
      return;
    }

    if (currentStep < 8) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  // ─── COMPLETE ──────────────────────────────────────────────────────────────────
  const handleComplete = async () => {
    if (!salonId) { alert('Salon kaydı bulunamadı. Lütfen tekrar deneyin.'); return; }
    setLoading(true);
    try {
      // Update salon with final data
      await SalonDataService.updateSalon(salonId, {
        ...salonData,
        type_id: salonData.primary_type_id,
      });

      if (autoApprove) {
        await SalonDataService.approveSalon(salonId);
      } else {
        await SalonDataService.submitForApproval(salonId);
      }

      router.push('/admin/salons/approvals?created=1');
    } catch (err: any) {
      console.error('Tamamlama hatası:', err);
      alert('İşlem sırasında hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1OwnerSelection 
                selectedOwner={selectedOwner} 
                setSelectedOwner={setSelectedOwner} 
                onQuickAdd={() => setIsQuickAddOpen(true)} 
              />;
      case 2: return <Step2PlanLimits 
                selectedOwner={selectedOwner}
                ownerSubscription={ownerSubscription}
                limitStatus={limitStatus}
                plans={plans}
                selectedPlanId={selectedPlanId}
                setSelectedPlanId={setSelectedPlanId}
              />;
      case 3: return <Step3BasicInfo 
                salonData={salonData} 
                setSalonData={setSalonData} 
                salonTypes={salonTypes} 
              />;
      case 4: return <Step4LocationMap 
                salonData={salonData} 
                setSalonData={setSalonData} 
                cities={cities} 
                districts={districts} 
              />;
      case 5: return <SalonWorkingHoursForm salonId={salonData.id} />;
      case 6: return <SalonServicesManager salonId={salonData.id} />;
      case 7: return <SalonStaffManager salonId={salonData.id} />;
      case 8: return <Step8FinalPreview 
                salonData={salonData} 
                salonType={salonTypes.find(t => t.id === salonData.primary_type_id)?.name}
                selectedOwner={selectedOwner}
                loading={loading}
              />;
      default: return null;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
        <Breadcrumbs 
          items={[
            { label: "Salonlar", href: "/admin/salons/approvals" },
            { label: "Yeni Salon Ekle" }
          ]} 
        />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                  <CheckCircle2 size={32} />
               </div>
               <div className="space-y-1">
                 <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Salon Sihirbazı</h1>
                 <p className="text-slate-500 font-black text-[10px] tracking-widest uppercase">Admin Hızlı Kurulum Modu</p>
               </div>
             </div>
          </div>

          <div className="flex bg-white p-3 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 items-center">
            {STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center transition-all duration-500 ${
                    isActive ? "bg-primary text-white scale-110 shadow-xl shadow-primary/30 ring-4 ring-primary/10" : 
                    isCompleted ? "bg-green-100 text-green-600" : "bg-transparent text-slate-300"
                  }`}>
                    {isCompleted ? <CheckCircle2 size={20} /> : <span className="font-black text-sm">{step.id}</span>}
                  </div>
                  {step.id < 8 && <div className="w-4 h-1 bg-slate-100 mx-1.5 rounded-full" />}
                </div>
=======
  // ─── FILTERED OWNERS ───────────────────────────────────────────────────────────
  const filteredOwners = owners.filter(o => {
    const q = ownerSearch.toLowerCase();
    return (
      (o.full_name || '').toLowerCase().includes(q) ||
      (o.email || '').toLowerCase().includes(q) ||
      (o.phone || '').toLowerCase().includes(q)
    );
  });

  // ─── STEP CONTENT ─────────────────────────────────────────────────────────────
  const renderStepContent = () => {
    switch (currentStep) {
      // ── STEP 1: Owner Selection ────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-2xl font-medium text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="İsim, e-posta veya telefon ile ara..."
                value={ownerSearch}
                onChange={e => setOwnerSearch(e.target.value)}
              />
            </div>

            {ownersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredOwners.length === 0 ? (
              <div className="py-16 text-center text-text-secondary">
                <User className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="font-bold">Salon sahibi bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {filteredOwners.map(owner => {
                  const isSelected = selectedOwner?.id === owner.id;
                  return (
                    <button
                      key={owner.id}
                      onClick={() => setSelectedOwner(owner)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                          : 'border-border bg-white hover:border-primary/30'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 overflow-hidden">
                        {owner.avatar_url ? (
                          <img src={owner.avatar_url} alt={owner.full_name || ''} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-sm truncate ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                          {owner.full_name || 'İsimsiz'}
                        </p>
                        <p className="text-[11px] text-text-muted font-medium truncate">{owner.email}</p>
                        {owner.phone && (
                          <p className="text-[11px] text-text-muted font-medium">{owner.phone}</p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedOwner && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm font-bold text-emerald-700">
                  Seçildi: <span className="font-black">{selectedOwner.full_name}</span>
                </p>
              </div>
            )}
          </div>
        );

      // ── STEP 2: Package Status ─────────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Owner info */}
            <div className="p-5 bg-gray-50 rounded-2xl border border-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center text-gray-400 shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Seçilen Owner</p>
                <p className="text-base font-black text-text-main">{selectedOwner?.full_name}</p>
                <p className="text-xs text-text-secondary">{selectedOwner?.email}</p>
              </div>
            </div>

            {pkgStatus.loading ? (
              <div className="py-10 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                <p className="text-sm font-medium text-text-secondary">Paket durumu kontrol ediliyor...</p>
              </div>
            ) : (
              <>
                {/* NO PLAN */}
                {pkgStatus.reason === 'NO_PLAN' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-red-50 border-2 border-red-200 rounded-3xl space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-black text-red-800 text-lg">Aktif Paket Bulunamadı</h3>
                          <p className="text-sm text-red-700 font-medium mt-1 leading-relaxed">
                            Bu kullanıcının aktif bir abonelik paketi bulunmuyor. Salon ekleyebilmek için önce bir paket tanımlanmalıdır.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() => setShowPlanSelector(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-black text-sm rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Hemen Paket Tanımla
                        </button>
                        <Link
                          href="/admin/subscription-plans"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-700 font-bold text-sm rounded-xl hover:bg-red-50 transition-all"
                        >
                          <Package className="w-4 h-4" />
                          Paket Detayları
                        </Link>
                      </div>
                    </div>

                    {showPlanSelector && (
                      <div className="p-6 bg-white border border-border rounded-3xl animate-in zoom-in duration-300 space-y-4">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Uygun Paketler</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {allPlans.filter(p => p.is_active).map(plan => (
                            <button
                              key={plan.id}
                              onClick={() => handleAdminAssignPlan(plan.id)}
                              disabled={assigningPlan}
                              className="p-4 border border-border rounded-2xl text-left hover:border-primary transition-all flex items-center justify-between group"
                            >
                              <div>
                                <p className="font-black text-sm text-text-main group-hover:text-primary transition-colors">{plan.display_name}</p>
                                <p className="text-[10px] text-text-muted font-bold uppercase">{plan.name}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>
                          ))}
                        </div>
                        {assigningPlan && (
                          <div className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            Paket tanımlanıyor...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TRIAL EXPIRED */}
                {pkgStatus.reason === 'TRIAL_EXPIRED' && (
                  <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-3xl space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-amber-800 text-lg">Deneme Süresi Dolmuş</h3>
                        <p className="text-sm text-amber-700 font-medium mt-1 leading-relaxed">
                          Bu kullanıcının ücretsiz deneme süresi (3 ay) dolmuştur. Yeni salon ekleyebilmek için ücretli bir pakete geçiş yapılmalıdır.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/admin/finance/approvals"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white font-black text-sm rounded-xl hover:bg-amber-700 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Paket Yükseltme Sürecini Başlat
                    </Link>
                  </div>
                )}

                {/* LIMIT REACHED */}
                {pkgStatus.reason === 'LIMIT_REACHED' && (
                  <div className="p-6 bg-orange-50 border-2 border-orange-200 rounded-3xl space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-orange-800 text-lg">Şube Limiti Doldu</h3>
                        <p className="text-sm text-orange-700 font-medium mt-1 leading-relaxed">
                          <strong>{pkgStatus.planDisplayName}</strong> paketi maksimum{' '}
                          <strong>{pkgStatus.branchLimit === -1 ? 'sınırsız' : pkgStatus.branchLimit}</strong>{' '}
                          şubeye izin vermektedir. Bu owner şu an <strong>{pkgStatus.currentBranches}</strong> şubeye sahip.
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-orange-600 font-bold">
                      Yeni salon eklemek için paketi yükseltmeniz gerekmektedir.
                    </p>
                  </div>
                )}

                {/* OK */}
                {pkgStatus.reason === 'OK' && (
                  <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-3xl space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-emerald-800 text-lg">Paket Uygun</h3>
                        <p className="text-sm text-emerald-700 font-medium mt-1">
                          <strong>{pkgStatus.planDisplayName}</strong> paketi aktif. Yeni şube eklenebilir.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-4 border border-emerald-100">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Mevcut Şube</p>
                        <p className="text-2xl font-black text-text-main">{pkgStatus.currentBranches}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-emerald-100">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Şube Limiti</p>
                        <p className="text-2xl font-black text-emerald-600">
                          {pkgStatus.branchLimit === -1 ? '∞' : pkgStatus.branchLimit}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      // ── STEP 3: Basic Info ─────────────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                  <Store className="w-3.5 h-3.5" /> Salon İsmi
                </label>
                <input
                  className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="Lüks Güzellik Merkezi"
                  value={salonData.name}
                  onChange={e => setSalonData({ ...salonData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                  <Phone className="w-3.5 h-3.5" /> İşletme Telefonu
                </label>
                <input
                  className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="0212 XXX XX XX"
                  value={salonData.phone}
                  onChange={e => setSalonData({ ...salonData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Salon types */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                  <Info className="w-3.5 h-3.5" /> İşletme Tipleri
                </label>
                <p className="text-[11px] text-text-muted font-medium ml-1 mt-1">Birden fazla seçilebilir. İlk seçilen ana kategori olur.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                      className={`relative p-4 rounded-2xl border-2 text-center cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                          : 'border-border bg-white hover:border-primary/20 hover:scale-[1.02]'
                      }`}
                    >
                      {isPrimary && (
                        <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-lg">
                          ANA
                        </span>
                      )}
                      <p className={`text-xs font-black uppercase tracking-tight ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                        {t.name}
                      </p>
                    </div>
                  );
                })}
              </div>
              {salonData.type_ids.length > 1 && (
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-2">Ana Kategori Seçimi:</p>
                  <div className="flex flex-wrap gap-2">
                    {salonData.type_ids.map((id: string) => {
                      const type = salonTypes.find(t => t.id === id);
                      if (!type) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => setSalonData({ ...salonData, primary_type_id: id })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            salonData.primary_type_id === id
                              ? 'bg-primary text-white shadow-xl shadow-primary/20'
                              : 'bg-white border border-primary/10 text-text-secondary hover:bg-gray-50'
                          }`}
                        >
                          {type.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                <Info className="w-3.5 h-3.5" /> Kısa Açıklama
              </label>
              <textarea
                className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-medium text-text-secondary outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all min-h-[120px] resize-none leading-relaxed"
                placeholder="Müşterilere salonunu tanıt..."
                value={salonData.description}
                onChange={e => setSalonData({ ...salonData, description: e.target.value })}
              />
            </div>
          </div>
        );

      // ── STEP 4: Location & Map ─────────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" /> Şehir
                </label>
                <select
                  className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
                  value={salonData.city_id}
                  onChange={e => setSalonData({ ...salonData, city_id: e.target.value, district_id: '' })}
                >
                  <option value="">Şehir Seçin</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" /> İlçe
                </label>
                <select
                  className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer disabled:opacity-40"
                  disabled={!salonData.city_id}
                  value={salonData.district_id}
                  onChange={e => setSalonData({ ...salonData, district_id: e.target.value })}
                >
                  <option value="">İlçe Seçin</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" /> Mahalle
                </label>
                <input
                  className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="Örn: Barbaros Mah."
                  value={salonData.neighborhood}
                  onChange={e => setSalonData({ ...salonData, neighborhood: e.target.value })}
                  onBlur={handleAddressBlur}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" /> Cadde
                </label>
                <input
                  className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="Örn: Atatürk Cad."
                  value={salonData.avenue || ''}
                  onChange={e => setSalonData({ ...salonData, avenue: e.target.value })}
                  onBlur={handleAddressBlur}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" /> Sokak
                </label>
                <input
                  className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="Örn: Karanfil Sokak"
                  value={salonData.street}
                  onChange={e => setSalonData({ ...salonData, street: e.target.value })}
                  onBlur={handleAddressBlur}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3 block">Bina No</label>
                  <input
                    className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                    placeholder="No: 12"
                    value={salonData.building_no}
                    onChange={e => setSalonData({ ...salonData, building_no: e.target.value })}
                    onBlur={handleAddressBlur}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3 block">Daire / Kat</label>
                  <input
                    className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                    placeholder="D: 5"
                    value={salonData.apartment_no}
                    onChange={e => setSalonData({ ...salonData, apartment_no: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="relative p-1.5 bg-surface border border-border rounded-[32px] shadow-card overflow-hidden">
              <div className="h-[380px] rounded-[24px] overflow-hidden border border-border relative z-0">
                <AdminSalonMap
                  center={[salonData.geo_latitude, salonData.geo_longitude]}
                  markerPosition={{ lat: salonData.geo_latitude, lng: salonData.geo_longitude }}
                  onLocationSelect={(lat: number, lng: number) =>
                    setSalonData({ ...salonData, geo_latitude: lat, geo_longitude: lng })
                  }
                />
                <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-border/50 text-[10px] font-black uppercase tracking-widest text-text-main shadow-xl flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${mapLoading ? 'bg-amber-500 animate-ping' : 'bg-primary animate-pulse'}`} />
                  {mapLoading ? 'Konum Aranıyor...' : 'Konumunuzu Haritadan İşaretleyin'}
                </div>
              </div>
            </div>
          </div>
        );

      // ── STEP 5: Working Hours ──────────────────────────────────────────────────
      case 5:
        return salonId ? (
          <SalonWorkingHoursForm salonId={salonId} />
        ) : (
          <div className="py-10 text-center text-text-secondary">Salon kaydı bekleniyor...</div>
        );

      // ── STEP 6: Services ───────────────────────────────────────────────────────
      case 6:
        return salonId ? (
          <SalonServicesManager salonId={salonId} />
        ) : (
          <div className="py-10 text-center text-text-secondary">Salon kaydı bekleniyor...</div>
        );

      // ── STEP 7: Staff ──────────────────────────────────────────────────────────
      case 7:
        return salonId ? (
          <SalonStaffManager salonId={salonId} />
        ) : (
          <div className="py-10 text-center text-text-secondary">Salon kaydı bekleniyor...</div>
        );

      // ── STEP 8: Gallery + Preview ──────────────────────────────────────────────
      case 8:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {salonId && <SalonGalleryManager salonId={salonId} />}

            <div className="p-6 bg-gray-50 rounded-3xl border border-border space-y-4">
              <h4 className="text-[11px] font-black text-text-muted uppercase tracking-widest">Onay Ayarı</h4>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setAutoApprove(prev => !prev)}
                  className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${autoApprove ? 'bg-emerald-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${autoApprove ? 'left-7' : 'left-1'}`} />
                </div>
                <div>
                  <p className="font-black text-sm text-text-main">
                    {autoApprove ? 'Salon Otomatik Onaylanacak (APPROVED)' : 'İnceleme Kuyruğuna Ekle (SUBMITTED)'}
                  </p>
                  <p className="text-xs text-text-secondary font-medium">
                    {autoApprove
                      ? 'Salon hemen yayına alınır. Owner anında kullanmaya başlayabilir.'
                      : 'Salon onay kuyruğuna girer, admin onayından sonra yayına alınır.'}
                  </p>
                </div>
              </label>
            </div>

            {/* Summary */}
            <div className="p-6 bg-white rounded-3xl border border-border space-y-4">
              <h4 className="text-[11px] font-black text-text-muted uppercase tracking-widest">Özet</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between col-span-2 py-2 border-b border-border">
                  <span className="text-text-muted font-bold">Owner</span>
                  <span className="font-black text-text-main">{selectedOwner?.full_name}</span>
                </div>
                <div className="flex justify-between col-span-2 py-2 border-b border-border">
                  <span className="text-text-muted font-bold">Salon Adı</span>
                  <span className="font-black text-text-main">{salonData.name || '-'}</span>
                </div>
                <div className="flex justify-between col-span-2 py-2 border-b border-border">
                  <span className="text-text-muted font-bold">Paket</span>
                  <span className="font-black text-emerald-600">{pkgStatus.planDisplayName || '-'}</span>
                </div>
                <div className="flex justify-between col-span-2 py-2">
                  <span className="text-text-muted font-bold">Şehir / İlçe</span>
                  <span className="font-black text-text-main">
                    {cities.find(c => c.id === salonData.city_id)?.name || '-'} /
                    {' '}{districts.find(d => d.id === salonData.district_id)?.name || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── CAN PROCEED CHECK ─────────────────────────────────────────────────────────
  const canProceed = () => {
    if (currentStep === 1) return !!selectedOwner;
    if (currentStep === 2) return pkgStatus.canAdd && !pkgStatus.loading;
    return true;
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <Breadcrumbs
        items={[
          { label: 'Salon Yönetimi', href: '/admin/salons/approvals' },
          { label: 'Yeni Salon Ekle' },
        ]}
      />

      <div className="mt-6 max-w-3xl mx-auto pb-20">
        {/* Quick Summary Bar */}
        {(selectedOwner || salonData.name) && (
          <div className="mb-6 p-4 bg-white border border-border rounded-2xl shadow-sm flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-top-2 duration-500">
            {selectedOwner && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Owner</p>
                  <p className="text-xs font-black text-text-main leading-none">{selectedOwner.full_name}</p>
                </div>
              </div>
            )}
            {salonData.name && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Salon</p>
                  <p className="text-xs font-black text-text-main leading-none">{salonData.name}</p>
                </div>
              </div>
            )}
            {pkgStatus.hasActivePlan && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Paket</p>
                  <p className="text-xs font-black text-text-main leading-none">{pkgStatus.planDisplayName}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-text-main tracking-tight uppercase">
            Owner Adına <span className="text-primary">Salon Ekle</span>
          </h1>
          <p className="text-text-secondary font-medium mt-1">
            Bir salon sahibi seçin ve adına yeni salon oluşturun.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-0 min-w-max">
            {STEPS.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex flex-col items-center gap-1.5 transition-all ${isActive ? 'scale-110' : ''}`}>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                          : isActive
                            ? 'bg-primary text-white shadow-xl shadow-primary/30'
                            : 'bg-gray-100 text-text-muted'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : step.id}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-text-muted'}`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`h-0.5 w-8 mx-1 rounded-full mb-4 transition-all ${isCompleted ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
              );
            })}
          </div>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-12 min-h-[600px] flex flex-col relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000" />
               
               <div className="relative mb-12 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{STEPS[currentStep - 1].title}</h2>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Adım {currentStep} / 8</p>
                  </div>
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                     <span className="font-black text-xl">{currentStep}</span>
                  </div>
               </div>

               <div className="flex-1 relative z-10">
                 {renderStepContent()}
               </div>

               <div className="mt-12 flex items-center justify-between pt-10 border-t border-slate-50">
                  <button
                    onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : router.back()}
                    className="flex items-center gap-3 px-10 py-4 rounded-[1.5rem] text-slate-400 font-black hover:bg-slate-50 hover:text-slate-600 transition-all uppercase text-xs tracking-widest"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    GERİ
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="flex items-center gap-4 px-12 py-5 rounded-[1.5rem] bg-primary text-white hover:bg-primary/90 transition-all font-black shadow-2xl shadow-primary/20 h-16 uppercase text-sm tracking-tighter disabled:opacity-50 active:scale-95"
                  >
                    {loading ? (
                       <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                    ) : currentStep === 8 ? (
                      <>Sisteme Ekle <ArrowRight className="w-6 h-6" /></>
                    ) : (
                      <>Devam Et <ChevronRight className="w-6 h-6" /></>
                    )}
                  </button>
               </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4">
             <SalonPreviewCard 
               data={salonData} 
               owner={selectedOwner}
               cityName={cities.find(c => c.id === salonData.city_id)?.name}
               districtName={districts.find(d => d.id === salonData.district_id)?.name}
               typeName={salonTypes.find(t => t.id === salonData.primary_type_id)?.name}
             />
          </div>
        </div>
      </div>

      <QuickOwnerModal 
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={(owner) => {
          setSelectedOwner(owner);
          showToast(`Yeni sahip seçildi: ${owner.full_name}`, "success");
        }}
      />
=======
        {/* Step Card */}
        <div className="bg-white rounded-[40px] border border-border shadow-card p-8 md:p-10">
          <div className="mb-8">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
              Adım {currentStep} / {STEPS.length}
            </p>
            <h2 className="text-2xl font-black text-text-main tracking-tight mt-1">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-text-secondary text-sm font-medium mt-0.5">
              {STEPS[currentStep - 1].desc}
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-text-secondary hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Geri
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl ${
                canProceed() && !loading
                  ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/20 hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  İşleniyor...
                </>
              ) : currentStep === 8 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {autoApprove ? 'Salonu Oluştur & Onayla' : 'Salonu Oluştur & Kuyruğa Al'}
                </>
              ) : (
                <>
                  İleri
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
    </AdminLayout>
  );
}
