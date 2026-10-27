/**
 * Tenant Context Provider
 * Provides salon_id isolation for multi-tenant operations
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { SalonDataService, StaffService, SubscriptionService } from '@/services/db';
import type { Salon, SalonPlan, Subscription, SubscriptionPlan } from '@/types';

type TenantSubscriptionStatus = Subscription['status'] | null;

interface TenantContextType {
    salonId: string | null;
    salon: Salon | null;
    plan: string | null;
    setPlan: (plan: string) => void;
    primaryColor: string;
    loading: boolean;
    refreshSalonId: () => Promise<void>;
    subscriptionStatus: TenantSubscriptionStatus;
    planDetails: SubscriptionPlan | null;
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
    const [salon, setSalon] = useState<Salon | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState<TenantSubscriptionStatus>(null);
    const [planDetails, setPlanDetails] = useState<SubscriptionPlan | null>(null);

    const refreshSalonId = async () => {
        if (!user || (!isOwner && !isStaff)) {
            setSalonId(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            let selectedSId: string | null = null;

            if (isOwner) {
                // Get salons owned by this user
                let data: Salon[] | null = null;
                try {
                    data = await SalonDataService.getOwnedSalonRows(user.id);
                } catch (error: unknown) {
                    if ((error as { code?: string } | null)?.code !== 'PGRST116') {
                        console.error('[TenantContext] Error fetching owner salons:', error);
                    }
                }
                if (data) {
                    const savedBranchId = typeof window !== 'undefined' ? localStorage.getItem(`active_branch_${user.id}`) : null;
                    const exists = data.find(s => s.id === savedBranchId);
                    const selectedSalon = exists || data[0] || null;

                    selectedSId = selectedSalon?.id || null;
                    setSalonId(selectedSId);
                    setSalon(selectedSalon);

                    if (selectedSalon) {
                        const brandColor = (selectedSalon as Salon & { primary_color?: string }).primary_color || '#CFA76D';
                        document.documentElement.style.setProperty('--primary', brandColor);
                        document.documentElement.style.setProperty('--primary-hover', `${brandColor}dd`);
                    }
                }
            } else if (isStaff) {
                // Get salons this staff belongs to
                let salonIds: string[] | null = null;
                try {
                    salonIds = await StaffService.getSalonIdsByStaffUser(user.id);
                } catch (error: unknown) {
                    console.error('[TenantContext] Error fetching staff salon details:', error);
                }
                if (salonIds) {
                    selectedSId = salonIds[0] || null;
                    setSalonId(selectedSId);
                    if (selectedSId) {
                        const salonData = await SalonDataService.getSalonRowById(selectedSId).catch(() => null);
                        if (!salonData) {
                            console.error('[TenantContext] Staff salon not found for id:', selectedSId);
                        } else {
                            setSalon(salonData);
                            const brandColor = (salonData as Salon & { primary_color?: string }).primary_color || '#CFA76D';
                            document.documentElement.style.setProperty('--primary', brandColor);
                            document.documentElement.style.setProperty('--primary-hover', `${brandColor}dd`);
                        }
                    }
                }
            }
            
            // Fetch subscription details if we have a selected salon
            if (selectedSId) {
                const subData = await SubscriptionService.getLatestSalonSubscription(selectedSId).catch(() => null);
                
                let activeSub: Subscription | null = subData;

                // Eğer bu salona ait özel bir abonelik yoksa (örn. yeni açıldıysa) VEYA süresi dolduysa
                // ama owner'ın BAŞKA BİR salonunda aktif bir MASTER paketi varsa onu kullandır (Eğer limitleri yetiyorsa)
                // Şimdilik owner seviyesindeki genel paketi "kurtarıcı" olarak alalım.
                if (isOwner && (!activeSub || (activeSub.status !== 'ACTIVE' && activeSub.status !== 'TRIAL' && activeSub.status !== 'PENDING'))) {
                    const ownerSub = await SubscriptionService.getOwnerActiveSubscription(user.id);
                    if (ownerSub) {
                        activeSub = ownerSub as Subscription; // Diğer şubenin paketi geçerli sayılıyor (multi-branch destekli paketler için)
                    }
                }

                if (activeSub) {
                    setSubscriptionStatus(activeSub.status);
                    setPlanDetails(activeSub.subscription_plans ?? null);
                    // Force the plan name to be up to date in the salon object
                    const planName = activeSub.subscription_plans?.name || 'STARTER';
                    setSalon((prev) => prev ? { ...prev, plan: planName } : null);
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
            setPlan: (newPlan: string) => setSalon((prev) => prev ? { ...prev, plan: newPlan as SalonPlan } : null),
            primaryColor: (salon as (Salon & { primary_color?: string }) | null)?.primary_color || '#CFA76D',
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
