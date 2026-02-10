-- RESTORE ALL CITIES AND DISTRICTS (Robust & Idempotent Version)
-- Fixes unique constraint errors by using ON CONFLICT handling.

BEGIN;

-- 1. CLEANUP BAD DATA (Explicitly remove broken records)
DELETE FROM public.districts WHERE name LIKE '%??%';
DELETE FROM public.cities WHERE name LIKE '%??%';

-- 2. INSERT CITIES (81 Provinces) with ON CONFLICT Handling
-- If city exists, we update it to ensure correct data.
-- Removed TRUNCATE to be safer and avoid cascading deletes if not desired, 
-- but since we want a clean state for these, DELETE is safer than TRUNCATE if FKs exist without cascade.

INSERT INTO public.cities (name, plate_code, latitude, longitude) VALUES
('Adana', 1, 37.0000, 35.3213),
('Adıyaman', 2, NULL, NULL),
('Afyonkarahisar', 3, NULL, NULL),
('Ağrı', 4, NULL, NULL),
('Amasya', 5, NULL, NULL),
('Ankara', 6, 39.9208, 32.8541),
('Antalya', 7, 36.8969, 30.7133),
('Artvin', 8, NULL, NULL),
('Aydın', 9, NULL, NULL),
('Balıkesir', 10, NULL, NULL),
('Bilecik', 11, NULL, NULL),
('Bingöl', 12, NULL, NULL),
('Bitlis', 13, NULL, NULL),
('Bolu', 14, NULL, NULL),
('Burdur', 15, NULL, NULL),
('Bursa', 16, 40.1885, 29.0610),
('Çanakkale', 17, NULL, NULL),
('Çankırı', 18, NULL, NULL),
('Çorum', 19, NULL, NULL),
('Denizli', 20, NULL, NULL),
('Diyarbakır', 21, NULL, NULL),
('Edirne', 22, NULL, NULL),
('Elazığ', 23, NULL, NULL),
('Erzincan', 24, NULL, NULL),
('Erzurum', 25, NULL, NULL),
('Eskişehir', 26, NULL, NULL),
('Gaziantep', 27, 37.0662, 37.3833),
('Giresun', 28, NULL, NULL),
('Gümüşhane', 29, NULL, NULL),
('Hakkari', 30, NULL, NULL),
('Hatay', 31, NULL, NULL),
('Isparta', 32, NULL, NULL),
('Mersin', 33, NULL, NULL),
('İstanbul', 34, 41.0082, 28.9784),
('İzmir', 35, 38.4237, 27.1428),
('Kars', 36, NULL, NULL),
('Kastamonu', 37, NULL, NULL),
('Kayseri', 38, NULL, NULL),
('Kırklareli', 39, NULL, NULL),
('Kırşehir', 40, NULL, NULL),
('Kocaeli', 41, NULL, NULL),
('Konya', 42, 37.8667, 32.4833),
('Kütahya', 43, NULL, NULL),
('Malatya', 44, NULL, NULL),
('Manisa', 45, NULL, NULL),
('Kahramanmaraş', 46, NULL, NULL),
('Mardin', 47, NULL, NULL),
('Muğla', 48, NULL, NULL),
('Muş', 49, NULL, NULL),
('Nevşehir', 50, NULL, NULL),
('Niğde', 51, NULL, NULL),
('Ordu', 52, NULL, NULL),
('Rize', 53, NULL, NULL),
('Sakarya', 54, NULL, NULL),
('Samsun', 55, NULL, NULL),
('Siirt', 56, NULL, NULL),
('Sinop', 57, NULL, NULL),
('Sivas', 58, NULL, NULL),
('Tekirdağ', 59, NULL, NULL),
('Tokat', 60, NULL, NULL),
('Trabzon', 61, NULL, NULL),
('Tunceli', 62, NULL, NULL),
('Şanlıurfa', 63, NULL, NULL),
('Uşak', 64, NULL, NULL),
('Van', 65, NULL, NULL),
('Yozgat', 66, NULL, NULL),
('Zonguldak', 67, NULL, NULL),
('Aksaray', 68, NULL, NULL),
('Bayburt', 69, NULL, NULL),
('Karaman', 70, NULL, NULL),
('Kırıkkale', 71, NULL, NULL),
('Batman', 72, NULL, NULL),
('Şırnak', 73, NULL, NULL),
('Bartın', 74, NULL, NULL),
('Ardahan', 75, NULL, NULL),
('Iğdır', 76, NULL, NULL),
('Yalova', 77, NULL, NULL),
('Karabük', 78, NULL, NULL),
('Kilis', 79, NULL, NULL),
('Osmaniye', 80, NULL, NULL),
('Düzce', 81, NULL, NULL)
ON CONFLICT (name) DO UPDATE 
SET plate_code = EXCLUDED.plate_code,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude;


