-- GuzellikRandevu Seed Data
-- Migration: Initial Seed Data
-- Created: 2025-12-22

-- ==============================================
-- 1. CITIES (81 Turkey Provinces)
-- ==============================================

INSERT INTO cities (name, plate_code) VALUES
('Adana', 1), ('Adıyaman', 2), ('Afyonkarahisar', 3), ('Ağrı', 4), ('Amasya', 5),
('Ankara', 6), ('Antalya', 7), ('Artvin', 8), ('Aydın', 9), ('Balıkesir', 10),
('Bilecik', 11), ('Bingöl', 12), ('Bitlis', 13), ('Bolu', 14), ('Burdur', 15),
('Bursa', 16), ('Çanakkale', 17), ('Çankırı', 18), ('Çorum', 19), ('Denizli', 20),
('Diyarbakır', 21), ('Edirne', 22), ('Elazığ', 23), ('Erzincan', 24), ('Erzurum', 25),
('Eskişehir', 26), ('Gaziantep', 27), ('Giresun', 28), ('Gümüşhane', 29), ('Hakkari', 30),
('Hatay', 31), ('Isparta', 32), ('Mersin', 33), ('İstanbul', 34), ('İzmir', 35),
('Kars', 36), ('Kastamonu', 37), ('Kayseri', 38), ('Kırklareli', 39), ('Kırşehir', 40),
('Kocaeli', 41), ('Konya', 42), ('Kütahya', 43), ('Malatya', 44), ('Manisa', 45),
('Kahramanmaraş', 46), ('Mardin', 47), ('Muğla', 48), ('Muş', 49), ('Nevşehir', 50),
('Niğde', 51), ('Ordu', 52), ('Rize', 53), ('Sakarya', 54), ('Samsun', 55),
('Siirt', 56), ('Sinop', 57), ('Sivas', 58), ('Tekirdağ', 59), ('Tokat', 60),
('Trabzon', 61), ('Tunceli', 62), ('Şanlıurfa', 63), ('Uşak', 64), ('Van', 65),
('Yozgat', 66), ('Zonguldak', 67), ('Aksaray', 68), ('Bayburt', 69), ('Karaman', 70),
('Kırıkkale', 71), ('Batman', 72), ('Şırnak', 73), ('Bartın', 74), ('Ardahan', 75),
('Iğdır', 76), ('Yalova', 77), ('Karabük', 78), ('Kilis', 79), ('Osmaniye', 80),
('Düzce', 81);

-- ==============================================
-- 2. DISTRICTS (Complete Turkey Data - All 81 Cities)
-- ==============================================

-- Adana Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Aladağ', 'Ceyhan', 'Çukurova', 'Feke', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Kozan', 'Pozantı', 'Saimbeyli', 'Sarıçam', 'Seyhan', 'Tufanbeyli', 'Yumurtalık', 'Yüreğir']) AS name FROM cities WHERE name = 'Adana';

-- Adıyaman Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Besni', 'Çelikhan', 'Gerger', 'Gölbaşı', 'Kahta', 'Merkez', 'Samsat', 'Sincik', 'Tut']) AS name FROM cities WHERE name = 'Adıyaman';

-- Afyonkarahisar Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Başmakçı', 'Bayat', 'Bolvadin', 'Çay', 'Çobanlar', 'Dazkırı', 'Dinar', 'Emirdağ', 'Evciler', 'Hocalar', 'İhsaniye', 'İscehisar', 'Kızılören', 'Merkez', 'Sandıklı', 'Sinanpaşa', 'Sultandağı', 'Şuhut']) AS name FROM cities WHERE name = 'Afyonkarahisar';

-- Ağrı Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Diyadin', 'Doğubayazıt', 'Eleşkirt', 'Hamur', 'Merkez', 'Patnos', 'Taşlıçay', 'Tutak']) AS name FROM cities WHERE name = 'Ağrı';

-- Amasya Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Göynücek', 'Gümüşhacıköy', 'Hamamözü', 'Merkez', 'Merzifon', 'Suluova', 'Taşova']) AS name FROM cities WHERE name = 'Amasya';

