'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { SalonDetail, Staff, SalonServiceDetail } from '@/types';

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

  // Rescheduling info
  appointmentId: string | null;
  setAppointmentId: (id: string | null) => void;

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
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

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
    setAppointmentId(null);
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
        appointmentId,
        setAppointmentId,
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

