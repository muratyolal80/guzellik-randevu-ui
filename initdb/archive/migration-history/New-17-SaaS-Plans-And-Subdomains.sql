-- Add subscription plan to salons
ALTER TABLE salons ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'ENTERPRISE'));

-- Ensure slug is unique for subdomain routing
ALTER TABLE salons ADD CONSTRAINT salons_slug_unique UNIQUE (slug);

-- Add sample comment
COMMENT ON COLUMN salons.plan IS 'Subscription plan: FREE, PRO, or ENTERPRISE';
