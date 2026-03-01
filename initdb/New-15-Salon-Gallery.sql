-- ============================================================
-- New-15-Salon-Gallery.sql
-- Salon Galerisi ve Yorum Görselleri
-- ============================================================

-- 1. SALON GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.salon_gallery (
    id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id       uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    image_url      text NOT NULL,
    display_order  integer DEFAULT 0,
    is_cover       boolean DEFAULT false,
    caption        text,
    created_at     timestamptz DEFAULT now()
);

-- 2. REVIEW IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.review_images (
    id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id    uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    image_url    text NOT NULL,
    created_at   timestamptz DEFAULT now()
);

-- 3. RLS POLICIES

-- Salon Gallery
ALTER TABLE public.salon_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "salon_gallery_public_read" ON public.salon_gallery;
CREATE POLICY "salon_gallery_public_read" ON public.salon_gallery
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "owners_manage_own_gallery" ON public.salon_gallery;
CREATE POLICY "owners_manage_own_gallery" ON public.salon_gallery
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE id = salon_id AND owner_id = auth.uid()
        )
    );

-- Review Images
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "review_images_public_read" ON public.review_images;
CREATE POLICY "review_images_public_read" ON public.review_images
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "users_manage_own_review_images" ON public.review_images;
CREATE POLICY "users_manage_own_review_images" ON public.review_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.reviews
            WHERE id = review_id AND user_id = auth.uid()
        )
    );

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_salon_gallery_salon_id ON public.salon_gallery(salon_id);
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON public.review_images(review_id);