-- Ankara Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere', 'Çankaya', 'Çubuk', 'Elmadağ', 'Güdül', 'Haymana', 'Kalecik', 'Kızılcahamam', 'Nallıhan', 'Polatlı', 'Şereflikoçhisar', 'Yenimahalle', 'Gölbaşı', 'Keçiören', 'Mamak', 'Sincan', 'Kazan', 'Akyurt', 'Etimesgut', 'Evren', 'Pursaklar']) AS name FROM cities WHERE name = 'Ankara';

-- Antalya Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Akseki', 'Alanya', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'Kaş', 'Korkuteli', 'Kumluca', 'Manavgat', 'Serik', 'Demre', 'İbradı', 'Kemer', 'Aksu', 'Döşemealtı', 'Kepez', 'Konyaaltı', 'Muratpaşa']) AS name FROM cities WHERE name = 'Antalya';

-- Artvin Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Ardanuç', 'Arhavi', 'Merkez', 'Borçka', 'Hopa', 'Şavşat', 'Yusufeli', 'Murgul']) AS name FROM cities WHERE name = 'Artvin';

-- Aydın Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Bozdoğan', 'Efeler', 'Çine', 'Germencik', 'Karacasu', 'Koçarlı', 'Kuşadası', 'Kuyucak', 'Nazilli', 'Söke', 'Sultanhisar', 'Yenipazar', 'Buharkent', 'İncirliova', 'Karpuzlu', 'Köşk', 'Didim']) AS name FROM cities WHERE name = 'Aydın';

-- Balıkesir Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Altıeylül', 'Ayvalık', 'Merkez', 'Balya', 'Bandırma', 'Bigadiç', 'Burhaniye', 'Dursunbey', 'Edremit', 'Erdek', 'Gönen', 'Havran', 'İvrindi', 'Karesi', 'Kepsut', 'Manyas', 'Savaştepe', 'Sındırgı', 'Gömeç', 'Susurluk', 'Marmara']) AS name FROM cities WHERE name = 'Balıkesir';

-- Bilecik Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Bozüyük', 'Gölpazarı', 'Osmaneli', 'Pazaryeri', 'Söğüt', 'Yenipazar', 'İnhisar']) AS name FROM cities WHERE name = 'Bilecik';

-- Bingöl Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Genç', 'Karlıova', 'Kiğı', 'Solhan', 'Adaklı', 'Yayladere', 'Yedisu']) AS name FROM cities WHERE name = 'Bingöl';

-- Bitlis Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Adilcevaz', 'Ahlat', 'Merkez', 'Hizan', 'Mutki', 'Tatvan', 'Güroymak']) AS name FROM cities WHERE name = 'Bitlis';

-- Bolu Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Gerede', 'Göynük', 'Kıbrıscık', 'Mengen', 'Mudurnu', 'Seben', 'Dörtdivan', 'Yeniçağa']) AS name FROM cities WHERE name = 'Bolu';

-- Burdur Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Ağlasun', 'Bucak', 'Merkez', 'Gölhisar', 'Tefenni', 'Yeşilova', 'Karamanlı', 'Kemer', 'Altınyayla', 'Çavdır', 'Çeltikçi']) AS name FROM cities WHERE name = 'Burdur';

-- Bursa Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Gemlik', 'İnegöl', 'İznik', 'Karacabey', 'Keles', 'Mudanya', 'Mustafakemalpaşa', 'Orhaneli', 'Orhangazi', 'Yenişehir', 'Büyükorhan', 'Harmancık', 'Nilüfer', 'Osmangazi', 'Yıldırım', 'Gürsu', 'Kestel']) AS name FROM cities WHERE name = 'Bursa';

-- Çanakkale Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Ayvacık', 'Bayramiç', 'Biga', 'Bozcaada', 'Çan', 'Merkez', 'Eceabat', 'Ezine', 'Gelibolu', 'Gökçeada', 'Lapseki', 'Yenice']) AS name FROM cities WHERE name = 'Çanakkale';

-- Çankırı Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Çerkeş', 'Eldivan', 'Ilgaz', 'Kurşunlu', 'Orta', 'Şabanözü', 'Yapraklı', 'Atkaracalar', 'Kızılırmak', 'Bayramören', 'Korgun']) AS name FROM cities WHERE name = 'Çankırı';

