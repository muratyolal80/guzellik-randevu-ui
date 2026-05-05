"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Package as PackageIcon, 
  ShieldCheck, 
  AlertCircle,
  Plus,
  ArrowRight,
  Store,
  MapPin,
  Clock,
  Star
} from "lucide-react";
import { Profile, City, District, SalonType } from "@/types";
import { ProfileService, SubscriptionService, MasterDataService } from "@/services/db";
import Skeleton from "@/components/Skeleton";
import dynamic from "next/dynamic";

// Managers
import SubscriptionPlanSelector from "@/components/owner/SubscriptionPlanSelector";
import SalonWorkingHoursForm from "@/components/shared/salon/SalonWorkingHoursForm";
import SalonServicesManager from "@/components/shared/salon/SalonServicesManager";
import SalonStaffManager from "@/components/shared/salon/SalonStaffManager";
import SalonGalleryManager from "@/components/shared/salon/SalonGalleryManager";

const AdminSalonMap = dynamic(
  () => import("@/components/Admin/AdminSalonMap").then(mod => mod.default),
  { ssr: false, loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-2xl" /> },
);

// --- STEP 1: OWNER SELECTION ---
export function Step1OwnerSelection({ 
  selectedOwner, 
  setSelectedOwner, 
  onQuickAdd 
}: { 
  selectedOwner: Profile | null, 
  setSelectedOwner: (p: Profile | null) => void,
  onQuickAdd: () => void
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [owners, setOwners] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOwners = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const { profiles } = await ProfileService.adminGetProfiles({
        role: 'SALON_OWNER',
        search: search,
        pageSize: 10
      });
      setOwners(profiles || []);
    } catch (err) {
      console.error("Owner fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOwners(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchOwners]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            placeholder="Owner ismi veya e-posta ile ara..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary outline-none h-14 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={onQuickAdd}
          className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 flex items-center gap-2 font-black shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 text-primary" /> Yeni Sahip
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-1/3 h-5" />
                <Skeleton className="w-2/3 h-4" />
              </div>
            </div>
          ))
        ) : (owners || []).length > 0 ? (
          owners.map((owner) => (
            <button
              key={owner.id}
              onClick={() => setSelectedOwner(owner)}
              className={`p-4 rounded-2xl border transition-all text-left flex items-center gap-4 group ${
                selectedOwner?.id === owner.id
                  ? "bg-primary/5 border-primary ring-2 ring-primary/10"
                  : "bg-white border-slate-100 hover:border-primary/40 hover:bg-slate-50"
              }`}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 group-hover:scale-105 transition-transform">
                {owner.avatar_url ? (
                  <img src={owner.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-black text-lg bg-primary/10">
                    {owner.full_name?.charAt(0) || owner.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-900 truncate uppercase tracking-tight">{owner.full_name || 'İsimsiz'}</h4>
                <p className="text-xs text-slate-500 truncate font-medium">{owner.email}</p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-slate-200 text-slate-400 font-black">ID: {owner.id.slice(0,8)}</span>
                   {owner.phone && <span className="text-[10px] text-slate-400 font-medium">{owner.phone}</span>}
                </div>
              </div>
              {selectedOwner?.id === owner.id ? (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 animate-in zoom-in-75">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-primary group-hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="py-20 text-center space-y-4 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto text-slate-300 shadow-sm">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-black text-slate-900 uppercase">Kullanıcı Bulunamadı</p>
              <p className="text-sm text-slate-500 max-w-[240px] mx-auto font-medium">
                Aramanızla eşleşen bir salon sahibi bulunamadı. Lütfen tekrar deneyin veya yeni bir sahip oluşturun.
              </p>
            </div>
            <button 
              onClick={onQuickAdd} 
              className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-black text-sm hover:bg-slate-50 transition-colors"
            >
              YENİ SAHİP OLUŞTUR
            </button>
          </div>
        )}
      </div>

      {selectedOwner && (
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest">Seçilen Owner</p>
              <p className="font-black text-slate-900 uppercase tracking-tight">{selectedOwner.full_name}</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedOwner(null)}
            className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 font-black px-4 py-2 rounded-xl transition-all"
          >
            SIFIRLA
          </button>
        </div>
      )}
    </div>
  );
}

// --- STEP 2: PLAN & LIMITS ---
export function Step2PlanLimits({ 
  selectedOwner, 
  ownerSubscription, 
  limitStatus, 
  plans, 
  selectedPlanId, 
  setSelectedPlanId 
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <PackageIcon size={120} />
        </div>
        
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          Paket Analizi
        </h3>

        {!ownerSubscription ? (
          <div className="space-y-8">
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4 text-amber-900 shadow-sm shadow-amber-900/5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-lg leading-tight mb-1">Abonelik Bulunmuyor</p>
                <p className="text-sm text-amber-800/80 leading-relaxed font-bold">Salon oluşturabilmek için bir paket atamalısınız.</p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100">
              <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2 px-2 uppercase text-xs tracking-widest">
                 <Plus className="w-5 h-5 text-primary" /> Paket Seçimi
              </h4>
              <SubscriptionPlanSelector
                plans={plans}
                selectedPlanId={selectedPlanId}
                billingCycle="MONTHLY"
                onSelect={setSelectedPlanId}
                onCycleChange={() => {}}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Mevcut Plan</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-black text-primary uppercase">{ownerSubscription.subscription_plans?.display_name}</p>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-black">AKTİF</span>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Şube Limiti</p>
                <p className="text-xl font-black text-slate-900">
                  {limitStatus?.current} / {limitStatus?.limit === -1 ? "∞" : limitStatus?.limit}
                </p>
              </div>
            </div>

            {!limitStatus?.allowed && (
              <div className="bg-red-50 border border-red-100 p-5 rounded-[1.5rem] flex gap-4 text-red-900">
                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <p className="font-black uppercase text-sm">Limit Aşımı!</p>
                  <p className="text-sm font-bold opacity-80">Admin yetkisiyle baypas edilerek devam ediliyor.</p>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-100 p-5 rounded-[1.5rem] flex gap-4 text-green-900">
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-green-600" />
              <div>
                <p className="font-black uppercase text-sm">Yönetici Modu</p>
                <p className="text-sm font-bold opacity-80">Sistem yöneticisi olarak limit kontrollerini bypass ediyorsunuz.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STEP 3: BASIC INFO ---
export function Step3BasicInfo({ salonData, setSalonData, salonTypes }: any) {
  const formatPhone = (val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    let formatted = "";
    if (cleaned.length <= 3) formatted = `0 (${cleaned}`;
    else if (cleaned.length <= 6) formatted = `0 (${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    else if (cleaned.length <= 8) formatted = `0 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    else formatted = `0 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    return formatted;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Salon İsmi</label>
            <input
              placeholder="Örn: My Güzellik Merkezi"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium h-14 transition-all"
              value={salonData.name}
              onChange={(e) => setSalonData({...salonData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Telefon</label>
            <input
              type="tel"
              placeholder="0 (5xx) xxx xx xx"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-medium h-14 transition-all"
              value={salonData.phone}
              onChange={(e) => setSalonData({...salonData, phone: formatPhone(e.target.value)})}
            />
          </div>
          <div className="space-y-2 col-span-full">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Kategori</label>
            <select
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none h-14 font-black uppercase text-sm appearance-none cursor-pointer"
              value={salonData.primary_type_id}
              onChange={(e) => setSalonData({...salonData, primary_type_id: e.target.value, type_ids: [e.target.value]})}
            >
              <option value="">Seçiniz...</option>
              {salonTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="space-y-2 col-span-full">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Tanıtım Yazısı</label>
            <textarea
              placeholder="Salon hakkında kurumsal bilgi..."
              rows={4}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-2 focus:ring-primary outline-none resize-none font-medium transition-all"
              value={salonData.description}
              onChange={(e) => setSalonData({...salonData, description: e.target.value})}
            />
          </div>
        </div>
    </div>
  );
}

// --- STEP 4: LOCATION & MAP ---
export function Step4LocationMap({ salonData, setSalonData, cities, districts }: any) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Şehir</label>
            <select
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none h-14 font-black uppercase text-sm"
              value={salonData.city_id}
              onChange={(e) => setSalonData({...salonData, city_id: e.target.value, district_id: ""})}
            >
              <option value="">Seçiniz...</option>
              {cities.map((c: City) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">İlçe</label>
            <select
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none h-14 font-black uppercase text-sm disabled:opacity-50"
              value={salonData.district_id}
              onChange={(e) => setSalonData({...salonData, district_id: e.target.value})}
              disabled={!salonData.city_id}
            >
              <option value="">Seçiniz...</option>
              {districts.map((d: District) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="col-span-full space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Adres Detay</label>
            <textarea
              placeholder="Tam adres..."
              rows={2}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none resize-none font-medium"
              value={salonData.address}
              onChange={(e) => setSalonData({...salonData, address: e.target.value})}
            />
          </div>
        </div>
        
        <div className="relative group overflow-hidden rounded-[2rem] border-4 border-slate-50">
           <AdminSalonMap
             center={[salonData.geo_latitude, salonData.geo_longitude]}
             markerPosition={{ lat: salonData.geo_latitude, lng: salonData.geo_longitude }}
             onLocationSelect={(lat: number, lng: number) => setSalonData({...salonData, geo_latitude: lat, geo_longitude: lng})}
           />
        </div>
    </div>
  );
}

// --- STEP 5: WORKING HOURS ---
export function Step5WorkingHours({ salonId }: { salonId: string }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
         <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Clock className="w-6 h-6" />
         </div>
         <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Çalışma Saatleri</h3>
            <p className="text-sm font-medium text-slate-500">Salonun açık olduğu günleri ve saatleri belirleyin</p>
         </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <SalonWorkingHoursForm salonId={salonId} />
      </div>
    </div>
  );
}

// --- STEP 6: SERVICES ---
export function Step6Services({ salonId }: { salonId: string }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
         <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Star className="w-6 h-6" />
         </div>
         <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Hizmetler</h3>
            <p className="text-sm font-medium text-slate-500">Müşterilerinize sunacağınız hizmetleri ve fiyatlarını ekleyin</p>
         </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <SalonServicesManager salonId={salonId} />
      </div>
    </div>
  );
}

// --- STEP 7: STAFF ---
export function Step7Staff({ salonId }: { salonId: string }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-6">
         <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
         </div>
         <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Personel Ekibi</h3>
            <p className="text-sm font-medium text-slate-500">Salonda çalışan uzmanları ekleyin ve yetkilendirin</p>
         </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <SalonStaffManager salonId={salonId} />
      </div>
    </div>
  );
}

// --- STEP 8: FINAL PREVIEW ---
export function Step8FinalPreview({ salonData, salonType, selectedOwner }: any) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative p-10 bg-slate-900 rounded-[3rem] text-white overflow-hidden shadow-2xl shadow-slate-900/30">
        <div className="absolute top-0 right-0 p-12 opacity-10">
           <CheckCircle2 size={160} />
        </div>

        <div className="relative space-y-8">
           <div className="space-y-2">
             <h3 className="text-3xl font-black tracking-tight uppercase">Hazırız!</h3>
             <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Lütfen tüm bilgileri son kez kontrol edin.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-2">
                 <p className="text-[10px] text-primary font-black uppercase tracking-widest">Sahibi</p>
                 <p className="font-black text-base uppercase truncate leading-none">{selectedOwner?.full_name}</p>
                 <p className="text-[10px] text-slate-400 truncate font-medium">{selectedOwner?.email}</p>
              </div>
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-2">
                 <p className="text-[10px] text-primary font-black uppercase tracking-widest">İşletme</p>
                 <p className="font-black text-base uppercase truncate leading-none">{salonData.name}</p>
                 <p className="text-[10px] text-slate-400 truncate font-medium">{salonType}</p>
              </div>
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-2">
                 <p className="text-[10px] text-primary font-black uppercase tracking-widest">Statü</p>
                 <div className="flex items-center gap-2">
                    <p className="font-black text-base uppercase leading-none">APPROVED</p>
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] overflow-hidden p-8 text-slate-900 shadow-xl">
              <SalonGalleryManager salonId={salonData.id} />
           </div>

           <div className="flex gap-4 p-6 bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] text-amber-200 text-xs font-black uppercase tracking-tight leading-relaxed">
             <AlertCircle className="w-6 h-6 shrink-0 text-amber-500" />
             <p>Sisteme Ekle ve Onayla butonuna basıldığında salon aktif hale gelecektir.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
