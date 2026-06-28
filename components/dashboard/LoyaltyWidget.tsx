'use client';

import Link from 'next/link';
import { Trophy, Sparkles } from 'lucide-react';

interface LoyaltyWidgetProps {
    topLoyalty: { salon: any; count: number } | null;
}

/**
 * Sadakat widget'ı — en sık ziyaret edilen salonu gösterir.
 * Heuristik: 3 ziyaret = bronz, 5 = gümüş, 10 = altın (gelecek tier kuponu)
 */
export default function LoyaltyWidget({ topLoyalty }: LoyaltyWidgetProps) {
    if (!topLoyalty || topLoyalty.count < 2) {
        return (
            <div className="bg-white rounded-2xl border border-border p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-muted">
                    <Trophy className="w-4 h-4" /> SADAKAT
                </div>
                <p className="text-sm text-text-secondary">
                    Henüz favori bir salonun yok. Birkaç randevu sonrası burada en sevdiğin salon görünecek.
                </p>
            </div>
        );
    }

    const { salon, count } = topLoyalty;

    const tier =
        count >= 10
            ? { label: 'ALTIN ÜYE', emoji: '🥇', next: null, color: 'from-amber-400 to-yellow-600', shadow: 'shadow-amber-200' }
            : count >= 5
              ? { label: 'GÜMÜŞ ÜYE', emoji: '🥈', next: 10, color: 'from-slate-400 to-slate-600', shadow: 'shadow-slate-200' }
              : { label: 'BRONZ ÜYE', emoji: '🥉', next: 5, color: 'from-orange-400 to-orange-700', shadow: 'shadow-orange-200' };

    const toNext = tier.next ? tier.next - count : 0;
    const progress = tier.next ? (count / tier.next) * 100 : 100;

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tier.color} text-white p-6 shadow-lg ${tier.shadow}`}>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
            <div className="relative space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-90">
                    {tier.emoji} {tier.label}
                </div>

                <div>
                    <p className="text-xs font-bold opacity-80">EN SIK ZİYARET</p>
                    <h3 className="text-xl font-black truncate">{salon?.name || 'Salon'}</h3>
                    <p className="text-xs opacity-90 mt-0.5">{count} ziyaret</p>
                </div>

                {tier.next && (
                    <div className="space-y-1.5">
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, progress)}%` }} />
                        </div>
                        <p className="text-[11px] opacity-90 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {toNext} ziyaret daha → bir üst tier
                        </p>
                    </div>
                )}

                {salon?.id && (
                    <Link
                        href={`/salon/${salon.id}`}
                        className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 text-xs font-bold transition mt-2"
                    >
                        Salonu Aç
                    </Link>
                )}
            </div>
        </div>
    );
}
