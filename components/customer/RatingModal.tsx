/**
 * Rating Modal Component
 * Triggered after appointment completion for customer feedback
 */

'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: any;
    salonId: string;
    onSubmit?: () => void;
}

export function RatingModal({ isOpen, onClose, appointment, salonId, onSubmit }: RatingModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('reviews')
                .insert({
                    salon_id: salonId,
                    user_id: appointment.customer_id || null,
                    user_name: appointment.customer_name,
                    rating,
                    comment: comment || null
                });

            if (error) throw error;

            alert('Değerlendirmeniz için teşekkürler!');
            onSubmit?.();
            onClose();
        } catch (err) {
            console.error('Review submission failed:', err);
            alert('Değerlendirme gönderilemedi.');
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
                            className="transition-all hover:scale-110"
                        >
                            <span className={`material-symbols-outlined text-4xl ${star <= rating ? 'text-yellow-400 filled' : 'text-gray-300'
                                }`}>
                                star
                            </span>
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
