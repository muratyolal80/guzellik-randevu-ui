import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';

export const metadata = {
    title: 'Sayfa Bulunamadı — Güzellik Randevu',
};

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
            <div className="w-24 h-24 rounded-[32px] bg-primary/10 text-primary flex items-center justify-center mb-8">
                <Compass className="w-12 h-12" />
            </div>
            <p className="text-7xl font-black text-primary tracking-tighter mb-2">404</p>
            <h1 className="text-2xl font-black text-text-main mb-3">Aradığınız sayfa bulunamadı</h1>
            <p className="text-text-secondary font-medium max-w-md mb-10">
                Sayfa taşınmış, kaldırılmış ya da adres yanlış yazılmış olabilir. Buradan devam edebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all"
                >
                    <Home className="w-5 h-5" /> Ana Sayfa
                </Link>
                <Link
                    href="/search"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-border bg-white text-text-main font-black hover:bg-gray-50 transition-all"
                >
                    <Search className="w-5 h-5" /> Salon Ara
                </Link>
            </div>
        </div>
    );
}
