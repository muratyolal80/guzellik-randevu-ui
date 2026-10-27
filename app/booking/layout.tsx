import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Randevu Al',
  description: 'Hizmet, personel ve saat seçerek online randevunuzu birkaç adımda oluşturun.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
