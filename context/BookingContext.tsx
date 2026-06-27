'use client';

<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import type { SalonDetail, Staff, SalonServiceDetail, CampaignRule } from '@/types';

// ── sessionStorage persistence ──────────────────────────────────────────────
// Booking state'i sayfa yenileme sonrası kaybolmasın diye sessionStorage'a yazılır.
// Tab kapatılırsa otomatik temizlenir. 2 saat TTL — eski randevu denemesi karışmasın.
const STORAGE_KEY = 'booking-state-v1';
const TTL_MS = 2 * 60 * 60 * 1000; // 2 saat

interface PersistedState {
  salonId?: string;
  selectedServices: SalonServiceDetail[];
  selectedStaff: Staff | null;
  selectedDate: string | null;
  selectedTime: string | null;
  customerName: string;
  customerPhone: string;
  customerNotes: string;
  participantCount: number;
  appointmentId: string | null;
  savedAt: number;
}

function loadPersistedState(salonId?: string): Partial<PersistedState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    // TTL kontrolü
    if (Date.now() - parsed.savedAt > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Farklı salon için kaydedilmiş state'i kullanma
    if (salonId && parsed.salonId && parsed.salonId !== salonId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function savePersistedState(state: Omit<PersistedState, 'savedAt'>) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch {
    // quota exceeded vs — sessizce geç
  }
}

function clearPersistedState() {
  if (typeof window === 'undefined') return;
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

=======
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { SalonDetail, Staff, SalonServiceDetail, CampaignRule } from '@/types';

>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
interface BookingContextType {
  // Salon info
  salon: SalonDetail | null;
  setSalon: (salon: SalonDetail | null) => void;

  // Selected services (Basket)
  selectedServices: SalonServiceDetail[];
  addService: (service: SalonServiceDetail) => void;
  removeService: (serviceId: string) => void;
  setSelectedServices: (services: SalonServiceDetail[]) => void;

  // Selected staff
  selectedStaff: Staff | null;
  setSelectedStaff: (staff: Staff | null) => void;

  // Selected time
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;

  // Customer info
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  customerNotes: string;
  setCustomerNotes: (notes: string) => void;
  participantCount: number;
  setParticipantCount: (count: number) => void;

  // Rescheduling info
  appointmentId: string | null;
  setAppointmentId: (id: string | null) => void;

  // Campaigns & Discounts
  campaignRules: CampaignRule[];
  activeCampaign: CampaignRule | null;
  discountAmount: number;
  totalPrice: number;

  // Reset booking
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

import { SalonDataService } from '@/services/db';

// ... interface unchanged ...

export function BookingProvider({ children, salonId }: { children: ReactNode; salonId?: string }) {
<<<<<<< HEAD
  // İlk render'da sessionStorage'dan oku (yenileme sonrası state restore)
  const persisted = typeof window !== 'undefined' ? loadPersistedState(salonId) : null;

  const [salon, setSalon] = useState<SalonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SalonServiceDetail[]>(persisted?.selectedServices || []);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(persisted?.selectedStaff || null);
  const [selectedDate, setSelectedDate] = useState<string | null>(persisted?.selectedDate || null);
  const [selectedTime, setSelectedTime] = useState<string | null>(persisted?.selectedTime || null);
  const [customerName, setCustomerName] = useState(persisted?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(persisted?.customerPhone || '');
  const [customerNotes, setCustomerNotes] = useState(persisted?.customerNotes || '');
  const [participantCount, setParticipantCount] = useState(persisted?.participantCount ?? 1);
  const [appointmentId, setAppointmentId] = useState<string | null>(persisted?.appointmentId || null);

  // İlk render'da persisted state restore edildi mi takibi — salonId değiştiğinde reset etmemek için
  const restoredFromStorage = useRef(!!persisted);
=======
  const [salon, setSalon] = useState<SalonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SalonServiceDetail[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [participantCount, setParticipantCount] = useState(1);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8

  // Campaigns
  const [campaignRules, setCampaignRules] = useState<CampaignRule[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<CampaignRule | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const basePrice = selectedServices.reduce((acc, s) => acc + (s.price || 0), 0);

<<<<<<< HEAD
  // Fetch campaigns for the salon (non-critical — silently skip on permission/missing-table errors)
  React.useEffect(() => {
    if (salon?.id) {
      const fetchRules = async () => {
        try {
          const { CampaignService } = await import('@/services/db');
          const rules = await CampaignService.getSalonCampaignRules(salon.id);
          setCampaignRules(rules.filter(r => r.is_active));
        } catch (err: any) {
          console.warn('Campaign rules fetch failed:', err?.message || err?.code || err);
          setCampaignRules([]);
        }
=======
  // Fetch campaigns for the salon
  React.useEffect(() => {
    if (salon?.id) {
      const fetchRules = async () => {
        const { CampaignService } = await import('@/services/db');
        const rules = await CampaignService.getSalonCampaignRules(salon.id);
        setCampaignRules(rules.filter(r => r.is_active));
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
      };
      fetchRules();
    }
  }, [salon?.id]);

  // Calculate discount based on selected date/time
  React.useEffect(() => {
    if (!selectedDate || !selectedTime || campaignRules.length === 0) {
      setActiveCampaign(null);
      setDiscountAmount(0);
      return;
    }

    const dayOfWeek = new Date(selectedDate).getDay() || 7; // Sunday is 0 in JS, 7 in our DB if ISO-like
    // Note: JS Date.getDay() 0 (Paz), 1 (Pzt)... 6 (Cmt). Bizim DB [1, 2...7] olabilir.
    // Düzeltme: JS 0: Pazar. Bizim DB'de 7: Pazar yapalım (SQL'de Check kısıtı 1-7).
    const dbDay = dayOfWeek === 0 ? 7 : dayOfWeek;

    const matchingRule = campaignRules.find(rule => {
      // Day check
      if (rule.days_of_week && !rule.days_of_week.includes(dbDay)) return false;

      // Time check
      if (rule.start_time && rule.end_time) {
        const current = selectedTime; // "HH:mm"
        return current >= rule.start_time && current <= rule.end_time;
      }

      return true;
    });

    if (matchingRule) {
      setActiveCampaign(matchingRule);
      let disc = 0;
      if (matchingRule.discount_type === 'PERCENTAGE') {
        disc = (basePrice * matchingRule.discount_value) / 100;
      } else {
        disc = matchingRule.discount_value;
      }
      setDiscountAmount(disc);
    } else {
      setActiveCampaign(null);
      setDiscountAmount(0);
    }
  }, [selectedDate, selectedTime, campaignRules, basePrice]);

  // Auto-fetch salon if salonId is provided
  React.useEffect(() => {
    if (salonId) {
      const fetchSalon = async () => {
        setLoading(true);
        try {
<<<<<<< HEAD
          // Salon değişti — persisted state başka salona aitse temizle
          // restoredFromStorage true ise: sayfa yenileme — state korunur
          if (!restoredFromStorage.current) {
            setSalon(null);
            setSelectedServices([]);
            setSelectedStaff(null);
            setSelectedDate(null);
            setSelectedTime(null);
            setCustomerName('');
            setCustomerPhone('');
            setCustomerNotes('');
            setAppointmentId(null);
          }
          restoredFromStorage.current = false; // sonraki salonId değişimlerinde reset

          // Fetch full salon details
=======
          // Reset previous state when salonId changes
          setSalon(null); // Clear previous salon data
          setSelectedServices([]);
          setSelectedStaff(null);
          setSelectedDate(null);
          setSelectedTime(null);
          setCustomerName('');
          setCustomerPhone('');
          setCustomerNotes('');
          setAppointmentId(null);

          // Fetch full salon details including category/services if needed, 
          // but getSalonById is the main entry point
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
          const data = await SalonDataService.getSalonById(salonId);
          if (data) {
            setSalon(data);
          }
        } catch (err) {
          console.error('Error fetching salon for booking context:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchSalon();
    }
  }, [salonId]);

<<<<<<< HEAD
  // ── State değiştiğinde sessionStorage'a yaz (debounce yok — state nadiren değişir) ──
  React.useEffect(() => {
    // Hiçbir seçim yoksa storage'ı kirletme
    const hasAnySelection =
      selectedServices.length > 0 || selectedStaff || selectedDate || selectedTime ||
      customerName || customerPhone || appointmentId;

    if (!hasAnySelection) {
      clearPersistedState();
      return;
    }

    savePersistedState({
      salonId,
      selectedServices,
      selectedStaff,
      selectedDate,
      selectedTime,
      customerName,
      customerPhone,
      customerNotes,
      participantCount,
      appointmentId,
    });
  }, [
    salonId, selectedServices, selectedStaff, selectedDate, selectedTime,
    customerName, customerPhone, customerNotes, participantCount, appointmentId,
  ]);

=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
  // Calculate final price
  const totalPrice = Math.max(0, basePrice - discountAmount);

  const resetBooking = () => {
    // Keep salon loaded if salonId was provided
    if (!salonId) setSalon(null);
    setSelectedServices([]);
    setSelectedStaff(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerNotes('');
    setParticipantCount(1);
    setAppointmentId(null);
    setCampaignRules([]);
    setActiveCampaign(null);
    setDiscountAmount(0);
<<<<<<< HEAD
    clearPersistedState();
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
  };

  const addService = (service: SalonServiceDetail) => {
    setSelectedServices(prev => {
      if (prev.find(s => s.id === service.id)) return prev;
      return [...prev, service];
    });
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  return (
    <BookingContext.Provider
      value={{
        salon,
        setSalon,
        selectedServices,
        addService,
        removeService,
        setSelectedServices,
        selectedStaff,
        setSelectedStaff,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        customerNotes,
        setCustomerNotes,
        participantCount,
        setParticipantCount,
        appointmentId,
        setAppointmentId,
        campaignRules,
        activeCampaign,
        discountAmount,
        totalPrice,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

