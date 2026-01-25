/**
 * Staff Skill Management Component
 * Allows owners to assign specific services to staff members
 */

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StaffService, ServiceService } from '@/services/db';

interface StaffSkillsProps {
    salonId: string;
}

export function StaffSkillsManager({ salonId }: StaffSkillsProps) {
    const [staff, setStaff] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<Set<string>>(new Set()); // "staffId-serviceId"
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [salonId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Staff & Services
            const [staffList, serviceList] = await Promise.all([
                StaffService.getStaffBySalon(salonId),
                ServiceService.getServicesBySalon(salonId)
            ]);

            setStaff(staffList);
            setServices(serviceList);

            // 2. Fetch Existing Assignments
            const { data: existing } = await supabase
                .from('staff_services')
                .select('staff_id, salon_service_id')
                .eq('salon_id', salonId);

            // 3. Populate Set
            const currentAssignments = new Set<string>();
            existing?.forEach(item => {
                currentAssignments.add(`${item.staff_id}-${item.salon_service_id}`);
            });
            setAssignments(currentAssignments);

        } catch (err) {
            console.error('Error fetching skills:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAssignment = async (staffId: string, serviceId: string) => {
        const key = `${staffId}-${serviceId}`;
        const isAssigned = assignments.has(key);

        // Optimistic Update
        const next = new Set(assignments);
        if (isAssigned) next.delete(key);
        else next.add(key);
        setAssignments(next);
        setSaving(true);

        try {
            if (isAssigned) {
                // DELETE
                await supabase
                    .from('staff_services')
                    .delete()
                    .eq('staff_id', staffId)
                    .eq('salon_service_id', serviceId);
            } else {
                // INSERT
                await supabase
                    .from('staff_services')
                    .insert({
                        salon_id: salonId,
                        staff_id: staffId,
                        salon_service_id: serviceId
                    });
            }
        } catch (err) {
            // Revert on error
            console.error('Failed to toggle skill', err);
            setAssignments(assignments);
            alert('İşlem başarısız oldu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-xl font-bold text-text-main mb-4">Personel Yetkinlikleri</h2>
            <p className="text-text-secondary text-sm mb-6">
                Hangi personelin hangi hizmetleri verebileceğini buradan seçebilirsiniz.
                <br /><span className="text-xs text-primary">* İşaretli hizmetler personel takviminde ve randevu sisteminde aktif olacaktır.</span>
            </p>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-bold text-text-muted">Hizmet / Personel</th>
                            {staff.map(s => (
                                <th key={s.id} className="py-3 px-4 font-bold text-text-main text-center min-w-[100px]">
                                    <div className="flex flex-col items-center gap-1">
                                        <img src={s.photo || 'https://i.pravatar.cc/100'} className="w-8 h-8 rounded-full bg-gray-100" />
                                        <span>{s.name}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {services.map(service => (
                            <tr key={service.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <p className="font-bold text-text-main">{service.service_name}</p>
                                    <p className="text-xs text-text-secondary">{service.duration_min} dk • ₺{service.price}</p>
                                </td>
                                {staff.map(s => {
                                    const isChecked = assignments.has(`${s.id}-${service.id}`);
                                    return (
                                        <td key={s.id} className="py-3 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleAssignment(s.id, service.id)}
                                                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer accent-[#CFA76D]"
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {services.length === 0 && <p className="text-center py-8 text-gray-500">Henüz hizmet eklenmemiş.</p>}
            {staff.length === 0 && <p className="text-center py-8 text-gray-500">Henüz personel eklenmemiş.</p>}
        </div>
    );
}