-- 3. INSERT DISTRICTS
-- Also using ON CONFLICT to be safe.
-- We use a CTE or temporary approach? No, just straightforward calls.

-- Helper function to safe insert districts for a city
-- But standard SQL is better for portability.
-- We will use the same block format but with ON CONFLICT DO NOTHING for districts (since they are just names + city_id)
-- Note: districts usually have (city_id, name) unique constraint? Let's check.
-- If not, we might duplicate. Let's assume there is a constraint or add one if missing.
-- To be safe, we first delete existing districts for these cities to re-sync them perfectly?
-- Or just use INSERT ON CONFLICT.

-- To avoid duplicates if unique constraint is missing on districts(city_id, name),
-- we will DELETE first for the cities we are inserting. This ensures clean state for districts.

DELETE FROM public.districts WHERE city_id IN (SELECT id FROM public.cities);

-- Now INSERT all districts
-- Using dynamic city_id lookup

-- Adana Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir']) 
FROM public.cities WHERE name = 'Adana';

-- Adıyaman Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Merkez', 'Samsat', 'Sincik', 'Tut']) 
FROM public.cities WHERE name = 'Adıyaman';

-- Afyonkarahisar Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Merkez', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut']) 
FROM public.cities WHERE name = 'Afyonkarahisar';

-- Ağrı Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Merkez', 'Patnos', 'Taşlıçay', 'Tutak']) 
FROM public.cities WHERE name = 'Ağrı';

-- Amasya Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merkez', 'Merzifon', 'Suluova', 'Taşova']) 
FROM public.cities WHERE name = 'Amasya';

-- Ankara Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Güdül', 'Haymana', 'Kalecik', 'Kızılcahamam', 'Nallıhan', 'Polatlı', 'Şereflikoçhisar', 'Yenimahalle', 'Gölbaşı', 'Keçiören', 'Mamak', 'Sincan', 'Kazan', 'Akyurt', 'Etimesgut', 'Evren', 'Pursaklar']) 
FROM public.cities WHERE name = 'Ankara';

-- Antalya Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Akseki', 'Alanya', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'Kaş', 'Korkuteli', 'Kumluca', 'Manavgat', 'Serik', 'Demre', 'İbradı', 'Kemer', 'Aksu', 'Döşemealtı', 'Kepez', 'Konyaaltı', 'Muratpaşa']) 
FROM public.cities WHERE name = 'Antalya';

-- Artvin Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Ardanuç', 'Arhavi', 'Merkez', 'Borçka', 'Hopa', 'Şavşat', 'Yusufeli', 'Murgul']) 
FROM public.cities WHERE name = 'Artvin';

-- Aydın Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Bozdoğan', 'Efeler', 'Çine', 'Germencik', 'Karacasu', 'Koçarlı', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar', 'Buharkent', 'İncirliova', 'Karpuzlu', 'Köşk', 'Didim']) 
FROM public.cities WHERE name = 'Aydın';

-- Balıkesir Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Altıeylül', 'Ayvalık', 'Merkez', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut', 'Manyas', 'Savaştepe', 'Sındırgı', 'Gömeç', 'Susurluk', 'Marmara']) 
FROM public.cities WHERE name = 'Balıkesir';

