'use client';

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Loader2, X, UploadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
    /**
     * The storage bucket to upload to
     */
    bucket: 'avatars' | 'salon-images' | 'staff-photos' | 'system-assets';
    /**
     * The current image URL to display
     */
    currentImage: string | null | undefined;
    /**
     * Callback when upload is successful
     */
    onUpload: (url: string) => void;
    /**
     * Aspect ratio for the container
     */
    aspectRatio?: 'square' | 'video' | 'wide';
    /**
     * Custom class name
     */
    className?: string;
    /**
     * Label to show when no image
     */
    label?: string;
}

export default function ImageUpload({
    bucket,
    currentImage,
    onUpload,
    aspectRatio = 'square',
    className = '',
    label = 'Resim Yükle'
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        await uploadImage(e.target.files[0]);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await uploadImage(e.dataTransfer.files[0]);
        }
    };

    const uploadImage = async (file: File) => {
        try {
            setUploading(true);

            // 1. Basic validation
            if (!file.type.startsWith('image/')) {
                alert('Lütfen geçerli bir resim dosyası seçin (JPG, PNG, WebP).');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
                return;
            }

            // 2. Create preview immediately
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // 3. User & Path setup
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('Oturum açmanız gerekiyor.');

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            // 4. Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 5. Get Public URL
            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onUpload(data.publicUrl);

        } catch (error: any) {
            console.error('Upload Error:', error);
            alert(`Yükleme hatası: ${error.message}`);
            // Revert preview on error
            setPreviewUrl(currentImage || null);
        } finally {
            setUploading(false);
        }
    };

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        // We don't delete from storage automatically, just clear UI
        setPreviewUrl(null);
        onUpload(''); 
    };

    // Aspect ratio classes
    const ratioClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        wide: 'aspect-[3/1]'
    };

    return (
        <div 
            className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all ${className} ${ratioClasses[aspectRatio]} ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
            />

            {uploading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    <span className="text-xs font-bold text-gray-500">Yükleniyor...</span>
                </div>
            )}

            {previewUrl ? (
                <>
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2">
                            <Camera className="w-4 h-4" /> Değiştir
                        </span>
                        {/* 
                         * Optional: Clear button. 
                         * Only show if we want to allow removing the image completely.
                         */}
                        {/* <button 
                            onClick={clearImage}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button> */}
                    </div>
                </>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3 p-4 text-center">
                    <div className={`p-4 rounded-full bg-gray-50 ${dragActive ? 'bg-primary/10 text-primary' : ''}`}>
                        <UploadCloud className={`w-6 h-6 ${dragActive ? 'scale-110' : ''} transition-transform`} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-600 group-hover:text-primary transition-colors">
                            {label}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-gray-400">
                            veya sürükleyip bırakın
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