-- Çorum Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Alaca', 'Bayat', 'Merkez', 'İskilip', 'Kargı', 'Mecitözü', 'Ortaköy', 'Osmancık', 'Sungurlu', 'Boğazkale', 'Uğurludağ', 'Dodurga', 'Laçin', 'Oğuzlar']) AS name FROM cities WHERE name = 'Çorum';

-- Denizli Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Acıpayam', 'Buldan', 'Çal', 'Çameli', 'Çardak', 'Çivril', 'Merkez', 'Merkezefendi', 'Pamukkale', 'Güney', 'Kale', 'Sarayköy', 'Tavas', 'Babadağ', 'Bekilli', 'Honaz', 'Serinhisar', 'Baklan', 'Beyağaç', 'Bozkurt']) AS name FROM cities WHERE name = 'Denizli';

-- Diyarbakır Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Kocaköy', 'Çermik', 'Çınar', 'Çüngüş', 'Dicle', 'Ergani', 'Hani', 'Hazro', 'Kulp', 'Lice', 'Silvan', 'Eğil', 'Bağlar', 'Kayapınar', 'Sur', 'Yenişehir', 'Bismil']) AS name FROM cities WHERE name = 'Diyarbakır';

-- Edirne Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Enez', 'Havsa', 'İpsala', 'Keşan', 'Lalapaşa', 'Meriç', 'Uzunköprü', 'Süloğlu']) AS name FROM cities WHERE name = 'Edirne';

-- Elazığ Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Ağın', 'Baskil', 'Merkez', 'Karakoçan', 'Keban', 'Maden', 'Palu', 'Sivrice', 'Arıcak', 'Kovancılar', 'Alacakaya']) AS name FROM cities WHERE name = 'Elazığ';

-- Erzincan Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Çayırlı', 'Merkez', 'İliç', 'Kemah', 'Kemaliye', 'Refahiye', 'Tercan', 'Üzümlü', 'Otlukbeli']) AS name FROM cities WHERE name = 'Erzincan';

-- Erzurum Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Aşkale', 'Çat', 'Hınıs', 'Horasan', 'İspir', 'Karayazı', 'Narman', 'Oltu', 'Olur', 'Pasinler', 'Şenkaya', 'Tekman', 'Tortum', 'Karaçoban', 'Uzundere', 'Pazaryolu', 'Köprüköy', 'Palandöken', 'Yakutiye', 'Aziziye']) AS name FROM cities WHERE name = 'Erzurum';

-- Eskişehir Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Çifteler', 'Mahmudiye', 'Mihalıççık', 'Sarıcakaya', 'Seyitgazi', 'Sivrihisar', 'Alpu', 'Beylikova', 'İnönü', 'Günyüzü', 'Han', 'Mihalgazi', 'Odunpazarı', 'Tepebaşı']) AS name FROM cities WHERE name = 'Eskişehir';

-- Gaziantep Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Araban', 'İslahiye', 'Nizip', 'Oğuzeli', 'Yavuzeli', 'Şahinbey', 'Şehitkamil', 'Karkamış', 'Nurdağı']) AS name FROM cities WHERE name = 'Gaziantep';

-- Giresun Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Alucra', 'Bulancak', 'Dereli', 'Espiye', 'Eynesil', 'Merkez', 'Görele', 'Keşap', 'Şebinkarahisar', 'Tirebolu', 'Piraziz', 'Yağlıdere', 'Çamoluk', 'Çanakçı', 'Doğankent', 'Güce']) AS name FROM cities WHERE name = 'Giresun';

-- Gümüşhane Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Kelkit', 'Şiran', 'Torul', 'Köse', 'Kürtün']) AS name FROM cities WHERE name = 'Gümüşhane';

-- Hakkari Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Çukurca', 'Merkez', 'Şemdinli', 'Yüksekova']) AS name FROM cities WHERE name = 'Hakkari';

