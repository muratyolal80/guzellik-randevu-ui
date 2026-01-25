'use client';

import { AuthProvider } from '@/context/AuthContext';
import { TenantProvider } from '@/context/TenantContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TenantProvider>
        {children}
      </TenantProvider>
    </AuthProvider>
  );
}
