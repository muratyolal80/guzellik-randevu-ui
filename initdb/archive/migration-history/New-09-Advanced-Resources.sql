-- New-09-Advanced-Resources.sql
-- Description: Gelişmiş kaynak yönetimi (koltuk/oda takibi) ve grup randevuları desteği.

-- Salon Kaynakları (Örn: Makyaj Koltuğu, VIP Oda, Lazer Cihazı)
CREATE TABLE IF NOT EXISTS salon_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    capacity INTEGER DEFAULT 1, -- Aynı anda kaç kişi/randevu kabul edebilir
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Randevulara kaynak ve katılımcı sayısı ekleme
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS resource_id UUID REFERENCES salon_resources(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS participant_count INTEGER DEFAULT 1;

-- Hizmetlere grup randevusu kapasitesi ekleme
ALTER TABLE salon_services ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 1;
ALTER TABLE salon_services ADD COLUMN IF NOT EXISTS requires_resource BOOLEAN DEFAULT FALSE;

-- RLS Politikaları
ALTER TABLE salon_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon owners can manage their resources"
ON salon_resources FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM salons
        WHERE salons.id = salon_resources.salon_id
        AND salons.owner_id = auth.uid()
    )
);

CREATE POLICY "Anyone can view active resources"
ON salon_resources FOR SELECT
USING (is_active = TRUE);
