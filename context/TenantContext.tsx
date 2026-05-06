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
    plan: string | null;
    setPlan: (plan: string) => void;
    primaryColor: string;
    loading: boolean;
    refreshSalonId: () => Promise<void>;
    subscriptionStatus: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'TRIAL' | null;
    planDetails: any | null;
}

const TenantContext = createContext<TenantContextType>({
    salonId: null,
    salon: null,
    plan: null,
    setPlan: () => { },
    primaryColor: '#CFA76D',
    loading: true,
    refreshSalonId: async () => { },
    subscriptionStatus: null,
    planDetails: null
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isOwner, isStaff } = useAuth();
    const [salonId, setSalonId] = useState<string | null>(null);
    const [salon, setSalon] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState<'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'TRIAL' | null>(null);
    const [planDetails, setPlanDetails] = useState<any | null>(null);

    const refreshSalonId = async () => {
        if (!user || (!isOwner && !isStaff)) {
            setSalonId(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            let selectedSId = null;

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
                } else {
                    const savedBranchId = typeof window !== 'undefined' ? localStorage.getItem(`active_branch_${user.id}`) : null;
                    const exists = data?.find(s => s.id === savedBranchId);
                    const selectedSalon = exists || data?.[0] || null;

                    selectedSId = selectedSalon?.id || null;
                    setSalonId(selectedSId);
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
                } else {
                    selectedSId = data?.[0]?.salon_id || null;
                    setSalonId(selectedSId);
                    if (selectedSId) {
                        const { data: salonData } = await supabase.from('salons').select('*').eq('id', selectedSId).single();
                        if (!salonData) {
                            console.error('[TenantContext] Staff salon not found for id:', selectedSId);
                        } else {
                            setSalon(salonData);
                            const brandColor = salonData.primary_color || '#CFA76D';
                            document.documentElement.style.setProperty('--primary', brandColor);
                            document.documentElement.style.setProperty('--primary-hover', `${brandColor}dd`);
                        }
                    }
                }
            }
            
            // Fetch subscription details if we have a selected salon
            if (selectedSId) {
                const { data: subData } = await supabase
                    .from('subscriptions')
                    .select('*, subscription_plans(*)')
                    .eq('salon_id', selectedSId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                
                let activeSub = subData;

                // Eğer bu salona ait özel bir abonelik yoksa (örn. yeni açıldıysa) VEYA süresi dolduysa
                // ama owner'ın BAŞKA BİR salonunda aktif bir MASTER paketi varsa onu kullandır (Eğer limitleri yetiyorsa)
                // Şimdilik owner seviyesindeki genel paketi "kurtarıcı" olarak alalım.
                if (isOwner && (!activeSub || (activeSub.status !== 'ACTIVE' && activeSub.status !== 'TRIAL' && activeSub.status !== 'PENDING'))) {
                    const { SubscriptionService } = await import('@/services/db');
                    const ownerSub = await SubscriptionService.getOwnerActiveSubscription(user.id);
                    if (ownerSub) {
                        activeSub = ownerSub; // Diğer şubenin paketi geçerli sayılıyor (multi-branch destekli paketler için)
                    }
                }

                if (activeSub) {
                    setSubscriptionStatus(activeSub.status);
                    setPlanDetails(activeSub.subscription_plans);
                    // Force the plan name to be up to date in the salon object
                    setSalon((prev: any) => prev ? { ...prev, plan: activeSub.subscription_plans?.name || 'STARTER' } : null);
                } else {
                    // Fallback to defaults
                    setSubscriptionStatus(null);
                    setPlanDetails(null);
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
            plan: salon?.plan || 'STARTER',
            setPlan: (newPlan: string) => setSalon((prev: any) => prev ? { ...prev, plan: newPlan } : null),
            primaryColor: salon?.primary_color || '#CFA76D',
            loading,
            refreshSalonId,
            subscriptionStatus,
            planDetails
        }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