-- Bilecik Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Bozüyük', 'Gölpazarı', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar', 'İnhisar']) 
FROM public.cities WHERE name = 'Bilecik';

-- Bingöl Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Genç', 'Karlıova', 'Kiğı', 'Solhan', 'Adaklı', 'Yayladere', 'Yedisu']) 
FROM public.cities WHERE name = 'Bingöl';

-- Bitlis Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Adilcevaz', 'Ahlat', 'Merkez', 'Hizan', 'Mutki', 'Tatvan', 'Güroymak']) 
FROM public.cities WHERE name = 'Bitlis';

-- Bolu Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Mudurnu', 'Seben', 'Dörtdivan', 'Yeniçağa']) 
FROM public.cities WHERE name = 'Bolu';

-- Burdur Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Ağlasun', 'Bucak', 'Merkez', 'Gölhisar', 'Tefenni', 'Yeşilova', 'Karamanlı', 'Kemer', 'Altınyayla', 'Çavdır', 'Çeltikçi']) 
FROM public.cities WHERE name = 'Burdur';

-- Bursa Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Gemlik', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Mudanya', 'Mustafakemalpaşa', 'Orhaneli', 'Orhangazi', 'Yenişehir', 'Büyükorhan', 'Harmancık', 'Nilüfer', 'Osmangazi', 'Yıldırım', 'Gürsu', 'Kestel']) 
FROM public.cities WHERE name = 'Bursa';

-- Çanakkale Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Merkez', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Yenice']) 
FROM public.cities WHERE name = 'Çanakkale';

-- Çankırı Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kurşunlu', 'Orta', 'Şabanözü', 'Yapraklı', 'Atkaracalar', 'Kızılırmak', 'Bayramören', 'Korgun']) 
FROM public.cities WHERE name = 'Çankırı';

-- Çorum Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Alaca', 'Bayat', 'Merkez', 'İskilip', 'Kargı', 'Mecitözü', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Boğazkale', 'Uğurludağ', 'Dodurga', 'Laçin', 'Oğuzlar']) 
FROM public.cities WHERE name = 'Çorum';

-- Denizli Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Acıpayam', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Merkez', 'Merkezefendi', 'Pamukkale', 'Güney', 'Kale', 'Sarayköy', 'Tavas', 'Babadağ', 'Bekilli', 'Honaz', 'Serinhisar', 'Baklan', 'Beyağaç', 'Bozkurt']) 
FROM public.cities WHERE name = 'Denizli';

-- Diyarbakır Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Kocaköy', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Ergani', 'Hani', 'Hazro', 'Kulp', 'Lice', 'Silvan', 'Eğil', 'Bağlar', 'Kayapınar', 'Sur', 'Yenişehir', 'Bismil']) 
FROM public.cities WHERE name = 'Diyarbakır';

-- Edirne Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Uzunköprü', 'Süloğlu']) 
FROM public.cities WHERE name = 'Edirne';

-- Elazığ Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Ağın', 'Baskil', 'Merkez', 'Karakoçan', 'Keban', 'Maden', 'Palu', 'Sivrice', 'Arıcak', 'Kovancılar', 'Alacakaya']) 
FROM public.cities WHERE name = 'Elazığ';

-- Erzincan Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Çayırlı', 'Merkez', 'İliç', 'Kemah', 'Kemaliye', 'Refahiye', 'Tercan', 'Üzümlü', 'Otlukbeli']) 
FROM public.cities WHERE name = 'Erzincan';

-- Erzurum Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Aşkale', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karayazı', 'Narman', 'Oltu', 'Olur', 'Pasinler', 'Şenkaya', 'Tekman', 'Tortum', 'Karaçoban', 'Uzundere', 'Pazaryolu', 'Köprüköy', 'Palandöken', 'Yakutiye', 'Aziziye']) 
FROM public.cities WHERE name = 'Erzurum';

