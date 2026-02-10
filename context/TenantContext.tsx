/**
 * Tenant Context Provider
 * Provides salon_id isolation for multi-tenant operations
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface TenantContextType {
    salonId: string | null;
    loading: boolean;
    refreshSalonId: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType>({
    salonId: null,
    loading: true,
    refreshSalonId: async () => { }
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isOwner, isStaff } = useAuth();
    const [salonId, setSalonId] = useState<string | null>(null);
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
                    .select('id')
                    .eq('owner_id', user.id);

                if (error) {
                    // PGRST116 is multiple rows error which we handle by choosing one, 
                    // but other errors should be logged.
                    if (error.code !== 'PGRST116') {
                        console.error('[TenantContext] Error fetching owner salons:', error);
                    }
                    setSalonId(null);
                } else {
                    // Try to restore from localStorage to be consistent with ActiveBranchContext
                    const savedBranchId = typeof window !== 'undefined' ? localStorage.getItem(`active_branch_${user.id}`) : null;
                    const exists = data?.find(s => s.id === savedBranchId);

                    if (exists) {
                        setSalonId(exists.id);
                    } else {
                        setSalonId(data?.[0]?.id || null);
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
                } else {
                    setSalonId(data?.[0]?.salon_id || null);
                }
            }
        } catch (err) {
            console.error('[TenantContext] Unexpected error:', err);
            setSalonId(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSalonId();
    }, [user?.id, isOwner, isStaff]);

    return (
        <TenantContext.Provider value={{ salonId, loading, refreshSalonId }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
