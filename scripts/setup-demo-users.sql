-- Set role in JWT app_metadata so middleware can read role from token without DB
UPDATE auth.users SET raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data,'{}'::jsonb), '{role}', '"SUPER_ADMIN"') WHERE email = 'admin@demo.com';
UPDATE auth.users SET raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data,'{}'::jsonb), '{role}', '"SALON_OWNER"') WHERE email = 'owner@demo.com';
UPDATE auth.users SET raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data,'{}'::jsonb), '{role}', '"STAFF"') WHERE email = 'staff@demo.com';
UPDATE auth.users SET raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data,'{}'::jsonb), '{role}', '"CUSTOMER"') WHERE email = 'customer@demo.com';

-- Create or update profiles with correct role
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT u.id, u.email,
  CASE u.email
    WHEN 'admin@demo.com' THEN 'Demo'
    WHEN 'owner@demo.com' THEN 'Demo'
    WHEN 'staff@demo.com' THEN 'Demo'
    WHEN 'customer@demo.com' THEN 'Demo'
  END AS first_name,
  CASE u.email
    WHEN 'admin@demo.com' THEN 'Admin'
    WHEN 'owner@demo.com' THEN 'Owner'
    WHEN 'staff@demo.com' THEN 'Staff'
    WHEN 'customer@demo.com' THEN 'Customer'
  END AS last_name,
  (CASE u.email
    WHEN 'admin@demo.com' THEN 'SUPER_ADMIN'
    WHEN 'owner@demo.com' THEN 'SALON_OWNER'
    WHEN 'staff@demo.com' THEN 'STAFF'
    WHEN 'customer@demo.com' THEN 'CUSTOMER'
  END)::user_role AS role
FROM auth.users u
WHERE u.email IN ('admin@demo.com','owner@demo.com','staff@demo.com','customer@demo.com')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;
