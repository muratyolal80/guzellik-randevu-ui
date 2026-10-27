import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Giriş Yap',
  description: 'Hesabınıza giriş yaparak randevularınızı ve favori salonlarınızı yönetin.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
