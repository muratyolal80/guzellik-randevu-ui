import React from 'react';
import { Calendar, Clock, MapPin, Navigation, Info, XCircle, RotateCw } from 'lucide-react';
import { Appointment, SalonDetail } from '@/types';

// Using a simplified props interface for UI mock, but compatible with core types
// Using a simplified props interface for UI mock, but compatible with core types
interface AppointmentCardProps {
    id?: string;
    salonId?: string;
    salonName: string;
    salonImage?: string;
    salonAddress?: string;
    date: string;
    time: string;
    serviceId?: string;
    serviceName: string;
    staffId?: string;
    staffName?: string;
    price?: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    onCancel?: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
    id,
    salonId,
    salonName,
    salonImage,
    salonAddress,
    date,
    time,
    serviceId,
    serviceName,
    staffId,
    staffName,
    price,
    status,
    onCancel
}) => {

    const statusConfig = {
        PENDING: { label: 'Onay Bekliyor', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
        CONFIRMED: { label: 'Onaylandı', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
        CANCELLED: { label: 'İptal Edildi', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
        COMPLETED: { label: 'Tamamlandı', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' }
    };

    const currentStatus = statusConfig[status];

    // Determine reschedule URL
    const rescheduleUrl = salonId && serviceId
        ? `/booking/${salonId}/staff?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}${id ? `&appointmentId=${id}` : ''}`
        : null;

    return (
        <div className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${status === 'CANCELLED' ? 'opacity-75' : ''}`}>
            <div className="flex flex-col md:flex-row gap-5">
                {/* Salon Image */}
                <div className="w-full md:w-32 h-32 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                    <img
                        src={salonImage || "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=200"}
                        alt={salonName}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{salonName}</h3>
                            {salonAddress && (
                                <p className="text-gray-500 text-sm mt-0.5 flex items-center">
                                    <MapPin className="w-3.5 h-3.5 mr-1" /> {salonAddress}
                                </p>
                            )}
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStatus.bg} ${currentStatus.text} border ${currentStatus.border}`}>
                            {currentStatus.label}
                        </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-700">
                        <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">{date}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="font-medium">{time}</span>
                        </div>

                        <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                            <span className="text-gray-400 mr-2">👤</span>
                            {staffName || 'Herhangi bir personel'}
                        </div>

                        {price && (
                            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg font-bold text-gray-900">
                                ₺{price}
                            </div>
                        )}
                    </div>

                    <div className="mt-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Hizmet</span>
                        <p className="font-medium text-gray-900">{serviceName}</p>
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                {status !== 'CANCELLED' && status !== 'COMPLETED' && (
                    <>
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
                        >
                            <XCircle className="w-4 h-4 mr-1.5" /> İptal Et
                        </button>
                        {rescheduleUrl && (
                            <a href={rescheduleUrl} className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-colors flex items-center shadow-amber-200">
                                <RotateCw className="w-4 h-4 mr-1.5" /> Yeniden Planla
                            </a>
                        )}
                    </>
                )}
                {(status === 'CANCELLED' || status === 'COMPLETED') && rescheduleUrl && (
                    <a href={rescheduleUrl} className="px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center">
                        <RotateCw className="w-4 h-4 mr-1.5" /> Tekrar Randevu Al
                    </a>
                )}
                {/* Fallback for when no URL is available (legacy check) */}
                {(!rescheduleUrl && (status === 'CANCELLED' || status === 'COMPLETED')) && (
                    <button className="px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                        Tekrar Randevu Al
                    </button>
                )}
            </div>
        </div>
    );
};

export default AppointmentCard;