-- Hatay Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Altınözü', 'Arsuz', 'Defne', 'Dörtyol', 'Hassa', 'Antakya', 'İskenderun', 'Kırıkhan', 'Payas', 'Reyhanlı', 'Samandağ', 'Yayladağı', 'Erzin', 'Belen', 'Kumlu']) AS name FROM cities WHERE name = 'Hatay';

-- Isparta Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Atabey', 'Eğirdir', 'Gelendost', 'Merkez', 'Keçiborlu', 'Senirkent', 'Sütçüler', 'Şarkikaraağaç', 'Uluborlu', 'Yalvaç', 'Aksu', 'Gönen', 'Yenişarbademli']) AS name FROM cities WHERE name = 'Isparta';

-- Mersin Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Anamur', 'Erdemli', 'Gülnar', 'Mut', 'Silifke', 'Tarsus', 'Aydıncık', 'Bozyazı', 'Çamlıyayla', 'Akdeniz', 'Mezitli', 'Toroslar', 'Yenişehir']) AS name FROM cities WHERE name = 'Mersin';

-- İstanbul Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Adalar', 'Bakırköy', 'Beşiktaş', 'Beykoz', 'Beyoğlu', 'Çatalca', 'Eyüp', 'Fatih', 'Gaziosmanpaşa', 'Kadıköy', 'Kartal', 'Sarıyer', 'Silivri', 'Şile', 'Şişli', 'Üsküdar', 'Zeytinburnu', 'Büyükçekmece', 'Kağıthane', 'Küçükçekmece', 'Pendik', 'Ümraniye', 'Bayrampaşa', 'Avcılar', 'Bağcılar', 'Bahçelievler', 'Güngören', 'Maltepe', 'Sultanbeyli', 'Tuzla', 'Esenler', 'Arnavutköy', 'Ataşehir', 'Başakşehir', 'Beylikdüzü', 'Çekmeköy', 'Esenyurt', 'Sancaktepe', 'Sultangazi']) AS name FROM cities WHERE name = 'İstanbul';

-- İzmir Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Aliağa', 'Bayındır', 'Bergama', 'Bornova', 'Çeşme', 'Dikili', 'Foça', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Menemen', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla', 'Beydağ', 'Buca', 'Konak', 'Menderes', 'Balçova', 'Çiğli', 'Gaziemir', 'Narlıdere', 'Güzelbahçe', 'Bayraklı', 'Karabağlar']) AS name FROM cities WHERE name = 'İzmir';

-- Kars Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Arpaçay', 'Digor', 'Kağızman', 'Merkez', 'Sarıkamış', 'Selim', 'Susuz', 'Akyaka']) AS name FROM cities WHERE name = 'Kars';

-- Kastamonu Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Abana', 'Araç', 'Azdavay', 'Bozkurt', 'Cide', 'Çatalzeytin', 'Daday', 'Devrekani', 'İnebolu', 'Merkez', 'Küre', 'Taşköprü', 'Tosya', 'İhsangazi', 'Pınarbaşı', 'Şenpazar', 'Ağlı', 'Doğanyurt', 'Hanönü', 'Seydiler']) AS name FROM cities WHERE name = 'Kastamonu';

-- Kayseri Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Bünyan', 'Develi', 'Felahiye', 'İncesu', 'Pınarbaşı', 'Sarıoğlan', 'Sarız', 'Tomarza', 'Yahyalı', 'Yeşilhisar', 'Akkışla', 'Talas', 'Kocasinan', 'Melikgazi', 'Hacılar', 'Özvatan']) AS name FROM cities WHERE name = 'Kayseri';

-- Kırklareli Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Babaeski', 'Demirköy', 'Merkez', 'Kofçaz', 'Lüleburgaz', 'Pehlivanköy', 'Pınarhisar', 'Vize']) AS name FROM cities WHERE name = 'Kırklareli';

-- Kırşehir Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Çiçekdağı', 'Kaman', 'Merkez', 'Mucur', 'Akpınar', 'Akçakent', 'Boztepe']) AS name FROM cities WHERE name = 'Kırşehir';

-- Kocaeli Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Gebze', 'Gölcük', 'Kandıra', 'Karamürsel', 'Körfez', 'Derince', 'Başiskele', 'Çayırova', 'Darıca', 'Dilovası', 'İzmit', 'Kartepe']) AS name FROM cities WHERE name = 'Kocaeli';

