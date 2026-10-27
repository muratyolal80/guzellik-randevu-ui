import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'KVKK Veri Talebi',
  description: 'KVKK kapsamındaki kişisel veri başvurunuzu online olarak iletin.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
