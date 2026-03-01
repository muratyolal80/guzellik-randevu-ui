-- ============================================================
-- New-14-Review-Notifications.sql
-- Randevu Tamamlandığında Yorum Daveti Bildirimi
-- ============================================================

-- 1. BİLDİRİM FONKSİYONU
CREATE OR REPLACE FUNCTION public.create_review_invitation_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Eğer durum COMPLETED olarak değiştiyse bildirim oluştur
    IF (NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED')) THEN
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            type,
            related_id,
            is_read
        )
        VALUES (
            NEW.customer_id,
            'Deneyiminizi Değerlendirin! ⭐',
            'Tamamlanan randevunuz için bir yorum bırakmak ister misiniz? Geri bildiriminiz bizim için çok değerli.',
            'SYSTEM', -- veya 'REVIEW_INVITE' tipi varsa o
            NEW.id,
            false
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. TRİGGER
DROP TRIGGER IF EXISTS trg_appointment_completed_review_invite ON public.appointments;
CREATE TRIGGER trg_appointment_completed_review_invite
    AFTER UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.create_review_invitation_notification();