-- Konya Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Akşehir', 'Beyşehir', 'Bozkır', 'Cihanbeyli', 'Çumra', 'Doğanhisar', 'Ereğli', 'Hadim', 'Ilgın', 'Kadınhanı', 'Karapınar', 'Kulu', 'Sarayönü', 'Seydişehir', 'Yunak', 'Akören', 'Altınekin', 'Derebucak', 'Hüyük', 'Karatay', 'Meram', 'Selçuklu', 'Taşkent', 'Ahırlı', 'Çeltik', 'Derbent', 'Emirgazi', 'Güneysınır', 'Halkapınar', 'Tuzlukçu', 'Yalıhüyük']) AS name FROM cities WHERE name = 'Konya';

-- Kütahya Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Altıntaş', 'Domaniç', 'Emet', 'Gediz', 'Merkez', 'Simav', 'Tavşanlı', 'Aslanapa', 'Dumlupınar', 'Hisarcık', 'Şaphane', 'Çavdarhisar', 'Pazarlar']) AS name FROM cities WHERE name = 'Kütahya';

-- Malatya Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Akçadağ', 'Arapgir', 'Arguvan', 'Darende', 'Doğanşehir', 'Hekimhan', 'Merkez', 'Pütürge', 'Yeşilyurt', 'Battalgazi', 'Doğanyol', 'Kale', 'Kuluncak', 'Yazıhan']) AS name FROM cities WHERE name = 'Malatya';

-- Manisa Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Akhisar', 'Alaşehir', 'Demirci', 'Gördes', 'Kırkağaç', 'Kula', 'Merkez', 'Salihli', 'Sarıgöl', 'Saruhanlı', 'Selendi', 'Soma', 'Şehzadeler', 'Yunusemre', 'Turgutlu', 'Ahmetli', 'Gölmarmara', 'Köprübaşı']) AS name FROM cities WHERE name = 'Manisa';

-- Kahramanmaraş Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Afşin', 'Andırın', 'Dulkadiroğlu', 'Onikişubat', 'Elbistan', 'Göksun', 'Merkez', 'Pazarcık', 'Türkoğlu', 'Çağlayancerit', 'Ekinözü', 'Nurhak']) AS name FROM cities WHERE name = 'Kahramanmaraş';

-- Mardin Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Derik', 'Kızıltepe', 'Artuklu', 'Merkez', 'Mazıdağı', 'Midyat', 'Nusaybin', 'Ömerli', 'Savur', 'Dargeçit', 'Yeşilli']) AS name FROM cities WHERE name = 'Mardin';

-- Muğla Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Bodrum', 'Datça', 'Fethiye', 'Köyceğiz', 'Marmaris', 'Menteşe', 'Milas', 'Ula', 'Yatağan', 'Dalaman', 'Seydikemer', 'Ortaca', 'Kavaklıdere']) AS name FROM cities WHERE name = 'Muğla';

-- Muş Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Bulanık', 'Malazgirt', 'Merkez', 'Varto', 'Hasköy', 'Korkut']) AS name FROM cities WHERE name = 'Muş';

-- Nevşehir Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Avanos', 'Derinkuyu', 'Gülşehir', 'Hacıbektaş', 'Kozaklı', 'Merkez', 'Ürgüp', 'Acıgöl']) AS name FROM cities WHERE name = 'Nevşehir';

-- Niğde Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Bor', 'Çamardı', 'Merkez', 'Ulukışla', 'Altunhisar', 'Çiftlik']) AS name FROM cities WHERE name = 'Niğde';

-- Ordu Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Akkuş', 'Altınordu', 'Aybastı', 'Fatsa', 'Gölköy', 'Korgan', 'Kumru', 'Mesudiye', 'Perşembe', 'Ulubey', 'Ünye', 'Gülyalı', 'Gürgentepe', 'Çamaş', 'Çatalpınar', 'Çaybaşı', 'İkizce', 'Kabadüz', 'Kabataş']) AS name FROM cities WHERE name = 'Ordu';