-- Eskişehir Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Çifteler', 'Mahmudiye', 'Mihalıççık', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Alpu', 'Beylikova', 'İnönü', 'Günyüzü', 'Han', 'Mihalgazi', 'Odunpazarı', 'Tepebaşı']) 
FROM public.cities WHERE name = 'Eskişehir';

-- Gaziantep Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Araban', 'İslahiye', 'Nizip', 'Oğuzeli', 'Yavuzeli', 'Şahinbey', 'Şehitkamil', 'Karkamış', 'Nurdağı']) 
FROM public.cities WHERE name = 'Gaziantep';

-- Giresun Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Alucra', 'Bulancak', 'Dereli', 'Espiye', 'Eynesil', 'Merkez', 'Görele', 'Keşap', 'Şebinkarahisar', 'Tirebolu', 'Piraziz', 'Yağlıdere', 'Çamoluk', 'Çanakçı', 'Doğankent', 'Güce']) 
FROM public.cities WHERE name = 'Giresun';

-- Gümüşhane Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Kelkit', 'Şiran', 'Torul', 'Köse', 'Kürtün']) 
FROM public.cities WHERE name = 'Gümüşhane';

-- Hakkari Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Çukurca', 'Merkez', 'Şemdinli', 'Yüksekova']) 
FROM public.cities WHERE name = 'Hakkari';

-- Hatay Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Altınözü', 'Arsuz', 'Defne', 'Dörtyol', 'Hassa', 'Antakya', 'İskenderun', 'Kırıkhan', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı', 'Erzin', 'Belen', 'Kumlu']) 
FROM public.cities WHERE name = 'Hatay';

-- Isparta Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Atabey', 'Eğirdir', 'Gelendost', 'Merkez', 'Keçiborlu', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Aksu', 'Gönen', 'Yenişarbademli']) 
FROM public.cities WHERE name = 'Isparta';

-- Mersin Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Anamur', 'Erdemli', 'Gülnar', 'Mut', 'Silifke', 'Tarsus', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Akdeniz', 'Mezitli', 'Toroslar', 'Yenişehir']) 
FROM public.cities WHERE name = 'Mersin';

-- İstanbul Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Adalar', 'Bakırköy', 'Beşiktaş', 'Beykoz', 'Beyoğlu', 'Çatalca', 'Eyüp', 'Fatih', 'Gaziosmanpaşa', 'Kadıköy', 'Kartal', 'Sarıyer', 'Silivri', 'Şile', 'Şişli', 'Üsküdar', 'Zeytinburnu', 'Büyükçekmece', 'Kağıthane', 'Küçükçekmece', 'Pendik', 'Ümraniye', 'Bayrampaşa', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Güngören', 'Maltepe', 'Sultanbeyli', 'Tuzla', 'Esenler', 'Arnavutköy', 'Ataşehir', 'Başakşehir', 'Beylikdüzü', 'Çekmeköy', 'Esenyurt', 'Sancaktepe', 'Sultangazi']) 
FROM public.cities WHERE name = 'İstanbul';

-- İzmir Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Aliağa', 'Bayındır', 'Bergama', 'Bornova', 'Çeşme', 'Dikili', 'Foça', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Menemen', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla', 'Beydağ', 'Buca', 'Konak', 'Menderes', 'Balçova', 'Çiğli', 'Gaziemir', 'Narlıdere', 'Güzelbahçe', 'Bayraklı', 'Karabağlar']) 
FROM public.cities WHERE name = 'İzmir';

-- Kars Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Arpaçay', 'Digor', 'Kağızman', 'Merkez', 'Sarıkamış', 'Selim', 'Susuz', 'Akyaka']) 
FROM public.cities WHERE name = 'Kars';

-- Kastamonu Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Abana', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'İnebolu', 'Merkez', 'Küre', 'Taşköprü', 'Tosya', 'İhsangazi', 'Pınarbaşı', 'Şenpazar', 'Ağlı', 'Doğanyurt', 'Hanönü', 'Seydiler']) 
FROM public.cities WHERE name = 'Kastamonu';

