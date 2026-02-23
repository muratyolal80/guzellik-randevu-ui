/**
 * Tenant Context Provider
 * Provides salon_id isolation for multi-tenant operations
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface TenantContextType {
    salonId: string | null;
    salon: any | null;
    plan: 'FREE' | 'PRO' | 'ENTERPRISE' | null;
    setPlan: (plan: 'FREE' | 'PRO' | 'ENTERPRISE') => void;
    primaryColor: string;
    loading: boolean;
    refreshSalonId: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType>({
    salonId: null,
    salon: null,
    plan: null,
    setPlan: () => { },
    primaryColor: '#CFA76D',
    loading: true,
    refreshSalonId: async () => { }
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isOwner, isStaff } = useAuth();
    const [salonId, setSalonId] = useState<string | null>(null);
    const [salon, setSalon] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSalonId = async () => {
        if (!user || (!isOwner && !isStaff)) {
            setSalonId(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            if (isOwner) {
                // Get salons owned by this user
                const { data, error } = await supabase
                    .from('salons')
                    .select('*')
                    .eq('owner_id', user.id);

                if (error) {
                    if (error.code !== 'PGRST116') {
                        console.error('[TenantContext] Error fetching owner salons:', error);
                    }
                    setSalonId(null);
                    setSalon(null);
                } else {
                    const savedBranchId = typeof window !== 'undefined' ? localStorage.getItem(`active_branch_${user.id}`) : null;
                    const exists = data?.find(s => s.id === savedBranchId);
                    const selectedSalon = exists || data?.[0] || null;

                    setSalonId(selectedSalon?.id || null);
                    setSalon(selectedSalon);

                    if (selectedSalon) {
                        const brandColor = selectedSalon.primary_color || '#CFA76D';
                        document.documentElement.style.setProperty('--primary', brandColor);
                        document.documentElement.style.setProperty('--primary-hover', `${brandColor}dd`);
                    }
                }
            } else if (isStaff) {
                // Get salons this staff belongs to
                const { data, error } = await supabase
                    .from('staff')
                    .select('salon_id')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('[TenantContext] Error fetching staff salon details:', error);
                    setSalonId(null);
                    setSalon(null);
                } else {
                    const sId = data?.[0]?.salon_id || null;
                    setSalonId(sId);
                    if (sId) {
                        const { data: salonData } = await supabase.from('salons').select('*').eq('id', sId).single();
                        setSalon(salonData);

                        // Essential dynamic branding: Inject primary color as CSS variable
                        const brandColor = salonData.primary_color || '#CFA76D';
                        document.documentElement.style.setProperty('--primary', brandColor);
                        // Also generate subtle variations if needed
                        document.documentElement.style.setProperty('--primary-hover', `${brandColor}dd`);
                    }
                }
            }
        } catch (err) {
            console.error('[TenantContext] Unexpected error:', err);
            setSalonId(null);
            setSalon(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSalonId();
    }, [user?.id, isOwner, isStaff]);

    return (
        <TenantContext.Provider value={{
            salonId,
            salon,
            plan: salon?.plan || 'FREE',
            setPlan: (newPlan: 'FREE' | 'PRO' | 'ENTERPRISE') => setSalon((prev: any) => prev ? { ...prev, plan: newPlan } : null),
            primaryColor: salon?.primary_color || '#CFA76D',
            loading,
            refreshSalonId
        }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
