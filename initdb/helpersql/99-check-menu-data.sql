DO $$
DECLARE
    v_count integer;
BEGIN
    RAISE NOTICE 'Checking Master Data Tables...';

    SELECT count(*) INTO v_count FROM public.salon_types;
    RAISE NOTICE 'salon_types count: %', v_count;

    SELECT count(*) INTO v_count FROM public.service_categories;
    RAISE NOTICE 'service_categories count: %', v_count;

    SELECT count(*) INTO v_count FROM public.global_services;
    RAISE NOTICE 'global_services count: %', v_count;
    
    -- Check if columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salon_types' AND column_name='slug') THEN
        RAISE NOTICE 'salon_types.slug exists';
    ELSE
        RAISE NOTICE 'salon_types.slug MISSING';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_categories' AND column_name='name') THEN
        RAISE NOTICE 'service_categories.name exists';
    ELSE
        RAISE NOTICE 'service_categories.name MISSING';
    END IF;

END $$;
