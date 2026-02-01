'use client';

import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { WorkingHours } from '@/types';

interface WorkingHoursEditorProps {
    hours: any[]; // Can be WorkingHours[] or the Omit type for new staff
    onChange: (updatedHours: any[]) => void;
    onUpdateOne?: (hourId: string, updates: Partial<WorkingHours>) => Promise<void>;
    days: string[];
    readonly?: boolean;
}

export default function WorkingHoursEditor({ hours, onChange, onUpdateOne, days, readonly = false }: WorkingHoursEditorProps) {

    const handleToggleDayOff = async (idx: number) => {
        if (readonly) return;
        const updated = [...hours];
        const newStatus = !updated[idx].is_day_off;
        updated[idx].is_day_off = newStatus;

        onChange(updated);

        if (onUpdateOne && updated[idx].id) {
            await onUpdateOne(updated[idx].id, { is_day_off: newStatus });
        }
    };

    const handleTimeChange = async (idx: number, type: 'start' | 'end', value: string) => {
        if (readonly) return;
        const updated = [...hours];
        const updates: any = {};

        if (type === 'start') {
            updated[idx].start_time = value;
            updates.start_time = value;
        } else {
            updated[idx].end_time = value;
            updates.end_time = value;
        }

        onChange(updated);

        if (onUpdateOne && updated[idx].id) {
            await onUpdateOne(updated[idx].id, updates);
        }
    };

    // Ensure we handle both database formats HH:MM:SS and input format HH:MM
    const formatTime = (time: string) => {
        if (!time) return '09:00';
        return time.substring(0, 5);
    };

    return (
        <div className="space-y-4">
            {hours.map((h, idx) => (
                <div
                    key={idx}
                    className={`flex items-center p-5 rounded-[24px] border transition-all ${h.is_day_off
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-border shadow-sm hover:border-primary/30'
                        }`}
                >
                    <div className="w-36 font-black text-base text-text-main tracking-tight">
                        {days[h.day_of_week]}
                    </div>

                    <div className="flex-1 flex justify-center">
                        {!h.is_day_off ? (
                            <div className="flex items-center gap-3 bg-surface-alt px-4 py-2 rounded-2xl border border-border">
                                <input
                                    type="time"
                                    disabled={readonly}
                                    value={formatTime(h.start_time)}
                                    onChange={(e) => handleTimeChange(idx, 'start', e.target.value)}
                                    className="bg-transparent font-black text-sm outline-none w-16 text-center cursor-pointer text-text-main"
                                />
                                <span className="text-text-muted font-black text-lg leading-none">-</span>
                                <input
                                    type="time"
                                    disabled={readonly}
                                    value={formatTime(h.end_time)}
                                    onChange={(e) => handleTimeChange(idx, 'end', e.target.value)}
                                    className="bg-transparent font-black text-sm outline-none w-16 text-center cursor-pointer text-text-main"
                                />
                            </div>
                        ) : (
                            <span className="text-[11px] font-black text-red-500 uppercase tracking-widest py-2 px-4 bg-red-50 rounded-full">İzinli</span>
                        )}
                    </div>

                    {!readonly && (
                        <button
                            type="button"
                            onClick={() => handleToggleDayOff(idx)}
                            className={`ml-6 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-28 ${h.is_day_off
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}
                        >
                            {h.is_day_off ? 'Çalışıyor' : 'İzinli Yap'}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
