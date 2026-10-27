import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Salon Ara',
  description: 'Şehir, ilçe, puan ve fiyata göre kuaför, berber ve güzellik salonlarını arayın, online randevu alın.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