-- Rize Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Ardeşen', 'Çamlıhemşin', 'Çayeli', 'Fındıklı', 'İkizdere', 'Kalkandere', 'Pazar', 'Merkez', 'Güneysu', 'Derepazarı', 'Hemşin', 'İyidere']) AS name FROM cities WHERE name = 'Rize';

-- Sakarya Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Akyazı', 'Geyve', 'Hendek', 'Karasu', 'Kaynarca', 'Sapanca', 'Kocaali', 'Pamukova', 'Taraklı', 'Ferizli', 'Karapürçek', 'Söğütlü', 'Adapazarı', 'Arifiye', 'Erenler', 'Serdivan']) AS name FROM cities WHERE name = 'Sakarya';

-- Samsun Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Alaçam', 'Bafra', 'Çarşamba', 'Havza', 'Kavak', 'Ladik', 'Terme', 'Vezirköprü', 'Asarcık', 'Ondokuzmayıs', 'Salıpazarı', 'Tekkeköy', 'Ayvacık', 'Yakakent', 'Atakum', 'Canik', 'İlkadım']) AS name FROM cities WHERE name = 'Samsun';

-- Siirt Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Baykan', 'Eruh', 'Kurtalan', 'Pervari', 'Merkez', 'Şirvan', 'Tillo']) AS name FROM cities WHERE name = 'Siirt';

-- Sinop Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Ayancık', 'Boyabat', 'Durağan', 'Erfelek', 'Gerze', 'Merkez', 'Türkeli', 'Dikmen', 'Saraydüzü']) AS name FROM cities WHERE name = 'Sinop';

-- Sivas Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Divriği', 'Gemerek', 'Gürün', 'Hafik', 'İmranlı', 'Kangal', 'Koyulhisar', 'Merkez', 'Suşehri', 'Şarkışla', 'Yıldızeli', 'Zara', 'Akıncılar', 'Altınyayla', 'Doğanşar', 'Gölova', 'Ulaş']) AS name FROM cities WHERE name = 'Sivas';

-- Tekirdağ Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Çerkezköy', 'Çorlu', 'Ergene', 'Hayrabolu', 'Malkara', 'Muratlı', 'Saray', 'Süleymanpaşa', 'Kapaklı', 'Şarköy', 'Marmaraereğlisi']) AS name FROM cities WHERE name = 'Tekirdağ';

-- Tokat Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Almus', 'Artova', 'Erbaa', 'Niksar', 'Reşadiye', 'Merkez', 'Turhal', 'Zile', 'Pazar', 'Yeşilyurt', 'Başçiftlik', 'Sulusaray']) AS name FROM cities WHERE name = 'Tokat';

-- Trabzon Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Akçaabat', 'Araklı', 'Arsin', 'Çaykara', 'Maçka', 'Of', 'Ortahisar', 'Sürmene', 'Tonya', 'Vakfıkebir', 'Yomra', 'Beşikdüzü', 'Şalpazarı', 'Çarşıbaşı', 'Dernekpazarı', 'Düzköy', 'Hayrat', 'Köprübaşı']) AS name FROM cities WHERE name = 'Trabzon';

-- Tunceli Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Çemişgezek', 'Hozat', 'Mazgirt', 'Nazımiye', 'Ovacık', 'Pertek', 'Pülümür', 'Merkez']) AS name FROM cities WHERE name = 'Tunceli';

-- Şanlıurfa Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Akçakale', 'Birecik', 'Bozova', 'Ceylanpınar', 'Eyyübiye', 'Halfeti', 'Haliliye', 'Hilvan', 'Karaköprü', 'Siverek', 'Suruç', 'Viranşehir', 'Harran']) AS name FROM cities WHERE name = 'Şanlıurfa';

-- Uşak Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Banaz', 'Eşme', 'Karahallı', 'Sivaslı', 'Ulubey', 'Merkez']) AS name FROM cities WHERE name = 'Uşak';

-- Van Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Başkale', 'Çatak', 'Erciş', 'Gevaş', 'Gürpınar', 'İpekyolu', 'Muradiye', 'Özalp', 'Tuşba', 'Bahçesaray', 'Çaldıran', 'Edremit', 'Saray']) AS name FROM cities WHERE name = 'Van';