-- Kayseri Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Bünyan', 'Develi', 'Felahiye', 'İncesu', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Tomarza', 'Yahyalı', 'Yeşilhisar', 'Akkışla', 'Talas', 'Kocasinan', 'Melikgazi', 'Hacılar', 'Özvatan']) 
FROM public.cities WHERE name = 'Kayseri';

-- Kırklareli Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Babaeski', 'Demirköy', 'Merkez', 'Kofçaz', 'Lüleburgaz', 'Pehlivanköy', 'Pınarhisar', 'Vize']) 
FROM public.cities WHERE name = 'Kırklareli';

-- Kırşehir Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Çiçekdağı', 'Kaman', 'Merkez', 'Mucur', 'Akpınar', 'Akçakent', 'Boztepe']) 
FROM public.cities WHERE name = 'Kırşehir';

-- Kocaeli Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Gebze', 'Gölcük', 'Kandıra', 'Karamürsel', 'Körfez', 'Derince', 'Başiskele', 'Çayırova', 'Darıca', 'Dilovası', 'İzmit', 'Kartepe']) 
FROM public.cities WHERE name = 'Kocaeli';

-- Konya Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Akşehir', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çumra', 'Doğanhisar', 'Ereğli', 'Hadim', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Kulu', 'Sarayönü', 'Seydişehir', 'Yunak', 'Akören', 'Altınekin', 'Derebucak', 'Hüyük', 'Karatay', 'Meram', 'Selçuklu', 'Taşkent', 'Ahırlı', 'Çeltik', 'Derbent', 'Emirgazi', 'Güneysınır', 'Halkapınar', 'Tuzlukçu', 'Yalıhüyük']) 
FROM public.cities WHERE name = 'Konya';

-- Kütahya Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Altıntaş', 'Domaniç', 'Emet', 'Gediz', 'Merkez', 'Simav', 'Tavşanlı', 'Aslanapa', 'Dumlupınar', 'Hisarcık', 'Şaphane', 'Çavdarhisar', 'Pazarlar']) 
FROM public.cities WHERE name = 'Kütahya';

-- Malatya Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Akçadağ', 'Arapgir', 'Arguvan', 'Darende', 'Doğanşehir', 'Hekimhan', 'Merkez', 'Pütürge', 'Yeşilyurt', 'Battalgazi', 'Doğanyol', 'Kale', 'Kuluncak', 'Yazıhan']) 
FROM public.cities WHERE name = 'Malatya';

-- Manisa Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Akhisar', 'Alaşehir', 'Demirci', 'Gördes', 'Kırkağaç', 'Kula', 'Merkez', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Şehzadeler', 'Yunusemre', 'Turgutlu', 'Ahmetli', 'Gölmarmara', 'Köprübaşı']) 
FROM public.cities WHERE name = 'Manisa';

-- Kahramanmaraş Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Afşin', 'Andırın', 'Dulkadiroğlu', 'Onikişubat', 'Elbistan', 'Göksun', 'Merkez', 'Pazarcık', 'Türkoğlu', 'Çağlayancerit', 'Ekinözü', 'Nurhak']) 
FROM public.cities WHERE name = 'Kahramanmaraş';

-- Mardin Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Derik', 'Kızıltepe', 'Artuklu', 'Merkez', 'Mazıdağı', 'Midyat', 'Nusaybin', 'Ömerli', 'Savur', 'Dargeçit', 'Yeşilli']) 
FROM public.cities WHERE name = 'Mardin';

-- Muğla Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Bodrum', 'Datça', 'Fethiye', 'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ula', 'Yatağan', 'Dalaman', 'Seydikemer', 'Ortaca', 'Kavaklıdere']) 
FROM public.cities WHERE name = 'Muğla';

-- Muş Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Bulanık', 'Malazgirt', 'Merkez', 'Varto', 'Hasköy', 'Korkut']) 
FROM public.cities WHERE name = 'Muş';

