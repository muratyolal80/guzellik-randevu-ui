/**
 * TimeSlotPicker Component
 * Displays real-time available time slots using SlotService
 */

'use client';

import React, { useState, useEffect } from 'react';
import Skeleton from '@/components/Skeleton';
import { SlotService, TimeSlot } from '@/services/slot';
import { useBooking } from '@/context/BookingContext';

import { CircleAlert, CalendarX, User } from 'lucide-react';
interface TimeSlotPickerProps {
    salonId: string;
    serviceId: string;
    date: Date;
    staffId?: string;
    onSelectSlot: (slot: TimeSlot) => void;
}

export function TimeSlotPicker({
    salonId,
    serviceId,
    date,
    staffId,
    onSelectSlot
}: TimeSlotPickerProps) {
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchSlots() {
            if (!salonId || !serviceId || !date) {
                setSlots([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const availableSlots = await SlotService.getAvailableSlots({
                    salonId,
                    serviceId,
                    date,
                    staffId
                });

                if (mounted) {
                    setSlots(availableSlots);
                }
            } catch (err) {
                console.error('Error fetching slots:', err);
                if (mounted) {
                    setError('Uygun saatler yüklenemedi. Lütfen tekrar deneyin.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        fetchSlots();

        return () => {
            mounted = false;
        };
    }, [salonId, serviceId, date, staffId]);

    const handleSlotClick = (slot: TimeSlot) => {
        setSelectedSlot(slot);
        onSelectSlot(slot);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="space-y-3 py-4" aria-busy="true" aria-label="Uygun saatler yükleniyor">
                <Skeleton className="h-5 w-40" />
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
                <CircleAlert className="w-6 h-6 text-red-600 mr-2 shrink-0" aria-hidden="true" />
                {error}
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <CalendarX className="w-9 h-9 text-yellow-600 mb-2 mx-auto" aria-hidden="true" />
                <p className="text-text-main font-semibold mb-1">Bu tarihte uygun saat bulunamadı</p>
                <p className="text-text-secondary text-sm">Lütfen başka bir tarih seçin veya farklı bir personel deneyin.</p>
            </div>
        );
    }

    // Group slots by staff member
    const slotsByStaff = slots.reduce((acc, slot) => {
        if (!acc[slot.staffId]) {
            acc[slot.staffId] = {
                staffName: slot.staffName,
                slots: []
            };
        }
        acc[slot.staffId].slots.push(slot);
        return acc;
    }, {} as Record<string, { staffName: string; slots: TimeSlot[] }>);

    return (
        <div className="space-y-6">
            {Object.entries(slotsByStaff).map(([staffId, data]) => (
                <div key={staffId} className="space-y-3">
                    <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                        <User className="w-6 h-6 text-primary" aria-hidden="true" />
                        {data.staffName}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {data.slots.map((slot, index) => {
                            const isSelected = selectedSlot?.startTime.getTime() === slot.startTime.getTime() &&
                                selectedSlot?.staffId === slot.staffId;

                            return (
                                <button
                                    key={`${staffId}-${index}`}
                                    onClick={() => handleSlotClick(slot)}
                                    className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isSelected
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'bg-surface border border-border hover:border-primary hover:bg-surface-alt text-text-main'
                                        }
                  `}
                                >
                                    {formatTime(slot.startTime)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {selectedSlot && (
                <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <p className="text-sm text-text-main">
                        <strong>Seçilen Saat:</strong> {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                        <strong>Personel:</strong> {selectedSlot.staffName}
                    </p>
                </div>
            )}
        </div>
    );
}
