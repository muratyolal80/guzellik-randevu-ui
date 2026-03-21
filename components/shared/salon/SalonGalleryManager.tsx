'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GalleryService, SalonDataService } from '@/services/db';
import { SalonGallery, SalonUsageStats } from '@/types';
import { supabase } from '@/lib/supabase';
import {
    Image as ImageIcon,
    X,
    Star,
    Plus,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Trophy
} from 'lucide-react';
import Image from 'next/image';

interface SalonGalleryManagerProps {
    salonId: string;
    onCoverChange?: (url: string) => void;
}

export default function SalonGalleryManager({ salonId, onCoverChange }: SalonGalleryManagerProps) {
    const [images, setImages] = useState<SalonGallery[]>([]);
    const [usageStats, setUsageStats] = useState<SalonUsageStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{ current: number, total: number } | null>(null);

    const fetchData = useCallback(async () => {
        if (!salonId) return;
        
        try {
            setLoading(true);
            setError(null);
            
            // Fetch gallery and usage stats in parallel
            const [galleryData, statsData] = await Promise.all([
                GalleryService.getSalonGallery(salonId),
                SalonDataService.getUsageStats(salonId)
            ]);
            
            setImages(galleryData);
            setUsageStats(statsData as SalonUsageStats);
        } catch (err: any) {
            console.error('Galeri verileri yüklenirken hata:', err);
            setError('Galeri ve plan bilgileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyiniz.');
        } finally {
            setLoading(false);
        }
    }, [salonId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Dynamic Limit Check
        const currentCount = images.length;
        const limit = usageStats?.limit_gallery_photos || 3;
        const remaining = limit === -1 ? 999 : limit - currentCount;

        if (limit !== -1 && files.length > remaining) {
            setError(`Paketinizde sadece ${remaining} fotoğraf yeriniz kaldı. Lütfen daha az dosya seçin veya paketinizi yükseltin.`);
            return;
        }

        setUploading(true);
        setError(null);
        setUploadProgress({ current: 0, total: files.length });

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Update progress
                setUploadProgress({ current: i + 1, total: files.length });

                // 1. Upload to Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${salonId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
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

            // Refresh both gallery and stats
            await fetchData();
            setUploadProgress(null);
        } catch (err: any) {
            console.error('Yükleme hatası:', err);
            setError('Görsel yüklenirken bir hata oluştu. Lütfen dosya boyutunu (max 5MB) kontrol edip tekrar deneyin.');
        } finally {
            setUploading(false);
            setUploadProgress(null);
            // reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return;

        try {
            await GalleryService.deleteGalleryImage(id);
            setImages(prev => prev.filter(img => img.id !== id));
            // Update usage stats count locally or refetch
            if (usageStats) {
                setUsageStats({
                    ...usageStats,
                    current_gallery_photos: Math.max(0, usageStats.current_gallery_photos - 1)
                });
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Görsel silinirken bir hata oluştu.');
        }
    };

    const handleSetCover = async (image: SalonGallery) => {
        try {
            await GalleryService.setCoverImage(salonId, image.id);

            // Notify parent to update salon cover image column
            if (onCoverChange) {
                onCoverChange(image.image_url);
            }

            // Update local state to show correct star
            setImages(prev => prev.map(img => ({
                ...img,
                is_cover: img.id === image.id
            })));
            
        } catch (err) {
            console.error('Set cover error:', err);
            alert('Kapak fotoğrafı güncellenirken bir hata oluştu.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[48px] border border-border shadow-card animate-pulse">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                <p className="text-sm font-black text-text-muted uppercase tracking-[0.2em]">Veriler Hazırlanıyor...</p>
            </div>
        );
    }

    const currentUsage = images.length;
    const limit = usageStats?.limit_gallery_photos || 0;
    const isLimitReached = limit !== -1 && currentUsage >= limit;
    const usagePercentage = limit === -1 ? 0 : (currentUsage / limit) * 100;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header / Actions / Stats */}
            <div className="bg-white p-8 md:p-10 rounded-[40px] border border-border shadow-card overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Trophy className="w-40 h-40 text-primary" />
                </div>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text-main tracking-tight leading-none">Salon Galerisi</h3>
                                <p className="text-sm text-text-muted font-bold mt-2">İşletmenizin en iyi karelerini burada sergileyin.</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="max-w-md space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Görsel Kullanımı</span>
                                <span className="text-sm font-black text-primary">
                                    {currentUsage} / {limit === -1 ? 'Sınırsız' : limit}
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50 flex">
                                <div 
                                    className={`h-full transition-all duration-1000 ${isLimitReached ? 'bg-orange-500' : 'bg-primary'}`}
                                    style={{ width: `${limit === -1 ? 100 : Math.min(100, usagePercentage)}%` }}
                                />
                            </div>
                            <p className="text-[10px] font-bold text-text-muted italic">
                                {usageStats?.plan_display_name} paketi ile {limit === -1 ? 'sınırsız' : limit} adet fotoğraf ekleyebilirsiniz.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <label className={`
                            group flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[24px] font-black shadow-xl shadow-primary/25 
                            hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap
                            ${uploading || isLimitReached ? 'opacity-50 grayscale pointer-events-none' : ''}
                        `}>
                            {uploading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Yükleniyor ({uploadProgress?.current}/{uploadProgress?.total})</span>
                                </div>
                            ) : (
                                <>
                                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                                    <span>Fotoğraf Ekle</span>
                                </>
                            )}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading || isLimitReached}
                            />
                        </label>
                        
                        {isLimitReached && (
                            <div className="flex items-center gap-2 p-4 bg-orange-50 border border-orange-100 rounded-2xl animate-bounce">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <span className="text-xs font-black text-orange-700 uppercase tracking-tight">Kapasite Doldu!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-[24px] flex items-center gap-4 text-red-700 text-sm font-black shadow-sm animate-shake">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    {error}
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                {images.map((img) => (
                    <div key={img.id} className="group relative aspect-square rounded-[32px] overflow-hidden bg-white border-4 border-white shadow-card hover:shadow-2xl hover:border-primary/20 transition-all duration-500">
                        <Image
                            src={img.image_url}
                            alt="Salon Galeri"
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-5">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleDelete(img.id)}
                                    className="p-3 bg-white/10 hover:bg-red-500 backdrop-blur-xl rounded-2xl text-white transition-all transform hover:rotate-12"
                                    title="Görseli Sil"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleSetCover(img)}
                                    className={`
                                        w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all
                                        ${img.is_cover
                                            ? 'bg-emerald-500 text-white shadow-lg'
                                            : 'bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/20'
                                        }
                                    `}
                                >
                                    {img.is_cover ? <CheckCircle2 className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                                    {img.is_cover ? 'Kapak Fotoğrafı' : 'Kapak Yap'}
                                </button>
                            </div>
                        </div>

                        {img.is_cover && (
                            <div className="absolute top-4 left-4 bg-emerald-500 text-white p-2 rounded-xl shadow-xl ring-4 ring-emerald-500/20">
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                        )}
                    </div>
                ))}

                {images.length === 0 && !uploading && (
                    <div className="col-span-full py-32 bg-white rounded-[48px] border-4 border-dashed border-border flex flex-col items-center justify-center text-center px-10 transition-colors hover:border-primary/20 hover:bg-primary/[0.01]">
                        <div className="w-24 h-24 rounded-[32px] bg-gray-50 flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 bg-primary/10 rounded-[32px] animate-ping opacity-20" />
                            <ImageIcon className="w-12 h-12 text-text-muted/30 relative" />
                        </div>
                        <h4 className="text-2xl font-black text-text-main mb-3">Henüz fotoğraf yüklenmemiş</h4>
                        <p className="text-sm text-text-muted font-bold max-w-sm leading-relaxed">
                            Müşterilerinizin salonunuzun atmosferini görmesi için en güzel fotoğraflarınızı buraya ekleyin.
                        </p>
                    </div>
                )}

                {uploading && uploadProgress && (
                    <div className="aspect-square rounded-[32px] border-4 border-dashed border-primary bg-primary/5 flex flex-col items-center justify-center gap-5 p-6 animate-pulse">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary">
                                %{Math.round((uploadProgress.current / uploadProgress.total) * 100)}
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest text-center">
                            Görsel Yükleniyor... <br/>
                            ({uploadProgress.current} / {uploadProgress.total})
                        </span>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-primary/5 to-white p-8 rounded-[40px] border border-primary/10 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-white shadow-lg flex items-center justify-center shrink-0 border border-primary/5">
                    <Star className="w-8 h-8 text-primary fill-primary/10" />
                </div>
                <div className="text-center md:text-left">
                    <h5 className="text-lg font-black text-text-main mb-2 tracking-tight">İpucu: Görsel Kalitesi Önemlidir</h5>
                    <p className="text-sm text-text-secondary font-bold leading-relaxed max-w-3xl">
                        Aydınlık ve profesyonel görünen fotoğraflar müşterilerin güvenini kazanmanıza yardımcı olur. 
                        Kapak fotoğrafı olarak salonunuzun genel atmosferini en iyi yansıtan kareyi seçmenizi öneririz.
                    </p>
                </div>
                <div className="md:ml-auto shrink-0">
                    <button className="px-6 py-3 bg-white text-primary border-2 border-primary/10 hover:border-primary/30 rounded-2xl text-xs font-black transition-all">
                        Yardım Al
                    </button>
                </div>
            </div>
        </div>
    );
}
