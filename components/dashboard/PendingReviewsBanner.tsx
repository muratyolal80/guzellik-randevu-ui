'use client';

import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';

interface PendingReviewsBannerProps {
    count: number;
    pending: any[];
}

export default function PendingReviewsBanner({ count, pending }: PendingReviewsBannerProps) {
    if (count === 0) return null;

    const first = pending[0];
    const salonName = first?.salon?.name || 'salon';
    const serviceName = first?.service?.global_service?.name || 'hizmeti';

    return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-amber-600" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-900">
                    {count === 1 ? (
                        <>"{salonName}" hizmetini nasıl buldun?</>
                    ) : (
                        <>{count} randevun için değerlendirme bekliyor</>
                    )}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                    Yorumun salon için değerli — diğer müşterilere yol gösterirsin.
                </p>
            </div>
            <Link
                href="/customer/appointments?tab=past"
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1 shrink-0"
            >
                Yorum Yap <ChevronRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}
