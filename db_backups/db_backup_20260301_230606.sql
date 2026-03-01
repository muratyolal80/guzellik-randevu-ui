--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP EVENT TRIGGER IF EXISTS pgrst_drop_watch;
DROP EVENT TRIGGER IF EXISTS pgrst_ddl_watch;
DROP EVENT TRIGGER IF EXISTS issue_pg_net_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_graphql_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_cron_access;
DROP EVENT TRIGGER IF EXISTS issue_graphql_placeholder;
DROP PUBLICATION IF EXISTS supabase_realtime_messages_publication;
DROP PUBLICATION IF EXISTS supabase_realtime;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload staff photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload salon images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;
DROP POLICY IF EXISTS "Staff photos publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Salon images publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public bucket read access" ON storage.buckets;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS users_delete_own_staff_review ON public.staff_reviews;
DROP POLICY IF EXISTS staff_reviews_public_read ON public.staff_reviews;
DROP POLICY IF EXISTS admin_manage_staff_reviews ON public.staff_reviews;
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.salon_memberships;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can terminate (delete) their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create staff reviews for own completed appointments" ON public.staff_reviews;
DROP POLICY IF EXISTS "Users can create reviews for own completed appointments" ON public.reviews;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Super admins can see all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Salons view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Salon owners manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Salon owners can see their salon transactions" ON public.transactions;
DROP POLICY IF EXISTS "Salon owners can manage their own packages" ON public.packages;
DROP POLICY IF EXISTS "Salon owners can manage their own coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public view working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Public view staff services" ON public.staff_services;
DROP POLICY IF EXISTS "Public view staff" ON public.staff;
DROP POLICY IF EXISTS "Public read service_categories" ON public.service_categories;
DROP POLICY IF EXISTS "Public read salons" ON public.salons;
DROP POLICY IF EXISTS "Public read salon_types" ON public.salon_types;
DROP POLICY IF EXISTS "Public read salon_type_categories" ON public.salon_type_categories;
DROP POLICY IF EXISTS "Public read salon_gallery" ON public.salon_gallery;
DROP POLICY IF EXISTS "Public read salon working hours" ON public.salon_working_hours;
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public read review_images" ON public.review_images;
DROP POLICY IF EXISTS "Public read global_services" ON public.global_services;
DROP POLICY IF EXISTS "Public read for favorites" ON public.favorites;
DROP POLICY IF EXISTS "Public read favorites" ON public.favorites;
DROP POLICY IF EXISTS "Public read districts" ON public.districts;
DROP POLICY IF EXISTS "Public read cities" ON public.cities;
DROP POLICY IF EXISTS "Public read access for working_hours" ON public.working_hours;
DROP POLICY IF EXISTS "Public read access for staff_services" ON public.staff_services;
DROP POLICY IF EXISTS "Public read access for staff" ON public.staff;
DROP POLICY IF EXISTS "Public read access for salon_working_hours" ON public.salon_working_hours;
DROP POLICY IF EXISTS "Public read access for salon_type_categories" ON public.salon_type_categories;
DROP POLICY IF EXISTS "Public read access for salon_memberships" ON public.salon_memberships;
DROP POLICY IF EXISTS "Public read access for salon_assigned_types" ON public.salon_assigned_types;
DROP POLICY IF EXISTS "Public read access for reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Public can view salon services" ON public.salon_services;
DROP POLICY IF EXISTS "Public can read non-sensitive platform_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Public Read Access" ON public.salon_assigned_types;
DROP POLICY IF EXISTS "Packages are viewable by everyone if active" ON public.packages;
DROP POLICY IF EXISTS "Owners manage working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Owners manage staff services" ON public.staff_services;
DROP POLICY IF EXISTS "Owners manage staff" ON public.staff;
DROP POLICY IF EXISTS "Owners manage salon_gallery" ON public.salon_gallery;
DROP POLICY IF EXISTS "Owners manage salon working hours" ON public.salon_working_hours;
DROP POLICY IF EXISTS "Owners manage own salons" ON public.salons;
DROP POLICY IF EXISTS "Owners manage own salon types" ON public.salon_assigned_types;
DROP POLICY IF EXISTS "Owners manage own salon services" ON public.salon_services;
DROP POLICY IF EXISTS "Owners manage own salon" ON public.salons;
DROP POLICY IF EXISTS "Owners manage memberships" ON public.salon_memberships;
DROP POLICY IF EXISTS "Owners can see their payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Owners can see their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Owners can see their own salon audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Owners can manage their sub-merchant info" ON public.salon_sub_merchants;
DROP POLICY IF EXISTS "Owner/Admin can manage working_hours" ON public.working_hours;
DROP POLICY IF EXISTS "Owner/Admin can manage staff_services" ON public.staff_services;
DROP POLICY IF EXISTS "Owner/Admin can manage staff" ON public.staff;
DROP POLICY IF EXISTS "Owner/Admin can manage salon_working_hours" ON public.salon_working_hours;
DROP POLICY IF EXISTS "Owner/Admin can manage salon_memberships" ON public.salon_memberships;
DROP POLICY IF EXISTS "Owner/Admin can manage salon_assigned_types" ON public.salon_assigned_types;
DROP POLICY IF EXISTS "Invite access" ON public.invites;
DROP POLICY IF EXISTS "Everyone can read active subscription_plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Customers view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Customers create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Customers can see their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Customers can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Coupons are viewable by everyone if active" ON public.coupons;
DROP POLICY IF EXISTS "Authenticated users can leave reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated insert review_images" ON public.review_images;
DROP POLICY IF EXISTS "Admins manage service_categories" ON public.service_categories;
DROP POLICY IF EXISTS "Admins manage global_services" ON public.global_services;
DROP POLICY IF EXISTS "Admins manage all working hours" ON public.working_hours;
DROP POLICY IF EXISTS "Admins manage all staff services" ON public.staff_services;
DROP POLICY IF EXISTS "Admins manage all staff" ON public.staff;
DROP POLICY IF EXISTS "Admins manage all salons" ON public.salons;
DROP POLICY IF EXISTS "Admins manage all salon working hours" ON public.salon_working_hours;
DROP POLICY IF EXISTS "Admins manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins manage all memberships" ON public.salon_memberships;
DROP POLICY IF EXISTS "Admins manage all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin can manage subscription_plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admin can manage salon_type_categories" ON public.salon_type_categories;
DROP POLICY IF EXISTS "Admin can manage payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Admin can manage all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admin can manage all sub-merchants" ON public.salon_sub_merchants;
DROP POLICY IF EXISTS "Admin can do everything on platform_settings" ON public.platform_settings;
ALTER TABLE IF EXISTS ONLY storage.vector_indexes DROP CONSTRAINT IF EXISTS vector_indexes_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS "prefixes_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS "objects_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY storage.iceberg_tables DROP CONSTRAINT IF EXISTS iceberg_tables_namespace_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.iceberg_tables DROP CONSTRAINT IF EXISTS iceberg_tables_catalog_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.iceberg_namespaces DROP CONSTRAINT IF EXISTS iceberg_namespaces_catalog_id_fkey;
ALTER TABLE IF EXISTS ONLY public.working_hours DROP CONSTRAINT IF EXISTS working_hours_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ticket_messages DROP CONSTRAINT IF EXISTS ticket_messages_ticket_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ticket_messages DROP CONSTRAINT IF EXISTS ticket_messages_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS staff_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff_services DROP CONSTRAINT IF EXISTS staff_services_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff_services DROP CONSTRAINT IF EXISTS staff_services_salon_service_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff_services DROP CONSTRAINT IF EXISTS staff_services_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS staff_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff_reviews DROP CONSTRAINT IF EXISTS staff_reviews_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff_reviews DROP CONSTRAINT IF EXISTS staff_reviews_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff_reviews DROP CONSTRAINT IF EXISTS staff_reviews_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.staff_reviews DROP CONSTRAINT IF EXISTS staff_reviews_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sms_verifications DROP CONSTRAINT IF EXISTS sms_verifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salons DROP CONSTRAINT IF EXISTS salons_type_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salons DROP CONSTRAINT IF EXISTS salons_owner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salons DROP CONSTRAINT IF EXISTS salons_district_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salons DROP CONSTRAINT IF EXISTS salons_city_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salon_working_hours DROP CONSTRAINT IF EXISTS salon_working_hours_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salon_type_categories DROP CONSTRAINT IF EXISTS salon_type_categories_salon_type_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salon_type_categories DROP CONSTRAINT IF EXISTS salon_type_categories_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salon_sub_merchants DROP CONSTRAINT IF EXISTS salon_sub_merchants_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salon_services DROP CONSTRAINT IF EXISTS salon_services_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salon_services DROP CONSTRAINT IF EXISTS salon_services_global_service_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salon_memberships DROP CONSTRAINT IF EXISTS salon_memberships_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salon_memberships DROP CONSTRAINT IF EXISTS salon_memberships_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salon_gallery DROP CONSTRAINT IF EXISTS salon_gallery_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salon_assigned_types DROP CONSTRAINT IF EXISTS salon_assigned_types_type_id_fkey;
ALTER TABLE IF EXISTS ONLY public.salon_assigned_types DROP CONSTRAINT IF EXISTS salon_assigned_types_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_images DROP CONSTRAINT IF EXISTS review_images_review_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_default_city_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payment_history DROP CONSTRAINT IF EXISTS payment_history_subscription_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payment_history DROP CONSTRAINT IF EXISTS payment_history_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payment_history DROP CONSTRAINT IF EXISTS payment_history_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.packages DROP CONSTRAINT IF EXISTS packages_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.package_services DROP CONSTRAINT IF EXISTS package_services_salon_service_id_fkey;
ALTER TABLE IF EXISTS ONLY public.package_services DROP CONSTRAINT IF EXISTS package_services_package_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.invites DROP CONSTRAINT IF EXISTS invites_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.invites DROP CONSTRAINT IF EXISTS invites_inviter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.global_services DROP CONSTRAINT IF EXISTS global_services_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.districts DROP CONSTRAINT IF EXISTS districts_city_id_fkey;
ALTER TABLE IF EXISTS ONLY public.coupons DROP CONSTRAINT IF EXISTS coupons_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.change_requests DROP CONSTRAINT IF EXISTS change_requests_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.change_requests DROP CONSTRAINT IF EXISTS change_requests_requester_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_salon_service_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_salon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointment_coupons DROP CONSTRAINT IF EXISTS appointment_coupons_coupon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.appointment_coupons DROP CONSTRAINT IF EXISTS appointment_coupons_appointment_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_oauth_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
DROP TRIGGER IF EXISTS update_objects_updated_at ON storage.objects;
DROP TRIGGER IF EXISTS prefixes_delete_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS prefixes_create_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS objects_update_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_insert_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_delete_delete_prefix ON storage.objects;
DROP TRIGGER IF EXISTS enforce_bucket_name_length_trigger ON storage.buckets;
DROP TRIGGER IF EXISTS update_salons_updated_at ON public.salons;
DROP TRIGGER IF EXISTS update_change_requests_updated_at ON public.change_requests;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
DROP TRIGGER IF EXISTS trg_staff_rating_update ON public.staff_reviews;
DROP TRIGGER IF EXISTS tr_salon_created_membership ON public.salons;
DROP TRIGGER IF EXISTS tr_auto_expire_subscription ON public.subscriptions;
DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS on_salon_created_marketplace ON public.salons;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP INDEX IF EXISTS storage.vector_indexes_name_bucket_id_idx;
DROP INDEX IF EXISTS storage.objects_bucket_id_level_idx;
DROP INDEX IF EXISTS storage.name_prefix_search;
DROP INDEX IF EXISTS storage.idx_prefixes_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name;
DROP INDEX IF EXISTS storage.idx_name_bucket_level_unique;
DROP INDEX IF EXISTS storage.idx_multipart_uploads_list;
DROP INDEX IF EXISTS storage.idx_iceberg_tables_namespace_id;
DROP INDEX IF EXISTS storage.idx_iceberg_tables_location;
DROP INDEX IF EXISTS storage.idx_iceberg_namespaces_bucket_id;
DROP INDEX IF EXISTS storage.buckets_analytics_unique_name_idx;
DROP INDEX IF EXISTS storage.bucketid_objname;
DROP INDEX IF EXISTS storage.bname;
DROP INDEX IF EXISTS public.idx_user_sessions_user_id;
DROP INDEX IF EXISTS public.idx_staff_services_staff;
DROP INDEX IF EXISTS public.idx_staff_services_service;
DROP INDEX IF EXISTS public.idx_staff_reviews_user_id;
DROP INDEX IF EXISTS public.idx_staff_reviews_staff_id;
DROP INDEX IF EXISTS public.idx_staff_reviews_appointment;
DROP INDEX IF EXISTS public.idx_sms_verifications_user_id;
DROP INDEX IF EXISTS public.idx_sms_verifications_phone;
DROP INDEX IF EXISTS public.idx_salons_status;
DROP INDEX IF EXISTS public.idx_salons_slug;
DROP INDEX IF EXISTS public.idx_salons_district_id;
DROP INDEX IF EXISTS public.idx_salons_city_id;
DROP INDEX IF EXISTS public.idx_salon_assigned_types_salon;
DROP INDEX IF EXISTS public.idx_otp_phone_expires;
DROP INDEX IF EXISTS public.idx_otp_cleanup;
DROP INDEX IF EXISTS public.idx_notification_queue_status;
DROP INDEX IF EXISTS public.idx_notification_queue_scheduled;
DROP INDEX IF EXISTS public.idx_iyzico_webhooks_created_at;
DROP INDEX IF EXISTS public.idx_audit_logs_salon_id;
DROP INDEX IF EXISTS public.idx_audit_logs_created_at;
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_pattern_idx;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_oauth_client_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.oauth_consents_user_order_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_user_client_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_client_idx;
DROP INDEX IF EXISTS auth.oauth_clients_deleted_at_idx;
DROP INDEX IF EXISTS auth.oauth_auth_pending_exp_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_oauth_client_states_created_at;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
ALTER TABLE IF EXISTS ONLY storage.vector_indexes DROP CONSTRAINT IF EXISTS vector_indexes_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_pkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS prefixes_pkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS objects_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_name_key;
ALTER TABLE IF EXISTS ONLY storage.iceberg_tables DROP CONSTRAINT IF EXISTS iceberg_tables_pkey;
ALTER TABLE IF EXISTS ONLY storage.iceberg_namespaces DROP CONSTRAINT IF EXISTS iceberg_namespaces_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets_vectors DROP CONSTRAINT IF EXISTS buckets_vectors_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets DROP CONSTRAINT IF EXISTS buckets_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets_analytics DROP CONSTRAINT IF EXISTS buckets_analytics_pkey;
ALTER TABLE IF EXISTS ONLY public.working_hours DROP CONSTRAINT IF EXISTS working_hours_staff_id_day_of_week_key;
ALTER TABLE IF EXISTS ONLY public.working_hours DROP CONSTRAINT IF EXISTS working_hours_pkey;
ALTER TABLE IF EXISTS ONLY public.user_sessions DROP CONSTRAINT IF EXISTS user_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS unique_review_per_appointment;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.ticket_messages DROP CONSTRAINT IF EXISTS ticket_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_pkey;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_salon_id_key;
ALTER TABLE IF EXISTS ONLY public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey;
ALTER TABLE IF EXISTS ONLY public.subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_name_key;
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS staff_user_id_key;
ALTER TABLE IF EXISTS ONLY public.staff_services DROP CONSTRAINT IF EXISTS staff_services_staff_id_salon_service_id_key;
ALTER TABLE IF EXISTS ONLY public.staff_services DROP CONSTRAINT IF EXISTS staff_services_pkey;
ALTER TABLE IF EXISTS ONLY public.staff_reviews DROP CONSTRAINT IF EXISTS staff_reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.staff_reviews DROP CONSTRAINT IF EXISTS staff_reviews_appointment_id_key;
ALTER TABLE IF EXISTS ONLY public.staff DROP CONSTRAINT IF EXISTS staff_pkey;
ALTER TABLE IF EXISTS ONLY public.sms_verifications DROP CONSTRAINT IF EXISTS sms_verifications_pkey;
ALTER TABLE IF EXISTS ONLY public.service_categories DROP CONSTRAINT IF EXISTS service_categories_slug_key;
ALTER TABLE IF EXISTS ONLY public.service_categories DROP CONSTRAINT IF EXISTS service_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.service_categories DROP CONSTRAINT IF EXISTS service_categories_name_key;
ALTER TABLE IF EXISTS ONLY public.salons DROP CONSTRAINT IF EXISTS salons_slug_key;
ALTER TABLE IF EXISTS ONLY public.salons DROP CONSTRAINT IF EXISTS salons_pkey;
ALTER TABLE IF EXISTS ONLY public.salon_working_hours DROP CONSTRAINT IF EXISTS salon_working_hours_salon_id_day_of_week_key;
ALTER TABLE IF EXISTS ONLY public.salon_working_hours DROP CONSTRAINT IF EXISTS salon_working_hours_pkey;
ALTER TABLE IF EXISTS ONLY public.salon_types DROP CONSTRAINT IF EXISTS salon_types_slug_key;
ALTER TABLE IF EXISTS ONLY public.salon_types DROP CONSTRAINT IF EXISTS salon_types_pkey;
ALTER TABLE IF EXISTS ONLY public.salon_types DROP CONSTRAINT IF EXISTS salon_types_name_key;
ALTER TABLE IF EXISTS ONLY public.salon_type_categories DROP CONSTRAINT IF EXISTS salon_type_categories_salon_type_id_category_id_key;
ALTER TABLE IF EXISTS ONLY public.salon_type_categories DROP CONSTRAINT IF EXISTS salon_type_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.salon_sub_merchants DROP CONSTRAINT IF EXISTS salon_sub_merchants_salon_id_key;
ALTER TABLE IF EXISTS ONLY public.salon_sub_merchants DROP CONSTRAINT IF EXISTS salon_sub_merchants_pkey;
ALTER TABLE IF EXISTS ONLY public.salon_services DROP CONSTRAINT IF EXISTS salon_services_salon_id_global_service_id_key;
ALTER TABLE IF EXISTS ONLY public.salon_services DROP CONSTRAINT IF EXISTS salon_services_pkey;
ALTER TABLE IF EXISTS ONLY public.salon_memberships DROP CONSTRAINT IF EXISTS salon_memberships_user_id_salon_id_key;
ALTER TABLE IF EXISTS ONLY public.salon_memberships DROP CONSTRAINT IF EXISTS salon_memberships_pkey;
ALTER TABLE IF EXISTS ONLY public.salon_gallery DROP CONSTRAINT IF EXISTS salon_gallery_pkey;
ALTER TABLE IF EXISTS ONLY public.salon_assigned_types DROP CONSTRAINT IF EXISTS salon_assigned_types_salon_id_type_id_key;
ALTER TABLE IF EXISTS ONLY public.salon_assigned_types DROP CONSTRAINT IF EXISTS salon_assigned_types_pkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_appointment_id_key;
ALTER TABLE IF EXISTS ONLY public.review_images DROP CONSTRAINT IF EXISTS review_images_pkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS prevent_staff_double_booking;
ALTER TABLE IF EXISTS ONLY public.platform_settings DROP CONSTRAINT IF EXISTS platform_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_history DROP CONSTRAINT IF EXISTS payment_history_pkey;
ALTER TABLE IF EXISTS ONLY public.packages DROP CONSTRAINT IF EXISTS packages_pkey;
ALTER TABLE IF EXISTS ONLY public.package_services DROP CONSTRAINT IF EXISTS package_services_pkey;
ALTER TABLE IF EXISTS ONLY public.package_services DROP CONSTRAINT IF EXISTS package_services_package_id_salon_service_id_key;
ALTER TABLE IF EXISTS ONLY public.otp_codes DROP CONSTRAINT IF EXISTS otp_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.notification_templates DROP CONSTRAINT IF EXISTS notification_templates_slug_key;
ALTER TABLE IF EXISTS ONLY public.notification_templates DROP CONSTRAINT IF EXISTS notification_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.notification_queue DROP CONSTRAINT IF EXISTS notification_queue_pkey;
ALTER TABLE IF EXISTS ONLY public.iyzico_webhooks DROP CONSTRAINT IF EXISTS iyzico_webhooks_pkey;
ALTER TABLE IF EXISTS ONLY public.iys_logs DROP CONSTRAINT IF EXISTS iys_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.invites DROP CONSTRAINT IF EXISTS invites_token_key;
ALTER TABLE IF EXISTS ONLY public.invites DROP CONSTRAINT IF EXISTS invites_pkey;
ALTER TABLE IF EXISTS ONLY public.global_services DROP CONSTRAINT IF EXISTS global_services_pkey;
ALTER TABLE IF EXISTS ONLY public.global_services DROP CONSTRAINT IF EXISTS global_services_category_id_name_key;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_salon_id_key;
ALTER TABLE IF EXISTS ONLY public.favorites DROP CONSTRAINT IF EXISTS favorites_pkey;
ALTER TABLE IF EXISTS ONLY public.districts DROP CONSTRAINT IF EXISTS districts_pkey;
ALTER TABLE IF EXISTS ONLY public.districts DROP CONSTRAINT IF EXISTS districts_city_id_name_key;
ALTER TABLE IF EXISTS ONLY public.coupons DROP CONSTRAINT IF EXISTS coupons_salon_id_code_key;
ALTER TABLE IF EXISTS ONLY public.coupons DROP CONSTRAINT IF EXISTS coupons_pkey;
ALTER TABLE IF EXISTS ONLY public.cities DROP CONSTRAINT IF EXISTS cities_plate_code_key;
ALTER TABLE IF EXISTS ONLY public.cities DROP CONSTRAINT IF EXISTS cities_pkey;
ALTER TABLE IF EXISTS ONLY public.cities DROP CONSTRAINT IF EXISTS cities_name_key;
ALTER TABLE IF EXISTS ONLY public.change_requests DROP CONSTRAINT IF EXISTS change_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.appointments DROP CONSTRAINT IF EXISTS appointments_pkey;
ALTER TABLE IF EXISTS ONLY public.appointment_coupons DROP CONSTRAINT IF EXISTS appointment_coupons_pkey;
ALTER TABLE IF EXISTS ONLY public.appointment_coupons DROP CONSTRAINT IF EXISTS appointment_coupons_appointment_id_coupon_id_key;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_client_unique;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_clients DROP CONSTRAINT IF EXISTS oauth_clients_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_client_states DROP CONSTRAINT IF EXISTS oauth_client_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_id_key;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_code_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS storage.vector_indexes;
DROP TABLE IF EXISTS storage.s3_multipart_uploads_parts;
DROP TABLE IF EXISTS storage.s3_multipart_uploads;
DROP TABLE IF EXISTS storage.prefixes;
DROP TABLE IF EXISTS storage.objects;
DROP TABLE IF EXISTS storage.migrations;
DROP TABLE IF EXISTS storage.iceberg_tables;
DROP TABLE IF EXISTS storage.iceberg_namespaces;
DROP TABLE IF EXISTS storage.buckets_vectors;
DROP TABLE IF EXISTS storage.buckets_analytics;
DROP TABLE IF EXISTS storage.buckets;
DROP TABLE IF EXISTS public.working_hours;
DROP VIEW IF EXISTS public.verified_reviews_view;
DROP TABLE IF EXISTS public.user_sessions;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.ticket_messages;
DROP TABLE IF EXISTS public.support_tickets;
DROP TABLE IF EXISTS public.staff_services;
DROP VIEW IF EXISTS public.staff_reviews_detailed;
DROP TABLE IF EXISTS public.staff_reviews;
DROP TABLE IF EXISTS public.sms_verifications;
DROP TABLE IF EXISTS public.salon_working_hours;
DROP VIEW IF EXISTS public.salon_usage_stats;
DROP TABLE IF EXISTS public.subscriptions;
DROP TABLE IF EXISTS public.subscription_plans;
DROP TABLE IF EXISTS public.staff;
DROP TABLE IF EXISTS public.salon_type_categories;
DROP TABLE IF EXISTS public.salon_sub_merchants;
DROP VIEW IF EXISTS public.salon_service_details;
DROP TABLE IF EXISTS public.service_categories;
DROP TABLE IF EXISTS public.salon_services;
DROP VIEW IF EXISTS public.salon_ratings;
DROP TABLE IF EXISTS public.salon_memberships;
DROP TABLE IF EXISTS public.salon_gallery;
DROP VIEW IF EXISTS public.salon_details;
DROP TABLE IF EXISTS public.salons;
DROP TABLE IF EXISTS public.salon_types;
DROP TABLE IF EXISTS public.salon_assigned_types;
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.review_images;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.platform_settings;
DROP TABLE IF EXISTS public.payment_history;
DROP TABLE IF EXISTS public.packages;
DROP TABLE IF EXISTS public.package_services;
DROP TABLE IF EXISTS public.otp_codes;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.notification_templates;
DROP TABLE IF EXISTS public.notification_queue;
DROP TABLE IF EXISTS public.iyzico_webhooks;
DROP TABLE IF EXISTS public.iys_logs;
DROP TABLE IF EXISTS public.invites;
DROP TABLE IF EXISTS public.global_services;
DROP TABLE IF EXISTS public.favorites;
DROP TABLE IF EXISTS public.districts;
DROP TABLE IF EXISTS public.coupons;
DROP TABLE IF EXISTS public.cities;
DROP TABLE IF EXISTS public.change_requests;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.appointments;
DROP TABLE IF EXISTS public.appointment_coupons;
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.oauth_consents;
DROP TABLE IF EXISTS auth.oauth_clients;
DROP TABLE IF EXISTS auth.oauth_client_states;
DROP TABLE IF EXISTS auth.oauth_authorizations;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP FUNCTION IF EXISTS storage.update_updated_at_column();
DROP FUNCTION IF EXISTS storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text);
DROP FUNCTION IF EXISTS storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.prefixes_insert_trigger();
DROP FUNCTION IF EXISTS storage.prefixes_delete_cleanup();
DROP FUNCTION IF EXISTS storage.operation();
DROP FUNCTION IF EXISTS storage.objects_update_prefix_trigger();
DROP FUNCTION IF EXISTS storage.objects_update_level_trigger();
DROP FUNCTION IF EXISTS storage.objects_update_cleanup();
DROP FUNCTION IF EXISTS storage.objects_insert_prefix_trigger();
DROP FUNCTION IF EXISTS storage.objects_delete_cleanup();
DROP FUNCTION IF EXISTS storage.lock_top_prefixes(bucket_ids text[], names text[]);
DROP FUNCTION IF EXISTS storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);
DROP FUNCTION IF EXISTS storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION IF EXISTS storage.get_size_by_bucket();
DROP FUNCTION IF EXISTS storage.get_prefixes(name text);
DROP FUNCTION IF EXISTS storage.get_prefix(name text);
DROP FUNCTION IF EXISTS storage.get_level(name text);
DROP FUNCTION IF EXISTS storage.foldername(name text);
DROP FUNCTION IF EXISTS storage.filename(name text);
DROP FUNCTION IF EXISTS storage.extension(name text);
DROP FUNCTION IF EXISTS storage.enforce_bucket_name_length();
DROP FUNCTION IF EXISTS storage.delete_prefix_hierarchy_trigger();
DROP FUNCTION IF EXISTS storage.delete_prefix(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS storage.delete_leaf_prefixes(bucket_ids text[], names text[]);
DROP FUNCTION IF EXISTS storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION IF EXISTS storage.add_prefixes(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.update_support_ticket_updated_at();
DROP FUNCTION IF EXISTS public.update_staff_rating();
DROP FUNCTION IF EXISTS public.resolve_own_ticket(p_ticket_id uuid);
DROP FUNCTION IF EXISTS public.request_account_deletion();
DROP FUNCTION IF EXISTS public.queue_notification(p_channel public.notification_channel, p_recipient text, p_content text, p_related_id uuid, p_related_table text, p_scheduled_for timestamp with time zone);
DROP FUNCTION IF EXISTS public.on_salon_created_add_membership();
DROP FUNCTION IF EXISTS public.is_admin_v3();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.increment_coupon_usage(p_coupon_id uuid);
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.handle_new_user_role_protection();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_salon_marketplace();
DROP FUNCTION IF EXISTS public.cleanup_expired_otps();
DROP FUNCTION IF EXISTS public.check_is_salon_owner(p_salon_id uuid, p_user_id uuid);
DROP FUNCTION IF EXISTS public.check_expired_subscriptions();
DROP FUNCTION IF EXISTS public.auto_expire_on_access();
DROP FUNCTION IF EXISTS public.approve_change_request(request_id uuid);
DROP FUNCTION IF EXISTS public.activate_salon_and_subscription(p_salon_id uuid, p_subscription_id uuid, p_admin_note text);
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS storage.buckettype;
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.salon_status;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.payment_method;
DROP TYPE IF EXISTS public.notification_status;
DROP TYPE IF EXISTS public.notification_channel;
DROP TYPE IF EXISTS public.iys_status;
DROP TYPE IF EXISTS public.iys_msg_type;
DROP TYPE IF EXISTS public.invite_status;
DROP TYPE IF EXISTS public.discount_type;
DROP TYPE IF EXISTS public.change_request_type;
DROP TYPE IF EXISTS public.change_request_status;
DROP TYPE IF EXISTS public.appt_status;
DROP TYPE IF EXISTS auth.one_time_token_type;
DROP TYPE IF EXISTS auth.oauth_response_type;
DROP TYPE IF EXISTS auth.oauth_registration_type;
DROP TYPE IF EXISTS auth.oauth_client_type;
DROP TYPE IF EXISTS auth.oauth_authorization_status;
DROP TYPE IF EXISTS auth.factor_type;
DROP TYPE IF EXISTS auth.factor_status;
DROP TYPE IF EXISTS auth.code_challenge_method;
DROP TYPE IF EXISTS auth.aal_level;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS supabase_vault;
DROP EXTENSION IF EXISTS pgjwt;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP EXTENSION IF EXISTS pg_graphql;
DROP EXTENSION IF EXISTS btree_gist;
DROP SCHEMA IF EXISTS storage;
DROP EXTENSION IF EXISTS pg_net;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: appt_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.appt_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED'
);


--
-- Name: change_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.change_request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: change_request_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.change_request_type AS ENUM (
    'SALON_CREATE',
    'SALON_UPDATE',
    'SERVICE_ADD',
    'SERVICE_UPDATE',
    'SERVICE_DELETE',
    'STAFF_ADD',
    'STAFF_UPDATE',
    'STAFF_DELETE'
);


--
-- Name: discount_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.discount_type AS ENUM (
    'PERCENTAGE',
    'FIXED'
);


--
-- Name: invite_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.invite_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'EXPIRED',
    'CANCELLED'
);


--
-- Name: iys_msg_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.iys_msg_type AS ENUM (
    'OTP',
    'INFO',
    'CAMPAIGN'
);


--
-- Name: iys_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.iys_status AS ENUM (
    'SENT',
    'FAILED',
    'DEMO'
);


--
-- Name: notification_channel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_channel AS ENUM (
    'SMS',
    'EMAIL',
    'PUSH'
);


--
-- Name: notification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'SENT',
    'FAILED'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'WALLET',
    'OTHER'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'REFUNDED',
    'FAILED'
);


--
-- Name: salon_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.salon_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SUSPENDED',
    'DRAFT',
    'SUBMITTED'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'CUSTOMER',
    'STAFF',
    'SALON_OWNER',
    'SUPER_ADMIN'
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: activate_salon_and_subscription(uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.activate_salon_and_subscription(p_salon_id uuid, p_subscription_id uuid, p_admin_note text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- 1. Activate Subscription
    UPDATE public.subscriptions
    SET 
        status = 'ACTIVE',
        updated_at = NOW()
    WHERE id = p_subscription_id;

    -- 2. Activate Salon
    UPDATE public.salons
    SET 
        status = 'APPROVED',
        is_verified = true,
        updated_at = NOW()
    WHERE id = p_salon_id;

    -- 3. Update Payment History status if applicable
    UPDATE public.payment_history
    SET 
        status = 'SUCCESS',
        metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{admin_note}', to_jsonb(p_admin_note))
    WHERE subscription_id = p_subscription_id AND status = 'PENDING';

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Activation failed: %', SQLERRM;
END;
$$;


--
-- Name: approve_change_request(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.approve_change_request(request_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
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
$$;


--
-- Name: auto_expire_on_access(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_expire_on_access() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF OLD.status = 'ACTIVE' AND OLD.current_period_end < NOW() THEN
        NEW.status := 'EXPIRED';
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: check_expired_subscriptions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_expired_subscriptions() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Update subscriptions that are past their period end and still ACTIVE
    UPDATE public.subscriptions
    SET status = 'EXPIRED',
        updated_at = NOW()
    WHERE status = 'ACTIVE'
    AND current_period_end < NOW();

    -- Assuming salons should be suspended when they don't have an active sub
    UPDATE public.salons
    SET status = 'SUSPENDED'
    FROM public.subscriptions s
    WHERE s.salon_id = public.salons.id
    AND s.status = 'EXPIRED'
    AND public.salons.status = 'APPROVED';
END;
$$;


--
-- Name: check_is_salon_owner(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_is_salon_owner(p_salon_id uuid, p_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.salon_memberships 
        WHERE salon_id = p_salon_id 
        AND user_id = p_user_id 
        AND role = 'OWNER'
        AND is_active = true
    );
END;
$$;


--
-- Name: cleanup_expired_otps(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_otps() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM public.otp_codes
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$;


--
-- Name: handle_new_salon_marketplace(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_salon_marketplace() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.salon_sub_merchants (salon_id, iban, bank_name, account_owner, status)
    VALUES (NEW.id, 'TR', '', '', 'PENDING');
    RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_role TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_full_name TEXT;
BEGIN
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    v_full_name := NEW.raw_user_meta_data->>'full_name';
    
    IF v_first_name IS NULL AND v_full_name IS NOT NULL THEN
        v_first_name := split_part(v_full_name, ' ', 1);
        v_last_name := substr(v_full_name, length(v_first_name) + 2);
    END IF;
    
    -- Role string olarak al, sonra CAST et
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER');
    
    IF v_role = 'SUPER_ADMIN' THEN
        v_role := 'CUSTOMER';
    END IF;

    INSERT INTO public.profiles (id, email, first_name, last_name, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        v_first_name,
        v_last_name,
        COALESCE(v_full_name, v_first_name || ' ' || COALESCE(v_last_name, '')),
        v_role::user_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
        last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name),
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        role = COALESCE(public.profiles.role, EXCLUDED.role),
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
        updated_at = NOW();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;


--
-- Name: handle_new_user_role_protection(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_role_protection() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Force role to 'CUSTOMER' if it's not already set via a secure process.
    -- If the user_metadata has a role, we check if it's 'CUSTOMER'.
    -- The only exception is if the role is 'SALON_OWNER' coming from our specific business registration page,
    -- but for maximum security in a public API, we usually want a separate verification or 
    -- only allow CUSTOMER by default and escalate via admin/process.
    
    -- Business Logic: For now, if no role is provided or it's not a known secure path, force CUSTOMER.
    -- (Next.js context passes metadata. For this MVP, we trust the metadata from our signup calls,
    -- but we ensure IT IS a valid role from our enum).
    
    IF NEW.raw_user_meta_data->>'role' IS NULL THEN
        NEW.raw_user_meta_data = jsonb_set(
            COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
            '{role}',
            '"CUSTOMER"'
        );
    END IF;

    -- Sync to public.profiles (This is handled by another trigger usually, but let's ensure it's safe)
    RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: increment_coupon_usage(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_coupon_usage(p_coupon_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.coupons 
    SET used_count = used_count + 1 
    WHERE id = p_coupon_id;
END;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() 
    AND role IN ('SUPER_ADMIN', 'ADMIN')
  );
END;
$$;


--
-- Name: is_admin_v3(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin_v3() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
BEGIN
  -- auth.jwt() içerisindeki email'i kontrol etmek en güvenli ve döngüye girmeyen yöntemdir
  -- Çünkü profiles tablosuna dokunmaz!
  RETURN (auth.jwt() ->> 'email') = 'admin@demo.com';
END;
$$;


--
-- Name: on_salon_created_add_membership(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.on_salon_created_add_membership() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.salon_memberships (user_id, salon_id, role, is_active)
    VALUES (NEW.owner_id, NEW.id, 'OWNER', true)
    ON CONFLICT (user_id, salon_id) DO NOTHING;
    RETURN NEW;
END;
$$;


--
-- Name: queue_notification(public.notification_channel, text, text, uuid, text, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.queue_notification(p_channel public.notification_channel, p_recipient text, p_content text, p_related_id uuid DEFAULT NULL::uuid, p_related_table text DEFAULT NULL::text, p_scheduled_for timestamp with time zone DEFAULT now()) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.notification_queue (
        channel, recipient, content, related_id, related_table, scheduled_for
    ) VALUES (
        p_channel, p_recipient, p_content, p_related_id, p_related_table, p_scheduled_for
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;


--
-- Name: request_account_deletion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.request_account_deletion() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.profiles 
    SET deleted_at = now() + interval '30 days', -- 30 days recovery period
        is_active = false
    WHERE id = auth.uid();
END;
$$;


--
-- Name: resolve_own_ticket(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.resolve_own_ticket(p_ticket_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$BEGIN UPDATE support_tickets SET status = 'RESOLVED', updated_at = NOW() WHERE id = p_ticket_id AND user_id = auth.uid(); END;$$;


--
-- Name: update_staff_rating(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_staff_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE public.staff
    SET
        rating       = (SELECT COALESCE(AVG(rating), 0) FROM public.staff_reviews WHERE staff_id = COALESCE(NEW.staff_id, OLD.staff_id)),
        review_count = (SELECT COUNT(*) FROM public.staff_reviews WHERE staff_id = COALESCE(NEW.staff_id, OLD.staff_id))
    WHERE id = COALESCE(NEW.staff_id, OLD.staff_id);
    RETURN NEW;
END;
$$;


--
-- Name: update_support_ticket_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_support_ticket_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
RETURN NEW;
END;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: appointment_coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    coupon_id uuid NOT NULL,
    discount_amount numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    customer_id uuid,
    customer_name text,
    customer_phone text,
    salon_id uuid NOT NULL,
    staff_id uuid NOT NULL,
    salon_service_id uuid NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status public.appt_status DEFAULT 'PENDING'::public.appt_status,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    coupon_code text,
    discount_amount numeric(10,2) DEFAULT 0,
    first_name text,
    last_name text,
    email text
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    user_id uuid,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    changes jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: change_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.change_requests (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    requester_id uuid NOT NULL,
    salon_id uuid,
    type public.change_request_type NOT NULL,
    data jsonb NOT NULL,
    status public.change_request_status DEFAULT 'PENDING'::public.change_request_status NOT NULL,
    admin_note text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    plate_code integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    latitude numeric(10,8),
    longitude numeric(11,8)
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid,
    code text NOT NULL,
    description text,
    discount_type public.discount_type NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    min_purchase_amount numeric(10,2) DEFAULT 0,
    max_discount_amount numeric(10,2),
    expires_at timestamp with time zone,
    usage_limit integer DEFAULT 1,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: districts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.districts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    city_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    salon_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: global_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.global_services (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    category_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    avg_duration_min integer DEFAULT 30,
    avg_price numeric(10,2) DEFAULT 0
);


--
-- Name: invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    email text NOT NULL,
    role public.user_role DEFAULT 'STAFF'::public.user_role,
    token text NOT NULL,
    status public.invite_status DEFAULT 'PENDING'::public.invite_status,
    inviter_id uuid NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    accepted_at timestamp with time zone
);


--
-- Name: iys_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.iys_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    phone text NOT NULL,
    message_type public.iys_msg_type NOT NULL,
    content text NOT NULL,
    status public.iys_status NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: iyzico_webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.iyzico_webhooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    iyzi_event_type text,
    payload jsonb NOT NULL,
    status text DEFAULT 'RECEIVED'::text,
    error_message text,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: notification_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_queue (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    channel public.notification_channel NOT NULL,
    recipient text NOT NULL,
    subject text,
    content text NOT NULL,
    status public.notification_status DEFAULT 'PENDING'::public.notification_status,
    related_id uuid,
    related_table text,
    tries integer DEFAULT 0,
    last_error text,
    scheduled_for timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_templates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    slug text NOT NULL,
    channel public.notification_channel NOT NULL,
    subject text,
    content text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'SYSTEM'::text,
    is_read boolean DEFAULT false,
    action_url text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_type_check CHECK ((type = ANY (ARRAY['SYSTEM'::text, 'REMINDER'::text, 'PROMOTION'::text, 'BOOKING'::text])))
);


--
-- Name: otp_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_codes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    phone text NOT NULL,
    code text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: package_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    package_id uuid NOT NULL,
    salon_service_id uuid NOT NULL,
    quantity integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: payment_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    subscription_id uuid,
    appointment_id uuid,
    payment_type text NOT NULL,
    payment_method text NOT NULL,
    amount integer NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    iyzico_payment_id text,
    iyzico_link_id text,
    bank_transfer_notified_at timestamp with time zone,
    bank_transfer_proof_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT payment_history_payment_method_check CHECK ((payment_method = ANY (ARRAY['IYZICO_CC'::text, 'IYZICO_LINK'::text, 'BANK_TRANSFER'::text]))),
    CONSTRAINT payment_history_payment_type_check CHECK ((payment_type = ANY (ARRAY['SUBSCRIPTION'::text, 'APPOINTMENT'::text, 'REFUND'::text]))),
    CONSTRAINT payment_history_status_check CHECK ((status = ANY (ARRAY['SUCCESS'::text, 'FAILED'::text, 'PENDING'::text, 'REFUNDED'::text])))
);


--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_settings (
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    first_name text,
    avatar_url text,
    phone text,
    role public.user_role DEFAULT 'CUSTOMER'::public.user_role,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    birth_date date,
    last_name text,
    full_name text,
    is_active boolean DEFAULT true,
    deleted_at timestamp with time zone,
    kvkk_accepted_at timestamp with time zone,
    marketing_opt_in boolean DEFAULT false,
    language_preference text DEFAULT 'tr'::text,
    default_city_id uuid
);


--
-- Name: COLUMN profiles.deleted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.deleted_at IS 'Timestamp for soft-delete';


--
-- Name: COLUMN profiles.kvkk_accepted_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.kvkk_accepted_at IS 'When the user accepted KVKK terms';


--
-- Name: COLUMN profiles.marketing_opt_in; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.profiles.marketing_opt_in IS 'User preference for marketing communications';


--
-- Name: review_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    review_id uuid NOT NULL,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    salon_id uuid NOT NULL,
    user_id uuid,
    user_name text NOT NULL,
    user_avatar text,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    appointment_id uuid,
    is_verified boolean DEFAULT false
);


--
-- Name: salon_assigned_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_assigned_types (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    salon_id uuid NOT NULL,
    type_id uuid NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: salon_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_types (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text,
    created_at timestamp with time zone DEFAULT now(),
    image text
);


--
-- Name: salons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salons (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    owner_id uuid NOT NULL,
    name text NOT NULL,
    city_id uuid NOT NULL,
    district_id uuid NOT NULL,
    type_id uuid NOT NULL,
    address text,
    phone text,
    geo_latitude numeric(10,8),
    geo_longitude numeric(11,8),
    image text,
    is_sponsored boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    description text,
    features jsonb DEFAULT '[]'::jsonb,
    status public.salon_status DEFAULT 'PENDING'::public.salon_status,
    rejected_reason text,
    neighborhood character varying(255),
    street character varying(255),
    building_no character varying(50),
    apartment_no character varying(50),
    avenue character varying(255),
    postal_code character varying(20),
    primary_color text DEFAULT '#CFA76D'::text,
    logo_url text,
    banner_url text,
    is_closed boolean DEFAULT false,
    slug text,
    min_price numeric(10,2),
    plan text DEFAULT 'STARTER'::text,
    tags text[] DEFAULT '{}'::text[],
    review_count integer DEFAULT 0,
    rating double precision DEFAULT 0,
    CONSTRAINT salons_plan_check CHECK ((plan = ANY (ARRAY['STARTER'::text, 'PRO'::text, 'ELITE'::text])))
);


--
-- Name: COLUMN salons.neighborhood; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.neighborhood IS 'Mahalle';


--
-- Name: COLUMN salons.street; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.street IS 'Sokak';


--
-- Name: COLUMN salons.building_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.building_no IS 'Bina No';


--
-- Name: COLUMN salons.apartment_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.apartment_no IS 'Daire No';


--
-- Name: COLUMN salons.avenue; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.avenue IS 'Cadde';


--
-- Name: COLUMN salons.primary_color; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.primary_color IS 'Business brand primary color (HEX)';


--
-- Name: COLUMN salons.logo_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.logo_url IS 'Business brand logo (Storage URL)';


--
-- Name: COLUMN salons.is_closed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.is_closed IS 'Salon geçici olarak kapalı mı';


--
-- Name: COLUMN salons.slug; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.slug IS 'Subdomain için URL dostu kısa ad';


--
-- Name: COLUMN salons.min_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.min_price IS 'Salondaki en düşük hizmet fiyatı (önizleme için)';


--
-- Name: COLUMN salons.plan; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.plan IS 'SaaS plan: FREE, PRO, ENTERPRISE';


--
-- Name: salon_details; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_details AS
 SELECT s.id,
    s.name,
    s.description,
    s.features,
    s.address,
    s.neighborhood,
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


--
-- Name: salon_gallery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_gallery (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    image_url text NOT NULL,
    caption text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: salon_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_memberships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    salon_id uuid NOT NULL,
    role text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT salon_memberships_role_check CHECK ((role = ANY (ARRAY['OWNER'::text, 'MANAGER'::text, 'STAFF'::text])))
);


--
-- Name: salon_ratings; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_ratings WITH (security_invoker='on') AS
 SELECT s.id AS salon_id,
    s.name AS salon_name,
    count(r.id) AS review_count,
    COALESCE(round(avg(r.rating), 1), (0)::numeric) AS average_rating
   FROM (public.salons s
     LEFT JOIN public.reviews r ON ((s.id = r.salon_id)))
  GROUP BY s.id, s.name;


--
-- Name: salon_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_services (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    salon_id uuid NOT NULL,
    global_service_id uuid NOT NULL,
    duration_min integer NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true
);


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: salon_service_details; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_service_details AS
 SELECT ss.id,
    ss.salon_id,
    ss.price,
    ss.duration_min,
    ss.is_active,
    gs.name AS service_name,
    sc.name AS category_name,
    sc.icon AS category_icon,
    sc.slug AS category_slug,
    s.name AS salon_name
   FROM (((public.salon_services ss
     JOIN public.global_services gs ON ((gs.id = ss.global_service_id)))
     JOIN public.service_categories sc ON ((sc.id = gs.category_id)))
     JOIN public.salons s ON ((s.id = ss.salon_id)));


--
-- Name: salon_sub_merchants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_sub_merchants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    iyzico_sub_merchant_key text,
    iban text NOT NULL,
    bank_name text,
    account_owner text,
    sub_merchant_type text DEFAULT 'PERSONAL'::text,
    status text DEFAULT 'PENDING'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT salon_sub_merchants_status_check CHECK ((status = ANY (ARRAY['PENDING'::text, 'ACTIVE'::text, 'REJECTED'::text]))),
    CONSTRAINT salon_sub_merchants_sub_merchant_type_check CHECK ((sub_merchant_type = ANY (ARRAY['PERSONAL'::text, 'PRIVATE_COMPANY'::text, 'LIMITED_OR_JOINT_STOCK'::text])))
);


--
-- Name: salon_type_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_type_categories (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    salon_type_id uuid NOT NULL,
    category_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    salon_id uuid NOT NULL,
    user_id uuid,
    name text NOT NULL,
    photo text,
    specialty text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    bio text,
    rating double precision DEFAULT 0,
    review_count integer DEFAULT 0
);


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    description text,
    price_monthly integer DEFAULT 0 NOT NULL,
    max_branches integer DEFAULT 1 NOT NULL,
    max_staff integer DEFAULT 3 NOT NULL,
    max_gallery_photos integer DEFAULT 3 NOT NULL,
    max_sms_monthly integer DEFAULT 0 NOT NULL,
    has_advanced_reports boolean DEFAULT false,
    has_excel_export boolean DEFAULT false,
    has_campaigns boolean DEFAULT false,
    has_sponsored boolean DEFAULT false,
    support_level text DEFAULT 'NORMAL'::text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    price_yearly integer
);


--
-- Name: COLUMN subscription_plans.price_yearly; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscription_plans.price_yearly IS 'Kuruş cinsinden yıllık abonelik ücreti.';


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    iyzico_subscription_ref text,
    payment_method text DEFAULT 'IYZICO'::text,
    current_period_start timestamp with time zone DEFAULT now(),
    current_period_end timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    billing_cycle text DEFAULT 'MONTHLY'::text,
    CONSTRAINT subscriptions_billing_cycle_check CHECK ((billing_cycle = ANY (ARRAY['MONTHLY'::text, 'YEARLY'::text]))),
    CONSTRAINT subscriptions_payment_method_check CHECK ((payment_method = ANY (ARRAY['IYZICO'::text, 'BANK_TRANSFER'::text]))),
    CONSTRAINT subscriptions_status_check CHECK ((status = ANY (ARRAY['ACTIVE'::text, 'PENDING_APPROVAL'::text, 'CANCELLED'::text, 'PAST_DUE'::text, 'EXPIRED'::text])))
);


--
-- Name: COLUMN subscriptions.billing_cycle; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.subscriptions.billing_cycle IS 'Abonelik faturalandırma periyodu (Aylık/Yıllık).';


--
-- Name: salon_usage_stats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_usage_stats AS
 SELECT s.id AS salon_id,
    s.name AS salon_name,
    sp.name AS plan_name,
    sp.display_name AS plan_display_name,
    ( SELECT count(*) AS count
           FROM public.staff
          WHERE ((staff.salon_id = s.id) AND (staff.is_active = true))) AS current_staff,
    sp.max_staff AS limit_staff,
    1 AS current_branches,
    sp.max_branches AS limit_branches,
    ( SELECT count(*) AS count
           FROM public.salon_gallery
          WHERE (salon_gallery.salon_id = s.id)) AS current_gallery_photos,
    sp.max_gallery_photos AS limit_gallery_photos,
    sp.has_advanced_reports,
    sp.has_campaigns,
    sp.has_sponsored,
    sub.status AS subscription_status,
    sub.current_period_end AS subscription_expires_at
   FROM ((public.salons s
     JOIN public.subscriptions sub ON ((sub.salon_id = s.id)))
     JOIN public.subscription_plans sp ON ((sub.plan_id = sp.id)));


--
-- Name: salon_working_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salon_working_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_closed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: sms_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sms_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    phone character varying(20) NOT NULL,
    verified_at timestamp with time zone DEFAULT now() NOT NULL,
    iys_registered boolean DEFAULT false,
    iys_registered_at timestamp with time zone,
    consent_given boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE sms_verifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.sms_verifications IS 'Tracks SMS verifications for IYS compliance and consent management';


--
-- Name: staff_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    staff_id uuid NOT NULL,
    salon_id uuid NOT NULL,
    user_id uuid,
    appointment_id uuid,
    user_name text NOT NULL,
    user_avatar text,
    rating integer NOT NULL,
    comment text,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT staff_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: staff_reviews_detailed; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.staff_reviews_detailed AS
 SELECT sr.id,
    sr.staff_id,
    sr.salon_id,
    sr.user_id,
    sr.appointment_id,
    sr.rating,
    sr.comment,
    sr.is_verified,
    sr.created_at,
    s.name AS staff_name,
    s.photo AS staff_photo,
    COALESCE(p.full_name, sr.user_name) AS user_name,
    COALESCE(p.avatar_url, sr.user_avatar) AS user_avatar
   FROM ((public.staff_reviews sr
     JOIN public.staff s ON ((s.id = sr.staff_id)))
     LEFT JOIN public.profiles p ON ((p.id = sr.user_id)));


--
-- Name: staff_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_services (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    salon_id uuid NOT NULL,
    staff_id uuid NOT NULL,
    salon_service_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'OPEN'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    category text,
    CONSTRAINT support_tickets_status_check CHECK ((status = ANY (ARRAY['OPEN'::text, 'IN_PROGRESS'::text, 'RESOLVED'::text, 'CLOSED'::text])))
);


--
-- Name: ticket_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    sender_role public.user_role NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salon_id uuid NOT NULL,
    customer_id uuid,
    appointment_id uuid,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY'::text,
    payment_method public.payment_method DEFAULT 'CASH'::public.payment_method,
    payment_status public.payment_status DEFAULT 'PENDING'::public.payment_status,
    provider_transaction_id text,
    commission_amount numeric(10,2) DEFAULT 0,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    ip_address text,
    user_agent text,
    device_name text,
    last_active_at timestamp with time zone DEFAULT now(),
    is_revoked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: verified_reviews_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.verified_reviews_view AS
 SELECT r.id,
    r.salon_id,
    r.user_id,
    r.appointment_id,
    r.rating,
    r.comment,
    r.created_at,
    COALESCE(p.full_name, r.user_name) AS user_name,
    COALESCE(p.avatar_url, r.user_avatar) AS user_avatar,
    a.start_time AS service_date,
    gs.service_name,
    (r.appointment_id IS NOT NULL) AS is_verified
   FROM (((public.reviews r
     LEFT JOIN public.profiles p ON ((p.id = r.user_id)))
     LEFT JOIN public.appointments a ON ((a.id = r.appointment_id)))
     LEFT JOIN public.salon_service_details gs ON ((gs.id = a.salon_service_id)));


--
-- Name: working_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.working_hours (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    staff_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_day_off boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: iceberg_namespaces; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.iceberg_namespaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_name text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    catalog_id uuid NOT NULL
);


--
-- Name: iceberg_tables; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.iceberg_tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    namespace_id uuid NOT NULL,
    bucket_name text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    location text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    remote_table_id text,
    shard_key text,
    shard_id text,
    catalog_id uuid NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	26ed7f56-d497-4e22-bb5e-3c51c41c4064	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"5455567877@pending.user","user_id":"28027d92-3be3-4273-9155-f81f945cdca9","user_phone":"905455567877"}}	2026-01-02 19:51:49.503729+03	
00000000-0000-0000-0000-000000000000	cc30b4ac-5eb3-499a-afbf-82309629c301	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"5455567877@pending.user","user_id":"28027d92-3be3-4273-9155-f81f945cdca9","user_phone":"905455567877"}}	2026-01-02 19:51:49.826083+03	
00000000-0000-0000-0000-000000000000	020e1cb7-b166-4ab4-b885-821d63ae6e1e	{"action":"login","actor_id":"28027d92-3be3-4273-9155-f81f945cdca9","actor_username":"905455567877","actor_via_sso":false,"log_type":"account","traits":{"provider":"phone"}}	2026-01-02 19:51:50.096766+03	
00000000-0000-0000-0000-000000000000	8a412786-520d-432f-9152-2c3e39a7ef56	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"sad@saf.com","user_id":"28027d92-3be3-4273-9155-f81f945cdca9","user_phone":"905455567877"}}	2026-01-02 19:52:00.45373+03	
00000000-0000-0000-0000-000000000000	10e6d126-bd17-450e-be0c-3d05614852a7	{"action":"token_refreshed","actor_id":"28027d92-3be3-4273-9155-f81f945cdca9","actor_username":"905455567877","actor_via_sso":false,"log_type":"token"}	2026-01-02 22:02:58.48336+03	
00000000-0000-0000-0000-000000000000	1eef6626-990c-411f-9513-8f221a3dd76c	{"action":"token_revoked","actor_id":"28027d92-3be3-4273-9155-f81f945cdca9","actor_username":"905455567877","actor_via_sso":false,"log_type":"token"}	2026-01-02 22:02:58.486496+03	
00000000-0000-0000-0000-000000000000	3666d313-db2c-4fe6-abd5-6d1086a7c7f0	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"5334565656@pending.user","user_id":"49c8fd49-1921-41b7-a9b0-df0a3bc655a4","user_phone":"905334565656"}}	2026-01-02 22:41:33.577391+03	
00000000-0000-0000-0000-000000000000	f37d033d-7b29-4800-a176-1942a64296a1	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"5334565656@pending.user","user_id":"49c8fd49-1921-41b7-a9b0-df0a3bc655a4","user_phone":"905334565656"}}	2026-01-02 22:41:33.778099+03	
00000000-0000-0000-0000-000000000000	487046c2-5726-4a08-8b1f-db5a0c9cec32	{"action":"login","actor_id":"49c8fd49-1921-41b7-a9b0-df0a3bc655a4","actor_username":"905334565656","actor_via_sso":false,"log_type":"account","traits":{"provider":"phone"}}	2026-01-02 22:41:33.953474+03	
00000000-0000-0000-0000-000000000000	5dceb616-4531-4c4e-98a6-388981998981	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"sad@sad.xom","user_id":"49c8fd49-1921-41b7-a9b0-df0a3bc655a4","user_phone":"905334565656"}}	2026-01-02 22:41:40.953574+03	
00000000-0000-0000-0000-000000000000	0e594386-c583-4f71-968d-8391e38cc264	{"action":"token_refreshed","actor_id":"49c8fd49-1921-41b7-a9b0-df0a3bc655a4","actor_username":"905334565656","actor_via_sso":false,"log_type":"token"}	2026-01-04 18:31:17.488167+03	
00000000-0000-0000-0000-000000000000	7730b017-ba61-47af-8d88-202acd373004	{"action":"token_revoked","actor_id":"49c8fd49-1921-41b7-a9b0-df0a3bc655a4","actor_username":"905334565656","actor_via_sso":false,"log_type":"token"}	2026-01-04 18:31:17.50143+03	
00000000-0000-0000-0000-000000000000	de129ca0-466f-410c-a8f4-a41ffc7a5655	{"action":"logout","actor_id":"49c8fd49-1921-41b7-a9b0-df0a3bc655a4","actor_username":"905334565656","actor_via_sso":false,"log_type":"account"}	2026-01-04 18:32:09.067761+03	
00000000-0000-0000-0000-000000000000	6138b6a7-672d-46a1-9a6c-adc726c459aa	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"5326045779@pending.user","user_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","user_phone":"905326045779"}}	2026-01-04 19:36:04.343065+03	
00000000-0000-0000-0000-000000000000	c837a6fe-ac7d-40be-9618-bee35d0b0b4c	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"5326045779@pending.user","user_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","user_phone":"905326045779"}}	2026-01-04 19:36:04.647556+03	
00000000-0000-0000-0000-000000000000	90277843-4ed7-4dc1-8473-5b05eb069e4d	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"phone"}}	2026-01-04 19:36:04.904507+03	
00000000-0000-0000-0000-000000000000	ee27a191-5dc4-4cf7-afd1-f36675f252cf	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"myolal@gmail.com","user_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","user_phone":"905326045779"}}	2026-01-04 19:36:27.548928+03	
00000000-0000-0000-0000-000000000000	66e159bc-82da-4237-8ce5-0b468d0f4330	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-04 21:56:00.88493+03	
00000000-0000-0000-0000-000000000000	1a5fea78-24bb-41a3-a749-f1ae128903bd	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-04 21:56:00.88956+03	
00000000-0000-0000-0000-000000000000	fbd7c9ff-b832-49db-9003-76cec041cb3d	{"action":"logout","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account"}	2026-01-04 22:06:20.260234+03	
00000000-0000-0000-0000-000000000000	a4c0a411-dfdc-4512-909e-e94e89267e4b	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-13 22:19:14.3256+03	
00000000-0000-0000-0000-000000000000	2b4d748d-62ba-4b46-b877-39b322022655	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-13 22:55:59.196522+03	
00000000-0000-0000-0000-000000000000	a718df85-730b-4660-aa81-8c4aa0ada235	{"action":"logout","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account"}	2026-01-13 22:58:12.407719+03	
00000000-0000-0000-0000-000000000000	63bd1c93-80bf-4b4d-9026-55631c8f6e01	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-13 22:58:26.21106+03	
00000000-0000-0000-0000-000000000000	320c3869-515e-4a66-b5e3-100e860c08c5	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-13 23:31:08.945403+03	
00000000-0000-0000-0000-000000000000	fea3463b-420d-42b9-b4db-865ffdeecb8c	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-13 23:33:11.248423+03	
00000000-0000-0000-0000-000000000000	86acc990-8729-44cb-a7ee-a0ffc2d971d4	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-13 23:35:46.603266+03	
00000000-0000-0000-0000-000000000000	1404ea21-b3ca-496c-bc54-8106604c6d95	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-13 23:36:52.465522+03	
00000000-0000-0000-0000-000000000000	2b3edc10-e493-4b4b-8bce-8716214e791f	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-14 00:17:27.899454+03	
00000000-0000-0000-0000-000000000000	4dd4e2b3-6bf2-4ef9-ac98-d2fe5dbc95bc	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 06:19:41.372345+03	
00000000-0000-0000-0000-000000000000	7ee0f58b-3cd6-4d67-a671-f27eccd71f23	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 06:19:41.376803+03	
00000000-0000-0000-0000-000000000000	0e3ea3db-221e-4c53-8b31-05df45dc1553	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-14 06:20:02.02016+03	
00000000-0000-0000-0000-000000000000	14b6eb0f-e4cb-47e6-a9c4-38abd36cc5ae	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 06:20:25.029997+03	
00000000-0000-0000-0000-000000000000	c58e6755-6855-4b51-abda-f535cdfcd3e0	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 06:20:25.032501+03	
00000000-0000-0000-0000-000000000000	bf312bdc-dc38-4950-a501-22ecd0fb446e	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 16:38:47.470717+03	
00000000-0000-0000-0000-000000000000	eef7cf7c-3777-4c6a-b662-51a0bd1d7e6f	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 16:38:47.473713+03	
00000000-0000-0000-0000-000000000000	f25b40ee-f72f-4d3f-bc77-2731165c7cf3	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 16:48:32.307519+03	
00000000-0000-0000-0000-000000000000	42c5fed5-9938-41af-ae30-ec7a4a2618ee	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 16:48:32.311469+03	
00000000-0000-0000-0000-000000000000	69fc0458-f9ae-402d-b2b2-e9d5fbe324cc	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 16:48:33.437371+03	
00000000-0000-0000-0000-000000000000	7beb8ce0-730d-4dab-8985-7a6d7c8a6cd0	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 16:48:34.256981+03	
00000000-0000-0000-0000-000000000000	85fbba93-3747-4af4-b48d-31d45eeeed79	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 17:37:10.988824+03	
00000000-0000-0000-0000-000000000000	1e9a7e9f-74b4-4a31-90ae-107c4eb83f07	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 17:37:10.991121+03	
00000000-0000-0000-0000-000000000000	9dfe09fd-c3dd-4bcd-85e4-c76822628ca3	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 21:44:11.905223+03	
00000000-0000-0000-0000-000000000000	340d6a77-094f-4c4d-b316-b842ea8cb89a	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 21:44:11.907304+03	
00000000-0000-0000-0000-000000000000	04ddc5de-7b7d-4582-a76b-33521af6bab5	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 21:46:24.919556+03	
00000000-0000-0000-0000-000000000000	4891c2b3-0da2-4610-b54c-a9544855d9ae	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 21:46:24.923547+03	
00000000-0000-0000-0000-000000000000	f17a815d-879a-42f4-af3f-a5b412ab626a	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 21:46:26.858438+03	
00000000-0000-0000-0000-000000000000	b5f83143-5ba9-42ac-a468-611dbb2e9c05	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 21:46:28.958753+03	
00000000-0000-0000-0000-000000000000	6f448053-4013-4570-aa54-e448516b3a15	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-14 21:46:49.750882+03	
00000000-0000-0000-0000-000000000000	042edb69-621a-4cd3-8525-d8ab72474fcc	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-14 21:48:46.101829+03	
00000000-0000-0000-0000-000000000000	c2632532-cda0-4861-bbd1-0dfea0c0a9d0	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-14 21:49:02.514256+03	
00000000-0000-0000-0000-000000000000	22ac9b46-41fa-489b-a1cb-e29ab5ae7c10	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 22:53:09.206277+03	
00000000-0000-0000-0000-000000000000	24e812ed-e732-46e1-aa4f-bf3ce45729ab	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-14 22:53:09.245105+03	
00000000-0000-0000-0000-000000000000	62f5fbba-47a4-42b4-9755-cb69ad4a30e4	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-14 23:12:48.668981+03	
00000000-0000-0000-0000-000000000000	e0b3798e-b2b3-4109-8a02-df4980f8b572	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-15 12:31:57.538843+03	
00000000-0000-0000-0000-000000000000	cf80180f-340c-49db-b98b-956c0397d1ff	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-15 12:31:57.543412+03	
00000000-0000-0000-0000-000000000000	13408874-2dc6-4073-b3e0-7dc11ccf1fb0	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-15 13:30:00.037122+03	
00000000-0000-0000-0000-000000000000	bd546541-ba92-4434-b9e9-9b149f13e9db	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-15 13:30:00.040318+03	
00000000-0000-0000-0000-000000000000	a70df39c-e108-4007-86d3-bb2c763d7703	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-19 22:17:48.057181+03	
00000000-0000-0000-0000-000000000000	80e3ee17-0f4f-4010-90f0-0a64262bc6f2	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-19 22:29:06.334287+03	
00000000-0000-0000-0000-000000000000	a10c75c3-2716-4f07-8f24-0511ba50225e	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-19 22:29:06.348619+03	
00000000-0000-0000-0000-000000000000	eb5c63d3-a4db-43e6-b3fe-2a912f57428d	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-19 22:29:06.920274+03	
00000000-0000-0000-0000-000000000000	8b5eb7b9-4146-46d4-87c1-2d81f79ba97b	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-19 22:29:08.076115+03	
00000000-0000-0000-0000-000000000000	45cf5f72-3e44-410a-a71c-900ad0a31bac	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-19 22:29:08.674639+03	
00000000-0000-0000-0000-000000000000	b686f9be-4c28-4e65-9397-b9a7ce5e0515	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-19 22:29:10.539608+03	
00000000-0000-0000-0000-000000000000	d6ecee0c-969a-4dcd-aa12-18f4671cf78b	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-19 22:29:11.093651+03	
00000000-0000-0000-0000-000000000000	7064181b-2485-4d02-9742-664c75ae989d	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-19 22:29:12.301443+03	
00000000-0000-0000-0000-000000000000	ee6488cf-f276-4937-90f4-3727ea0432bd	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-19 22:29:13.518837+03	
00000000-0000-0000-0000-000000000000	7829b831-2987-4138-b872-3364a8b2b29d	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-19 22:30:32.278953+03	
00000000-0000-0000-0000-000000000000	209d39dc-801c-4e00-b53f-69671a37f071	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-19 22:30:32.284156+03	
00000000-0000-0000-0000-000000000000	22766e23-ccac-4d14-b878-8224967ec118	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-24 17:24:22.28862+03	
00000000-0000-0000-0000-000000000000	143cfae0-0088-400e-9b47-74d859d7ac1a	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-24 17:24:22.293838+03	
00000000-0000-0000-0000-000000000000	4584988a-0fa9-408f-9156-df8e001db35d	{"action":"token_refreshed","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-24 18:22:33.513464+03	
00000000-0000-0000-0000-000000000000	c516b1ac-df0f-4b0c-bacf-bfcb7a1c815c	{"action":"token_revoked","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"token"}	2026-01-24 18:22:33.51705+03	
00000000-0000-0000-0000-000000000000	b7c90515-5d9c-495e-b54c-298c223cf3dc	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-24 22:54:10.293988+03	
00000000-0000-0000-0000-000000000000	6241fc9f-db62-47ae-86cc-da6355b12530	{"action":"logout","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account"}	2026-01-24 23:06:13.598713+03	
00000000-0000-0000-0000-000000000000	42873cfb-58d8-48c9-b50b-043a5a67b523	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@demo.com","user_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","user_phone":""}}	2026-01-24 23:19:15.318545+03	
00000000-0000-0000-0000-000000000000	04c24f9b-9a4c-4766-b694-aed69bb925c5	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"owner@demo.com","user_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","user_phone":""}}	2026-01-24 23:19:15.646526+03	
00000000-0000-0000-0000-000000000000	c475c5bd-f0fb-4af3-8192-ab044944dea2	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"staff@demo.com","user_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","user_phone":""}}	2026-01-24 23:19:15.942935+03	
00000000-0000-0000-0000-000000000000	37764892-1e91-4ad4-8a99-4047cddfc3d4	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"customer@demo.com","user_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","user_phone":""}}	2026-01-24 23:19:16.220916+03	
00000000-0000-0000-0000-000000000000	401ec4c7-d165-4570-87b6-5b6dc7e8a390	{"action":"login","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-24 23:20:19.396962+03	
00000000-0000-0000-0000-000000000000	73224537-8f6d-41dc-a973-d002f6fa8569	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"5326045780@pending.user","user_id":"2720fc9a-e89a-410c-a613-38834fb1669a","user_phone":"905326045780"}}	2026-01-24 23:21:52.460405+03	
00000000-0000-0000-0000-000000000000	b32b1f2d-e2dd-4509-bb1d-479be353b2bf	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"5326045780@pending.user","user_id":"2720fc9a-e89a-410c-a613-38834fb1669a","user_phone":"905326045780"}}	2026-01-24 23:21:52.675286+03	
00000000-0000-0000-0000-000000000000	2be605d3-4b9e-41af-a215-e50d9fcf2fd4	{"action":"login","actor_id":"2720fc9a-e89a-410c-a613-38834fb1669a","actor_username":"905326045780","actor_via_sso":false,"log_type":"account","traits":{"provider":"phone"}}	2026-01-24 23:21:52.866983+03	
00000000-0000-0000-0000-000000000000	2ed802f9-3fcd-4841-a00e-c81c1e7e3133	{"action":"logout","actor_id":"2720fc9a-e89a-410c-a613-38834fb1669a","actor_username":"905326045780","actor_via_sso":false,"log_type":"account"}	2026-01-24 23:43:35.003687+03	
00000000-0000-0000-0000-000000000000	a6288364-4668-4461-a87d-4a05156c982c	{"action":"login","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-24 23:43:55.264906+03	
00000000-0000-0000-0000-000000000000	bd4a8de2-6f44-4a49-8eea-1535ec529981	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"5324565577@pending.user","user_id":"743cd2aa-3ce6-4e49-8120-7c45e021e411","user_phone":"905324565577"}}	2026-01-25 00:15:53.18589+03	
00000000-0000-0000-0000-000000000000	08b23ba4-16d9-4868-a0bc-a91b5ba6ee33	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"5324565577@pending.user","user_id":"743cd2aa-3ce6-4e49-8120-7c45e021e411","user_phone":"905324565577"}}	2026-01-25 00:15:53.428823+03	
00000000-0000-0000-0000-000000000000	c239d4e5-4025-4c47-8c02-2cad23400ec3	{"action":"login","actor_id":"743cd2aa-3ce6-4e49-8120-7c45e021e411","actor_username":"905324565577","actor_via_sso":false,"log_type":"account","traits":{"provider":"phone"}}	2026-01-25 00:15:53.669344+03	
00000000-0000-0000-0000-000000000000	8f3fc0ff-ef7a-47cc-ba14-6b9bfd6c8df1	{"action":"logout","actor_id":"743cd2aa-3ce6-4e49-8120-7c45e021e411","actor_username":"905324565577","actor_via_sso":false,"log_type":"account"}	2026-01-25 00:20:06.74227+03	
00000000-0000-0000-0000-000000000000	600792ab-1c95-4b61-b112-6185a235c8e2	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"5324443322@pending.user","user_id":"aa084b47-7c37-43ee-8901-75bdb1cdcb68","user_phone":"905324443322"}}	2026-01-25 00:22:43.860386+03	
00000000-0000-0000-0000-000000000000	f3a524f7-3bc9-45a2-a6be-de6ee8ea9903	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"5324443322@pending.user","user_id":"aa084b47-7c37-43ee-8901-75bdb1cdcb68","user_phone":"905324443322"}}	2026-01-25 00:22:44.149286+03	
00000000-0000-0000-0000-000000000000	3da654e1-2252-451a-a375-11def3ae38a5	{"action":"login","actor_id":"aa084b47-7c37-43ee-8901-75bdb1cdcb68","actor_username":"905324443322","actor_via_sso":false,"log_type":"account","traits":{"provider":"phone"}}	2026-01-25 00:22:44.348867+03	
00000000-0000-0000-0000-000000000000	bff2bca4-9f9c-4c1a-aef0-48a495a5d4c8	{"action":"logout","actor_id":"aa084b47-7c37-43ee-8901-75bdb1cdcb68","actor_username":"905324443322","actor_via_sso":false,"log_type":"account"}	2026-01-25 00:27:07.612775+03	
00000000-0000-0000-0000-000000000000	fb1584c7-1fe6-4a3f-8abc-b68907cdeff8	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"5432346677@pending.user","user_id":"a7f8376d-d486-49aa-8fd5-9202c47e9145","user_phone":"905432346677"}}	2026-01-25 00:27:41.454481+03	
00000000-0000-0000-0000-000000000000	2b4da296-7bd6-4fa8-92a6-73891ce87447	{"action":"user_modified","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"user","traits":{"user_email":"5432346677@pending.user","user_id":"a7f8376d-d486-49aa-8fd5-9202c47e9145","user_phone":"905432346677"}}	2026-01-25 00:27:41.650285+03	
00000000-0000-0000-0000-000000000000	554b9bb5-8dff-4b22-aed1-1aaced804fa7	{"action":"login","actor_id":"a7f8376d-d486-49aa-8fd5-9202c47e9145","actor_username":"905432346677","actor_via_sso":false,"log_type":"account","traits":{"provider":"phone"}}	2026-01-25 00:27:41.828903+03	
00000000-0000-0000-0000-000000000000	87c720de-ab5f-4ba4-b665-c3e165a9e356	{"action":"logout","actor_id":"a7f8376d-d486-49aa-8fd5-9202c47e9145","actor_username":"905432346677","actor_via_sso":false,"log_type":"account"}	2026-01-25 00:30:11.348648+03	
00000000-0000-0000-0000-000000000000	68f8d856-25f1-4273-92e8-9efb55e4cf3e	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 00:30:39.248601+03	
00000000-0000-0000-0000-000000000000	57e0c39c-51be-4b6d-b3d7-62d1109db102	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 00:37:45.835306+03	
00000000-0000-0000-0000-000000000000	95e34bfd-119f-4087-a713-c4ef1909f5aa	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 00:38:10.471416+03	
00000000-0000-0000-0000-000000000000	5716ad36-6644-4871-bcbf-fc5537b6ceca	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 00:38:16.06041+03	
00000000-0000-0000-0000-000000000000	520f904c-b8b3-45ca-a6c7-f88b758aed2e	{"action":"login","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 00:47:05.8338+03	
00000000-0000-0000-0000-000000000000	0ee0196f-2fb2-468c-b4a1-05a5fe342606	{"action":"logout","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 00:47:12.931084+03	
00000000-0000-0000-0000-000000000000	026041c6-6e86-4a2d-a26c-ba0bf6f551db	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 00:47:24.96626+03	
00000000-0000-0000-0000-000000000000	8a37053f-772c-474d-aac9-3fdbc086bbd7	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 00:49:45.598735+03	
00000000-0000-0000-0000-000000000000	2c71ad61-8779-4541-a018-a3d68f60d620	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 00:49:58.228165+03	
00000000-0000-0000-0000-000000000000	4d9c3b3e-7595-4e5b-9a7b-43c01b233954	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 00:52:36.546246+03	
00000000-0000-0000-0000-000000000000	2cb58fe0-c4b1-4451-b9a2-d2e961943825	{"action":"login","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 00:52:48.319123+03	
00000000-0000-0000-0000-000000000000	4d453fa3-6b18-4d5d-b89c-cd35673b3cae	{"action":"logout","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 01:03:49.358045+03	
00000000-0000-0000-0000-000000000000	8afeaf65-06e4-403e-8c7b-6486835d30db	{"action":"login","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 01:04:08.674074+03	
00000000-0000-0000-0000-000000000000	274ea8ae-e991-4b6e-ba6d-f345bd80adca	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 01:33:06.287713+03	
00000000-0000-0000-0000-000000000000	3b41806e-387f-4d39-9234-329a69246b14	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 01:33:49.575707+03	
00000000-0000-0000-0000-000000000000	87771683-e218-4ee8-a600-bfd8a934fee5	{"action":"login","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 01:35:07.432304+03	
00000000-0000-0000-0000-000000000000	ac6c69e6-1e1f-4b12-820e-d9aa275a375e	{"action":"logout","actor_id":"f9821af5-3930-4a83-8de9-8d434e7155aa","actor_username":"905326045779","actor_via_sso":false,"log_type":"account"}	2026-01-25 01:35:16.811631+03	
00000000-0000-0000-0000-000000000000	715226ae-fa7c-4b85-bd0e-c7070a4fa35e	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 01:35:28.858462+03	
00000000-0000-0000-0000-000000000000	fd96e143-b373-42c9-a485-47ddaca4d76a	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 01:40:21.701579+03	
00000000-0000-0000-0000-000000000000	d57d92dc-bf88-4933-abe8-27f68e530b4d	{"action":"token_refreshed","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-25 11:48:45.753917+03	
00000000-0000-0000-0000-000000000000	69d41766-d349-426c-93d3-1b1b023b7c21	{"action":"token_revoked","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-25 11:48:45.758791+03	
00000000-0000-0000-0000-000000000000	a44f9b46-c599-4092-ae57-17a974ea2979	{"action":"logout","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 11:53:09.780837+03	
00000000-0000-0000-0000-000000000000	dd9f00d2-03a8-4a54-bacf-c0c424b879aa	{"action":"login","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 11:56:02.630837+03	
00000000-0000-0000-0000-000000000000	907c2f8e-c392-4243-9ca8-e58f379a359e	{"action":"logout","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 11:56:33.063086+03	
00000000-0000-0000-0000-000000000000	eda80e16-60ec-4cbb-9d93-7040c661d9e8	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 11:56:49.670479+03	
00000000-0000-0000-0000-000000000000	60edc687-370f-4672-a18d-ade6eee6a191	{"action":"logout","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 11:57:42.538984+03	
00000000-0000-0000-0000-000000000000	4c9af94b-5340-440b-8d14-5c0233651fe0	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 11:57:50.142888+03	
00000000-0000-0000-0000-000000000000	ba792115-13c7-4f84-a2aa-d08191791e09	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 11:59:55.835489+03	
00000000-0000-0000-0000-000000000000	d0ea6d10-ac3f-4676-95df-231eeb5fc86e	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 12:03:11.632981+03	
00000000-0000-0000-0000-000000000000	a798d626-112d-4cfa-8eb6-ac1d36550873	{"action":"login","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 12:03:39.511725+03	
00000000-0000-0000-0000-000000000000	7507bfe8-0340-4f84-93c3-927068d87e59	{"action":"logout","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 12:18:19.040245+03	
00000000-0000-0000-0000-000000000000	0353509f-b2f2-4920-a39a-4422cf4086f6	{"action":"login","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 12:28:06.451451+03	
00000000-0000-0000-0000-000000000000	70306d8e-beee-4b7f-b2e8-e29aa5064299	{"action":"logout","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 12:28:29.652669+03	
00000000-0000-0000-0000-000000000000	18621ffd-7134-4129-a7aa-e4749ac973aa	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 12:28:36.830261+03	
00000000-0000-0000-0000-000000000000	a85f87b7-9e84-4284-9d1d-066f4d67b6e3	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 12:29:18.99548+03	
00000000-0000-0000-0000-000000000000	c761846b-771a-4ad5-8db3-99a4c1bedd9f	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 12:30:11.514879+03	
00000000-0000-0000-0000-000000000000	70f9c2c6-6fce-46ea-ab9c-b5a92b30aa56	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 12:30:55.859265+03	
00000000-0000-0000-0000-000000000000	68bc0a47-a135-48b0-bbc0-2a930484fb2f	{"action":"logout","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 12:34:01.962037+03	
00000000-0000-0000-0000-000000000000	fd863372-b60b-4ec1-a63f-318cca496938	{"action":"login","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 12:34:36.213455+03	
00000000-0000-0000-0000-000000000000	8991fda8-868d-4d94-9444-e81bc7156841	{"action":"logout","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:08:24.412446+03	
00000000-0000-0000-0000-000000000000	474e0c84-ab9b-40e2-9492-f81f10c8f9e1	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 13:08:29.241342+03	
00000000-0000-0000-0000-000000000000	91f7f26e-b8a3-4a83-9b7d-8c32d069b84f	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:15:23.813867+03	
00000000-0000-0000-0000-000000000000	968ab857-321f-4374-9f0d-3d6c111cfd23	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 13:15:27.516066+03	
00000000-0000-0000-0000-000000000000	e088dad7-af7c-4a5d-8919-cafd648ee39b	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:15:35.65899+03	
00000000-0000-0000-0000-000000000000	d60a5ce0-d930-446d-828c-a499a932b0cc	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 13:15:41.03432+03	
00000000-0000-0000-0000-000000000000	9d43a265-f8bf-4bbe-afe7-a66e30a73456	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:17:41.300227+03	
00000000-0000-0000-0000-000000000000	1404bc09-8779-4fdb-b55f-3b490c206d1b	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 13:20:26.349083+03	
00000000-0000-0000-0000-000000000000	4190d9e3-52ac-412f-9226-6ec178f7bec5	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:22:51.871408+03	
00000000-0000-0000-0000-000000000000	91efa331-c765-4f85-a55b-e5d2ccf6037e	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 13:23:01.491378+03	
00000000-0000-0000-0000-000000000000	12475533-4b01-4903-921a-c9ca228d8b1b	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:24:06.188497+03	
00000000-0000-0000-0000-000000000000	f3037fa3-d56d-4c76-80c7-6e212107451c	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 13:24:09.749301+03	
00000000-0000-0000-0000-000000000000	ab0820c2-a4cc-4a24-b161-8c34a91fc9b0	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:32:12.879454+03	
00000000-0000-0000-0000-000000000000	7faafc06-044c-4723-93af-97785f40c0b2	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 13:32:15.64811+03	
00000000-0000-0000-0000-000000000000	e55c04d9-d34d-4801-8711-0b6efe1e9482	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:32:34.718368+03	
00000000-0000-0000-0000-000000000000	577bf15a-e8a6-4b33-a4a7-afa1dc5bd7bc	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 13:35:22.8894+03	
00000000-0000-0000-0000-000000000000	36530df0-f6f2-47b2-9eef-3f4abc2054f6	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:38:53.833247+03	
00000000-0000-0000-0000-000000000000	11db02c2-ae8b-440b-8e20-5fd9cdeac0ef	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 13:38:56.34066+03	
00000000-0000-0000-0000-000000000000	a7acf04f-f465-4d49-907f-1ec39766276f	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:39:01.043739+03	
00000000-0000-0000-0000-000000000000	60c2003b-b83e-444d-b119-5bae016a6139	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 13:39:13.835813+03	
00000000-0000-0000-0000-000000000000	6d820070-d06f-4591-8433-5f51e8157f67	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:39:18.753504+03	
00000000-0000-0000-0000-000000000000	58f156f8-b2d3-469a-bc06-f3703dddf66b	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 13:39:26.710852+03	
00000000-0000-0000-0000-000000000000	556b493b-5c04-4b4d-b663-ef8c96735786	{"action":"logout","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 13:44:24.129986+03	
00000000-0000-0000-0000-000000000000	f0eccd0a-472c-4b85-a230-924b7dae55e3	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 14:44:31.132655+03	
00000000-0000-0000-0000-000000000000	d4893107-132a-438d-ae37-0d6ee4ad6eb3	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 14:45:20.093699+03	
00000000-0000-0000-0000-000000000000	5c6e3a10-e4f8-40ec-8b10-d8c96e37eac5	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 14:45:25.692632+03	
00000000-0000-0000-0000-000000000000	ef901796-8731-4c75-a712-1d6c03cd6917	{"action":"logout","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 14:45:35.486114+03	
00000000-0000-0000-0000-000000000000	b10e5131-1a93-4b8d-a7ba-9654a948bd0f	{"action":"login","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 14:45:42.113788+03	
00000000-0000-0000-0000-000000000000	7185c401-aed5-4af9-a5c6-3a0dcb7bdafe	{"action":"logout","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 14:47:38.395594+03	
00000000-0000-0000-0000-000000000000	cca05e38-2ef8-4cec-aad3-c80a1bf37b5a	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 14:47:43.068731+03	
00000000-0000-0000-0000-000000000000	9b52992f-43ff-4971-827d-0d284572cfac	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 15:07:14.402487+03	
00000000-0000-0000-0000-000000000000	d82a9ef0-4b50-4d73-828c-0eb0c2a731a5	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 15:07:17.136112+03	
00000000-0000-0000-0000-000000000000	c4da0fa9-cae3-4ec4-981d-e4155baf23d9	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 15:08:58.949106+03	
00000000-0000-0000-0000-000000000000	77db4fde-2acd-4bd9-aeb9-682bf72b344c	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 15:10:18.051714+03	
00000000-0000-0000-0000-000000000000	62f280b1-3754-420c-8552-8b7695a1fb38	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 15:13:29.603205+03	
00000000-0000-0000-0000-000000000000	e1f99c02-328c-406b-b9ee-61dbb6a24140	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 15:13:32.3201+03	
00000000-0000-0000-0000-000000000000	c62bd03c-3cce-442d-9a05-10b1ed8b9c50	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 15:15:15.79125+03	
00000000-0000-0000-0000-000000000000	a6c667dc-86f5-43b1-92b6-6a0a712beff9	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 15:15:20.041414+03	
00000000-0000-0000-0000-000000000000	26fe8cd5-faba-4747-a46b-de93234fc7e3	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 15:15:41.891867+03	
00000000-0000-0000-0000-000000000000	4243a773-5fea-4723-8b4f-aed0a0f57677	{"action":"login","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 15:15:49.039006+03	
00000000-0000-0000-0000-000000000000	21511b52-a4fb-49b3-a0fa-289a3448528a	{"action":"logout","actor_id":"3505f73c-9b90-4a39-9620-3c512f3ac1d2","actor_username":"staff@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 15:18:48.61402+03	
00000000-0000-0000-0000-000000000000	4f7d59f5-3227-4ca6-a530-e6b5e85609a2	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 15:18:53.25617+03	
00000000-0000-0000-0000-000000000000	58c99e5c-af97-4ae8-9d9e-b8168143adb8	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 15:38:26.157115+03	
00000000-0000-0000-0000-000000000000	76b25daf-6121-41f1-8d96-8fb3692f898e	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 15:39:22.349065+03	
00000000-0000-0000-0000-000000000000	c19a6bb3-bf65-401d-b5af-46466c6be18f	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 16:18:30.746932+03	
00000000-0000-0000-0000-000000000000	ceae8f8b-e9f9-4af8-9eb5-e98d571ecaec	{"action":"login","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 16:18:36.875437+03	
00000000-0000-0000-0000-000000000000	3ed73cb7-77cf-454e-a8d3-ec15478fd15d	{"action":"token_refreshed","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-25 18:10:38.927045+03	
00000000-0000-0000-0000-000000000000	6684c35a-6f7d-4152-8f55-b8c86ee6720c	{"action":"token_revoked","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-25 18:10:38.931511+03	
00000000-0000-0000-0000-000000000000	7db73f23-c2ed-419e-9549-de5b4ed25db9	{"action":"token_refreshed","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-25 18:10:39.214897+03	
00000000-0000-0000-0000-000000000000	9a258170-ba31-4c70-905b-b47237cbbb82	{"action":"logout","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 18:20:35.352803+03	
00000000-0000-0000-0000-000000000000	e7050214-b26d-4989-bc5e-cbafcd159a2f	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 18:20:48.439149+03	
00000000-0000-0000-0000-000000000000	fa3343d8-e7cb-49a4-82fc-5d42f3e14a07	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-25 22:14:04.979524+03	
00000000-0000-0000-0000-000000000000	af3b7f88-e80a-4971-be92-a1671306686c	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-25 22:14:04.985896+03	
00000000-0000-0000-0000-000000000000	c3afb70f-ed19-4fea-bf68-8cc31976019a	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 22:16:34.024601+03	
00000000-0000-0000-0000-000000000000	5a17a180-ad78-4834-aa54-63d64c12f8e4	{"action":"login","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-25 23:49:30.4988+03	
00000000-0000-0000-0000-000000000000	2164b0c9-5138-486c-b15b-c7207d825b1c	{"action":"logout","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-25 23:51:26.406516+03	
00000000-0000-0000-0000-000000000000	36eac3b6-5ce4-4e68-a97c-9a3045c2034e	{"action":"user_repeated_signup","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2026-01-25 23:51:40.923435+03	
00000000-0000-0000-0000-000000000000	bd1073f4-6eb7-4227-9529-7af73789634a	{"action":"user_signedup","actor_id":"0ec8a69e-1bda-4cf7-ab95-7b635d2f4859","actor_name":"customer2 customer2","actor_username":"customer2@demo.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-26 00:00:42.476428+03	
00000000-0000-0000-0000-000000000000	c67a9121-bb4d-4a78-b68d-6be57fb22942	{"action":"login","actor_id":"0ec8a69e-1bda-4cf7-ab95-7b635d2f4859","actor_name":"customer2 customer2","actor_username":"customer2@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-26 00:00:42.520949+03	
00000000-0000-0000-0000-000000000000	26e6f310-9eb5-457f-8489-c2b038050877	{"action":"logout","actor_id":"0ec8a69e-1bda-4cf7-ab95-7b635d2f4859","actor_name":"customer2 customer2","actor_username":"customer2@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-26 00:01:03.841782+03	
00000000-0000-0000-0000-000000000000	8afdcc69-9ff0-4f56-ace0-5dbbf3e4281c	{"action":"user_repeated_signup","actor_id":"0ec8a69e-1bda-4cf7-ab95-7b635d2f4859","actor_name":"customer2 customer2","actor_username":"customer2@demo.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2026-01-26 00:01:23.999183+03	
00000000-0000-0000-0000-000000000000	1a36fd2f-a750-47d3-aa16-3009eb956def	{"action":"user_repeated_signup","actor_id":"0ec8a69e-1bda-4cf7-ab95-7b635d2f4859","actor_name":"customer2 customer2","actor_username":"customer2@demo.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2026-01-26 00:01:51.068116+03	
00000000-0000-0000-0000-000000000000	beb2aeab-cc5f-49d8-8ddf-1bcf5a84d75b	{"action":"user_signedup","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-01-26 00:03:21.143093+03	
00000000-0000-0000-0000-000000000000	47afa62c-2a25-4c39-9bdc-a67dbfed9555	{"action":"login","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-26 00:03:21.178923+03	
00000000-0000-0000-0000-000000000000	4aa734de-e9b6-4ea3-b009-056e0bdc0cc0	{"action":"logout","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-26 00:11:01.663149+03	
00000000-0000-0000-0000-000000000000	f8298cc6-31af-4658-b522-c8cdd824b8e9	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-26 00:11:07.495633+03	
00000000-0000-0000-0000-000000000000	6407b720-cf7a-4944-a4e4-91e92cd01e85	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-26 00:16:10.322775+03	
00000000-0000-0000-0000-000000000000	2e75be9c-ad77-464d-9559-e4c0157cc362	{"action":"login","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-26 00:16:17.276464+03	
00000000-0000-0000-0000-000000000000	7d7d6792-5932-4e03-81fb-90a0deff606d	{"action":"logout","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-26 00:16:55.070696+03	
00000000-0000-0000-0000-000000000000	49068072-a715-438f-a541-96e026850c36	{"action":"login","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-26 00:17:05.088673+03	
00000000-0000-0000-0000-000000000000	29ba783e-befd-4d9d-aed2-c8dc99adfeb9	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-26 06:24:09.038599+03	
00000000-0000-0000-0000-000000000000	4e828167-d8b4-4da0-ad21-87e6c11ba2c8	{"action":"token_revoked","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-26 06:24:09.043218+03	
00000000-0000-0000-0000-000000000000	f1786373-626f-4105-9a6f-4bd0c8748bad	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-30 13:20:34.044631+03	
00000000-0000-0000-0000-000000000000	05f62ccb-a3ca-4b43-8858-963e639fab33	{"action":"token_revoked","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-30 13:20:34.051303+03	
00000000-0000-0000-0000-000000000000	e6e492b4-c4d4-475d-a94e-644d25453d9d	{"action":"login","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-30 20:14:08.681025+03	
00000000-0000-0000-0000-000000000000	4c92d4b7-b407-4ddb-b592-6bc965477e4e	{"action":"logout","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-30 20:15:02.77914+03	
00000000-0000-0000-0000-000000000000	a3f215b5-3d13-438c-8b50-8ff67d74fb68	{"action":"login","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-30 20:15:11.451133+03	
00000000-0000-0000-0000-000000000000	f1ebef66-cac9-4e46-8b16-e919f2ee2a50	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-30 20:19:26.818616+03	
00000000-0000-0000-0000-000000000000	176dc30b-9e4e-466c-9961-3cf79d622cf0	{"action":"token_revoked","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-30 20:19:26.823539+03	
00000000-0000-0000-0000-000000000000	f4e6931b-4469-46f9-878f-c619ce4b6a2b	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-30 22:26:33.068063+03	
00000000-0000-0000-0000-000000000000	bc36bf55-ae35-4a83-b90d-d1e787650265	{"action":"token_revoked","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-30 22:26:33.07273+03	
00000000-0000-0000-0000-000000000000	0e678452-a233-4621-a0cc-649f675f69fd	{"action":"token_refreshed","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-30 22:50:23.272213+03	
00000000-0000-0000-0000-000000000000	4f3325aa-72c0-428a-a9ed-8bd67cbf3b38	{"action":"token_revoked","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-30 22:50:23.275435+03	
00000000-0000-0000-0000-000000000000	202b8f1f-36d2-4937-81ec-011a56b604e6	{"action":"logout","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account"}	2026-01-30 23:13:19.189278+03	
00000000-0000-0000-0000-000000000000	a4428da8-2e55-4179-aac1-ea7e1bc827a8	{"action":"login","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-30 23:13:25.472009+03	
00000000-0000-0000-0000-000000000000	525d80cf-8437-4afc-ac14-7b93a570a922	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-31 12:18:00.847513+03	
00000000-0000-0000-0000-000000000000	22961f55-719f-4700-8cbd-5488bea43b61	{"action":"token_revoked","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-31 12:18:00.868828+03	
00000000-0000-0000-0000-000000000000	addad065-5c9a-421b-9f2e-07ed9e7753bf	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-01-31 12:18:01.624572+03	
00000000-0000-0000-0000-000000000000	e536048c-07f6-4327-a50a-d85470e43073	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 13:12:19.958709+03	
00000000-0000-0000-0000-000000000000	de08f621-2b9e-4bd0-b343-4dcab58aabbc	{"action":"token_revoked","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 13:12:19.970645+03	
00000000-0000-0000-0000-000000000000	738cbac9-654d-40ca-9670-e4792040a1a9	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 17:12:07.337751+03	
00000000-0000-0000-0000-000000000000	9a364c29-77fa-4629-9b66-c1c1323fb3f6	{"action":"token_revoked","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 17:12:07.346825+03	
00000000-0000-0000-0000-000000000000	71ee9d3d-8b03-4755-913f-bea2036917f5	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 18:11:41.730257+03	
00000000-0000-0000-0000-000000000000	4d8d3ed1-0bc6-4392-a3e9-a2ab92fad966	{"action":"token_revoked","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 18:11:41.734511+03	
00000000-0000-0000-0000-000000000000	e2447bfa-252a-489d-877d-0096ba9ec667	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 19:18:57.57114+03	
00000000-0000-0000-0000-000000000000	4cf038ca-b1ba-498e-81cb-16f9e6322813	{"action":"token_revoked","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 19:18:57.576437+03	
00000000-0000-0000-0000-000000000000	958fa51a-ddc3-4919-a71d-a4c9c194ee3c	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 22:22:40.227707+03	
00000000-0000-0000-0000-000000000000	d5f6b881-cf3f-4e20-bfd4-d909b5d51bdd	{"action":"token_revoked","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 22:22:40.241823+03	
00000000-0000-0000-0000-000000000000	9a231519-3655-4acf-bc99-a21e172c1317	{"action":"token_refreshed","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 23:30:11.482508+03	
00000000-0000-0000-0000-000000000000	ec64aecf-4d23-4672-8d93-f778bd03a5f5	{"action":"token_revoked","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-01 23:30:11.488973+03	
00000000-0000-0000-0000-000000000000	2deb7281-3815-475c-a7ce-faf398cbe59d	{"action":"logout","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"account"}	2026-02-01 23:31:26.359653+03	
00000000-0000-0000-0000-000000000000	1a6bcf39-a71d-4438-a756-ff465a64add0	{"action":"login","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-01 23:47:21.836966+03	
00000000-0000-0000-0000-000000000000	6ac81a80-110e-48d1-ab50-9b40bef6d0d5	{"action":"logout","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account"}	2026-02-02 00:02:24.721695+03	
00000000-0000-0000-0000-000000000000	d62a6fb7-6392-4cd7-93af-97acbc9c9f18	{"action":"login","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-02 00:50:51.92015+03	
00000000-0000-0000-0000-000000000000	68d1449d-dbad-45b4-a218-20484ea74d76	{"action":"logout","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"account"}	2026-02-02 00:51:12.847298+03	
00000000-0000-0000-0000-000000000000	2b6b4fba-ab09-4187-a27f-d9d3a54a0b8e	{"action":"login","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-02 00:51:18.013054+03	
00000000-0000-0000-0000-000000000000	12cc9223-4dd4-45f9-9c27-b80763ee03dc	{"action":"token_refreshed","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-02 06:18:56.217397+03	
00000000-0000-0000-0000-000000000000	6a211353-61c5-4590-a03e-8fa636a03a8f	{"action":"token_revoked","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-02 06:18:56.222082+03	
00000000-0000-0000-0000-000000000000	888b96d5-2311-4f26-af3e-def2d6cacbe3	{"action":"token_refreshed","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-02 08:38:07.664691+03	
00000000-0000-0000-0000-000000000000	2f3d1893-90a3-4a1d-b5f5-4941d279fbc2	{"action":"token_revoked","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-02 08:38:07.670855+03	
00000000-0000-0000-0000-000000000000	12b488b0-3dad-4d8f-94c2-affa701a0acd	{"action":"token_refreshed","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-10 19:15:40.810359+03	
00000000-0000-0000-0000-000000000000	733f576a-63a1-4542-85f1-da0501e9ca9f	{"action":"token_revoked","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-10 19:15:40.818211+03	
00000000-0000-0000-0000-000000000000	d551e2e3-8c1b-4699-b24c-17ee10da84ca	{"action":"login","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-10 21:28:46.873372+03	
00000000-0000-0000-0000-000000000000	62007883-504e-4896-99c2-cd141b90c1cd	{"action":"logout","actor_id":"090ed181-87ee-4c19-b0dc-1828ad0ebfd3","actor_name":"owner2 owner2","actor_username":"owner2@demo.com","actor_via_sso":false,"log_type":"account"}	2026-02-10 21:29:01.835782+03	
00000000-0000-0000-0000-000000000000	7b76e72b-a8cf-4220-92d2-d1bcddce84e0	{"action":"login","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-10 21:29:10.271462+03	
00000000-0000-0000-0000-000000000000	c75df2d5-2b3b-4888-a7df-1d1363a232ca	{"action":"logout","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account"}	2026-02-10 21:29:27.89932+03	
00000000-0000-0000-0000-000000000000	0142af12-3c4b-4221-ad16-d2acf6d95654	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-10 21:29:38.074607+03	
00000000-0000-0000-0000-000000000000	990a9bfe-392e-46f6-bd1d-fb38358a2722	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-10 22:45:12.332934+03	
00000000-0000-0000-0000-000000000000	09880737-da3b-4029-a4f1-ca19b7ea4044	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-10 22:45:12.339351+03	
00000000-0000-0000-0000-000000000000	0e2b9881-7fdb-4c04-8e0b-4052b7e59a45	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-10 23:43:37.336014+03	
00000000-0000-0000-0000-000000000000	340629ab-918b-40e2-b8bd-163fc2be5a69	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-10 23:43:37.357447+03	
00000000-0000-0000-0000-000000000000	f550c98c-2f46-4aed-b1f1-52de91c1914d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-22 20:18:31.153392+03	
00000000-0000-0000-0000-000000000000	aabfcb0e-37a5-476e-8843-b287deaea06b	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-22 20:18:31.160978+03	
00000000-0000-0000-0000-000000000000	23d5385b-8a89-4fe1-9c60-f46bebfa2c62	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-22 23:58:31.570821+03	
00000000-0000-0000-0000-000000000000	4eed25e3-e70d-45d5-b60b-0648ff0f034c	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-22 23:58:31.578175+03	
00000000-0000-0000-0000-000000000000	63e447ec-d8e1-4e65-ae22-cc851bc06a00	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:30.210212+03	
00000000-0000-0000-0000-000000000000	bae9ccf0-8272-4b48-9c11-3f952a97cee5	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:30.250508+03	
00000000-0000-0000-0000-000000000000	c647183a-9bac-4f4d-8607-30c461d0c9bd	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:31.140739+03	
00000000-0000-0000-0000-000000000000	d6617500-6bc1-427e-b2fe-a8f73be306fb	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:33.482115+03	
00000000-0000-0000-0000-000000000000	f7d91266-826f-4d7a-9f3f-4d531737e90f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:33.628982+03	
00000000-0000-0000-0000-000000000000	470c822c-653d-4004-b350-a837d5bd11ef	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:35.278092+03	
00000000-0000-0000-0000-000000000000	826a2e85-02cb-4b5a-b85d-67376991e4a4	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:36.096211+03	
00000000-0000-0000-0000-000000000000	0c3c9228-c0fc-4de2-aacf-6647a8da0fc7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:36.81858+03	
00000000-0000-0000-0000-000000000000	0f4e7c2c-b836-47ef-a101-1caefbd97ceb	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:38.341502+03	
00000000-0000-0000-0000-000000000000	6b6b4063-78f7-49ff-9b06-5dcfbe220cfc	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:39.117526+03	
00000000-0000-0000-0000-000000000000	53da74c6-ccba-47a9-8040-841702f626f8	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:39.743661+03	
00000000-0000-0000-0000-000000000000	e79795e7-7aa4-479c-a0ac-ca2ada323593	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:40.31855+03	
00000000-0000-0000-0000-000000000000	d4e5e001-ae03-4369-89e7-fbc731eb203b	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:41.390378+03	
00000000-0000-0000-0000-000000000000	735c243d-9625-43f1-9b41-876bb03587ee	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:41.755598+03	
00000000-0000-0000-0000-000000000000	ba030d8d-0809-4f4c-9750-3be62b07c822	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:42.52748+03	
00000000-0000-0000-0000-000000000000	4a57c275-20b6-4e32-b692-32421a876246	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:43.249595+03	
00000000-0000-0000-0000-000000000000	488bf1e1-3f0d-40ab-a541-a2c23120c0a4	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:44.270814+03	
00000000-0000-0000-0000-000000000000	ed636175-90de-4ba9-8c90-01a413d53ec3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:44.671912+03	
00000000-0000-0000-0000-000000000000	e7439601-6005-4af4-ac3b-c02f06692f9d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:45.400807+03	
00000000-0000-0000-0000-000000000000	b6dd35b9-f6ca-4798-ad57-6549bb627641	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:45.646182+03	
00000000-0000-0000-0000-000000000000	2fd979fc-be6c-4e9b-8261-e87b8c279fed	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:46.347831+03	
00000000-0000-0000-0000-000000000000	c38ff07d-21d5-40c4-ba04-df8ef40da4a4	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:46.843259+03	
00000000-0000-0000-0000-000000000000	4ba62cdc-37cc-4bfe-b06e-810cd97c250b	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:47.677181+03	
00000000-0000-0000-0000-000000000000	5470a2ad-d446-436c-9445-7645d365a0de	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:47.96541+03	
00000000-0000-0000-0000-000000000000	81d2a880-a579-4e58-8716-68546e7ba57e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:48.730438+03	
00000000-0000-0000-0000-000000000000	9c7f1560-79fe-4488-a3b9-e4dabf53cb05	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:49.030843+03	
00000000-0000-0000-0000-000000000000	0bad06bf-8480-4e92-8a8f-1bd38fc284bd	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:49.773626+03	
00000000-0000-0000-0000-000000000000	ac524504-c236-49dc-9b01-ae1077d28c79	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:49.988869+03	
00000000-0000-0000-0000-000000000000	ad3cf22b-33fa-47aa-9472-441f9a742e19	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:51.047466+03	
00000000-0000-0000-0000-000000000000	c20adfde-9f78-468e-84c8-4e67d5aecd46	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:51.308582+03	
00000000-0000-0000-0000-000000000000	dfec289e-da40-494e-bf97-9bd77ff1d85c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:52.055561+03	
00000000-0000-0000-0000-000000000000	285bd3fe-5a8a-4655-849b-9945a36167b4	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:52.325736+03	
00000000-0000-0000-0000-000000000000	80f70333-9da9-4344-9c81-a26385209755	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:53.525664+03	
00000000-0000-0000-0000-000000000000	5c10cb8a-931d-409b-ae0f-2186bd8aaa35	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:53.719938+03	
00000000-0000-0000-0000-000000000000	7632bd7f-a0d1-42eb-97ce-7b9fdecbee7c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:54.803195+03	
00000000-0000-0000-0000-000000000000	367c9ae8-d1fb-4dfd-888b-b2bd5acfd380	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:55.073722+03	
00000000-0000-0000-0000-000000000000	38bf9f1c-b752-4813-a419-c956d649cf49	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:55.703375+03	
00000000-0000-0000-0000-000000000000	26864118-12f8-40f4-bda4-e97e9c0be772	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:55.957728+03	
00000000-0000-0000-0000-000000000000	e16d374e-f790-4ac6-ac38-ee722b917455	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:56.974891+03	
00000000-0000-0000-0000-000000000000	61268a3d-d019-4143-b0d2-9b3447438140	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:57.329365+03	
00000000-0000-0000-0000-000000000000	64f55294-16ff-483e-8118-008df725212c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:58.165359+03	
00000000-0000-0000-0000-000000000000	bbfa870d-1470-4d7b-8ddd-a1ed4aa38d3a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:58.518435+03	
00000000-0000-0000-0000-000000000000	6a92dcaa-eb7c-4088-82b3-ea71686efd2f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:59.153747+03	
00000000-0000-0000-0000-000000000000	da468fbc-bfc0-448e-8dd3-67a591c47051	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:59.413783+03	
00000000-0000-0000-0000-000000000000	18c29eb0-8498-432c-87a7-83b60c99b4d5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:31:59.986834+03	
00000000-0000-0000-0000-000000000000	e6aa729f-43a2-4718-8ab0-091b46b9bc59	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:00.310931+03	
00000000-0000-0000-0000-000000000000	c9745144-572d-4dbe-a497-cb10841fd687	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:00.972053+03	
00000000-0000-0000-0000-000000000000	abddf106-2eb7-4af8-b00c-22dc18aef498	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:01.33842+03	
00000000-0000-0000-0000-000000000000	c37e4f85-d98e-4fa2-ba98-743e8b50b319	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:02.316561+03	
00000000-0000-0000-0000-000000000000	68bc737c-c85a-4202-bf8f-f0c3663ae57c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:02.934559+03	
00000000-0000-0000-0000-000000000000	3e931cb2-ac09-491a-9579-6e42043303c4	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:04.239315+03	
00000000-0000-0000-0000-000000000000	66b34a06-1d17-4ef3-9a3c-b3ab8ebc8868	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:05.061476+03	
00000000-0000-0000-0000-000000000000	7fcba8fa-8de7-417b-b626-32fd11e6cf86	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:06.0584+03	
00000000-0000-0000-0000-000000000000	86306762-8b85-4df1-9fbb-1cb82a33b5f1	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:07.093594+03	
00000000-0000-0000-0000-000000000000	a96f3255-d2a8-4bba-9d4f-32c5aa5d839e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:08.252297+03	
00000000-0000-0000-0000-000000000000	6b80724f-1347-45d4-9d5d-638bbda85dfc	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:09.375504+03	
00000000-0000-0000-0000-000000000000	60cba574-cad5-49cf-bd78-0adb4339da18	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:11.257146+03	
00000000-0000-0000-0000-000000000000	50e5f61c-3179-48f4-9608-b5c83bef40a6	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:12.168594+03	
00000000-0000-0000-0000-000000000000	980450db-171b-4358-9699-b12a3a780690	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:13.523427+03	
00000000-0000-0000-0000-000000000000	34d0df1e-31ab-4e91-99ae-6f17b0ba1899	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:13.910264+03	
00000000-0000-0000-0000-000000000000	559e4563-d565-4f94-b133-caa81d5dfe5c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:14.975377+03	
00000000-0000-0000-0000-000000000000	6af7a370-b116-463b-af62-637329233271	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:15.361402+03	
00000000-0000-0000-0000-000000000000	2573592e-38e6-4473-ab9d-db41daa23099	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:16.037465+03	
00000000-0000-0000-0000-000000000000	f55e07fb-7679-4d27-bdab-7819330938c2	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:16.352362+03	
00000000-0000-0000-0000-000000000000	9d43374b-4f1a-4276-9a0d-2bd897b80a86	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:17.206851+03	
00000000-0000-0000-0000-000000000000	f5fab23a-b088-41c7-bfdc-bb339d74b15b	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:17.60377+03	
00000000-0000-0000-0000-000000000000	5688cf66-1836-4aeb-b876-18bb292d8265	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:18.375044+03	
00000000-0000-0000-0000-000000000000	cbc13d12-2d4c-4742-b0e0-9d1fca1397c0	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:19.064891+03	
00000000-0000-0000-0000-000000000000	1fa77589-70c3-4667-a7c4-0532b9eb9c37	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:19.871364+03	
00000000-0000-0000-0000-000000000000	8eeeb391-d952-413b-a154-9ea514134c3e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:20.265107+03	
00000000-0000-0000-0000-000000000000	f7672df8-fab7-4f77-a48f-13ef99486e91	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:21.025438+03	
00000000-0000-0000-0000-000000000000	dcb2821d-0fae-423c-8fa2-82126666a709	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:21.603072+03	
00000000-0000-0000-0000-000000000000	3b134f86-2e92-44df-a3af-089419fe30a7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:22.321867+03	
00000000-0000-0000-0000-000000000000	281d55fb-60a2-45fd-ac6e-985b6abe3c73	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:22.982661+03	
00000000-0000-0000-0000-000000000000	9ebfbb39-0b50-4d4a-b997-4d6ad032b73a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:23.689829+03	
00000000-0000-0000-0000-000000000000	c2790d51-f8bc-45cc-99ab-4fa68790ef59	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:24.528479+03	
00000000-0000-0000-0000-000000000000	84ee4903-9214-40ce-8f9d-805f5693dab2	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:24.917192+03	
00000000-0000-0000-0000-000000000000	e72c6c1e-3c12-4c0d-9fb4-41971aed22b0	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:25.403427+03	
00000000-0000-0000-0000-000000000000	e072f2ce-6503-45e9-a3b8-e85db49691ca	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:25.744491+03	
00000000-0000-0000-0000-000000000000	ff55f7bc-1f5e-41ed-b386-947d3f941f78	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:26.212662+03	
00000000-0000-0000-0000-000000000000	c98361be-71d6-4dd2-9e0e-14c5731d16d5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:26.649402+03	
00000000-0000-0000-0000-000000000000	23ec3697-e6ea-4160-9ae8-6348b2a44253	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:27.246532+03	
00000000-0000-0000-0000-000000000000	4082212b-1663-483a-9a14-1b4cba749913	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:27.633618+03	
00000000-0000-0000-0000-000000000000	3f4cb914-0588-41c7-b181-f0167a7333df	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:28.272007+03	
00000000-0000-0000-0000-000000000000	1aaed964-06d9-4c58-8f8b-aa264afb9ed1	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:28.697034+03	
00000000-0000-0000-0000-000000000000	02a673bc-cc64-4d37-ad96-9a2589f9fe41	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:29.432389+03	
00000000-0000-0000-0000-000000000000	1ced7a7c-eb6f-4b94-97bc-b47f50058d7b	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:29.754326+03	
00000000-0000-0000-0000-000000000000	a0d65007-a73a-4db7-bf23-d2d925b490c1	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:30.714137+03	
00000000-0000-0000-0000-000000000000	d602b3cc-c50f-417f-b2f0-b434d4ecfb56	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:31.251478+03	
00000000-0000-0000-0000-000000000000	13135764-71dd-48f3-8c83-6937b239a5e5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:31.920207+03	
00000000-0000-0000-0000-000000000000	b790db37-2a4d-4cdd-a531-e14eb409e0ed	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:32.220042+03	
00000000-0000-0000-0000-000000000000	9b9b31c7-86ef-417a-9d43-7af70ad6f065	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:33.192218+03	
00000000-0000-0000-0000-000000000000	91cdbd3d-46bf-4a04-8486-e17ed8e34e45	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:33.447055+03	
00000000-0000-0000-0000-000000000000	652fc340-59a4-4f85-a7b4-e0528f3ab878	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:34.262672+03	
00000000-0000-0000-0000-000000000000	123a56f3-b1f3-459b-bb5b-7a35b10d2ebc	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:34.629387+03	
00000000-0000-0000-0000-000000000000	7ffa05d9-a442-4981-bffb-bd80824e9bfd	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:35.467562+03	
00000000-0000-0000-0000-000000000000	09bc2bd4-b9b7-4f64-a721-210023adf441	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:35.760255+03	
00000000-0000-0000-0000-000000000000	5e304012-5159-4ecd-b268-c2a71dd6fba1	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:37.288834+03	
00000000-0000-0000-0000-000000000000	7e3e6ba4-2233-4857-bc46-9409fdee3c1e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:37.42621+03	
00000000-0000-0000-0000-000000000000	b51a5749-1f86-4b6c-8617-06cc3af62058	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:38.207919+03	
00000000-0000-0000-0000-000000000000	16f0cf68-3678-4f41-a828-c322d44fe7a2	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:38.38288+03	
00000000-0000-0000-0000-000000000000	8740bd39-b70e-477c-9c27-4549b1572f11	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:39.210315+03	
00000000-0000-0000-0000-000000000000	9d7cc0d6-5ae2-448e-aa6d-0b5395472910	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:39.371728+03	
00000000-0000-0000-0000-000000000000	4f98dee9-01c8-4b8e-b588-c5a0847a8650	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:40.774588+03	
00000000-0000-0000-0000-000000000000	64d6abd3-6767-42c2-9c51-5d70a2d39805	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:41.141637+03	
00000000-0000-0000-0000-000000000000	dcac78d3-3618-4575-977e-151d73444b4f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:43.743847+03	
00000000-0000-0000-0000-000000000000	b9857172-97ff-4943-860f-b1134f3c62b9	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:45.53252+03	
00000000-0000-0000-0000-000000000000	8b22829f-0b5e-4c1a-985c-4f2452074243	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:46.27992+03	
00000000-0000-0000-0000-000000000000	617861d8-19e7-4f89-af00-5c9b63ca353d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:47.023567+03	
00000000-0000-0000-0000-000000000000	78a2e9be-069f-4fbe-824b-86c199c494d3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:47.453501+03	
00000000-0000-0000-0000-000000000000	dac69f0e-253e-4f63-861a-4069c09629ba	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:48.170576+03	
00000000-0000-0000-0000-000000000000	47c7f21a-009b-4389-adf1-1b2786a7ea9f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:48.769975+03	
00000000-0000-0000-0000-000000000000	9b92c26a-e7c1-49a2-a5ec-4eb3141b12d5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:49.613502+03	
00000000-0000-0000-0000-000000000000	fd8710a2-fd0f-4aca-a1ff-f40b7d28d79c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:50.352917+03	
00000000-0000-0000-0000-000000000000	40694c38-6bb4-4c6f-bdaf-e07bc459c73f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:51.691926+03	
00000000-0000-0000-0000-000000000000	6a0a6c5e-cb79-4459-9c0a-1f3c8f221d22	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:52.245365+03	
00000000-0000-0000-0000-000000000000	55d241db-fabe-4b2f-b937-8dc89a793065	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:53.293652+03	
00000000-0000-0000-0000-000000000000	dda558f2-126d-4760-9224-e651c5a7af18	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:53.689641+03	
00000000-0000-0000-0000-000000000000	3b6a8222-4cc3-4e3d-b9bb-6699a26fb217	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:54.609815+03	
00000000-0000-0000-0000-000000000000	dd21c8e2-f362-439e-83d5-db27b585b838	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:54.853126+03	
00000000-0000-0000-0000-000000000000	2c15707a-d715-4a9d-bbd7-02bfdbd545df	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:55.634041+03	
00000000-0000-0000-0000-000000000000	e29fd72d-2d11-4432-b315-29af3f5eeeba	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:55.871128+03	
00000000-0000-0000-0000-000000000000	e6590050-081d-4bf2-bc38-9bfba2fe23dd	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:57.054336+03	
00000000-0000-0000-0000-000000000000	41061795-bbe7-4d20-8c78-2a13c08d380c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:57.55499+03	
00000000-0000-0000-0000-000000000000	7b7463d6-57e6-4fc1-b579-2fcee7e2caf7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:58.246247+03	
00000000-0000-0000-0000-000000000000	ba5ae91d-6679-4670-941b-dbe2490183ee	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:58.527905+03	
00000000-0000-0000-0000-000000000000	9e5e0644-4d86-4f80-a40a-eeeeaf05458a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:59.401209+03	
00000000-0000-0000-0000-000000000000	10bdc6d2-09a1-41c7-b40b-cd4283573a06	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:32:59.753905+03	
00000000-0000-0000-0000-000000000000	e7a06398-64a4-4842-a930-05ec43c3c548	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:00.782039+03	
00000000-0000-0000-0000-000000000000	c6c1a021-74aa-41ea-bba3-85269c84245a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:01.1081+03	
00000000-0000-0000-0000-000000000000	1a3d2d59-b7bf-42b9-bdf3-410d19a9c29d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:02.171194+03	
00000000-0000-0000-0000-000000000000	f4381a84-5fab-4175-abc6-8257826d67f6	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:03.028049+03	
00000000-0000-0000-0000-000000000000	3c7fbbba-f895-42e8-97d9-749fa1653b73	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:03.917065+03	
00000000-0000-0000-0000-000000000000	e0ac8aba-3f5c-4cf9-b062-9a22ab9d3328	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:04.375061+03	
00000000-0000-0000-0000-000000000000	3a845c86-dd68-4a73-ab29-d5f572161996	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:05.033403+03	
00000000-0000-0000-0000-000000000000	808ef946-6dbf-4467-ae97-29f3a93d0d65	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:05.306347+03	
00000000-0000-0000-0000-000000000000	47e6f0d4-addc-4ccd-bbb7-d013c06752fb	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:06.116385+03	
00000000-0000-0000-0000-000000000000	e51829a1-8951-43ae-a8ba-2445f5659c86	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:06.362461+03	
00000000-0000-0000-0000-000000000000	e361ad66-ff7f-45cc-9657-0c9283512745	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:07.407043+03	
00000000-0000-0000-0000-000000000000	1de7b0e6-904f-4b2a-a603-68812e6d6655	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:07.748327+03	
00000000-0000-0000-0000-000000000000	9e341f4a-e261-48aa-8d97-f6debec9076a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:09.154009+03	
00000000-0000-0000-0000-000000000000	31b00a29-1c80-47c6-a329-dadbaf2842de	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:09.382744+03	
00000000-0000-0000-0000-000000000000	e43af7a7-ccb1-4521-9d41-1c128e40207d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:10.06452+03	
00000000-0000-0000-0000-000000000000	8967f264-5680-42a8-ae0f-7375642b43d5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:10.302688+03	
00000000-0000-0000-0000-000000000000	852042f3-c93a-41bb-becc-342ee1dd9365	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:11.13398+03	
00000000-0000-0000-0000-000000000000	a38b1292-2007-4402-abd3-f9700c6010f7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:11.35298+03	
00000000-0000-0000-0000-000000000000	1bc4b7c4-3c1d-4c57-8e98-0309c7ce1e2f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:12.230863+03	
00000000-0000-0000-0000-000000000000	605e26df-43df-4b61-8640-da2b766f1c5c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:12.43113+03	
00000000-0000-0000-0000-000000000000	1f8560f4-6933-4e17-85dc-0f2084b85fdc	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:13.417084+03	
00000000-0000-0000-0000-000000000000	2100449d-8cb7-4f0e-abf0-170e5edaf318	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:13.571416+03	
00000000-0000-0000-0000-000000000000	53316cb4-1d87-4eb5-9b5a-f378448dc477	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:14.859116+03	
00000000-0000-0000-0000-000000000000	5e44f1dc-9d44-4e34-b0d0-e72adf88525a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:15.067733+03	
00000000-0000-0000-0000-000000000000	ed9459bd-b677-4f4d-a8e0-02a52d6018d9	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:16.745903+03	
00000000-0000-0000-0000-000000000000	2e3998ae-8781-473d-b173-19c29bd7f0e5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:17.148117+03	
00000000-0000-0000-0000-000000000000	153cb6d7-0a2a-42bf-ad34-ec448a920a29	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:18.20117+03	
00000000-0000-0000-0000-000000000000	0ba7b853-453b-49d2-96c0-93974ccb7687	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:19.08351+03	
00000000-0000-0000-0000-000000000000	b4230601-a067-4382-a62e-f0a7b7e617a3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:19.632667+03	
00000000-0000-0000-0000-000000000000	ff0fc16e-e7fd-4e79-a469-79fd4d409b20	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:20.104999+03	
00000000-0000-0000-0000-000000000000	7b7de632-8306-4de8-9493-e250a7afb30f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:20.451132+03	
00000000-0000-0000-0000-000000000000	5f8f617b-723a-4f89-b40c-59da19e6a06e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:20.916216+03	
00000000-0000-0000-0000-000000000000	9abae0ed-ffac-45b1-9eba-828c889cb794	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:21.417016+03	
00000000-0000-0000-0000-000000000000	05bac56a-45e2-4ff5-a3a7-a755c53637ef	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:22.003131+03	
00000000-0000-0000-0000-000000000000	d978fa3d-65ae-4c84-a175-2af537ab0bde	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:22.481649+03	
00000000-0000-0000-0000-000000000000	626316df-3d00-4715-bb84-90cc8e4ead93	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:23.079196+03	
00000000-0000-0000-0000-000000000000	7e4cd3a1-b2be-4cda-b968-b310ccabef3c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:23.867238+03	
00000000-0000-0000-0000-000000000000	006053e6-3866-4f20-a3af-ca5c3be9732a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:24.742974+03	
00000000-0000-0000-0000-000000000000	91ccad32-0831-4bce-8b1e-511964cfaac7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:25.323919+03	
00000000-0000-0000-0000-000000000000	970447fa-a19b-4405-8379-3e7be7c05964	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:25.72205+03	
00000000-0000-0000-0000-000000000000	9264051b-f4dc-455a-81be-a73cb97f513c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:26.201723+03	
00000000-0000-0000-0000-000000000000	1903433e-f3c3-493a-ae7c-6c3fbe893c80	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:26.881755+03	
00000000-0000-0000-0000-000000000000	a5562350-0664-4e11-90f5-aad7d3593a0d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:27.395692+03	
00000000-0000-0000-0000-000000000000	af64b2c8-ef8f-497a-80b4-765a2608ad99	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:27.919615+03	
00000000-0000-0000-0000-000000000000	68ba6c7a-d383-4748-a663-c043b18e989d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:28.870023+03	
00000000-0000-0000-0000-000000000000	8b2e5616-62db-42d4-9053-687d8ea06c97	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:29.399383+03	
00000000-0000-0000-0000-000000000000	5bf9b719-9c5b-43b0-bd18-31a1d677fee3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:29.846249+03	
00000000-0000-0000-0000-000000000000	5d98a3ce-ad80-4cd2-9d2a-0620c1479540	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:30.320272+03	
00000000-0000-0000-0000-000000000000	a76713c4-8af9-45bb-b4d7-d91be351d12e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:30.679234+03	
00000000-0000-0000-0000-000000000000	faf31da0-66dc-4089-ae86-bcbfe2bd7ef3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:31.073915+03	
00000000-0000-0000-0000-000000000000	e010c5b5-3a8d-481c-a764-8ce482c0382c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:31.417584+03	
00000000-0000-0000-0000-000000000000	ec3a663b-59d1-4ad2-b41f-fe43c24a72d0	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:31.775203+03	
00000000-0000-0000-0000-000000000000	0cbb8721-4e61-43a2-be8d-06c0ebcbf3e8	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:32.16153+03	
00000000-0000-0000-0000-000000000000	289c52c9-f15e-4d62-ab38-b1ac0a78a71a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:32.602581+03	
00000000-0000-0000-0000-000000000000	d200955b-f3d2-401b-ab8a-ae2e9cfe6e3b	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:33.331933+03	
00000000-0000-0000-0000-000000000000	2ac4113d-6a99-467e-b639-9d44fe67ec39	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:33.720485+03	
00000000-0000-0000-0000-000000000000	98757166-1cb6-440c-8df4-1979d75a2398	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:34.372627+03	
00000000-0000-0000-0000-000000000000	da50c930-9484-4c98-a0d1-12b200e449be	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:34.841443+03	
00000000-0000-0000-0000-000000000000	f0edf6c6-3f96-4b21-9ab9-a2426a502105	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:35.287389+03	
00000000-0000-0000-0000-000000000000	569fb74c-0aa0-43e8-8374-beaa84af5a68	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:35.783509+03	
00000000-0000-0000-0000-000000000000	15047a44-84dd-4d2c-b00d-04c440069fd6	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:36.26781+03	
00000000-0000-0000-0000-000000000000	ad30d77a-4818-4e7d-b203-1ccdff9f920f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:36.941016+03	
00000000-0000-0000-0000-000000000000	162f2efe-6c6e-45ed-b512-4fc20c2d8509	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:37.45728+03	
00000000-0000-0000-0000-000000000000	2ad06674-9bc5-44dd-8830-45b994e880d9	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:37.909009+03	
00000000-0000-0000-0000-000000000000	2ddec810-8b40-4bb4-a95d-144953faac95	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:38.468847+03	
00000000-0000-0000-0000-000000000000	3989e1fd-5dc0-4ee7-af3b-0ffceeccc792	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:38.895586+03	
00000000-0000-0000-0000-000000000000	4ac2a49f-f6aa-428c-88d1-6bc63fe452f0	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:39.281161+03	
00000000-0000-0000-0000-000000000000	fd0c7ce6-8448-4845-8b35-f942d975f80c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:40.002287+03	
00000000-0000-0000-0000-000000000000	48e9ada8-a873-40ef-b5d3-bb7af9452277	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:40.838812+03	
00000000-0000-0000-0000-000000000000	724598f9-51f0-4753-94a2-f76136afb3e2	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:41.415066+03	
00000000-0000-0000-0000-000000000000	9986f5aa-154d-42e6-a059-8c0752ad9b75	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:41.756384+03	
00000000-0000-0000-0000-000000000000	efb9609e-d904-4396-9b6b-975b506f7e1a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:42.211791+03	
00000000-0000-0000-0000-000000000000	b3298a06-0c05-4e57-8d4f-8f1b95e1e67a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:42.501413+03	
00000000-0000-0000-0000-000000000000	44d5d71b-23d7-4248-b80f-014d1f87c588	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:43.352265+03	
00000000-0000-0000-0000-000000000000	db2e57e2-cd21-4904-ab2c-5b6d9678161c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:43.683297+03	
00000000-0000-0000-0000-000000000000	9afbf96f-5784-4129-ae94-95b5b8accf88	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:44.582265+03	
00000000-0000-0000-0000-000000000000	de6e6224-ced2-4f73-a15c-014f1dd1d9fb	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:44.845525+03	
00000000-0000-0000-0000-000000000000	82bbc0ce-6414-4241-9a55-fb3a2f6bd052	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:45.729758+03	
00000000-0000-0000-0000-000000000000	c6a81a83-94de-4758-b435-0f2787d559b4	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:46.020003+03	
00000000-0000-0000-0000-000000000000	701cd1cd-542a-4cb7-950e-5691c2349af9	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:46.975544+03	
00000000-0000-0000-0000-000000000000	80f0e1d5-3663-4d77-85f0-35be79ff8253	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:47.221157+03	
00000000-0000-0000-0000-000000000000	62a546c2-69d5-4ded-9558-8a5c4bc8e0a8	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:47.955211+03	
00000000-0000-0000-0000-000000000000	0196c094-965b-4391-be3d-d6c42bc01cfe	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:48.248399+03	
00000000-0000-0000-0000-000000000000	209fab85-3dc4-438e-9ed9-7090bd1803ad	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:48.901171+03	
00000000-0000-0000-0000-000000000000	20729110-8a04-4032-be3e-0fc5dcab42ec	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:49.168951+03	
00000000-0000-0000-0000-000000000000	85b76a53-32e1-4bd0-a013-0c248d453443	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:49.746965+03	
00000000-0000-0000-0000-000000000000	557b18f6-0155-4107-b66e-71dbefc18ace	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:49.965922+03	
00000000-0000-0000-0000-000000000000	4d13a958-c2ad-4cf9-a5d2-339ccc3d6724	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:50.538937+03	
00000000-0000-0000-0000-000000000000	19a008d1-1fc2-403d-91a7-48900f08f2ee	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:50.74499+03	
00000000-0000-0000-0000-000000000000	402548d3-2ca9-4b3e-bcc5-c3c45f7be176	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:51.305247+03	
00000000-0000-0000-0000-000000000000	c5bd476b-b5be-42f9-baed-b0c2f199bd8e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:51.590676+03	
00000000-0000-0000-0000-000000000000	5f1cd609-0bfe-4d73-adfc-15f8c4bcf932	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:52.512129+03	
00000000-0000-0000-0000-000000000000	297e2aee-bb8e-4791-8daa-18c94f8ffda9	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:53.153128+03	
00000000-0000-0000-0000-000000000000	e25440b5-eca6-44ef-bd2b-6db60ad2b92c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:53.758188+03	
00000000-0000-0000-0000-000000000000	e56c0cac-eae8-4329-b21d-0371aabb0046	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:54.192201+03	
00000000-0000-0000-0000-000000000000	3e47bd4c-c072-41fd-bf8c-2b535f33991d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:55.720458+03	
00000000-0000-0000-0000-000000000000	a559c869-01f0-4f85-b9e0-6ae7b8e98b16	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:56.223459+03	
00000000-0000-0000-0000-000000000000	91abbb38-0b4a-43fd-a410-9692110bed9f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:57.530066+03	
00000000-0000-0000-0000-000000000000	73d19471-1644-4208-b314-0f10d5b1351b	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:58.078149+03	
00000000-0000-0000-0000-000000000000	96a7d8e6-7ec2-4d32-ac7f-7e9808073d17	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:58.958351+03	
00000000-0000-0000-0000-000000000000	72aa736b-90b2-40ca-b05f-c3e807e80fcc	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:33:59.350704+03	
00000000-0000-0000-0000-000000000000	2d281ef0-f115-4ca8-8a0a-d5bb3f81aa01	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:34:00.10904+03	
00000000-0000-0000-0000-000000000000	32789f42-7cdd-4129-beca-d832ab45bb36	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:34:00.586224+03	
00000000-0000-0000-0000-000000000000	6ced69f5-b511-467d-a19d-5c8518ef7229	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:34:01.215354+03	
00000000-0000-0000-0000-000000000000	b22b3f90-1a48-4ad9-a445-c9ea137ab71f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 06:34:01.557864+03	
00000000-0000-0000-0000-000000000000	49767113-febe-45f9-8722-6addf2c8f4fb	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 08:23:47.998018+03	
00000000-0000-0000-0000-000000000000	66754dc7-c0c4-4b4c-b064-a34340ca5f3e	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 08:23:48.007947+03	
00000000-0000-0000-0000-000000000000	55740b51-229f-4ea4-8e69-6fde9662ea58	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 08:23:49.105043+03	
00000000-0000-0000-0000-000000000000	69d1516d-8e5e-4498-a8c7-69cb7e1f9bb5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 08:23:49.825432+03	
00000000-0000-0000-0000-000000000000	3dd11e26-21ed-419b-a8da-2f3e2ce52b4b	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 08:23:51.489742+03	
00000000-0000-0000-0000-000000000000	5a5c4eae-41a7-4f2b-930b-8377aec42cec	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:25:48.681654+03	
00000000-0000-0000-0000-000000000000	5e58e70d-541b-484b-aeb2-243af57393a7	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:25:48.690204+03	
00000000-0000-0000-0000-000000000000	fb96096e-d440-4348-8e64-75fe00bb2307	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:25:50.205724+03	
00000000-0000-0000-0000-000000000000	b97948a6-0928-4cad-b6a9-b6430382b6e1	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:25:52.735503+03	
00000000-0000-0000-0000-000000000000	d1901146-3ab7-435c-9897-2ec702392606	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:25:53.778304+03	
00000000-0000-0000-0000-000000000000	4b679a51-ed73-4d70-91eb-b51715b02490	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:25:55.747028+03	
00000000-0000-0000-0000-000000000000	f53c4d29-7a36-442c-a2d8-3e5984317a85	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:25:56.615296+03	
00000000-0000-0000-0000-000000000000	f5811beb-8df7-4cfd-bec5-4ef55da622ec	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:25:57.431542+03	
00000000-0000-0000-0000-000000000000	8a2dbe3a-783c-4ed5-9a77-7fb76915afaa	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:25:58.165767+03	
00000000-0000-0000-0000-000000000000	93e4023c-4af1-481f-b4fd-99b6fd37ad29	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:25:59.136622+03	
00000000-0000-0000-0000-000000000000	69e4a3e6-eee3-4da3-989b-0cc02e7e8f02	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:00.35301+03	
00000000-0000-0000-0000-000000000000	e52e2d1b-315e-49a5-b129-d9aa74730a24	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:01.604296+03	
00000000-0000-0000-0000-000000000000	d2a11b35-b86c-4ccc-850a-23a92da5723f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:02.20462+03	
00000000-0000-0000-0000-000000000000	61ca8add-f171-4b56-afa3-d3b46cc1cfe2	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:03.583276+03	
00000000-0000-0000-0000-000000000000	789f660b-70b5-4f9d-ad23-986b178d1ac8	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:03.978346+03	
00000000-0000-0000-0000-000000000000	ed39a79b-ef90-44b4-b4dc-6acf6ae7552d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:04.805762+03	
00000000-0000-0000-0000-000000000000	2b9c926f-3a65-44c0-95c5-4a694484199d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:05.176754+03	
00000000-0000-0000-0000-000000000000	4ccfa7dc-f211-48fe-aace-e018fec51fa2	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:05.71434+03	
00000000-0000-0000-0000-000000000000	2e44e386-ff9a-44e2-a5f1-017eef24d8a0	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:05.965937+03	
00000000-0000-0000-0000-000000000000	a1834f61-f786-46d8-b889-3fdc462d6937	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:06.471631+03	
00000000-0000-0000-0000-000000000000	269f829c-0c9a-4cbd-8f5c-4791b19acf25	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:06.67828+03	
00000000-0000-0000-0000-000000000000	c827ea86-2edf-4b3b-95db-c4ab7921e587	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:07.176211+03	
00000000-0000-0000-0000-000000000000	3f8d0205-fc76-4423-84d2-4a660b3796c7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:07.369203+03	
00000000-0000-0000-0000-000000000000	ddd2f0c0-a3a1-4167-aee2-bb0eed9ce2d2	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:07.866898+03	
00000000-0000-0000-0000-000000000000	098bbf99-6f21-490f-89ce-6257998052ea	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:08.108994+03	
00000000-0000-0000-0000-000000000000	20adc950-71d6-4136-a6db-bd59af2493d3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:08.739789+03	
00000000-0000-0000-0000-000000000000	1f606704-5e81-4ebd-939d-f1eb6653de31	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:08.95591+03	
00000000-0000-0000-0000-000000000000	2279b676-5ed8-4821-aa44-3b08d28c7691	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:09.622885+03	
00000000-0000-0000-0000-000000000000	84e7d609-3694-433e-a6ee-46e958a12ed1	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:10.016348+03	
00000000-0000-0000-0000-000000000000	68513892-af8a-445b-bdef-d7b13fe4e3c6	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:10.77997+03	
00000000-0000-0000-0000-000000000000	3b18adfd-a0fc-461c-9be2-430d544e6d05	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:11.173103+03	
00000000-0000-0000-0000-000000000000	4eeb2183-893e-4298-b6e9-c28fe4809776	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:11.976482+03	
00000000-0000-0000-0000-000000000000	66818c67-69f4-4a57-b350-3dd2015d99bd	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:12.233022+03	
00000000-0000-0000-0000-000000000000	8487d87e-4a8f-4b91-8822-0f3233da5f53	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:13.199624+03	
00000000-0000-0000-0000-000000000000	ee0402f5-e3d8-4133-86e0-1f51350368d7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:13.526215+03	
00000000-0000-0000-0000-000000000000	5af68db3-8333-4f7b-9a5a-1ea503e4ff1e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:14.236241+03	
00000000-0000-0000-0000-000000000000	e342c056-5e5e-4e17-852b-ccadf2fd822f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:14.477495+03	
00000000-0000-0000-0000-000000000000	ef36e34c-c4fd-4fe5-871a-d9b9e5861079	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:15.182502+03	
00000000-0000-0000-0000-000000000000	07ac6c07-1659-4f8b-88e7-d16e8bf55965	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:15.620506+03	
00000000-0000-0000-0000-000000000000	8c497326-618e-479b-9e2e-75fd6b2cede4	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:16.338702+03	
00000000-0000-0000-0000-000000000000	97d772f8-afe4-43b1-a132-c181be2bd3f9	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:16.611623+03	
00000000-0000-0000-0000-000000000000	32541259-5fdc-4e34-bed7-4758977bb6b3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:17.338055+03	
00000000-0000-0000-0000-000000000000	ea159ec1-6ddc-4571-b42c-64fb16f010fb	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:17.582769+03	
00000000-0000-0000-0000-000000000000	ffd9bea9-8caa-415d-8675-1b314d9a4630	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:18.504014+03	
00000000-0000-0000-0000-000000000000	8d5aae95-754f-4fd6-b0cb-6ee4471ccbf7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:18.794978+03	
00000000-0000-0000-0000-000000000000	3054ddac-27f8-46fa-8659-79d88ebc8de6	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:19.645314+03	
00000000-0000-0000-0000-000000000000	01b2c476-baf5-457d-a185-a4f1807f20bf	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:20.072362+03	
00000000-0000-0000-0000-000000000000	bc069c45-7f12-4e05-ace5-973ca7170ddc	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:21.313124+03	
00000000-0000-0000-0000-000000000000	012830d6-555a-42fb-a731-4485a6e62891	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:21.501883+03	
00000000-0000-0000-0000-000000000000	99d377c5-d0e5-4bb2-9484-380127103c3b	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:22.658859+03	
00000000-0000-0000-0000-000000000000	60c1370b-9abd-4fe9-930c-747b67b1d7aa	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:22.942232+03	
00000000-0000-0000-0000-000000000000	d6f27695-3c93-4c42-a14c-9d13a0c0878c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:23.729961+03	
00000000-0000-0000-0000-000000000000	b09c3062-ab76-4b67-8a97-bcc808ce94a1	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:24.173702+03	
00000000-0000-0000-0000-000000000000	06eb029a-f97a-4d20-8189-09b972098ce5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:24.862628+03	
00000000-0000-0000-0000-000000000000	4d60e62e-4924-4d9c-9201-613fad9100f2	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:25.143659+03	
00000000-0000-0000-0000-000000000000	4078abcf-c119-4c24-ac1a-165a41028571	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:26.054465+03	
00000000-0000-0000-0000-000000000000	56184c07-e12f-40f8-8a00-880d04cefb04	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:26.293959+03	
00000000-0000-0000-0000-000000000000	b5479103-0985-4c25-9317-f2cb451f8fd7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:26.816481+03	
00000000-0000-0000-0000-000000000000	07b8afa4-d658-4d54-9752-4002f9d898cf	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:27.02272+03	
00000000-0000-0000-0000-000000000000	18b8f659-8f91-4906-92bb-d345bf68425b	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:27.554632+03	
00000000-0000-0000-0000-000000000000	9105a386-f59e-4d2a-9d1d-effe5f2d20e5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:27.751139+03	
00000000-0000-0000-0000-000000000000	9ac2df75-95da-4902-b1dc-dbb6894a9fda	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:28.269635+03	
00000000-0000-0000-0000-000000000000	bbfcd3cc-a18e-477a-a5d9-575cfbb66eaf	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:28.482284+03	
00000000-0000-0000-0000-000000000000	0a03bc44-7ce0-4339-bfa5-264cf8d1e298	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:29.043858+03	
00000000-0000-0000-0000-000000000000	edffe3fc-38f8-4430-9fb1-8e9a70ffbc6e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:29.246597+03	
00000000-0000-0000-0000-000000000000	65932dac-d07e-4a26-a618-a057054b819d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:29.999429+03	
00000000-0000-0000-0000-000000000000	1a0d7124-6a4d-44cb-8c4d-982550a351e3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:30.15174+03	
00000000-0000-0000-0000-000000000000	b052ad5e-504e-4a02-8d48-d4db2493b256	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:31.015669+03	
00000000-0000-0000-0000-000000000000	4775dc2d-a214-470e-98ee-a7f3593ee41c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:31.208621+03	
00000000-0000-0000-0000-000000000000	6d32ad09-ba9d-412a-bc37-48e4e36bdeb1	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:31.974244+03	
00000000-0000-0000-0000-000000000000	aa83fdbd-e409-4f3f-971c-5d79e35da1e3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:32.13099+03	
00000000-0000-0000-0000-000000000000	3bcf92d0-2f75-40f2-8ebd-bc4f6546e65a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:33.042266+03	
00000000-0000-0000-0000-000000000000	6c3c8b4d-40d0-4f49-9472-5471b56ac247	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:33.163317+03	
00000000-0000-0000-0000-000000000000	652613a3-6dd0-43e8-8641-6d00aa325417	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:33.90982+03	
00000000-0000-0000-0000-000000000000	4ed7e18a-dd69-4f0f-9980-34ed1b39bebc	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:34.04622+03	
00000000-0000-0000-0000-000000000000	6b4e5150-72de-4413-aa2a-88805fa9a3ca	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:34.744254+03	
00000000-0000-0000-0000-000000000000	7cb4599e-fddc-468b-b60f-52c6cd152184	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:34.843496+03	
00000000-0000-0000-0000-000000000000	77412d9d-28af-404b-9f9e-3adaa79bbec5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:35.548056+03	
00000000-0000-0000-0000-000000000000	7f78b8c8-b6a0-4516-8c9b-a58c59940cb7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:35.690826+03	
00000000-0000-0000-0000-000000000000	45ec04a5-f6b9-47d4-baff-98ffe0d11a45	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:36.41664+03	
00000000-0000-0000-0000-000000000000	0ef8bf1e-bf71-46a7-baf1-ee7b912fc6ae	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:36.607189+03	
00000000-0000-0000-0000-000000000000	9d84dec5-de3f-4c47-a74b-cf7b7d3af148	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:37.496678+03	
00000000-0000-0000-0000-000000000000	37af34bc-8dd5-45c9-a8f3-d9617f83537f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:37.650962+03	
00000000-0000-0000-0000-000000000000	87606874-8281-435b-904a-7c7dfa104b0a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:38.217769+03	
00000000-0000-0000-0000-000000000000	3b9e6e40-40a7-4de6-b83d-c2081cc7ead1	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:38.341083+03	
00000000-0000-0000-0000-000000000000	3457f57b-52af-46e7-9128-021ce6988462	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:38.9237+03	
00000000-0000-0000-0000-000000000000	ba5b88e9-427c-4a35-9958-95dbf669bca0	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:39.053908+03	
00000000-0000-0000-0000-000000000000	33432c06-46da-4b0c-940f-1fca9200fa30	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:39.883011+03	
00000000-0000-0000-0000-000000000000	3b219265-5111-423c-a512-55de4b2dd98a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:40.051791+03	
00000000-0000-0000-0000-000000000000	d083b3cc-00b3-4625-8cbc-ed114b68c3d7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:40.837219+03	
00000000-0000-0000-0000-000000000000	b7fdc14f-3978-42e8-9351-920f016da8f1	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:41.076601+03	
00000000-0000-0000-0000-000000000000	467fbbbb-ebd1-4c8a-bd88-a3915a992774	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:41.819769+03	
00000000-0000-0000-0000-000000000000	5b00ab69-4e3f-4225-aae3-d7d23397e220	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:41.954309+03	
00000000-0000-0000-0000-000000000000	5b416609-c02f-45ad-b115-378fe5d09288	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:43.363322+03	
00000000-0000-0000-0000-000000000000	486122a3-aa4d-40b9-b9b7-e3eae8fab2d3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:43.518284+03	
00000000-0000-0000-0000-000000000000	feb43b37-ffda-41dc-9141-007b082de931	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:44.298774+03	
00000000-0000-0000-0000-000000000000	d9eb2a6b-36bf-4f36-be01-cbfc686fa136	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:44.432081+03	
00000000-0000-0000-0000-000000000000	2f1a6715-f1a3-4b86-80e0-9bd783167b01	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:45.089239+03	
00000000-0000-0000-0000-000000000000	7f415066-c1a9-4644-8690-ab1541b5523d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:45.198208+03	
00000000-0000-0000-0000-000000000000	cc8c10e3-0c50-4235-bca4-de0838a4bed2	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:45.870724+03	
00000000-0000-0000-0000-000000000000	9bbecd3f-ed04-4327-9b00-486f3554e82d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:46.011598+03	
00000000-0000-0000-0000-000000000000	d870e0d6-346d-482c-af42-1d76e6cd7d8e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:46.709795+03	
00000000-0000-0000-0000-000000000000	48979c68-2b6e-4ee4-963b-8b7116c42fb9	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:46.852399+03	
00000000-0000-0000-0000-000000000000	856d6144-9fc3-41fe-a90f-5ded763b4dca	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:47.429752+03	
00000000-0000-0000-0000-000000000000	661a1e0f-17ea-4d71-b6d9-d79945fd37e4	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:47.57505+03	
00000000-0000-0000-0000-000000000000	14a261cd-d630-44ec-9b74-f2abd283c08c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:48.125217+03	
00000000-0000-0000-0000-000000000000	d9172db0-fb64-4dda-a630-235f825c47cf	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:48.265564+03	
00000000-0000-0000-0000-000000000000	d5b5873c-7424-49b0-b550-ec4ad40684fb	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:48.862713+03	
00000000-0000-0000-0000-000000000000	0cd20aaa-029a-4756-9fde-9a9916d6b310	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:49.02038+03	
00000000-0000-0000-0000-000000000000	22d6c61f-5ab0-4618-81cb-a1238bd5563d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:49.689962+03	
00000000-0000-0000-0000-000000000000	d01d2553-42b6-41f7-9a78-f96a5c03d0ee	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:49.880065+03	
00000000-0000-0000-0000-000000000000	65d5acb4-ed3d-4e47-9278-58e3c925cede	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:50.429019+03	
00000000-0000-0000-0000-000000000000	aee75b91-9f61-4252-af5f-45fc382368fa	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:50.6136+03	
00000000-0000-0000-0000-000000000000	870b09cd-c9ee-4644-b9e4-e93c95ca1f2c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:51.400683+03	
00000000-0000-0000-0000-000000000000	7c3c87fb-be43-4b96-b99f-02766d223939	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:51.59793+03	
00000000-0000-0000-0000-000000000000	fad1576e-0d8f-408a-acce-d365940261ec	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:52.177763+03	
00000000-0000-0000-0000-000000000000	254afde6-56a0-4b91-b9e5-ec3e65dc8159	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:52.462687+03	
00000000-0000-0000-0000-000000000000	621d06e2-02b8-433c-9fbf-2983c3e1321c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:53.285942+03	
00000000-0000-0000-0000-000000000000	1af2a269-9c2d-4f82-91f5-c4ed77b718c8	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:53.670236+03	
00000000-0000-0000-0000-000000000000	681304e6-e257-408b-aa08-58dc10ddf99c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:54.364022+03	
00000000-0000-0000-0000-000000000000	cddb92af-5df4-4381-8b05-c3e41984adab	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:54.792785+03	
00000000-0000-0000-0000-000000000000	d45489aa-0152-4be2-b028-1a80612f7ac5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:55.321979+03	
00000000-0000-0000-0000-000000000000	997fe4df-6ed5-430c-b7af-08b6523d0dc3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:55.663506+03	
00000000-0000-0000-0000-000000000000	d99ad9d3-47a3-402a-9621-865219a8be93	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:56.205006+03	
00000000-0000-0000-0000-000000000000	1d77f71c-4b1d-4248-bfaa-ab16f90d261e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:56.574196+03	
00000000-0000-0000-0000-000000000000	bd6ca67f-2b23-4d5d-ae59-d361189b7793	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:57.133255+03	
00000000-0000-0000-0000-000000000000	30c947e4-7f99-455e-834a-27c43389b898	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:57.473577+03	
00000000-0000-0000-0000-000000000000	f142e088-dcf0-4f55-9595-1e5e04410517	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:57.960773+03	
00000000-0000-0000-0000-000000000000	981c4918-bb9e-4987-8780-005959428b4d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:58.251825+03	
00000000-0000-0000-0000-000000000000	39b8faf2-7bdc-4989-810f-39ba5a4b25e5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:58.738996+03	
00000000-0000-0000-0000-000000000000	877d3fec-f348-49ea-a5bd-a6d91f6cdb75	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:59.076789+03	
00000000-0000-0000-0000-000000000000	65975a14-9760-4656-933d-b71d02a4d6a4	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:26:59.890577+03	
00000000-0000-0000-0000-000000000000	1712c1fa-a5b9-4466-a1da-dcc3fbf7a50f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:00.178607+03	
00000000-0000-0000-0000-000000000000	a210f1bc-2bbf-4c5e-a66b-3a88f6cd52f8	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:00.67786+03	
00000000-0000-0000-0000-000000000000	be224697-0c7f-4a28-96da-cff2b6ed5309	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:01.071193+03	
00000000-0000-0000-0000-000000000000	7d66649a-ab53-404e-82e5-6ff657806a6e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:01.622936+03	
00000000-0000-0000-0000-000000000000	cf1c23b2-381b-4b17-9296-571826c19b02	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:01.93188+03	
00000000-0000-0000-0000-000000000000	d9a8a68b-eb04-4a8d-bc45-ac5800e92bec	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:02.70375+03	
00000000-0000-0000-0000-000000000000	a392d419-87b8-4c4d-89ca-b4eb5da56ea2	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:03.023974+03	
00000000-0000-0000-0000-000000000000	260e23cf-323c-4e5b-b807-e33bc4d4346b	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:03.582736+03	
00000000-0000-0000-0000-000000000000	b5551413-2bbf-420b-aab5-0dffcd901f0b	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:03.812695+03	
00000000-0000-0000-0000-000000000000	a384e258-9d5b-48c4-9eae-99f1ffb8136c	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:04.368064+03	
00000000-0000-0000-0000-000000000000	885acd10-88e5-4fec-8bbd-40465eee6ed1	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:04.557337+03	
00000000-0000-0000-0000-000000000000	43793313-bd56-4c88-9436-6c8659a4de7e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:05.109443+03	
00000000-0000-0000-0000-000000000000	5efb040b-2103-4d80-bd35-a1cee2f60a69	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:05.330037+03	
00000000-0000-0000-0000-000000000000	052bfc57-7c25-4802-9b0d-1006acf693f9	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:05.909893+03	
00000000-0000-0000-0000-000000000000	c8b53813-bc6c-411b-aa83-6f51543bdc3f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:06.14906+03	
00000000-0000-0000-0000-000000000000	3a96be3f-82e0-4da4-ada4-0f98bc3d6f04	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:06.784483+03	
00000000-0000-0000-0000-000000000000	980d52bb-4a6b-486b-a246-bc3bf879f8f7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:07.045811+03	
00000000-0000-0000-0000-000000000000	edc2e8bf-98b1-4bf1-b2d4-65e462dcdee3	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:07.656826+03	
00000000-0000-0000-0000-000000000000	169d1c63-e1ae-4ebf-99a6-bae765356771	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:07.888454+03	
00000000-0000-0000-0000-000000000000	a5acc033-3ae2-434c-b3bf-25f22ad495a4	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:08.432348+03	
00000000-0000-0000-0000-000000000000	87b771a0-5ba9-47d2-b92d-92f4914eceb9	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:08.630629+03	
00000000-0000-0000-0000-000000000000	3944730b-8c89-4e87-8123-79f4d905771f	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:09.151252+03	
00000000-0000-0000-0000-000000000000	3efe3816-ef59-484e-86f0-4fb0edf2a941	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:09.378748+03	
00000000-0000-0000-0000-000000000000	dff4fbaa-66c9-4139-963c-a0f1d8152e86	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:10.099023+03	
00000000-0000-0000-0000-000000000000	0019448e-1ca7-4f4a-ad3a-1bd9d34d519e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:10.341405+03	
00000000-0000-0000-0000-000000000000	5174787b-4199-4e3e-8c30-78cf7517b5dd	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:11.105294+03	
00000000-0000-0000-0000-000000000000	7c54eaf1-8009-4d6d-9d84-97eb50faa67d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:11.354167+03	
00000000-0000-0000-0000-000000000000	343c6740-234e-42f1-ab9f-e1531be67c78	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:11.942375+03	
00000000-0000-0000-0000-000000000000	c4253904-8725-479f-a162-de6360a083f0	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:12.200169+03	
00000000-0000-0000-0000-000000000000	733933bd-47fe-4972-90c2-24b23ce8216a	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:12.969512+03	
00000000-0000-0000-0000-000000000000	f7a55dc5-223a-4f7b-9901-fae2ebe9995d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:13.261165+03	
00000000-0000-0000-0000-000000000000	67d68b09-43f0-457f-89e4-a7ab84262748	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:13.776279+03	
00000000-0000-0000-0000-000000000000	ed45dea0-a10c-44b5-9a35-283a89f669a5	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:14.043825+03	
00000000-0000-0000-0000-000000000000	f3723d30-ce2a-49ae-bbb8-31e6141b3a93	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:14.516761+03	
00000000-0000-0000-0000-000000000000	eabdf8cd-9f0a-4ad1-8dce-14d969c67d08	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:15.284279+03	
00000000-0000-0000-0000-000000000000	552567b8-a492-4318-b1d3-ad13240e3991	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:16.061952+03	
00000000-0000-0000-0000-000000000000	1629cad5-9df5-499f-b909-d5c913818515	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:16.897412+03	
00000000-0000-0000-0000-000000000000	c404fb6c-0d22-493e-aa30-9937cff53e01	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:17.77948+03	
00000000-0000-0000-0000-000000000000	62a8e1b2-ba08-417e-96ef-e764390dce31	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:18.550614+03	
00000000-0000-0000-0000-000000000000	4a40e79d-b7b1-4c5d-9330-122035c4eba2	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:19.314408+03	
00000000-0000-0000-0000-000000000000	da56ef2b-3a5a-4968-ae97-5fdb4394bc26	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:20.244826+03	
00000000-0000-0000-0000-000000000000	d989016d-c30f-4044-852a-af9edd7241d7	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:21.197636+03	
00000000-0000-0000-0000-000000000000	510af975-0cc7-4755-8df2-c4f87da9b605	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:22.203014+03	
00000000-0000-0000-0000-000000000000	71896b74-6fa2-4651-a76b-5b4b8a69ed1e	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:23.541075+03	
00000000-0000-0000-0000-000000000000	0eb96442-f93a-4b44-ac07-aac58749549d	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 12:27:24.863778+03	
00000000-0000-0000-0000-000000000000	6a9d6bb7-515c-4f3b-9be5-d7e7eee42ef8	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 13:27:39.42164+03	
00000000-0000-0000-0000-000000000000	8191024b-eb2b-432e-b14a-0bf69bd8c956	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 13:27:39.435234+03	
00000000-0000-0000-0000-000000000000	861b6f93-a4b9-4ceb-a473-fba118856816	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 17:21:40.66+03	
00000000-0000-0000-0000-000000000000	cbdce2d3-148f-4119-a134-6eb967b7ca95	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 17:21:40.678522+03	
00000000-0000-0000-0000-000000000000	5f8b1d88-6c75-4b1f-ad47-3e58d34be7ce	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 17:21:41.114395+03	
00000000-0000-0000-0000-000000000000	6439e6c7-2dba-44ef-a89b-451a13d031ae	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 18:23:56.522017+03	
00000000-0000-0000-0000-000000000000	2c0077d5-fb8d-4de8-a510-23e23aeaa7b9	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 18:23:56.535959+03	
00000000-0000-0000-0000-000000000000	7c09a86b-6d59-4243-9d96-684c4f5fc2ec	{"action":"token_refreshed","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 20:19:14.998505+03	
00000000-0000-0000-0000-000000000000	4b1c9085-e96c-492f-90f8-c78a9cfe2468	{"action":"token_revoked","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-23 20:19:15.015473+03	
00000000-0000-0000-0000-000000000000	290838f0-67e7-480f-b198-1a03a44d83e7	{"action":"login","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-23 23:35:40.606871+03	
00000000-0000-0000-0000-000000000000	44575f48-00e8-4122-93af-87043b3a3c19	{"action":"login","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-24 00:11:57.328303+03	
00000000-0000-0000-0000-000000000000	bf3247a7-7636-432d-b86c-4ce35fbf0717	{"action":"logout","actor_id":"7b33bff9-a0e6-4884-9093-7cfc328bfb3a","actor_username":"admin@demo.com","actor_via_sso":false,"log_type":"account"}	2026-02-24 00:15:58.742343+03	
00000000-0000-0000-0000-000000000000	f1f9e7f8-5803-4941-9993-5ff3b73d345a	{"action":"login","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-24 22:07:24.52143+03	
00000000-0000-0000-0000-000000000000	cbe00ef8-ca62-4aa7-be75-aead3e14f314	{"action":"token_refreshed","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-24 23:32:06.276024+03	
00000000-0000-0000-0000-000000000000	ab26f954-ed33-47d1-94a0-9aca26dc8b3e	{"action":"token_revoked","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-24 23:32:06.285587+03	
00000000-0000-0000-0000-000000000000	c1f8127a-89a7-4611-ae2a-d9bb6bb74240	{"action":"token_refreshed","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-25 06:08:13.952928+03	
00000000-0000-0000-0000-000000000000	cc217f88-24ca-4a63-a08f-f5a8297a5245	{"action":"token_revoked","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-25 06:08:13.961529+03	
00000000-0000-0000-0000-000000000000	33e86bc9-d1f6-4222-8a83-2b9c22bd2ae4	{"action":"token_refreshed","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-25 07:58:38.175757+03	
00000000-0000-0000-0000-000000000000	a0534fc8-27a1-4146-92ea-2696d6f97cb8	{"action":"token_revoked","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-25 07:58:38.185882+03	
00000000-0000-0000-0000-000000000000	ffd09030-53a5-42cd-93df-d0a79c7b130d	{"action":"token_refreshed","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-25 17:40:41.661604+03	
00000000-0000-0000-0000-000000000000	93a35ea1-ee44-4712-95f4-fdce568d4ee6	{"action":"token_revoked","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-25 17:40:41.675999+03	
00000000-0000-0000-0000-000000000000	4be69f11-84d8-44c0-80a1-7b999df3abdd	{"action":"token_refreshed","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-25 23:27:54.525666+03	
00000000-0000-0000-0000-000000000000	e24742c8-b1df-4e28-8952-a5c71a3cfb19	{"action":"token_revoked","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"token"}	2026-02-25 23:27:54.534162+03	
00000000-0000-0000-0000-000000000000	cd44605c-20a1-4375-8c67-31fd7a2b36a0	{"action":"logout","actor_id":"5117fa0a-92ee-4c40-b273-a70d398523c8","actor_username":"customer@demo.com","actor_via_sso":false,"log_type":"account"}	2026-02-25 23:28:36.589087+03	
00000000-0000-0000-0000-000000000000	c873d7f0-1635-4ff7-8209-5575360b0846	{"action":"login","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-02-25 23:29:38.561954+03	
00000000-0000-0000-0000-000000000000	ce9a3b5b-5a52-4c12-8c6b-9eed878f81f2	{"action":"token_refreshed","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-03-01 14:28:17.828997+03	
00000000-0000-0000-0000-000000000000	a55a45b7-c250-4679-9ddd-210f1e314dfd	{"action":"token_revoked","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-03-01 14:28:17.847179+03	
00000000-0000-0000-0000-000000000000	e81747d4-0261-4f80-ad7a-8d2f9844f617	{"action":"token_refreshed","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-03-01 20:06:54.56622+03	
00000000-0000-0000-0000-000000000000	b736155d-e182-47fa-84c6-8821b5ce3265	{"action":"token_revoked","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-03-01 20:06:54.592163+03	
00000000-0000-0000-0000-000000000000	56ea267e-aa4c-45f8-aa8b-ed61e894d5ab	{"action":"token_refreshed","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-03-01 21:11:16.093298+03	
00000000-0000-0000-0000-000000000000	49aac72f-e86d-4f55-a718-9a6e6c1894fe	{"action":"token_revoked","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-03-01 21:11:16.103637+03	
00000000-0000-0000-0000-000000000000	dcd9e018-05f6-4111-89a0-b7bacc24c7b5	{"action":"token_refreshed","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-03-01 22:09:30.426124+03	
00000000-0000-0000-0000-000000000000	016f166f-e24a-490f-bc80-6ffe00cd90e0	{"action":"token_revoked","actor_id":"8feb244e-05c7-48c7-9768-8793a0e56c3a","actor_username":"owner@demo.com","actor_via_sso":false,"log_type":"token"}	2026-03-01 22:09:30.443646+03	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
28027d92-3be3-4273-9155-f81f945cdca9	28027d92-3be3-4273-9155-f81f945cdca9	{"sub": "28027d92-3be3-4273-9155-f81f945cdca9", "phone": "905455567877", "email_verified": false, "phone_verified": false}	phone	2026-01-02 19:51:49.502736+03	2026-01-02 19:51:49.502779+03	2026-01-02 19:51:49.502779+03	9c00a24e-7069-4dc8-8f56-af0c767f0d9d
28027d92-3be3-4273-9155-f81f945cdca9	28027d92-3be3-4273-9155-f81f945cdca9	{"sub": "28027d92-3be3-4273-9155-f81f945cdca9", "email": "sad@saf.com", "email_verified": false, "phone_verified": false}	email	2026-01-02 19:51:49.49479+03	2026-01-02 19:51:49.49486+03	2026-01-02 19:51:49.49486+03	fef8d393-8951-4256-b127-6db299fcf120
49c8fd49-1921-41b7-a9b0-df0a3bc655a4	49c8fd49-1921-41b7-a9b0-df0a3bc655a4	{"sub": "49c8fd49-1921-41b7-a9b0-df0a3bc655a4", "phone": "905334565656", "email_verified": false, "phone_verified": false}	phone	2026-01-02 22:41:33.576499+03	2026-01-02 22:41:33.576531+03	2026-01-02 22:41:33.576531+03	cd4bcff9-b249-4388-aa1f-98dd2f4f5260
49c8fd49-1921-41b7-a9b0-df0a3bc655a4	49c8fd49-1921-41b7-a9b0-df0a3bc655a4	{"sub": "49c8fd49-1921-41b7-a9b0-df0a3bc655a4", "email": "sad@sad.xom", "email_verified": false, "phone_verified": false}	email	2026-01-02 22:41:33.574254+03	2026-01-02 22:41:33.5743+03	2026-01-02 22:41:33.5743+03	9567e4cb-1c66-4c81-ac5b-6107f8e58e7c
f9821af5-3930-4a83-8de9-8d434e7155aa	f9821af5-3930-4a83-8de9-8d434e7155aa	{"sub": "f9821af5-3930-4a83-8de9-8d434e7155aa", "phone": "905326045779", "email_verified": false, "phone_verified": false}	phone	2026-01-04 19:36:04.340777+03	2026-01-04 19:36:04.340873+03	2026-01-04 19:36:04.340873+03	458eba84-142a-414f-bbd6-9e1abe0304d0
f9821af5-3930-4a83-8de9-8d434e7155aa	f9821af5-3930-4a83-8de9-8d434e7155aa	{"sub": "f9821af5-3930-4a83-8de9-8d434e7155aa", "email": "myolal@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-01-04 19:36:04.329931+03	2026-01-04 19:36:04.329979+03	2026-01-04 19:36:04.329979+03	97f176f4-3b76-45d7-96fb-3e8b9c4af8cc
7b33bff9-a0e6-4884-9093-7cfc328bfb3a	7b33bff9-a0e6-4884-9093-7cfc328bfb3a	{"sub": "7b33bff9-a0e6-4884-9093-7cfc328bfb3a", "email": "admin@demo.com", "email_verified": false, "phone_verified": false}	email	2026-01-24 23:19:15.307684+03	2026-01-24 23:19:15.30786+03	2026-01-24 23:19:15.30786+03	8358eca9-14b7-4b29-aef7-39d369a86634
8feb244e-05c7-48c7-9768-8793a0e56c3a	8feb244e-05c7-48c7-9768-8793a0e56c3a	{"sub": "8feb244e-05c7-48c7-9768-8793a0e56c3a", "email": "owner@demo.com", "email_verified": false, "phone_verified": false}	email	2026-01-24 23:19:15.643468+03	2026-01-24 23:19:15.643562+03	2026-01-24 23:19:15.643562+03	119eb233-b403-462c-a62e-db129ff46ef6
3505f73c-9b90-4a39-9620-3c512f3ac1d2	3505f73c-9b90-4a39-9620-3c512f3ac1d2	{"sub": "3505f73c-9b90-4a39-9620-3c512f3ac1d2", "email": "staff@demo.com", "email_verified": false, "phone_verified": false}	email	2026-01-24 23:19:15.94046+03	2026-01-24 23:19:15.940507+03	2026-01-24 23:19:15.940507+03	9762d415-8816-4826-a94d-6f6424021f20
5117fa0a-92ee-4c40-b273-a70d398523c8	5117fa0a-92ee-4c40-b273-a70d398523c8	{"sub": "5117fa0a-92ee-4c40-b273-a70d398523c8", "email": "customer@demo.com", "email_verified": false, "phone_verified": false}	email	2026-01-24 23:19:16.218614+03	2026-01-24 23:19:16.218657+03	2026-01-24 23:19:16.218657+03	f172859a-8f2c-4854-a768-18811e172f96
2720fc9a-e89a-410c-a613-38834fb1669a	2720fc9a-e89a-410c-a613-38834fb1669a	{"sub": "2720fc9a-e89a-410c-a613-38834fb1669a", "email": "5326045780@pending.user", "email_verified": false, "phone_verified": false}	email	2026-01-24 23:21:52.457533+03	2026-01-24 23:21:52.457577+03	2026-01-24 23:21:52.457577+03	624f8e63-2456-4d4d-af46-86296aea36eb
2720fc9a-e89a-410c-a613-38834fb1669a	2720fc9a-e89a-410c-a613-38834fb1669a	{"sub": "2720fc9a-e89a-410c-a613-38834fb1669a", "phone": "905326045780", "email_verified": false, "phone_verified": false}	phone	2026-01-24 23:21:52.459608+03	2026-01-24 23:21:52.459647+03	2026-01-24 23:21:52.459647+03	2ac76b3d-66cd-432c-a2ec-0374bdbd6866
743cd2aa-3ce6-4e49-8120-7c45e021e411	743cd2aa-3ce6-4e49-8120-7c45e021e411	{"sub": "743cd2aa-3ce6-4e49-8120-7c45e021e411", "email": "5324565577@pending.user", "email_verified": false, "phone_verified": false}	email	2026-01-25 00:15:53.18317+03	2026-01-25 00:15:53.183207+03	2026-01-25 00:15:53.183207+03	b51bb9be-9eff-4b0e-bc05-f414ce083699
743cd2aa-3ce6-4e49-8120-7c45e021e411	743cd2aa-3ce6-4e49-8120-7c45e021e411	{"sub": "743cd2aa-3ce6-4e49-8120-7c45e021e411", "phone": "905324565577", "email_verified": false, "phone_verified": false}	phone	2026-01-25 00:15:53.185068+03	2026-01-25 00:15:53.185099+03	2026-01-25 00:15:53.185099+03	7f01720e-f75e-4ea0-9578-7c836ec1088e
aa084b47-7c37-43ee-8901-75bdb1cdcb68	aa084b47-7c37-43ee-8901-75bdb1cdcb68	{"sub": "aa084b47-7c37-43ee-8901-75bdb1cdcb68", "email": "5324443322@pending.user", "email_verified": false, "phone_verified": false}	email	2026-01-25 00:22:43.857493+03	2026-01-25 00:22:43.857533+03	2026-01-25 00:22:43.857533+03	a3d15f97-dae9-441f-89ea-d03cd99f7cc0
aa084b47-7c37-43ee-8901-75bdb1cdcb68	aa084b47-7c37-43ee-8901-75bdb1cdcb68	{"sub": "aa084b47-7c37-43ee-8901-75bdb1cdcb68", "phone": "905324443322", "email_verified": false, "phone_verified": false}	phone	2026-01-25 00:22:43.859448+03	2026-01-25 00:22:43.859481+03	2026-01-25 00:22:43.859481+03	07e5bfde-ee6e-4d84-8966-7e0e12290ab2
a7f8376d-d486-49aa-8fd5-9202c47e9145	a7f8376d-d486-49aa-8fd5-9202c47e9145	{"sub": "a7f8376d-d486-49aa-8fd5-9202c47e9145", "email": "5432346677@pending.user", "email_verified": false, "phone_verified": false}	email	2026-01-25 00:27:41.452141+03	2026-01-25 00:27:41.452185+03	2026-01-25 00:27:41.452185+03	27601e1d-e7bb-4852-a1c5-c660112d9f70
a7f8376d-d486-49aa-8fd5-9202c47e9145	a7f8376d-d486-49aa-8fd5-9202c47e9145	{"sub": "a7f8376d-d486-49aa-8fd5-9202c47e9145", "phone": "905432346677", "email_verified": false, "phone_verified": false}	phone	2026-01-25 00:27:41.453766+03	2026-01-25 00:27:41.453813+03	2026-01-25 00:27:41.453813+03	9e66ace4-d3ae-4de5-9ab0-5b139262c849
0ec8a69e-1bda-4cf7-ab95-7b635d2f4859	0ec8a69e-1bda-4cf7-ab95-7b635d2f4859	{"sub": "0ec8a69e-1bda-4cf7-ab95-7b635d2f4859", "role": "CUSTOMER", "email": "customer2@demo.com", "full_name": "customer2 customer2", "last_name": "customer2", "first_name": "customer2", "email_verified": false, "phone_verified": false}	email	2026-01-26 00:00:42.465992+03	2026-01-26 00:00:42.466048+03	2026-01-26 00:00:42.466048+03	4ca77c27-d178-4b89-930e-4c26fd028f3a
090ed181-87ee-4c19-b0dc-1828ad0ebfd3	090ed181-87ee-4c19-b0dc-1828ad0ebfd3	{"sub": "090ed181-87ee-4c19-b0dc-1828ad0ebfd3", "role": "SALON_OWNER", "email": "owner2@demo.com", "full_name": "owner2 owner2", "last_name": "owner2", "first_name": "owner2", "email_verified": false, "phone_verified": false}	email	2026-01-26 00:03:21.140358+03	2026-01-26 00:03:21.14039+03	2026-01-26 00:03:21.14039+03	90e16aea-f3ab-4da6-ba45-96fb2cb385d6
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
a4f1df7a-0ba2-494d-bc35-7a3c9da9b92e	2026-01-02 19:51:50.137652+03	2026-01-02 19:51:50.137652+03	password	98b5b294-d739-4286-9c44-763dec9aa6f0
983adcc6-9e36-45c1-a298-2c89e884831b	2026-02-23 23:35:40.658644+03	2026-02-23 23:35:40.658644+03	password	0dbb484d-f3b5-422f-a53d-f807b5b103a2
876c36c8-2573-4958-ae1f-96aad7f6b3c0	2026-02-25 23:29:38.602919+03	2026-02-25 23:29:38.602919+03	password	56e0eda7-9359-461b-abb3-4dee749a793d
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	drzqjsvag35a	28027d92-3be3-4273-9155-f81f945cdca9	t	2026-01-02 19:51:50.120856+03	2026-01-02 22:02:58.488482+03	\N	a4f1df7a-0ba2-494d-bc35-7a3c9da9b92e
00000000-0000-0000-0000-000000000000	2	d5f4wy2mxscw	28027d92-3be3-4273-9155-f81f945cdca9	f	2026-01-02 22:02:58.494701+03	2026-01-02 22:02:58.494701+03	drzqjsvag35a	a4f1df7a-0ba2-494d-bc35-7a3c9da9b92e
00000000-0000-0000-0000-000000000000	133	7qak76ullzus	8feb244e-05c7-48c7-9768-8793a0e56c3a	f	2026-02-23 23:35:40.648229+03	2026-02-23 23:35:40.648229+03	\N	983adcc6-9e36-45c1-a298-2c89e884831b
00000000-0000-0000-0000-000000000000	141	ff7untz7uz42	8feb244e-05c7-48c7-9768-8793a0e56c3a	t	2026-02-25 23:29:38.590079+03	2026-03-01 14:28:17.852577+03	\N	876c36c8-2573-4958-ae1f-96aad7f6b3c0
00000000-0000-0000-0000-000000000000	142	ujjmme3ksxjp	8feb244e-05c7-48c7-9768-8793a0e56c3a	t	2026-03-01 14:28:17.871243+03	2026-03-01 20:06:54.596648+03	ff7untz7uz42	876c36c8-2573-4958-ae1f-96aad7f6b3c0
00000000-0000-0000-0000-000000000000	143	ky3yiq76i2av	8feb244e-05c7-48c7-9768-8793a0e56c3a	t	2026-03-01 20:06:54.624054+03	2026-03-01 21:11:16.105672+03	ujjmme3ksxjp	876c36c8-2573-4958-ae1f-96aad7f6b3c0
00000000-0000-0000-0000-000000000000	144	akignhyakuoa	8feb244e-05c7-48c7-9768-8793a0e56c3a	t	2026-03-01 21:11:16.110341+03	2026-03-01 22:09:30.450785+03	ky3yiq76i2av	876c36c8-2573-4958-ae1f-96aad7f6b3c0
00000000-0000-0000-0000-000000000000	145	avwsiw2zw3xe	8feb244e-05c7-48c7-9768-8793a0e56c3a	f	2026-03-01 22:09:30.458634+03	2026-03-01 22:09:30.458634+03	akignhyakuoa	876c36c8-2573-4958-ae1f-96aad7f6b3c0
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
a4f1df7a-0ba2-494d-bc35-7a3c9da9b92e	28027d92-3be3-4273-9155-f81f945cdca9	2026-01-02 19:51:50.099997+03	2026-01-02 22:02:58.499792+03	\N	aal1	\N	2026-01-02 19:02:58.49966	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	172.21.0.1	\N	\N	\N	\N	\N
876c36c8-2573-4958-ae1f-96aad7f6b3c0	8feb244e-05c7-48c7-9768-8793a0e56c3a	2026-02-25 23:29:38.568213+03	2026-03-01 22:09:30.471051+03	\N	aal1	\N	2026-03-01 19:09:30.470855	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	172.21.0.1	\N	\N	\N	\N	\N
983adcc6-9e36-45c1-a298-2c89e884831b	8feb244e-05c7-48c7-9768-8793a0e56c3a	2026-02-23 23:35:40.616443+03	2026-02-23 23:35:40.616443+03	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	172.21.0.1	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\N	1275f9b6-9e9b-4fcb-909b-7ac1532a350b	authenticated	authenticated	owner1@example.com	$2a$06$70G51s7VkktEiYX8OxZnruzgBV5EWuZwGzxRIWIznMfMkytzaUyca	2026-01-02 19:44:57.716114+03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"full_name": "Mehmet Salon Sahibi"}	\N	2026-01-02 19:44:57.716114+03	2026-01-02 19:44:57.716114+03	\N	\N			\N		0	\N		\N	f	\N	f
\N	92242964-46e0-4867-9737-cfc728dd375b	authenticated	authenticated	owner2@example.com	$2a$06$PHEJs6zPh9UIICjopZQh.eB0RAK2vF5CHhSmtN2D48JWRbcEZf70G	2026-01-02 19:44:57.716114+03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"full_name": "Ayşe İşletmeci"}	\N	2026-01-02 19:44:57.716114+03	2026-01-02 19:44:57.716114+03	\N	\N			\N		0	\N		\N	f	\N	f
\N	fe908fc7-4b40-4482-b2f2-c0d57fd97aa5	authenticated	authenticated	owner3@example.com	$2a$06$mDVKX9xdB.QX5RCZHFmm1O0lDhtYDbDpSrHpgie.6VQVWi.Y/Tq4O	2026-01-02 19:44:57.716114+03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"full_name": "Ahmet Kuaför"}	\N	2026-01-02 19:44:57.716114+03	2026-01-02 19:44:57.716114+03	\N	\N			\N		0	\N		\N	f	\N	f
\N	c5c287f9-9564-4998-9b53-8513ae013d14	authenticated	authenticated	owner4@example.com	$2a$06$id47xrIc9CLX45fUwtRm/uCkL/rRakYAXNPMOC.Wwfi/DIVZL9zmC	2026-01-02 19:44:57.716114+03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"full_name": "Zeynep Güzellik"}	\N	2026-01-02 19:44:57.716114+03	2026-01-02 19:44:57.716114+03	\N	\N			\N		0	\N		\N	f	\N	f
\N	258280de-707a-4d75-b0e7-89869cc55b6c	authenticated	authenticated	owner5@example.com	$2a$06$jFf5jWJJyjBxhT93HGrRyuaKVQG4kG6NaNKInIAAUj0wP/v8D2wYm	2026-01-02 19:44:57.716114+03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"full_name": "Can Berber"}	\N	2026-01-02 19:44:57.716114+03	2026-01-02 19:44:57.716114+03	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	28027d92-3be3-4273-9155-f81f945cdca9	authenticated	authenticated	sad@saf.com	$2a$10$C4czoRoOcDzszOMkf.KAH.2F1zU9NbbIMR3gGzWgtq.YIshPXXfy.	2026-01-02 19:51:49.513726+03	\N		\N		\N			\N	2026-01-02 19:51:50.099909+03	{"provider": "email", "providers": ["email", "phone"]}	{"email_verified": true}	\N	2026-01-02 19:51:49.472869+03	2026-01-02 22:02:58.497506+03	905455567877	2026-01-02 19:51:49.528004+03			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	3505f73c-9b90-4a39-9620-3c512f3ac1d2	authenticated	authenticated	staff@demo.com	$2a$10$wzQk2e1qjifA/v4Dm1Fgbem/SZCtmOgDX6fH0D815TjjiUezw22aG	2026-01-24 23:19:15.947817+03	\N		\N		\N			\N	2026-01-25 15:15:49.04142+03	{"provider": "email", "providers": ["email"]}	{"role": "STAFF", "last_name": "User", "first_name": "Staff", "email_verified": true}	\N	2026-01-24 23:19:15.925749+03	2026-01-25 15:15:49.054507+03	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7b33bff9-a0e6-4884-9093-7cfc328bfb3a	authenticated	authenticated	admin@demo.com	$2a$10$T8m762IxvTgmREY4W3d50egVUsSaZB1ZQ1Jr1IxGHpddQLnJv/D/y	2026-01-24 23:19:15.328186+03	\N		\N		\N			\N	2026-02-24 00:11:57.335407+03	{"provider": "email", "providers": ["email"]}	{"role": "SUPER_ADMIN", "last_name": "User", "first_name": "Admin", "email_verified": true}	\N	2026-01-24 23:19:15.281831+03	2026-02-24 00:11:57.37398+03	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	49c8fd49-1921-41b7-a9b0-df0a3bc655a4	authenticated	authenticated	sad@sad.xom	$2a$10$OxQ9bT2WA5d4CvxNJ9FVjeTKqUJ6pAxJS3XV2RkhQgoH8.jD9RDe2	2026-01-02 22:41:33.580638+03	\N		\N		\N			\N	2026-01-02 22:41:33.956444+03	{"provider": "email", "providers": ["email", "phone"]}	{"email_verified": true}	\N	2026-01-02 22:41:33.56006+03	2026-01-04 18:31:17.518301+03	905334565656	2026-01-02 22:41:33.585298+03			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	f9821af5-3930-4a83-8de9-8d434e7155aa	authenticated	authenticated	myolal@gmail.com	$2a$06$g/0uOeA3nn978GZgz.N/luBUsZ0575luAfOmWpMjPYVkiW1EwKgaW	2026-01-04 19:36:04.359745+03	\N		\N		\N			\N	2026-01-25 01:35:07.435112+03	{"provider": "email", "providers": ["email", "phone"]}	{"email_verified": true}	\N	2026-01-04 19:36:04.30084+03	2026-01-25 01:35:07.449214+03	905326045779	2026-01-04 19:36:04.376827+03			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	743cd2aa-3ce6-4e49-8120-7c45e021e411	authenticated	authenticated	5324565577@pending.user	$2a$10$yUEvrtVmS4PhT3hWgiU0BOfvwV36YyjYvAcQIPLE/F62lY3Evfo1e	2026-01-25 00:15:53.190078+03	\N		\N		\N			\N	2026-01-25 00:15:53.675116+03	{"provider": "email", "providers": ["email", "phone"]}	{"email_verified": true}	\N	2026-01-25 00:15:53.171065+03	2026-01-25 00:15:53.698748+03	905324565577	2026-01-25 00:15:53.195248+03			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	aa084b47-7c37-43ee-8901-75bdb1cdcb68	authenticated	authenticated	5324443322@pending.user	$2a$10$qYHwHeL07/bDFi/9ohj1hOVCj4zxHWbz.tVJVnxmGqyWDnSumhWfa	2026-01-25 00:22:43.866927+03	\N		\N		\N			\N	2026-01-25 00:22:44.352505+03	{"provider": "email", "providers": ["email", "phone"]}	{"email_verified": true}	\N	2026-01-25 00:22:43.843978+03	2026-01-25 00:22:44.372292+03	905324443322	2026-01-25 00:22:43.873589+03			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	2720fc9a-e89a-410c-a613-38834fb1669a	authenticated	authenticated	5326045780@pending.user	$2a$10$t5UfwuMNUjOp8xm3tEov..VjoHCa0FXqMNIxxucdKX5MhNYeixuzS	2026-01-24 23:21:52.464385+03	\N		\N		\N			\N	2026-01-24 23:21:52.871387+03	{"provider": "email", "providers": ["email", "phone"]}	{"email_verified": true}	\N	2026-01-24 23:21:52.443876+03	2026-01-24 23:21:52.89835+03	905326045780	2026-01-24 23:21:52.469735+03			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a7f8376d-d486-49aa-8fd5-9202c47e9145	authenticated	authenticated	5432346677@pending.user	$2a$10$MHSzcImF0ACLYBUTzy2Diei2cGhaPU19VJvVbejZGXkz8qoP.hfqK	2026-01-25 00:27:41.457558+03	\N		\N		\N			\N	2026-01-25 00:27:41.832732+03	{"provider": "email", "providers": ["email", "phone"]}	{"email_verified": true}	\N	2026-01-25 00:27:41.43974+03	2026-01-25 00:27:41.851977+03	905432346677	2026-01-25 00:27:41.462934+03			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	5117fa0a-92ee-4c40-b273-a70d398523c8	authenticated	authenticated	customer@demo.com	$2a$10$IQwneKAvoto6sFcR1RfCbOJnwDtNQAPRgCm10q8F81k9ab/9S/oBu	2026-01-24 23:19:16.225153+03	\N		\N		\N			\N	2026-02-24 22:07:24.530793+03	{"provider": "email", "providers": ["email"]}	{"role": "CUSTOMER", "last_name": "User", "first_name": "Customer", "email_verified": true}	\N	2026-01-24 23:19:16.202587+03	2026-02-25 23:27:54.547591+03	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	8feb244e-05c7-48c7-9768-8793a0e56c3a	authenticated	authenticated	owner@demo.com	$2a$10$z3gpRGd.MwLunB9eHneUi.9j7hfofE2OLsLvVgqrjU/8XimmpBVsa	2026-01-24 23:19:15.65149+03	\N		\N		\N			\N	2026-02-25 23:29:38.567833+03	{"provider": "email", "providers": ["email"]}	{"role": "SALON_OWNER", "last_name": "User", "first_name": "Owner", "email_verified": true}	\N	2026-01-24 23:19:15.621826+03	2026-03-01 22:09:30.465783+03	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	090ed181-87ee-4c19-b0dc-1828ad0ebfd3	authenticated	authenticated	owner2@demo.com	$2a$10$jr0Sz6guwnptmhLqdIm1K.2RROP3A8JGZtkS7VpfTemJMWuoPfXhe	2026-01-26 00:03:21.145164+03	\N		\N		\N			\N	2026-02-10 21:28:46.880267+03	{"provider": "email", "providers": ["email"]}	{"sub": "090ed181-87ee-4c19-b0dc-1828ad0ebfd3", "role": "SALON_OWNER", "email": "owner2@demo.com", "full_name": "owner2 owner2", "last_name": "owner2", "first_name": "owner2", "email_verified": true, "phone_verified": false}	\N	2026-01-26 00:03:21.12473+03	2026-02-10 21:28:46.910414+03	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0ec8a69e-1bda-4cf7-ab95-7b635d2f4859	authenticated	authenticated	customer2@demo.com	$2a$10$JfP9nzoBRVCrQS6e01kyDuHEsojGHISGkav9duDqtOeILYc86HO92	2026-01-26 00:00:42.482462+03	\N		\N		\N			\N	2026-01-26 00:00:42.524067+03	{"provider": "email", "providers": ["email"]}	{"sub": "0ec8a69e-1bda-4cf7-ab95-7b635d2f4859", "role": "CUSTOMER", "email": "customer2@demo.com", "full_name": "customer2 customer2", "last_name": "customer2", "first_name": "customer2", "email_verified": true, "phone_verified": false}	\N	2026-01-26 00:00:42.435569+03	2026-01-26 00:00:42.554434+03	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: appointment_coupons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointment_coupons (id, appointment_id, coupon_id, discount_amount, created_at) FROM stdin;
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, customer_id, customer_name, customer_phone, salon_id, staff_id, salon_service_id, start_time, end_time, status, notes, created_at, updated_at, coupon_code, discount_amount, first_name, last_name, email) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, salon_id, user_id, action, resource_type, resource_id, changes, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: change_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.change_requests (id, requester_id, salon_id, type, data, status, admin_note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cities (id, name, plate_code, created_at, latitude, longitude) FROM stdin;
8212fda3-ca52-42c3-9863-2a251eb224e8	Adana	1	2026-02-02 00:34:27.341252+03	37.00000000	35.32130000
816ffa49-0b30-4882-9a4f-2938714c85fa	Adıyaman	2	2026-02-02 00:34:27.341252+03	\N	\N
2df872c8-a9f1-46f2-b08b-bc22623450c4	Afyonkarahisar	3	2026-02-02 00:34:27.341252+03	\N	\N
4d1923c6-d4c3-4fb5-9ea3-3e76f0cc784f	Ağrı	4	2026-02-02 00:34:27.341252+03	\N	\N
f88c460e-cf17-416e-a0bf-95b451b04edd	Amasya	5	2026-02-02 00:34:27.341252+03	\N	\N
44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Ankara	6	2026-02-02 00:34:27.341252+03	39.92080000	32.85410000
df49a14f-ccf1-4601-a364-5c3345489e95	Antalya	7	2026-02-02 00:34:27.341252+03	36.89690000	30.71330000
2ada442c-e635-4e7b-8843-b1c3a79de31f	Artvin	8	2026-02-02 00:34:27.341252+03	\N	\N
f64725e9-2f15-4c87-8481-f488e35a7b23	Aydın	9	2026-02-02 00:34:27.341252+03	\N	\N
a4d5c1c1-abd7-4638-b36d-91419025c163	Balıkesir	10	2026-02-02 00:34:27.341252+03	\N	\N
2b582c7e-15d9-4e26-9300-a424557488ec	Bilecik	11	2026-02-02 00:34:27.341252+03	\N	\N
4f8c649a-cfe8-4cca-ae8f-0405699cbe3d	Bingöl	12	2026-02-02 00:34:27.341252+03	\N	\N
2039c3e9-4eba-4006-a2c4-48176cfaf62e	Bitlis	13	2026-02-02 00:34:27.341252+03	\N	\N
77134ebc-e9c9-43d5-9b52-5ea448f8350c	Bolu	14	2026-02-02 00:34:27.341252+03	\N	\N
a529eb0b-3964-4a34-bf29-84cc66935472	Burdur	15	2026-02-02 00:34:27.341252+03	\N	\N
b13ae5f5-6205-4b73-8d28-766ac906490d	Bursa	16	2026-02-02 00:34:27.341252+03	40.18850000	29.06100000
b6e9e611-1c41-438d-b503-84ce62589c15	Çanakkale	17	2026-02-02 00:34:27.341252+03	\N	\N
75631889-be63-428c-8ac9-c946eab0e9ad	Çankırı	18	2026-02-02 00:34:27.341252+03	\N	\N
aecd7c6b-3323-464b-be28-8e2cd20c31d8	Çorum	19	2026-02-02 00:34:27.341252+03	\N	\N
c39765c1-b95e-4225-b793-5c0d081fc35a	Denizli	20	2026-02-02 00:34:27.341252+03	\N	\N
b085c884-69dc-44f6-8204-804d21cf6469	Diyarbakır	21	2026-02-02 00:34:27.341252+03	\N	\N
54cac68a-e169-4267-83b2-5e207cf15138	Edirne	22	2026-02-02 00:34:27.341252+03	\N	\N
a2bba858-638d-4fa1-9f87-8cac2192dbfb	Elazığ	23	2026-02-02 00:34:27.341252+03	\N	\N
221b0853-de01-4a6e-bc7d-0eb4b1ad374b	Erzincan	24	2026-02-02 00:34:27.341252+03	\N	\N
9dda42fc-1928-4ed5-81e5-25f4b66451c1	Erzurum	25	2026-02-02 00:34:27.341252+03	\N	\N
10aada70-03b8-4a0e-acd9-ac95e0a99642	Eskişehir	26	2026-02-02 00:34:27.341252+03	\N	\N
e3ee9854-bd33-4f3b-a439-48e4100741a8	Gaziantep	27	2026-02-02 00:34:27.341252+03	37.06620000	37.38330000
75642ef5-64f3-4042-a973-a77c012d930a	Giresun	28	2026-02-02 00:34:27.341252+03	\N	\N
50c11c63-816e-4812-94c9-93b07b56dbeb	Gümüşhane	29	2026-02-02 00:34:27.341252+03	\N	\N
512bf12c-cfbb-45d1-a06c-cfe7708e793c	Hakkari	30	2026-02-02 00:34:27.341252+03	\N	\N
b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Hatay	31	2026-02-02 00:34:27.341252+03	\N	\N
d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Isparta	32	2026-02-02 00:34:27.341252+03	\N	\N
e9e3713a-8018-4194-aef2-0abc3e1b5695	Mersin	33	2026-02-02 00:34:27.341252+03	\N	\N
01cf7a28-5f36-462e-8016-1fecb08baf06	İstanbul	34	2026-02-02 00:34:27.341252+03	41.00820000	28.97840000
422ddccc-6602-4215-9e78-d6c577bff092	İzmir	35	2026-02-02 00:34:27.341252+03	38.42370000	27.14280000
0a005488-c8d0-4031-8f4f-e7f94599523b	Kars	36	2026-02-02 00:34:27.341252+03	\N	\N
6f8232be-31ea-4b22-b06a-186ee3d832a8	Kastamonu	37	2026-02-02 00:34:27.341252+03	\N	\N
f9bc0ccf-3697-45ab-b693-927232e27609	Kayseri	38	2026-02-02 00:34:27.341252+03	\N	\N
3bccf67c-36b0-4332-8ff3-f52309c0b350	Kırklareli	39	2026-02-02 00:34:27.341252+03	\N	\N
76ac83da-947d-4572-85f9-f540920426f8	Kırşehir	40	2026-02-02 00:34:27.341252+03	\N	\N
098af2d5-99ef-444c-be61-64e960b184e5	Kocaeli	41	2026-02-02 00:34:27.341252+03	\N	\N
c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Konya	42	2026-02-02 00:34:27.341252+03	37.86670000	32.48330000
61537279-6d97-4a3e-a55c-339dd133a4ef	Kütahya	43	2026-02-02 00:34:27.341252+03	\N	\N
66467353-5f67-471d-b20a-3dcd62a830ea	Malatya	44	2026-02-02 00:34:27.341252+03	\N	\N
25922708-10c2-4fb1-9c18-0572cc79a83e	Manisa	45	2026-02-02 00:34:27.341252+03	\N	\N
6a77af0d-7c5c-4f51-87b1-f690f7165e76	Kahramanmaraş	46	2026-02-02 00:34:27.341252+03	\N	\N
47d72264-11e6-4472-8421-24c085eee7e1	Mardin	47	2026-02-02 00:34:27.341252+03	\N	\N
507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Muğla	48	2026-02-02 00:34:27.341252+03	\N	\N
45390b70-bbd4-4a91-8cfc-ed6839e337d2	Muş	49	2026-02-02 00:34:27.341252+03	\N	\N
85c5a225-99fa-4b40-87f6-b7e03790d763	Nevşehir	50	2026-02-02 00:34:27.341252+03	\N	\N
c3ea0e58-1633-4a7c-83fc-3fbafd277956	Niğde	51	2026-02-02 00:34:27.341252+03	\N	\N
bba3907f-4835-41bb-aed6-0b85b1de59eb	Ordu	52	2026-02-02 00:34:27.341252+03	\N	\N
59309b87-5408-409a-9861-c1fe8c36ff55	Rize	53	2026-02-02 00:34:27.341252+03	\N	\N
055fe39c-70de-4ce3-9a1c-2b66bb64194e	Sakarya	54	2026-02-02 00:34:27.341252+03	\N	\N
48b84cc5-06e9-40d0-815c-20571634527b	Samsun	55	2026-02-02 00:34:27.341252+03	\N	\N
b26de852-ff4a-49ae-93be-ffb79e1ddbb5	Siirt	56	2026-02-02 00:34:27.341252+03	\N	\N
b941a495-235b-4e07-b2f0-f0efb97cfcbb	Sinop	57	2026-02-02 00:34:27.341252+03	\N	\N
3a37f9f8-f742-4b90-ab4c-f35f5744552d	Sivas	58	2026-02-02 00:34:27.341252+03	\N	\N
1513f78e-93cb-4e3f-b4a9-4682840a2142	Tekirdağ	59	2026-02-02 00:34:27.341252+03	\N	\N
85f52530-8272-4700-bd71-d9a7466b2a6b	Tokat	60	2026-02-02 00:34:27.341252+03	\N	\N
084aa259-cca2-480c-b453-97d6d75fd502	Trabzon	61	2026-02-02 00:34:27.341252+03	\N	\N
2d9c28fe-153c-4f46-a5a6-dbaa166c761d	Tunceli	62	2026-02-02 00:34:27.341252+03	\N	\N
f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Şanlıurfa	63	2026-02-02 00:34:27.341252+03	\N	\N
87f9f8d3-ee45-484b-8b5d-2f3d645b4293	Uşak	64	2026-02-02 00:34:27.341252+03	\N	\N
28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Van	65	2026-02-02 00:34:27.341252+03	\N	\N
56ef44a4-8794-437a-990c-33eae64cc47d	Yozgat	66	2026-02-02 00:34:27.341252+03	\N	\N
9ccb2d5d-91d8-427a-8b65-f872b586df11	Zonguldak	67	2026-02-02 00:34:27.341252+03	\N	\N
399797e2-f3e0-4f16-b10d-b7cca32ab6a2	Aksaray	68	2026-02-02 00:34:27.341252+03	\N	\N
41b28404-ecde-4acd-981b-0cf37ac616de	Bayburt	69	2026-02-02 00:34:27.341252+03	\N	\N
010be9f9-2dbb-4bbc-bed9-35200fce6468	Karaman	70	2026-02-02 00:34:27.341252+03	\N	\N
04a315cb-c614-427c-ae2e-823d578855dc	Kırıkkale	71	2026-02-02 00:34:27.341252+03	\N	\N
4c66a399-9c95-4c80-b5cf-ffd035588392	Batman	72	2026-02-02 00:34:27.341252+03	\N	\N
08c79725-94b9-43c6-8099-f1618ce854ad	Şırnak	73	2026-02-02 00:34:27.341252+03	\N	\N
1a19cf20-1217-48fc-b345-59ea8124fdae	Bartın	74	2026-02-02 00:34:27.341252+03	\N	\N
78d73c4a-7777-4119-9da8-acf683349905	Ardahan	75	2026-02-02 00:34:27.341252+03	\N	\N
b5fac3ec-8589-4395-8b2c-ba0841251c1a	Iğdır	76	2026-02-02 00:34:27.341252+03	\N	\N
2eee64e7-4ca2-4eb4-8b28-eeb6a2dc0ffc	Yalova	77	2026-02-02 00:34:27.341252+03	\N	\N
93e97cb0-7993-4578-8709-e43ea5aedb21	Karabük	78	2026-02-02 00:34:27.341252+03	\N	\N
abd5ce70-e098-4ae3-9b85-b528395a2a60	Kilis	79	2026-02-02 00:34:27.341252+03	\N	\N
3442987f-b416-46b4-950b-297823cfac39	Osmaniye	80	2026-02-02 00:34:27.341252+03	\N	\N
330cca6b-68be-4600-a812-d88596381fa2	Düzce	81	2026-02-02 00:34:27.341252+03	\N	\N
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupons (id, salon_id, code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, expires_at, usage_limit, used_count, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.districts (id, city_id, name, created_at) FROM stdin;
3f37260f-8847-490c-8869-2532f59eb646	8212fda3-ca52-42c3-9863-2a251eb224e8	Aladağ	2026-02-02 00:36:15.707035+03
736ddcd5-7564-44bd-bd9e-e7a8a154395f	8212fda3-ca52-42c3-9863-2a251eb224e8	Ceyhan	2026-02-02 00:36:15.707035+03
e3567b55-3ea8-43c2-af89-90b66c3ad873	8212fda3-ca52-42c3-9863-2a251eb224e8	Çukurova	2026-02-02 00:36:15.707035+03
5d250f6c-585c-4f6e-b167-8ef5eaf2424f	8212fda3-ca52-42c3-9863-2a251eb224e8	Feke	2026-02-02 00:36:15.707035+03
71cc130c-c7e7-48e9-aaf8-f6fd712f7622	8212fda3-ca52-42c3-9863-2a251eb224e8	İmamoğlu	2026-02-02 00:36:15.707035+03
afa873b9-7e71-433d-be61-ce951fa7ed40	8212fda3-ca52-42c3-9863-2a251eb224e8	Karaisalı	2026-02-02 00:36:15.707035+03
23f1391d-2099-46d1-8c56-ba899a0c6fb3	8212fda3-ca52-42c3-9863-2a251eb224e8	Karataş	2026-02-02 00:36:15.707035+03
08a907f1-5453-46f9-8d71-4eb178bde1bb	8212fda3-ca52-42c3-9863-2a251eb224e8	Kozan	2026-02-02 00:36:15.707035+03
e46148e0-f5fd-4ee3-a18b-5cff52ea5a50	8212fda3-ca52-42c3-9863-2a251eb224e8	Pozantı	2026-02-02 00:36:15.707035+03
2f7d2d9c-f9c2-4c73-8de2-d5c7c8083e24	8212fda3-ca52-42c3-9863-2a251eb224e8	Saimbeyli	2026-02-02 00:36:15.707035+03
202b72f4-7dd1-4707-8fcd-9aa08d7694c2	8212fda3-ca52-42c3-9863-2a251eb224e8	Sarıçam	2026-02-02 00:36:15.707035+03
5ea91244-d1a9-4af0-b87c-c1315c88aa69	8212fda3-ca52-42c3-9863-2a251eb224e8	Seyhan	2026-02-02 00:36:15.707035+03
ca6c53a6-f63b-4c3d-94bd-3b736737b9d8	8212fda3-ca52-42c3-9863-2a251eb224e8	Tufanbeyli	2026-02-02 00:36:15.707035+03
0d226580-675a-4c1f-83d2-fa99ed8e2aab	8212fda3-ca52-42c3-9863-2a251eb224e8	Yumurtalık	2026-02-02 00:36:15.707035+03
b90b2046-a2db-4a55-94cb-e3cf758c3ed5	8212fda3-ca52-42c3-9863-2a251eb224e8	Yüreğir	2026-02-02 00:36:15.707035+03
fa4d88a5-3462-4b55-893e-310aa4fb1ce5	816ffa49-0b30-4882-9a4f-2938714c85fa	Besni	2026-02-02 00:36:15.707035+03
eae4f170-9f25-42fe-ade7-acdb4c83de90	816ffa49-0b30-4882-9a4f-2938714c85fa	Çelikhan	2026-02-02 00:36:15.707035+03
c3c22e9d-241f-4c4f-8e1d-e37716507e80	816ffa49-0b30-4882-9a4f-2938714c85fa	Gerger	2026-02-02 00:36:15.707035+03
8180aad1-2d41-4460-b324-db3314c41eef	816ffa49-0b30-4882-9a4f-2938714c85fa	Gölbaşı	2026-02-02 00:36:15.707035+03
c2d10fcc-7ae6-4715-9bcd-ec2bf0a7017c	816ffa49-0b30-4882-9a4f-2938714c85fa	Kahta	2026-02-02 00:36:15.707035+03
769b1f57-ff60-408d-81ce-826753f14eef	816ffa49-0b30-4882-9a4f-2938714c85fa	Merkez	2026-02-02 00:36:15.707035+03
66c866f0-4b94-4f8f-a84f-9d63aa42b08e	816ffa49-0b30-4882-9a4f-2938714c85fa	Samsat	2026-02-02 00:36:15.707035+03
14864a87-1bce-4535-808b-1a3bfc23ca63	816ffa49-0b30-4882-9a4f-2938714c85fa	Sincik	2026-02-02 00:36:15.707035+03
b44f2bcd-3380-4616-960d-67ade807aa57	816ffa49-0b30-4882-9a4f-2938714c85fa	Tut	2026-02-02 00:36:15.707035+03
1dd77a41-e6ed-4ea8-ab50-ed62b9116532	2df872c8-a9f1-46f2-b08b-bc22623450c4	Başmakçı	2026-02-02 00:36:15.707035+03
3505f749-1af7-4545-927f-84a07c1b06e7	2df872c8-a9f1-46f2-b08b-bc22623450c4	Bayat	2026-02-02 00:36:15.707035+03
af14377f-8d93-4ac1-8cd1-728bbafde773	2df872c8-a9f1-46f2-b08b-bc22623450c4	Bolvadin	2026-02-02 00:36:15.707035+03
20302e93-5523-4821-9f7e-ba6ff29957ea	2df872c8-a9f1-46f2-b08b-bc22623450c4	Çay	2026-02-02 00:36:15.707035+03
53c9bdb3-7a26-49bc-940b-82420662ebdf	2df872c8-a9f1-46f2-b08b-bc22623450c4	Çobanlar	2026-02-02 00:36:15.707035+03
6285159b-27dc-42e5-97e9-652764ef89f2	2df872c8-a9f1-46f2-b08b-bc22623450c4	Dazkırı	2026-02-02 00:36:15.707035+03
4448dc01-0f86-44a0-962f-9cb007dd9f80	2df872c8-a9f1-46f2-b08b-bc22623450c4	Dinar	2026-02-02 00:36:15.707035+03
0b4143f2-69ef-4859-a699-ea041d72302c	2df872c8-a9f1-46f2-b08b-bc22623450c4	Emirdağ	2026-02-02 00:36:15.707035+03
633f8def-598d-4677-82d1-aea4054b4036	2df872c8-a9f1-46f2-b08b-bc22623450c4	Evciler	2026-02-02 00:36:15.707035+03
bd69a7f2-9263-4602-a9e3-ea6a0687be42	2df872c8-a9f1-46f2-b08b-bc22623450c4	Hocalar	2026-02-02 00:36:15.707035+03
e2d25cdb-3eb9-4c3e-b907-e0970ecb47c6	2df872c8-a9f1-46f2-b08b-bc22623450c4	İhsaniye	2026-02-02 00:36:15.707035+03
9d10cae3-e50d-4320-94d4-5cc92f01fc3c	2df872c8-a9f1-46f2-b08b-bc22623450c4	İscehisar	2026-02-02 00:36:15.707035+03
7ea53b3a-080e-4fc0-8808-5d63ef81f164	2df872c8-a9f1-46f2-b08b-bc22623450c4	Kızılören	2026-02-02 00:36:15.707035+03
44a8b2aa-a636-4103-8c5c-ab8619999428	2df872c8-a9f1-46f2-b08b-bc22623450c4	Merkez	2026-02-02 00:36:15.707035+03
8fc03d57-c586-4e8f-83cb-a056c47ea0b3	2df872c8-a9f1-46f2-b08b-bc22623450c4	Sandıklı	2026-02-02 00:36:15.707035+03
41c464cb-e138-4805-8903-c63ab716aa49	2df872c8-a9f1-46f2-b08b-bc22623450c4	Sinanpaşa	2026-02-02 00:36:15.707035+03
5d05b996-ae3e-4cae-92b3-f9f88b7ab549	2df872c8-a9f1-46f2-b08b-bc22623450c4	Sultandağı	2026-02-02 00:36:15.707035+03
1ef26d1a-0682-4847-9719-1315e64d9169	2df872c8-a9f1-46f2-b08b-bc22623450c4	Şuhut	2026-02-02 00:36:15.707035+03
313746c6-0f57-4d78-9b32-fd33e0aa8e6b	4d1923c6-d4c3-4fb5-9ea3-3e76f0cc784f	Diyadin	2026-02-02 00:36:15.707035+03
4012b653-59be-4b40-b82a-ba39350e2174	4d1923c6-d4c3-4fb5-9ea3-3e76f0cc784f	Doğubayazıt	2026-02-02 00:36:15.707035+03
f0ca1ec8-02ed-4b25-ac33-5ed4191a0c07	4d1923c6-d4c3-4fb5-9ea3-3e76f0cc784f	Eleşkirt	2026-02-02 00:36:15.707035+03
08245269-d782-4ebe-ab47-f5f2abf847eb	4d1923c6-d4c3-4fb5-9ea3-3e76f0cc784f	Hamur	2026-02-02 00:36:15.707035+03
1848d005-f81b-4716-a66c-30b0fcffc7fb	4d1923c6-d4c3-4fb5-9ea3-3e76f0cc784f	Merkez	2026-02-02 00:36:15.707035+03
bbe968fd-08a0-4f0e-8100-132ff028d3cb	4d1923c6-d4c3-4fb5-9ea3-3e76f0cc784f	Patnos	2026-02-02 00:36:15.707035+03
690fa96a-c763-4a7c-b16c-fcf388623ff2	4d1923c6-d4c3-4fb5-9ea3-3e76f0cc784f	Taşlıçay	2026-02-02 00:36:15.707035+03
c5e64fa1-7946-49f0-8a86-d40826a26390	4d1923c6-d4c3-4fb5-9ea3-3e76f0cc784f	Tutak	2026-02-02 00:36:15.707035+03
def8450e-d359-436e-bc19-bec234fac9a6	f88c460e-cf17-416e-a0bf-95b451b04edd	Göynücek	2026-02-02 00:36:15.707035+03
971dd007-b851-40db-9682-8b287eda93ff	f88c460e-cf17-416e-a0bf-95b451b04edd	Gümüşhacıköy	2026-02-02 00:36:15.707035+03
027ae09d-1edc-42e1-8792-f44fa912e001	f88c460e-cf17-416e-a0bf-95b451b04edd	Hamamözü	2026-02-02 00:36:15.707035+03
6d342d6e-d7cc-4aac-80ad-acb0bc47b3da	f88c460e-cf17-416e-a0bf-95b451b04edd	Merkez	2026-02-02 00:36:15.707035+03
8f28276e-6810-433d-8ab7-da85ec941c35	f88c460e-cf17-416e-a0bf-95b451b04edd	Merzifon	2026-02-02 00:36:15.707035+03
3c91dd49-d3d6-4c36-932e-6d946ee634d5	f88c460e-cf17-416e-a0bf-95b451b04edd	Suluova	2026-02-02 00:36:15.707035+03
f048b3ba-a6f2-49c4-9e43-7753771982ed	f88c460e-cf17-416e-a0bf-95b451b04edd	Taşova	2026-02-02 00:36:15.707035+03
d608d83c-e48a-4a6a-94d9-3424e2089b38	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Altındağ	2026-02-02 00:36:15.707035+03
7f929b08-832c-484d-8f5c-0390556ed22a	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Ayaş	2026-02-02 00:36:15.707035+03
69f1fa24-d81c-42d7-8997-e13cd8716911	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Bala	2026-02-02 00:36:15.707035+03
6f88bf4c-d80e-4f2a-ae22-136f1daef010	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Beypazarı	2026-02-02 00:36:15.707035+03
1fadf46a-9608-4638-a96a-29357940c70f	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Çamlıdere	2026-02-02 00:36:15.707035+03
51fd2cb0-e9f2-40b0-b029-7cf0768552ba	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Çankaya	2026-02-02 00:36:15.707035+03
635158da-a1c5-4108-99a0-23a14daf25f5	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Çubuk	2026-02-02 00:36:15.707035+03
7a5ef13f-5457-46b4-a099-9fa91ebdefd6	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Elmadağ	2026-02-02 00:36:15.707035+03
13caa5b3-bb79-4a80-a415-30e4fc7a0dec	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Güdül	2026-02-02 00:36:15.707035+03
8b9aea10-c900-407a-bb70-127d9fd58957	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Haymana	2026-02-02 00:36:15.707035+03
e2ec9d96-c089-4f5a-8e29-990874bac9d2	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Kalecik	2026-02-02 00:36:15.707035+03
9c8b1a0c-7727-408e-ac5d-7182e22a7c6f	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Kızılcahamam	2026-02-02 00:36:15.707035+03
50462d56-175b-450a-a879-98cbcfb8bb75	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Nallıhan	2026-02-02 00:36:15.707035+03
36a21e75-5d52-43a4-805b-ebf69203696a	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Polatlı	2026-02-02 00:36:15.707035+03
37256e49-7efb-479c-bccc-a2f9f017c344	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Şereflikoçhisar	2026-02-02 00:36:15.707035+03
22dfe6a7-8a7f-4a5a-ae8e-3e752bc42e40	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Yenimahalle	2026-02-02 00:36:15.707035+03
1a25e125-9ccd-4403-9e83-82ac5a93fbc8	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Gölbaşı	2026-02-02 00:36:15.707035+03
a3370cdb-a7e5-4e51-9e5d-696ede2b4c64	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Keçiören	2026-02-02 00:36:15.707035+03
56d7a283-8ed2-48b4-8ebc-7382c7aad1c6	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Mamak	2026-02-02 00:36:15.707035+03
d56ed71d-ac25-497a-a8af-2a0cc0a3d8d7	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Sincan	2026-02-02 00:36:15.707035+03
4109c5d1-b380-460d-8dd0-b59e2bee3c72	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Kazan	2026-02-02 00:36:15.707035+03
34ab4233-326a-4f65-92ff-53b4e2a7d2b1	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Akyurt	2026-02-02 00:36:15.707035+03
8583d091-bc2d-4cdb-a9fa-7f1c1589fe79	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Etimesgut	2026-02-02 00:36:15.707035+03
00df1e93-af40-41db-8df4-0e54f96133e4	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Evren	2026-02-02 00:36:15.707035+03
39840466-18f7-4802-8258-365232216ec6	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	Pursaklar	2026-02-02 00:36:15.707035+03
af078684-f770-4461-8583-9c4ad340e0df	df49a14f-ccf1-4601-a364-5c3345489e95	Akseki	2026-02-02 00:36:15.707035+03
84fa9361-997f-44b8-878c-a1e3aaa2714d	df49a14f-ccf1-4601-a364-5c3345489e95	Alanya	2026-02-02 00:36:15.707035+03
b2f82106-0da2-4603-8429-e279bb8d3737	df49a14f-ccf1-4601-a364-5c3345489e95	Elmalı	2026-02-02 00:36:15.707035+03
9f28bf04-261f-4071-8939-d63081432a2b	df49a14f-ccf1-4601-a364-5c3345489e95	Finike	2026-02-02 00:36:15.707035+03
8a115b44-dcac-440b-a632-380b1ce8fdab	df49a14f-ccf1-4601-a364-5c3345489e95	Gazipaşa	2026-02-02 00:36:15.707035+03
e6e54b7f-c1e4-4bb8-bff1-21d215c3eb8d	df49a14f-ccf1-4601-a364-5c3345489e95	Gündoğmuş	2026-02-02 00:36:15.707035+03
b1c3e2a2-8f41-42cb-9451-2ac441c1909b	df49a14f-ccf1-4601-a364-5c3345489e95	Kaş	2026-02-02 00:36:15.707035+03
a5e18995-9ee4-463a-8934-bc0d3bb37318	df49a14f-ccf1-4601-a364-5c3345489e95	Korkuteli	2026-02-02 00:36:15.707035+03
8bc8125d-e75b-4a76-8f7c-d0d377a7c228	df49a14f-ccf1-4601-a364-5c3345489e95	Kumluca	2026-02-02 00:36:15.707035+03
470126ba-83b9-40e4-a9d0-7d7bfd46f0fd	df49a14f-ccf1-4601-a364-5c3345489e95	Manavgat	2026-02-02 00:36:15.707035+03
2521f21e-e5a8-4020-8df0-c185f9e7ead2	df49a14f-ccf1-4601-a364-5c3345489e95	Serik	2026-02-02 00:36:15.707035+03
a941216a-bbea-40d0-891e-07940dec7e54	df49a14f-ccf1-4601-a364-5c3345489e95	Demre	2026-02-02 00:36:15.707035+03
b2aff691-851d-4c54-a1c3-2a76288aca7c	df49a14f-ccf1-4601-a364-5c3345489e95	İbradı	2026-02-02 00:36:15.707035+03
421bc82f-e099-4e73-873d-ff9c98569d30	df49a14f-ccf1-4601-a364-5c3345489e95	Kemer	2026-02-02 00:36:15.707035+03
c4adf7a1-6e42-4971-a5c0-ebcdf968e950	df49a14f-ccf1-4601-a364-5c3345489e95	Aksu	2026-02-02 00:36:15.707035+03
9c7ca6e3-74ab-49be-8c64-ba1bc76f6401	df49a14f-ccf1-4601-a364-5c3345489e95	Döşemealtı	2026-02-02 00:36:15.707035+03
0889e17f-1fcb-401b-9e8e-bbeff3983747	df49a14f-ccf1-4601-a364-5c3345489e95	Kepez	2026-02-02 00:36:15.707035+03
7b235ee2-61be-4caa-8876-a1863d40159c	df49a14f-ccf1-4601-a364-5c3345489e95	Konyaaltı	2026-02-02 00:36:15.707035+03
fff2dea1-d3f1-4589-9f22-e21be02bed2a	df49a14f-ccf1-4601-a364-5c3345489e95	Muratpaşa	2026-02-02 00:36:15.707035+03
45d0c3e8-a9f7-42ef-89d7-45e01106fc6a	2ada442c-e635-4e7b-8843-b1c3a79de31f	Ardanuç	2026-02-02 00:36:15.707035+03
eee408cc-2ef8-4f5c-a135-828b3d2cf691	2ada442c-e635-4e7b-8843-b1c3a79de31f	Arhavi	2026-02-02 00:36:15.707035+03
03a81d33-fd76-435b-91c7-266b8b96e910	2ada442c-e635-4e7b-8843-b1c3a79de31f	Merkez	2026-02-02 00:36:15.707035+03
91296627-13b9-46f5-abe7-3e18aaa18448	2ada442c-e635-4e7b-8843-b1c3a79de31f	Borçka	2026-02-02 00:36:15.707035+03
3ae8ee96-58ca-4541-b657-b1c55d892366	2ada442c-e635-4e7b-8843-b1c3a79de31f	Hopa	2026-02-02 00:36:15.707035+03
58225170-6d3f-4850-b8f4-d67a9cdd5cba	2ada442c-e635-4e7b-8843-b1c3a79de31f	Şavşat	2026-02-02 00:36:15.707035+03
05f6a4ef-e6a9-4e49-94f7-e30a5bd727ce	2ada442c-e635-4e7b-8843-b1c3a79de31f	Yusufeli	2026-02-02 00:36:15.707035+03
e0558022-c242-4677-83e0-6921652c3de1	2ada442c-e635-4e7b-8843-b1c3a79de31f	Murgul	2026-02-02 00:36:15.707035+03
24840ea2-45d0-4d2a-b75a-65c248a87ba7	f64725e9-2f15-4c87-8481-f488e35a7b23	Merkez	2026-02-02 00:36:15.707035+03
e9a44d30-81d5-42ba-b873-66aac76b75ca	f64725e9-2f15-4c87-8481-f488e35a7b23	Bozdoğan	2026-02-02 00:36:15.707035+03
a6f3b420-ff7f-46bc-bd6e-7d44a46a5bf6	f64725e9-2f15-4c87-8481-f488e35a7b23	Efeler	2026-02-02 00:36:15.707035+03
312c9c3b-706a-401f-9f86-c6d2c93359af	f64725e9-2f15-4c87-8481-f488e35a7b23	Çine	2026-02-02 00:36:15.707035+03
994e7272-5415-49f5-a42a-d9dbab50915e	f64725e9-2f15-4c87-8481-f488e35a7b23	Germencik	2026-02-02 00:36:15.707035+03
8b205fa3-67ae-47b7-a2b8-4ede29baf47a	f64725e9-2f15-4c87-8481-f488e35a7b23	Karacasu	2026-02-02 00:36:15.707035+03
afed4963-4375-4d22-a0f1-3d68bde1ff94	f64725e9-2f15-4c87-8481-f488e35a7b23	Koçarlı	2026-02-02 00:36:15.707035+03
43a39e1f-6263-4341-b09c-6ff69010d950	f64725e9-2f15-4c87-8481-f488e35a7b23	Kuşadası	2026-02-02 00:36:15.707035+03
f6f8853d-b066-486d-aba4-f0ff1a222c44	f64725e9-2f15-4c87-8481-f488e35a7b23	Kuyucak	2026-02-02 00:36:15.707035+03
655d1703-6b9b-4235-b86c-12195055c17e	f64725e9-2f15-4c87-8481-f488e35a7b23	Nazilli	2026-02-02 00:36:15.707035+03
0f622b55-5892-4650-b111-c703613487e6	f64725e9-2f15-4c87-8481-f488e35a7b23	Söke	2026-02-02 00:36:15.707035+03
905db8d6-5806-47b1-a759-ff36c29217a4	f64725e9-2f15-4c87-8481-f488e35a7b23	Sultanhisar	2026-02-02 00:36:15.707035+03
343f675b-737b-4ccb-a356-4a9a3471a9a1	f64725e9-2f15-4c87-8481-f488e35a7b23	Yenipazar	2026-02-02 00:36:15.707035+03
1c27d8a7-4398-4d2c-8469-f9427b1e5c4d	f64725e9-2f15-4c87-8481-f488e35a7b23	Buharkent	2026-02-02 00:36:15.707035+03
1d35b43a-1bc1-4348-9ac2-c00c3fd92890	f64725e9-2f15-4c87-8481-f488e35a7b23	İncirliova	2026-02-02 00:36:15.707035+03
f138c0cd-a94a-4b21-bc5c-6bc56060ad78	f64725e9-2f15-4c87-8481-f488e35a7b23	Karpuzlu	2026-02-02 00:36:15.707035+03
80cabe6b-805b-4115-93cc-3a06ab7b1997	f64725e9-2f15-4c87-8481-f488e35a7b23	Köşk	2026-02-02 00:36:15.707035+03
b8cfe578-e3df-43f3-b078-6379890b4285	f64725e9-2f15-4c87-8481-f488e35a7b23	Didim	2026-02-02 00:36:15.707035+03
c5a28970-18ce-4e5b-8f89-0ed862d69eb2	a4d5c1c1-abd7-4638-b36d-91419025c163	Altıeylül	2026-02-02 00:36:15.707035+03
a946b2b0-081e-4575-b363-547501d805e5	a4d5c1c1-abd7-4638-b36d-91419025c163	Ayvalık	2026-02-02 00:36:15.707035+03
cddc3f52-fcb3-40b5-a4a0-27780950b072	a4d5c1c1-abd7-4638-b36d-91419025c163	Merkez	2026-02-02 00:36:15.707035+03
a76883c8-6fe4-46bb-8962-50e0c33c7696	a4d5c1c1-abd7-4638-b36d-91419025c163	Balya	2026-02-02 00:36:15.707035+03
a9445edf-ec9c-4051-8e7d-ed9eb6c0b42b	a4d5c1c1-abd7-4638-b36d-91419025c163	Bandırma	2026-02-02 00:36:15.707035+03
188100a1-9df1-492b-ab24-3f3ae796daba	a4d5c1c1-abd7-4638-b36d-91419025c163	Bigadiç	2026-02-02 00:36:15.707035+03
6cf05e47-caf4-4437-964e-922213f443c0	a4d5c1c1-abd7-4638-b36d-91419025c163	Burhaniye	2026-02-02 00:36:15.707035+03
6d4f4c3a-246b-486f-befd-fd5c1ec454f3	a4d5c1c1-abd7-4638-b36d-91419025c163	Dursunbey	2026-02-02 00:36:15.707035+03
e9e21897-5488-4633-84a6-cd7c8552c81f	a4d5c1c1-abd7-4638-b36d-91419025c163	Edremit	2026-02-02 00:36:15.707035+03
e50af316-0f30-423b-8c2c-e999b428a194	a4d5c1c1-abd7-4638-b36d-91419025c163	Erdek	2026-02-02 00:36:15.707035+03
b9198eca-8ff9-43f9-bd69-da5c59d6a045	a4d5c1c1-abd7-4638-b36d-91419025c163	Gönen	2026-02-02 00:36:15.707035+03
3c96b8c2-1598-4f38-8c71-2fd73b5f7b0a	a4d5c1c1-abd7-4638-b36d-91419025c163	Havran	2026-02-02 00:36:15.707035+03
97f252ef-3c92-40b4-b9e4-89fe5fb5a7bb	a4d5c1c1-abd7-4638-b36d-91419025c163	İvrindi	2026-02-02 00:36:15.707035+03
d876b797-ea9c-4a54-a6ec-51280a140542	a4d5c1c1-abd7-4638-b36d-91419025c163	Karesi	2026-02-02 00:36:15.707035+03
03831fcb-ad59-4207-a63a-57fb4d7b111a	a4d5c1c1-abd7-4638-b36d-91419025c163	Kepsut	2026-02-02 00:36:15.707035+03
d711c49b-fae1-4e34-8bc4-6a245070e80c	a4d5c1c1-abd7-4638-b36d-91419025c163	Manyas	2026-02-02 00:36:15.707035+03
eba180b1-44a9-43f4-a11a-0993c8f74c64	a4d5c1c1-abd7-4638-b36d-91419025c163	Savaştepe	2026-02-02 00:36:15.707035+03
23d80329-a8aa-4edf-9de7-b5529ca4ec60	a4d5c1c1-abd7-4638-b36d-91419025c163	Sındırgı	2026-02-02 00:36:15.707035+03
de794b85-6316-4d2d-ba33-72f7bb9af6b8	a4d5c1c1-abd7-4638-b36d-91419025c163	Gömeç	2026-02-02 00:36:15.707035+03
cbb11d38-adaa-418d-aa5b-aabcf3a8d0f6	a4d5c1c1-abd7-4638-b36d-91419025c163	Susurluk	2026-02-02 00:36:15.707035+03
d828badc-ccc4-4f96-b655-e3e229aec3e3	a4d5c1c1-abd7-4638-b36d-91419025c163	Marmara	2026-02-02 00:36:15.707035+03
f9ff7f2b-4413-42b5-9e9a-0b01dac19410	2b582c7e-15d9-4e26-9300-a424557488ec	Merkez	2026-02-02 00:36:15.707035+03
fd96fb16-1392-4e0a-9cea-debea4744ee0	2b582c7e-15d9-4e26-9300-a424557488ec	Bozüyük	2026-02-02 00:36:15.707035+03
0521a29f-481b-4f0e-a1e7-66e228865177	2b582c7e-15d9-4e26-9300-a424557488ec	Gölpazarı	2026-02-02 00:36:15.707035+03
de5fc82c-1fd1-4c39-81ce-82bdc961b75f	2b582c7e-15d9-4e26-9300-a424557488ec	Osmaneli	2026-02-02 00:36:15.707035+03
1f2505ae-f4a9-4e44-a1ba-527357017853	2b582c7e-15d9-4e26-9300-a424557488ec	Pazaryeri	2026-02-02 00:36:15.707035+03
18405e12-c03e-4988-88d1-4b0974d4991a	2b582c7e-15d9-4e26-9300-a424557488ec	Söğüt	2026-02-02 00:36:15.707035+03
985f2279-3e42-423f-bebf-45c351148a54	2b582c7e-15d9-4e26-9300-a424557488ec	Yenipazar	2026-02-02 00:36:15.707035+03
6dcfea95-4191-4811-898b-a1f5f16d8039	2b582c7e-15d9-4e26-9300-a424557488ec	İnhisar	2026-02-02 00:36:15.707035+03
cb264513-f3ed-40dd-a5ae-d932bd478cd5	4f8c649a-cfe8-4cca-ae8f-0405699cbe3d	Merkez	2026-02-02 00:36:15.707035+03
392084ee-3b20-4124-a7c8-ea510b5a73ae	4f8c649a-cfe8-4cca-ae8f-0405699cbe3d	Genç	2026-02-02 00:36:15.707035+03
2582e672-22b6-4538-a712-854e0dc13de8	4f8c649a-cfe8-4cca-ae8f-0405699cbe3d	Karlıova	2026-02-02 00:36:15.707035+03
184ce05d-d436-4b7f-931e-324be5613942	4f8c649a-cfe8-4cca-ae8f-0405699cbe3d	Kiğı	2026-02-02 00:36:15.707035+03
cadc67f8-5d26-4a07-8af9-b9b1f07132b8	4f8c649a-cfe8-4cca-ae8f-0405699cbe3d	Solhan	2026-02-02 00:36:15.707035+03
f9007bd9-7a08-4372-b50e-20c7e7b23457	4f8c649a-cfe8-4cca-ae8f-0405699cbe3d	Adaklı	2026-02-02 00:36:15.707035+03
2cf800b5-74f7-4617-996f-063c28da0253	4f8c649a-cfe8-4cca-ae8f-0405699cbe3d	Yayladere	2026-02-02 00:36:15.707035+03
20fd689b-ed77-4de1-8674-0055d965342e	4f8c649a-cfe8-4cca-ae8f-0405699cbe3d	Yedisu	2026-02-02 00:36:15.707035+03
27cc6a2e-85d7-4ba5-8d60-2508b576cd52	2039c3e9-4eba-4006-a2c4-48176cfaf62e	Adilcevaz	2026-02-02 00:36:15.707035+03
e4f6d9e0-32a8-4d27-8ebe-f4f7d6530d6d	2039c3e9-4eba-4006-a2c4-48176cfaf62e	Ahlat	2026-02-02 00:36:15.707035+03
6b4a8047-70e1-4ecb-91c1-1f81f85f1ca7	2039c3e9-4eba-4006-a2c4-48176cfaf62e	Merkez	2026-02-02 00:36:15.707035+03
60209fd6-b368-4f88-8373-296315cdd854	2039c3e9-4eba-4006-a2c4-48176cfaf62e	Hizan	2026-02-02 00:36:15.707035+03
921ff6c9-0006-4f33-8bf4-a6bf874b4288	2039c3e9-4eba-4006-a2c4-48176cfaf62e	Mutki	2026-02-02 00:36:15.707035+03
4194e7ed-0665-4aad-9ff1-4a9d8896de9a	2039c3e9-4eba-4006-a2c4-48176cfaf62e	Tatvan	2026-02-02 00:36:15.707035+03
7ec255a5-1bd3-4511-9a77-e06a1891c02b	2039c3e9-4eba-4006-a2c4-48176cfaf62e	Güroymak	2026-02-02 00:36:15.707035+03
b9674ede-13cf-48d1-960d-9d2e9d64d593	77134ebc-e9c9-43d5-9b52-5ea448f8350c	Merkez	2026-02-02 00:36:15.707035+03
7c8b2959-58e8-4f5e-b431-3a3fed46466d	77134ebc-e9c9-43d5-9b52-5ea448f8350c	Gerede	2026-02-02 00:36:15.707035+03
89835d91-e654-4d6a-baa9-0a5173e89e28	77134ebc-e9c9-43d5-9b52-5ea448f8350c	Göynük	2026-02-02 00:36:15.707035+03
7cff36dd-8571-418f-bb48-957676cd9cc5	77134ebc-e9c9-43d5-9b52-5ea448f8350c	Kıbrıscık	2026-02-02 00:36:15.707035+03
931604d6-b5d5-442a-ba6b-565c3e75cbf8	77134ebc-e9c9-43d5-9b52-5ea448f8350c	Mengen	2026-02-02 00:36:15.707035+03
12bf6cad-2d1e-4c56-b4ab-c24e7bc0a539	77134ebc-e9c9-43d5-9b52-5ea448f8350c	Mudurnu	2026-02-02 00:36:15.707035+03
88a34e0e-cd22-4665-9d7e-9760ca951084	77134ebc-e9c9-43d5-9b52-5ea448f8350c	Seben	2026-02-02 00:36:15.707035+03
b3d4a1fc-e56d-4de3-87be-b476766e319f	77134ebc-e9c9-43d5-9b52-5ea448f8350c	Dörtdivan	2026-02-02 00:36:15.707035+03
6f4b8646-b5b4-4b49-9df4-164328c998cf	77134ebc-e9c9-43d5-9b52-5ea448f8350c	Yeniçağa	2026-02-02 00:36:15.707035+03
c703fa06-d371-4b06-bb84-7048d9575b24	a529eb0b-3964-4a34-bf29-84cc66935472	Ağlasun	2026-02-02 00:36:15.707035+03
baaf0ff9-3bd9-4359-aea9-38bf2763e2b1	a529eb0b-3964-4a34-bf29-84cc66935472	Bucak	2026-02-02 00:36:15.707035+03
5512a023-47d9-4cc9-8517-a0ea9dc65aec	a529eb0b-3964-4a34-bf29-84cc66935472	Merkez	2026-02-02 00:36:15.707035+03
2c180382-8ed4-4cbe-b4af-c4970aaf94cf	a529eb0b-3964-4a34-bf29-84cc66935472	Gölhisar	2026-02-02 00:36:15.707035+03
8fb7245a-b37b-42bc-acd5-a469d5f1aeae	a529eb0b-3964-4a34-bf29-84cc66935472	Tefenni	2026-02-02 00:36:15.707035+03
cfc7446c-f101-4255-9cef-5c45cd040875	a529eb0b-3964-4a34-bf29-84cc66935472	Yeşilova	2026-02-02 00:36:15.707035+03
58906bf8-c3a7-4899-bf7a-af1000634a1c	a529eb0b-3964-4a34-bf29-84cc66935472	Karamanlı	2026-02-02 00:36:15.707035+03
d002cdbd-49e3-46ae-9343-63013472eea1	a529eb0b-3964-4a34-bf29-84cc66935472	Kemer	2026-02-02 00:36:15.707035+03
b849e6f4-2db7-4fcb-be02-5272b83ff17b	a529eb0b-3964-4a34-bf29-84cc66935472	Altınyayla	2026-02-02 00:36:15.707035+03
00b92471-fa71-4af3-bd89-7b09dd21683d	a529eb0b-3964-4a34-bf29-84cc66935472	Çavdır	2026-02-02 00:36:15.707035+03
608977c0-dfd9-43d9-9f74-46e1daedf26e	a529eb0b-3964-4a34-bf29-84cc66935472	Çeltikçi	2026-02-02 00:36:15.707035+03
f4c14aee-89a2-4013-bca4-04edf592e5ab	b13ae5f5-6205-4b73-8d28-766ac906490d	Gemlik	2026-02-02 00:36:15.707035+03
9bd5481c-5ec8-4b2d-a148-5eaa1796c1ee	b13ae5f5-6205-4b73-8d28-766ac906490d	İnegöl	2026-02-02 00:36:15.707035+03
650d0654-b324-46ea-94f0-d71811c027f0	b13ae5f5-6205-4b73-8d28-766ac906490d	İznik	2026-02-02 00:36:15.707035+03
7ea6f48c-66b5-4927-a83e-6c9492b8c49f	b13ae5f5-6205-4b73-8d28-766ac906490d	Karacabey	2026-02-02 00:36:15.707035+03
c322a399-f055-474b-97e4-e2027a3c87b5	b13ae5f5-6205-4b73-8d28-766ac906490d	Keles	2026-02-02 00:36:15.707035+03
62d91801-01a0-47e0-b6f3-cc3638439c0e	b13ae5f5-6205-4b73-8d28-766ac906490d	Mudanya	2026-02-02 00:36:15.707035+03
8756c6f3-8e49-4b60-8615-d9e502f2b11f	b13ae5f5-6205-4b73-8d28-766ac906490d	Mustafakemalpaşa	2026-02-02 00:36:15.707035+03
318135ee-0164-43ee-bb8d-208d82e4339a	b13ae5f5-6205-4b73-8d28-766ac906490d	Orhaneli	2026-02-02 00:36:15.707035+03
12e53944-47d3-42f9-b83f-f7551ae0f419	b13ae5f5-6205-4b73-8d28-766ac906490d	Orhangazi	2026-02-02 00:36:15.707035+03
b23791ce-9b08-4e50-ab1d-bb70d16e3e41	b13ae5f5-6205-4b73-8d28-766ac906490d	Yenişehir	2026-02-02 00:36:15.707035+03
69e66e8e-825c-4ad4-abc5-733c58c78cfe	b13ae5f5-6205-4b73-8d28-766ac906490d	Büyükorhan	2026-02-02 00:36:15.707035+03
b892a8cc-6798-45f5-962f-cfee773d0a30	b13ae5f5-6205-4b73-8d28-766ac906490d	Harmancık	2026-02-02 00:36:15.707035+03
ef18769e-2d69-4d75-b360-8da8c94cde33	b13ae5f5-6205-4b73-8d28-766ac906490d	Nilüfer	2026-02-02 00:36:15.707035+03
5b1d1dde-bf62-4192-8443-033348e05303	b13ae5f5-6205-4b73-8d28-766ac906490d	Osmangazi	2026-02-02 00:36:15.707035+03
207683b9-8eb4-4534-b391-1ef17a39ed21	b13ae5f5-6205-4b73-8d28-766ac906490d	Yıldırım	2026-02-02 00:36:15.707035+03
b5362d12-cdc3-4500-a9a4-7c55748705cf	b13ae5f5-6205-4b73-8d28-766ac906490d	Gürsu	2026-02-02 00:36:15.707035+03
23322313-2d65-4dfb-a415-41e16a37eebf	b13ae5f5-6205-4b73-8d28-766ac906490d	Kestel	2026-02-02 00:36:15.707035+03
e67e35af-4276-43c7-a640-2e352d203971	b6e9e611-1c41-438d-b503-84ce62589c15	Ayvacık	2026-02-02 00:36:15.707035+03
d62942cc-3dc2-42e5-a564-1656a0eb1961	b6e9e611-1c41-438d-b503-84ce62589c15	Bayramiç	2026-02-02 00:36:15.707035+03
e3d4f395-4e80-4faf-bac6-6f800ca2ca9d	b6e9e611-1c41-438d-b503-84ce62589c15	Biga	2026-02-02 00:36:15.707035+03
9cf780c5-ba7e-4fe9-a0a6-2e11ad09c596	b6e9e611-1c41-438d-b503-84ce62589c15	Bozcaada	2026-02-02 00:36:15.707035+03
1c42c2dd-49a7-4bb4-8878-e8a21576939b	b6e9e611-1c41-438d-b503-84ce62589c15	Çan	2026-02-02 00:36:15.707035+03
83c84dd6-26fe-4fa7-9d76-2fa006409960	b6e9e611-1c41-438d-b503-84ce62589c15	Merkez	2026-02-02 00:36:15.707035+03
fcc58b4b-d28b-4c94-aadf-588e368c6181	b6e9e611-1c41-438d-b503-84ce62589c15	Eceabat	2026-02-02 00:36:15.707035+03
0fbfb0e2-5217-42af-91f9-86b0f841817f	b6e9e611-1c41-438d-b503-84ce62589c15	Ezine	2026-02-02 00:36:15.707035+03
d519e690-8b46-4eff-82b4-926b637c2f10	b6e9e611-1c41-438d-b503-84ce62589c15	Gelibolu	2026-02-02 00:36:15.707035+03
55ad6c7a-9c6f-48dd-ad9f-861a79ceeeec	b6e9e611-1c41-438d-b503-84ce62589c15	Gökçeada	2026-02-02 00:36:15.707035+03
e3018a1a-5e9b-48e6-a3f8-20ad5cf40351	b6e9e611-1c41-438d-b503-84ce62589c15	Lapseki	2026-02-02 00:36:15.707035+03
6d96822e-aaf4-4082-9e12-2056eb2b06cc	b6e9e611-1c41-438d-b503-84ce62589c15	Yenice	2026-02-02 00:36:15.707035+03
f673d7c6-c466-4f5b-a168-f88e92b4fa3d	75631889-be63-428c-8ac9-c946eab0e9ad	Merkez	2026-02-02 00:36:15.707035+03
e3ee8167-bd92-4f1f-9a6f-f1b02004a795	75631889-be63-428c-8ac9-c946eab0e9ad	Çerkeş	2026-02-02 00:36:15.707035+03
a8343462-d059-4a8d-b438-60e893574a03	75631889-be63-428c-8ac9-c946eab0e9ad	Eldivan	2026-02-02 00:36:15.707035+03
6dbd68b3-c9f5-4e54-8182-fc4d7a78640d	75631889-be63-428c-8ac9-c946eab0e9ad	Ilgaz	2026-02-02 00:36:15.707035+03
7a2a6345-9c31-42c6-8dac-b2cf3b9d5f19	75631889-be63-428c-8ac9-c946eab0e9ad	Kurşunlu	2026-02-02 00:36:15.707035+03
a3d54a73-3833-4e60-acfb-43eca0effea5	75631889-be63-428c-8ac9-c946eab0e9ad	Orta	2026-02-02 00:36:15.707035+03
2ca8e380-7d31-4240-93b5-6416b7cf1ffe	75631889-be63-428c-8ac9-c946eab0e9ad	Şabanözü	2026-02-02 00:36:15.707035+03
2e9e4771-2d1a-4259-b902-8373e5defeb9	75631889-be63-428c-8ac9-c946eab0e9ad	Yapraklı	2026-02-02 00:36:15.707035+03
841f608d-d5a7-4c09-9240-e16bc84d768f	75631889-be63-428c-8ac9-c946eab0e9ad	Atkaracalar	2026-02-02 00:36:15.707035+03
136b3eeb-516e-4cbf-8724-9aeccef06105	75631889-be63-428c-8ac9-c946eab0e9ad	Kızılırmak	2026-02-02 00:36:15.707035+03
756ac960-b2df-41d8-b136-36f63cef2d28	75631889-be63-428c-8ac9-c946eab0e9ad	Bayramören	2026-02-02 00:36:15.707035+03
da45e03b-687b-4648-af2a-b53ac4770858	75631889-be63-428c-8ac9-c946eab0e9ad	Korgun	2026-02-02 00:36:15.707035+03
b52996af-9389-416a-92bf-7cbc04b246a4	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Alaca	2026-02-02 00:36:15.707035+03
dadce539-4959-42a3-98e7-c584f2c381e4	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Bayat	2026-02-02 00:36:15.707035+03
00df5b44-1900-4c6d-8517-c55a1d0d4b97	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Merkez	2026-02-02 00:36:15.707035+03
baa910fb-545b-4034-a664-e5568bba96dc	aecd7c6b-3323-464b-be28-8e2cd20c31d8	İskilip	2026-02-02 00:36:15.707035+03
1a36ddf4-d01d-465b-912d-13095a722d8b	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Kargı	2026-02-02 00:36:15.707035+03
fe7a800d-5722-4c78-9bdb-54cda931b432	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Mecitözü	2026-02-02 00:36:15.707035+03
6952fc53-bbb3-4771-ae53-496815283178	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Ortaköy	2026-02-02 00:36:15.707035+03
a6d48d0e-e564-4087-a9b3-68f6cd0d7d2c	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Osmancık	2026-02-02 00:36:15.707035+03
c0aad877-5def-4dd2-9349-3669cbc5a4da	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Sungurlu	2026-02-02 00:36:15.707035+03
523a6727-2a27-4799-9a1f-aed02d6ca3b2	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Boğazkale	2026-02-02 00:36:15.707035+03
813fdb75-1227-4294-aee3-ad282cad1a14	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Uğurludağ	2026-02-02 00:36:15.707035+03
eea70a19-4f26-441b-ab5d-9b94ac824468	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Dodurga	2026-02-02 00:36:15.707035+03
708f7925-1ace-4d55-9cd4-2dad7e99ee4e	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Laçin	2026-02-02 00:36:15.707035+03
001f54f0-4f5c-4ed8-91dd-97f203c41aec	aecd7c6b-3323-464b-be28-8e2cd20c31d8	Oğuzlar	2026-02-02 00:36:15.707035+03
2953ab0c-6bf3-4d3c-8260-f13e67aa0d93	c39765c1-b95e-4225-b793-5c0d081fc35a	Acıpayam	2026-02-02 00:36:15.707035+03
a2cf61da-6084-449d-894b-768f52455320	c39765c1-b95e-4225-b793-5c0d081fc35a	Buldan	2026-02-02 00:36:15.707035+03
fcfbbf51-33a1-4f36-b58c-9bf64beca446	c39765c1-b95e-4225-b793-5c0d081fc35a	Çal	2026-02-02 00:36:15.707035+03
80ac3820-a0be-4b02-8301-afa35d7221f1	c39765c1-b95e-4225-b793-5c0d081fc35a	Çameli	2026-02-02 00:36:15.707035+03
f09a6afa-bea2-464f-bba9-f2b1a6a4f1ce	c39765c1-b95e-4225-b793-5c0d081fc35a	Çardak	2026-02-02 00:36:15.707035+03
7a9913a6-75e9-4fb0-97a5-4eb7205255ee	c39765c1-b95e-4225-b793-5c0d081fc35a	Çivril	2026-02-02 00:36:15.707035+03
6bfa325b-9757-4281-ac08-689673e876d7	c39765c1-b95e-4225-b793-5c0d081fc35a	Merkez	2026-02-02 00:36:15.707035+03
34368b05-774f-48d9-b56f-9f8382756e4e	c39765c1-b95e-4225-b793-5c0d081fc35a	Merkezefendi	2026-02-02 00:36:15.707035+03
60bca0a7-d339-4e45-abb4-ebe71600aecb	c39765c1-b95e-4225-b793-5c0d081fc35a	Pamukkale	2026-02-02 00:36:15.707035+03
27ba249b-57a2-4822-9f36-88253013e84f	c39765c1-b95e-4225-b793-5c0d081fc35a	Güney	2026-02-02 00:36:15.707035+03
37ef79f8-ffb9-42cb-a8da-327f93ce69e5	c39765c1-b95e-4225-b793-5c0d081fc35a	Kale	2026-02-02 00:36:15.707035+03
590f4809-21d7-4e99-abbd-ae6e295d70d8	c39765c1-b95e-4225-b793-5c0d081fc35a	Sarayköy	2026-02-02 00:36:15.707035+03
7d5ff6a0-645e-45f2-bd79-d6753968c7e8	c39765c1-b95e-4225-b793-5c0d081fc35a	Tavas	2026-02-02 00:36:15.707035+03
767dabfa-ec68-4ba5-884e-ff955a7bca9c	c39765c1-b95e-4225-b793-5c0d081fc35a	Babadağ	2026-02-02 00:36:15.707035+03
398ca16f-ba92-4917-8780-2d502f9e3316	c39765c1-b95e-4225-b793-5c0d081fc35a	Bekilli	2026-02-02 00:36:15.707035+03
ae955f59-23da-473c-9387-cc416c01e9bf	c39765c1-b95e-4225-b793-5c0d081fc35a	Honaz	2026-02-02 00:36:15.707035+03
eed16252-a500-4f08-a4da-fc1a9f8a9145	c39765c1-b95e-4225-b793-5c0d081fc35a	Serinhisar	2026-02-02 00:36:15.707035+03
3f0065a8-6dbe-4f40-8bf2-d3f3429cb3f0	c39765c1-b95e-4225-b793-5c0d081fc35a	Baklan	2026-02-02 00:36:15.707035+03
c8a45f42-0391-4ea6-8e78-e731650b9ca4	c39765c1-b95e-4225-b793-5c0d081fc35a	Beyağaç	2026-02-02 00:36:15.707035+03
977beb69-74e8-4fbe-a1d9-08029656c65c	c39765c1-b95e-4225-b793-5c0d081fc35a	Bozkurt	2026-02-02 00:36:15.707035+03
86900d54-78f6-4de0-8dbb-1c9a3c2de8b9	b085c884-69dc-44f6-8204-804d21cf6469	Kocaköy	2026-02-02 00:36:15.707035+03
f10252f3-d4ca-4788-9f57-9c2d938fd0a1	b085c884-69dc-44f6-8204-804d21cf6469	Çermik	2026-02-02 00:36:15.707035+03
7ed56a7d-5e02-48be-8a61-f659281efc9b	b085c884-69dc-44f6-8204-804d21cf6469	Çınar	2026-02-02 00:36:15.707035+03
01ed74da-666d-4138-93ad-e10f8feb18e6	b085c884-69dc-44f6-8204-804d21cf6469	Çüngüş	2026-02-02 00:36:15.707035+03
747ab79c-1f95-499d-bd96-fdaa3588e86b	b085c884-69dc-44f6-8204-804d21cf6469	Dicle	2026-02-02 00:36:15.707035+03
fdf61ffe-06e4-48a4-add6-d7b55c2a307b	b085c884-69dc-44f6-8204-804d21cf6469	Ergani	2026-02-02 00:36:15.707035+03
d4a7ae57-c527-4581-a57c-1d6b350788a8	b085c884-69dc-44f6-8204-804d21cf6469	Hani	2026-02-02 00:36:15.707035+03
76f9033d-4223-4129-b06c-22fc7239c2f9	b085c884-69dc-44f6-8204-804d21cf6469	Hazro	2026-02-02 00:36:15.707035+03
2e7b4271-6b1a-4d49-85e7-77e343d5c0a3	b085c884-69dc-44f6-8204-804d21cf6469	Kulp	2026-02-02 00:36:15.707035+03
801f902c-c0e5-4dbd-a5de-d908003e21e0	b085c884-69dc-44f6-8204-804d21cf6469	Lice	2026-02-02 00:36:15.707035+03
7b9149e6-424a-4427-b063-a767b1925b3c	b085c884-69dc-44f6-8204-804d21cf6469	Silvan	2026-02-02 00:36:15.707035+03
c3bc3ff3-9aad-44d9-8f71-15713de884a2	b085c884-69dc-44f6-8204-804d21cf6469	Eğil	2026-02-02 00:36:15.707035+03
e609c116-50e7-4539-942c-ac86ceeb811d	b085c884-69dc-44f6-8204-804d21cf6469	Bağlar	2026-02-02 00:36:15.707035+03
baabe131-b8cf-4424-9a52-b2e84d75685b	b085c884-69dc-44f6-8204-804d21cf6469	Kayapınar	2026-02-02 00:36:15.707035+03
72fef95f-4ea9-4cf0-b3aa-f593344be921	b085c884-69dc-44f6-8204-804d21cf6469	Sur	2026-02-02 00:36:15.707035+03
e10c0f6a-5bc9-4123-9ea1-17c2a21326ec	b085c884-69dc-44f6-8204-804d21cf6469	Yenişehir	2026-02-02 00:36:15.707035+03
e63a6c44-c1f2-4f76-85b5-df666cc657eb	b085c884-69dc-44f6-8204-804d21cf6469	Bismil	2026-02-02 00:36:15.707035+03
00477340-2881-4b54-989d-f8b99fc1beaa	54cac68a-e169-4267-83b2-5e207cf15138	Merkez	2026-02-02 00:36:15.707035+03
279e3e49-3600-48ac-9b99-8402b8ad4b86	54cac68a-e169-4267-83b2-5e207cf15138	Enez	2026-02-02 00:36:15.707035+03
7d543e29-c028-490f-b841-86bbbb2ba94b	54cac68a-e169-4267-83b2-5e207cf15138	Havsa	2026-02-02 00:36:15.707035+03
568baadc-e8e6-45d0-8ab4-f80e7164a229	54cac68a-e169-4267-83b2-5e207cf15138	İpsala	2026-02-02 00:36:15.707035+03
bcfb8c86-df43-4fa2-9049-603c3ccb7efa	54cac68a-e169-4267-83b2-5e207cf15138	Keşan	2026-02-02 00:36:15.707035+03
43190313-2bf7-4ed2-8620-cd41ed0019bc	54cac68a-e169-4267-83b2-5e207cf15138	Lalapaşa	2026-02-02 00:36:15.707035+03
056a0cf0-44ef-45e3-a3e2-e7de3ff6f3c9	54cac68a-e169-4267-83b2-5e207cf15138	Meriç	2026-02-02 00:36:15.707035+03
a62649be-9883-415b-ae5f-b1cfd84fa147	54cac68a-e169-4267-83b2-5e207cf15138	Uzunköprü	2026-02-02 00:36:15.707035+03
e9bb8a81-c445-4ba5-9624-bbf46eea0705	54cac68a-e169-4267-83b2-5e207cf15138	Süloğlu	2026-02-02 00:36:15.707035+03
5d5db8b3-d5de-4f51-8cd2-717eb3e91dae	a2bba858-638d-4fa1-9f87-8cac2192dbfb	Ağın	2026-02-02 00:36:15.707035+03
14ad4f8d-f596-4e14-a63c-80f6495a41b3	a2bba858-638d-4fa1-9f87-8cac2192dbfb	Baskil	2026-02-02 00:36:15.707035+03
79b2cff7-79cd-48bd-acc6-1ba0781d2b54	a2bba858-638d-4fa1-9f87-8cac2192dbfb	Merkez	2026-02-02 00:36:15.707035+03
13b3e4ec-ac95-4d84-a398-9aaaa3742f4c	a2bba858-638d-4fa1-9f87-8cac2192dbfb	Karakoçan	2026-02-02 00:36:15.707035+03
a93a12bd-e7b7-4d5f-8a22-9b61bba291e4	a2bba858-638d-4fa1-9f87-8cac2192dbfb	Keban	2026-02-02 00:36:15.707035+03
276e277b-f06e-4536-ac25-a81b81907cfe	a2bba858-638d-4fa1-9f87-8cac2192dbfb	Maden	2026-02-02 00:36:15.707035+03
3bb08286-1ed5-4003-8a1c-03aeac2bd2ab	a2bba858-638d-4fa1-9f87-8cac2192dbfb	Palu	2026-02-02 00:36:15.707035+03
5406b332-464f-451a-b225-e20ac6a89824	a2bba858-638d-4fa1-9f87-8cac2192dbfb	Sivrice	2026-02-02 00:36:15.707035+03
4ec28c8e-60ba-40b7-80c7-7f927950cbe2	a2bba858-638d-4fa1-9f87-8cac2192dbfb	Arıcak	2026-02-02 00:36:15.707035+03
05d9609b-cfde-469a-b622-46db4f0bcfd6	a2bba858-638d-4fa1-9f87-8cac2192dbfb	Kovancılar	2026-02-02 00:36:15.707035+03
12f2fbf8-97a5-421e-9430-16ec6e91fbef	a2bba858-638d-4fa1-9f87-8cac2192dbfb	Alacakaya	2026-02-02 00:36:15.707035+03
df5b41eb-6826-4d86-a94e-ce25631a1a64	221b0853-de01-4a6e-bc7d-0eb4b1ad374b	Çayırlı	2026-02-02 00:36:15.707035+03
147d4868-932b-49ab-9c82-3c8d7970f33d	221b0853-de01-4a6e-bc7d-0eb4b1ad374b	Merkez	2026-02-02 00:36:15.707035+03
968b1180-e928-447c-ba4d-b292184ece98	221b0853-de01-4a6e-bc7d-0eb4b1ad374b	İliç	2026-02-02 00:36:15.707035+03
15412a3b-e5c0-4683-8b8a-58cc9e51fac5	221b0853-de01-4a6e-bc7d-0eb4b1ad374b	Kemah	2026-02-02 00:36:15.707035+03
7a97f37d-b97d-44fb-9282-1633a37abcf8	221b0853-de01-4a6e-bc7d-0eb4b1ad374b	Kemaliye	2026-02-02 00:36:15.707035+03
e6ed0ad9-3e1d-460c-83cd-e3d3325e32d5	221b0853-de01-4a6e-bc7d-0eb4b1ad374b	Refahiye	2026-02-02 00:36:15.707035+03
e616da48-6a41-45ca-a2aa-2a817e825dab	221b0853-de01-4a6e-bc7d-0eb4b1ad374b	Tercan	2026-02-02 00:36:15.707035+03
95b6c07d-d02c-46c8-8e76-ff8faa611425	221b0853-de01-4a6e-bc7d-0eb4b1ad374b	Üzümlü	2026-02-02 00:36:15.707035+03
5a5e5c12-1fac-4eed-bff9-eb520fb3b40a	221b0853-de01-4a6e-bc7d-0eb4b1ad374b	Otlukbeli	2026-02-02 00:36:15.707035+03
5a9a9e7b-8f51-4109-9996-cdd4a9301848	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Aşkale	2026-02-02 00:36:15.707035+03
e507dabb-56e2-4392-8b1c-38f33bb92064	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Çat	2026-02-02 00:36:15.707035+03
95f866a2-654c-48ec-b77b-fa3420b7ecfd	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Hınıs	2026-02-02 00:36:15.707035+03
42627ccd-f908-4272-8003-52fb49adf92c	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Horasan	2026-02-02 00:36:15.707035+03
8b1b178d-7d9f-424c-8cbf-2162ab5a6922	9dda42fc-1928-4ed5-81e5-25f4b66451c1	İspir	2026-02-02 00:36:15.707035+03
010eda22-0fa2-4099-9e1c-4927b8f888bd	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Karayazı	2026-02-02 00:36:15.707035+03
4c1d9878-cf37-436a-91fc-2bb3890c5a6e	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Narman	2026-02-02 00:36:15.707035+03
cf512e4f-7477-432c-b328-a04b7ca1993b	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Oltu	2026-02-02 00:36:15.707035+03
5566ae83-9916-474b-9dab-0b54974a6787	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Olur	2026-02-02 00:36:15.707035+03
b1d14be5-b5d3-4d8e-adc6-83d60f0d3df4	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Pasinler	2026-02-02 00:36:15.707035+03
2cf6e5e5-e5c3-4144-b574-f453608bd8b2	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Şenkaya	2026-02-02 00:36:15.707035+03
a9c5fe4e-f72d-483c-a8cf-c1e7353b5045	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Tekman	2026-02-02 00:36:15.707035+03
5a278c68-20c5-4ef2-8776-be31712d85c7	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Tortum	2026-02-02 00:36:15.707035+03
f63ad04b-1be0-43c0-b7ba-619bd4f29c33	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Karaçoban	2026-02-02 00:36:15.707035+03
6a7c7791-867f-450a-881e-0d219e25b043	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Uzundere	2026-02-02 00:36:15.707035+03
9adc23fc-0e03-49ae-8ef3-b1c4ddde40c2	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Pazaryolu	2026-02-02 00:36:15.707035+03
52d0063b-d73e-4e91-a3dd-aa9f8ac9c47b	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Köprüköy	2026-02-02 00:36:15.707035+03
fce6ac1e-98f9-48cc-9e17-635a2f74def4	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Palandöken	2026-02-02 00:36:15.707035+03
63927e2f-4fcf-4167-8ef6-1fb320d8468f	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Yakutiye	2026-02-02 00:36:15.707035+03
3c9a241b-edd9-4e39-8480-7804ea0a2de8	9dda42fc-1928-4ed5-81e5-25f4b66451c1	Aziziye	2026-02-02 00:36:15.707035+03
47f837c4-8409-4dd4-bbdb-8820b7f25986	10aada70-03b8-4a0e-acd9-ac95e0a99642	Çifteler	2026-02-02 00:36:15.707035+03
941826b4-d3d8-45c7-a4b1-84a8acba0431	10aada70-03b8-4a0e-acd9-ac95e0a99642	Mahmudiye	2026-02-02 00:36:15.707035+03
9b70a502-e36f-493e-a916-b6873a97313c	10aada70-03b8-4a0e-acd9-ac95e0a99642	Mihalıççık	2026-02-02 00:36:15.707035+03
0150449d-55eb-4778-a4f9-2360cc045143	10aada70-03b8-4a0e-acd9-ac95e0a99642	Sarıcakaya	2026-02-02 00:36:15.707035+03
d77f02e5-382e-4233-88f8-392301c08f9b	10aada70-03b8-4a0e-acd9-ac95e0a99642	Seyitgazi	2026-02-02 00:36:15.707035+03
b1861c3d-0a18-42bb-89d8-c11dff643279	10aada70-03b8-4a0e-acd9-ac95e0a99642	Sivrihisar	2026-02-02 00:36:15.707035+03
fbb03821-88ed-43f4-9c7e-03ef04434f2f	10aada70-03b8-4a0e-acd9-ac95e0a99642	Alpu	2026-02-02 00:36:15.707035+03
1310e314-94a1-4374-9299-833ad84716d1	10aada70-03b8-4a0e-acd9-ac95e0a99642	Beylikova	2026-02-02 00:36:15.707035+03
a0575035-2acf-43ed-8b26-a7256214c997	10aada70-03b8-4a0e-acd9-ac95e0a99642	İnönü	2026-02-02 00:36:15.707035+03
d26d7f51-5cfe-472b-acc1-caa3ed1bca5b	10aada70-03b8-4a0e-acd9-ac95e0a99642	Günyüzü	2026-02-02 00:36:15.707035+03
6d530b43-cc4c-46c8-87c1-7b397bf66160	10aada70-03b8-4a0e-acd9-ac95e0a99642	Han	2026-02-02 00:36:15.707035+03
073608fc-be4a-4e62-8f5f-e4813b2c366e	10aada70-03b8-4a0e-acd9-ac95e0a99642	Mihalgazi	2026-02-02 00:36:15.707035+03
2844dfca-3d09-43d6-98af-5fff9444f3a2	10aada70-03b8-4a0e-acd9-ac95e0a99642	Odunpazarı	2026-02-02 00:36:15.707035+03
9a467580-6021-4fe8-b1b3-5fdb867e99ad	10aada70-03b8-4a0e-acd9-ac95e0a99642	Tepebaşı	2026-02-02 00:36:15.707035+03
5412d7f0-aa44-4b94-a9d4-22e23824f17a	e3ee9854-bd33-4f3b-a439-48e4100741a8	Araban	2026-02-02 00:36:15.707035+03
23d7af5f-eb5f-497f-bd38-2d9a9b9a2f00	e3ee9854-bd33-4f3b-a439-48e4100741a8	İslahiye	2026-02-02 00:36:15.707035+03
38d14110-5e7f-475b-8a6c-bf94759cad2c	e3ee9854-bd33-4f3b-a439-48e4100741a8	Nizip	2026-02-02 00:36:15.707035+03
f62d13cc-28f1-4de4-b286-3e92a9416edf	e3ee9854-bd33-4f3b-a439-48e4100741a8	Oğuzeli	2026-02-02 00:36:15.707035+03
e91c9d3a-af6d-476b-b593-10241ee54c03	e3ee9854-bd33-4f3b-a439-48e4100741a8	Yavuzeli	2026-02-02 00:36:15.707035+03
f435bc5a-e91a-4343-86c1-33f382cceda5	e3ee9854-bd33-4f3b-a439-48e4100741a8	Şahinbey	2026-02-02 00:36:15.707035+03
8e8dcc7a-ead9-4ae1-b036-d3d2e48afbd7	e3ee9854-bd33-4f3b-a439-48e4100741a8	Şehitkamil	2026-02-02 00:36:15.707035+03
2e0bfad2-3a81-4ee6-9f18-1a84597ae8d6	e3ee9854-bd33-4f3b-a439-48e4100741a8	Karkamış	2026-02-02 00:36:15.707035+03
5bdba3ad-b824-4f58-bde6-97981d40f718	e3ee9854-bd33-4f3b-a439-48e4100741a8	Nurdağı	2026-02-02 00:36:15.707035+03
cfd5e37d-9d9d-4c32-9d2b-ff67b5829232	75642ef5-64f3-4042-a973-a77c012d930a	Alucra	2026-02-02 00:36:15.707035+03
e2ec5749-1746-4cae-95a7-1cdb3734c407	75642ef5-64f3-4042-a973-a77c012d930a	Bulancak	2026-02-02 00:36:15.707035+03
021460f4-4142-4d5f-8af8-67bbb98f207b	75642ef5-64f3-4042-a973-a77c012d930a	Dereli	2026-02-02 00:36:15.707035+03
c8d01d79-bef3-4594-948b-6bec56f8a043	75642ef5-64f3-4042-a973-a77c012d930a	Espiye	2026-02-02 00:36:15.707035+03
311add34-f3d4-4fac-b04b-d14fc4c1c32e	75642ef5-64f3-4042-a973-a77c012d930a	Eynesil	2026-02-02 00:36:15.707035+03
45591889-34a0-46da-a74a-468234d2056c	75642ef5-64f3-4042-a973-a77c012d930a	Merkez	2026-02-02 00:36:15.707035+03
650cdf21-fec9-4fff-82f4-e4be5485c985	75642ef5-64f3-4042-a973-a77c012d930a	Görele	2026-02-02 00:36:15.707035+03
34128d55-c190-4a8a-a195-33e0bf4be5be	75642ef5-64f3-4042-a973-a77c012d930a	Keşap	2026-02-02 00:36:15.707035+03
0bf231f0-e57c-4bab-a433-45121635fefd	75642ef5-64f3-4042-a973-a77c012d930a	Şebinkarahisar	2026-02-02 00:36:15.707035+03
e8ba0cc6-0fb9-4b86-885c-a28fb263f0c5	75642ef5-64f3-4042-a973-a77c012d930a	Tirebolu	2026-02-02 00:36:15.707035+03
1200cdd5-43b4-4fa1-8dd3-47189c757567	75642ef5-64f3-4042-a973-a77c012d930a	Piraziz	2026-02-02 00:36:15.707035+03
90e8cba8-fe5a-4778-bde2-acc535fd443e	75642ef5-64f3-4042-a973-a77c012d930a	Yağlıdere	2026-02-02 00:36:15.707035+03
bad023f2-1063-4a17-a21a-ae7ec112906c	75642ef5-64f3-4042-a973-a77c012d930a	Çamoluk	2026-02-02 00:36:15.707035+03
57287abd-cd52-4134-868a-3a11b463b8b3	75642ef5-64f3-4042-a973-a77c012d930a	Çanakçı	2026-02-02 00:36:15.707035+03
7f690c85-6609-4b55-90dd-83737908867a	75642ef5-64f3-4042-a973-a77c012d930a	Doğankent	2026-02-02 00:36:15.707035+03
dcfe0f4f-f35f-4bc3-83e0-0c4266c6ece0	75642ef5-64f3-4042-a973-a77c012d930a	Güce	2026-02-02 00:36:15.707035+03
807aeea8-9a6c-4cda-9133-067af0141724	50c11c63-816e-4812-94c9-93b07b56dbeb	Merkez	2026-02-02 00:36:15.707035+03
dbc4f6d1-b51c-40c6-a957-2cd7fc93993d	50c11c63-816e-4812-94c9-93b07b56dbeb	Kelkit	2026-02-02 00:36:15.707035+03
8c78db7f-e46c-4b77-b40f-457c47dbff19	50c11c63-816e-4812-94c9-93b07b56dbeb	Şiran	2026-02-02 00:36:15.707035+03
917e21b1-ccf9-41b9-a679-6c98e8c53f22	50c11c63-816e-4812-94c9-93b07b56dbeb	Torul	2026-02-02 00:36:15.707035+03
de84ab95-2a90-4043-8924-0228cbe69bcd	50c11c63-816e-4812-94c9-93b07b56dbeb	Köse	2026-02-02 00:36:15.707035+03
99a6e689-943f-4346-85a3-7470840d952c	50c11c63-816e-4812-94c9-93b07b56dbeb	Kürtün	2026-02-02 00:36:15.707035+03
be525343-881b-4bcf-8699-4d10bcf1e788	512bf12c-cfbb-45d1-a06c-cfe7708e793c	Çukurca	2026-02-02 00:36:15.707035+03
dce9f98c-2622-4960-bcb2-066bf9f9d48f	512bf12c-cfbb-45d1-a06c-cfe7708e793c	Merkez	2026-02-02 00:36:15.707035+03
2f60896c-823c-430b-9215-d7557f18221d	512bf12c-cfbb-45d1-a06c-cfe7708e793c	Şemdinli	2026-02-02 00:36:15.707035+03
00eecb5f-398c-4635-bd11-0707772b0620	512bf12c-cfbb-45d1-a06c-cfe7708e793c	Yüksekova	2026-02-02 00:36:15.707035+03
d88c1885-0050-442b-b61e-f26d78469d00	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Altınözü	2026-02-02 00:36:15.707035+03
89babdce-eca6-4671-8519-f3e550e60f36	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Arsuz	2026-02-02 00:36:15.707035+03
1f77e297-1ed3-4969-baee-bfc02c06c7d1	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Defne	2026-02-02 00:36:15.707035+03
681b57c3-5685-44e5-96dd-657f81f7bf8a	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Dörtyol	2026-02-02 00:36:15.707035+03
ad784861-0be2-493a-a853-347cd51c7029	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Hassa	2026-02-02 00:36:15.707035+03
00c55141-6d09-4cbe-bc9e-d786d273930e	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Antakya	2026-02-02 00:36:15.707035+03
61bc2caa-75b7-46d9-8e8b-dfc3c0c80b3a	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	İskenderun	2026-02-02 00:36:15.707035+03
fdfcbc97-2e0f-4e14-aecf-3c04af3da687	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Kırıkhan	2026-02-02 00:36:15.707035+03
896adc8a-9c00-4b8d-a1c2-7abef20ecd44	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Payas	2026-02-02 00:36:15.707035+03
1529c42f-1780-4d01-a903-7f7341c7ad3a	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Reyhanlı	2026-02-02 00:36:15.707035+03
736c47e2-142a-4f3f-bbe8-08939dfae39f	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Samandağ	2026-02-02 00:36:15.707035+03
e4ecaf8d-a49c-4d81-a8aa-39e1c190972c	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Yayladağı	2026-02-02 00:36:15.707035+03
05310d32-b697-4c88-83c5-23efcbe383a7	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Erzin	2026-02-02 00:36:15.707035+03
5fc426d3-7dcb-4734-ae1f-fbfeaaf60092	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Belen	2026-02-02 00:36:15.707035+03
1496fb11-e3a2-4b4f-a562-519bceffe823	b5c1515c-99af-417d-8fbe-ab4d3d6aab44	Kumlu	2026-02-02 00:36:15.707035+03
ac7ec195-2a4a-4a8a-b04d-54d4569c6337	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Atabey	2026-02-02 00:36:15.707035+03
871f2e97-996f-4cbd-b84a-f906be4fca5f	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Eğirdir	2026-02-02 00:36:15.707035+03
27f21b7c-7f80-40a1-826b-ae31cd8c281d	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Gelendost	2026-02-02 00:36:15.707035+03
23479516-1046-45c7-989a-25fbc13182d4	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Merkez	2026-02-02 00:36:15.707035+03
503a96a9-cea0-4baa-8fe7-3645998f6f4d	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Keçiborlu	2026-02-02 00:36:15.707035+03
38c8f178-7ed1-4b01-b3f7-a02251cab19e	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Senirkent	2026-02-02 00:36:15.707035+03
57350685-2ab6-4da8-9572-bd70836e462a	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Sütçüler	2026-02-02 00:36:15.707035+03
90a4c245-2343-4e36-91db-f65671dacd52	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Şarkikaraağaç	2026-02-02 00:36:15.707035+03
609851b2-d90d-4a69-8a70-bfbbaa1003bc	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Uluborlu	2026-02-02 00:36:15.707035+03
93c15716-027d-466d-a9b5-9bf94eacb3c7	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Yalvaç	2026-02-02 00:36:15.707035+03
0e5ece0a-f908-42ac-a841-0338509ef069	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Aksu	2026-02-02 00:36:15.707035+03
94c85c5a-5c2f-42ee-84dc-be8a8abe6142	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Gönen	2026-02-02 00:36:15.707035+03
56ea9a25-025f-4e62-bd8b-196058a7e938	d5a64f3f-ca61-4ce4-83dd-b19c74fbd00f	Yenişarbademli	2026-02-02 00:36:15.707035+03
8698e42a-f02f-470d-83d8-79712c1e3f9a	e9e3713a-8018-4194-aef2-0abc3e1b5695	Anamur	2026-02-02 00:36:15.707035+03
d8bfcde3-dbac-456f-963c-60e632ac6930	e9e3713a-8018-4194-aef2-0abc3e1b5695	Erdemli	2026-02-02 00:36:15.707035+03
4be5ebcf-de34-454a-9335-316b5a53186c	e9e3713a-8018-4194-aef2-0abc3e1b5695	Gülnar	2026-02-02 00:36:15.707035+03
14d3a5a0-caa1-4c99-8661-62ebf3a71cda	e9e3713a-8018-4194-aef2-0abc3e1b5695	Mut	2026-02-02 00:36:15.707035+03
128270ed-0d3b-45c6-861a-50112ff75fcb	e9e3713a-8018-4194-aef2-0abc3e1b5695	Silifke	2026-02-02 00:36:15.707035+03
7dae6107-865e-4229-a5fc-9703ad6c534f	e9e3713a-8018-4194-aef2-0abc3e1b5695	Tarsus	2026-02-02 00:36:15.707035+03
f4fe28ed-7d97-47c7-8efe-1d34fff8dabf	e9e3713a-8018-4194-aef2-0abc3e1b5695	Aydıncık	2026-02-02 00:36:15.707035+03
cc0905f4-ebca-41ae-b1bb-cfeea31f0bbe	e9e3713a-8018-4194-aef2-0abc3e1b5695	Bozyazı	2026-02-02 00:36:15.707035+03
9ffd2a91-6c4f-4ce0-ac12-5b40db2c307c	e9e3713a-8018-4194-aef2-0abc3e1b5695	Çamlıyayla	2026-02-02 00:36:15.707035+03
16625f1f-ff77-4e16-bd40-a25253b8a5a2	e9e3713a-8018-4194-aef2-0abc3e1b5695	Akdeniz	2026-02-02 00:36:15.707035+03
b71e04ab-1417-4298-a37a-d69518732a9a	e9e3713a-8018-4194-aef2-0abc3e1b5695	Mezitli	2026-02-02 00:36:15.707035+03
f483286f-6a56-48c2-b6a2-6a1fe08aec7a	e9e3713a-8018-4194-aef2-0abc3e1b5695	Toroslar	2026-02-02 00:36:15.707035+03
898ed9d7-3869-4707-ac0d-f6d3bb4300a1	e9e3713a-8018-4194-aef2-0abc3e1b5695	Yenişehir	2026-02-02 00:36:15.707035+03
f83811b5-7220-4e0f-9e05-938dbb33e420	01cf7a28-5f36-462e-8016-1fecb08baf06	Adalar	2026-02-02 00:36:15.707035+03
56ff0161-c063-4f19-97b9-f552d518a9a6	01cf7a28-5f36-462e-8016-1fecb08baf06	Bakırköy	2026-02-02 00:36:15.707035+03
10c53a19-fb58-42d4-a093-31850b48d9aa	01cf7a28-5f36-462e-8016-1fecb08baf06	Beşiktaş	2026-02-02 00:36:15.707035+03
c9d88c12-8b19-47a9-8114-69f3d925ede4	01cf7a28-5f36-462e-8016-1fecb08baf06	Beykoz	2026-02-02 00:36:15.707035+03
6338990f-399f-45cd-9943-c7b5fbc3d469	01cf7a28-5f36-462e-8016-1fecb08baf06	Beyoğlu	2026-02-02 00:36:15.707035+03
c3e60f88-0f73-4f1b-92cf-e486d45a4fcf	01cf7a28-5f36-462e-8016-1fecb08baf06	Çatalca	2026-02-02 00:36:15.707035+03
e79ceb87-1ff4-471c-97f4-fd19c7f71c67	01cf7a28-5f36-462e-8016-1fecb08baf06	Eyüp	2026-02-02 00:36:15.707035+03
4cd81013-1f4c-4d23-9304-d335a5503fe5	01cf7a28-5f36-462e-8016-1fecb08baf06	Fatih	2026-02-02 00:36:15.707035+03
a9e75157-586b-4d9a-a1f8-93c54c4938a1	01cf7a28-5f36-462e-8016-1fecb08baf06	Gaziosmanpaşa	2026-02-02 00:36:15.707035+03
0806f019-6ef6-4911-a335-87a3934ff44d	01cf7a28-5f36-462e-8016-1fecb08baf06	Kadıköy	2026-02-02 00:36:15.707035+03
c0a1dfab-31fc-4b96-91a1-48522fb08be4	01cf7a28-5f36-462e-8016-1fecb08baf06	Kartal	2026-02-02 00:36:15.707035+03
6cedd9c9-0aa1-47be-880d-b62155f5cc0e	01cf7a28-5f36-462e-8016-1fecb08baf06	Sarıyer	2026-02-02 00:36:15.707035+03
8024c1fe-9b61-4979-accb-dbfe5966a804	01cf7a28-5f36-462e-8016-1fecb08baf06	Silivri	2026-02-02 00:36:15.707035+03
455b59bb-1e98-4e24-92d9-5923e37e091f	01cf7a28-5f36-462e-8016-1fecb08baf06	Şile	2026-02-02 00:36:15.707035+03
11575b42-0f40-412d-bb6a-f027c8307839	01cf7a28-5f36-462e-8016-1fecb08baf06	Şişli	2026-02-02 00:36:15.707035+03
2df869b3-2f2c-4391-b180-fbf771b81f02	01cf7a28-5f36-462e-8016-1fecb08baf06	Üsküdar	2026-02-02 00:36:15.707035+03
12db2a8e-837c-437e-a558-398295560d22	01cf7a28-5f36-462e-8016-1fecb08baf06	Zeytinburnu	2026-02-02 00:36:15.707035+03
aebb7436-16fd-43c7-868f-b1ac90f7c129	01cf7a28-5f36-462e-8016-1fecb08baf06	Büyükçekmece	2026-02-02 00:36:15.707035+03
98a678b8-e0c3-4378-926e-65f1e486afeb	01cf7a28-5f36-462e-8016-1fecb08baf06	Kağıthane	2026-02-02 00:36:15.707035+03
6ad29c98-1796-4cd2-9084-4491c7bbe76b	01cf7a28-5f36-462e-8016-1fecb08baf06	Küçükçekmece	2026-02-02 00:36:15.707035+03
23257002-2fee-46a9-8d58-95e218c7c200	01cf7a28-5f36-462e-8016-1fecb08baf06	Pendik	2026-02-02 00:36:15.707035+03
2f543b0b-947e-4ba4-9952-3862dfb590a5	01cf7a28-5f36-462e-8016-1fecb08baf06	Ümraniye	2026-02-02 00:36:15.707035+03
d1892417-74ac-4cfd-b529-0c23f7da1477	01cf7a28-5f36-462e-8016-1fecb08baf06	Bayrampaşa	2026-02-02 00:36:15.707035+03
3cd4e4bd-49fb-428f-98e7-d652d4f89aca	01cf7a28-5f36-462e-8016-1fecb08baf06	Avcılar	2026-02-02 00:36:15.707035+03
7b5eb1ec-88cb-4cb6-abfd-74883d03be62	01cf7a28-5f36-462e-8016-1fecb08baf06	Bağcılar	2026-02-02 00:36:15.707035+03
b1ea1b44-3c5c-44cd-8979-099b0bea88c3	01cf7a28-5f36-462e-8016-1fecb08baf06	Bahçelievler	2026-02-02 00:36:15.707035+03
98775838-ef52-464c-915a-460e2515039b	01cf7a28-5f36-462e-8016-1fecb08baf06	Güngören	2026-02-02 00:36:15.707035+03
e707bb69-e76a-4942-af03-dd4b39a99e9e	01cf7a28-5f36-462e-8016-1fecb08baf06	Maltepe	2026-02-02 00:36:15.707035+03
40a81b6b-4369-4cc7-9d7d-ee5f776b3b4f	01cf7a28-5f36-462e-8016-1fecb08baf06	Sultanbeyli	2026-02-02 00:36:15.707035+03
e992191c-aff5-4390-baab-ccdcf6b9b0a0	01cf7a28-5f36-462e-8016-1fecb08baf06	Tuzla	2026-02-02 00:36:15.707035+03
19ebbefc-5356-45da-92bd-d2d247bb9edb	01cf7a28-5f36-462e-8016-1fecb08baf06	Esenler	2026-02-02 00:36:15.707035+03
e01e53e0-5348-448f-8b6e-cde292bf145d	01cf7a28-5f36-462e-8016-1fecb08baf06	Arnavutköy	2026-02-02 00:36:15.707035+03
b2f34f85-7d4d-4ddb-81a8-73c625fc917b	01cf7a28-5f36-462e-8016-1fecb08baf06	Ataşehir	2026-02-02 00:36:15.707035+03
7a70bd59-1fab-41d6-a909-a6d8c131e795	01cf7a28-5f36-462e-8016-1fecb08baf06	Başakşehir	2026-02-02 00:36:15.707035+03
400433b6-2f65-44e8-98f8-d53546b88940	01cf7a28-5f36-462e-8016-1fecb08baf06	Beylikdüzü	2026-02-02 00:36:15.707035+03
4642e133-c819-4880-b3ca-e8e0fe67da2e	01cf7a28-5f36-462e-8016-1fecb08baf06	Çekmeköy	2026-02-02 00:36:15.707035+03
f42040f9-33cd-416f-9c15-8a22d6096b80	01cf7a28-5f36-462e-8016-1fecb08baf06	Esenyurt	2026-02-02 00:36:15.707035+03
e846d5d3-a754-4f52-954e-f719843c1283	01cf7a28-5f36-462e-8016-1fecb08baf06	Sancaktepe	2026-02-02 00:36:15.707035+03
b85f0a93-4ba1-4943-b9e2-29ced40a9718	01cf7a28-5f36-462e-8016-1fecb08baf06	Sultangazi	2026-02-02 00:36:15.707035+03
00ca6e0a-833a-424a-8bce-741298458182	422ddccc-6602-4215-9e78-d6c577bff092	Aliağa	2026-02-02 00:36:15.707035+03
8fc7bdac-7a4c-4349-98e8-3c96d5aff844	422ddccc-6602-4215-9e78-d6c577bff092	Bayındır	2026-02-02 00:36:15.707035+03
885178c7-567a-44d2-a022-915c4c2433a7	422ddccc-6602-4215-9e78-d6c577bff092	Bergama	2026-02-02 00:36:15.707035+03
1d0c88e6-21b2-426c-acf6-cfba8af8a537	422ddccc-6602-4215-9e78-d6c577bff092	Bornova	2026-02-02 00:36:15.707035+03
c1a7c34d-a21b-48b8-9ff2-0756ba8b16b2	422ddccc-6602-4215-9e78-d6c577bff092	Çeşme	2026-02-02 00:36:15.707035+03
e77e2867-3672-4c6c-a3eb-06296c47eb8c	422ddccc-6602-4215-9e78-d6c577bff092	Dikili	2026-02-02 00:36:15.707035+03
89ddbc91-67f0-489e-921d-778817db5c5a	422ddccc-6602-4215-9e78-d6c577bff092	Foça	2026-02-02 00:36:15.707035+03
63b67dfd-140b-435a-9843-47c05e5a2bf2	422ddccc-6602-4215-9e78-d6c577bff092	Karaburun	2026-02-02 00:36:15.707035+03
cb39e840-b6a8-4d42-9bf3-7b643a3f4df8	422ddccc-6602-4215-9e78-d6c577bff092	Karşıyaka	2026-02-02 00:36:15.707035+03
2ab54e90-bfc0-4428-bebb-54b31b6da7b3	422ddccc-6602-4215-9e78-d6c577bff092	Kemalpaşa	2026-02-02 00:36:15.707035+03
4c6b6409-f2f8-4f19-89e4-b15c9850afa5	422ddccc-6602-4215-9e78-d6c577bff092	Kınık	2026-02-02 00:36:15.707035+03
4f439527-0c57-4285-b04b-d1af4ee6b903	422ddccc-6602-4215-9e78-d6c577bff092	Kiraz	2026-02-02 00:36:15.707035+03
b5efc628-8970-419d-a25e-97218e580697	422ddccc-6602-4215-9e78-d6c577bff092	Menemen	2026-02-02 00:36:15.707035+03
6d7fb952-eb59-484c-8e7a-c836d40b6bf7	422ddccc-6602-4215-9e78-d6c577bff092	Ödemiş	2026-02-02 00:36:15.707035+03
12b36d6c-31b0-4d93-92d8-d061eb5f0743	422ddccc-6602-4215-9e78-d6c577bff092	Seferihisar	2026-02-02 00:36:15.707035+03
c981e3c6-61c8-46ca-a2bf-35a3d381a384	422ddccc-6602-4215-9e78-d6c577bff092	Selçuk	2026-02-02 00:36:15.707035+03
44af05bd-4ea7-418d-9f73-96a0ca309a1d	422ddccc-6602-4215-9e78-d6c577bff092	Tire	2026-02-02 00:36:15.707035+03
52b6e53e-ffc6-4490-8c91-a35ca61e3a52	422ddccc-6602-4215-9e78-d6c577bff092	Torbalı	2026-02-02 00:36:15.707035+03
dd8fd657-8118-4c05-b8c0-a9c197a00750	422ddccc-6602-4215-9e78-d6c577bff092	Urla	2026-02-02 00:36:15.707035+03
9e995985-2a8d-4165-8fa0-f1689a20782e	422ddccc-6602-4215-9e78-d6c577bff092	Beydağ	2026-02-02 00:36:15.707035+03
327f3c01-857e-4b23-832a-f821e02192de	422ddccc-6602-4215-9e78-d6c577bff092	Buca	2026-02-02 00:36:15.707035+03
a94c6909-cfc0-49e0-8345-f9382b1dbd0a	422ddccc-6602-4215-9e78-d6c577bff092	Konak	2026-02-02 00:36:15.707035+03
150745bf-42e2-4299-af43-d4b8705eb4a1	422ddccc-6602-4215-9e78-d6c577bff092	Menderes	2026-02-02 00:36:15.707035+03
232e1462-2af9-4e1f-a820-2d8d09d8db54	422ddccc-6602-4215-9e78-d6c577bff092	Balçova	2026-02-02 00:36:15.707035+03
28fa5c49-cd16-4220-8910-c066f7818064	422ddccc-6602-4215-9e78-d6c577bff092	Çiğli	2026-02-02 00:36:15.707035+03
5b7eb378-fa1e-4859-bdd8-49b35d3ac2bd	422ddccc-6602-4215-9e78-d6c577bff092	Gaziemir	2026-02-02 00:36:15.707035+03
15c4a581-afd8-47b7-856a-4e394f3b3db9	422ddccc-6602-4215-9e78-d6c577bff092	Narlıdere	2026-02-02 00:36:15.707035+03
ffb8ca91-7e19-434e-a1c6-22f3f5b63917	422ddccc-6602-4215-9e78-d6c577bff092	Güzelbahçe	2026-02-02 00:36:15.707035+03
8cf3eccd-0187-40a7-8afb-5912ec20ba4e	422ddccc-6602-4215-9e78-d6c577bff092	Bayraklı	2026-02-02 00:36:15.707035+03
502c4524-e0a3-4b5e-82f3-dc6ccb97e1a4	422ddccc-6602-4215-9e78-d6c577bff092	Karabağlar	2026-02-02 00:36:15.707035+03
2967204f-5a85-4a44-838a-1fb188917dc5	0a005488-c8d0-4031-8f4f-e7f94599523b	Arpaçay	2026-02-02 00:36:15.707035+03
3efe1762-413a-43d3-8f3c-3f984e7c69d1	0a005488-c8d0-4031-8f4f-e7f94599523b	Digor	2026-02-02 00:36:15.707035+03
06c5e234-f273-49ae-88b6-8c751cd33088	0a005488-c8d0-4031-8f4f-e7f94599523b	Kağızman	2026-02-02 00:36:15.707035+03
be6d2df6-bf42-4557-b1eb-2aa238dda32a	0a005488-c8d0-4031-8f4f-e7f94599523b	Merkez	2026-02-02 00:36:15.707035+03
12763e50-7108-49d3-8826-78264717075c	0a005488-c8d0-4031-8f4f-e7f94599523b	Sarıkamış	2026-02-02 00:36:15.707035+03
cbde86b8-ecc9-453a-ac2d-be29e2d3923b	0a005488-c8d0-4031-8f4f-e7f94599523b	Selim	2026-02-02 00:36:15.707035+03
a4cc623d-ee9f-4a72-bde4-6208a5e6c0c0	0a005488-c8d0-4031-8f4f-e7f94599523b	Susuz	2026-02-02 00:36:15.707035+03
a0e37b5f-e7a2-4636-be35-fcc7d0ae80fb	0a005488-c8d0-4031-8f4f-e7f94599523b	Akyaka	2026-02-02 00:36:15.707035+03
d929a6dd-dfee-44d6-980e-89ed67e17c1b	6f8232be-31ea-4b22-b06a-186ee3d832a8	Abana	2026-02-02 00:36:15.707035+03
3d130920-c06c-434d-a562-def43bfd717e	6f8232be-31ea-4b22-b06a-186ee3d832a8	Araç	2026-02-02 00:36:15.707035+03
31c3780f-f43b-40ac-b94d-0ac50f065698	6f8232be-31ea-4b22-b06a-186ee3d832a8	Azdavay	2026-02-02 00:36:15.707035+03
b288423d-b8c3-4f23-afdf-e4c1c15fd66b	6f8232be-31ea-4b22-b06a-186ee3d832a8	Bozkurt	2026-02-02 00:36:15.707035+03
a1e79ca6-8d96-48f6-b913-d57cffd8ce0a	6f8232be-31ea-4b22-b06a-186ee3d832a8	Cide	2026-02-02 00:36:15.707035+03
5940b746-ddad-46d4-93e7-8d7d4a51eb07	6f8232be-31ea-4b22-b06a-186ee3d832a8	Çatalzeytin	2026-02-02 00:36:15.707035+03
a62a9a37-cc8c-4cce-ad88-630173f8a621	6f8232be-31ea-4b22-b06a-186ee3d832a8	Daday	2026-02-02 00:36:15.707035+03
42cc8932-821c-4127-aaa6-4554b2adba12	6f8232be-31ea-4b22-b06a-186ee3d832a8	Devrekani	2026-02-02 00:36:15.707035+03
390aa3c0-d1ec-4917-95a0-ad839f36a659	6f8232be-31ea-4b22-b06a-186ee3d832a8	İnebolu	2026-02-02 00:36:15.707035+03
49cb7adf-22ac-4ea0-a4c7-d295c9f34d22	6f8232be-31ea-4b22-b06a-186ee3d832a8	Merkez	2026-02-02 00:36:15.707035+03
ab193186-6109-4837-993f-c70f8bbe7209	6f8232be-31ea-4b22-b06a-186ee3d832a8	Küre	2026-02-02 00:36:15.707035+03
47a52007-b772-4d13-8f3a-b03e251b17f6	6f8232be-31ea-4b22-b06a-186ee3d832a8	Taşköprü	2026-02-02 00:36:15.707035+03
2e166d5e-fca8-4415-93ec-17db9e818c68	6f8232be-31ea-4b22-b06a-186ee3d832a8	Tosya	2026-02-02 00:36:15.707035+03
327cb06b-e6f3-4c31-a74d-22b14926bfc2	6f8232be-31ea-4b22-b06a-186ee3d832a8	İhsangazi	2026-02-02 00:36:15.707035+03
dd1d5fb2-8d6c-4528-b258-6833648033b4	6f8232be-31ea-4b22-b06a-186ee3d832a8	Pınarbaşı	2026-02-02 00:36:15.707035+03
f3e156f6-e360-4d82-88c8-3a1d90b5be21	6f8232be-31ea-4b22-b06a-186ee3d832a8	Şenpazar	2026-02-02 00:36:15.707035+03
5c11beea-4159-4a8c-9845-9329f7ce33a4	6f8232be-31ea-4b22-b06a-186ee3d832a8	Ağlı	2026-02-02 00:36:15.707035+03
d51cde7a-d09b-4212-9c16-426f9be481db	6f8232be-31ea-4b22-b06a-186ee3d832a8	Doğanyurt	2026-02-02 00:36:15.707035+03
045b5b7a-b2ae-4b2b-b581-a046fb8c41d0	6f8232be-31ea-4b22-b06a-186ee3d832a8	Hanönü	2026-02-02 00:36:15.707035+03
64483879-e605-45dd-9992-9e1aacad18f9	6f8232be-31ea-4b22-b06a-186ee3d832a8	Seydiler	2026-02-02 00:36:15.707035+03
45679775-78c9-470c-ab2b-3134cce0ca3c	f9bc0ccf-3697-45ab-b693-927232e27609	Bünyan	2026-02-02 00:36:15.707035+03
91dd7477-cfbe-43c1-89c4-401c47db3466	f9bc0ccf-3697-45ab-b693-927232e27609	Develi	2026-02-02 00:36:15.707035+03
63dabccd-932b-4b5b-95bb-9db8e5c512a3	f9bc0ccf-3697-45ab-b693-927232e27609	Felahiye	2026-02-02 00:36:15.707035+03
334be7cb-1827-4271-bbb8-8042ca3d256b	f9bc0ccf-3697-45ab-b693-927232e27609	İncesu	2026-02-02 00:36:15.707035+03
d86e48d3-20b0-4a08-b6fc-4ff35e1fab1f	f9bc0ccf-3697-45ab-b693-927232e27609	Pınarbaşı	2026-02-02 00:36:15.707035+03
1936a528-889e-4327-a530-219a71693186	f9bc0ccf-3697-45ab-b693-927232e27609	Sarıoğlan	2026-02-02 00:36:15.707035+03
57d3565a-2027-49c5-8a37-d5d7fbb4bd0f	f9bc0ccf-3697-45ab-b693-927232e27609	Sarız	2026-02-02 00:36:15.707035+03
6ea7c697-9b8b-4d2e-9b24-50114157143f	f9bc0ccf-3697-45ab-b693-927232e27609	Tomarza	2026-02-02 00:36:15.707035+03
dfdc434e-c709-460d-a912-520fa66e8dc7	f9bc0ccf-3697-45ab-b693-927232e27609	Yahyalı	2026-02-02 00:36:15.707035+03
d08dfd84-4f71-43e9-9f93-486f4f92645e	f9bc0ccf-3697-45ab-b693-927232e27609	Yeşilhisar	2026-02-02 00:36:15.707035+03
afc0dedd-33dc-4bf5-9a70-230590057416	f9bc0ccf-3697-45ab-b693-927232e27609	Akkışla	2026-02-02 00:36:15.707035+03
fc3a056a-5b49-451e-952d-78ca15e735dc	f9bc0ccf-3697-45ab-b693-927232e27609	Talas	2026-02-02 00:36:15.707035+03
ae508dcb-ed03-453f-b610-988032e30cbd	f9bc0ccf-3697-45ab-b693-927232e27609	Kocasinan	2026-02-02 00:36:15.707035+03
8570b815-fe3a-4626-9add-69b13a4f565f	f9bc0ccf-3697-45ab-b693-927232e27609	Melikgazi	2026-02-02 00:36:15.707035+03
1ba7dd03-5642-4e88-9ce5-d4327327230b	f9bc0ccf-3697-45ab-b693-927232e27609	Hacılar	2026-02-02 00:36:15.707035+03
611b263d-efdf-4d02-93c5-69053e8cc386	f9bc0ccf-3697-45ab-b693-927232e27609	Özvatan	2026-02-02 00:36:15.707035+03
1102f069-5137-4d17-bf58-934b005ad756	3bccf67c-36b0-4332-8ff3-f52309c0b350	Babaeski	2026-02-02 00:36:15.707035+03
dc0a022d-40bf-4b9b-86ab-6e81f0fb3cb1	3bccf67c-36b0-4332-8ff3-f52309c0b350	Demirköy	2026-02-02 00:36:15.707035+03
98c3654a-f1a0-4b7d-a045-438364ca7b06	3bccf67c-36b0-4332-8ff3-f52309c0b350	Merkez	2026-02-02 00:36:15.707035+03
e0f2e70e-c158-4cca-992f-d70372d1efc1	3bccf67c-36b0-4332-8ff3-f52309c0b350	Kofçaz	2026-02-02 00:36:15.707035+03
095a35f5-e898-4510-b5f3-f13efa6dd227	3bccf67c-36b0-4332-8ff3-f52309c0b350	Lüleburgaz	2026-02-02 00:36:15.707035+03
37d06a09-2722-4cf1-a13d-1a3b7f4be1f6	3bccf67c-36b0-4332-8ff3-f52309c0b350	Pehlivanköy	2026-02-02 00:36:15.707035+03
7aa4c8aa-a99d-4bef-91a0-71f7a450dbe6	3bccf67c-36b0-4332-8ff3-f52309c0b350	Pınarhisar	2026-02-02 00:36:15.707035+03
c07ccc11-bf1d-4a98-936d-4e693d57ecb5	3bccf67c-36b0-4332-8ff3-f52309c0b350	Vize	2026-02-02 00:36:15.707035+03
00b93632-2725-461a-a273-1dd8a0c06dc9	76ac83da-947d-4572-85f9-f540920426f8	Çiçekdağı	2026-02-02 00:36:15.707035+03
67419dce-e3c3-42f3-b10e-1949fcadda43	76ac83da-947d-4572-85f9-f540920426f8	Kaman	2026-02-02 00:36:15.707035+03
520798c1-e132-4607-a685-db3997a016de	76ac83da-947d-4572-85f9-f540920426f8	Merkez	2026-02-02 00:36:15.707035+03
e8da7d7b-73bb-46cd-a7f8-c5d30d129e7c	76ac83da-947d-4572-85f9-f540920426f8	Mucur	2026-02-02 00:36:15.707035+03
3b09fb03-ff40-4c8b-8206-476e52fab33d	76ac83da-947d-4572-85f9-f540920426f8	Akpınar	2026-02-02 00:36:15.707035+03
5c63a693-3ac7-4bf7-ba21-baa4444b98ad	76ac83da-947d-4572-85f9-f540920426f8	Akçakent	2026-02-02 00:36:15.707035+03
0b85cf07-2b9d-40e1-a6f3-13817733b128	76ac83da-947d-4572-85f9-f540920426f8	Boztepe	2026-02-02 00:36:15.707035+03
ff1df0a3-f0c0-4bd5-ad83-af93f375482b	098af2d5-99ef-444c-be61-64e960b184e5	Gebze	2026-02-02 00:36:15.707035+03
6af93c14-c9f6-4042-98e1-5e0b09f2bee6	098af2d5-99ef-444c-be61-64e960b184e5	Gölcük	2026-02-02 00:36:15.707035+03
23432c17-62a6-4bfc-82dc-4bd09cc8ae37	098af2d5-99ef-444c-be61-64e960b184e5	Kandıra	2026-02-02 00:36:15.707035+03
a484caac-ca92-46fc-bd56-9c1a46b50713	098af2d5-99ef-444c-be61-64e960b184e5	Karamürsel	2026-02-02 00:36:15.707035+03
43ca3c59-e54d-4d47-b147-a50320f44ac7	098af2d5-99ef-444c-be61-64e960b184e5	Körfez	2026-02-02 00:36:15.707035+03
ae2c770f-34fa-4592-882a-3d4dfc4493d4	098af2d5-99ef-444c-be61-64e960b184e5	Derince	2026-02-02 00:36:15.707035+03
0261c9db-59d9-4be7-b57a-fd6c8722a5e1	098af2d5-99ef-444c-be61-64e960b184e5	Başiskele	2026-02-02 00:36:15.707035+03
a6a38013-b923-4765-900b-259b432cc9d4	098af2d5-99ef-444c-be61-64e960b184e5	Çayırova	2026-02-02 00:36:15.707035+03
113834a1-e1a9-4c02-af21-6cc6d09cb13b	098af2d5-99ef-444c-be61-64e960b184e5	Darıca	2026-02-02 00:36:15.707035+03
1826c6e9-2ac7-47e6-bee0-6a4d254050a8	098af2d5-99ef-444c-be61-64e960b184e5	Dilovası	2026-02-02 00:36:15.707035+03
591cb96a-702f-43a8-a820-e3a994c3629a	098af2d5-99ef-444c-be61-64e960b184e5	İzmit	2026-02-02 00:36:15.707035+03
860ba220-a1dc-43bd-abf3-9ef5a2081c41	098af2d5-99ef-444c-be61-64e960b184e5	Kartepe	2026-02-02 00:36:15.707035+03
de7b766c-1e40-4b32-95cf-82476e22a052	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Akşehir	2026-02-02 00:36:15.707035+03
51ac4c02-a166-4470-a4d6-336d1a0c0c5a	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Beyşehir	2026-02-02 00:36:15.707035+03
9f3dc820-f09a-42dd-a713-db10e4779ebc	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Bozkır	2026-02-02 00:36:15.707035+03
9103f865-cfa9-4abd-84fd-6f1963942ba2	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Cihanbeyli	2026-02-02 00:36:15.707035+03
4e11471f-d106-4e5a-94d4-8706ef6b28b4	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Çumra	2026-02-02 00:36:15.707035+03
d4832355-25de-4ba0-ab13-b052c9e1c89e	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Doğanhisar	2026-02-02 00:36:15.707035+03
d6298aba-9696-46d7-a4f1-9fefe9c24e25	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Ereğli	2026-02-02 00:36:15.707035+03
dfffffd3-e62b-430c-b541-baaf44a50f48	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Hadim	2026-02-02 00:36:15.707035+03
feebbdaf-bb06-4bc6-a387-fe37cebdf333	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Ilgın	2026-02-02 00:36:15.707035+03
d9cf4efc-1d95-40a0-ae17-f2100c62e879	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Kadınhanı	2026-02-02 00:36:15.707035+03
a909b405-137b-461d-933c-158da951237f	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Karapınar	2026-02-02 00:36:15.707035+03
64b6934e-7042-4d1d-96de-5a5e17b290b2	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Kulu	2026-02-02 00:36:15.707035+03
4fd269d8-fd5b-45ae-b8cb-3cdd98c28586	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Sarayönü	2026-02-02 00:36:15.707035+03
143588f5-4a78-4ece-a761-ad5246c16482	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Seydişehir	2026-02-02 00:36:15.707035+03
9e9bf874-3dc7-4500-bb23-7a45ddc2127e	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Yunak	2026-02-02 00:36:15.707035+03
715b8dfd-f5ad-4567-8358-c197b6600358	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Akören	2026-02-02 00:36:15.707035+03
2828d246-2a2c-4166-ac31-e8021522ab03	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Altınekin	2026-02-02 00:36:15.707035+03
f8d692cd-9ca3-47e4-a7ee-1bf21c7635dc	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Derebucak	2026-02-02 00:36:15.707035+03
4f29d204-5ba5-4d3a-b1d7-dac20a3f09f0	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Hüyük	2026-02-02 00:36:15.707035+03
ea05bddb-870b-48c0-88fd-07724343d753	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Karatay	2026-02-02 00:36:15.707035+03
00896b4c-40f3-4165-aaa1-de6644c6a7cc	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Meram	2026-02-02 00:36:15.707035+03
d10f8b56-f751-431d-994d-dbe6860a29ac	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Selçuklu	2026-02-02 00:36:15.707035+03
4ee54f5c-824d-44ae-9f1d-f175fc43b04d	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Taşkent	2026-02-02 00:36:15.707035+03
9e3bd19f-c189-4459-970e-ee12aa6beb24	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Ahırlı	2026-02-02 00:36:15.707035+03
db7fa28e-f724-4ffb-8f30-5aa923797611	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Çeltik	2026-02-02 00:36:15.707035+03
ad48ad3e-5e6c-401f-a912-ff1249682360	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Derbent	2026-02-02 00:36:15.707035+03
263a897b-17a1-41fd-a292-dad4ee0f8a31	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Emirgazi	2026-02-02 00:36:15.707035+03
d30688b4-36db-473a-915b-72bad014856e	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Güneysınır	2026-02-02 00:36:15.707035+03
573f48fe-f7f3-4f7e-938d-103688062bdb	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Halkapınar	2026-02-02 00:36:15.707035+03
4989a1ef-4585-4795-861e-f159138332e6	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Tuzlukçu	2026-02-02 00:36:15.707035+03
6a2d8999-19c8-4319-85a0-a504246b0d2a	c0e4a4d4-8444-41e1-8a0a-4cabf95d4c4a	Yalıhüyük	2026-02-02 00:36:15.707035+03
50067661-01ae-4a1f-92a8-09ff0cc73e8a	61537279-6d97-4a3e-a55c-339dd133a4ef	Altıntaş	2026-02-02 00:36:15.707035+03
ebddf357-8fd9-44a9-9d12-9e4d218281cd	61537279-6d97-4a3e-a55c-339dd133a4ef	Domaniç	2026-02-02 00:36:15.707035+03
55f3723b-7dc8-40a9-a6b2-9e53135c24c9	61537279-6d97-4a3e-a55c-339dd133a4ef	Emet	2026-02-02 00:36:15.707035+03
92969bbe-30f3-4efb-86b3-24c4846b6550	61537279-6d97-4a3e-a55c-339dd133a4ef	Gediz	2026-02-02 00:36:15.707035+03
1ec2e1bc-8409-4f3a-ab39-7198325001ce	61537279-6d97-4a3e-a55c-339dd133a4ef	Merkez	2026-02-02 00:36:15.707035+03
4b90feb7-b210-4dd3-a295-d4e2cf291017	61537279-6d97-4a3e-a55c-339dd133a4ef	Simav	2026-02-02 00:36:15.707035+03
977ea711-5f07-4ccb-9c25-b0817d89191f	61537279-6d97-4a3e-a55c-339dd133a4ef	Tavşanlı	2026-02-02 00:36:15.707035+03
7898f422-baef-4c1e-bdd1-a70015bda1c8	61537279-6d97-4a3e-a55c-339dd133a4ef	Aslanapa	2026-02-02 00:36:15.707035+03
5b57bf2f-1ca3-42cb-89e5-1fc103efcd42	61537279-6d97-4a3e-a55c-339dd133a4ef	Dumlupınar	2026-02-02 00:36:15.707035+03
b8265603-801f-48fc-8acd-75e437928ece	61537279-6d97-4a3e-a55c-339dd133a4ef	Hisarcık	2026-02-02 00:36:15.707035+03
0e9fc25c-14e6-48c2-b03d-c90679f24b88	61537279-6d97-4a3e-a55c-339dd133a4ef	Şaphane	2026-02-02 00:36:15.707035+03
656bf8eb-9764-41f9-8826-74ebe795a0e9	61537279-6d97-4a3e-a55c-339dd133a4ef	Çavdarhisar	2026-02-02 00:36:15.707035+03
4ff006a9-1861-4e97-863d-8aacc38f8a89	61537279-6d97-4a3e-a55c-339dd133a4ef	Pazarlar	2026-02-02 00:36:15.707035+03
f7418006-19b0-49c3-ad68-3513050fe908	66467353-5f67-471d-b20a-3dcd62a830ea	Akçadağ	2026-02-02 00:36:15.707035+03
e06d6303-4903-4abe-b2b1-aa5bb50d11e9	66467353-5f67-471d-b20a-3dcd62a830ea	Arapgir	2026-02-02 00:36:15.707035+03
23bd9797-03c0-4821-ac7a-c4b41e636f52	66467353-5f67-471d-b20a-3dcd62a830ea	Arguvan	2026-02-02 00:36:15.707035+03
ce58b76a-9b77-40f3-901c-905522f55834	66467353-5f67-471d-b20a-3dcd62a830ea	Darende	2026-02-02 00:36:15.707035+03
f43e1e54-fcc6-4bd6-bbec-e55501f14bd8	66467353-5f67-471d-b20a-3dcd62a830ea	Doğanşehir	2026-02-02 00:36:15.707035+03
20ac3223-951d-46ed-b777-4cd964950294	66467353-5f67-471d-b20a-3dcd62a830ea	Hekimhan	2026-02-02 00:36:15.707035+03
880ff716-6364-45ff-a8e7-80090a82501a	66467353-5f67-471d-b20a-3dcd62a830ea	Merkez	2026-02-02 00:36:15.707035+03
10888a47-bd95-4ab1-a5fc-535850d7d729	66467353-5f67-471d-b20a-3dcd62a830ea	Pütürge	2026-02-02 00:36:15.707035+03
a4a252f3-f1fc-449b-8cdd-359372c85adc	66467353-5f67-471d-b20a-3dcd62a830ea	Yeşilyurt	2026-02-02 00:36:15.707035+03
f752bb82-7d80-4fbf-ac1a-03903413f7c9	66467353-5f67-471d-b20a-3dcd62a830ea	Battalgazi	2026-02-02 00:36:15.707035+03
e39dc4f5-2e4a-4d97-8f60-e89a079a9b68	66467353-5f67-471d-b20a-3dcd62a830ea	Doğanyol	2026-02-02 00:36:15.707035+03
955e2f35-b871-4459-834e-e300fb39b12e	66467353-5f67-471d-b20a-3dcd62a830ea	Kale	2026-02-02 00:36:15.707035+03
4a50d012-9fc9-41cb-a7a0-5abadaa975b6	66467353-5f67-471d-b20a-3dcd62a830ea	Kuluncak	2026-02-02 00:36:15.707035+03
ae3e712e-615a-46dd-9a81-fb87af37a05e	66467353-5f67-471d-b20a-3dcd62a830ea	Yazıhan	2026-02-02 00:36:15.707035+03
4175c566-4816-4592-8555-a99c880e22dd	25922708-10c2-4fb1-9c18-0572cc79a83e	Akhisar	2026-02-02 00:36:15.707035+03
3768d808-367b-4cce-8088-d0739e9ee0e2	25922708-10c2-4fb1-9c18-0572cc79a83e	Alaşehir	2026-02-02 00:36:15.707035+03
6cefd498-35da-4450-8c70-6c0110ed95d1	25922708-10c2-4fb1-9c18-0572cc79a83e	Demirci	2026-02-02 00:36:15.707035+03
c20be54b-e781-4a11-9afc-7af8ac8d3ac3	25922708-10c2-4fb1-9c18-0572cc79a83e	Gördes	2026-02-02 00:36:15.707035+03
0935fc1f-2464-4835-b8b0-54db309438db	25922708-10c2-4fb1-9c18-0572cc79a83e	Kırkağaç	2026-02-02 00:36:15.707035+03
be4c499e-866d-49dd-b86a-35164869f1b9	25922708-10c2-4fb1-9c18-0572cc79a83e	Kula	2026-02-02 00:36:15.707035+03
0497391e-8089-4798-a987-df5e6f2353db	25922708-10c2-4fb1-9c18-0572cc79a83e	Merkez	2026-02-02 00:36:15.707035+03
274752cd-95d9-43f2-9832-c271498d3b31	25922708-10c2-4fb1-9c18-0572cc79a83e	Salihli	2026-02-02 00:36:15.707035+03
e6a932bb-fb69-4f40-8369-2bf893aeca9e	25922708-10c2-4fb1-9c18-0572cc79a83e	Sarıgöl	2026-02-02 00:36:15.707035+03
a412fb88-e392-4284-b82c-b6cbe561f7c9	25922708-10c2-4fb1-9c18-0572cc79a83e	Saruhanlı	2026-02-02 00:36:15.707035+03
5a6636e8-0d68-4bd2-aabd-16559eab69fe	25922708-10c2-4fb1-9c18-0572cc79a83e	Selendi	2026-02-02 00:36:15.707035+03
d28a0bc7-6b86-4df4-bfaa-a3ec29ac51ed	25922708-10c2-4fb1-9c18-0572cc79a83e	Soma	2026-02-02 00:36:15.707035+03
b9be88ff-0b0c-4551-974f-b31d797af369	25922708-10c2-4fb1-9c18-0572cc79a83e	Şehzadeler	2026-02-02 00:36:15.707035+03
8355ca35-708b-499b-9180-71627697ad1e	25922708-10c2-4fb1-9c18-0572cc79a83e	Yunusemre	2026-02-02 00:36:15.707035+03
f3a70258-7e1e-4e7b-8045-f74c9bcb6c1d	25922708-10c2-4fb1-9c18-0572cc79a83e	Turgutlu	2026-02-02 00:36:15.707035+03
a71e884f-c9d8-4997-be31-9fb13528c5b4	25922708-10c2-4fb1-9c18-0572cc79a83e	Ahmetli	2026-02-02 00:36:15.707035+03
c6c5bd8c-8252-486c-ae3c-20e61141b078	25922708-10c2-4fb1-9c18-0572cc79a83e	Gölmarmara	2026-02-02 00:36:15.707035+03
b384fee0-b4e3-482a-b343-643c8541e6fd	25922708-10c2-4fb1-9c18-0572cc79a83e	Köprübaşı	2026-02-02 00:36:15.707035+03
4519507b-ce3e-4d05-9197-8656e67c61c0	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Afşin	2026-02-02 00:36:15.707035+03
86010312-f18b-4c6d-8408-fd7e918e325a	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Andırın	2026-02-02 00:36:15.707035+03
ae0d1bc3-a4f7-4982-a175-128533208fe3	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Dulkadiroğlu	2026-02-02 00:36:15.707035+03
66be913e-af67-4c49-8e76-a66c6d73896c	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Onikişubat	2026-02-02 00:36:15.707035+03
cacc1424-e57b-4cd7-b90a-559b6863629b	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Elbistan	2026-02-02 00:36:15.707035+03
9c330e1d-5bc2-41dd-b82a-69884d2e98d3	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Göksun	2026-02-02 00:36:15.707035+03
56407045-bcb3-4807-94e3-709464ef479f	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Merkez	2026-02-02 00:36:15.707035+03
cf8090b4-05a7-48c3-9449-19fe534fb672	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Pazarcık	2026-02-02 00:36:15.707035+03
560899cb-75a5-4789-adae-908d55f333c4	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Türkoğlu	2026-02-02 00:36:15.707035+03
0d2663fe-e3b8-461a-b0dd-d0a5d75af1a0	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Çağlayancerit	2026-02-02 00:36:15.707035+03
529f2ec6-fed0-4633-8ba1-67d4b2206201	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Ekinözü	2026-02-02 00:36:15.707035+03
63c9460c-f2db-400f-8c70-496d8d8ee9ab	6a77af0d-7c5c-4f51-87b1-f690f7165e76	Nurhak	2026-02-02 00:36:15.707035+03
978550fd-d01a-4264-915e-9c60e14dfc7b	47d72264-11e6-4472-8421-24c085eee7e1	Derik	2026-02-02 00:36:15.707035+03
12a44df3-5627-455c-9735-ede63bbfa380	47d72264-11e6-4472-8421-24c085eee7e1	Kızıltepe	2026-02-02 00:36:15.707035+03
f5f8b961-3dbc-4742-9221-5394bb1163e2	47d72264-11e6-4472-8421-24c085eee7e1	Artuklu	2026-02-02 00:36:15.707035+03
8a51c3b5-7741-4753-bad9-f5f3b2587b34	47d72264-11e6-4472-8421-24c085eee7e1	Merkez	2026-02-02 00:36:15.707035+03
df400d58-61f5-4f25-b70d-0f894fda3154	47d72264-11e6-4472-8421-24c085eee7e1	Mazıdağı	2026-02-02 00:36:15.707035+03
fc41de84-a5d3-4de8-92b9-c3e855c4b0e8	47d72264-11e6-4472-8421-24c085eee7e1	Midyat	2026-02-02 00:36:15.707035+03
5bba7813-52c7-490c-832a-45f0a3af38c0	47d72264-11e6-4472-8421-24c085eee7e1	Nusaybin	2026-02-02 00:36:15.707035+03
6499f07f-1a15-4b99-bbb6-0377a6bec5eb	47d72264-11e6-4472-8421-24c085eee7e1	Ömerli	2026-02-02 00:36:15.707035+03
94534d46-0007-4152-bee9-2fd6912b6f45	47d72264-11e6-4472-8421-24c085eee7e1	Savur	2026-02-02 00:36:15.707035+03
c462dc53-a1f5-45f1-bd64-e21607de8a4d	47d72264-11e6-4472-8421-24c085eee7e1	Dargeçit	2026-02-02 00:36:15.707035+03
da349ad0-4868-4425-9e56-21e89a0ed275	47d72264-11e6-4472-8421-24c085eee7e1	Yeşilli	2026-02-02 00:36:15.707035+03
e92f2726-d3a2-46ae-a1e4-c022355ccd07	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Bodrum	2026-02-02 00:36:15.707035+03
43adfec5-38b3-408d-92a6-71d139a4d2d5	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Datça	2026-02-02 00:36:15.707035+03
9cfe1feb-9c90-43ab-ac6b-bad2172ad085	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Fethiye	2026-02-02 00:36:15.707035+03
6b54ac2d-4406-4396-abf1-9701453ffe17	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Köyceğiz	2026-02-02 00:36:15.707035+03
ff80dc07-d06c-44d6-9df2-c1a65101b314	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Marmaris	2026-02-02 00:36:15.707035+03
588a5acc-8863-4119-90a1-4f77bf3e1062	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Menteşe	2026-02-02 00:36:15.707035+03
0ff58025-ff7d-461e-aa41-c6d98d97659a	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Milas	2026-02-02 00:36:15.707035+03
22b1a06e-cddc-4652-b948-358c6a05402d	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Ula	2026-02-02 00:36:15.707035+03
114da7b0-fff4-49a3-b62a-39056b17a434	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Yatağan	2026-02-02 00:36:15.707035+03
b52b6957-8155-46d2-84ca-9f1cbcd4c0f7	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Dalaman	2026-02-02 00:36:15.707035+03
940fdbbd-eaf5-4029-987f-a89f30960e26	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Seydikemer	2026-02-02 00:36:15.707035+03
53aea099-d109-4fa4-8f7e-1a59d8856fd4	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Ortaca	2026-02-02 00:36:15.707035+03
873a4936-568b-4d59-abf2-9cfa165b444e	507335f0-d6ee-4c4a-8a8c-9d8407d92cf4	Kavaklıdere	2026-02-02 00:36:15.707035+03
5e894cf5-80a8-4424-9895-5680eb62442f	45390b70-bbd4-4a91-8cfc-ed6839e337d2	Bulanık	2026-02-02 00:36:15.707035+03
bee85b90-6967-4b3e-b595-c53a4f7c54cc	45390b70-bbd4-4a91-8cfc-ed6839e337d2	Malazgirt	2026-02-02 00:36:15.707035+03
f6c70ae0-065b-44b9-86de-9c7bc42b867b	45390b70-bbd4-4a91-8cfc-ed6839e337d2	Merkez	2026-02-02 00:36:15.707035+03
0aef9087-6d5b-4368-94d0-856c6dea7956	45390b70-bbd4-4a91-8cfc-ed6839e337d2	Varto	2026-02-02 00:36:15.707035+03
13d984f6-62dc-4517-8879-b2c0346d3f5b	45390b70-bbd4-4a91-8cfc-ed6839e337d2	Hasköy	2026-02-02 00:36:15.707035+03
302e70a1-102c-4e72-b6ed-9cb5695a5437	45390b70-bbd4-4a91-8cfc-ed6839e337d2	Korkut	2026-02-02 00:36:15.707035+03
79fe8f94-0324-46f3-8de3-d79eabda1ae3	85c5a225-99fa-4b40-87f6-b7e03790d763	Avanos	2026-02-02 00:36:15.707035+03
c44e3d4c-fefc-4cc8-b719-b4666c759a23	85c5a225-99fa-4b40-87f6-b7e03790d763	Derinkuyu	2026-02-02 00:36:15.707035+03
cc672b19-7f23-4a12-aa8a-c923db5332d6	85c5a225-99fa-4b40-87f6-b7e03790d763	Gülşehir	2026-02-02 00:36:15.707035+03
a44851b4-e290-4316-a27c-18c622650acd	85c5a225-99fa-4b40-87f6-b7e03790d763	Hacıbektaş	2026-02-02 00:36:15.707035+03
1fc0dafa-07bb-4149-bf15-4efac54060aa	85c5a225-99fa-4b40-87f6-b7e03790d763	Kozaklı	2026-02-02 00:36:15.707035+03
d4422cef-17e1-42ef-b9ff-41d45bf2d197	85c5a225-99fa-4b40-87f6-b7e03790d763	Merkez	2026-02-02 00:36:15.707035+03
e52aea0d-df51-4a2d-8126-621928df7312	85c5a225-99fa-4b40-87f6-b7e03790d763	Ürgüp	2026-02-02 00:36:15.707035+03
f2238758-7c0d-4ffa-ac10-2795bda7d8ea	85c5a225-99fa-4b40-87f6-b7e03790d763	Acıgöl	2026-02-02 00:36:15.707035+03
fa17bb16-c87e-4424-bc7f-9d7f1d0340fb	c3ea0e58-1633-4a7c-83fc-3fbafd277956	Bor	2026-02-02 00:36:15.707035+03
108b6df2-666e-4983-a38c-909ec7f4897e	c3ea0e58-1633-4a7c-83fc-3fbafd277956	Çamardı	2026-02-02 00:36:15.707035+03
35b2cc72-f47f-472c-83d9-24a942597e97	c3ea0e58-1633-4a7c-83fc-3fbafd277956	Merkez	2026-02-02 00:36:15.707035+03
70dcf0f5-1af6-400b-a249-9d4313acb987	c3ea0e58-1633-4a7c-83fc-3fbafd277956	Ulukışla	2026-02-02 00:36:15.707035+03
9b83ce2b-4f94-4081-9f9e-99ad0c6064a7	c3ea0e58-1633-4a7c-83fc-3fbafd277956	Altunhisar	2026-02-02 00:36:15.707035+03
8ff6deb8-12aa-4788-9587-ac3a7d1a06cb	c3ea0e58-1633-4a7c-83fc-3fbafd277956	Çiftlik	2026-02-02 00:36:15.707035+03
0624c0c1-9e40-489d-9085-d24dddccee96	bba3907f-4835-41bb-aed6-0b85b1de59eb	Akkuş	2026-02-02 00:36:15.707035+03
91996903-6417-4e51-80bc-7218f9332f6c	bba3907f-4835-41bb-aed6-0b85b1de59eb	Altınordu	2026-02-02 00:36:15.707035+03
deaaff2c-86fc-4fec-973a-8e9d0f36c924	bba3907f-4835-41bb-aed6-0b85b1de59eb	Aybastı	2026-02-02 00:36:15.707035+03
873a788d-5b6a-4c38-88f2-b47816c6febe	bba3907f-4835-41bb-aed6-0b85b1de59eb	Fatsa	2026-02-02 00:36:15.707035+03
5106ee7f-2467-41fc-b00b-8730922cbb39	bba3907f-4835-41bb-aed6-0b85b1de59eb	Gölköy	2026-02-02 00:36:15.707035+03
0591b351-bd12-451f-ad25-f9f2b6e0b538	bba3907f-4835-41bb-aed6-0b85b1de59eb	Korgan	2026-02-02 00:36:15.707035+03
77ce0475-4a70-49c2-81e0-3d388e47e6f2	bba3907f-4835-41bb-aed6-0b85b1de59eb	Kumru	2026-02-02 00:36:15.707035+03
3f54f720-c663-434a-a62c-4c221327cdc7	bba3907f-4835-41bb-aed6-0b85b1de59eb	Mesudiye	2026-02-02 00:36:15.707035+03
6ba68ed1-f35f-487d-b615-ac80e281a1a7	bba3907f-4835-41bb-aed6-0b85b1de59eb	Perşembe	2026-02-02 00:36:15.707035+03
177ef9a5-d0d4-4b00-b964-7cd43e6dea4f	bba3907f-4835-41bb-aed6-0b85b1de59eb	Ulubey	2026-02-02 00:36:15.707035+03
087be5ae-57cd-4979-a610-4102f7694318	bba3907f-4835-41bb-aed6-0b85b1de59eb	Ünye	2026-02-02 00:36:15.707035+03
253a6e72-cdd0-46be-bd09-f46207725f9b	bba3907f-4835-41bb-aed6-0b85b1de59eb	Gülyalı	2026-02-02 00:36:15.707035+03
d3b183a8-10c4-4b3e-95ac-15b92c7a76b0	bba3907f-4835-41bb-aed6-0b85b1de59eb	Gürgentepe	2026-02-02 00:36:15.707035+03
7cc05086-35e0-4253-8e84-95b77e973900	bba3907f-4835-41bb-aed6-0b85b1de59eb	Çamaş	2026-02-02 00:36:15.707035+03
d29075f6-3742-45a1-af19-f98160621deb	bba3907f-4835-41bb-aed6-0b85b1de59eb	Çatalpınar	2026-02-02 00:36:15.707035+03
863de8db-ca48-4e6a-8e70-ec12abfa5b6b	bba3907f-4835-41bb-aed6-0b85b1de59eb	Çaybaşı	2026-02-02 00:36:15.707035+03
581c4e1f-381c-4d4e-b3ec-5457a0a6171b	bba3907f-4835-41bb-aed6-0b85b1de59eb	İkizce	2026-02-02 00:36:15.707035+03
602fa026-c640-4c55-bdc9-25d9a42cd014	bba3907f-4835-41bb-aed6-0b85b1de59eb	Kabadüz	2026-02-02 00:36:15.707035+03
da61d43d-9406-4e1f-8ff3-bec094e3df7e	bba3907f-4835-41bb-aed6-0b85b1de59eb	Kabataş	2026-02-02 00:36:15.707035+03
10078479-3e4d-43e8-984b-fc56ef8c2ed8	59309b87-5408-409a-9861-c1fe8c36ff55	Ardeşen	2026-02-02 00:36:15.707035+03
219a49f1-19af-4b47-a117-65f36282686b	59309b87-5408-409a-9861-c1fe8c36ff55	Çamlıhemşin	2026-02-02 00:36:15.707035+03
055e02a3-72a2-4fe0-9801-6b327e16d595	59309b87-5408-409a-9861-c1fe8c36ff55	Çayeli	2026-02-02 00:36:15.707035+03
04c39fd6-fa88-4291-a0b9-1979c7bbd62a	59309b87-5408-409a-9861-c1fe8c36ff55	Fındıklı	2026-02-02 00:36:15.707035+03
25896a9f-7a67-44c5-815a-b733eb9e81f8	59309b87-5408-409a-9861-c1fe8c36ff55	İkizdere	2026-02-02 00:36:15.707035+03
3477274f-8deb-400d-9c5e-0d724dc7a320	59309b87-5408-409a-9861-c1fe8c36ff55	Kalkandere	2026-02-02 00:36:15.707035+03
c74a5aa4-778f-4368-b401-1d56ca1bb2a5	59309b87-5408-409a-9861-c1fe8c36ff55	Pazar	2026-02-02 00:36:15.707035+03
18917243-65eb-4ae0-85aa-8a3cec417862	59309b87-5408-409a-9861-c1fe8c36ff55	Merkez	2026-02-02 00:36:15.707035+03
fba561f0-8d86-4d40-b1aa-c0dd6b6dff69	59309b87-5408-409a-9861-c1fe8c36ff55	Güneysu	2026-02-02 00:36:15.707035+03
c43a6da9-e702-425c-9169-99222196778f	59309b87-5408-409a-9861-c1fe8c36ff55	Derepazarı	2026-02-02 00:36:15.707035+03
74274a98-543f-49c3-8c24-a1a2bb102151	59309b87-5408-409a-9861-c1fe8c36ff55	Hemşin	2026-02-02 00:36:15.707035+03
ca107370-5182-4eb6-9ab2-aca4ed3517b4	59309b87-5408-409a-9861-c1fe8c36ff55	İyidere	2026-02-02 00:36:15.707035+03
048899a1-0db2-4ddb-9931-3c93c0b3b2b5	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Akyazı	2026-02-02 00:36:15.707035+03
1225cf35-8d2d-44d4-8cc1-2cecbee46e53	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Geyve	2026-02-02 00:36:15.707035+03
a5b8de90-4f21-453c-afa6-c93a90c6e430	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Hendek	2026-02-02 00:36:15.707035+03
c8335803-6e40-4c33-8e5b-abf431aab1bf	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Karasu	2026-02-02 00:36:15.707035+03
a21915d8-630a-4a08-a1f5-3d13d8f7d82c	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Kaynarca	2026-02-02 00:36:15.707035+03
e96c7966-fc93-462a-83a1-bcc401f56cff	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Sapanca	2026-02-02 00:36:15.707035+03
d6d40445-851a-4c3b-b2a4-96fb832cad90	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Kocaali	2026-02-02 00:36:15.707035+03
b6bd78ac-3fa3-41c9-8896-607cc1115da8	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Pamukova	2026-02-02 00:36:15.707035+03
072a71a5-a9c1-4a25-b35b-7ae77599b342	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Taraklı	2026-02-02 00:36:15.707035+03
81bb7474-73d9-4a3e-a396-1b13113d9da0	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Ferizli	2026-02-02 00:36:15.707035+03
1686fc3d-ceb7-479a-800c-438d5c596ec1	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Karapürçek	2026-02-02 00:36:15.707035+03
f86c858f-3242-462e-92d8-70834bd51016	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Söğütlü	2026-02-02 00:36:15.707035+03
c0775cdb-d6d2-43e8-b15f-177cef3feca8	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Adapazarı	2026-02-02 00:36:15.707035+03
aa0aefa7-a6a2-4e85-ae61-bcfb02405292	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Arifiye	2026-02-02 00:36:15.707035+03
4036b672-78c2-4931-bb7f-2f0ab81ce2e2	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Erenler	2026-02-02 00:36:15.707035+03
a9c339fd-4a0b-4f2f-a74d-20eb5be719d0	055fe39c-70de-4ce3-9a1c-2b66bb64194e	Serdivan	2026-02-02 00:36:15.707035+03
6d98acac-2bb0-4820-858f-33b880000ed8	48b84cc5-06e9-40d0-815c-20571634527b	Alaçam	2026-02-02 00:36:15.707035+03
cf0778c5-71e7-4193-bedf-c9e3dbd5fc04	48b84cc5-06e9-40d0-815c-20571634527b	Bafra	2026-02-02 00:36:15.707035+03
d1839bb7-b3ee-4b82-af9f-d9c32d7dfa33	48b84cc5-06e9-40d0-815c-20571634527b	Çarşamba	2026-02-02 00:36:15.707035+03
3e7341e0-b144-4bad-b1ab-75935dcfeaa6	48b84cc5-06e9-40d0-815c-20571634527b	Havza	2026-02-02 00:36:15.707035+03
ded52fe9-e9c1-4be4-a021-0bba41fa547e	48b84cc5-06e9-40d0-815c-20571634527b	Kavak	2026-02-02 00:36:15.707035+03
e6269c16-af3d-4dd1-b12e-976076fb17f1	48b84cc5-06e9-40d0-815c-20571634527b	Ladik	2026-02-02 00:36:15.707035+03
f8add5f3-e821-41b4-9456-3255a11c9053	48b84cc5-06e9-40d0-815c-20571634527b	Terme	2026-02-02 00:36:15.707035+03
938f59ca-2c87-46a1-b062-5cd4e80d7b67	48b84cc5-06e9-40d0-815c-20571634527b	Vezirköprü	2026-02-02 00:36:15.707035+03
25c77241-4ff1-4883-9541-f60e266d14a0	48b84cc5-06e9-40d0-815c-20571634527b	Asarcık	2026-02-02 00:36:15.707035+03
069a4135-1efa-44a6-b5a9-11e4dbdaa22d	48b84cc5-06e9-40d0-815c-20571634527b	Ondokuzmayıs	2026-02-02 00:36:15.707035+03
56ed5141-9813-4a07-964f-a48a3d97676d	48b84cc5-06e9-40d0-815c-20571634527b	Salıpazarı	2026-02-02 00:36:15.707035+03
d06377ae-e12b-4098-b6e3-d9abc87d0c66	48b84cc5-06e9-40d0-815c-20571634527b	Tekkeköy	2026-02-02 00:36:15.707035+03
926a02cf-5a06-4159-b07e-55435aed4e44	48b84cc5-06e9-40d0-815c-20571634527b	Ayvacık	2026-02-02 00:36:15.707035+03
041b4c71-40b3-48be-9a5c-b3d1f630f501	48b84cc5-06e9-40d0-815c-20571634527b	Yakakent	2026-02-02 00:36:15.707035+03
8633f3ea-a428-4da1-a02b-96cb94fda87a	48b84cc5-06e9-40d0-815c-20571634527b	Atakum	2026-02-02 00:36:15.707035+03
a2207bc0-fd8d-49a0-b5f7-962c49fba056	48b84cc5-06e9-40d0-815c-20571634527b	Canik	2026-02-02 00:36:15.707035+03
36bb4e0f-518f-4a15-902a-71d0afc2a512	48b84cc5-06e9-40d0-815c-20571634527b	İlkadım	2026-02-02 00:36:15.707035+03
adfb57bc-f4d9-439d-94c6-b50c4e628574	b26de852-ff4a-49ae-93be-ffb79e1ddbb5	Baykan	2026-02-02 00:36:15.707035+03
a89589d8-c486-4a22-85e8-35b45a76616e	b26de852-ff4a-49ae-93be-ffb79e1ddbb5	Eruh	2026-02-02 00:36:15.707035+03
58bb606d-e4ce-40d3-87c3-12a7ca03026e	b26de852-ff4a-49ae-93be-ffb79e1ddbb5	Kurtalan	2026-02-02 00:36:15.707035+03
5a8f134d-b782-42bf-b44c-65699647cfd7	b26de852-ff4a-49ae-93be-ffb79e1ddbb5	Pervari	2026-02-02 00:36:15.707035+03
928eca5c-aa39-4523-bdb8-adcc0f03aa41	b26de852-ff4a-49ae-93be-ffb79e1ddbb5	Merkez	2026-02-02 00:36:15.707035+03
76c72e88-f836-4e1a-a6a7-297450d7152b	b26de852-ff4a-49ae-93be-ffb79e1ddbb5	Şirvan	2026-02-02 00:36:15.707035+03
20cf10da-3122-4ac6-a57f-a28484094e68	b26de852-ff4a-49ae-93be-ffb79e1ddbb5	Tillo	2026-02-02 00:36:15.707035+03
151dcf75-c708-4a0c-87c7-0e6570b5f439	b941a495-235b-4e07-b2f0-f0efb97cfcbb	Ayancık	2026-02-02 00:36:15.707035+03
a8d82ae0-3e18-46f1-905c-8d22911af87d	b941a495-235b-4e07-b2f0-f0efb97cfcbb	Boyabat	2026-02-02 00:36:15.707035+03
59e4cc7a-c4ba-42b0-bcff-8ce3aa8ad50b	b941a495-235b-4e07-b2f0-f0efb97cfcbb	Durağan	2026-02-02 00:36:15.707035+03
fa82e1f7-2862-4d6b-9b38-7162340746cf	b941a495-235b-4e07-b2f0-f0efb97cfcbb	Erfelek	2026-02-02 00:36:15.707035+03
2ba95435-0b8a-457a-9785-41bde53ef655	b941a495-235b-4e07-b2f0-f0efb97cfcbb	Gerze	2026-02-02 00:36:15.707035+03
b4214c65-8eec-4664-af9c-100e57327fdc	b941a495-235b-4e07-b2f0-f0efb97cfcbb	Merkez	2026-02-02 00:36:15.707035+03
2c0274d2-da0d-47cd-87f6-acb0e5288d45	b941a495-235b-4e07-b2f0-f0efb97cfcbb	Türkeli	2026-02-02 00:36:15.707035+03
8ef1b368-8076-46db-9241-bf27e2640d2e	b941a495-235b-4e07-b2f0-f0efb97cfcbb	Dikmen	2026-02-02 00:36:15.707035+03
fb256f6b-82c7-46a0-8ece-03f0d02957e7	b941a495-235b-4e07-b2f0-f0efb97cfcbb	Saraydüzü	2026-02-02 00:36:15.707035+03
cd0841c3-b962-4eea-9bbd-056142f45fdf	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Divriği	2026-02-02 00:36:15.707035+03
8b4a3389-af66-416a-8ef7-d612158585f1	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Gemerek	2026-02-02 00:36:15.707035+03
c690709a-ccda-4238-8401-ea0d65d9ab0f	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Gürün	2026-02-02 00:36:15.707035+03
359f5e20-7429-44e5-85c9-dc7830c53528	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Hafik	2026-02-02 00:36:15.707035+03
69bd5ca7-6d45-44cf-a4ac-59306b511c5d	3a37f9f8-f742-4b90-ab4c-f35f5744552d	İmranlı	2026-02-02 00:36:15.707035+03
22b994d5-a0e3-4f95-bfc5-19a8a8b06985	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Kangal	2026-02-02 00:36:15.707035+03
40f92d4c-519b-476a-9836-6b372dcd08a8	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Koyulhisar	2026-02-02 00:36:15.707035+03
44f8beea-d2f1-4ff7-a858-1c6e860e9f50	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Merkez	2026-02-02 00:36:15.707035+03
9e13509c-6289-4fc3-98f9-c1177f5cbb2b	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Suşehri	2026-02-02 00:36:15.707035+03
f49a3b2a-87c2-42fc-8230-9ca2b2703685	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Şarkışla	2026-02-02 00:36:15.707035+03
2cb2e13f-10c7-46ad-aa60-7a42c397e62c	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Yıldızeli	2026-02-02 00:36:15.707035+03
461dc0e1-307e-44da-a2ec-4881eb7cc0f5	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Zara	2026-02-02 00:36:15.707035+03
46ae7363-4521-42d3-947a-01b02854e916	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Akıncılar	2026-02-02 00:36:15.707035+03
5db63da3-7343-46a8-8551-d969dc7f9800	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Altınyayla	2026-02-02 00:36:15.707035+03
bfd9d8a1-8bad-42bb-9378-336cd281ef5e	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Doğanşar	2026-02-02 00:36:15.707035+03
59533f98-9bc2-4fed-a67a-99cb359e1fbc	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Gölova	2026-02-02 00:36:15.707035+03
9b4e930e-96fd-4144-b02e-00a3771aea23	3a37f9f8-f742-4b90-ab4c-f35f5744552d	Ulaş	2026-02-02 00:36:15.707035+03
48639665-2ec6-41b5-959e-0204cc7c022c	1513f78e-93cb-4e3f-b4a9-4682840a2142	Çerkezköy	2026-02-02 00:36:15.707035+03
5969a288-a23b-49d8-acfb-0edfff60f02c	1513f78e-93cb-4e3f-b4a9-4682840a2142	Çorlu	2026-02-02 00:36:15.707035+03
74b38a28-0267-403c-9fa4-eb6c485614e2	1513f78e-93cb-4e3f-b4a9-4682840a2142	Ergene	2026-02-02 00:36:15.707035+03
a9d9c383-3905-4049-8793-2617b09ec9d0	1513f78e-93cb-4e3f-b4a9-4682840a2142	Hayrabolu	2026-02-02 00:36:15.707035+03
3da96f24-894d-49da-a978-08126fedb431	1513f78e-93cb-4e3f-b4a9-4682840a2142	Malkara	2026-02-02 00:36:15.707035+03
ce0adc13-4bb5-4906-8bbb-26ebc5c3849e	1513f78e-93cb-4e3f-b4a9-4682840a2142	Muratlı	2026-02-02 00:36:15.707035+03
121401c9-a443-49a0-b987-dfcbf1e7cc42	1513f78e-93cb-4e3f-b4a9-4682840a2142	Saray	2026-02-02 00:36:15.707035+03
471e6402-6a84-47ff-a59d-0190de634d7f	1513f78e-93cb-4e3f-b4a9-4682840a2142	Süleymanpaşa	2026-02-02 00:36:15.707035+03
9fee131e-d923-4160-9ca6-90b06f1a771d	1513f78e-93cb-4e3f-b4a9-4682840a2142	Kapaklı	2026-02-02 00:36:15.707035+03
9c0f0433-735d-4d7e-8859-089fca880fe5	1513f78e-93cb-4e3f-b4a9-4682840a2142	Şarköy	2026-02-02 00:36:15.707035+03
5ac9edea-8524-408e-a859-3d98e5b9ae06	1513f78e-93cb-4e3f-b4a9-4682840a2142	Marmaraereğlisi	2026-02-02 00:36:15.707035+03
7bc58c69-bf51-4afd-9658-78823df46e54	85f52530-8272-4700-bd71-d9a7466b2a6b	Almus	2026-02-02 00:36:15.707035+03
6f57b0a3-b1fc-43fc-a7d5-eab11631bb98	85f52530-8272-4700-bd71-d9a7466b2a6b	Artova	2026-02-02 00:36:15.707035+03
8ed358ed-fdea-43f4-baf0-03270abc464d	85f52530-8272-4700-bd71-d9a7466b2a6b	Erbaa	2026-02-02 00:36:15.707035+03
82c56765-6ad7-406f-842e-d7087d242a4f	85f52530-8272-4700-bd71-d9a7466b2a6b	Niksar	2026-02-02 00:36:15.707035+03
dd8a273a-ee28-42cd-9a76-92ff766ad882	85f52530-8272-4700-bd71-d9a7466b2a6b	Reşadiye	2026-02-02 00:36:15.707035+03
7e132b4e-4c68-4b60-a6a6-9191563870c4	85f52530-8272-4700-bd71-d9a7466b2a6b	Merkez	2026-02-02 00:36:15.707035+03
f5af2943-9ddd-476e-8d57-fad56414ba6c	85f52530-8272-4700-bd71-d9a7466b2a6b	Turhal	2026-02-02 00:36:15.707035+03
62810711-b588-49b8-89c9-95755b2a135c	85f52530-8272-4700-bd71-d9a7466b2a6b	Zile	2026-02-02 00:36:15.707035+03
49f875a7-5f3b-4d10-bc4e-dda78c333e75	85f52530-8272-4700-bd71-d9a7466b2a6b	Pazar	2026-02-02 00:36:15.707035+03
40268fc6-7296-49f8-aca2-6c2491921c9d	85f52530-8272-4700-bd71-d9a7466b2a6b	Yeşilyurt	2026-02-02 00:36:15.707035+03
21b0198e-40f5-4f2a-8cad-3733b3d5b5e3	85f52530-8272-4700-bd71-d9a7466b2a6b	Başçiftlik	2026-02-02 00:36:15.707035+03
7f23985c-1b87-4c88-8b3a-25b52549443f	85f52530-8272-4700-bd71-d9a7466b2a6b	Sulusaray	2026-02-02 00:36:15.707035+03
a5090a7c-f873-42a0-9429-43a29a3b2a08	084aa259-cca2-480c-b453-97d6d75fd502	Akçaabat	2026-02-02 00:36:15.707035+03
78ea3a09-eca6-45f5-b9fc-0d05d725a94d	084aa259-cca2-480c-b453-97d6d75fd502	Araklı	2026-02-02 00:36:15.707035+03
7520838c-c836-4921-8fa6-bf53715a6066	084aa259-cca2-480c-b453-97d6d75fd502	Arsin	2026-02-02 00:36:15.707035+03
2881fd53-ba2d-4a37-b3ec-8a9e69d23218	084aa259-cca2-480c-b453-97d6d75fd502	Çaykara	2026-02-02 00:36:15.707035+03
38734363-616c-4656-b968-21955e001538	084aa259-cca2-480c-b453-97d6d75fd502	Maçka	2026-02-02 00:36:15.707035+03
6869ce32-4c0c-47e1-ae2b-646956d7b496	084aa259-cca2-480c-b453-97d6d75fd502	Of	2026-02-02 00:36:15.707035+03
9ae7764c-66d3-47ff-893e-852bcf9dcf34	084aa259-cca2-480c-b453-97d6d75fd502	Ortahisar	2026-02-02 00:36:15.707035+03
26363509-8693-4c24-a0a9-a3c9a0b8e645	084aa259-cca2-480c-b453-97d6d75fd502	Sürmene	2026-02-02 00:36:15.707035+03
1d4ba60a-c000-4f2b-8e50-fcaf11562b85	084aa259-cca2-480c-b453-97d6d75fd502	Tonya	2026-02-02 00:36:15.707035+03
d36abf28-c61e-491c-94ad-ec8f4aa08a3a	084aa259-cca2-480c-b453-97d6d75fd502	Vakfıkebir	2026-02-02 00:36:15.707035+03
b6f08195-2953-4b1a-9df7-bcc2b3ee1cf6	084aa259-cca2-480c-b453-97d6d75fd502	Yomra	2026-02-02 00:36:15.707035+03
7834f1b4-0fbe-4e71-937e-d373a62b87f5	084aa259-cca2-480c-b453-97d6d75fd502	Beşikdüzü	2026-02-02 00:36:15.707035+03
26ec41ff-49bf-49ff-a571-f372a839e515	084aa259-cca2-480c-b453-97d6d75fd502	Şalpazarı	2026-02-02 00:36:15.707035+03
18948063-40fb-4fd0-886a-79717fbbbb08	084aa259-cca2-480c-b453-97d6d75fd502	Çarşıbaşı	2026-02-02 00:36:15.707035+03
102fe43a-114a-43ce-a390-6dc7e5f1957f	084aa259-cca2-480c-b453-97d6d75fd502	Dernekpazarı	2026-02-02 00:36:15.707035+03
1599fc9e-329d-4d23-bf4c-de1f96de0393	084aa259-cca2-480c-b453-97d6d75fd502	Düzköy	2026-02-02 00:36:15.707035+03
222b9580-2ae9-4900-b6ba-f4a79b962426	084aa259-cca2-480c-b453-97d6d75fd502	Hayrat	2026-02-02 00:36:15.707035+03
05216327-31b8-4308-9cf5-299a4d2da1bc	084aa259-cca2-480c-b453-97d6d75fd502	Köprübaşı	2026-02-02 00:36:15.707035+03
d83a5ca3-8ad2-44a4-ad65-7ec6143cb26b	2d9c28fe-153c-4f46-a5a6-dbaa166c761d	Çemişgezek	2026-02-02 00:36:15.707035+03
516d6f29-46ca-461e-8dd3-465850a2b614	2d9c28fe-153c-4f46-a5a6-dbaa166c761d	Hozat	2026-02-02 00:36:15.707035+03
f368387a-670b-4a9a-a03d-93e308ecf685	2d9c28fe-153c-4f46-a5a6-dbaa166c761d	Mazgirt	2026-02-02 00:36:15.707035+03
9e9770a4-dc22-41f8-84d2-2bbb444a299b	2d9c28fe-153c-4f46-a5a6-dbaa166c761d	Nazımiye	2026-02-02 00:36:15.707035+03
e4ca4f5a-4ca1-462f-85a2-37f44b194078	2d9c28fe-153c-4f46-a5a6-dbaa166c761d	Ovacık	2026-02-02 00:36:15.707035+03
d101a8f2-c213-4990-93e2-2b83522e0947	2d9c28fe-153c-4f46-a5a6-dbaa166c761d	Pertek	2026-02-02 00:36:15.707035+03
6111f3dd-4ff6-4582-8c49-2a684d67f97c	2d9c28fe-153c-4f46-a5a6-dbaa166c761d	Pülümür	2026-02-02 00:36:15.707035+03
4bb3f995-4150-4116-9115-08271ed4cce9	2d9c28fe-153c-4f46-a5a6-dbaa166c761d	Merkez	2026-02-02 00:36:15.707035+03
3cbe4d80-c3be-4322-abfd-0349566ea3e7	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Akçakale	2026-02-02 00:36:15.707035+03
1fdd59a6-1c42-4860-8ffc-18fc40fc2aa5	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Birecik	2026-02-02 00:36:15.707035+03
6f9b60b9-0860-4ae2-b437-8d0e4dc12fa0	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Bozova	2026-02-02 00:36:15.707035+03
40d317f2-dd05-4f65-ae8b-efe6e0d4a054	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Ceylanpınar	2026-02-02 00:36:15.707035+03
0f0cc3d0-039c-4c0c-8ae6-504323303803	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Eyyübiye	2026-02-02 00:36:15.707035+03
7389ae53-d286-4123-b832-f910fcf37105	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Halfeti	2026-02-02 00:36:15.707035+03
c3821192-c11d-4e7e-9cb9-f784424771cf	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Haliliye	2026-02-02 00:36:15.707035+03
4fa016c8-e4ec-4cfb-a54c-f2c0e3a4b4e4	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Hilvan	2026-02-02 00:36:15.707035+03
7846965a-037f-494a-a82c-a71f4e7c873e	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Karaköprü	2026-02-02 00:36:15.707035+03
5efd77e2-16c1-4b1c-a689-ea5dcf4ee89a	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Siverek	2026-02-02 00:36:15.707035+03
5c76d40c-0cd4-496c-97df-aeb21428bf51	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Suruç	2026-02-02 00:36:15.707035+03
db8e6704-e0d1-424a-b4ae-3eba9d7d93a8	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Viranşehir	2026-02-02 00:36:15.707035+03
67b0ee1b-65e0-4df8-a645-53881961b1be	f44852cd-a1b5-4ac4-a6e3-f73ae7d7ae06	Harran	2026-02-02 00:36:15.707035+03
486a1302-0da8-4880-84bd-d82d228c8012	87f9f8d3-ee45-484b-8b5d-2f3d645b4293	Banaz	2026-02-02 00:36:15.707035+03
504891c0-cd32-432e-82bd-4f9e431b1319	87f9f8d3-ee45-484b-8b5d-2f3d645b4293	Eşme	2026-02-02 00:36:15.707035+03
b38387a1-3b96-4b72-b519-5a9941d9b85a	87f9f8d3-ee45-484b-8b5d-2f3d645b4293	Karahallı	2026-02-02 00:36:15.707035+03
57410855-6f74-4b5d-b480-834bef2255e3	87f9f8d3-ee45-484b-8b5d-2f3d645b4293	Sivaslı	2026-02-02 00:36:15.707035+03
5976b6d6-4272-4679-9618-d95e790d11b2	87f9f8d3-ee45-484b-8b5d-2f3d645b4293	Ulubey	2026-02-02 00:36:15.707035+03
b0af2b2c-e67b-4832-b111-0d7e01a61211	87f9f8d3-ee45-484b-8b5d-2f3d645b4293	Merkez	2026-02-02 00:36:15.707035+03
1da9cc2a-79a7-4377-abe9-857ae4ab136e	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Başkale	2026-02-02 00:36:15.707035+03
59aeb603-44d2-4a09-b484-c2840ddaea1a	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Çatak	2026-02-02 00:36:15.707035+03
c90c4418-cd3b-45c6-8f2f-efc49df90fe2	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Erciş	2026-02-02 00:36:15.707035+03
3b12211f-a91b-4c43-bd52-0e603ebe0818	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Gevaş	2026-02-02 00:36:15.707035+03
22566d20-f401-4013-b423-973e509b4bb1	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Gürpınar	2026-02-02 00:36:15.707035+03
75ea129e-9cf0-4dd3-97b6-c049eddfea9c	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	İpekyolu	2026-02-02 00:36:15.707035+03
74058202-7c90-4adc-bb51-4439b7fca17a	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Muradiye	2026-02-02 00:36:15.707035+03
0c6fdd58-be22-4fa6-8fd4-a514c021aa6b	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Özalp	2026-02-02 00:36:15.707035+03
0834981b-00d6-4671-869d-da0a1dbaaa02	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Tuşba	2026-02-02 00:36:15.707035+03
97751338-e553-4d2c-994e-3ee10abad46b	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Bahçesaray	2026-02-02 00:36:15.707035+03
52416738-3b17-4892-b497-96f8ab7afa63	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Çaldıran	2026-02-02 00:36:15.707035+03
57a7e97f-3ed6-42e9-b472-fe1ddb94579c	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Edremit	2026-02-02 00:36:15.707035+03
bc77028f-c3db-4d65-b664-284e79ea0e11	28bff1e0-253a-4ec8-8a5f-2dc84ce15145	Saray	2026-02-02 00:36:15.707035+03
1e62c2f5-645f-4037-b365-65a604ed63ae	56ef44a4-8794-437a-990c-33eae64cc47d	Akdağmadeni	2026-02-02 00:36:15.707035+03
29f06118-b1fc-4a71-8794-dd7b39c51242	56ef44a4-8794-437a-990c-33eae64cc47d	Boğazlıyan	2026-02-02 00:36:15.707035+03
e394822c-23db-4ebb-b43d-d736156f332e	56ef44a4-8794-437a-990c-33eae64cc47d	Çayıralan	2026-02-02 00:36:15.707035+03
e62d5d96-e369-4624-82c0-e8949f1b3337	56ef44a4-8794-437a-990c-33eae64cc47d	Çekerek	2026-02-02 00:36:15.707035+03
d1dea0e1-f144-45dc-b04e-050d1ab5da5c	56ef44a4-8794-437a-990c-33eae64cc47d	Sarıkaya	2026-02-02 00:36:15.707035+03
3cc0990b-52ba-4ef1-b6a3-a62d99477d83	56ef44a4-8794-437a-990c-33eae64cc47d	Sorgun	2026-02-02 00:36:15.707035+03
de0bf9ca-f958-4341-94e9-9708c096d71e	56ef44a4-8794-437a-990c-33eae64cc47d	Şefaatli	2026-02-02 00:36:15.707035+03
47096927-cb9b-4649-a1b2-1398edbe8ac9	56ef44a4-8794-437a-990c-33eae64cc47d	Yerköy	2026-02-02 00:36:15.707035+03
9f3cf9a5-1bf2-408c-a6a9-183b2a554690	56ef44a4-8794-437a-990c-33eae64cc47d	Merkez	2026-02-02 00:36:15.707035+03
88309713-95e9-4cc4-8262-82fd5c5c9ec7	56ef44a4-8794-437a-990c-33eae64cc47d	Aydıncık	2026-02-02 00:36:15.707035+03
b734af81-da41-4f7e-a8b0-865e69b03c69	56ef44a4-8794-437a-990c-33eae64cc47d	Çandır	2026-02-02 00:36:15.707035+03
300e9b59-370a-433b-bbb9-c092064f811f	56ef44a4-8794-437a-990c-33eae64cc47d	Kadışehri	2026-02-02 00:36:15.707035+03
a5f9d575-9a1e-4641-a62e-9e181ae6595d	56ef44a4-8794-437a-990c-33eae64cc47d	Saraykent	2026-02-02 00:36:15.707035+03
c42c1d6c-ce20-491b-8c2d-c108ffa1e93b	56ef44a4-8794-437a-990c-33eae64cc47d	Yenifakılı	2026-02-02 00:36:15.707035+03
051ba1e2-dfa5-4987-876f-43e258ca7566	9ccb2d5d-91d8-427a-8b65-f872b586df11	Çaycuma	2026-02-02 00:36:15.707035+03
4cb82242-8519-4d19-95f2-76671a322ffa	9ccb2d5d-91d8-427a-8b65-f872b586df11	Devrek	2026-02-02 00:36:15.707035+03
33573fb5-8381-4b38-9d99-3173b4355208	9ccb2d5d-91d8-427a-8b65-f872b586df11	Ereğli	2026-02-02 00:36:15.707035+03
f86f61de-b5cb-42f9-9c8f-320cc212fad6	9ccb2d5d-91d8-427a-8b65-f872b586df11	Merkez	2026-02-02 00:36:15.707035+03
413c833b-7d18-41f4-84d7-f7c081d17ea6	9ccb2d5d-91d8-427a-8b65-f872b586df11	Alaplı	2026-02-02 00:36:15.707035+03
01afe46f-bb19-4f8b-96f9-9b337ccb9044	9ccb2d5d-91d8-427a-8b65-f872b586df11	Gökçebey	2026-02-02 00:36:15.707035+03
7e8ef309-db42-411f-ac74-23215d0c576a	399797e2-f3e0-4f16-b10d-b7cca32ab6a2	Ağaçören	2026-02-02 00:36:15.707035+03
84bb6e5d-359d-438f-ae77-faf4dc216595	399797e2-f3e0-4f16-b10d-b7cca32ab6a2	Eskil	2026-02-02 00:36:15.707035+03
98f7a1da-da67-4d41-87d9-611fa10466cc	399797e2-f3e0-4f16-b10d-b7cca32ab6a2	Gülağaç	2026-02-02 00:36:15.707035+03
1530f68c-f707-4c6e-a656-6aee74b383b1	399797e2-f3e0-4f16-b10d-b7cca32ab6a2	Güzelyurt	2026-02-02 00:36:15.707035+03
d48d55c1-6faa-4a82-8d9e-7b323785da08	399797e2-f3e0-4f16-b10d-b7cca32ab6a2	Merkez	2026-02-02 00:36:15.707035+03
d53d0abc-383c-4ff0-875a-67e8e3d4c51f	399797e2-f3e0-4f16-b10d-b7cca32ab6a2	Ortaköy	2026-02-02 00:36:15.707035+03
979f4edc-df01-4ab8-bcae-031ec3b655cf	399797e2-f3e0-4f16-b10d-b7cca32ab6a2	Sarıyahşi	2026-02-02 00:36:15.707035+03
d216dedd-f380-4294-ace8-b23112958ca9	41b28404-ecde-4acd-981b-0cf37ac616de	Merkez	2026-02-02 00:36:15.707035+03
89e968fb-84b6-4001-9476-0935732f3c4b	41b28404-ecde-4acd-981b-0cf37ac616de	Aydıntepe	2026-02-02 00:36:15.707035+03
87e3cfad-1746-4e73-8060-ab09c60a4f41	41b28404-ecde-4acd-981b-0cf37ac616de	Demirözü	2026-02-02 00:36:15.707035+03
e4f47011-b05e-452b-9897-7af41bc50fb4	010be9f9-2dbb-4bbc-bed9-35200fce6468	Ermenek	2026-02-02 00:36:15.707035+03
f1c3e2de-1730-4e2c-ba62-422717434c59	010be9f9-2dbb-4bbc-bed9-35200fce6468	Merkez	2026-02-02 00:36:15.707035+03
ec7f34e0-7477-461a-bbe4-49b25c8ccea1	010be9f9-2dbb-4bbc-bed9-35200fce6468	Ayrancı	2026-02-02 00:36:15.707035+03
acddc964-7e74-4d2a-aee7-25861b75323f	010be9f9-2dbb-4bbc-bed9-35200fce6468	Kazımkarabekir	2026-02-02 00:36:15.707035+03
78c97c07-d33c-4459-a7dc-f8a9b63c21ce	010be9f9-2dbb-4bbc-bed9-35200fce6468	Başyayla	2026-02-02 00:36:15.707035+03
34988225-4350-4e47-a835-f6a2d65979c8	010be9f9-2dbb-4bbc-bed9-35200fce6468	Sarıveliler	2026-02-02 00:36:15.707035+03
f2f7cac4-25a7-496e-b63f-536cc09c3710	04a315cb-c614-427c-ae2e-823d578855dc	Delice	2026-02-02 00:36:15.707035+03
a884d31e-523d-4d7a-9b6b-1820ee0a8ca0	04a315cb-c614-427c-ae2e-823d578855dc	Keskin	2026-02-02 00:36:15.707035+03
d7777338-d28a-4544-87bd-4a26b80739c9	04a315cb-c614-427c-ae2e-823d578855dc	Merkez	2026-02-02 00:36:15.707035+03
8d1937a5-c9d7-4dfb-98de-87428495eb55	04a315cb-c614-427c-ae2e-823d578855dc	Sulakyurt	2026-02-02 00:36:15.707035+03
abcc40f1-74b5-4e56-95f7-61e37abcc957	04a315cb-c614-427c-ae2e-823d578855dc	Bahşili	2026-02-02 00:36:15.707035+03
216a486c-a621-419b-985a-8addd83082d0	04a315cb-c614-427c-ae2e-823d578855dc	Balışeyh	2026-02-02 00:36:15.707035+03
e5740c00-9f88-4a03-9e19-1a2bf093489d	04a315cb-c614-427c-ae2e-823d578855dc	Çelebi	2026-02-02 00:36:15.707035+03
2f255182-3d24-4e87-9135-a8a46673415d	04a315cb-c614-427c-ae2e-823d578855dc	Karakeçili	2026-02-02 00:36:15.707035+03
53a26d77-0dcd-48e6-83f1-2f62808d2467	04a315cb-c614-427c-ae2e-823d578855dc	Yahşihan	2026-02-02 00:36:15.707035+03
297df6a9-e132-472c-9666-7d73188a8ca5	4c66a399-9c95-4c80-b5cf-ffd035588392	Merkez	2026-02-02 00:36:15.707035+03
0f31c1bb-4f40-4a70-8ae1-26ea1db66f9d	4c66a399-9c95-4c80-b5cf-ffd035588392	Beşiri	2026-02-02 00:36:15.707035+03
ac28d2c1-188c-4582-baf7-dfb90ac90ad7	4c66a399-9c95-4c80-b5cf-ffd035588392	Gercüş	2026-02-02 00:36:15.707035+03
63077551-86ef-4d5b-8ab6-f2f385936e53	4c66a399-9c95-4c80-b5cf-ffd035588392	Kozluk	2026-02-02 00:36:15.707035+03
6eb90711-6d26-49bc-a7a3-db0bbf1c7047	4c66a399-9c95-4c80-b5cf-ffd035588392	Sason	2026-02-02 00:36:15.707035+03
baaf6cbf-ee88-42eb-8bdf-5b467519e42e	4c66a399-9c95-4c80-b5cf-ffd035588392	Hasankeyf	2026-02-02 00:36:15.707035+03
fe637b66-0727-47ad-9dc3-ef10db2f97c8	08c79725-94b9-43c6-8099-f1618ce854ad	Beytüşşebap	2026-02-02 00:36:15.707035+03
5bcbbe38-ae2b-410f-821f-59eeb893198b	08c79725-94b9-43c6-8099-f1618ce854ad	Cizre	2026-02-02 00:36:15.707035+03
46f7aeda-adeb-4b96-b473-df7e9c0f3b5f	08c79725-94b9-43c6-8099-f1618ce854ad	İdil	2026-02-02 00:36:15.707035+03
42989d39-da71-4795-86ba-c5c3eaa202ce	08c79725-94b9-43c6-8099-f1618ce854ad	Silopi	2026-02-02 00:36:15.707035+03
3579ac10-f268-4c50-9c71-40a0bb9aa390	08c79725-94b9-43c6-8099-f1618ce854ad	Merkez	2026-02-02 00:36:15.707035+03
93d358b7-a5d8-45ca-955d-31a10cf639ed	08c79725-94b9-43c6-8099-f1618ce854ad	Uludere	2026-02-02 00:36:15.707035+03
0999d150-2465-4794-9485-b26988c8ee67	08c79725-94b9-43c6-8099-f1618ce854ad	Güçlükonak	2026-02-02 00:36:15.707035+03
5d9f6481-5654-459e-9e39-6b7aa131c9ad	1a19cf20-1217-48fc-b345-59ea8124fdae	Merkez	2026-02-02 00:36:15.707035+03
14a158f8-242c-41cf-9491-a154ab5ef637	1a19cf20-1217-48fc-b345-59ea8124fdae	Kurucaşile	2026-02-02 00:36:15.707035+03
e1362e42-87af-45f3-a34a-b842d5ffcb6b	1a19cf20-1217-48fc-b345-59ea8124fdae	Ulus	2026-02-02 00:36:15.707035+03
6db1b025-cee6-427a-bd4e-4fb1db9d735e	1a19cf20-1217-48fc-b345-59ea8124fdae	Amasra	2026-02-02 00:36:15.707035+03
517f8503-fc1a-4804-9119-e1fda623b492	78d73c4a-7777-4119-9da8-acf683349905	Merkez	2026-02-02 00:36:15.707035+03
402cf0b3-7195-4d6d-bc47-1c8de5ce9c67	78d73c4a-7777-4119-9da8-acf683349905	Çıldır	2026-02-02 00:36:15.707035+03
e9790d1e-5236-4fe3-b902-26bd6b66c50c	78d73c4a-7777-4119-9da8-acf683349905	Göle	2026-02-02 00:36:15.707035+03
b666129c-fb42-4243-a50c-8d7c44cd17af	78d73c4a-7777-4119-9da8-acf683349905	Hanak	2026-02-02 00:36:15.707035+03
27c56123-3887-4231-98a3-e902228d6398	78d73c4a-7777-4119-9da8-acf683349905	Posof	2026-02-02 00:36:15.707035+03
01b33941-e999-4282-8267-0101dd975404	78d73c4a-7777-4119-9da8-acf683349905	Damal	2026-02-02 00:36:15.707035+03
cf5feaac-94b1-4ae3-85a4-5fdf3dcc0356	b5fac3ec-8589-4395-8b2c-ba0841251c1a	Aralık	2026-02-02 00:36:15.707035+03
becc054e-54de-442b-b096-1585a1c7b9da	b5fac3ec-8589-4395-8b2c-ba0841251c1a	Merkez	2026-02-02 00:36:15.707035+03
2ae5981e-219a-44ee-b580-95b0a6819f8d	b5fac3ec-8589-4395-8b2c-ba0841251c1a	Tuzluca	2026-02-02 00:36:15.707035+03
a17017f2-92f6-4659-896b-857dea8060b9	b5fac3ec-8589-4395-8b2c-ba0841251c1a	Karakoyunlu	2026-02-02 00:36:15.707035+03
a22815c7-0942-49f2-88a5-f189a423b64a	2eee64e7-4ca2-4eb4-8b28-eeb6a2dc0ffc	Merkez	2026-02-02 00:36:15.707035+03
ac081dc7-b935-40c9-85e0-03aad8df62f8	2eee64e7-4ca2-4eb4-8b28-eeb6a2dc0ffc	Altınova	2026-02-02 00:36:15.707035+03
ddf8d620-c1de-43a6-a05b-825c5d425a9b	2eee64e7-4ca2-4eb4-8b28-eeb6a2dc0ffc	Armutlu	2026-02-02 00:36:15.707035+03
04241f63-4339-4b10-a108-8d456a8331fb	2eee64e7-4ca2-4eb4-8b28-eeb6a2dc0ffc	Çınarcık	2026-02-02 00:36:15.707035+03
476b06c0-ad36-4872-85d4-0e3b4786b00f	2eee64e7-4ca2-4eb4-8b28-eeb6a2dc0ffc	Çiftlikköy	2026-02-02 00:36:15.707035+03
cc855c7d-3f81-4d26-8a5b-24c75d5a8b14	2eee64e7-4ca2-4eb4-8b28-eeb6a2dc0ffc	Termal	2026-02-02 00:36:15.707035+03
90dd108b-9a13-428c-8c3e-952ecb877080	93e97cb0-7993-4578-8709-e43ea5aedb21	Eflani	2026-02-02 00:36:15.707035+03
1e0cee2c-cf17-4d0e-a915-50a73643403b	93e97cb0-7993-4578-8709-e43ea5aedb21	Eskipazar	2026-02-02 00:36:15.707035+03
553a7c42-2dd6-4119-9ae8-d326ac4ca3bf	93e97cb0-7993-4578-8709-e43ea5aedb21	Merkez	2026-02-02 00:36:15.707035+03
fdf4f488-0c77-4894-a870-15aff5aea356	93e97cb0-7993-4578-8709-e43ea5aedb21	Ovacık	2026-02-02 00:36:15.707035+03
088bdc30-de71-4d19-801e-13e75edbc4da	93e97cb0-7993-4578-8709-e43ea5aedb21	Safranbolu	2026-02-02 00:36:15.707035+03
fc582910-f908-4848-88fe-d857aa47c421	93e97cb0-7993-4578-8709-e43ea5aedb21	Yenice	2026-02-02 00:36:15.707035+03
c6600462-5a60-4954-9a4a-20be20498c4c	abd5ce70-e098-4ae3-9b85-b528395a2a60	Merkez	2026-02-02 00:36:15.707035+03
4515c30a-bb07-47e8-8f5b-a49cc460f16a	abd5ce70-e098-4ae3-9b85-b528395a2a60	Elbeyli	2026-02-02 00:36:15.707035+03
192bfdc4-d702-481c-9acd-184e8f6ca881	abd5ce70-e098-4ae3-9b85-b528395a2a60	Musabeyli	2026-02-02 00:36:15.707035+03
9fbca3df-d5d3-4a5c-9f00-98a1830e607d	abd5ce70-e098-4ae3-9b85-b528395a2a60	Polateli	2026-02-02 00:36:15.707035+03
14540d95-4d03-4642-aeef-8a820c83f8d9	3442987f-b416-46b4-950b-297823cfac39	Bahçe	2026-02-02 00:36:15.707035+03
02479526-7f3c-480a-8a57-b719505068c0	3442987f-b416-46b4-950b-297823cfac39	Kadirli	2026-02-02 00:36:15.707035+03
b94bb98e-7a29-4a19-9b5c-88d71142c46e	3442987f-b416-46b4-950b-297823cfac39	Merkez	2026-02-02 00:36:15.707035+03
14831357-6824-466e-b419-8e04845d1486	3442987f-b416-46b4-950b-297823cfac39	Düziçi	2026-02-02 00:36:15.707035+03
5dc9b71c-feba-45b4-b549-d776dcc4ff27	3442987f-b416-46b4-950b-297823cfac39	Hasanbeyli	2026-02-02 00:36:15.707035+03
8806029d-4ce5-4356-915a-35da5517dbdb	3442987f-b416-46b4-950b-297823cfac39	Sumbas	2026-02-02 00:36:15.707035+03
baa65e9e-65fd-465f-8123-9f76943a8c1a	3442987f-b416-46b4-950b-297823cfac39	Toprakkale	2026-02-02 00:36:15.707035+03
35f796eb-5a29-4ab7-8753-44aab307199e	330cca6b-68be-4600-a812-d88596381fa2	Akçakoca	2026-02-02 00:36:15.707035+03
010c7eea-a2cd-41e2-9dbc-abe79b45c2a7	330cca6b-68be-4600-a812-d88596381fa2	Merkez	2026-02-02 00:36:15.707035+03
046916fe-d82c-427b-a210-f3d29f11e6d3	330cca6b-68be-4600-a812-d88596381fa2	Yığılca	2026-02-02 00:36:15.707035+03
e6e4e270-e9d7-4aef-a7ba-9a4a60b7f0b6	330cca6b-68be-4600-a812-d88596381fa2	Cumayeri	2026-02-02 00:36:15.707035+03
a168208a-ae96-49d2-a4d1-f9fc2430b72a	330cca6b-68be-4600-a812-d88596381fa2	Gölyaka	2026-02-02 00:36:15.707035+03
36d33307-cb6d-4e89-81ae-cf5eacd4a7ef	330cca6b-68be-4600-a812-d88596381fa2	Çilimli	2026-02-02 00:36:15.707035+03
bc169583-fcb3-44c1-a846-61b8a0f64b5d	330cca6b-68be-4600-a812-d88596381fa2	Gümüşova	2026-02-02 00:36:15.707035+03
d92f0838-a256-4e99-a470-e5531fcaab78	330cca6b-68be-4600-a812-d88596381fa2	Kaynaşlı	2026-02-02 00:36:15.707035+03
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.favorites (id, user_id, salon_id, created_at) FROM stdin;
\.


--
-- Data for Name: global_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.global_services (id, category_id, name, created_at, avg_duration_min, avg_price) FROM stdin;
6922c1e7-0c38-4df6-bd7c-19ccad48e6df	59eff69c-77fd-47df-8c35-dfc194885bd4	Saç Kesimi	2026-01-02 19:44:57.443527+03	30	0.00
bbefd78d-1546-4118-9a9a-0c5198fde245	59eff69c-77fd-47df-8c35-dfc194885bd4	Saç Boyama	2026-01-02 19:44:57.443527+03	30	0.00
b98add85-340a-4fd8-961c-a22c7a1ebaec	59eff69c-77fd-47df-8c35-dfc194885bd4	Fön	2026-01-02 19:44:57.443527+03	30	0.00
a9948dc7-45a1-423c-9175-0e0686d9a90d	59eff69c-77fd-47df-8c35-dfc194885bd4	Maşa	2026-01-02 19:44:57.443527+03	30	0.00
416d6ba7-77fd-40b9-a771-606ad5b22aea	59eff69c-77fd-47df-8c35-dfc194885bd4	Saç Yıkama	2026-01-02 19:44:57.443527+03	30	0.00
ec03268c-4abc-4dfa-99df-2e9c24da3dd6	59eff69c-77fd-47df-8c35-dfc194885bd4	Saç Bakımı	2026-01-02 19:44:57.443527+03	30	0.00
e707932a-a1d4-471c-8b13-f908ed8c6ece	59eff69c-77fd-47df-8c35-dfc194885bd4	Keratin Bakımı	2026-01-02 19:44:57.443527+03	30	0.00
b904f5ab-dfa2-4485-80ff-3393a72e7ee7	59eff69c-77fd-47df-8c35-dfc194885bd4	Brezilya Fönü	2026-01-02 19:44:57.443527+03	30	0.00
af1ab5ff-163e-432d-8917-f1742e5f2272	59eff69c-77fd-47df-8c35-dfc194885bd4	Saç Düzleştirme	2026-01-02 19:44:57.443527+03	30	0.00
530b76ab-ce05-4f26-9bf7-38b2820b34e0	59eff69c-77fd-47df-8c35-dfc194885bd4	Perma	2026-01-02 19:44:57.443527+03	30	0.00
4e449195-62df-4eb1-bb79-844321da0a91	420dad0e-9f9f-4883-9f63-f26262a410ee	Manikür	2026-01-02 19:44:57.459578+03	30	0.00
bafafbbf-2423-408a-b189-fb2809f0c71f	420dad0e-9f9f-4883-9f63-f26262a410ee	Pedikür	2026-01-02 19:44:57.459578+03	30	0.00
cfaf5fbd-fe42-4a1a-b8a3-073a7dfd94f4	420dad0e-9f9f-4883-9f63-f26262a410ee	Kalıcı Oje	2026-01-02 19:44:57.459578+03	30	0.00
ef2e68b1-28a4-4d80-a1dc-e5f44adc71fb	420dad0e-9f9f-4883-9f63-f26262a410ee	Protez Tırnak	2026-01-02 19:44:57.459578+03	30	0.00
b4a58f71-2eb8-4965-9821-c1da39111aa8	420dad0e-9f9f-4883-9f63-f26262a410ee	Tırnak Tasarımı	2026-01-02 19:44:57.459578+03	30	0.00
a96e5540-6088-4991-a7ac-d9a69f27b550	420dad0e-9f9f-4883-9f63-f26262a410ee	Fransız Manikür	2026-01-02 19:44:57.459578+03	30	0.00
b8e03e4f-a836-457f-85c2-f2e50e9e8c9b	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	Günlük Makyaj	2026-01-02 19:44:57.466288+03	30	0.00
8e116916-6bd7-406e-bfb6-ab771d6e908c	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	Gece Makyajı	2026-01-02 19:44:57.466288+03	30	0.00
b77eb491-3390-4833-a18d-ed630de436ef	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	Gelin Makyajı	2026-01-02 19:44:57.466288+03	30	0.00
24b20aec-772a-4d3f-b99b-4c929bd91041	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	Nişan Makyajı	2026-01-02 19:44:57.466288+03	30	0.00
c13e03a7-972a-4f5c-932f-4ba3c5e2ede4	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	Kaş Tasarımı	2026-01-02 19:44:57.466288+03	30	0.00
02f691b4-943d-4872-8da2-e0b9b2d2396c	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	Kaş Boyama	2026-01-02 19:44:57.466288+03	30	0.00
b333b47d-4aba-4f58-9730-bf45ea1dc787	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	Kirpik Lifting	2026-01-02 19:44:57.466288+03	30	0.00
b40497f8-d651-421d-87bd-feaf810bd48c	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	Kalıcı Makyaj	2026-01-02 19:44:57.466288+03	30	0.00
e1cfa658-cac6-4ae3-94cc-643f0f73003d	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	İpek Kirpik	2026-01-02 19:44:57.466288+03	30	0.00
c8735745-b223-4893-a954-ea4f554420e5	13e9cd7b-1f8d-468f-8674-623247a63d19	Solaryum	2026-01-02 19:44:57.472558+03	30	0.00
eb803ec9-47b9-41a6-badc-2acc91684276	13e9cd7b-1f8d-468f-8674-623247a63d19	Bronzlaştırma	2026-01-02 19:44:57.472558+03	30	0.00
8a7166ec-522b-4b65-bb60-bb1aa0131172	13e9cd7b-1f8d-468f-8674-623247a63d19	Peeling	2026-01-02 19:44:57.472558+03	30	0.00
d12df297-1cf5-441b-b9e4-8c712886c885	13e9cd7b-1f8d-468f-8674-623247a63d19	Vücut Masajı	2026-01-02 19:44:57.472558+03	30	0.00
7c74c7f7-b6cb-4ae8-8d2c-cbff18db6d13	13e9cd7b-1f8d-468f-8674-623247a63d19	Selülit Masajı	2026-01-02 19:44:57.472558+03	30	0.00
ae40e596-b7a9-4d92-ba62-ed8745b72045	13e9cd7b-1f8d-468f-8674-623247a63d19	Zayıflama Masajı	2026-01-02 19:44:57.472558+03	30	0.00
52015d89-2ef7-4b17-b328-ce5b40644eb0	ee10018d-9979-4822-8d82-9e729c40cd5e	Lazer Epilasyon - Tüm Vücut	2026-01-02 19:44:57.475364+03	30	0.00
b8811970-2ee2-48a8-8269-6a18581302d2	ee10018d-9979-4822-8d82-9e729c40cd5e	Lazer Epilasyon - Yüz	2026-01-02 19:44:57.475364+03	30	0.00
2c9e1152-edea-411d-aa67-3ffbc9f2c2df	ee10018d-9979-4822-8d82-9e729c40cd5e	Lazer Epilasyon - Kol	2026-01-02 19:44:57.475364+03	30	0.00
50dde8ae-6f76-4aae-977b-a6441711ad4b	ee10018d-9979-4822-8d82-9e729c40cd5e	Lazer Epilasyon - Bacak	2026-01-02 19:44:57.475364+03	30	0.00
7f0440b8-1257-40c7-8e57-d9de2b051c35	ee10018d-9979-4822-8d82-9e729c40cd5e	Lazer Epilasyon - Bikini Bölgesi	2026-01-02 19:44:57.475364+03	30	0.00
ee8d0fdf-f3a4-4e30-939f-c11fca4eac6b	9c3c0fa4-2c53-418d-b067-3717205a3eba	Saç Kesimi	2026-01-02 19:44:57.480973+03	30	0.00
eac9aa50-9887-421f-b39d-c5075baee534	9c3c0fa4-2c53-418d-b067-3717205a3eba	Sakal Kesimi	2026-01-02 19:44:57.480973+03	30	0.00
e61755d9-f6d6-444d-a5d4-8c0f8a9f42a0	9c3c0fa4-2c53-418d-b067-3717205a3eba	Sakal Düzeltme	2026-01-02 19:44:57.480973+03	30	0.00
fa1df9cf-a40f-4d8d-b4b7-3f267bce2ff4	9c3c0fa4-2c53-418d-b067-3717205a3eba	Amerikan Tıraşı	2026-01-02 19:44:57.480973+03	30	0.00
7b7261a2-d348-475b-ad2a-cebea968651f	9c3c0fa4-2c53-418d-b067-3717205a3eba	Damat Tıraşı	2026-01-02 19:44:57.480973+03	30	0.00
ae828053-cc4d-4e71-ac5f-742ddb6b3fa0	9c3c0fa4-2c53-418d-b067-3717205a3eba	Bıyık Kesimi	2026-01-02 19:44:57.480973+03	30	0.00
9f461413-b0cc-4289-94ab-db938c540af0	9c3c0fa4-2c53-418d-b067-3717205a3eba	Ağda	2026-01-02 19:44:57.480973+03	30	0.00
161c6f45-e425-4bf9-bfb4-d871a379c779	9c3c0fa4-2c53-418d-b067-3717205a3eba	Kaş Düzeltme	2026-01-02 19:44:57.480973+03	30	0.00
8545dc31-85c6-4cbb-bb6b-1806425b1bbe	9c3c0fa4-2c53-418d-b067-3717205a3eba	Cilt Bakımı	2026-01-02 19:44:57.480973+03	30	0.00
77466a4b-c8f7-4fc0-80f8-d50cdf86d467	d1820b84-eadb-4e81-a148-6608ccb63407	İsveç Masajı	2026-01-02 19:44:57.484254+03	30	0.00
e81ec3d8-2373-4a94-bc28-5b3a4b26fad0	d1820b84-eadb-4e81-a148-6608ccb63407	Aromaterapi Masajı	2026-01-02 19:44:57.484254+03	30	0.00
1f702e81-47c7-4c1d-982c-2e4a59894cc6	d1820b84-eadb-4e81-a148-6608ccb63407	Thai Masajı	2026-01-02 19:44:57.484254+03	30	0.00
5f3401ea-7e49-4f7a-98d1-cede179b531b	d1820b84-eadb-4e81-a148-6608ccb63407	Refleksoloji	2026-01-02 19:44:57.484254+03	30	0.00
3d8e4700-b05e-4e7c-b0a4-20e37a7d2edc	d1820b84-eadb-4e81-a148-6608ccb63407	Hamam	2026-01-02 19:44:57.484254+03	30	0.00
7a40353e-c6fb-4f1e-8d58-a18c7523adcd	d1820b84-eadb-4e81-a148-6608ccb63407	Kese-Köpük	2026-01-02 19:44:57.484254+03	30	0.00
23f5e9bb-003f-4a91-a140-ead63c7ca2f5	d1820b84-eadb-4e81-a148-6608ccb63407	Jakuzi	2026-01-02 19:44:57.484254+03	30	0.00
8e426112-1920-4b36-a575-eff52db6c9ce	d1820b84-eadb-4e81-a148-6608ccb63407	Sauna	2026-01-02 19:44:57.484254+03	30	0.00
07058c07-4b60-4ed8-818b-d8bc1ef19f51	acc90202-7188-4c0c-9ba5-fe2016674750	Cilt Bakımı	2026-01-02 19:44:57.49287+03	30	0.00
10e9eb56-7d36-487d-95eb-1ccd3ea77be4	acc90202-7188-4c0c-9ba5-fe2016674750	Yüz Temizliği	2026-01-02 19:44:57.49287+03	30	0.00
91d37b15-cd37-40e9-94a0-1043bd4516b2	acc90202-7188-4c0c-9ba5-fe2016674750	Maske	2026-01-02 19:44:57.49287+03	30	0.00
c6d60fa6-f863-4b1c-a9f0-179fb2502371	acc90202-7188-4c0c-9ba5-fe2016674750	Peeling	2026-01-02 19:44:57.49287+03	30	0.00
dd705ee8-75e2-4786-ad42-755cfc375265	acc90202-7188-4c0c-9ba5-fe2016674750	Akne Tedavisi	2026-01-02 19:44:57.49287+03	30	0.00
0538cbc3-fa16-47b9-bf54-e365c778b7f0	acc90202-7188-4c0c-9ba5-fe2016674750	Leke Tedavisi	2026-01-02 19:44:57.49287+03	30	0.00
e0b7d7c2-e940-4b1b-8158-f1215ae098d1	acc90202-7188-4c0c-9ba5-fe2016674750	Hydrafacial	2026-01-02 19:44:57.49287+03	30	0.00
b047ca55-f768-420f-a290-3eaa847b3b8a	acc90202-7188-4c0c-9ba5-fe2016674750	Mezoterapi	2026-01-02 19:44:57.49287+03	30	0.00
40d8506d-b9f6-444c-a8d0-e1cb1b85757e	acc90202-7188-4c0c-9ba5-fe2016674750	Botox	2026-01-02 19:44:57.49287+03	30	0.00
633ac337-9a5e-49db-92f4-29882b3b42f0	acc90202-7188-4c0c-9ba5-fe2016674750	Dolgu	2026-01-02 19:44:57.49287+03	30	0.00
eaf0f76d-ed44-4648-80e1-0f45ede54f35	9c3c0fa4-2c53-418d-b067-3717205a3eba	Erkek Saç Kesimi	2026-02-02 00:19:11.360707+03	30	0.00
37b553eb-5215-4ff5-9088-0465c5ff018b	9c3c0fa4-2c53-418d-b067-3717205a3eba	Ağda (Erkek)	2026-02-02 00:19:11.360707+03	30	0.00
6bdbb979-87ae-4159-9cc0-d829cfe73776	9c3c0fa4-2c53-418d-b067-3717205a3eba	Kaş Düzeltme (Erkek)	2026-02-02 00:19:11.360707+03	30	0.00
ae38a443-c867-4d9a-a8e5-5d2c84807e10	9c3c0fa4-2c53-418d-b067-3717205a3eba	Erkek Cilt Bakımı	2026-02-02 00:19:11.360707+03	30	0.00
6636a6e9-7fa5-46b7-bfc5-112a65eb4e1b	acc90202-7188-4c0c-9ba5-fe2016674750	Peeling (Yüz)	2026-02-02 00:19:11.360707+03	30	0.00
\.


--
-- Data for Name: invites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invites (id, salon_id, email, role, token, status, inviter_id, expires_at, created_at, accepted_at) FROM stdin;
\.


--
-- Data for Name: iys_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.iys_logs (id, phone, message_type, content, status, created_at) FROM stdin;
631bd053-a75a-46f2-a439-f211161bb21e	5551234567	OTP	Doğrulama kodunuz: 123456	SENT	2026-01-02 19:44:57.910385+03
bd82af4a-6af0-41ba-a318-81a14a658da1	5552345678	INFO	Randevunuz yarın saat 14:00'de.	SENT	2026-01-02 19:44:57.910385+03
8667a6ba-8fde-4b97-829a-29a427494af9	5553456789	CAMPAIGN	Bu hafta %20 indirim fırsatı!	SENT	2026-01-02 19:44:57.910385+03
45a40fe4-3f1b-4f4f-815f-6e56216b3c77	5554567890	OTP	Doğrulama kodunuz: 789012	SENT	2026-01-02 19:44:57.910385+03
1ce77a5b-56ef-413d-91d9-4e802b13671d	5555678901	INFO	Randevunuz iptal edilmiştir.	FAILED	2026-01-02 19:44:57.910385+03
f6ba8780-0695-4675-83b6-5641702e2624	5556789012	INFO	Randevunuz onaylandı.	SENT	2026-01-02 19:44:57.910385+03
7656643e-71bf-4b1a-9ed7-475610c01ece	5557890123	CAMPAIGN	Yeni hizmetlerimizi keşfedin!	DEMO	2026-01-02 19:44:57.910385+03
b9cc3f2e-0882-4a30-998d-463a9d3e1db2	5455567877	OTP	[DEMO] Dogrulama Kodunuz: 111111	DEMO	2026-01-02 19:51:40.500724+03
d30f0b03-3dae-4deb-97b5-89f145a6d256	5455567877	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-02 19:52:00.66076+03
67a0a5f3-f7ee-47a2-bf07-0be6026efbc0	5334565656	OTP	[DEMO] Dogrulama Kodunuz: 111111	DEMO	2026-01-02 22:41:27.202804+03
70017daf-b9c2-4602-8b10-d7c75d751534	5334565656	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-02 22:41:40.998356+03
46d43706-f29d-42c1-a99a-ae602535df10	5326045779	OTP	[DEMO] Dogrulama Kodunuz: 111111	DEMO	2026-01-04 19:35:36.677461+03
a5196f6a-3480-4b32-965a-eea4fcdaa836	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-04 19:36:27.778895+03
cabfda3a-8e80-4261-8c75-d838d4fe68b9	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-14 23:15:22.977569+03
986df577-28e9-4dce-a3ac-0caea703b6de	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-19 22:21:32.906597+03
9b6f5714-50a0-4d5c-8587-742c97c69ef1	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-19 22:34:43.930541+03
84bd3815-4730-4387-aa54-24f1e7f562f5	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-19 22:49:55.949858+03
f9253ddd-bfbb-4751-9817-24b0f8dc1eb2	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-19 22:50:54.551484+03
9c34ccf3-6b09-4533-923e-39c4ef1f2094	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-19 22:59:59.991988+03
8bf26301-cf59-4a57-a2cf-170ef6dc2374	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-19 23:05:38.528561+03
7fe425bc-182d-468c-8b5f-3f44cafa12ec	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-19 23:10:30.626975+03
b0d59071-55ec-48e7-998a-a923dc390416	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-24 18:11:50.977506+03
e8e001c4-79a3-4660-9462-9098c4e39a9f	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-24 18:13:44.235864+03
f22d45ad-4819-4256-9b9d-77b20a697377	5326045779	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-24 18:46:05.474423+03
33352bb3-ad3f-47df-8f17-d347479b9307	5326045780	OTP	[DEMO] Dogrulama Kodunuz: 111111	DEMO	2026-01-24 23:21:43.117366+03
13d43cdc-4911-4384-9f5d-8e52f8288f7c	5324565577	OTP	[DEMO] Dogrulama Kodunuz: 111111	DEMO	2026-01-25 00:15:37.039273+03
fd02e781-a63f-46e5-b294-31458d97c38d	5324565577	INFO	[DEMO] Randevunuz alındı!	DEMO	2026-01-25 00:16:02.126724+03
36dbd6ef-65a6-466e-9d3d-fc05feb89c59	5324443322	OTP	[DEMO] Dogrulama Kodunuz: 111111	DEMO	2026-01-25 00:22:35.89044+03
571866f0-a08a-4965-aca0-f77e21f91efa	5432346677	OTP	[DEMO] Dogrulama Kodunuz: 111111	DEMO	2026-01-25 00:27:36.795521+03
\.


--
-- Data for Name: iyzico_webhooks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.iyzico_webhooks (id, iyzi_event_type, payload, status, error_message, processed_at, created_at) FROM stdin;
\.


--
-- Data for Name: notification_queue; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_queue (id, channel, recipient, subject, content, status, related_id, related_table, tries, last_error, scheduled_for, processed_at, created_at) FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_templates (id, slug, channel, subject, content, is_active, created_at, updated_at) FROM stdin;
d2799781-7407-44b5-87cb-bd83cd9e636e	reminder_24h	SMS	\N	Sayın {{customer_name}}, {{salon_name}} salonunda yarın saat {{time}} randevunuz bulunmaktadır. Değişiklik için lütfen iletişime geçin.	t	2026-01-25 22:12:52.532882+03	2026-01-25 22:12:52.532882+03
62fdea92-6b9e-472f-88c7-60a17fcda816	reminder_1h	SMS	\N	Sayın {{customer_name}}, {{salon_name}} randevunuz 1 saat sonra başlayacaktır.	t	2026-01-25 22:12:52.532882+03	2026-01-25 22:12:52.532882+03
73a3f92f-1908-4c9c-bda1-e5c4af7fa959	status_confirmed	SMS	\N	Sayın {{customer_name}}, {{salon_name}} randevunuz ONAYLANMIŞTIR. Tarih: {{date}} Saat: {{time}}	t	2026-01-25 22:12:52.532882+03	2026-01-25 22:12:52.532882+03
3b8511c3-58d1-4d81-9847-3dd8f3c564f1	status_completed	SMS	\N	Hizmetimizden memnun kaldığınızı umarız! Deneyiminizi değerlendirmek için: {{link}}	t	2026-01-25 22:12:52.532882+03	2026-01-25 22:12:52.532882+03
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, title, message, type, is_read, action_url, created_at) FROM stdin;
0a86d919-1ad6-4f2a-b70e-7c015666ae04	f9821af5-3930-4a83-8de9-8d434e7155aa	Hoşgeldiniz	Güzellik Randevu dünyasına hoşgeldiniz!	SYSTEM	t	\N	2026-01-13 22:34:08.235124+03
7f8fa3ab-e57b-4c01-83a5-48d7616b893c	f9821af5-3930-4a83-8de9-8d434e7155aa	Randevu Hatırlatma	Yarınki randevunuzu unutmayın.	REMINDER	f	\N	2026-01-13 22:34:08.235124+03
1289f3d3-0c2d-436c-977e-cb11e92107cf	f9821af5-3930-4a83-8de9-8d434e7155aa	Kampanya	Hafta sonuna özel %20 indirim.	PROMOTION	f	\N	2026-01-13 22:34:08.235124+03
6aa7bf70-2879-40e1-a30b-71d63e8a4fec	5117fa0a-92ee-4c40-b273-a70d398523c8	Randevu Hatırlatması	Yarın saat 14:00'deki randevunuzu unutmayın!	REMINDER	f	\N	2026-01-25 01:16:23.564687+03
5070bd6a-769b-45ed-980c-687916517255	5117fa0a-92ee-4c40-b273-a70d398523c8	Hoşgeldin Hediyesi	İlk randevunuza özel %10 indirim kazandınız.	PROMOTION	f	\N	2026-01-25 01:16:25.862823+03
dc44b055-74ac-4b59-9837-2927ee833ba7	8feb244e-05c7-48c7-9768-8793a0e56c3a	İşletme Başvurusu Onaylandı!	Candan Beauty Center isimli işletmeniz onaylanmıştır. Artık şubeyi yönetmeye başlayabilirsiniz.	SYSTEM	f	/owner/dashboard	2026-02-10 22:05:31.183+03
4435954e-dcb8-4373-80c8-c59542033ab1	8feb244e-05c7-48c7-9768-8793a0e56c3a	İşletme Başvurusu Onaylandı!	Candan Beauty Center isimli işletmeniz onaylanmıştır. Artık şubeyi yönetmeye başlayabilirsiniz.	SYSTEM	f	/owner/dashboard	2026-02-10 22:12:09.677+03
97323a3c-c06e-4857-bdaa-bc648e87b2ed	8feb244e-05c7-48c7-9768-8793a0e56c3a	İşletme Başvurusu Onaylandı!	Candan Beauty Center isimli işletmeniz onaylanmıştır. Artık şubeyi yönetmeye başlayabilirsiniz.	SYSTEM	f	/owner/dashboard	2026-02-10 22:12:44.143+03
79fd8956-cb20-40cb-92eb-52616d2e8d7a	8feb244e-05c7-48c7-9768-8793a0e56c3a	İşletme Başvurusu Onaylandı!	Candan Beauty Center isimli işletmeniz onaylanmıştır. Artık şubeyi yönetmeye başlayabilirsiniz.	SYSTEM	f	/owner/dashboard	2026-02-10 22:55:49.296+03
\.


--
-- Data for Name: otp_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.otp_codes (id, phone, code, expires_at, used, created_at) FROM stdin;
67d027cc-16d5-4b52-9b69-96ee1f38866e	5455567877	111111	2026-01-02 19:56:40.456+03	f	2026-01-02 19:51:40.466691+03
117222ef-2e9b-4509-9a92-89408ee74952	5334565656	111111	2026-01-02 22:46:27.171+03	f	2026-01-02 22:41:27.18051+03
7d85afe8-829a-4667-8de2-2355b8928ed6	5550001122	123456	2030-01-01 03:00:00+03	f	2026-01-14 23:10:24.281896+03
e813a2c5-1387-4ee9-9f9c-3826df8b9e8c	5326045780	111111	2026-01-24 23:26:43.088+03	f	2026-01-24 23:21:43.103272+03
23a9a415-387c-4cd3-882e-291357690d7d	5324565577	111111	2026-01-25 00:20:37+03	f	2026-01-25 00:15:37.027324+03
34d085d9-9515-431d-b2a0-d38152dea665	5324443322	111111	2026-01-25 00:27:35.855+03	f	2026-01-25 00:22:35.880026+03
b530a3c4-9d4e-4202-983d-1276dbf23ab2	5432346677	111111	2026-01-25 00:32:36.757+03	f	2026-01-25 00:27:36.78291+03
\.


--
-- Data for Name: package_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.package_services (id, package_id, salon_service_id, quantity, created_at) FROM stdin;
\.


--
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.packages (id, salon_id, name, description, price, is_active, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: payment_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_history (id, salon_id, subscription_id, appointment_id, payment_type, payment_method, amount, status, iyzico_payment_id, iyzico_link_id, bank_transfer_notified_at, bank_transfer_proof_url, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_settings (key, value, updated_at) FROM stdin;
bank_accounts	[{"bank": "Ziraat Bankası", "iban": "TR00...", "owner": "Güzellik Randevu Platformu", "description": "Lütfen ödeme açıklamasında SalonID belirtiniz."}]	2026-02-25 00:06:55.50925+03
platform_commission_rate	{"rate": 5, "description": "Randevu başı yüzde komisyon"}	2026-02-25 17:44:38.396818+03
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, email, first_name, avatar_url, phone, role, created_at, updated_at, birth_date, last_name, full_name, is_active, deleted_at, kvkk_accepted_at, marketing_opt_in, language_preference, default_city_id) FROM stdin;
8feb244e-05c7-48c7-9768-8793a0e56c3a	owner@demo.com	Owner	\N	\N	SALON_OWNER	2026-01-24 23:19:15.621198+03	2026-02-02 00:01:49.58846+03	\N	User	\N	t	\N	\N	f	tr	\N
3505f73c-9b90-4a39-9620-3c512f3ac1d2	staff@demo.com	Staff	\N	\N	STAFF	2026-01-24 23:19:15.92524+03	2026-01-24 23:19:16.003936+03	\N	User	\N	t	\N	\N	f	tr	\N
2720fc9a-e89a-410c-a613-38834fb1669a	5326045780@pending.user	\N	\N	\N	CUSTOMER	2026-01-24 23:21:52.443523+03	2026-01-24 23:21:52.443523+03	\N	\N	\N	t	\N	\N	f	tr	\N
743cd2aa-3ce6-4e49-8120-7c45e021e411	5324565577@pending.user	\N	\N	\N	CUSTOMER	2026-01-25 00:15:53.170543+03	2026-01-25 00:15:53.170543+03	\N	\N	\N	t	\N	\N	f	tr	\N
1275f9b6-9e9b-4fcb-909b-7ac1532a350b	owner1@example.com	Mert  	\N	\N	CUSTOMER	2026-01-02 19:44:57.716114+03	2026-01-13 22:46:00.643572+03	\N	Bilgin	\N	t	\N	\N	f	tr	\N
258280de-707a-4d75-b0e7-89869cc55b6c	owner5@example.com	Can Berber	\N	\N	CUSTOMER	2026-01-02 19:44:57.716114+03	2026-01-13 22:46:07.472449+03	\N	Mutlu	\N	t	\N	\N	f	tr	\N
28027d92-3be3-4273-9155-f81f945cdca9	sad@saf.com	Ayşe	\N	905455567877	CUSTOMER	2026-01-02 19:51:49.472508+03	2026-01-13 22:46:14.546035+03	\N	Tuzlu	\N	t	\N	\N	f	tr	\N
aa084b47-7c37-43ee-8901-75bdb1cdcb68	5324443322@pending.user	\N	\N	\N	CUSTOMER	2026-01-25 00:22:43.843612+03	2026-01-25 00:22:43.843612+03	\N	\N	\N	t	\N	\N	f	tr	\N
49c8fd49-1921-41b7-a9b0-df0a3bc655a4	sad@sad.xom	Hakkı	\N	905334565656	CUSTOMER	2026-01-02 22:41:33.559548+03	2026-01-13 22:46:22.934507+03	\N	Hacı	\N	t	\N	\N	f	tr	\N
92242964-46e0-4867-9737-cfc728dd375b	owner2@example.com	Ayşe İşletmeci	\N	\N	CUSTOMER	2026-01-02 19:44:57.716114+03	2026-01-13 22:46:27.958302+03	\N	boralı	\N	t	\N	\N	f	tr	\N
a7f8376d-d486-49aa-8fd5-9202c47e9145	5432346677@pending.user	\N	\N	\N	CUSTOMER	2026-01-25 00:27:41.439363+03	2026-01-25 00:27:41.439363+03	\N	\N	\N	t	\N	\N	f	tr	\N
fe908fc7-4b40-4482-b2f2-c0d57fd97aa5	owner3@example.com	Ahmet Kuaför	\N	\N	CUSTOMER	2026-01-02 19:44:57.716114+03	2026-01-13 22:46:55.838488+03	\N	Maşa	\N	t	\N	\N	f	tr	\N
c5c287f9-9564-4998-9b53-8513ae013d14	owner4@example.com	Zeynep Güzellik	\N	\N	CUSTOMER	2026-01-02 19:44:57.716114+03	2026-01-13 22:50:20.996496+03	1992-01-01	Güzel	\N	t	\N	\N	f	tr	\N
5117fa0a-92ee-4c40-b273-a70d398523c8	customer@demo.com	Customer	\N	5551112233	CUSTOMER	2026-01-24 23:19:16.202194+03	2026-01-25 01:24:29.660113+03	1988-01-25	Demo	\N	t	\N	\N	f	tr	\N
7b33bff9-a0e6-4884-9093-7cfc328bfb3a	admin@demo.com	Admin	\N	\N	SUPER_ADMIN	2026-01-24 23:19:15.281335+03	2026-01-25 15:13:03.665633+03	\N	User	System Admin	t	\N	\N	f	tr	\N
f9821af5-3930-4a83-8de9-8d434e7155aa	myolal@gmail.com	Murat	\N	905326045779	CUSTOMER	2026-01-04 19:36:04.300193+03	2026-01-24 18:46:05.421772+03	1981-02-10	  Yolal	\N	t	\N	\N	f	tr	\N
0ec8a69e-1bda-4cf7-ab95-7b635d2f4859	customer2@demo.com	customer2	\N	\N	CUSTOMER	2026-01-26 00:00:44.480292+03	2026-01-26 00:00:44.480292+03	\N	customer2	\N	t	\N	\N	f	tr	\N
090ed181-87ee-4c19-b0dc-1828ad0ebfd3	owner2@demo.com	owner2	\N	\N	SALON_OWNER	2026-01-26 00:03:23.358023+03	2026-01-26 00:03:23.358023+03	\N	owner2	\N	t	\N	\N	f	tr	\N
\.


--
-- Data for Name: review_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_images (id, review_id, image_url, created_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, salon_id, user_id, user_name, user_avatar, rating, comment, created_at, appointment_id, is_verified) FROM stdin;
\.


--
-- Data for Name: salon_assigned_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salon_assigned_types (id, salon_id, type_id, is_primary, created_at) FROM stdin;
\.


--
-- Data for Name: salon_gallery; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salon_gallery (id, salon_id, image_url, caption, display_order, created_at) FROM stdin;
\.


--
-- Data for Name: salon_memberships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salon_memberships (id, user_id, salon_id, role, is_active, created_at) FROM stdin;
7e98b39d-db04-4df9-b3c6-0221eace87bb	1275f9b6-9e9b-4fcb-909b-7ac1532a350b	c3a9a289-7cd1-486e-85f0-bae432be5b10	OWNER	t	2026-02-02 00:48:22.780825+03
a09c6fd9-cdca-4354-8278-51ce8f127fef	92242964-46e0-4867-9737-cfc728dd375b	79d98947-715d-4d34-904f-8f5ee4c8d958	OWNER	t	2026-02-02 00:48:22.780825+03
3725b6bd-ac3b-4c54-8e92-7f29c4106f2a	fe908fc7-4b40-4482-b2f2-c0d57fd97aa5	10943547-c356-4360-9946-f7773b72fcca	OWNER	t	2026-02-02 00:48:22.780825+03
546b635d-4bc1-4472-bc8e-08ac11860233	c5c287f9-9564-4998-9b53-8513ae013d14	8789002f-0c17-462f-9047-a72e804cc7a1	OWNER	t	2026-02-02 00:48:22.780825+03
5279f4ba-2073-42d5-baf0-b88d60979280	258280de-707a-4d75-b0e7-89869cc55b6c	a9bbcc20-be59-44ed-a47f-40762e7621b6	OWNER	t	2026-02-02 00:48:22.780825+03
4d875c7f-412c-4c70-a6c9-826c6c2dddff	1275f9b6-9e9b-4fcb-909b-7ac1532a350b	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	OWNER	t	2026-02-02 00:48:22.780825+03
9cd50fed-b74b-4631-a063-52334c026b77	92242964-46e0-4867-9737-cfc728dd375b	01a4dea4-dc91-4185-8acd-f61f26ab2525	OWNER	t	2026-02-02 00:48:22.780825+03
d9b51f78-7cca-4e30-a48f-d244ea96618d	fe908fc7-4b40-4482-b2f2-c0d57fd97aa5	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	OWNER	t	2026-02-02 00:48:22.780825+03
34ce423e-6c61-4bb5-8603-3ca84d697c17	c5c287f9-9564-4998-9b53-8513ae013d14	6baba140-5ba8-4787-b162-dd2240590cb4	OWNER	t	2026-02-02 00:48:22.780825+03
e86f0af1-ec34-4000-9991-0155e5830f7f	8feb244e-05c7-48c7-9768-8793a0e56c3a	3c25931a-ecb3-4d39-8d54-ccdbe7d0621c	OWNER	t	2026-02-02 01:04:15.694783+03
a37512c5-fe2b-4529-bc29-98eca12e5f5b	8feb244e-05c7-48c7-9768-8793a0e56c3a	84108822-fef0-4b00-96a4-d214689755c7	OWNER	t	2026-02-02 01:05:54.844852+03
\.


--
-- Data for Name: salon_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salon_services (id, salon_id, global_service_id, duration_min, price, created_at, is_active) FROM stdin;
99972c88-5f8b-4d10-b1f7-02ad3f497253	c3a9a289-7cd1-486e-85f0-bae432be5b10	8e116916-6bd7-406e-bfb6-ab771d6e908c	45	239.00	2026-02-02 00:48:22.780825+03	t
4c1fc5ee-455f-48ce-966b-b9e214aea31f	c3a9a289-7cd1-486e-85f0-bae432be5b10	ae40e596-b7a9-4d92-ba62-ed8745b72045	45	481.00	2026-02-02 00:48:22.780825+03	t
e6bdbb3b-e071-4fcb-90a5-01c6e4493582	c3a9a289-7cd1-486e-85f0-bae432be5b10	40d8506d-b9f6-444c-a8d0-e1cb1b85757e	45	493.00	2026-02-02 00:48:22.780825+03	t
721848c3-05cd-43e1-8b9a-6630821cdcd4	c3a9a289-7cd1-486e-85f0-bae432be5b10	77466a4b-c8f7-4fc0-80f8-d50cdf86d467	45	138.00	2026-02-02 00:48:22.780825+03	t
a569d5dd-8ddb-4553-92c6-ba977efe965f	c3a9a289-7cd1-486e-85f0-bae432be5b10	2c9e1152-edea-411d-aa67-3ffbc9f2c2df	45	364.00	2026-02-02 00:48:22.780825+03	t
3b564ca5-6ca1-473d-83a0-e6a76eb9a841	79d98947-715d-4d34-904f-8f5ee4c8d958	eb803ec9-47b9-41a6-badc-2acc91684276	45	195.00	2026-02-02 00:48:22.780825+03	t
6b7e0569-1ea6-4d10-85b7-7f9101816a53	79d98947-715d-4d34-904f-8f5ee4c8d958	ef2e68b1-28a4-4d80-a1dc-e5f44adc71fb	45	580.00	2026-02-02 00:48:22.780825+03	t
47da8fa9-58f0-4ba9-a20f-df31be762971	79d98947-715d-4d34-904f-8f5ee4c8d958	7c74c7f7-b6cb-4ae8-8d2c-cbff18db6d13	45	499.00	2026-02-02 00:48:22.780825+03	t
2baa2c97-78e0-4420-a274-784cf2320be6	79d98947-715d-4d34-904f-8f5ee4c8d958	07058c07-4b60-4ed8-818b-d8bc1ef19f51	45	498.00	2026-02-02 00:48:22.780825+03	t
0780e6bf-9dcf-4ba2-b56a-b62d869716b1	79d98947-715d-4d34-904f-8f5ee4c8d958	2c9e1152-edea-411d-aa67-3ffbc9f2c2df	45	207.00	2026-02-02 00:48:22.780825+03	t
cbb5a62d-1988-4165-8474-ea5186a3a5bb	10943547-c356-4360-9946-f7773b72fcca	e707932a-a1d4-471c-8b13-f908ed8c6ece	45	202.00	2026-02-02 00:48:22.780825+03	t
02320333-5141-49fb-80c4-6a33fd5b7be4	10943547-c356-4360-9946-f7773b72fcca	cfaf5fbd-fe42-4a1a-b8a3-073a7dfd94f4	45	505.00	2026-02-02 00:48:22.780825+03	t
25ce8779-f77f-4485-bb09-b1bbdf0abc92	10943547-c356-4360-9946-f7773b72fcca	b77eb491-3390-4833-a18d-ed630de436ef	45	103.00	2026-02-02 00:48:22.780825+03	t
23bb6ca6-720b-4302-8a7e-05bf23330e46	10943547-c356-4360-9946-f7773b72fcca	b904f5ab-dfa2-4485-80ff-3393a72e7ee7	45	152.00	2026-02-02 00:48:22.780825+03	t
6341b372-8b10-4291-9918-200a69b07aba	10943547-c356-4360-9946-f7773b72fcca	b98add85-340a-4fd8-961c-a22c7a1ebaec	45	195.00	2026-02-02 00:48:22.780825+03	t
5ef49c09-df36-4a4f-9b4c-ae9b47e85b3c	8789002f-0c17-462f-9047-a72e804cc7a1	c13e03a7-972a-4f5c-932f-4ba3c5e2ede4	45	254.00	2026-02-02 00:48:22.780825+03	t
3239b9cf-c154-4da4-b28d-70af0f5224d8	8789002f-0c17-462f-9047-a72e804cc7a1	b40497f8-d651-421d-87bd-feaf810bd48c	45	494.00	2026-02-02 00:48:22.780825+03	t
7a652a7b-8ae4-4787-a0f6-1b47a7dfcf40	8789002f-0c17-462f-9047-a72e804cc7a1	fa1df9cf-a40f-4d8d-b4b7-3f267bce2ff4	45	326.00	2026-02-02 00:48:22.780825+03	t
0110db63-9230-495a-b2e0-fdc01f6ec812	8789002f-0c17-462f-9047-a72e804cc7a1	6636a6e9-7fa5-46b7-bfc5-112a65eb4e1b	45	147.00	2026-02-02 00:48:22.780825+03	t
ddba0b77-e962-402b-a45e-0cfa4fd8c0b5	8789002f-0c17-462f-9047-a72e804cc7a1	161c6f45-e425-4bf9-bfb4-d871a379c779	45	185.00	2026-02-02 00:48:22.780825+03	t
5c6536dc-87bd-4b84-9084-f4d6625f738e	a9bbcc20-be59-44ed-a47f-40762e7621b6	50dde8ae-6f76-4aae-977b-a6441711ad4b	45	379.00	2026-02-02 00:48:22.780825+03	t
abd2369b-291d-49a6-9db2-8452c569d6f7	a9bbcc20-be59-44ed-a47f-40762e7621b6	40d8506d-b9f6-444c-a8d0-e1cb1b85757e	45	291.00	2026-02-02 00:48:22.780825+03	t
22d259a8-0cfd-4e93-aab6-583bea472124	a9bbcc20-be59-44ed-a47f-40762e7621b6	e61755d9-f6d6-444d-a5d4-8c0f8a9f42a0	45	345.00	2026-02-02 00:48:22.780825+03	t
9f5990cf-7a63-4aa9-9898-e00750963671	a9bbcc20-be59-44ed-a47f-40762e7621b6	d12df297-1cf5-441b-b9e4-8c712886c885	45	289.00	2026-02-02 00:48:22.780825+03	t
6e52c8a4-59a3-4f54-b124-d6d366e14435	a9bbcc20-be59-44ed-a47f-40762e7621b6	e0b7d7c2-e940-4b1b-8158-f1215ae098d1	45	402.00	2026-02-02 00:48:22.780825+03	t
a054591f-af8c-4eb0-b058-944217f59ce7	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	eb803ec9-47b9-41a6-badc-2acc91684276	45	420.00	2026-02-02 00:48:22.780825+03	t
984d2e7c-5575-45e0-a318-2aa709f8f786	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	6922c1e7-0c38-4df6-bd7c-19ccad48e6df	45	430.00	2026-02-02 00:48:22.780825+03	t
4c66a96b-c3bb-4f8e-ae26-40bd7dd0c647	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	8e116916-6bd7-406e-bfb6-ab771d6e908c	45	220.00	2026-02-02 00:48:22.780825+03	t
fbfd46ec-bc95-4981-b590-da68124aceab	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	b40497f8-d651-421d-87bd-feaf810bd48c	45	345.00	2026-02-02 00:48:22.780825+03	t
993f6efe-6cc0-485d-9a05-fd5a8ad7f95a	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	eac9aa50-9887-421f-b39d-c5075baee534	45	138.00	2026-02-02 00:48:22.780825+03	t
ff55a6e5-05d4-43a9-974c-c4cf6eb40e2f	01a4dea4-dc91-4185-8acd-f61f26ab2525	ae38a443-c867-4d9a-a8e5-5d2c84807e10	45	447.00	2026-02-02 00:48:22.780825+03	t
f50b63eb-2fd8-4708-a8c9-0459d1385b4f	01a4dea4-dc91-4185-8acd-f61f26ab2525	8a7166ec-522b-4b65-bb60-bb1aa0131172	45	148.00	2026-02-02 00:48:22.780825+03	t
05560b7a-8576-4214-8165-ebcca6b7afbb	01a4dea4-dc91-4185-8acd-f61f26ab2525	6bdbb979-87ae-4159-9cc0-d829cfe73776	45	511.00	2026-02-02 00:48:22.780825+03	t
dab97d3c-c08a-4ef6-8fa4-d60555591f4d	01a4dea4-dc91-4185-8acd-f61f26ab2525	8545dc31-85c6-4cbb-bb6b-1806425b1bbe	45	357.00	2026-02-02 00:48:22.780825+03	t
1caad64a-1ef6-4a1f-93ad-5e6fbd0b5b69	01a4dea4-dc91-4185-8acd-f61f26ab2525	77466a4b-c8f7-4fc0-80f8-d50cdf86d467	45	188.00	2026-02-02 00:48:22.780825+03	t
9879069e-d40e-46aa-a8ee-cb1294934d5e	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	0538cbc3-fa16-47b9-bf54-e365c778b7f0	45	306.00	2026-02-02 00:48:22.780825+03	t
d07a72e6-9a01-4145-a1de-84f156a8bc23	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	ee8d0fdf-f3a4-4e30-939f-c11fca4eac6b	45	391.00	2026-02-02 00:48:22.780825+03	t
4ee14ed7-7951-4897-874b-fa4757a0891c	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	8e426112-1920-4b36-a575-eff52db6c9ce	45	123.00	2026-02-02 00:48:22.780825+03	t
c5e75703-ac93-4602-9bfb-2b3584b2f6c6	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	5f3401ea-7e49-4f7a-98d1-cede179b531b	45	555.00	2026-02-02 00:48:22.780825+03	t
eb1e0550-7438-4353-8b10-1e290989d65c	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	b047ca55-f768-420f-a290-3eaa847b3b8a	45	290.00	2026-02-02 00:48:22.780825+03	t
6f5d0272-6ea9-41c2-b606-f14b45548637	6baba140-5ba8-4787-b162-dd2240590cb4	9f461413-b0cc-4289-94ab-db938c540af0	45	555.00	2026-02-02 00:48:22.780825+03	t
e70e5069-58f4-4b29-b77f-346c143324f6	6baba140-5ba8-4787-b162-dd2240590cb4	eaf0f76d-ed44-4648-80e1-0f45ede54f35	45	280.00	2026-02-02 00:48:22.780825+03	t
73b58090-6b66-4701-9833-6e2cbd2a9dc8	6baba140-5ba8-4787-b162-dd2240590cb4	7c74c7f7-b6cb-4ae8-8d2c-cbff18db6d13	45	576.00	2026-02-02 00:48:22.780825+03	t
2e0dd445-2ede-49ed-a9ba-38a7133bde21	6baba140-5ba8-4787-b162-dd2240590cb4	3d8e4700-b05e-4e7c-b0a4-20e37a7d2edc	45	339.00	2026-02-02 00:48:22.780825+03	t
8007ccf3-fb26-428e-8159-e8d88112f095	6baba140-5ba8-4787-b162-dd2240590cb4	eb803ec9-47b9-41a6-badc-2acc91684276	45	331.00	2026-02-02 00:48:22.780825+03	t
\.


--
-- Data for Name: salon_sub_merchants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salon_sub_merchants (id, salon_id, iyzico_sub_merchant_key, iban, bank_name, account_owner, sub_merchant_type, status, created_at, updated_at) FROM stdin;
bfc7b1e4-f687-4cc5-9caf-d152248dbe99	c3a9a289-7cd1-486e-85f0-bae432be5b10	\N	TR			PERSONAL	PENDING	2026-02-25 17:44:38.396818+03	2026-02-25 17:44:38.396818+03
17871d16-2a1f-48fd-a652-a27d780c2e84	79d98947-715d-4d34-904f-8f5ee4c8d958	\N	TR			PERSONAL	PENDING	2026-02-25 17:44:38.396818+03	2026-02-25 17:44:38.396818+03
f70ed453-993c-4386-aa49-47ddc5843db9	10943547-c356-4360-9946-f7773b72fcca	\N	TR			PERSONAL	PENDING	2026-02-25 17:44:38.396818+03	2026-02-25 17:44:38.396818+03
66482a34-2ce7-407d-8110-8d9a0423a40a	8789002f-0c17-462f-9047-a72e804cc7a1	\N	TR			PERSONAL	PENDING	2026-02-25 17:44:38.396818+03	2026-02-25 17:44:38.396818+03
d8649105-e57f-483e-a7fb-b74f5b6f34d9	a9bbcc20-be59-44ed-a47f-40762e7621b6	\N	TR			PERSONAL	PENDING	2026-02-25 17:44:38.396818+03	2026-02-25 17:44:38.396818+03
9be8b050-fa8a-4472-b26a-7fb36ad44f56	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	\N	TR			PERSONAL	PENDING	2026-02-25 17:44:38.396818+03	2026-02-25 17:44:38.396818+03
b7d42b16-28b9-4326-baf0-ea45e23d7234	01a4dea4-dc91-4185-8acd-f61f26ab2525	\N	TR			PERSONAL	PENDING	2026-02-25 17:44:38.396818+03	2026-02-25 17:44:38.396818+03
37956ae7-977f-460b-965e-82a070cee78c	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	\N	TR			PERSONAL	PENDING	2026-02-25 17:44:38.396818+03	2026-02-25 17:44:38.396818+03
397d0e99-b60d-4f65-a902-3b4786a33642	6baba140-5ba8-4787-b162-dd2240590cb4	\N	TR			PERSONAL	PENDING	2026-02-25 17:44:38.396818+03	2026-02-25 17:44:38.396818+03
f802c78f-40a7-45bb-a63b-f43ddc27eada	3c25931a-ecb3-4d39-8d54-ccdbe7d0621c	\N	TR			PERSONAL	PENDING	2026-02-25 17:44:38.396818+03	2026-02-25 17:44:38.396818+03
71d918c3-f411-40c4-a206-f59344d74b8f	84108822-fef0-4b00-96a4-d214689755c7	\N	TR			PERSONAL	PENDING	2026-02-25 17:44:38.396818+03	2026-02-25 17:44:38.396818+03
\.


--
-- Data for Name: salon_type_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salon_type_categories (id, salon_type_id, category_id, created_at) FROM stdin;
c1732fc7-57e5-49bd-8a3a-5cfc48143143	b8155bd7-8d8b-426c-ad37-5236d0a0b35b	9c3c0fa4-2c53-418d-b067-3717205a3eba	2026-02-01 19:24:53.803459+03
f4f4e0f3-7d9b-4c6a-84ac-e701c27f4d6c	b8155bd7-8d8b-426c-ad37-5236d0a0b35b	59eff69c-77fd-47df-8c35-dfc194885bd4	2026-02-01 19:24:53.803459+03
ed24665a-069e-497a-abfa-61f9eae55a84	99420413-7194-4000-90a6-051bd93e5ef1	59eff69c-77fd-47df-8c35-dfc194885bd4	2026-02-01 19:24:53.803459+03
173436a4-0027-47fe-9c44-4d5759065512	99420413-7194-4000-90a6-051bd93e5ef1	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	2026-02-01 19:24:53.803459+03
a3b83953-8637-4a03-aa53-478e3e2c3091	99420413-7194-4000-90a6-051bd93e5ef1	420dad0e-9f9f-4883-9f63-f26262a410ee	2026-02-01 19:24:53.803459+03
caa10e6b-e4e5-4160-916a-95d900934ed4	7f1792aa-27bd-4f0a-9fe0-bd7212c54bfd	59eff69c-77fd-47df-8c35-dfc194885bd4	2026-02-01 19:24:53.803459+03
3b861ba4-3ad8-492f-bf6b-f515925ace18	7f1792aa-27bd-4f0a-9fe0-bd7212c54bfd	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	2026-02-01 19:24:53.803459+03
b3bd0223-ee3e-4b6b-a30a-52deec097a36	7f1792aa-27bd-4f0a-9fe0-bd7212c54bfd	420dad0e-9f9f-4883-9f63-f26262a410ee	2026-02-01 19:24:53.803459+03
22f1d716-82c1-44de-b760-12d1891ffa87	7f1792aa-27bd-4f0a-9fe0-bd7212c54bfd	ee10018d-9979-4822-8d82-9e729c40cd5e	2026-02-01 19:24:53.803459+03
7215089b-356d-4d14-bed6-41ae86c1eaaa	7f1792aa-27bd-4f0a-9fe0-bd7212c54bfd	acc90202-7188-4c0c-9ba5-fe2016674750	2026-02-01 19:24:53.803459+03
89f0cc69-a2a6-4c30-af95-4569c5a7e58d	7f1792aa-27bd-4f0a-9fe0-bd7212c54bfd	13e9cd7b-1f8d-468f-8674-623247a63d19	2026-02-01 19:24:53.803459+03
4614e22c-87a1-4d20-b138-f53b5d8293a3	ee06ac35-85d8-4c8a-9b69-ec3e356943ff	6f1da914-a80f-4a4b-9990-f21fbe1bbd25	2026-02-01 19:24:53.803459+03
396bcebf-da55-4a1e-8180-84990554b689	fed4ed37-b509-4b2c-a2b3-04c35487b9bb	420dad0e-9f9f-4883-9f63-f26262a410ee	2026-02-01 19:24:53.803459+03
6834bb68-7680-4a79-aa08-171f8780ae9d	2cb7ddd1-9f4f-4202-ac19-7ce0f2202bdd	d1820b84-eadb-4e81-a148-6608ccb63407	2026-02-01 19:24:53.803459+03
258cbec4-dfe4-451c-a1d9-80c842c0e8fb	2cb7ddd1-9f4f-4202-ac19-7ce0f2202bdd	13e9cd7b-1f8d-468f-8674-623247a63d19	2026-02-01 19:24:53.803459+03
14b0ef69-577e-425a-8c5f-ad67929f4e0d	9920c246-56e3-40dd-af19-e528eb98ac45	13e9cd7b-1f8d-468f-8674-623247a63d19	2026-02-01 19:24:53.803459+03
\.


--
-- Data for Name: salon_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salon_types (id, name, slug, icon, created_at, image) FROM stdin;
99420413-7194-4000-90a6-051bd93e5ef1	Kuaför Salonları	kuafor	content_cut	2026-01-02 19:44:57.403015+03	https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=800&auto=format&fit=crop
b8155bd7-8d8b-426c-ad37-5236d0a0b35b	Berber Salonları	berber	face	2026-01-02 19:44:57.403015+03	https://images.unsplash.com/photo-1503951914875-452162b7f304?q=80&w=800&auto=format&fit=crop
7f1792aa-27bd-4f0a-9fe0-bd7212c54bfd	Güzellik Merkezleri	guzellik	spa	2026-01-02 19:44:57.403015+03	https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop
2cb7ddd1-9f4f-4202-ac19-7ce0f2202bdd	Masaj ve Spa	spa	spa	2026-01-02 19:44:57.403015+03	https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop
ee06ac35-85d8-4c8a-9b69-ec3e356943ff	Makyaj Stüdyoları	makyaj	palette	2026-01-02 19:44:57.403015+03	https://images.unsplash.com/photo-1487412947132-26c25fc496a7?q=80&w=800&auto=format&fit=crop
fed4ed37-b509-4b2c-a2b3-04c35487b9bb	Tırnak Tasarım	tirnak	brush	2026-01-02 19:44:57.403015+03	https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop
1de901e2-13a2-488a-9e51-9eebbc4c701b	Fizyoterapi	terapi	monitor_heart	2026-01-02 19:44:57.403015+03	https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop
9920c246-56e3-40dd-af19-e528eb98ac45	Solaryum	solaryum	light_mode	2026-01-02 19:44:57.403015+03	https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=800&auto=format&fit=crop
b3e11b4b-e23d-44e5-9133-8d3bc3bec40e	Dövme Stüdyoları	dovme	draw	2026-01-02 19:44:57.403015+03	https://images.unsplash.com/photo-1565551332972-76fa2a63273e?q=80&w=800&auto=format&fit=crop
\.


--
-- Data for Name: salon_working_hours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salon_working_hours (id, salon_id, day_of_week, start_time, end_time, is_closed, created_at) FROM stdin;
fc46aec9-0619-4419-b198-4db5d62d8b43	c3a9a289-7cd1-486e-85f0-bae432be5b10	1	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
2baf9a4e-f425-4c11-bff6-cc21dc40d5bc	c3a9a289-7cd1-486e-85f0-bae432be5b10	2	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
4b4ad5c9-a9ce-4305-b74e-ab630795f852	c3a9a289-7cd1-486e-85f0-bae432be5b10	3	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
a44d94d0-f273-4149-b954-21baad31ba85	c3a9a289-7cd1-486e-85f0-bae432be5b10	4	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
96a2b43d-5af0-46db-9872-c5e6040641e0	c3a9a289-7cd1-486e-85f0-bae432be5b10	5	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
d4e5aa23-9535-459e-bab0-c65ec247e64f	c3a9a289-7cd1-486e-85f0-bae432be5b10	6	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
cc4c2dbb-dc77-4d30-b639-d4fea985beeb	79d98947-715d-4d34-904f-8f5ee4c8d958	1	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
d9df49d6-c600-40ad-93df-86b0539d1046	79d98947-715d-4d34-904f-8f5ee4c8d958	2	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
08c24e6e-880e-4924-a153-83e4bec9f356	79d98947-715d-4d34-904f-8f5ee4c8d958	3	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
466b71f9-a9f4-4d74-91d7-e24b0dc82d24	79d98947-715d-4d34-904f-8f5ee4c8d958	4	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
e02ff252-39e9-415a-8cfc-063edcba9210	79d98947-715d-4d34-904f-8f5ee4c8d958	5	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
340a2db3-7412-44ab-aab7-dcf401161455	79d98947-715d-4d34-904f-8f5ee4c8d958	6	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
3dec6c90-5d71-4fbd-9672-0336c7e670ce	10943547-c356-4360-9946-f7773b72fcca	1	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
14e5d006-2573-4782-8fcb-0beade7f5755	10943547-c356-4360-9946-f7773b72fcca	2	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
fd511f11-9bea-4e3b-ac46-09cb8a52614a	10943547-c356-4360-9946-f7773b72fcca	3	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
4fc6cc50-020d-4c05-a6c6-042a7e89ff55	10943547-c356-4360-9946-f7773b72fcca	4	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
c1497fe2-0692-485f-bee6-cae5a830dfa3	10943547-c356-4360-9946-f7773b72fcca	5	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
51af0c8a-549f-4354-a03e-76f3c634c761	10943547-c356-4360-9946-f7773b72fcca	6	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
49fbf988-60a7-49f7-852d-312b1de841cf	8789002f-0c17-462f-9047-a72e804cc7a1	1	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
2b63ff10-771e-47e5-84c9-f143ccd067d5	8789002f-0c17-462f-9047-a72e804cc7a1	2	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
e22c95a2-c3b5-4f46-8490-80ac299f9df6	8789002f-0c17-462f-9047-a72e804cc7a1	3	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
acf66eac-60fd-4f85-90a4-37e798b9a48b	8789002f-0c17-462f-9047-a72e804cc7a1	4	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
87783807-d33c-4e04-bd42-1d66c2940167	8789002f-0c17-462f-9047-a72e804cc7a1	5	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
72da27ac-72cd-485b-bc52-871053613e74	8789002f-0c17-462f-9047-a72e804cc7a1	6	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
c931e143-483d-4d41-8f0e-dd96b8f1e3ff	a9bbcc20-be59-44ed-a47f-40762e7621b6	1	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
27b4c963-ed2b-4d8e-bae3-75ec0e78c616	a9bbcc20-be59-44ed-a47f-40762e7621b6	2	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
ca5667ea-da75-481d-94ca-17d1dbd314c1	a9bbcc20-be59-44ed-a47f-40762e7621b6	3	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
0e2dcd58-2598-4765-99f5-77a6f2e22dbb	a9bbcc20-be59-44ed-a47f-40762e7621b6	4	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
6acac902-869e-4f55-91e6-a17e4022a7c9	a9bbcc20-be59-44ed-a47f-40762e7621b6	5	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
b0176b4d-b0ff-4a15-90f6-d64c531d74ef	a9bbcc20-be59-44ed-a47f-40762e7621b6	6	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
fc696f38-5c1d-47cd-b8cd-1bace4a912e1	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	1	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
db9a4ff8-5f36-46c8-b4df-94879be6c4c9	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	2	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
f3d64f83-0081-4fd0-9af9-b223f769c7ee	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	3	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
b8a2457d-d3bc-4e61-82a8-a126d12400d5	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	4	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
f00afdb7-04a6-45da-b68c-388f00b0e247	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	5	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
1c503502-6f7c-4cf0-bae4-1a6885a33b80	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	6	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
b8034bf1-beab-4b56-b16f-df8aeba14832	01a4dea4-dc91-4185-8acd-f61f26ab2525	1	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
f761508e-1402-441e-a055-234c3125a36d	01a4dea4-dc91-4185-8acd-f61f26ab2525	2	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
ee613c4b-66d9-423d-972e-38a0a6f8dbbb	01a4dea4-dc91-4185-8acd-f61f26ab2525	3	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
485ca681-2e66-45f3-8188-e465418aee4e	01a4dea4-dc91-4185-8acd-f61f26ab2525	4	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
2b50cdb8-5865-4bea-9adf-55e158bd1973	01a4dea4-dc91-4185-8acd-f61f26ab2525	5	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
e063546b-cb52-4c5a-9a9c-d79753449038	01a4dea4-dc91-4185-8acd-f61f26ab2525	6	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
59b56d2c-d896-4beb-8281-0fa2b716a21c	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	1	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
5e77d27f-61de-458e-909d-973fa6f44e8a	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	2	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
4eacf342-ac13-4102-9a80-1b0d11ac3891	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	3	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
0e0d8f86-699c-4911-b914-05a46a0a400e	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	4	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
524ec7cd-a7ef-49bd-a59a-65a2606b4a28	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	5	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
64a913ad-c8eb-4e96-a5a1-7af62fe3450a	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	6	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
aa5acc22-d64a-4a41-af6a-526b7ea3ba4c	6baba140-5ba8-4787-b162-dd2240590cb4	1	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
f6cbfdfb-f3cf-49e1-9b96-7cd6ef6b0286	6baba140-5ba8-4787-b162-dd2240590cb4	2	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
69cd46e4-a09b-4046-b07d-747b6db99909	6baba140-5ba8-4787-b162-dd2240590cb4	3	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
6e93c243-9901-4e92-9575-dd9f1e47c237	6baba140-5ba8-4787-b162-dd2240590cb4	4	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
48c81d18-efc5-4814-82f7-0430ee845297	6baba140-5ba8-4787-b162-dd2240590cb4	5	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
fa1ae87d-94ee-4e85-a38e-ba5b79e787f4	6baba140-5ba8-4787-b162-dd2240590cb4	6	09:00:00	19:00:00	f	2026-02-02 00:48:22.780825+03
\.


--
-- Data for Name: salons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.salons (id, owner_id, name, city_id, district_id, type_id, address, phone, geo_latitude, geo_longitude, image, is_sponsored, created_at, updated_at, description, features, status, rejected_reason, neighborhood, street, building_no, apartment_no, avenue, postal_code, primary_color, logo_url, banner_url, is_closed, slug, min_price, plan, tags, review_count, rating) FROM stdin;
c3a9a289-7cd1-486e-85f0-bae432be5b10	1275f9b6-9e9b-4fcb-909b-7ac1532a350b	Stil Kuaför	01cf7a28-5f36-462e-8016-1fecb08baf06	0806f019-6ef6-4911-a335-87a3934ff44d	99420413-7194-4000-90a6-051bd93e5ef1	Bahariye Caddesi No: 45, Kadıköy, İstanbul	02161234567	40.98750000	29.02450000	https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop	t	2026-02-02 00:48:22.780825+03	2026-02-25 00:06:55.50925+03	İstanbul'un en köklü kuaförlerinden biri olarak, modern saç tasarımları ve profesyonel renklendirme hizmetleri sunuyoruz.	["Wi-Fi", "İkram", "Kredi Kartı", "Klima"]	APPROVED	\N	\N	\N	\N	\N	\N	\N	#CFA76D	\N	\N	f	\N	138.00	STARTER	{}	0	0
79d98947-715d-4d34-904f-8f5ee4c8d958	92242964-46e0-4867-9737-cfc728dd375b	Elit Berber Salonu	01cf7a28-5f36-462e-8016-1fecb08baf06	11575b42-0f40-412d-bb6a-f027c8307839	b8155bd7-8d8b-426c-ad37-5236d0a0b35b	Halaskargazi Caddesi No: 123, Şişli, İstanbul	02122345678	41.06020000	28.98690000	https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop	f	2026-02-02 00:48:22.780825+03	2026-02-25 00:06:55.50925+03	Geleneksel berber kültürünü modern spa deneyimiyle birleştiriyoruz. Sadece bir tıraş değil, kendinizi yenileyeceğiniz bir mola.	["Wi-Fi", "Otopark", "İkram", "Kredi Kartı"]	APPROVED	\N	\N	\N	\N	\N	\N	\N	#CFA76D	\N	\N	f	\N	195.00	STARTER	{}	0	0
10943547-c356-4360-9946-f7773b72fcca	fe908fc7-4b40-4482-b2f2-c0d57fd97aa5	Güzellik Merkezi Luna	01cf7a28-5f36-462e-8016-1fecb08baf06	10c53a19-fb58-42d4-a093-31850b48d9aa	7f1792aa-27bd-4f0a-9fe0-bd7212c54bfd	Barbaros Bulvarı No: 78, Beşiktaş, İstanbul	02123456789	41.04220000	29.00780000	https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?q=80&w=800&auto=format&fit=crop	t	2026-02-02 00:48:22.780825+03	2026-02-25 00:06:55.50925+03	Cilt bakımı, lazer epilasyon ve zayıflama ünitelerimizle, güzelliğinize bilimsel dokunuşlar yapıyoruz.	["Özel Oda", "Valet", "Wi-Fi", "Kredi Kartı"]	APPROVED	\N	\N	\N	\N	\N	\N	\N	#CFA76D	\N	\N	f	\N	103.00	STARTER	{}	0	0
8789002f-0c17-462f-9047-a72e804cc7a1	c5c287f9-9564-4998-9b53-8513ae013d14	Zen Spa & Wellness	01cf7a28-5f36-462e-8016-1fecb08baf06	10c53a19-fb58-42d4-a093-31850b48d9aa	2cb7ddd1-9f4f-4202-ac19-7ce0f2202bdd	Nişantaşı Mahallesi, Vali Konağı Caddesi No: 12, İstanbul	02124567890	41.04510000	28.99340000	https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop	f	2026-02-02 00:48:22.780825+03	2026-02-25 00:06:55.50925+03	Şehrin gürültüsünden uzaklaşın. Profesyonel masaj terapilerimizle ruhunuzu ve bedeninizi dinlendirin.	["Havuz", "Sauna", "Wi-Fi", "Otopark"]	APPROVED	\N	\N	\N	\N	\N	\N	\N	#CFA76D	\N	\N	f	\N	147.00	STARTER	{}	0	0
a9bbcc20-be59-44ed-a47f-40762e7621b6	258280de-707a-4d75-b0e7-89869cc55b6c	Makyaj Atölyesi Derya	01cf7a28-5f36-462e-8016-1fecb08baf06	0806f019-6ef6-4911-a335-87a3934ff44d	ee06ac35-85d8-4c8a-9b69-ec3e356943ff	Moda Caddesi No: 89, Kadıköy, İstanbul	02165678901	40.98760000	29.02890000	https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=800&auto=format&fit=crop	f	2026-02-02 00:48:22.780825+03	2026-02-25 00:06:55.50925+03	Özel günlerinizde en doğal ve etkileyici makyaj tasarımları için uzman kadromuzla yanınızdayız.	["Wi-Fi", "İkram", "Kredi Kartı"]	APPROVED	\N	\N	\N	\N	\N	\N	\N	#CFA76D	\N	\N	f	\N	289.00	STARTER	{}	0	0
d20f5cf0-cadb-491d-ab2e-e11f75af16a7	1275f9b6-9e9b-4fcb-909b-7ac1532a350b	Ankara Kuaför Evi	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	51fd2cb0-e9f2-40b0-b029-7cf0768552ba	99420413-7194-4000-90a6-051bd93e5ef1	Tunalı Hilmi Caddesi No: 56, Çankaya, Ankara	03121234567	39.91800000	32.85490000	https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800&auto=format&fit=crop	f	2026-02-02 00:48:22.780825+03	2026-02-25 00:06:55.50925+03	Ankara'nın merkezinde, en yeni trendleri takip eden enerjik ekibimizle hizmetinizdeyiz.	["Wi-Fi", "Kredi Kartı", "Hafta Sonu Açık"]	APPROVED	\N	\N	\N	\N	\N	\N	\N	#CFA76D	\N	\N	f	\N	138.00	STARTER	{}	0	0
01a4dea4-dc91-4185-8acd-f61f26ab2525	92242964-46e0-4867-9737-cfc728dd375b	Başkent Berber	44fcce9d-fdbc-45c0-899a-b5c65a0667f3	51fd2cb0-e9f2-40b0-b029-7cf0768552ba	b8155bd7-8d8b-426c-ad37-5236d0a0b35b	Kızılay Meydanı No: 34, Çankaya, Ankara	03122345678	39.91920000	32.85430000	https://images.unsplash.com/photo-1503951914875-452162b7f304?q=80&w=800&auto=format&fit=crop	t	2026-02-02 00:48:22.780825+03	2026-02-25 00:06:55.50925+03	Klasik berber hizmetlerinin yanı sıra cilt bakımı ve saç terapileri ile Ankara erkeklerinin tercihi.	["İkram", "Wi-Fi", "Kredi Kartı", "TV"]	APPROVED	\N	\N	\N	\N	\N	\N	\N	#CFA76D	\N	\N	f	\N	148.00	STARTER	{}	0	0
df1c1f10-f0cd-4e43-8332-2c2cadb6d372	fe908fc7-4b40-4482-b2f2-c0d57fd97aa5	İzmir Güzellik Salonu	422ddccc-6602-4215-9e78-d6c577bff092	a94c6909-cfc0-49e0-8345-f9382b1dbd0a	7f1792aa-27bd-4f0a-9fe0-bd7212c54bfd	Alsancak Mahallesi, Kıbrıs Şehitleri Caddesi No: 145, İzmir	02321234567	38.43660000	27.14610000	https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop	f	2026-02-02 00:48:22.780825+03	2026-02-25 00:06:55.50925+03	Alsancak'ın kalbinde, her zaman en kaliteli ürünleri kullanarak cildinize değer veriyoruz.	["Klima", "Wi-Fi", "İkram", "Kredi Kartı"]	APPROVED	\N	\N	\N	\N	\N	\N	\N	#CFA76D	\N	\N	f	\N	123.00	STARTER	{}	0	0
6baba140-5ba8-4787-b162-dd2240590cb4	c5c287f9-9564-4998-9b53-8513ae013d14	Ege Spa Center	422ddccc-6602-4215-9e78-d6c577bff092	a94c6909-cfc0-49e0-8345-f9382b1dbd0a	2cb7ddd1-9f4f-4202-ac19-7ce0f2202bdd	Kordon Boyu No: 234, Konak, İzmir	02322345678	38.41920000	27.12870000	https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop	t	2026-02-02 00:48:22.780825+03	2026-02-25 00:06:55.50925+03	Ege'nin esintisini masaj odalarımıza getirdik. Uzman terapistlerimizle günün stresinden kurtulun.	["Deniz Manzaralı", "İkram", "Wi-Fi", "Vale"]	APPROVED	\N	\N	\N	\N	\N	\N	\N	#CFA76D	\N	\N	f	\N	280.00	STARTER	{}	0	0
3c25931a-ecb3-4d39-8d54-ccdbe7d0621c	8feb244e-05c7-48c7-9768-8793a0e56c3a	Caner Beauty Center	01cf7a28-5f36-462e-8016-1fecb08baf06	e707bb69-e76a-4942-af03-dd4b39a99e9e	b8155bd7-8d8b-426c-ad37-5236d0a0b35b	Kadıköy	02322345678	40.93175254	29.13375724	https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop	f	2026-02-02 01:04:15.694783+03	2026-02-25 00:06:55.50925+03	sa	[]	SUBMITTED	\N	Zümrütevlet				Karaca	\N	#CFA76D	\N	\N	f	\N	\N	STARTER	{}	0	0
84108822-fef0-4b00-96a4-d214689755c7	8feb244e-05c7-48c7-9768-8793a0e56c3a	Candan Beauty Center	2b582c7e-15d9-4e26-9300-a424557488ec	6dcfea95-4191-4811-898b-a1f5f16d8039	1de901e2-13a2-488a-9e51-9eebbc4c701b	Kadıköy	02322345678	40.05029280	30.38484550	https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop	f	2026-02-02 01:05:54.844852+03	2026-02-25 00:06:55.50925+03	s	[]	APPROVED	\N						\N	#CFA76D	\N	\N	f	\N	\N	STARTER	{}	0	0
\.


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_categories (id, name, slug, icon, created_at) FROM stdin;
59eff69c-77fd-47df-8c35-dfc194885bd4	Saç	sac	content_cut	2026-01-02 19:44:57.427249+03
420dad0e-9f9f-4883-9f63-f26262a410ee	Tırnak	tirnak	brush	2026-01-02 19:44:57.427249+03
6f1da914-a80f-4a4b-9990-f21fbe1bbd25	Makyaj ve Bakış Tasarımı	makyaj	face	2026-01-02 19:44:57.427249+03
13e9cd7b-1f8d-468f-8674-623247a63d19	Vücut Bakımı ve Solaryum	vucut	accessibility_new	2026-01-02 19:44:57.427249+03
ee10018d-9979-4822-8d82-9e729c40cd5e	Lazer Epilasyon	lazer	flash_on	2026-01-02 19:44:57.427249+03
9c3c0fa4-2c53-418d-b067-3717205a3eba	Erkek Bakımı	erkek	face_retouching_natural	2026-01-02 19:44:57.427249+03
d1820b84-eadb-4e81-a148-6608ccb63407	Masaj ve Spa	masaj	spa	2026-01-02 19:44:57.427249+03
acc90202-7188-4c0c-9ba5-fe2016674750	Yüz ve Cilt Bakımı	cilt	clean_hands	2026-01-02 19:44:57.427249+03
\.


--
-- Data for Name: sms_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sms_verifications (id, user_id, phone, verified_at, iys_registered, iys_registered_at, consent_given, created_at) FROM stdin;
759e8b36-0170-409c-b47c-6e2debe3c37e	743cd2aa-3ce6-4e49-8120-7c45e021e411	+905324565577	2026-01-25 00:15:53.715+03	f	\N	t	2026-01-25 00:15:53.720267+03
9dcfd3f8-7025-4c00-9d79-def159f86593	aa084b47-7c37-43ee-8901-75bdb1cdcb68	+905324443322	2026-01-25 00:22:44.388+03	f	\N	t	2026-01-25 00:22:44.393308+03
c7205415-b3a1-48e8-b459-4b2196472abc	a7f8376d-d486-49aa-8fd5-9202c47e9145	+905432346677	2026-01-25 00:27:41.87+03	f	\N	t	2026-01-25 00:27:41.872812+03
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff (id, salon_id, user_id, name, photo, specialty, is_active, created_at, bio, rating, review_count) FROM stdin;
e7331330-f896-44b5-ac7a-8daf0d26a11e	c3a9a289-7cd1-486e-85f0-bae432be5b10	\N	Ahmet Yurt	https://i.pravatar.cc/150?u=c3a9a289-7cd1-486e-85f0-bae432be5b10	Boya	t	2026-02-02 00:48:22.780825+03	\N	0	0
4498b709-14ef-4c9b-9179-a3eea08c5ddb	c3a9a289-7cd1-486e-85f0-bae432be5b10	\N	Melis Su	https://i.pravatar.cc/150?u=c3a9a289-7cd1-486e-85f0-bae432be5b10	Masaj	t	2026-02-02 00:48:22.780825+03	\N	0	0
eaefe398-bcec-49d1-ad53-5f852aaf9476	c3a9a289-7cd1-486e-85f0-bae432be5b10	\N	Elif Güneş	https://i.pravatar.cc/150?u=c3a9a289-7cd1-486e-85f0-bae432be5b10	Boya	t	2026-02-02 00:48:22.780825+03	\N	0	0
b31b4974-7180-4521-9fd9-1c6c24085831	79d98947-715d-4d34-904f-8f5ee4c8d958	\N	Ayşe Koç	https://i.pravatar.cc/150?u=79d98947-715d-4d34-904f-8f5ee4c8d958	Manikür	t	2026-02-02 00:48:22.780825+03	\N	0	0
d9fd13e4-d782-4aba-9ee0-db83f27faa60	79d98947-715d-4d34-904f-8f5ee4c8d958	\N	Canan Can	https://i.pravatar.cc/150?u=79d98947-715d-4d34-904f-8f5ee4c8d958	Masaj	t	2026-02-02 00:48:22.780825+03	\N	0	0
c1c2e2e3-b41b-4f25-8494-9e4791d66573	79d98947-715d-4d34-904f-8f5ee4c8d958	\N	Zeynep Aksoy	https://i.pravatar.cc/150?u=79d98947-715d-4d34-904f-8f5ee4c8d958	Saç Kesimi	t	2026-02-02 00:48:22.780825+03	\N	0	0
e7be072f-c135-4a12-98b4-71ee53f66d9e	10943547-c356-4360-9946-f7773b72fcca	\N	Fatma Demir	https://i.pravatar.cc/150?u=10943547-c356-4360-9946-f7773b72fcca	Manikür	t	2026-02-02 00:48:22.780825+03	\N	0	0
2cf3f880-7313-4129-ab9b-b8a388a63f9e	10943547-c356-4360-9946-f7773b72fcca	\N	Ali Yılmaz	https://i.pravatar.cc/150?u=10943547-c356-4360-9946-f7773b72fcca	Masaj	t	2026-02-02 00:48:22.780825+03	\N	0	0
215a2740-ef55-4922-9082-5e0389f657c4	10943547-c356-4360-9946-f7773b72fcca	\N	Ahmet Yurt	https://i.pravatar.cc/150?u=10943547-c356-4360-9946-f7773b72fcca	Pedikür	t	2026-02-02 00:48:22.780825+03	\N	0	0
602983c2-5cd9-46d1-9448-4bd9e9e31fcd	8789002f-0c17-462f-9047-a72e804cc7a1	\N	Ahmet Yurt	https://i.pravatar.cc/150?u=8789002f-0c17-462f-9047-a72e804cc7a1	Pedikür	t	2026-02-02 00:48:22.780825+03	\N	0	0
48a58cb5-2bdd-488a-a666-f338bb81227b	8789002f-0c17-462f-9047-a72e804cc7a1	\N	Melis Su	https://i.pravatar.cc/150?u=8789002f-0c17-462f-9047-a72e804cc7a1	Cilt Bakımı	t	2026-02-02 00:48:22.780825+03	\N	0	0
70d7645c-f969-4b73-b8f6-a4b0752c7c18	8789002f-0c17-462f-9047-a72e804cc7a1	\N	Zeynep Aksoy	https://i.pravatar.cc/150?u=8789002f-0c17-462f-9047-a72e804cc7a1	Boya	t	2026-02-02 00:48:22.780825+03	\N	0	0
6d5c48bb-47f5-4ddd-ad83-b4aace1d05f9	a9bbcc20-be59-44ed-a47f-40762e7621b6	\N	Ali Yılmaz	https://i.pravatar.cc/150?u=a9bbcc20-be59-44ed-a47f-40762e7621b6	Manikür	t	2026-02-02 00:48:22.780825+03	\N	0	0
da0b9ae4-672c-4755-ab91-8a7a5c6478c1	a9bbcc20-be59-44ed-a47f-40762e7621b6	\N	Mehmet Erdoğan	https://i.pravatar.cc/150?u=a9bbcc20-be59-44ed-a47f-40762e7621b6	Manikür	t	2026-02-02 00:48:22.780825+03	\N	0	0
f7364799-3d5f-45ef-81d8-2387ba7fbd9b	a9bbcc20-be59-44ed-a47f-40762e7621b6	\N	Elif Güneş	https://i.pravatar.cc/150?u=a9bbcc20-be59-44ed-a47f-40762e7621b6	Masaj	t	2026-02-02 00:48:22.780825+03	\N	0	0
3698e930-51d5-4b93-b480-60f3672c64b1	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	\N	Mehmet Erdoğan	https://i.pravatar.cc/150?u=d20f5cf0-cadb-491d-ab2e-e11f75af16a7	Saç Kesimi	t	2026-02-02 00:48:22.780825+03	\N	0	0
662f7206-b105-4a6a-8d35-93ead5f56ed8	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	\N	Ahmet Yurt	https://i.pravatar.cc/150?u=d20f5cf0-cadb-491d-ab2e-e11f75af16a7	Pedikür	t	2026-02-02 00:48:22.780825+03	\N	0	0
62a64a89-b514-4e0f-a5b5-1ee3f781dd64	d20f5cf0-cadb-491d-ab2e-e11f75af16a7	\N	Ahmet Yurt	https://i.pravatar.cc/150?u=d20f5cf0-cadb-491d-ab2e-e11f75af16a7	Boya	t	2026-02-02 00:48:22.780825+03	\N	0	0
ef6204fa-2037-4624-bcbd-1aa43386c35e	01a4dea4-dc91-4185-8acd-f61f26ab2525	\N	Fatma Demir	https://i.pravatar.cc/150?u=01a4dea4-dc91-4185-8acd-f61f26ab2525	Saç Kesimi	t	2026-02-02 00:48:22.780825+03	\N	0	0
f9fbe199-c45e-4bcf-9ffe-e269644ecef8	01a4dea4-dc91-4185-8acd-f61f26ab2525	\N	Ahmet Yurt	https://i.pravatar.cc/150?u=01a4dea4-dc91-4185-8acd-f61f26ab2525	Manikür	t	2026-02-02 00:48:22.780825+03	\N	0	0
8f937066-2973-4ef0-af45-59f88b96cfb9	01a4dea4-dc91-4185-8acd-f61f26ab2525	\N	Melis Su	https://i.pravatar.cc/150?u=01a4dea4-dc91-4185-8acd-f61f26ab2525	Boya	t	2026-02-02 00:48:22.780825+03	\N	0	0
b7b36e2c-3f41-47e9-b5ed-68b9986c51b5	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	\N	Ali Yılmaz	https://i.pravatar.cc/150?u=df1c1f10-f0cd-4e43-8332-2c2cadb6d372	Boya	t	2026-02-02 00:48:22.780825+03	\N	0	0
d7d2757d-d5ec-4af8-9caa-1f15da4fe506	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	\N	Ahmet Yurt	https://i.pravatar.cc/150?u=df1c1f10-f0cd-4e43-8332-2c2cadb6d372	Manikür	t	2026-02-02 00:48:22.780825+03	\N	0	0
0bb40b71-e6e2-4e46-b2d8-6c7fc62fd902	df1c1f10-f0cd-4e43-8332-2c2cadb6d372	\N	Canan Can	https://i.pravatar.cc/150?u=df1c1f10-f0cd-4e43-8332-2c2cadb6d372	Saç Kesimi	t	2026-02-02 00:48:22.780825+03	\N	0	0
45b3783d-f0b1-4304-86b0-b8111ddc741e	6baba140-5ba8-4787-b162-dd2240590cb4	\N	Ayşe Koç	https://i.pravatar.cc/150?u=6baba140-5ba8-4787-b162-dd2240590cb4	Manikür	t	2026-02-02 00:48:22.780825+03	\N	0	0
d9463e04-93e9-4186-b2bc-c951056b8baa	6baba140-5ba8-4787-b162-dd2240590cb4	\N	Zeynep Aksoy	https://i.pravatar.cc/150?u=6baba140-5ba8-4787-b162-dd2240590cb4	Saç Kesimi	t	2026-02-02 00:48:22.780825+03	\N	0	0
7eb8a82a-7096-4fc9-bb21-4637de0fa326	6baba140-5ba8-4787-b162-dd2240590cb4	\N	Fatma Demir	https://i.pravatar.cc/150?u=6baba140-5ba8-4787-b162-dd2240590cb4	Cilt Bakımı	t	2026-02-02 00:48:22.780825+03	\N	0	0
\.


--
-- Data for Name: staff_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_reviews (id, staff_id, salon_id, user_id, appointment_id, user_name, user_avatar, rating, comment, is_verified, created_at) FROM stdin;
\.


--
-- Data for Name: staff_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_services (id, salon_id, staff_id, salon_service_id, created_at) FROM stdin;
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscription_plans (id, name, display_name, description, price_monthly, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_excel_export, has_campaigns, has_sponsored, support_level, is_active, sort_order, created_at, price_yearly) FROM stdin;
7ddf172a-2947-43e7-b32d-a5197110f290	STARTER	Başlangıç	Sisteme harika bir başlangıç için temel özellikler	0	1	3	3	0	f	f	f	f	STANDARD	t	1	2026-02-25 00:06:55.50925+03	0
529080cb-108d-4e66-8f1a-d12b43f0961c	PRO	Pro	Tek şubeli, büyüyen butik salonlar için ideal	49900	1	5	30	250	t	f	f	f	STANDARD	t	2	2026-02-25 00:06:55.50925+03	499000
8a2db91f-306f-4cbe-af85-ed492636b104	BUSINESS	Business	Birden fazla şubesi olan ve ivme yakalayan markalar	74900	5	15	100	1000	t	f	t	f	PRIORITY	t	3	2026-02-25 00:13:19.767991+03	749000
eafa14da-27ca-4f5f-bb84-72170341085f	ELITE	Elite	Sınırsız güç ve platform üzerinde sponsorlu vitrin özelliği	99900	-1	-1	-1	5000	t	f	t	t	VIP	t	4	2026-02-25 00:06:55.50925+03	999000
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, salon_id, plan_id, status, iyzico_subscription_ref, payment_method, current_period_start, current_period_end, created_at, updated_at, billing_cycle) FROM stdin;
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_tickets (id, user_id, subject, message, status, created_at, updated_at, category) FROM stdin;
c47098ed-d097-47ef-a35c-22d5107eeb6e	f9821af5-3930-4a83-8de9-8d434e7155aa	Mobil Uygulama	Mobil uygulamanız ne zaman çıkacak?	OPEN	2026-01-13 22:34:08.235124+03	2026-01-13 22:34:08.235124+03	\N
2e12f5b1-db22-49dd-99b7-d54dce54a5e0	f9821af5-3930-4a83-8de9-8d434e7155aa	d	d	OPEN	2026-01-24 22:55:08.187882+03	2026-01-24 22:55:08.187882+03	BOOKING
6c0cc9be-0837-4aee-b8ba-826f6feb9ed2	5117fa0a-92ee-4c40-b273-a70d398523c8	x	x	RESOLVED	2026-01-25 01:05:01.901189+03	2026-01-25 01:18:11.679429+03	PAYMENT
\.


--
-- Data for Name: ticket_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_messages (id, ticket_id, sender_id, sender_role, content, created_at) FROM stdin;
7b974d42-57d2-4899-894c-143310bef0ac	2e12f5b1-db22-49dd-99b7-d54dce54a5e0	f9821af5-3930-4a83-8de9-8d434e7155aa	CUSTOMER	d	2026-01-24 22:55:08.298298+03
ed39d37b-fecb-49b1-ab7d-0571df64d76b	6c0cc9be-0837-4aee-b8ba-826f6feb9ed2	5117fa0a-92ee-4c40-b273-a70d398523c8	CUSTOMER	x	2026-01-25 01:05:01.970392+03
d6967118-4417-4a84-bced-15c9a90e56d0	6c0cc9be-0837-4aee-b8ba-826f6feb9ed2	5117fa0a-92ee-4c40-b273-a70d398523c8	CUSTOMER	naber	2026-01-25 01:10:13.276554+03
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, salon_id, customer_id, appointment_id, amount, currency, payment_method, payment_status, provider_transaction_id, commission_amount, notes, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_sessions (id, user_id, ip_address, user_agent, device_name, last_active_at, is_revoked, created_at) FROM stdin;
\.


--
-- Data for Name: working_hours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.working_hours (id, staff_id, day_of_week, start_time, end_time, is_day_off, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
avatars	avatars	\N	2026-01-25 23:35:38.189608+03	2026-01-25 23:35:38.189608+03	t	f	\N	\N	\N	STANDARD
salon-images	salon-images	\N	2026-01-25 23:35:48.231101+03	2026-01-25 23:35:48.231101+03	t	f	\N	\N	\N	STANDARD
staff-photos	staff-photos	\N	2026-01-25 23:35:57.447361+03	2026-01-25 23:35:57.447361+03	t	f	\N	\N	\N	STANDARD
system-assets	system-assets	\N	2026-01-25 23:36:06.571487+03	2026-01-25 23:36:06.571487+03	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.iceberg_namespaces (id, bucket_name, name, created_at, updated_at, metadata, catalog_id) FROM stdin;
\.


--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.iceberg_tables (id, namespace_id, bucket_name, name, location, created_at, updated_at, remote_table_id, shard_key, shard_id, catalog_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-01-02 16:44:22.738023
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-01-02 16:44:22.761738
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2026-01-02 16:44:22.770354
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-01-02 16:44:22.929141
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-01-02 16:44:23.067366
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-01-02 16:44:23.078354
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2026-01-02 16:44:23.106851
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-01-02 16:44:23.134302
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-01-02 16:44:23.164655
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2026-01-02 16:44:23.173775
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2026-01-02 16:44:23.188988
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-01-02 16:44:23.237402
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-01-02 16:44:23.260592
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-01-02 16:44:23.274085
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-01-02 16:44:23.288959
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-01-02 16:44:23.400111
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-01-02 16:44:23.416884
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-01-02 16:44:23.42939
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-01-02 16:44:23.444785
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-01-02 16:44:23.483038
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-01-02 16:44:23.500869
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-01-02 16:44:23.531492
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-01-02 16:44:23.658778
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-01-02 16:44:23.822598
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-01-02 16:44:23.834545
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-01-02 16:44:23.845225
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2026-01-02 16:44:23.867987
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2026-01-02 16:44:24.105406
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2026-01-02 16:44:24.263228
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2026-01-02 16:44:24.282628
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2026-01-02 16:44:24.305009
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2026-01-02 16:44:24.340378
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2026-01-02 16:44:24.373876
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2026-01-02 16:44:24.415116
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2026-01-02 16:44:24.420773
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2026-01-02 16:44:24.454485
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2026-01-02 16:44:24.463844
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-01-02 16:44:24.525458
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2026-01-02 16:44:24.541252
39	add-search-v2-sort-support	39cf7d1e6bf515f4b02e41237aba845a7b492853	2026-01-02 16:44:24.661139
40	fix-prefix-race-conditions-optimized	fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f	2026-01-02 16:44:24.675559
41	add-object-level-update-trigger	44c22478bf01744b2129efc480cd2edc9a7d60e9	2026-01-02 16:44:24.733273
42	rollback-prefix-triggers	f2ab4f526ab7f979541082992593938c05ee4b47	2026-01-02 16:44:24.751329
43	fix-object-level	ab837ad8f1c7d00cc0b7310e989a23388ff29fc6	2026-01-02 16:44:24.792517
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-01-02 16:44:24.800815
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-01-02 16:44:24.836826
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-01-02 16:44:24.937639
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-01-02 16:44:24.95029
48	iceberg-catalog-ids	2666dff93346e5d04e0a878416be1d5fec345d6f	2026-01-02 16:44:24.965801
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-01-02 16:44:25.390999
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 145, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: appointment_coupons appointment_coupons_appointment_id_coupon_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_coupons
    ADD CONSTRAINT appointment_coupons_appointment_id_coupon_id_key UNIQUE (appointment_id, coupon_id);


--
-- Name: appointment_coupons appointment_coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_coupons
    ADD CONSTRAINT appointment_coupons_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: change_requests change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_requests
    ADD CONSTRAINT change_requests_pkey PRIMARY KEY (id);


--
-- Name: cities cities_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_name_key UNIQUE (name);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: cities cities_plate_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_plate_code_key UNIQUE (plate_code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_salon_id_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_salon_id_code_key UNIQUE (salon_id, code);


--
-- Name: districts districts_city_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_city_id_name_key UNIQUE (city_id, name);


--
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_salon_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_salon_id_key UNIQUE (user_id, salon_id);


--
-- Name: global_services global_services_category_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_services
    ADD CONSTRAINT global_services_category_id_name_key UNIQUE (category_id, name);


--
-- Name: global_services global_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_services
    ADD CONSTRAINT global_services_pkey PRIMARY KEY (id);


--
-- Name: invites invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT invites_pkey PRIMARY KEY (id);


--
-- Name: invites invites_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT invites_token_key UNIQUE (token);


--
-- Name: iys_logs iys_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iys_logs
    ADD CONSTRAINT iys_logs_pkey PRIMARY KEY (id);


--
-- Name: iyzico_webhooks iyzico_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.iyzico_webhooks
    ADD CONSTRAINT iyzico_webhooks_pkey PRIMARY KEY (id);


--
-- Name: notification_queue notification_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_queue
    ADD CONSTRAINT notification_queue_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_slug_key UNIQUE (slug);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: otp_codes otp_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT otp_codes_pkey PRIMARY KEY (id);


--
-- Name: package_services package_services_package_id_salon_service_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_package_id_salon_service_id_key UNIQUE (package_id, salon_service_id);


--
-- Name: package_services package_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_pkey PRIMARY KEY (id);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (id);


--
-- Name: payment_history payment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (key);


--
-- Name: appointments prevent_staff_double_booking; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT prevent_staff_double_booking EXCLUDE USING gist (staff_id WITH =, tstzrange(start_time, end_time, '[)'::text) WITH &&);


--
-- Name: profiles profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: review_images review_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_images
    ADD CONSTRAINT review_images_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_appointment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_appointment_id_key UNIQUE (appointment_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: salon_assigned_types salon_assigned_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_assigned_types
    ADD CONSTRAINT salon_assigned_types_pkey PRIMARY KEY (id);


--
-- Name: salon_assigned_types salon_assigned_types_salon_id_type_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_assigned_types
    ADD CONSTRAINT salon_assigned_types_salon_id_type_id_key UNIQUE (salon_id, type_id);


--
-- Name: salon_gallery salon_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_gallery
    ADD CONSTRAINT salon_gallery_pkey PRIMARY KEY (id);


--
-- Name: salon_memberships salon_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_memberships
    ADD CONSTRAINT salon_memberships_pkey PRIMARY KEY (id);


--
-- Name: salon_memberships salon_memberships_user_id_salon_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_memberships
    ADD CONSTRAINT salon_memberships_user_id_salon_id_key UNIQUE (user_id, salon_id);


--
-- Name: salon_services salon_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_services
    ADD CONSTRAINT salon_services_pkey PRIMARY KEY (id);


--
-- Name: salon_services salon_services_salon_id_global_service_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_services
    ADD CONSTRAINT salon_services_salon_id_global_service_id_key UNIQUE (salon_id, global_service_id);


--
-- Name: salon_sub_merchants salon_sub_merchants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_sub_merchants
    ADD CONSTRAINT salon_sub_merchants_pkey PRIMARY KEY (id);


--
-- Name: salon_sub_merchants salon_sub_merchants_salon_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_sub_merchants
    ADD CONSTRAINT salon_sub_merchants_salon_id_key UNIQUE (salon_id);


--
-- Name: salon_type_categories salon_type_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_type_categories
    ADD CONSTRAINT salon_type_categories_pkey PRIMARY KEY (id);


--
-- Name: salon_type_categories salon_type_categories_salon_type_id_category_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_type_categories
    ADD CONSTRAINT salon_type_categories_salon_type_id_category_id_key UNIQUE (salon_type_id, category_id);


--
-- Name: salon_types salon_types_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_types
    ADD CONSTRAINT salon_types_name_key UNIQUE (name);


--
-- Name: salon_types salon_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_types
    ADD CONSTRAINT salon_types_pkey PRIMARY KEY (id);


--
-- Name: salon_types salon_types_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_types
    ADD CONSTRAINT salon_types_slug_key UNIQUE (slug);


--
-- Name: salon_working_hours salon_working_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_working_hours
    ADD CONSTRAINT salon_working_hours_pkey PRIMARY KEY (id);


--
-- Name: salon_working_hours salon_working_hours_salon_id_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_working_hours
    ADD CONSTRAINT salon_working_hours_salon_id_day_of_week_key UNIQUE (salon_id, day_of_week);


--
-- Name: salons salons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_pkey PRIMARY KEY (id);


--
-- Name: salons salons_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_slug_key UNIQUE (slug);


--
-- Name: service_categories service_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_name_key UNIQUE (name);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_slug_key UNIQUE (slug);


--
-- Name: sms_verifications sms_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_verifications
    ADD CONSTRAINT sms_verifications_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff_reviews staff_reviews_appointment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_reviews
    ADD CONSTRAINT staff_reviews_appointment_id_key UNIQUE (appointment_id);


--
-- Name: staff_reviews staff_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_reviews
    ADD CONSTRAINT staff_reviews_pkey PRIMARY KEY (id);


--
-- Name: staff_services staff_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_pkey PRIMARY KEY (id);


--
-- Name: staff_services staff_services_staff_id_salon_service_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_staff_id_salon_service_id_key UNIQUE (staff_id, salon_service_id);


--
-- Name: staff staff_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_user_id_key UNIQUE (user_id);


--
-- Name: subscription_plans subscription_plans_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_name_key UNIQUE (name);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_salon_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_salon_id_key UNIQUE (salon_id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: ticket_messages ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: reviews unique_review_per_appointment; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT unique_review_per_appointment UNIQUE (appointment_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: working_hours working_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.working_hours
    ADD CONSTRAINT working_hours_pkey PRIMARY KEY (id);


--
-- Name: working_hours working_hours_staff_id_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.working_hours
    ADD CONSTRAINT working_hours_staff_id_day_of_week_key UNIQUE (staff_id, day_of_week);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: iceberg_namespaces iceberg_namespaces_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_pkey PRIMARY KEY (id);


--
-- Name: iceberg_tables iceberg_tables_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_salon_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_salon_id ON public.audit_logs USING btree (salon_id);


--
-- Name: idx_iyzico_webhooks_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_iyzico_webhooks_created_at ON public.iyzico_webhooks USING btree (created_at DESC);


--
-- Name: idx_notification_queue_scheduled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_queue_scheduled ON public.notification_queue USING btree (scheduled_for) WHERE (status = 'PENDING'::public.notification_status);


--
-- Name: idx_notification_queue_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_queue_status ON public.notification_queue USING btree (status) WHERE (status = 'PENDING'::public.notification_status);


--
-- Name: idx_otp_cleanup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_cleanup ON public.otp_codes USING btree (expires_at) WHERE (used = false);


--
-- Name: idx_otp_phone_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_phone_expires ON public.otp_codes USING btree (phone, expires_at) WHERE (used = false);


--
-- Name: idx_salon_assigned_types_salon; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salon_assigned_types_salon ON public.salon_assigned_types USING btree (salon_id);


--
-- Name: idx_salons_city_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salons_city_id ON public.salons USING btree (city_id);


--
-- Name: idx_salons_district_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salons_district_id ON public.salons USING btree (district_id);


--
-- Name: idx_salons_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salons_slug ON public.salons USING btree (slug);


--
-- Name: idx_salons_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_salons_status ON public.salons USING btree (status);


--
-- Name: idx_sms_verifications_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sms_verifications_phone ON public.sms_verifications USING btree (phone);


--
-- Name: idx_sms_verifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sms_verifications_user_id ON public.sms_verifications USING btree (user_id);


--
-- Name: idx_staff_reviews_appointment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_reviews_appointment ON public.staff_reviews USING btree (appointment_id);


--
-- Name: idx_staff_reviews_staff_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_reviews_staff_id ON public.staff_reviews USING btree (staff_id);


--
-- Name: idx_staff_reviews_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_reviews_user_id ON public.staff_reviews USING btree (user_id);


--
-- Name: idx_staff_services_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_services_service ON public.staff_services USING btree (salon_service_id);


--
-- Name: idx_staff_services_staff; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_services_staff ON public.staff_services USING btree (staff_id);


--
-- Name: idx_user_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_iceberg_namespaces_bucket_id; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_iceberg_namespaces_bucket_id ON storage.iceberg_namespaces USING btree (catalog_id, name);


--
-- Name: idx_iceberg_tables_location; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_iceberg_tables_location ON storage.iceberg_tables USING btree (location);


--
-- Name: idx_iceberg_tables_namespace_id; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_iceberg_tables_namespace_id ON storage.iceberg_tables USING btree (catalog_id, namespace_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: salons on_salon_created_marketplace; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_salon_created_marketplace AFTER INSERT ON public.salons FOR EACH ROW EXECUTE FUNCTION public.handle_new_salon_marketplace();


--
-- Name: transactions set_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: subscriptions tr_auto_expire_subscription; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_auto_expire_subscription BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.auto_expire_on_access();


--
-- Name: salons tr_salon_created_membership; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_salon_created_membership AFTER INSERT ON public.salons FOR EACH ROW EXECUTE FUNCTION public.on_salon_created_add_membership();


--
-- Name: staff_reviews trg_staff_rating_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_staff_rating_update AFTER INSERT OR DELETE OR UPDATE ON public.staff_reviews FOR EACH ROW EXECUTE FUNCTION public.update_staff_rating();


--
-- Name: support_tickets trg_support_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_support_ticket_updated_at();


--
-- Name: appointments update_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: change_requests update_change_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_change_requests_updated_at BEFORE UPDATE ON public.change_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: salons update_salons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON public.salons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: appointment_coupons appointment_coupons_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_coupons
    ADD CONSTRAINT appointment_coupons_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointment_coupons appointment_coupons_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_coupons
    ADD CONSTRAINT appointment_coupons_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id);


--
-- Name: appointments appointments_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id);


--
-- Name: appointments appointments_salon_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_salon_service_id_fkey FOREIGN KEY (salon_service_id) REFERENCES public.salon_services(id);


--
-- Name: appointments appointments_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: audit_logs audit_logs_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: change_requests change_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_requests
    ADD CONSTRAINT change_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: change_requests change_requests_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.change_requests
    ADD CONSTRAINT change_requests_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE SET NULL;


--
-- Name: coupons coupons_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: districts districts_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: global_services global_services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.global_services
    ADD CONSTRAINT global_services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- Name: invites invites_inviter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT invites_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES auth.users(id);


--
-- Name: invites invites_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invites
    ADD CONSTRAINT invites_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: package_services package_services_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- Name: package_services package_services_salon_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_salon_service_id_fkey FOREIGN KEY (salon_service_id) REFERENCES public.salon_services(id) ON DELETE CASCADE;


--
-- Name: packages packages_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: payment_history payment_history_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- Name: payment_history payment_history_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: payment_history payment_history_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_default_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_default_city_id_fkey FOREIGN KEY (default_city_id) REFERENCES public.cities(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: review_images review_images_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_images
    ADD CONSTRAINT review_images_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: salon_assigned_types salon_assigned_types_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_assigned_types
    ADD CONSTRAINT salon_assigned_types_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: salon_assigned_types salon_assigned_types_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_assigned_types
    ADD CONSTRAINT salon_assigned_types_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.salon_types(id) ON DELETE CASCADE;


--
-- Name: salon_gallery salon_gallery_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_gallery
    ADD CONSTRAINT salon_gallery_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: salon_memberships salon_memberships_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_memberships
    ADD CONSTRAINT salon_memberships_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: salon_memberships salon_memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_memberships
    ADD CONSTRAINT salon_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: salon_services salon_services_global_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_services
    ADD CONSTRAINT salon_services_global_service_id_fkey FOREIGN KEY (global_service_id) REFERENCES public.global_services(id);


--
-- Name: salon_services salon_services_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_services
    ADD CONSTRAINT salon_services_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: salon_sub_merchants salon_sub_merchants_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_sub_merchants
    ADD CONSTRAINT salon_sub_merchants_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: salon_type_categories salon_type_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_type_categories
    ADD CONSTRAINT salon_type_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- Name: salon_type_categories salon_type_categories_salon_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_type_categories
    ADD CONSTRAINT salon_type_categories_salon_type_id_fkey FOREIGN KEY (salon_type_id) REFERENCES public.salon_types(id) ON DELETE CASCADE;


--
-- Name: salon_working_hours salon_working_hours_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salon_working_hours
    ADD CONSTRAINT salon_working_hours_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: salons salons_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: salons salons_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);


--
-- Name: salons salons_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);


--
-- Name: salons salons_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.salon_types(id);


--
-- Name: sms_verifications sms_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sms_verifications
    ADD CONSTRAINT sms_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: staff_reviews staff_reviews_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_reviews
    ADD CONSTRAINT staff_reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- Name: staff_reviews staff_reviews_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_reviews
    ADD CONSTRAINT staff_reviews_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: staff_reviews staff_reviews_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_reviews
    ADD CONSTRAINT staff_reviews_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: staff_reviews staff_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_reviews
    ADD CONSTRAINT staff_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: staff staff_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: staff_services staff_services_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: staff_services staff_services_salon_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_salon_service_id_fkey FOREIGN KEY (salon_service_id) REFERENCES public.salon_services(id) ON DELETE CASCADE;


--
-- Name: staff_services staff_services_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: staff staff_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: subscriptions subscriptions_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: ticket_messages ticket_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id);


--
-- Name: ticket_messages ticket_messages_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: transactions transactions_salon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_salon_id_fkey FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: working_hours working_hours_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.working_hours
    ADD CONSTRAINT working_hours_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- Name: iceberg_namespaces iceberg_namespaces_catalog_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_catalog_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_namespace_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_namespace_id_fkey FOREIGN KEY (namespace_id) REFERENCES storage.iceberg_namespaces(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_settings Admin can do everything on platform_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can do everything on platform_settings" ON public.platform_settings USING ((auth.uid() IN ( SELECT profiles.id
   FROM public.profiles
  WHERE (profiles.role = 'SUPER_ADMIN'::public.user_role))));


--
-- Name: salon_sub_merchants Admin can manage all sub-merchants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage all sub-merchants" ON public.salon_sub_merchants USING ((auth.uid() IN ( SELECT profiles.id
   FROM public.profiles
  WHERE (profiles.role = 'SUPER_ADMIN'::public.user_role))));


--
-- Name: subscriptions Admin can manage all subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage all subscriptions" ON public.subscriptions USING ((auth.uid() IN ( SELECT profiles.id
   FROM public.profiles
  WHERE (profiles.role = 'SUPER_ADMIN'::public.user_role))));


--
-- Name: payment_history Admin can manage payment history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage payment history" ON public.payment_history USING ((auth.uid() IN ( SELECT profiles.id
   FROM public.profiles
  WHERE (profiles.role = 'SUPER_ADMIN'::public.user_role))));


--
-- Name: salon_type_categories Admin can manage salon_type_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage salon_type_categories" ON public.salon_type_categories USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: subscription_plans Admin can manage subscription_plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage subscription_plans" ON public.subscription_plans USING ((auth.uid() IN ( SELECT profiles.id
   FROM public.profiles
  WHERE (profiles.role = 'SUPER_ADMIN'::public.user_role))));


--
-- Name: appointments Admins manage all appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage all appointments" ON public.appointments USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: salon_memberships Admins manage all memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage all memberships" ON public.salon_memberships USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: notifications Admins manage all notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage all notifications" ON public.notifications USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: salon_working_hours Admins manage all salon working hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage all salon working hours" ON public.salon_working_hours USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: salons Admins manage all salons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage all salons" ON public.salons USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: staff Admins manage all staff; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage all staff" ON public.staff USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: staff_services Admins manage all staff services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage all staff services" ON public.staff_services USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: working_hours Admins manage all working hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage all working hours" ON public.working_hours USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: global_services Admins manage global_services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage global_services" ON public.global_services USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: service_categories Admins manage service_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage service_categories" ON public.service_categories USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: review_images Authenticated insert review_images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated insert review_images" ON public.review_images FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: reviews Authenticated users can create reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: reviews Authenticated users can leave reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can leave reviews" ON public.reviews FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: coupons Coupons are viewable by everyone if active; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Coupons are viewable by everyone if active" ON public.coupons FOR SELECT USING (((is_active = true) AND ((expires_at IS NULL) OR (expires_at > now()))));


--
-- Name: appointments Customers can create appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can create appointments" ON public.appointments FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: transactions Customers can see their own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can see their own transactions" ON public.transactions FOR SELECT USING ((customer_id = auth.uid()));


--
-- Name: appointments Customers create appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers create appointments" ON public.appointments FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: appointments Customers view own appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers view own appointments" ON public.appointments FOR SELECT USING ((customer_id = auth.uid()));


--
-- Name: subscription_plans Everyone can read active subscription_plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can read active subscription_plans" ON public.subscription_plans FOR SELECT USING ((is_active = true));


--
-- Name: invites Invite access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Invite access" ON public.invites FOR SELECT USING (true);


--
-- Name: salon_assigned_types Owner/Admin can manage salon_assigned_types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner/Admin can manage salon_assigned_types" ON public.salon_assigned_types USING (((EXISTS ( SELECT 1
   FROM public.salons s
  WHERE ((s.id = salon_assigned_types.salon_id) AND ((s.owner_id)::text = (auth.uid())::text)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'SUPER_ADMIN'::public.user_role))))));


--
-- Name: salon_memberships Owner/Admin can manage salon_memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner/Admin can manage salon_memberships" ON public.salon_memberships USING (((EXISTS ( SELECT 1
   FROM public.salons s
  WHERE ((s.id = salon_memberships.salon_id) AND ((s.owner_id)::text = (auth.uid())::text)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'SUPER_ADMIN'::public.user_role))))));


--
-- Name: salon_working_hours Owner/Admin can manage salon_working_hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner/Admin can manage salon_working_hours" ON public.salon_working_hours USING (((EXISTS ( SELECT 1
   FROM public.salons s
  WHERE ((s.id = salon_working_hours.salon_id) AND ((s.owner_id)::text = (auth.uid())::text)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'SUPER_ADMIN'::public.user_role))))));


--
-- Name: staff Owner/Admin can manage staff; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner/Admin can manage staff" ON public.staff USING (((EXISTS ( SELECT 1
   FROM public.salons s
  WHERE ((s.id = staff.salon_id) AND ((s.owner_id)::text = (auth.uid())::text)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'SUPER_ADMIN'::public.user_role))))));


--
-- Name: staff_services Owner/Admin can manage staff_services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner/Admin can manage staff_services" ON public.staff_services USING (((EXISTS ( SELECT 1
   FROM public.salons s
  WHERE ((s.id = staff_services.salon_id) AND ((s.owner_id)::text = (auth.uid())::text)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'SUPER_ADMIN'::public.user_role))))));


--
-- Name: working_hours Owner/Admin can manage working_hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner/Admin can manage working_hours" ON public.working_hours USING (((EXISTS ( SELECT 1
   FROM (public.staff st
     JOIN public.salons s ON ((s.id = st.salon_id)))
  WHERE ((st.id = working_hours.staff_id) AND ((s.owner_id)::text = (auth.uid())::text)))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'SUPER_ADMIN'::public.user_role))))));


--
-- Name: salon_sub_merchants Owners can manage their sub-merchant info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can manage their sub-merchant info" ON public.salon_sub_merchants USING ((auth.uid() IN ( SELECT salons.owner_id
   FROM public.salons
  WHERE (salons.id = salon_sub_merchants.salon_id))));


--
-- Name: audit_logs Owners can see their own salon audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can see their own salon audit logs" ON public.audit_logs FOR SELECT TO authenticated USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: subscriptions Owners can see their own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can see their own subscriptions" ON public.subscriptions FOR SELECT USING ((auth.uid() IN ( SELECT salons.owner_id
   FROM public.salons
  WHERE (salons.id = subscriptions.salon_id))));


--
-- Name: payment_history Owners can see their payment history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can see their payment history" ON public.payment_history FOR SELECT USING ((auth.uid() IN ( SELECT salons.owner_id
   FROM public.salons
  WHERE (salons.id = payment_history.salon_id))));


--
-- Name: salon_memberships Owners manage memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage memberships" ON public.salon_memberships USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: salons Owners manage own salon; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage own salon" ON public.salons USING ((owner_id = auth.uid()));


--
-- Name: salon_services Owners manage own salon services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage own salon services" ON public.salon_services USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: salon_assigned_types Owners manage own salon types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage own salon types" ON public.salon_assigned_types USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid())))) WITH CHECK ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: salons Owners manage own salons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage own salons" ON public.salons USING ((owner_id = auth.uid()));


--
-- Name: salon_working_hours Owners manage salon working hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage salon working hours" ON public.salon_working_hours USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: salon_gallery Owners manage salon_gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage salon_gallery" ON public.salon_gallery USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: staff Owners manage staff; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage staff" ON public.staff USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: staff_services Owners manage staff services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage staff services" ON public.staff_services USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: working_hours Owners manage working hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage working hours" ON public.working_hours USING ((staff_id IN ( SELECT staff.id
   FROM public.staff
  WHERE (staff.salon_id IN ( SELECT salons.id
           FROM public.salons
          WHERE (salons.owner_id = auth.uid()))))));


--
-- Name: packages Packages are viewable by everyone if active; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Packages are viewable by everyone if active" ON public.packages FOR SELECT USING ((is_active = true));


--
-- Name: salon_assigned_types Public Read Access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public Read Access" ON public.salon_assigned_types FOR SELECT USING (true);


--
-- Name: platform_settings Public can read non-sensitive platform_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read non-sensitive platform_settings" ON public.platform_settings FOR SELECT USING ((key = ANY (ARRAY['bank_accounts'::text, 'iyzico_config_public'::text])));


--
-- Name: salon_services Public can view salon services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can view salon services" ON public.salon_services FOR SELECT USING (true);


--
-- Name: profiles Public profiles are viewable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);


--
-- Name: reviews Public read access for reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access for reviews" ON public.reviews FOR SELECT USING (true);


--
-- Name: salon_assigned_types Public read access for salon_assigned_types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access for salon_assigned_types" ON public.salon_assigned_types FOR SELECT USING (true);


--
-- Name: salon_memberships Public read access for salon_memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access for salon_memberships" ON public.salon_memberships FOR SELECT USING (true);


--
-- Name: salon_type_categories Public read access for salon_type_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access for salon_type_categories" ON public.salon_type_categories FOR SELECT USING (true);


--
-- Name: salon_working_hours Public read access for salon_working_hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access for salon_working_hours" ON public.salon_working_hours FOR SELECT USING (true);


--
-- Name: staff Public read access for staff; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access for staff" ON public.staff FOR SELECT USING (true);


--
-- Name: staff_services Public read access for staff_services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access for staff_services" ON public.staff_services FOR SELECT USING (true);


--
-- Name: working_hours Public read access for working_hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access for working_hours" ON public.working_hours FOR SELECT USING (true);


--
-- Name: cities Public read cities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read cities" ON public.cities FOR SELECT USING (true);


--
-- Name: districts Public read districts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read districts" ON public.districts FOR SELECT USING (true);


--
-- Name: favorites Public read favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read favorites" ON public.favorites FOR SELECT USING (true);


--
-- Name: favorites Public read for favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read for favorites" ON public.favorites FOR SELECT USING (true);


--
-- Name: global_services Public read global_services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read global_services" ON public.global_services FOR SELECT USING (true);


--
-- Name: review_images Public read review_images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read review_images" ON public.review_images FOR SELECT USING (true);


--
-- Name: reviews Public read reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);


--
-- Name: salon_working_hours Public read salon working hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read salon working hours" ON public.salon_working_hours FOR SELECT USING (true);


--
-- Name: salon_gallery Public read salon_gallery; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read salon_gallery" ON public.salon_gallery FOR SELECT USING (true);


--
-- Name: salon_type_categories Public read salon_type_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read salon_type_categories" ON public.salon_type_categories FOR SELECT USING (true);


--
-- Name: salon_types Public read salon_types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read salon_types" ON public.salon_types FOR SELECT USING (true);


--
-- Name: salons Public read salons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read salons" ON public.salons FOR SELECT USING (true);


--
-- Name: service_categories Public read service_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read service_categories" ON public.service_categories FOR SELECT USING (true);


--
-- Name: staff Public view staff; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view staff" ON public.staff FOR SELECT USING (true);


--
-- Name: staff_services Public view staff services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view staff services" ON public.staff_services FOR SELECT USING (true);


--
-- Name: working_hours Public view working hours; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public view working hours" ON public.working_hours FOR SELECT USING (true);


--
-- Name: coupons Salon owners can manage their own coupons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can manage their own coupons" ON public.coupons USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: packages Salon owners can manage their own packages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can manage their own packages" ON public.packages USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: transactions Salon owners can see their salon transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners can see their salon transactions" ON public.transactions FOR SELECT USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: appointments Salon owners manage appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salon owners manage appointments" ON public.appointments FOR UPDATE USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: appointments Salons view own appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Salons view own appointments" ON public.appointments FOR SELECT USING ((salon_id IN ( SELECT salons.id
   FROM public.salons
  WHERE (salons.owner_id = auth.uid()))));


--
-- Name: audit_logs Super admins can see all audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can see all audit logs" ON public.audit_logs FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: notifications System can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);


--
-- Name: reviews Users can create reviews for own completed appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create reviews for own completed appointments" ON public.reviews FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.appointments a
  WHERE ((a.id = reviews.appointment_id) AND (a.customer_id = auth.uid()) AND (a.status = 'COMPLETED'::public.appt_status)))));


--
-- Name: staff_reviews Users can create staff reviews for own completed appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create staff reviews for own completed appointments" ON public.staff_reviews FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.appointments a
  WHERE ((a.id = staff_reviews.appointment_id) AND (a.customer_id = auth.uid()) AND (a.status = 'COMPLETED'::public.appt_status) AND (a.staff_id = staff_reviews.staff_id)))));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: favorites Users can manage own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own favorites" ON public.favorites USING ((auth.uid() = user_id));


--
-- Name: user_sessions Users can terminate (delete) their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can terminate (delete) their own sessions" ON public.user_sessions FOR DELETE TO authenticated USING ((user_id = auth.uid()));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: reviews Users can update own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: salon_memberships Users can view their own memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own memberships" ON public.salon_memberships FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: user_sessions Users can view their own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own sessions" ON public.user_sessions FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: favorites Users manage own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own favorites" ON public.favorites USING ((auth.uid() = user_id));


--
-- Name: notifications Users view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: staff_reviews admin_manage_staff_reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_manage_staff_reviews ON public.staff_reviews USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'SUPER_ADMIN'::public.user_role)))));


--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: change_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: cities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

--
-- Name: coupons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

--
-- Name: districts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

--
-- Name: favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

--
-- Name: global_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.global_services ENABLE ROW LEVEL SECURITY;

--
-- Name: invites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

--
-- Name: iys_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.iys_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: otp_codes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: packages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: review_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: salon_assigned_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_assigned_types ENABLE ROW LEVEL SECURITY;

--
-- Name: salon_gallery; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_gallery ENABLE ROW LEVEL SECURITY;

--
-- Name: salon_memberships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: salon_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_services ENABLE ROW LEVEL SECURITY;

--
-- Name: salon_sub_merchants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_sub_merchants ENABLE ROW LEVEL SECURITY;

--
-- Name: salon_type_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_type_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: salon_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_types ENABLE ROW LEVEL SECURITY;

--
-- Name: salon_working_hours; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salon_working_hours ENABLE ROW LEVEL SECURITY;

--
-- Name: salons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;

--
-- Name: service_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: sms_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sms_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: staff; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

--
-- Name: staff_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.staff_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: staff_reviews staff_reviews_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY staff_reviews_public_read ON public.staff_reviews FOR SELECT USING (true);


--
-- Name: staff_services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: support_tickets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

--
-- Name: ticket_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: staff_reviews users_delete_own_staff_review; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY users_delete_own_staff_review ON public.staff_reviews FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: working_hours; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Avatar images are publicly accessible; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- Name: buckets Public bucket read access; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Public bucket read access" ON storage.buckets FOR SELECT USING (true);


--
-- Name: objects Salon images publicly accessible; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Salon images publicly accessible" ON storage.objects FOR SELECT USING ((bucket_id = 'salon-images'::text));


--
-- Name: objects Staff photos publicly accessible; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Staff photos publicly accessible" ON storage.objects FOR SELECT USING ((bucket_id = 'staff-photos'::text));


--
-- Name: objects Users can delete avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can delete avatars" ON storage.objects FOR DELETE USING (((bucket_id = 'avatars'::text) AND ((auth.role() = 'authenticated'::text) OR (auth.role() = 'anon'::text))));


--
-- Name: objects Users can delete their own avatar; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Users can update avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can update avatars" ON storage.objects FOR UPDATE USING (((bucket_id = 'avatars'::text) AND ((auth.role() = 'authenticated'::text) OR (auth.role() = 'anon'::text))));


--
-- Name: objects Users can update their own avatar; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Users can upload avatars; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'avatars'::text) AND ((auth.role() = 'authenticated'::text) OR (auth.role() = 'anon'::text))));


--
-- Name: objects Users can upload salon images; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can upload salon images" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'salon-images'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Users can upload staff photos; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can upload staff photos" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'staff-photos'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects Users can upload their own avatar; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_namespaces; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.iceberg_namespaces ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_tables; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.iceberg_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

