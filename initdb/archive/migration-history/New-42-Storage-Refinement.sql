-- =============================================================================
-- New-42-Storage-Refinement.sql
-- Storage Bucket Limitleri ve MIME Tipi Kısıtlamaları (Güncelleme)
-- =============================================================================

-- 1. System Assets Limit ve Tip Güncellemesi (PNG, JPG, WEBP, SVG, JSON)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('system-assets', 'system-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'image/gif', 'application/json'])
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Diğer bucket'ların limitlerini de garantiye alalım (Master ile senkronize olsun)
UPDATE storage.buckets SET file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'] WHERE id = 'salon-images';
UPDATE storage.buckets SET file_size_limit = 2097152, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'] WHERE id = 'staff-photos';
UPDATE storage.buckets SET file_size_limit = 1048576, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'] WHERE id = 'avatars';
UPDATE storage.buckets SET file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'] WHERE id = 'reviews';
