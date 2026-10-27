import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Kayıt Ol',
  description: 'Ücretsiz hesap oluşturun, salonları keşfedin ve online randevu alın.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
