import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Şifremi Unuttum',
  description: 'Şifre sıfırlama bağlantısı almak için e-posta adresinizi girin.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
