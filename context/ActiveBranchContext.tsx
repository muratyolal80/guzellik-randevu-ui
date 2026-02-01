'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { SalonDataService } from '@/services/db';
import type { SalonDetail } from '@/types';

interface ActiveBranchContextType {
    activeBranch: SalonDetail | null;
    setActiveBranch: (salon: SalonDetail | null) => void;
    branches: SalonDetail[];
    refreshBranches: () => Promise<void>;
    loading: boolean;
}

const ActiveBranchContext = createContext<ActiveBranchContextType | undefined>(undefined);

export function ActiveBranchProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [activeBranch, setActiveBranchState] = useState<SalonDetail | null>(null);
    const [branches, setBranches] = useState<SalonDetail[]>([]);
    const [loading, setLoading] = useState(true);

    // Load branches and active branch on mount
    useEffect(() => {
        if (user) {
            loadBranches();
        }
    }, [user]);

    const loadBranches = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const salons = await SalonDataService.getSalonsByOwner(user.id);
            setBranches(salons);

            // Try to restore active branch from localStorage
            const savedBranchId = localStorage.getItem(`active_branch_${user.id}`);

            if (savedBranchId) {
                const savedBranch = salons.find(s => s.id === savedBranchId);
                if (savedBranch) {
                    setActiveBranchState(savedBranch);
                } else if (salons.length > 0) {
                    // Saved branch not found, use first
                    setActiveBranchState(salons[0]);
                    localStorage.setItem(`active_branch_${user.id}`, salons[0].id);
                }
            } else if (salons.length > 0) {
                // No saved branch, use first
                setActiveBranchState(salons[0]);
                localStorage.setItem(`active_branch_${user.id}`, salons[0].id);
            }
        } catch (error) {
            console.error('Error loading branches:', error);
        } finally {
            setLoading(false);
        }
    };

    const setActiveBranch = (salon: SalonDetail | null) => {
        setActiveBranchState(salon);
        if (salon && user?.id) {
            localStorage.setItem(`active_branch_${user.id}`, salon.id);
        }
    };

    const refreshBranches = async () => {
        await loadBranches();
    };

    return (
        <ActiveBranchContext.Provider
            value={{
                activeBranch,
                setActiveBranch,
                branches,
                refreshBranches,
                loading,
            }}
        >
            {children}
        </ActiveBranchContext.Provider>
    );
}

export function useActiveBranch() {
    const context = useContext(ActiveBranchContext);
    if (context === undefined) {
        throw new Error('useActiveBranch must be used within an ActiveBranchProvider');
    }
    return context;
}
