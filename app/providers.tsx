'use client';

import { AuthProvider } from '@/context/AuthContext';
import { TenantProvider } from '@/context/TenantContext';
import { BookingProvider } from '@/context/BookingContext';

import { ActiveSalonProvider } from '@/context/ActiveSalonContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ActiveSalonProvider>
        <BookingProvider>
          {children}
        </BookingProvider>
      </ActiveSalonProvider>
    </AuthProvider>
  );
}
