-- New-18-Gallery-RLS.sql
-- RLS policies for salon_gallery table

-- 1. Enable RLS
ALTER TABLE public.salon_gallery ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Access
-- Allow anyone to view salon gallery images (needed for customer-facing pages)
DROP POLICY IF EXISTS "Public can view salon gallery" ON public.salon_gallery;
CREATE POLICY "Public can view salon gallery" ON public.salon_gallery
    FOR SELECT USING (true);

-- 3. Owner Manage Access
-- Allow salon owners to Insert, Update, and Delete gallery items for their own salons.
DROP POLICY IF EXISTS "Owners can manage their salon gallery" ON public.salon_gallery;
CREATE POLICY "Owners can manage their salon gallery" ON public.salon_gallery
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE salons.id = salon_gallery.salon_id
            AND salons.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE salons.id = salon_gallery.salon_id
            AND salons.owner_id = auth.uid()
        )
    );

-- 4. Grant Permissions
GRANT ALL ON public.salon_gallery TO authenticated;
GRANT SELECT ON public.salon_gallery TO anon;
