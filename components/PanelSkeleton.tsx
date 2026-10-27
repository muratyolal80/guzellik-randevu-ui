import React from 'react';
import Skeleton from '@/components/Skeleton';

/** Full-page placeholder for panel layouts while auth/profile resolves. */
export default function PanelSkeleton({ label = 'Yükleniyor' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-background flex" aria-busy="true" aria-label={label}>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-4 border-r border-border bg-surface p-6">
        <Skeleton className="h-8 w-32 mb-4" />
        {[0, 1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-9 w-full rounded-xl" />)}
      </aside>
      <main className="flex-1 p-4 sm:p-8 space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </main>
    </div>
  );
}
