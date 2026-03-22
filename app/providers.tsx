'use client';

import { AuthProvider } from '@/context/AuthContext';
import { TenantProvider } from '@/context/TenantContext';
import { ActiveBranchProvider } from '@/context/ActiveBranchContext';
import { BookingProvider } from '@/context/BookingContext';
import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TenantProvider>
        <ActiveBranchProvider>
          <BookingProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </BookingProvider>
        </ActiveBranchProvider>
      </TenantProvider>
    </AuthProvider>
  );
}
