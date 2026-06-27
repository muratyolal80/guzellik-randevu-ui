'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Phone, Navigation, Scissors } from 'lucide-react';

interface CountdownBannerProps {
    appointment: any;
}

function getCountdown(start: string) {
    const target = new Date(start).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes };
}

export default function CountdownBanner({ appointment }: CountdownBannerProps) {
    const [cd, setCd] = useState<ReturnType<typeof getCountdown>>(null);

    useEffect(() => {
        if (!appointment?.start_time) return;
        const tick = () => setCd(getCountdown(appointment.start_time));
        tick();
        const id = setInterval(tick, 60_000); // her dakika güncelle
        return () => clearInterval(id);
    }, [appointment?.start_time]);

    if (!appointment || !cd) return null;

    const salon = appointment.salon;
    const serviceName = appointment.service?.global_service?.name || 'Hizmet';
    const startDate = new Date(appointment.start_time);

    // Maps + tel linkleri
    const mapsUrl = salon?.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salon.name} ${salon.address}`)}`
        : null;
    const phone = salon?.phone;

    // Urgency rengi: 24 saat altı kırmızı, 3 gün altı turuncu, üstü mavi
    const totalHours = cd.days * 24 + cd.hours;
    const urgency =
        totalHours < 24 ? 'red' : totalHours < 72 ? 'amber' : 'blue';
    const styles = {
        red: 'from-rose-500 to-red-600 shadow-rose-200',
        amber: 'from-amber-500 to-orange-600 shadow-amber-200',
        blue: 'from-blue-500 to-indigo-600 shadow-blue-200',
    }[urgency];

    return (
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${styles} text-white p-6 shadow-xl`}>
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/5 rounded-full" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-80">
                    <Calendar className="w-4 h-4" />
                    {urgency === 'red' ? 'RANDEVUN BUGÜN' : urgency === 'amber' ? 'YAKLAŞIYOR' : 'SIRADAKİ RANDEVU'}
                </div>

                <div className="flex flex-wrap items-baseline gap-4">
                    {cd.days > 0 && (
                        <div>
                            <span className="text-5xl font-black">{cd.days}</span>
                            <span className="text-sm font-bold ml-1">gün</span>
                        </div>
                    )}
                    <div>
                        <span className="text-5xl font-black">{cd.hours}</span>
                        <span className="text-sm font-bold ml-1">saat</span>
                    </div>
                    <div>
                        <span className="text-5xl font-black">{cd.minutes}</span>
                        <span className="text-sm font-bold ml-1">dk</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-lg font-bold">
                        <Scissors className="w-5 h-5 opacity-80" />
                        {salon?.name} · {serviceName}
                    </div>
                    <div className="text-sm opacity-90">
                        {startDate.toLocaleDateString('tr-TR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}{' '}
                        ·{' '}
                        {startDate.toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    <Link
                        href={`/customer/appointments`}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-bold transition flex items-center gap-2"
                    >
                        Detaylar
                    </Link>
                    {mapsUrl && (
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-bold transition flex items-center gap-2"
                        >
                            <Navigation className="w-4 h-4" /> Yol Tarifi
                        </a>
                    )}
                    {phone && (
                        <a
                            href={`tel:${phone}`}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-bold transition flex items-center gap-2"
                        >
                            <Phone className="w-4 h-4" /> Salonu Ara
                        </a>
                    )}
                    {salon?.address && (
                        <span className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-xs font-bold opacity-90 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {salon.address}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
