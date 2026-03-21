-- New-08-CRM-System.sql
-- Description: Salon sahipleri için müşteri yönetimi, notlar ve sadakat puanı altyapısı.

-- Salon-Müşteri ilişkisi (Sadakat puanı ve bloklama için)
CREATE TABLE IF NOT EXISTS salon_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    loyalty_points INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    total_appointments INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    last_visit TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(salon_id, customer_id)
);

-- Müşteri Notları (Alerjiler, tercihler vb. - Sadece ilgili salon ve personeli görür)
CREATE TABLE IF NOT EXISTS customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID REFERENCES salons(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Politikaları
ALTER TABLE salon_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

-- Salon sahibi kendi müşterilerini görebilir
CREATE POLICY "Salon owners can manage their salon customers"
ON salon_customers FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM salons
        WHERE salons.id = salon_customers.salon_id
        AND salons.owner_id = auth.uid()
    )
);

-- Salon sahibi ve personeli notları yönetebilir
CREATE POLICY "Salon staff can manage customer notes"
ON customer_notes FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM salons
        WHERE salons.id = customer_notes.salon_id
        AND salons.owner_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM staff
        WHERE staff.id = customer_notes.staff_id
        AND staff.user_id = auth.uid()
    )
);
