--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

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

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (1, '2025-12-15 01:38:30.513921', 'admin@kuafor.com', 'Sistem', true, 'Admin', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlNBxBFve4ZlLa', 'ADMIN');
INSERT INTO public.users VALUES (2, '2025-12-15 01:38:30.513921', 'ahmet@berber.com', 'Ahmet', true, 'Makas├ğ─▒', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlNBxBFve4ZlLa', 'HAIRDRESSER');
INSERT INTO public.users VALUES (3, '2025-12-15 01:38:30.513921', 'ayse@kuafor.com', 'Ay┼şe', true, 'Tarak', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlNBxBFve4ZlLa', 'HAIRDRESSER');
INSERT INTO public.users VALUES (4, '2025-12-15 01:38:30.513921', 'mehmet@musteri.com', 'Mehmet', true, 'Y─▒lmaz', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlNBxBFve4ZlLa', 'CUSTOMER');
INSERT INTO public.users VALUES (5, '2025-12-15 01:38:30.513921', 'zeynep@musteri.com', 'Zeynep', true, 'Demir', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlNBxBFve4ZlLa', 'CUSTOMER');


--
-- Data for Name: salons; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.salons VALUES (1, 'Moda Caddesi No:10, Kad─▒k├Ây/─░stanbul', 'Klasik erkek t─▒ra┼ş─▒ ve modern sa├ğ kesimi.', true, '0101000020E6100000499D8026C2063D4075029A081B7E4440', 'Ahmet Erkek Kuaf├Âr├╝', 4.8, 1, 'APPROVED', NULL, NULL, NULL, '5188bddf-7d18-4bcb-a274-6dfa07ad8f17', NULL, NULL, NULL, false, '[]', NULL, '2026-01-25 14:07:17.926978+00', '2026-01-25 14:07:17.926978+00');
INSERT INTO public.salons VALUES (2, '─░stiklal Caddesi No:55, Beyo─şlu/─░stanbul', 'Sa├ğ boyama, kesim ve cilt bak─▒m─▒ hizmetleri.', true, '0101000020E61000000A68226C78FA3C40E2E995B20C814440', 'Ay┼şe G├╝zellik Salonu', 4.5, 2, 'APPROVED', NULL, NULL, NULL, '5188bddf-7d18-4bcb-a274-6dfa07ad8f17', NULL, NULL, NULL, false, '[]', NULL, '2026-01-25 14:07:17.926978+00', '2026-01-25 14:07:17.926978+00');
INSERT INTO public.salons VALUES (3, 'Ba─şdat Caddesi, Suadiye/─░stanbul', 'L├╝ks hizmet ve VIP odalar.', true, '0101000020E6100000BEC1172653153D4088635DDC467B4440', 'Elite Barber Shop', 5, 3, 'APPROVED', NULL, NULL, NULL, '5188bddf-7d18-4bcb-a274-6dfa07ad8f17', NULL, NULL, NULL, false, '[]', NULL, '2026-01-25 14:07:17.926978+00', '2026-01-25 14:07:17.926978+00');


--
-- Data for Name: salon_services; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.salon_services VALUES (1, 30, 'Sa├ğ Kesimi', 250.00, 1);
INSERT INTO public.salon_services VALUES (2, 15, 'Sakal T─▒ra┼ş─▒', 150.00, 1);
INSERT INTO public.salon_services VALUES (3, 45, 'Sa├ğ + Sakal + Y─▒kama', 350.00, 1);
INSERT INTO public.salon_services VALUES (4, 20, 'F├Ân ├çekimi', 200.00, 2);
INSERT INTO public.salon_services VALUES (5, 45, 'Sa├ğ Kesimi (Kad─▒n)', 400.00, 2);
INSERT INTO public.salon_services VALUES (6, 60, 'Dip Boya', 600.00, 2);
INSERT INTO public.salon_services VALUES (7, 60, 'Kral T─▒ra┼ş─▒', 1000.00, 3);
INSERT INTO public.salon_services VALUES (8, 30, 'B─▒yy─▒k', 150.00, 1);


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.appointments VALUES (1, '2025-12-13 02:14:34.477628', '2025-12-13 01:44:34.477628', 'COMPLETED', 4, 1, 1);
INSERT INTO public.appointments VALUES (2, '2025-12-16 14:45:00', '2025-12-16 14:00:00', 'CONFIRMED', 4, 2, 5);
INSERT INTO public.appointments VALUES (3, '2025-12-15 16:15:00', '2025-12-15 16:00:00', 'PENDING', 5, 1, 2);


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cities VALUES ('db32470f-626d-4dae-88a6-056690867bc2', '??stanbul', 34, 41.00820000, 28.97840000, '2026-01-25 14:04:33.033884+00');


--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.districts VALUES ('c8bcc880-52f4-4381-9c81-1a1e8f912894', 'db32470f-626d-4dae-88a6-056690867bc2', 'Kad??k??y', '2026-01-25 14:04:33.037799+00');
INSERT INTO public.districts VALUES ('44c831ae-5f81-47a3-b705-c4fc59b151e5', 'db32470f-626d-4dae-88a6-056690867bc2', 'Be??ikta??', '2026-01-25 14:04:33.037799+00');


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.service_categories VALUES ('ed6ebf1b-2345-4259-9dfc-93eb5176d510', 'Sa├ğ', 'sac', NULL, '2026-01-25 14:08:15.61146+00');
INSERT INTO public.service_categories VALUES ('a4c9379d-87c6-4fc7-bb66-0de9aca7965c', 'T─▒rnak', 'tirnak', NULL, '2026-01-25 14:08:15.61146+00');
INSERT INTO public.service_categories VALUES ('a6c90bcc-66b9-4262-8f1d-5b0a15f7c450', 'Makyaj', 'makyaj', NULL, '2026-01-25 14:08:15.61146+00');


--
-- Data for Name: global_services; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.global_services VALUES ('bcd2f8ee-a2c7-4188-9de1-83923a565c0b', 'ed6ebf1b-2345-4259-9dfc-93eb5176d510', 'Sa├ğ Kesimi', '2026-01-25 14:08:31.394076+00');
INSERT INTO public.global_services VALUES ('f1cb4ac9-5946-4982-a0c0-660001a40ae0', 'ed6ebf1b-2345-4259-9dfc-93eb5176d510', 'Sa├ğ Boyama', '2026-01-25 14:08:34.087429+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: invites; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: iys_logs; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: otp_codes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: salon_types; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.salon_types VALUES ('5188bddf-7d18-4bcb-a274-6dfa07ad8f17', 'Kuaf??r', 'kuafor', NULL, NULL, '2026-01-25 14:04:33.041744+00');
INSERT INTO public.salon_types VALUES ('d0a403a7-44a3-45d4-b489-2b6d3cc311c6', 'Berber', 'berber', NULL, NULL, '2026-01-25 14:04:33.041744+00');


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: -
--



--
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: -
--



--
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: -
--



--
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: -
--



--
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: -
--



--
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: -
--



--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.appointments_id_seq', 3, true);


--
-- Name: salon_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.salon_services_id_seq', 8, true);


--
-- Name: salons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.salons_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: topology_id_seq; Type: SEQUENCE SET; Schema: topology; Owner: -
--

SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

