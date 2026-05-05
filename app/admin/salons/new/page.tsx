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
    } finally {
      setLoading(false);
    }
  };

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
              );
            })}
          </div>
        </div>

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
    </AdminLayout>
  );
}
