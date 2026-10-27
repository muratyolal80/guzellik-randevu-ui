import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'İşletme Kaydı',
  description: 'Salonunuzu kaydedin, online randevu, personel ve finans yönetimine hemen başlayın.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
