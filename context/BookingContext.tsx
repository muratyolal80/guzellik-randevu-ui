'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { SalonDetail, Staff, SalonServiceDetail } from '@/types';

interface BookingContextType {
  // Salon info
  salon: SalonDetail | null;
  setSalon: (salon: SalonDetail | null) => void;

  // Selected service
  selectedService: SalonServiceDetail | null;
  setSelectedService: (service: SalonServiceDetail | null) => void;

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

  // Reset booking
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [salon, setSalon] = useState<SalonDetail | null>(null);
  const [selectedService, setSelectedService] = useState<SalonServiceDetail | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const resetBooking = () => {
    setSalon(null);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerNotes('');
  };

  return (
    <BookingContext.Provider
      value={{
        salon,
        setSalon,
        selectedService,
        setSelectedService,
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