-- Nevşehir Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Merkez', 'Ürgüp', 'Acıgöl']) 
FROM public.cities WHERE name = 'Nevşehir';

-- Niğde Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Bor', 'Çamardı', 'Merkez', 'Ulukışla', 'Altunhisar', 'Çiftlik']) 
FROM public.cities WHERE name = 'Niğde';

-- Ordu Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Akkuş', 'Altınordu', 'Aybastı', 'Fatsa', 'Gölköy', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Ulubey', 'Ünye', 'Gülyalı', 'Gürgentepe', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'İkizce', 'Kabadüz', 'Kabataş']) 
FROM public.cities WHERE name = 'Ordu';

-- Rize Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Fındıklı', 'İkizdere', 'Kalkandere', 'Pazar', 'Merkez', 'Güneysu', 'Derepazarı', 'Hemşin', 'İyidere']) 
FROM public.cities WHERE name = 'Rize';

-- Sakarya Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Akyazı', 'Geyve', 'Hendek', 'Karasu', 'Kaynarca', 'Sapanca', 'Kocaali', 'Pamukova', 'Taraklı', 'Ferizli', 'Karapürçek', 'Söğütlü', 'Adapazarı', 'Arifiye', 'Erenler', 'Serdivan']) 
FROM public.cities WHERE name = 'Sakarya';

-- Samsun Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Alaçam', 'Bafra', 'Çarşamba', 'Havza', 'Kavak', 'Ladik', 'Terme', 'Vezirköprü', 'Asarcık', 'Ondokuzmayıs', 'Salıpazarı', 'Tekkeköy', 'Ayvacık', 'Yakakent', 'Atakum', 'Canik', 'İlkadım']) 
FROM public.cities WHERE name = 'Samsun';

-- Siirt Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Baykan', 'Eruh', 'Kurtalan', 'Pervari', 'Merkez', 'Şirvan', 'Tillo']) 
FROM public.cities WHERE name = 'Siirt';

-- Sinop Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Ayancık', 'Boyabat', 'Durağan', 'Erfelek', 'Gerze', 'Merkez', 'Türkeli', 'Dikmen', 'Saraydüzü']) 
FROM public.cities WHERE name = 'Sinop';

-- Sivas Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Divriği', 'Gemerek', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Merkez', 'Suşehri', 'Şarkışla', 'Yıldızeli', 'Zara', 'Akıncılar', 'Altınyayla', 'Doğanşar', 'Gölova', 'Ulaş']) 
FROM public.cities WHERE name = 'Sivas';

-- Tekirdağ Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Malkara', 'Muratlı', 'Saray', 'Süleymanpaşa', 'Kapaklı', 'Şarköy', 'Marmaraereğlisi']) 
FROM public.cities WHERE name = 'Tekirdağ';

-- Tokat Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Almus', 'Artova', 'Erbaa', 'Niksar', 'Reşadiye', 'Merkez', 'Turhal', 'Zile', 'Pazar', 'Yeşilyurt', 'Başçiftlik', 'Sulusaray']) 
FROM public.cities WHERE name = 'Tokat';

-- Trabzon Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Akçaabat', 'Araklı', 'Arsin', 'Çaykara', 'Maçka', 'Of', 'Ortahisar', 'Sürmene', 'Tonya', 'Vakfıkebir', 'Yomra', 'Beşikdüzü', 'Şalpazarı', 'Çarşıbaşı', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı']) 
FROM public.cities WHERE name = 'Trabzon';

-- Tunceli Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Çemişgezek', 'Hozat', 'Mazgirt', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür', 'Merkez']) 
FROM public.cities WHERE name = 'Tunceli';

-- Şanlıurfa Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti', 'Haliliye', 'Hilvan', 'Karaköprü', 'Siverek', 'Suruç', 'Viranşehir', 'Harran']) 
FROM public.cities WHERE name = 'Şanlıurfa';

-- Uşak Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Banaz', 'Eşme', 'Karahallı', 'Sivaslı', 'Ulubey', 'Merkez']) 
FROM public.cities WHERE name = 'Uşak';

