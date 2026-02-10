'use client';

import { AuthProvider } from '@/context/AuthContext';
import { TenantProvider } from '@/context/TenantContext';
import { ActiveBranchProvider } from '@/context/ActiveBranchContext';
import { BookingProvider } from '@/context/BookingContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TenantProvider>
        <ActiveBranchProvider>
          <BookingProvider>
            {children}
          </BookingProvider>
        </ActiveBranchProvider>
      </TenantProvider>
    </AuthProvider>
  );
}
