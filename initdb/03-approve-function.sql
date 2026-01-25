CREATE OR REPLACE FUNCTION public.approve_change_request(request_id UUID)
RETURNS JSONB AS $$
DECLARE
    req public.change_requests;
    result_data JSONB;
    new_salon_id UUID;
BEGIN
    -- 1. Get request
    SELECT * INTO req FROM public.change_requests WHERE id = request_id AND status = 'PENDING';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or already processed.';
    END IF;

    -- 2. Process based on type
    CASE req.type
        WHEN 'SALON_CREATE' THEN
            INSERT INTO public.salons (
                owner_id, name, city_id, district_id, type_id, address, phone, geo_latitude, geo_longitude, image, is_sponsored, description, features
            )
            VALUES (
                req.requester_id,
                req.data->>'name',
                (req.data->>'city_id')::UUID,
                (req.data->>'district_id')::UUID,
                (req.data->>'type_id')::UUID,
                req.data->>'address',
                req.data->>'phone',
                (req.data->>'geo_latitude')::DECIMAL,
                (req.data->>'geo_longitude')::DECIMAL,
                req.data->>'image',
                COALESCE((req.data->>'is_sponsored')::BOOLEAN, false),
                req.data->>'description',
                COALESCE((req.data->'features')::JSONB, '[]'::jsonb)
            )
            RETURNING id INTO new_salon_id;
            
            -- Update request with the new salon_id
            UPDATE public.change_requests SET salon_id = new_salon_id WHERE id = request_id;
            result_data = jsonb_build_object('salon_id', new_salon_id);

        WHEN 'SALON_UPDATE' THEN
            UPDATE public.salons
            SET
                name = COALESCE(req.data->>'name', name),
                city_id = COALESCE((req.data->>'city_id')::UUID, city_id),
                district_id = COALESCE((req.data->>'district_id')::UUID, district_id),
                type_id = COALESCE((req.data->>'type_id')::UUID, type_id),
                address = COALESCE(req.data->>'address', address),
                phone = COALESCE(req.data->>'phone', phone),
                geo_latitude = COALESCE((req.data->>'geo_latitude')::DECIMAL, geo_latitude),
                geo_longitude = COALESCE((req.data->>'geo_longitude')::DECIMAL, geo_longitude),
                image = COALESCE(req.data->>'image', image),
                is_sponsored = COALESCE((req.data->>'is_sponsored')::BOOLEAN, is_sponsored),
                description = COALESCE(req.data->>'description', description),
                features = COALESCE((req.data->'features')::JSONB, features),
                updated_at = NOW()
            WHERE id = req.salon_id;
            result_data = jsonb_build_object('salon_id', req.salon_id);

        WHEN 'SERVICE_ADD' THEN
            INSERT INTO public.salon_services (salon_id, global_service_id, duration_min, price)
            VALUES (req.salon_id, (req.data->>'global_service_id')::UUID, (req.data->>'duration_min')::INTEGER, (req.data->>'price')::DECIMAL)
            RETURNING id INTO result_data;
            result_data = jsonb_build_object('service_id', result_data);

        WHEN 'SERVICE_UPDATE' THEN
            UPDATE public.salon_services
            SET
                duration_min = COALESCE((req.data->>'duration_min')::INTEGER, duration_min),
                price = COALESCE((req.data->>'price')::DECIMAL, price)
            WHERE id = (req.data->>'id')::UUID;
            result_data = jsonb_build_object('service_id', req.data->>'id');

        WHEN 'SERVICE_DELETE' THEN
            DELETE FROM public.salon_services WHERE id = (req.data->>'id')::UUID;
            result_data = jsonb_build_object('deleted_service_id', req.data->>'id');

        WHEN 'STAFF_ADD' THEN
            INSERT INTO public.staff (salon_id, name, photo, specialty, is_active, bio)
            VALUES (req.salon_id, req.data->>'name', req.data->>'photo', req.data->>'specialty', COALESCE((req.data->>'is_active')::BOOLEAN, true), req.data->>'bio')
            RETURNING id INTO result_data;
            result_data = jsonb_build_object('staff_id', result_data);

        WHEN 'STAFF_UPDATE' THEN
            UPDATE public.staff
            SET
                name = COALESCE(req.data->>'name', name),
                photo = COALESCE(req.data->>'photo', photo),
                specialty = COALESCE(req.data->>'specialty', specialty),
                is_active = COALESCE((req.data->>'is_active')::BOOLEAN, is_active),
                bio = COALESCE(req.data->>'bio', bio)
            WHERE id = (req.data->>'id')::UUID;
            result_data = jsonb_build_object('staff_id', req.data->>'id');

        WHEN 'STAFF_DELETE' THEN
            DELETE FROM public.staff WHERE id = (req.data->>'id')::UUID;
            result_data = jsonb_build_object('deleted_staff_id', req.data->>'id');

        ELSE
            RAISE EXCEPTION 'Unknown request type: %', req.type;
    END CASE;

    -- 3. Mark as approved
    UPDATE public.change_requests SET status = 'APPROVED', updated_at = NOW() WHERE id = request_id;

    RETURN result_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
