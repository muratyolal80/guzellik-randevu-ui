-- Add avenue column to salons table
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS avenue character varying(255);

-- Update salon_details view to include the new column
CREATE OR REPLACE VIEW public.salon_details AS
 SELECT s.id,
    s.name,
    s.description,
    s.features,
    s.address,
    s.neighborhood,
    s.avenue,
    s.street,
    s.building_no,
    s.apartment_no,
    s.phone,
    s.geo_latitude,
    s.geo_longitude,
    s.image,
    s.is_sponsored,
    s.status,
    s.rejected_reason,
    s.owner_id,
    COALESCE(c.name, 'Bilinmiyor'::text) AS city_name,
    COALESCE(d.name, 'Bilinmiyor'::text) AS district_name,
    COALESCE(st.name, 'Genel'::text) AS type_name,
    COALESCE(st.slug, 'genel'::text) AS type_slug,
    ( SELECT array_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug, 'is_primary', sat.is_primary)) AS array_agg
           FROM (public.salon_assigned_types sat
             JOIN public.salon_types t ON ((sat.type_id = t.id)))
          WHERE (sat.salon_id = s.id)) AS assigned_types,
    0 AS review_count,
    0 AS average_rating,
    s.created_at
   FROM (((public.salons s
     LEFT JOIN public.cities c ON ((s.city_id = c.id)))
     LEFT JOIN public.districts d ON ((s.district_id = d.id)))
     LEFT JOIN public.salon_types st ON ((s.type_id = st.id)));

-- Update salon_details_with_membership view to include the new column
CREATE OR REPLACE VIEW public.salon_details_with_membership AS
 SELECT id,
    name,
    description,
    features,
    address,
    neighborhood,
    avenue,
    street,
    building_no,
    apartment_no,
    phone,
    geo_latitude,
    geo_longitude,
    image,
    is_sponsored,
    status,
    rejected_reason,
    owner_id,
    city_name,
    district_name,
    type_name,
    type_slug,
    review_count,
    average_rating,
    created_at,
    'OWNER'::text AS user_role,
    (owner_id)::text AS current_user_id
   FROM public.salon_details s;
