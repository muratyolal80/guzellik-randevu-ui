'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SalonDetail } from '@/types';
import { SalonDataService } from '@/services/db';
import { useAuth } from './AuthContext';

interface ActiveSalonContextType {
    activeSalon: SalonDetail | null;
    setActiveSalon: (salon: SalonDetail | null) => void;
    isLoading: boolean;
    refreshActiveSalon: () => Promise<void>;
}

const ActiveSalonContext = createContext<ActiveSalonContextType | undefined>(undefined);

export function ActiveSalonProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [activeSalon, setActiveSalonState] = useState<SalonDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadInitialSalon = async () => {
            if (!user) {
                setActiveSalonState(null);
                setIsLoading(false);
                return;
            }

            try {
                // 1. Try to get from localStorage
                const savedSalonId = localStorage.getItem(`active_salon_${user.id}`);

                if (savedSalonId && savedSalonId !== 'undefined') {
                    const salon = await SalonDataService.getSalonById(savedSalonId);
                    if (salon) {
                        setActiveSalonState(salon);
                        setIsLoading(false);
                        return;
                    }
                }

                // 2. If nothing saved or salon not found, fetch owner's salons
                // We don't automatically pick one here to force the "Select" gate if multiple exist
                // But for MVP, if only 1 exists, we can auto-pick it
                const ownerSalons = await SalonDataService.getSalonsByOwner(user.id);
                if (ownerSalons.length === 1) {
                    const onlySalon = ownerSalons[0];
                    setActiveSalonState(onlySalon);
                    localStorage.setItem(`active_salon_${user.id}`, onlySalon.id);
                }
            } catch (err) {
                console.error('ActiveSalonContext error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialSalon();
    }, [user]);

    const setActiveSalon = (salon: SalonDetail | null) => {
        setActiveSalonState(salon);
        if (user && salon) {
            localStorage.setItem(`active_salon_${user.id}`, salon.id);
        } else if (user) {
            localStorage.removeItem(`active_salon_${user.id}`);
        }
    };

    const refreshActiveSalon = async () => {
        if (activeSalon) {
            const updated = await SalonDataService.getSalonById(activeSalon.id);
            if (updated) setActiveSalonState(updated);
        }
    };

    return (
        <ActiveSalonContext.Provider value={{ activeSalon, setActiveSalon, isLoading, refreshActiveSalon }}>
            {children}
        </ActiveSalonContext.Provider>
    );
}

export function useActiveSalon() {
    const context = useContext(ActiveSalonContext);
    if (context === undefined) {
        throw new Error('useActiveSalon must be used within an ActiveSalonProvider');
    }
    return context;
}
