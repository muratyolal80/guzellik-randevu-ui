"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  SalonDataService,
  MasterDataService,
  StaffService,
  ServiceService,
  PlatformService,
} from "@/services/db";
import { City, District, SalonType } from "@/types";
import {
  Store,
  MapPin,
  Clock,
  Copy,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Camera,
  Phone,
  Info,
  Star,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { GeocodingService } from "@/lib/geocoding/geocoding";

// Dynamic Map Component (Disabled SSR)
import dynamic from "next/dynamic";
import SubscriptionPlanSelector from "@/components/owner/SubscriptionPlanSelector";
import SalonWorkingHoursForm from "@/components/shared/salon/SalonWorkingHoursForm";
import SalonServicesManager from "@/components/shared/salon/SalonServicesManager";
import SalonStaffManager from "@/components/shared/salon/SalonStaffManager";
import SalonGalleryManager from "@/components/shared/salon/SalonGalleryManager";
import { SubscriptionService } from "@/services/db";
const AdminSalonMap = dynamic(
  () => import("@/components/Admin/AdminSalonMap"),
  { ssr: false },
);

const STEPS = [
  {
    id: 1,
    title: "Paket Seçimi",
    icon: ShieldCheck,
    desc: "Abonelik planınızı belirleyin",
  },
  {
    id: 2,
    title: "Temel Bilgiler",
    icon: Store,
    desc: "Salon adı ve iletişim",
  },
  {
    id: 3,
    title: "Konum & Harita",
    icon: MapPin,
    desc: "Adres ve harita pini",
  },
  {
    id: 4,
    title: "Çalışma Saatleri",
    icon: Clock,
    desc: "Mesai başlangıç/bitiş",
  },
  { id: 5, title: "Hizmetler", icon: Star, desc: "Saç, Sakal vb. servisler" },
  { id: 6, title: "Personel", icon: Users, desc: "Çalışan ekibi kurun" },
  { id: 7, title: "Önizleme", icon: ShieldCheck, desc: "Kontrol ve onay" },
];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "CREDIT_CARD" | "BANK_TRANSFER" | null
  >(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "IDLE" | "PENDING_APPROVAL" | "SUCCESS"
  >("IDLE");
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">(
    "MONTHLY",
  );

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [salonTypes, setSalonTypes] = useState<SalonType[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [globalServices, setGlobalServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<
    {
      global_service_id: string;
      name: string;
      price: number;
      duration_min: number;
    }[]
  >([]);
  const [staffMembers, setStaffMembers] = useState<
    {
      name: string;
      role: string;
      phone: string;
      email: string;
      is_owner: boolean;
      service_ids: string[];
    }[]
  >([]);
  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    service_ids: [] as string[],
  });
  const [editingStaffIndex, setEditingStaffIndex] = useState<number | null>(
    null,
  );

  const [salonData, setSalonData] = useState<any>({
    name: "",
    phone: "",
    type_ids: [] as string[], // Changed from type_id
    primary_type_id: "", // New field
    city_id: "",
    district_id: "",
    address: "",
    neighborhood: "",
    avenue: "",
    street: "",
    building_no: "",
    apartment_no: "",
    description: "",
    geo_latitude: 41.0082,
    geo_longitude: 28.9784,
    features: [],
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop",
    status: "DRAFT",
  });

  const [workingHours, setWorkingHours] = useState([
    {
      day_of_week: 1,
      start_time: "09:00",
      end_time: "19:00",
      is_closed: false,
    }, // Pazartesi
    {
      day_of_week: 2,
      start_time: "09:00",
      end_time: "19:00",
      is_closed: false,
    }, // Salı
    {
      day_of_week: 3,
      start_time: "09:00",
      end_time: "19:00",
      is_closed: false,
    }, // Çarşamba
    {
      day_of_week: 4,
      start_time: "09:00",
      end_time: "19:00",
      is_closed: false,
    }, // Perşembe
    {
      day_of_week: 5,
      start_time: "09:00",
      end_time: "19:00",
      is_closed: false,
    }, // Cuma
    {
      day_of_week: 6,
      start_time: "09:00",
      end_time: "19:00",
      is_closed: false,
    }, // Cumartesi
    { day_of_week: 0, start_time: "09:00", end_time: "19:00", is_closed: true }, // Pazar
  ]);

  const handleHourChange = (
    index: number,
    field: "start_time" | "end_time",
    value: string,
  ) => {
    const newHours = [...workingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setWorkingHours(newHours);
  };

  const toggleDay = (index: number) => {
    const newHours = [...workingHours];
    newHours[index] = {
      ...newHours[index],
      is_closed: !newHours[index].is_closed,
    };
    setWorkingHours(newHours);
  };

  const toggleService = (serviceId: string) => {
    const exists = selectedServices.find(
      (s) => s.global_service_id === serviceId,
    );
    if (exists) {
      setSelectedServices(
        selectedServices.filter((s) => s.global_service_id !== serviceId),
      );
    } else {
      const gs = globalServices.find((g) => g.id === serviceId);
      setSelectedServices([
        ...selectedServices,
        {
          global_service_id: serviceId,
          name: gs?.name || "Hizmet",
          price: 0,
          duration_min: 30,
        },
      ]);
    }
  };

  const updateServiceDetails = (
    serviceId: string,
    field: "price" | "duration_min",
    value: number,
  ) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s.global_service_id === serviceId ? { ...s, [field]: value } : s,
      ),
    );
  };

  const addCategoryServices = (categoryId: string) => {
    const categoryServices = globalServices.filter(
      (s) => s.category_id === categoryId,
    );
    const newServices = [...selectedServices];

    categoryServices.forEach((gs) => {
      if (!newServices.find((s) => s.global_service_id === gs.id)) {
        newServices.push({
          global_service_id: gs.id,
          name: gs.name,
          price: 0,
          duration_min: 30,
        });
      }
    });
    setSelectedServices(newServices);
  };

  const removeCategoryServices = (categoryId: string) => {
    const categoryServices = globalServices.filter(
      (s) => s.category_id === categoryId,
    );
    const serviceIdsToRemove = categoryServices.map((s) => s.id);
    setSelectedServices(
      selectedServices.filter(
        (s) => !serviceIdsToRemove.includes(s.global_service_id),
      ),
    );
  };

  const addStaff = () => {
    if (!newStaff.name || !newStaff.role) return;

    if (editingStaffIndex === null) {
      const selectedPlan = plans.find((p) => p.id === selectedPlanId);
      if (
        selectedPlan &&
        selectedPlan.max_staff !== -1 &&
        staffMembers.length >= selectedPlan.max_staff
      ) {
        alert(
          `Seçtiğiniz "${selectedPlan.display_name}" paketi maksimum ${selectedPlan.max_staff} personel eklemenize izin vermektedir. Limit doldu.`,
        );
        return;
      }
    }

    if (editingStaffIndex !== null) {
      const updatedStaff = [...staffMembers];
      updatedStaff[editingStaffIndex] = {
        ...newStaff,
        is_owner: updatedStaff[editingStaffIndex].is_owner || false,
      };
      setStaffMembers(updatedStaff);
      setEditingStaffIndex(null);
    } else {
      setStaffMembers([...staffMembers, { ...newStaff, is_owner: false }]);
    }
    setNewStaff({ name: "", role: "", phone: "", email: "", service_ids: [] });
  };

  const editStaff = (index: number) => {
    setEditingStaffIndex(index);
    setNewStaff({
      name: staffMembers[index].name,
      role: staffMembers[index].role,
      phone: staffMembers[index].phone,
      email: staffMembers[index].email,
      service_ids: staffMembers[index].service_ids || [],
    });

    const formElement = document.getElementById("staff-form");
    if (formElement)
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const removeStaff = (index: number) => {
    if (confirm("Bu personeli silmek istediğinize emin misiniz?")) {
      const newStaffMembers = [...staffMembers];
      newStaffMembers.splice(index, 1);
      setStaffMembers(newStaffMembers);
      if (editingStaffIndex === index) {
        setEditingStaffIndex(null);
        setNewStaff({
          name: "",
          role: "",
          phone: "",
          email: "",
          service_ids: [],
        });
      }
    }
  };

  const addMyselfAsStaff = () => {
    if (!user) return;
    setEditingStaffIndex(null);
    // Check if already added
    if (staffMembers.find((s) => s.is_owner)) return;

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    if (
      selectedPlan &&
      selectedPlan.max_staff !== -1 &&
      staffMembers.length >= selectedPlan.max_staff
    ) {
      alert(
        `Seçtiğiniz "${selectedPlan.display_name}" paketi maksimum ${selectedPlan.max_staff} personel eklemenize izin vermektedir. Limit doldu.`,
      );
      return;
    }

    setStaffMembers([
      {
        name:
          user.full_name ||
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          "Salon Sahibi",
        role: "Yönetici & Uzman",
        phone: user.phone || "",
        email: user.email || "",
        is_owner: true,
        service_ids: selectedServices.map((s) => s.global_service_id),
      },
      ...staffMembers,
    ]);
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const results = await Promise.allSettled([
          MasterDataService.getCities(),
          MasterDataService.getSalonTypes(),
          MasterDataService.getServiceCategories(),
          MasterDataService.getAllGlobalServices(),
          SubscriptionService.getPlans(),
          PlatformService.getSetting("bank_accounts"),
        ]);

        // Hata olan logları yakala
        results.forEach((r, i) => {
          if (r.status === "rejected")
            console.error(`MasterData fetch error at index ${i}:`, r.reason);
        });

        setCities(
          results[0].status === "fulfilled" ? results[0].value || [] : [],
        );
        setSalonTypes(
          results[1].status === "fulfilled" ? results[1].value || [] : [],
        );
        setCategories(
          results[2].status === "fulfilled" ? results[2].value || [] : [],
        );
        setGlobalServices(
          results[3].status === "fulfilled" ? results[3].value || [] : [],
        );
        setPlans(
          results[4].status === "fulfilled" ? results[4].value || [] : [],
        );
        setBankAccounts(
          results[5].status === "fulfilled" ? results[5].value || [] : [],
        );
      } catch (error) {
        console.error("Master data fetch wrapper error:", error);
      }
    };
    fetchMasterData();
  }, []);

  // Auto-load services when salon types change
  useEffect(() => {
    console.log("🔍 useEffect tetiklendi - type_ids:", salonData.type_ids);

    const loadServicesForSelectedTypes = async () => {
      // Salon tipi seçilmemişse hizmetleri temizle
      if (!salonData.type_ids || salonData.type_ids.length === 0) {
        console.log("⚠️ Salon tipi seçili değil, hizmetler temizleniyor");
        setSelectedServices([]);
        return;
      }

      console.log(
        "✅ Salon tipleri seçili, hizmetler yükleniyor...",
        salonData.type_ids,
      );

      try {
        // 1. Seçilen salon tiplerine göre kategorileri al
        console.log("1️⃣ Kategoriler getiriliyor...");
        const relatedCategories =
          await MasterDataService.getServiceCategoriesForSalonTypes(
            salonData.type_ids,
          );
        console.log("📁 Bulunan kategoriler:", relatedCategories);

        if (relatedCategories.length === 0) {
          console.warn(
            "⚠️ Bu salon tipleri için tanımlanmış kategori bulunamadı",
          );
          setSelectedServices([]);
          return;
        }

        // 2. Bu kategorilerdeki tüm hizmetleri al
        const categoryIds = relatedCategories.map((c) => c.id);
        console.log("2️⃣ Hizmetler getiriliyor, kategori IDs:", categoryIds);
        const services =
          await MasterDataService.getGlobalServicesByCategories(categoryIds);
        console.log("📋 Bulunan hizmetler:", services);

        // 3. Varsayılan fiyat ve süre ile otomatik ekle
        const autoServices = services.map((service) => ({
          global_service_id: service.id,
          name: service.name,
          price: 0, // Kullanıcı belirleyecek
          duration_min: 30, // Varsayılan süre
        }));

        setSelectedServices(autoServices);
        console.log(`✅ ${autoServices.length} hizmet otomatik yüklendi`);
      } catch (error) {
        console.error("❌ Hizmetler yüklenirken hata:", error);
      }
    };

    loadServicesForSelectedTypes();
  }, [salonData.type_ids]); // type_ids değiştiğinde çalış

  useEffect(() => {
    if (salonData.city_id) {
      MasterDataService.getDistrictsByCity(salonData.city_id).then(
        setDistricts,
      );
    }
  }, [salonData.city_id]);

  // State for map loading indicator
  const [mapLoading, setMapLoading] = useState(false);

  const handleAddressBlur = async () => {
    // Don't geocode if we don't have a city
    if (!salonData.city_id) return;

    const cityName = cities.find((c) => c.id === salonData.city_id)?.name;
    const districtName = districts.find(
      (d) => d.id === salonData.district_id,
    )?.name;

    if (!cityName) return;

    const hasDetailedAddress =
      salonData.avenue || salonData.street || salonData.neighborhood;
    let searchQuery = "";

    if (hasDetailedAddress) {
      const searchParts = [
        salonData.avenue,
        salonData.street,
        salonData.building_no ? `No: ${salonData.building_no}` : "",
        salonData.neighborhood,
        districtName,
        cityName,
        "Türkiye",
      ].filter(Boolean);

      if (searchParts.length < 3) return;
      searchQuery = searchParts.join(", ");
    } else if (districtName) {
      searchQuery = `${districtName}, ${cityName}, Türkiye`;
    } else {
      return;
    }

    console.log("🔍 Geocoding search onBlur:", searchQuery);
    setMapLoading(true);

    try {
      const result = await GeocodingService.searchAddress(searchQuery);
      if (result) {
        console.log("📍 Geocoding result found:", result);
        setSalonData((prev: any) => ({
          ...prev,
          geo_latitude: result.lat,
          geo_longitude: result.lon,
        }));
      }
    } catch (error) {
      console.error("Geocoding failed", error);
    } finally {
      setMapLoading(false);
    }
  };

  const handleNext = async () => {
    // Step 1: Subscription Validation
    if (currentStep === 1) {
      if (!selectedPlanId) {
        alert("Lütfen bir paket seçin.");
        return;
      }
      const plan = plans.find((p) => p.id === selectedPlanId);
      if (plan && plan.price_monthly > 0 && !paymentMethod) {
        alert("Lütfen ödeme yöntemi seçin.");
        return;
      }

      if (
        plan.price_monthly > 0 &&
        paymentMethod === "BANK_TRANSFER" &&
        paymentStatus !== "PENDING_APPROVAL"
      ) {
        setLoading(true);
        try {
          // Create a dummy salon ID for now or just wait for payment notification
          setPaymentStatus("PENDING_APPROVAL");
        } finally {
          setLoading(false);
        }
        return;
      }
    }

    // CREATE SALON AT STEP 3 TO ALLOW MASTER COMPONENTS TO LIVE-SAVE DATA
    if (currentStep === 3) {
      if (!salonData.id) {
        setLoading(true);
        try {
          const salon = await SalonDataService.createSalon(
            {
              ...salonData,
              type_id: salonData.primary_type_id,
              owner_id: user?.id,
            },
            [], // Default hours
            []  // No services yet
          );
          setSalonData((prev: any) => ({ ...prev, id: salon.id }));
        } catch (err: any) {
          console.error("Salon taslak oluşturulurken hata:", err);
          alert("Salon kaydedilemedi: " + (err.message || "Bilinmeyen hata"));
          setLoading(false);
          return;
        }
        setLoading(false);
      }
    }

    if (currentStep < 7) setCurrentStep((prev) => prev + 1);
    else handleComplete();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      console.log("Onboarding step final: Processing subscription...");
      let salon = salonData; // Salon was already created in Step 3!

      console.log("Onboarding step 3: Recording Subscription...");
      // 3. Subscription & Payment Redirect
      if (selectedPlanId) {
        const subResult = await SubscriptionService.subscribe(
          salon.id,
          selectedPlanId,
          paymentMethod || "BANK_TRANSFER",
          billingCycle,
        );

        // If Credit Card, we get a paymentUrl
        if (subResult.paymentUrl) {
          window.location.href = subResult.paymentUrl;
          return; // EXIT and redirect
        }

        if (paymentMethod === "BANK_TRANSFER") {
          await SubscriptionService.notifyBankTransfer(
            subResult.id,
            salon.id,
            0,
          );
        }
      }

      console.log("Onboarding step 4: Submitting for approval...");
      // Submit for Approval
      await SalonDataService.submitForApproval(salon.id);

      // Success, redirecting...
      if (user?.id) {
        localStorage.removeItem(`active_branch_${user.id}`);
      }

      window.location.href = "/owner/dashboard?onboarding=success";
    } catch (err) {
      console.error("Onboarding complete error:", err);
      alert(
        "İşlem tamamlanırken bir hata oluştu. Lütfen detaylar için konsolu kontrol edin.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        const selectedPlan = plans.find((p) => p.id === selectedPlanId);
        const isPaid = selectedPlan && selectedPlan.price_monthly > 0;

        if (paymentStatus === "PENDING_APPROVAL") {
          return (
            <div className="space-y-8 animate-in zoom-in duration-500 text-center py-10">
              <div className="w-24 h-24 bg-amber-50 rounded-[40px] flex items-center justify-center text-amber-500 mx-auto shadow-inner border border-amber-100">
                <Clock className="w-12 h-12 animate-pulse" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-text-main uppercase tracking-tight">
                  Ödeme Onayı Bekleniyor
                </h2>
                <p className="text-text-secondary font-medium max-w-lg mx-auto leading-relaxed">
                  Banka havalesi bildiriminiz alınmıştır. Admin onayından sonra
                  kurulum sürecine devam edebileceksiniz. Genellikle 1 saat
                  içinde onaylanır.
                </p>
              </div>
              <div className="max-w-md mx-auto p-6 bg-white rounded-3xl border-2 border-dashed border-border text-left space-y-4">
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                  Seçilen Plan: {selectedPlan?.display_name}
                </h4>
                {bankAccounts.map((acc: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 rounded-2xl border border-border"
                  >
                    <p className="text-[9px] font-black text-primary uppercase mb-1">
                      {acc.bank}
                    </p>
                    <p className="text-sm font-bold text-text-main">
                      {acc.owner}
                    </p>
                    <p className="text-xs font-mono text-text-secondary mt-1">
                      {acc.iban}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-6">
                <button
                  onClick={() => setPaymentStatus("IDLE")}
                  className="text-xs font-black text-primary hover:underline uppercase tracking-widest"
                >
                  Fikrimi Değiştir / Ödeme Yöntemi Değiştir
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="text-center space-y-2">
              <p className="text-sm text-text-secondary font-medium italic">
                Size en uygun planı seçerek hemen başlayın.
              </p>
            </div>

            <SubscriptionPlanSelector
              plans={plans}
              selectedPlanId={selectedPlanId}
              billingCycle={billingCycle}
              onSelect={(id) => setSelectedPlanId(id)}
              onCycleChange={(cycle) => setBillingCycle(cycle)}
            />

            {isPaid && (
              <div className="max-w-2xl mx-auto p-8 bg-surface-alt rounded-[40px] border border-border animate-in slide-in-from-bottom-10 space-y-6">
                <h4 className="text-center text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">
                  Ödeme Yöntemi Seçin
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("CREDIT_CARD")}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === "CREDIT_CARD"
                      ? "border-primary bg-white shadow-xl shadow-primary/5"
                      : "border-border bg-white hover:border-primary/20"
                      }`}
                  >
                    <ShieldCheck
                      className={`w-8 h-8 ${paymentMethod === "CREDIT_CARD" ? "text-primary" : "text-gray-300"}`}
                    />
                    <span className="text-xs font-black uppercase tracking-widest">
                      Kredi Kartı
                    </span>
                    <p className="text-[10px] text-text-muted font-medium">
                      Anında Aktivasyon (iyzico)
                    </p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("BANK_TRANSFER")}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === "BANK_TRANSFER"
                      ? "border-blue-500 bg-white shadow-xl shadow-blue-500/5"
                      : "border-border bg-white hover:border-blue-500/20"
                      }`}
                  >
                    <Clock
                      className={`w-8 h-8 ${paymentMethod === "BANK_TRANSFER" ? "text-blue-500" : "text-gray-300"}`}
                    />
                    <span className="text-xs font-black uppercase tracking-widest">
                      Banka Havalesi
                    </span>
                    <p className="text-[10px] text-text-muted font-medium">
                      Manuel Onay (1-2 Saat)
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
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
                  onChange={(e) =>
                    setSalonData({ ...salonData, name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setSalonData({ ...salonData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                  <Info className="w-3.5 h-3.5" /> İşletme Tipleri
                </label>
                <p className="text-[11px] text-text-muted font-medium ml-1">
                  Birden fazla seçilebilir. İlk seçilen ana kategori olur.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {salonTypes.map((t) => {
                  const isSelected = salonData.type_ids.includes(t.id);
                  const isPrimary = salonData.primary_type_id === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        let newTypeIds = [...salonData.type_ids];
                        if (isSelected) {
                          newTypeIds = newTypeIds.filter((id) => id !== t.id);
                          if (isPrimary && newTypeIds.length > 0) {
                            setSalonData({
                              ...salonData,
                              type_ids: newTypeIds,
                              primary_type_id: newTypeIds[0],
                            });
                          } else if (newTypeIds.length === 0) {
                            setSalonData({
                              ...salonData,
                              type_ids: [],
                              primary_type_id: "",
                            });
                          } else {
                            setSalonData({
                              ...salonData,
                              type_ids: newTypeIds,
                            });
                          }
                        } else {
                          newTypeIds.push(t.id);
                          if (newTypeIds.length === 1) {
                            setSalonData({
                              ...salonData,
                              type_ids: newTypeIds,
                              primary_type_id: t.id,
                            });
                          } else {
                            setSalonData({
                              ...salonData,
                              type_ids: newTypeIds,
                            });
                          }
                        }
                      }}
                      className={`relative p-5 rounded-[24px] border-2 text-center cursor-pointer transition-all duration-300 ${isSelected
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                        : "border-border bg-white hover:border-primary/20 hover:scale-[1.02]"
                        }`}
                    >
                      {isPrimary && (
                        <span className="absolute -top-2.5 -right-2 bg-primary text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                          ANA
                        </span>
                      )}
                      <p
                        className={`text-xs font-black uppercase tracking-tight ${isSelected ? "text-primary" : "text-text-main"}`}
                      >
                        {t.name}
                      </p>
                    </div>
                  );
                })}
              </div>

              {salonData.type_ids.length > 1 && (
                <div className="p-4 bg-primary/5 rounded-[20px] border border-primary/10 animate-in fade-in duration-500">
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-3">
                    Ana Kategori Seçimi:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {salonData.type_ids.map((id: string) => {
                      const type = salonTypes.find((t) => t.id === id);
                      if (!type) return null;
                      return (
                        <button
                          key={id}
                          onClick={() =>
                            setSalonData({ ...salonData, primary_type_id: id })
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${salonData.primary_type_id === id
                            ? "bg-primary text-white shadow-xl shadow-primary/20"
                            : "bg-white border border-primary/10 text-text-secondary hover:bg-gray-50"
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

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">
                <Info className="w-3.5 h-3.5" /> Kısa Açıklama
              </label>
              <textarea
                className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl md:rounded-[24px] font-medium text-text-secondary outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all min-h-[140px] resize-none leading-relaxed"
                placeholder="Müşterilerinize salonunuzu tanıtın..."
                value={salonData.description}
                onChange={(e) =>
                  setSalonData({ ...salonData, description: e.target.value })
                }
              />
            </div>
          </div>
        );

      case 3:
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
                    onChange={(e) =>
                      setSalonData({
                        ...salonData,
                        city_id: e.target.value,
                        district_id: "",
                      })
                    }
                  >
                    <option value="">Şehir Seçin</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
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
                    onChange={(e) =>
                      setSalonData({
                        ...salonData,
                        district_id: e.target.value,
                      })
                    }
                  >
                    <option value="">İlçe Seçin</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
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
                  onChange={(e) =>
                    setSalonData({ ...salonData, neighborhood: e.target.value })
                  }
                  onBlur={handleAddressBlur}
                />
              </div>
              <div className="group">
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" /> Cadde
                </label>
                <input
                  className="w-full px-6 py-4.5 bg-surface-alt border border-border rounded-2xl font-black text-text-main outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="Örn: Atatürk Cad."
                  value={salonData.avenue || ""}
                  onChange={(e) =>
                    setSalonData({ ...salonData, avenue: e.target.value })
                  }
                  onBlur={handleAddressBlur}
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
                  onChange={(e) =>
                    setSalonData({ ...salonData, street: e.target.value })
                  }
                  onBlur={handleAddressBlur}
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
                    onChange={(e) =>
                      setSalonData({
                        ...salonData,
                        building_no: e.target.value,
                      })
                    }
                    onBlur={handleAddressBlur}
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
                    onChange={(e) =>
                      setSalonData({
                        ...salonData,
                        apartment_no: e.target.value,
                      })
                    }
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
                  onChange={(e) =>
                    setSalonData({ ...salonData, address: e.target.value })
                  }
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
                  <input
                    className="w-full px-6 py-4.5 bg-gray-100/50 border border-border rounded-2xl font-black text-text-muted outline-none cursor-default"
                    readOnly
                    value={salonData.geo_latitude.toFixed(6)}
                  />
                </div>
              </div>
              <div className="group">
                <label className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 mb-3">
                  <MapPin className="w-3.5 h-3.5" /> Boylam (Longitude)
                </label>
                <div className="relative">
                  <input
                    className="w-full px-6 py-4.5 bg-gray-100/50 border border-border rounded-2xl font-black text-text-muted outline-none cursor-default"
                    readOnly
                    value={salonData.geo_longitude.toFixed(6)}
                  />
                </div>
              </div>
            </div>

            <div className="relative group p-1.5 bg-surface border border-border rounded-[40px] shadow-card overflow-hidden">
              <div className="h-[450px] rounded-[32px] overflow-hidden border border-border relative z-0">
                <AdminSalonMap
                  center={[salonData.geo_latitude, salonData.geo_longitude]}
                  markerPosition={{
                    lat: salonData.geo_latitude,
                    lng: salonData.geo_longitude,
                  }}
                  onLocationSelect={(lat, lng) =>
                    setSalonData({
                      ...salonData,
                      geo_latitude: lat,
                      geo_longitude: lng,
                    })
                  }
                />
                <div className="absolute top-6 left-6 z-[1000] bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-border/50 text-[10px] font-black uppercase tracking-widest text-text-main shadow-2xl flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${mapLoading ? "bg-amber-500 animate-ping" : "bg-primary animate-pulse"}`}
                  />
                  {mapLoading
                    ? "Konum Aranıyor..."
                    : "Konumunuzu Haritadan İşaretleyin"}
                </div>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-8 text-center py-6 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-50 rounded-[30px] flex items-center justify-center text-green-600 mx-auto shadow-inner border border-green-100">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-text-main">
                Her şey hazır mı?
              </h2>
              <p className="text-text-secondary font-medium">
                Girdiğiniz bilgileri kontrol edip onaylayın. "Onaya Gönder"
                butonuna bastığınızda salonunuz admin incelemesine gidecektir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Paket & Temel Bilgiler */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-border space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-2 mb-2">
                  <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider">
                    1. Paket & Temel Bilgiler
                  </h4>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-100 flex items-center gap-1 transition-colors"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Düzenle
                  </button>
                </div>

                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-border shadow-sm">
                  <span className="text-[10px] font-bold text-text-muted uppercase">
                    Seçilen Paket
                  </span>
                  <span className="text-sm font-black text-primary">
                    {plans.find((p) => p.id === selectedPlanId)?.display_name ||
                      "-"}{" "}
                    ({billingCycle === "MONTHLY" ? "Aylık" : "Yıllık"})
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-text-muted">
                      Salon İsmi
                    </span>
                    <span className="text-xs font-black text-text-main">
                      {salonData.name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-text-muted">
                      Telefon
                    </span>
                    <span className="text-xs font-black text-text-main">
                      {salonData.phone || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-text-muted">
                      Ana Kategori
                    </span>
                    <span className="text-xs font-black text-text-main">
                      {salonTypes.find(
                        (t) => t.id === salonData.primary_type_id,
                      )?.name || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Konum & Harita */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-border space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-2 mb-2">
                  <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider">
                    2. Konum & İletişim
                  </h4>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-100 flex items-center gap-1 transition-colors"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Düzenle
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-text-muted">
                      Şehir / İlçe
                    </span>
                    <span className="text-xs font-black text-text-main">
                      {cities.find((c) => c.id === salonData.city_id)?.name ||
                        "-"}{" "}
                      /{" "}
                      {districts.find((d) => d.id === salonData.district_id)
                        ?.name || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-text-muted">
                      Açık Adres
                    </span>
                    <span className="text-xs font-black text-text-main">
                      {salonData.neighborhood
                        ? salonData.neighborhood + " Mah. "
                        : ""}
                      {salonData.avenue ? salonData.avenue + " " : ""}
                      {salonData.street ? salonData.street + " Sok. " : ""}
                      {salonData.building_no
                        ? "No:" + salonData.building_no
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hizmetler ve Personel */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-border space-y-4 md:col-span-2">
                <div className="flex justify-between items-center border-b border-border pb-2 mb-2">
                  <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider">
                    3. Hizmetler & Personel Özeti
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-100 flex items-center gap-1 transition-colors"
                    >
                      <Star className="w-3 h-3" /> Hizm. Düz.
                    </button>
                    <button
                      onClick={() => setCurrentStep(6)}
                      className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-100 flex items-center gap-1 transition-colors"
                    >
                      <Users className="w-3 h-3" /> Per. Düz.
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-border text-center shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-1">
                      Seçilen Hizmet
                    </p>
                    <p className="text-2xl font-black text-primary">
                      {selectedServices.length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-border text-center shadow-sm">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-1">
                      Personel Sayısı
                    </p>
                    <p className="text-2xl font-black text-blue-500">
                      {staffMembers.length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-border text-center shadow-sm md:col-span-2">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-1">
                      Çalışma Günleri
                    </p>
                    <div className="flex justify-center gap-1 flex-wrap mt-2">
                      {workingHours.map((h, i) => (
                        <span
                          key={i}
                          className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${h.is_closed ? "bg-red-50 text-red-400" : "bg-green-50 text-green-600"}`}
                        >
                          {
                            ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][
                            h.day_of_week
                            ]
                          }
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {salonData.id ? (
              <SalonWorkingHoursForm salonId={salonData.id} />
            ) : (
              <div className="text-center text-text-muted py-10">Salon bilgileri yükleniyor...</div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {salonData.id ? (
              <SalonServicesManager salonId={salonData.id} />
            ) : (
              <div className="text-center text-text-muted py-10">Salon bilgileri yükleniyor...</div>
            )}
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            {salonData.id ? (
              <SalonStaffManager salonId={salonData.id} />
            ) : (
              <div className="text-center text-text-muted py-10">Salon bilgileri yükleniyor...</div>
            )}
          </div>
        );
      case 7:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-green-50 rounded-[32px] flex items-center justify-center text-green-500 mx-auto shadow-inner border border-green-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-text-main">Her Şey Hazır!</h2>
              <p className="text-sm text-text-secondary font-medium max-w-md mx-auto">
                Salon bilgileriniz kaydedildi. Onaya göndermek için aşağıdaki butona tıklayın.
                Admin ekibi en kısa sürede salonunuzu inceleyecektir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Paket & Temel Bilgiler */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-border space-y-4">
                <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider border-b border-border pb-2">
                  Paket & Temel Bilgiler
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-text-muted">Salon İsmi</span>
                    <span className="text-xs font-black text-text-main">{salonData.name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-text-muted">Telefon</span>
                    <span className="text-xs font-black text-text-main">{salonData.phone || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-text-muted">Ana Kategori</span>
                    <span className="text-xs font-black text-text-main">
                      {salonTypes.find((t) => t.id === salonData.primary_type_id)?.name || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Konum */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-border space-y-4">
                <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider border-b border-border pb-2">
                  Konum & İletişim
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-text-muted">Şehir / İlçe</span>
                    <span className="text-xs font-black text-text-main">
                      {cities.find((c) => c.id === salonData.city_id)?.name || "-"} / {districts.find((d) => d.id === salonData.district_id)?.name || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-text-muted">Açık Adres</span>
                    <span className="text-xs font-black text-text-main">
                      {salonData.neighborhood ? salonData.neighborhood + " Mah. " : ""}
                      {salonData.avenue ? salonData.avenue + " " : ""}
                      {salonData.street ? salonData.street + " Sok. " : ""}
                      {salonData.building_no ? "No:" + salonData.building_no : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bilgi Notu */}
              <div className="bg-green-50 rounded-2xl p-5 border border-green-100 md:col-span-2">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-800">
                      Hizmetler, personel ve çalışma saatleri önceki adımlarda kaydedildi.
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Değişiklik yapmak isterseniz geri dönüp ilgili adımlardaki bilgileri güncelleyebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
        <h1 className="text-4xl font-black text-text-main tracking-tight font-display">
          İşletmenizi Tanıtın
        </h1>
        <p className="text-text-secondary font-medium italic">
          Profesyonel güzellik dünyasına ilk adımınızı atın.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative group">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(241,114,144,0.5)]"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          ></div>
        </div>
        <div className="relative flex justify-between">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 border-4 ${currentStep >= step.id ? "bg-primary border-white text-white shadow-lg" : "bg-white border-gray-100 text-text-muted group-hover:border-gray-200"}`}
              >
                <step.icon
                  className={`w-5 h-5 ${currentStep === step.id ? "animate-pulse" : ""}`}
                />
              </div>
              <div className="hidden sm:block text-center">
                <p
                  className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= step.id ? "text-primary" : "text-text-muted"}`}
                >
                  {step.title}
                </p>
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
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                ADIM {currentStep}
              </p>
              <h2 className="text-2xl font-black text-text-main tracking-tight font-display">
                {STEPS[currentStep - 1].title}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-[11px] font-black text-text-muted border border-border">
              {currentStep}/7
            </div>
          </div>

          {renderStepContent()}

          {/* Navigation Footer */}
          <div className="mt-12 pt-10 border-t border-gray-100 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              className={`flex items-center gap-2 font-black text-sm uppercase tracking-widest px-6 py-4 rounded-2xl transition-all ${currentStep === 1 ? "opacity-0 pointer-events-none" : "text-text-muted hover:text-text-main hover:bg-gray-50"}`}
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
                  {currentStep === 7 ? "Onaya Gönder" : "Sonraki Adım"}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${currentStep === 7 ? "hidden" : ""}`}
                  />
                  {currentStep === 7 && <Save className="w-4 h-4" />}
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