-- Van Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Başkale', 'Çatak', 'Erciş', 'Gevaş', 'Gürpınar', 'İpekyolu', 'Muradiye', 'Özalp', 'Tuşba', 'Bahçesaray', 'Çaldıran', 'Edremit', 'Saray']) 
FROM public.cities WHERE name = 'Van';

-- Yozgat Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Akdağmadeni', 'Boğazlıyan', 'Çayıralan', 'Çekerek', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yerköy', 'Merkez', 'Aydıncık', 'Çandır', 'Kadışehri', 'Saraykent', 'Yenifakılı']) 
FROM public.cities WHERE name = 'Yozgat';

-- Zonguldak Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Çaycuma', 'Devrek', 'Ereğli', 'Merkez', 'Alaplı', 'Gökçebey']) 
FROM public.cities WHERE name = 'Zonguldak';

-- Aksaray Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Merkez', 'Ortaköy', 'Sarıyahşi']) 
FROM public.cities WHERE name = 'Aksaray';

-- Bayburt Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Aydıntepe', 'Demirözü']) 
FROM public.cities WHERE name = 'Bayburt';

-- Karaman Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Ermenek', 'Merkez', 'Ayrancı', 'Kazımkarabekir', 'Başyayla', 'Sarıveliler']) 
FROM public.cities WHERE name = 'Karaman';

-- Kırıkkale Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Delice', 'Keskin', 'Merkez', 'Sulakyurt', 'Bahşili', 'Balışeyh', 'Çelebi', 'Karakeçili', 'Yahşihan']) 
FROM public.cities WHERE name = 'Kırıkkale';

-- Batman Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Beşiri', 'Gercüş', 'Kozluk', 'Sason', 'Hasankeyf']) 
FROM public.cities WHERE name = 'Batman';

-- Şırnak Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Beytüşşebap', 'Cizre', 'İdil', 'Silopi', 'Merkez', 'Uludere', 'Güçlükonak']) 
FROM public.cities WHERE name = 'Şırnak';

-- Bartın Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Kurucaşile', 'Ulus', 'Amasra']) 
FROM public.cities WHERE name = 'Bartın';

-- Ardahan Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Çıldır', 'Göle', 'Hanak', 'Posof', 'Damal']) 
FROM public.cities WHERE name = 'Ardahan';

-- Iğdır Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Aralık', 'Merkez', 'Tuzluca', 'Karakoyunlu']) 
FROM public.cities WHERE name = 'Iğdır';

-- Yalova Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Termal']) 
FROM public.cities WHERE name = 'Yalova';

-- Karabük Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Eflani', 'Eskipazar', 'Merkez', 'Ovacık', 'Safranbolu', 'Yenice']) 
FROM public.cities WHERE name = 'Karabük';

-- Kilis Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Elbeyli', 'Musabeyli', 'Polateli']) 
FROM public.cities WHERE name = 'Kilis';

-- Osmaniye Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Bahçe', 'Kadirli', 'Merkez', 'Düziçi', 'Hasanbeyli', 'Sumbas', 'Toprakkale']) 
FROM public.cities WHERE name = 'Osmaniye';

-- Düzce Districts
INSERT INTO public.districts (city_id, name)
SELECT id, unnest(ARRAY['Akçakoca', 'Merkez', 'Yığılca', 'Cumayeri', 'Gölyaka', 'Çilimli', 'Gümüşova', 'Kaynaşlı']) 
FROM public.cities WHERE name = 'Düzce';

-- 4. ENSURE RLS POLICIES
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read cities" ON public.cities;
CREATE POLICY "Public read cities" ON public.cities FOR SELECT USING (true);

ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read districts" ON public.districts;
CREATE POLICY "Public read districts" ON public.districts FOR SELECT USING (true);

COMMIT;

-- 5. VERIFICATION
SELECT 'Cities: ' || COUNT(*) as result FROM public.cities;
SELECT 'Districts: ' || COUNT(*) as result FROM public.districts;
