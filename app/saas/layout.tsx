import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'İşletmeler İçin',
  description: 'Güzellik salonları, kuaförler ve berberler için online randevu ve salon yönetim platformu.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
