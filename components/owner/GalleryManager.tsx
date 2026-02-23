'use client';

import React, { useState, useEffect } from 'react';
import { GalleryService } from '@/services/db';
import { SalonGallery } from '@/types';
import { supabase } from '@/lib/supabase';
import {
    Image as ImageIcon,
    X,
    Star,
    Plus,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import Image from 'next/image';

interface GalleryManagerProps {
    salonId: string;
    onCoverChange?: (url: string) => void;
}

export default function GalleryManager({ salonId, onCoverChange }: GalleryManagerProps) {
    const [images, setImages] = useState<SalonGallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (salonId) {
            fetchGallery();
        }
    }, [salonId]);

    const fetchGallery = async () => {
        try {
            setLoading(true);
            const data = await GalleryService.getSalonGallery(salonId);
            setImages(data);
        } catch (err: any) {
            console.error('Gallery load error:', err);
            setError('Galeri yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // 1. Upload to Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${salonId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('salon-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('salon-images')
                    .getPublicUrl(filePath);

                // 2. Save to DB
                await GalleryService.addGalleryImage({
                    salon_id: salonId,
                    image_url: publicUrl,
                    display_order: images.length + i,
                    is_cover: false
                });
            }

            await fetchGallery();
        } catch (err: any) {
            console.error('Upload error:', err);
            setError('Görsel yüklenirken bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return;

        try {
            await GalleryService.deleteGalleryImage(id);
            setImages(prev => prev.filter(img => img.id !== id));
        } catch (err) {
            console.error('Delete error:', err);
            alert('Görsel silinirken bir hata oluştu.');
        }
    };

    const handleSetCover = async (image: SalonGallery) => {
        try {
            // 1. Set all to false
            // (Ideally done in a transaction or single update if supported, but let's be simple)
            const updatePromises = images.map(img =>
                GalleryService.updateGalleryImage(img.id, { is_cover: img.id === image.id })
            );

            await Promise.all(updatePromises);

            // 2. Notify parent to update salon cover image column
            if (onCoverChange) {
                onCoverChange(image.image_url);
            }

            await fetchGallery();
        } catch (err) {
            console.error('Set cover error:', err);
            alert('Kapak fotoğrafı güncellenirken bir hata oluştu.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-border">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Galeri Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Actions */}
            <div className="bg-white p-8 rounded-[32px] border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-black text-text-main mb-2">Salon Galerisi</h3>
                    <p className="text-sm text-text-muted font-medium">Salonunuzun kalitesini yansıtan profesyonel fotoğraflar ekleyin.</p>
                </div>

                <label className={`
                    flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 
                    hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap
                    ${uploading ? 'opacity-50 pointer-events-none' : ''}
                `}>
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    {uploading ? 'Yükleniyor...' : 'Fotoğraf Ekle'}
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                </label>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((img) => (
                    <div key={img.id} className="group relative aspect-square rounded-[24px] overflow-hidden bg-surface-alt border-2 border-border hover:border-primary transition-all shadow-sm hover:shadow-lg">
                        <Image
                            src={img.image_url}
                            alt="Gallery item"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleDelete(img.id)}
                                    className="p-2 bg-white/20 hover:bg-red-500 backdrop-blur-md rounded-xl text-white transition-all shadow-lg"
                                    title="Sil"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSetCover(img)}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                                        ${img.is_cover
                                            ? 'bg-emerald-500 text-white shadow-lg'
                                            : 'bg-white/20 hover:bg-white/40 backdrop-blur-md text-white'
                                        }
                                    `}
                                >
                                    {img.is_cover ? <CheckCircle2 className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                                    {img.is_cover ? 'Kapak Fotoğrafı' : 'Kapak Yap'}
                                </button>
                            </div>
                        </div>

                        {img.is_cover && (
                            <div className="absolute top-3 left-3 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg">
                                <Star className="w-3 h-3 fill-current" />
                            </div>
                        )}
                    </div>
                ))}

                {images.length === 0 && !uploading && (
                    <div className="col-span-full py-20 bg-white rounded-[32px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center px-6">
                        <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
                            <ImageIcon className="w-10 h-10 text-text-muted/30" />
                        </div>
                        <h4 className="text-lg font-black text-text-main mb-2">Henüz fotoğraf yok</h4>
                        <p className="text-sm text-text-muted font-medium max-w-xs">
                            Müşterilerinizin salonunuzu daha iyi tanıması için görseller yükleyin.
                        </p>
                    </div>
                )}

                {uploading && (
                    <div className="aspect-square rounded-[24px] border-2 border-dashed border-primary bg-primary/5 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Yükleniyor...</span>
                    </div>
                )}
            </div>

            <div className="bg-blue-50/50 p-6 rounded-[24px] border border-blue-100/50 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
                <div>
                    <h5 className="text-sm font-black text-blue-900 mb-1 leading-none uppercase tracking-tighter">İpucu: Kaliteli Görseller Ön Plana Çıkmanızı Sağlar</h5>
                    <p className="text-xs text-blue-700/80 font-bold leading-relaxed">
                        Işığı iyi alan, salonunuzun en güzel köşelerini gösteren fotoğraflar dönüşüm oranlarını %30'a kadar artırabilir.
                        Profesyonel çekimler müşterilerde daha yüksek güven oluşturur.
                    </p>
                </div>
            </div>
        </div>
    );
}