-- Yozgat Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Akdağmadeni', 'Boğazlıyan', 'Çayıralan', 'Çekerek', 'Sarıkaya', 'Sorgun', 'Şefaatli', 'Yerköy', 'Merkez', 'Aydıncık', 'Çandır', 'Kadışehri', 'Saraykent', 'Yenifakılı']) AS name FROM cities WHERE name = 'Yozgat';

-- Zonguldak Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Çaycuma', 'Devrek', 'Ereğli', 'Merkez', 'Alaplı', 'Gökçebey']) AS name FROM cities WHERE name = 'Zonguldak';

-- Aksaray Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Ağaçören', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Merkez', 'Ortaköy', 'Sarıyahşi']) AS name FROM cities WHERE name = 'Aksaray';

-- Bayburt Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Aydıntepe', 'Demirözü']) AS name FROM cities WHERE name = 'Bayburt';

-- Karaman Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Ermenek', 'Merkez', 'Ayrancı', 'Kazımkarabekir', 'Başyayla', 'Sarıveliler']) AS name FROM cities WHERE name = 'Karaman';

-- Kırıkkale Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Delice', 'Keskin', 'Merkez', 'Sulakyurt', 'Bahşili', 'Balışeyh', 'Çelebi', 'Karakeçili', 'Yahşihan']) AS name FROM cities WHERE name = 'Kırıkkale';

-- Batman Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Beşiri', 'Gercüş', 'Kozluk', 'Sason', 'Hasankeyf']) AS name FROM cities WHERE name = 'Batman';

-- Şırnak Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Beytüşşebap', 'Cizre', 'İdil', 'Silopi', 'Merkez', 'Uludere', 'Güçlükonak']) AS name FROM cities WHERE name = 'Şırnak';

-- Bartın Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Kurucaşile', 'Ulus', 'Amasra']) AS name FROM cities WHERE name = 'Bartın';

-- Ardahan Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Çıldır', 'Göle', 'Hanak', 'Posof', 'Damal']) AS name FROM cities WHERE name = 'Ardahan';

-- Iğdır Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Aralık', 'Merkez', 'Tuzluca', 'Karakoyunlu']) AS name FROM cities WHERE name = 'Iğdır';

-- Yalova Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Altınova', 'Armutlu', 'Çınarcık', 'Çiftlikköy', 'Termal']) AS name FROM cities WHERE name = 'Yalova';

-- Karabük Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Eflani', 'Eskipazar', 'Merkez', 'Ovacık', 'Safranbolu', 'Yenice']) AS name FROM cities WHERE name = 'Karabük';

-- Kilis Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Merkez', 'Elbeyli', 'Musabeyli', 'Polateli']) AS name FROM cities WHERE name = 'Kilis';

-- Osmaniye Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Bahçe', 'Kadirli', 'Merkez', 'Düziçi', 'Hasanbeyli', 'Sumbas', 'Toprakkale']) AS name FROM cities WHERE name = 'Osmaniye';

-- Düzce Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY['Akçakoca', 'Merkez', 'Yığılca', 'Cumayeri', 'Gölyaka', 'Çilimli', 'Gümüşova', 'Kaynaşlı']) AS name FROM cities WHERE name = 'Düzce';

-- ==============================================
-- 3. SALON TYPES
-- ==============================================

