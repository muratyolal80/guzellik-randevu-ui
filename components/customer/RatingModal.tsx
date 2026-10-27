/**
 * Rating Modal Component
 * Triggered after appointment completion for customer feedback
 */

'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ReviewService } from '@/services/db';
import { Star } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: {
        id: string;
        customer_id?: string | null;
        customer_name?: string | null;
        customer_avatar?: string | null;
        service?: { service_name?: string | null } | null;
    };
    salonId: string;
    onSubmit?: () => void;
}

export function RatingModal({ isOpen, onClose, appointment, salonId, onSubmit }: RatingModalProps) {
    const { showToast } = useToast();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            showToast('Lütfen bir puan seçiniz.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            await ReviewService.createReview({
                salon_id: salonId,
                user_id: appointment.customer_id ?? undefined,
                user_name: appointment.customer_name || 'Misafir',
                user_avatar: appointment.customer_avatar ?? undefined,
                rating,
                comment: comment || undefined,
                appointment_id: appointment.id,
                is_verified: true
            });

            showToast('Değerlendirmeniz için teşekkürler!', 'success');
            onSubmit?.();
            onClose();
        } catch (err) {
            console.error('Review submission failed:', err);
            showToast('Değerlendirme gönderilemedi. Lütfen tekrar deneyin.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                <h2 className="text-2xl font-bold text-text-main mb-4">Deneyiminizi Değerlendirin</h2>
                <p className="text-text-secondary mb-6">
                    {appointment.service?.service_name || 'Hizmet'} hizmetimizden memnun kaldınız mı?
                </p>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            aria-label={`${star} yıldız`}
                            aria-pressed={star <= rating}
                            className="transition-all hover:scale-110"
                        >
                            <Star className={`w-9 h-9 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} aria-hidden="true" />
                        </button>
                    ))}
                </div>

                {/* Comment */}
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Yorumunuzu yazın (opsiyonel)..."
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary resize-none mb-6"
                />

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-border rounded-lg font-medium hover:bg-gray-50"
                    >
                        Şimdi Değil
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover disabled:opacity-50"
                    >
                        {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
                    </button>
                </div>
            </div>
        </div>
    );
}
