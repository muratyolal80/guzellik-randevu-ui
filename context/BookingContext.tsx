'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { SalonDetail, Staff, SalonServiceDetail, CampaignRule } from '@/types';

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

  // Campaigns
  const [campaignRules, setCampaignRules] = useState<CampaignRule[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<CampaignRule | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const basePrice = selectedServices.reduce((acc, s) => acc + (s.price || 0), 0);

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