INSERT INTO salon_types (name, slug, icon) VALUES
('Kuaför Salonları', 'kuafor', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=800&auto=format&fit=crop'),
('Berber Salonları', 'berber', 'https://images.unsplash.com/photo-1503951914875-452162b7f304?q=80&w=800&auto=format&fit=crop'),
('Güzellik Merkezleri', 'guzellik', 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop'),
('Masaj ve Spa', 'spa', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop'),
('Makyaj Stüdyoları', 'makyaj', 'https://images.unsplash.com/photo-1487412947132-26c25fc496a7?q=80&w=800&auto=format&fit=crop'),
('Tırnak Tasarım', 'tirnak', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop'),
('Fizyoterapi', 'terapi', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop'),
('Solaryum', 'solaryum', 'https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=800&auto=format&fit=crop'),
('Dövme Stüdyoları', 'dovme', 'https://images.unsplash.com/photo-1565551332972-76fa2a63273e?q=80&w=800&auto=format&fit=crop');

-- ==============================================
-- 4. SERVICE CATEGORIES
-- ==============================================

INSERT INTO service_categories (name, slug, icon) VALUES
('Saç', 'sac', 'content_cut'),
('Tırnak', 'tirnak', 'brush'),
('Makyaj ve Bakış Tasarımı', 'makyaj', 'face'),
('Vücut Bakımı ve Solaryum', 'vucut', 'accessibility_new'),
('Lazer Epilasyon', 'lazer', 'flash_on'),
('Erkek', 'erkek', 'face_retouching_natural'),
('Masaj ve Spa', 'masaj', 'spa'),
('Yüz ve Cilt Bakımı', 'cilt', 'clean_hands');

-- ==============================================
-- 5. GLOBAL SERVICES
-- ==============================================

-- Saç Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Saç Kesimi',
    'Saç Boyama',
    'Fön',
    'Maşa',
    'Saç Yıkama',
    'Saç Bakımı',
    'Keratin Bakımı',
    'Brezilya Fönü',
    'Saç Düzleştirme',
    'Perma'
])
FROM service_categories WHERE slug = 'sac';

-- Tırnak Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Manikür',
    'Pedikür',
    'Kalıcı Oje',
    'Protez Tırnak',
    'Tırnak Tasarımı',
    'Fransız Manikür'
])
FROM service_categories WHERE slug = 'tirnak';

-- Makyaj Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Günlük Makyaj',
    'Gece Makyajı',
    'Gelin Makyajı',
    'Nişan Makyajı',
    'Kaş Tasarımı',
    'Kaş Boyama',
    'Kirpik Lifting',
    'Kalıcı Makyaj',
    'İpek Kirpik'
])
FROM service_categories WHERE slug = 'makyaj';

-- Vücut Bakımı Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Solaryum',
    'Bronzlaştırma',
    'Peeling',
    'Vücut Masajı',
    'Selülit Masajı',
    'Zayıflama Masajı'
])
FROM service_categories WHERE slug = 'vucut';

-- Lazer Epilasyon Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Lazer Epilasyon - Tüm Vücut',
    'Lazer Epilasyon - Yüz',
    'Lazer Epilasyon - Kol',
    'Lazer Epilasyon - Bacak',
    'Lazer Epilasyon - Bikini Bölgesi'
])
FROM service_categories WHERE slug = 'lazer';

-- Erkek Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Saç Kesimi',
    'Sakal Kesimi',
    'Sakal Düzeltme',
    'Amerikan Tıraşı',
    'Damat Tıraşı',
    'Bıyık Kesimi',
    'Ağda',
    'Kaş Düzeltme',
    'Cilt Bakımı'
])
FROM service_categories WHERE slug = 'erkek';

-- Masaj ve Spa Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'İsveç Masajı',
    'Aromaterapi Masajı',
    'Thai Masajı',
    'Refleksoloji',
    'Hamam',
    'Kese-Köpük',
    'Jakuzi',
    'Sauna'
])
FROM service_categories WHERE slug = 'masaj';

-- Yüz ve Cilt Bakımı Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Cilt Bakımı',
    'Yüz Temizliği',
    'Maske',
    'Peeling',
    'Akne Tedavisi',
    'Leke Tedavisi',
    'Hydrafacial',
    'Mezoterapi',
    'Botox',
    'Dolgu'
])
FROM service_categories WHERE slug = 'cilt';

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE 'Seed data loaded successfully!';
    RAISE NOTICE 'Cities: %', (SELECT COUNT(*) FROM cities);
    RAISE NOTICE 'Districts: %', (SELECT COUNT(*) FROM districts);
    RAISE NOTICE 'Salon Types: %', (SELECT COUNT(*) FROM salon_types);
    RAISE NOTICE 'Service Categories: %', (SELECT COUNT(*) FROM service_categories);
    RAISE NOTICE 'Global Services: %', (SELECT COUNT(*) FROM global_services);
END $$;

