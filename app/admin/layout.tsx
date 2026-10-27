'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PanelSkeleton from '@/components/PanelSkeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect unauthenticated users to login with return URL
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Redirect authenticated but non-admin users to home
    if (!loading && user && !isAdmin) {
      router.replace('/?error=unauthorized');
    }
  }, [loading, user, isAdmin, router]);

  // Show loading skeleton while checking auth
  if (loading) return <PanelSkeleton />;

  // Placeholder while redirecting
  if (!user || !isAdmin) return <PanelSkeleton label="Yönlendiriliyor" />;

  return <>{children}</>;
}
