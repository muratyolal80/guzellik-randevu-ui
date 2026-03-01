'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SalonGallery } from '@/types';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import Image from 'next/image';

interface GallerySliderProps {
    images: SalonGallery[];
    salonName: string;
}

export default function GallerySlider({ images, salonName }: GallerySliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const touchStart = useRef<number | null>(null);

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (showLightbox) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showLightbox]);

    if (!images || images.length === 0) return null;

    const nextSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStart.current === null) return;
        const currentTouch = e.touches[0].clientX;
        const diff = touchStart.current - currentTouch;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            touchStart.current = null;
        }
    };

    const handleTouchEnd = () => {
        touchStart.current = null;
    };

    return (
        <div className="relative w-full h-full group overflow-hidden">
            {/* Main Image Slider */}
            <div
                className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {images.map((img, idx) => (
                    <div key={img.id} className="relative min-w-full h-full">
                        <Image
                            src={img.image_url}
                            alt={`${salonName} - ${idx + 1}`}
                            fill
                            className="object-cover"
                            priority={idx === 0}
                        />
                    </div>
                ))}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60 pointer-events-none"></div>

            {/* Controls */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-white/10"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg border border-white/10"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-white/40'}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Fullscreen Trigger */}
            <button
                onClick={() => setShowLightbox(true)}
                className="absolute top-6 right-6 p-3 rounded-2xl bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all border border-white/10 shadow-xl"
            >
                <Maximize2 className="w-5 h-5" />
            </button>

            {/* Lightbox Modal */}
            {showLightbox && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in px-4 py-8"
                    onClick={() => setShowLightbox(false)}
                >
                    <button
                        className="absolute top-6 right-6 p-3 text-white hover:bg-white/10 rounded-full transition-all z-[110]"
                        onClick={() => setShowLightbox(false)}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="absolute left-4 p-4 text-white hover:bg-white/10 rounded-full transition-all z-[110]"
                    >
                        <ChevronLeft className="w-10 h-10" />
                    </button>

                    <div className="relative w-full max-w-6xl aspect-[4/3] md:aspect-video flex items-center justify-center">
                        <Image
                            src={images[currentIndex].image_url}
                            alt={`${salonName} full view`}
                            fill
                            className="object-contain"
                        />
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="absolute right-4 p-4 text-white hover:bg-white/10 rounded-full transition-all z-[110]"
                    >
                        <ChevronRight className="w-10 h-10" />
                    </button>

                    {/* Lightbox Thumbnails */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 px-4 overflow-x-auto no-scrollbar">
                        {images.map((img, idx) => (
                            <button
                                key={img.id}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                            >
                                <Image src={img.image_url} alt="thumb" fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
