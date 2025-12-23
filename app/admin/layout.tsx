'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace('/login');
    }
  }, [loading, user, isAdmin, router]);

  if (loading) return <div>Yükleniyor...</div>;
  if (!user || !isAdmin) return <div>Yönlendiriliyor...</div>;

  return <>{children}</>;
}
