'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface LightboxProps {
    images: string[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function Lightbox({
    images,
    currentIndex,
    isOpen,
    onClose,
    onNext,
    onPrev
}: LightboxProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, onNext, onPrev]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center animate-in fade-in duration-300"
            onClick={onClose}
        >
            <button
                className="absolute top-6 right-6 p-4 text-white hover:bg-white/10 rounded-full transition-all z-[210] group"
                onClick={onClose}
            >
                <X className="w-10 h-10 group-hover:scale-110 transition-transform" />
            </button>

            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="absolute left-6 p-4 text-white hover:bg-white/10 rounded-full transition-all z-[210] group"
                    >
                        <ChevronLeft className="w-12 h-12 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="absolute right-6 p-4 text-white hover:bg-white/10 rounded-full transition-all z-[210] group"
                    >
                        <ChevronRight className="w-12 h-12 group-hover:scale-110 transition-transform" />
                    </button>
                </>
            )}

            <div className="relative w-full h-[80vh] max-w-7xl px-4" onClick={(e) => e.stopPropagation()}>
                <Image
                    src={images[currentIndex]}
                    alt="Lightbox View"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <div className="absolute bottom-8 text-white font-bold text-sm bg-black/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
}
