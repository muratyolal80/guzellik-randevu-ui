-- Mevcut status CHECK constraint'ini kaldır
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;

-- Yeni durumları da (TRIAL, PENDING) içerecek şekilde CHECK constraint'i yeniden ekle
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('ACTIVE', 'PENDING', 'PENDING_APPROVAL', 'CANCELLED', 'PAST_DUE', 'EXPIRED', 'TRIAL'));

-- Mevcut 'PENDING_APPROVAL' olanları sistemin kullandığı standart 'PENDING' değerine çekelim
UPDATE public.subscriptions SET status = 'PENDING' WHERE status = 'PENDING_APPROVAL';
