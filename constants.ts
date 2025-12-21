
import { Salon, Staff, Service, Review, SalonType, ServiceCategory } from './types';

// Full Turkey Data Set
export const TURKEY_DATA = [
  { "city": "Adana", "plate_code": 1, "counties": ["Aladağ", "Ceyhan", "Çukurova", "Feke", "İmamoğlu", "Karaisalı", "Karataş", "Kozan", "Pozantı", "Saimbeyli", "Sarıçam", "Seyhan", "Tufanbeyli", "Yumurtalık", "Yüreğir"] },
  { "city": "Adıyaman", "plate_code": 2, "counties": ["Besni", "Çelikhan", "Gerger", "Gölbaşı", "Kahta", "Merkez", "Samsat", "Sincik", "Tut"] },
  { "city": "Afyonkarahisar", "plate_code": 3, "counties": ["Başmakçı", "Bayat", "Bolvadin", "Çay", "Çobanlar", "Dazkırı", "Dinar", "Emirdağ", "Evciler", "Hocalar", "İhsaniye", "İscehisar", "Kızılören", "Merkez", "Sandıklı", "Sinanpaşa", "Sultandağı", "Şuhut"] },
  { "city": "Ağrı", "plate_code": 4, "counties": ["Diyadin", "Doğubayazıt", "Eleşkirt", "Hamur", "Merkez", "Patnos", "Taşlıçay", "Tutak"] },
  { "city": "Amasya", "plate_code": 5, "counties": ["Göynücek", "Gümüşhacıköy", "Hamamözü", "Merkez", "Merzifon", "Suluova", "Taşova"] },
  { "city": "Ankara", "plate_code": 6, "counties": ["Altındağ", "Ayaş", "Bala", "Beypazarı", "Çamlıdere", "Çankaya", "Çubuk", "Elmadağ", "Güdül", "Haymana", "Kalecik", "Kızılcahamam", "Nallıhan", "Polatlı", "Şereflikoçhisar", "Yenimahalle", "Gölbaşı", "Keçiören", "Mamak", "Sincan", "Kazan", "Akyurt", "Etimesgut", "Evren", "Pursaklar"] },
  { "city": "Antalya", "plate_code": 7, "counties": ["Akseki", "Alanya", "Elmalı", "Finike", "Gazipaşa", "Gündoğmuş", "Kaş", "Korkuteli", "Kumluca", "Manavgat", "Serik", "Demre", "İbradı", "Kemer", "Aksu", "Döşemealtı", "Kepez", "Konyaaltı", "Muratpaşa"] },
  { "city": "Artvin", "plate_code": 8, "counties": ["Ardanuç", "Arhavi", "Merkez", "Borçka", "Hopa", "Şavşat", "Yusufeli", "Murgul"] },
  { "city": "Aydın", "plate_code": 9, "counties": ["Merkez", "Bozdoğan", "Efeler", "Çine", "Germencik", "Karacasu", "Koçarlı", "Kuşadası", "Kuyucak", "Nazilli", "Söke", "Sultanhisar", "Yenipazar", "Buharkent", "İncirliova", "Karpuzlu", "Köşk", "Didim"] },
  { "city": "Balıkesir", "plate_code": 10, "counties": ["Altıeylül", "Ayvalık", "Merkez", "Balya", "Bandırma", "Bigadiç", "Burhaniye", "Dursunbey", "Edremit", "Erdek", "Gönen", "Havran", "İvrindi", "Karesi", "Kepsut", "Manyas", "Savaştepe", "Sındırgı", "Gömeç", "Susurluk", "Marmara"] },
  { "city": "Bilecik", "plate_code": 11, "counties": ["Merkez", "Bozüyük", "Gölpazarı", "Osmaneli", "Pazaryeri", "Söğüt", "Yenipazar", "İnhisar"] },
  { "city": "Bingöl", "plate_code": 12, "counties": ["Merkez", "Genç", "Karlıova", "Kiğı", "Solhan", "Adaklı", "Yayladere", "Yedisu"] },
  { "city": "Bitlis", "plate_code": 13, "counties": ["Adilcevaz", "Ahlat", "Merkez", "Hizan", "Mutki", "Tatvan", "Güroymak"] },
  { "city": "Bolu", "plate_code": 14, "counties": ["Merkez", "Gerede", "Göynük", "Kıbrıscık", "Mengen", "Mudurnu", "Seben", "Dörtdivan", "Yeniçağa"] },
  { "city": "Burdur", "plate_code": 15, "counties": ["Ağlasun", "Bucak", "Merkez", "Gölhisar", "Tefenni", "Yeşilova", "Karamanlı", "Kemer", "Altınyayla", "Çavdır", "Çeltikçi"] },
  { "city": "Bursa", "plate_code": 16, "counties": ["Gemlik", "İnegöl", "İznik", "Karacabey", "Keles", "Mudanya", "Mustafakemalpaşa", "Orhaneli", "Orhangazi", "Yenişehir", "Büyükorhan", "Harmancık", "Nilüfer", "Osmangazi", "Yıldırım", "Gürsu", "Kestel"] },
  { "city": "Çanakkale", "plate_code": 17, "counties": ["Ayvacık", "Bayramiç", "Biga", "Bozcaada", "Çan", "Merkez", "Eceabat", "Ezine", "Gelibolu", "Gökçeada", "Lapseki", "Yenice"] },
  { "city": "Çankırı", "plate_code": 18, "counties": ["Merkez", "Çerkeş", "Eldivan", "Ilgaz", "Kurşunlu", "Orta", "Şabanözü", "Yapraklı", "Atkaracalar", "Kızılırmak", "Bayramören", "Korgun"] },
  { "city": "Çorum", "plate_code": 19, "counties": ["Alaca", "Bayat", "Merkez", "İskilip", "Kargı", "Mecitözü", "Ortaköy", "Osmancık", "Sungurlu", "Boğazkale", "Uğurludağ", "Dodurga", "Laçin", "Oğuzlar"] },
  { "city": "Denizli", "plate_code": 20, "counties": ["Acıpayam", "Buldan", "Çal", "Çameli", "Çardak", "Çivril", "Merkez", "Merkezefendi", "Pamukkale", "Güney", "Kale", "Sarayköy", "Tavas", "Babadağ", "Bekilli", "Honaz", "Serinhisar", "Baklan", "Beyağaç", "Bozkurt"] },
  { "city": "Diyarbakır", "plate_code": 21, "counties": ["Kocaköy", "Çermik", "Çınar", "Çüngüş", "Dicle", "Ergani", "Hani", "Hazro", "Kulp", "Lice", "Silvan", "Eğil", "Bağlar", "Kayapınar", "Sur", "Yenişehir", "Bismil"] },
  { "city": "Edirne", "plate_code": 22, "counties": ["Merkez", "Enez", "Havsa", "İpsala", "Keşan", "Lalapaşa", "Meriç", "Uzunköprü", "Süloğlu"] },
  { "city": "Elazığ", "plate_code": 23, "counties": ["Ağın", "Baskil", "Merkez", "Karakoçan", "Keban", "Maden", "Palu", "Sivrice", "Arıcak", "Kovancılar", "Alacakaya"] },
  { "city": "Erzincan", "plate_code": 24, "counties": ["Çayırlı", "Merkez", "İliç", "Kemah", "Kemaliye", "Refahiye", "Tercan", "Üzümlü", "Otlukbeli"] },
  { "city": "Erzurum", "plate_code": 25, "counties": ["Aşkale", "Çat", "Hınıs", "Horasan", "İspir", "Karayazı", "Narman", "Oltu", "Olur", "Pasinler", "Şenkaya", "Tekman", "Tortum", "Karaçoban", "Uzundere", "Pazaryolu", "Köprüköy", "Palandöken", "Yakutiye", "Aziziye"] },
  { "city": "Eskişehir", "plate_code": 26, "counties": ["Çifteler", "Mahmudiye", "Mihalıççık", "Sarıcakaya", "Seyitgazi", "Sivrihisar", "Alpu", "Beylikova", "İnönü", "Günyüzü", "Han", "Mihalgazi", "Odunpazarı", "Tepebaşı"] },
  { "city": "Gaziantep", "plate_code": 27, "counties": ["Araban", "İslahiye", "Nizip", "Oğuzeli", "Yavuzeli", "Şahinbey", "Şehitkamil", "Karkamış", "Nurdağı"] },
  { "city": "Giresun", "plate_code": 28, "counties": ["Alucra", "Bulancak", "Dereli", "Espiye", "Eynesil", "Merkez", "Görele", "Keşap", "Şebinkarahisar", "Tirebolu", "Piraziz", "Yağlıdere", "Çamoluk", "Çanakçı", "Doğankent", "Güce"] },
  { "city": "Gümüşhane", "plate_code": 29, "counties": ["Merkez", "Kelkit", "Şiran", "Torul", "Köse", "Kürtün"] },
  { "city": "Hakkari", "plate_code": 30, "counties": ["Çukurca", "Merkez", "Şemdinli", "Yüksekova"] },
  { "city": "Hatay", "plate_code": 31, "counties": ["Altınözü", "Arsuz", "Defne", "Dörtyol", "Hassa", "Antakya", "İskenderun", "Kırıkhan", "Payas", "Reyhanlı", "Samandağ", "Yayladağı", "Erzin", "Belen", "Kumlu"] },
  { "city": "Isparta", "plate_code": 32, "counties": ["Atabey", "Eğirdir", "Gelendost", "Merkez", "Keçiborlu", "Senirkent", "Sütçüler", "Şarkikaraağaç", "Uluborlu", "Yalvaç", "Aksu", "Gönen", "Yenişarbademli"] },
  { "city": "Mersin", "plate_code": 33, "counties": ["Anamur", "Erdemli", "Gülnar", "Mut", "Silifke", "Tarsus", "Aydıncık", "Bozyazı", "Çamlıyayla", "Akdeniz", "Mezitli", "Toroslar", "Yenişehir"] },
  { "city": "İstanbul", "plate_code": 34, "counties": ["Adalar", "Bakırköy", "Beşiktaş", "Beykoz", "Beyoğlu", "Çatalca", "Eyüp", "Fatih", "Gaziosmanpaşa", "Kadıköy", "Kartal", "Sarıyer", "Silivri", "Şile", "Şişli", "Üsküdar", "Zeytinburnu", "Büyükçekmece", "Kağıthane", "Küçükçekmece", "Pendik", "Ümraniye", "Bayrampaşa", "Avcılar", "Bağcılar", "Bahçelievler", "Güngören", "Maltepe", "Sultanbeyli", "Tuzla", "Esenler", "Arnavutköy", "Ataşehir", "Başakşehir", "Beylikdüzü", "Çekmeköy", "Esenyurt", "Sancaktepe", "Sultangazi"] },
  { "city": "İzmir", "plate_code": 35, "counties": ["Aliağa", "Bayındır", "Bergama", "Bornova", "Çeşme", "Dikili", "Foça", "Karaburun", "Karşıyaka", "Kemalpaşa", "Kınık", "Kiraz", "Menemen", "Ödemiş", "Seferihisar", "Selçuk", "Tire", "Torbalı", "Urla", "Beydağ", "Buca", "Konak", "Menderes", "Balçova", "Çiğli", "Gaziemir", "Narlıdere", "Güzelbahçe", "Bayraklı", "Karabağlar"] },
  { "city": "Kars", "plate_code": 36, "counties": ["Arpaçay", "Digor", "Kağızman", "Merkez", "Sarıkamış", "Selim", "Susuz", "Akyaka"] },
  { "city": "Kastamonu", "plate_code": 37, "counties": ["Abana", "Araç", "Azdavay", "Bozkurt", "Cide", "Çatalzeytin", "Daday", "Devrekani", "İnebolu", "Merkez", "Küre", "Taşköprü", "Tosya", "İhsangazi", "Pınarbaşı", "Şenpazar", "Ağlı", "Doğanyurt", "Hanönü", "Seydiler"] },
  { "city": "Kayseri", "plate_code": 38, "counties": ["Bünyan", "Develi", "Felahiye", "İncesu", "Pınarbaşı", "Sarıoğlan", "Sarız", "Tomarza", "Yahyalı", "Yeşilhisar", "Akkışla", "Talas", "Kocasinan", "Melikgazi", "Hacılar", "Özvatan"] },
  { "city": "Kırklareli", "plate_code": 39, "counties": ["Babaeski", "Demirköy", "Merkez", "Kofçaz", "Lüleburgaz", "Pehlivanköy", "Pınarhisar", "Vize"] },
  { "city": "Kırşehir", "plate_code": 40, "counties": ["Çiçekdağı", "Kaman", "Merkez", "Mucur", "Akpınar", "Akçakent", "Boztepe"] },
  { "city": "Kocaeli", "plate_code": 41, "counties": ["Gebze", "Gölcük", "Kandıra", "Karamürsel", "Körfez", "Derince", "Başiskele", "Çayırova", "Darıca", "Dilovası", "İzmit", "Kartepe"] },
  { "city": "Konya", "plate_code": 42, "counties": ["Akşehir", "Beyşehir", "Bozkır", "Cihanbeyli", "Çumra", "Doğanhisar", "Ereğli", "Hadim", "Ilgın", "Kadınhanı", "Karapınar", "Kulu", "Sarayönü", "Seydişehir", "Yunak", "Akören", "Altınekin", "Derebucak", "Hüyük", "Karatay", "Meram", "Selçuklu", "Taşkent", "Ahırlı", "Çeltik", "Derbent", "Emirgazi", "Güneysınır", "Halkapınar", "Tuzlukçu", "Yalıhüyük"] },
  { "city": "Kütahya", "plate_code": 43, "counties": ["Altıntaş", "Domaniç", "Emet", "Gediz", "Merkez", "Simav", "Tavşanlı", "Aslanapa", "Dumlupınar", "Hisarcık", "Şaphane", "Çavdarhisar", "Pazarlar"] },
  { "city": "Malatya", "plate_code": 44, "counties": ["Akçadağ", "Arapgir", "Arguvan", "Darende", "Doğanşehir", "Hekimhan", "Merkez", "Pütürge", "Yeşilyurt", "Battalgazi", "Doğanyol", "Kale", "Kuluncak", "Yazıhan"] },
  { "city": "Manisa", "plate_code": 45, "counties": ["Akhisar", "Alaşehir", "Demirci", "Gördes", "Kırkağaç", "Kula", "Merkez", "Salihli", "Sarıgöl", "Saruhanlı", "Selendi", "Soma", "Şehzadeler", "Yunusemre", "Turgutlu", "Ahmetli", "Gölmarmara", "Köprübaşı"] },
  { "city": "Kahramanmaraş", "plate_code": 46, "counties": ["Afşin", "Andırın", "Dulkadiroğlu", "Onikişubat", "Elbistan", "Göksun", "Merkez", "Pazarcık", "Türkoğlu", "Çağlayancerit", "Ekinözü", "Nurhak"] },
  { "city": "Mardin", "plate_code": 47, "counties": ["Derik", "Kızıltepe", "Artuklu", "Merkez", "Mazıdağı", "Midyat", "Nusaybin", "Ömerli", "Savur", "Dargeçit", "Yeşilli"] },
  { "city": "Muğla", "plate_code": 48, "counties": ["Bodrum", "Datça", "Fethiye", "Köyceğiz", "Marmaris", "Menteşe", "Milas", "Ula", "Yatağan", "Dalaman", "Seydikemer", "Ortaca", "Kavaklıdere"] },
  { "city": "Muş", "plate_code": 49, "counties": ["Bulanık", "Malazgirt", "Merkez", "Varto", "Hasköy", "Korkut"] },
  { "city": "Nevşehir", "plate_code": 50, "counties": ["Avanos", "Derinkuyu", "Gülşehir", "Hacıbektaş", "Kozaklı", "Merkez", "Ürgüp", "Acıgöl"] },
  { "city": "Niğde", "plate_code": 51, "counties": ["Bor", "Çamardı", "Merkez", "Ulukışla", "Altunhisar", "Çiftlik"] },
  { "city": "Ordu", "plate_code": 52, "counties": ["Akkuş", "Altınordu", "Aybastı", "Fatsa", "Gölköy", "Korgan", "Kumru", "Mesudiye", "Perşembe", "Ulubey", "Ünye", "Gülyalı", "Gürgentepe", "Çamaş", "Çatalpınar", "Çaybaşı", "İkizce", "Kabadüz", "Kabataş"] },
  { "city": "Rize", "plate_code": 53, "counties": ["Ardeşen", "Çamlıhemşin", "Çayeli", "Fındıklı", "İkizdere", "Kalkandere", "Pazar", "Merkez", "Güneysu", "Derepazarı", "Hemşin", "İyidere"] },
  { "city": "Sakarya", "plate_code": 54, "counties": ["Akyazı", "Geyve", "Hendek", "Karasu", "Kaynarca", "Sapanca", "Kocaali", "Pamukova", "Taraklı", "Ferizli", "Karapürçek", "Söğütlü", "Adapazarı", "Arifiye", "Erenler", "Serdivan"] },
  { "city": "Samsun", "plate_code": 55, "counties": ["Alaçam", "Bafra", "Çarşamba", "Havza", "Kavak", "Ladik", "Terme", "Vezirköprü", "Asarcık", "Ondokuzmayıs", "Salıpazarı", "Tekkeköy", "Ayvacık", "Yakakent", "Atakum", "Canik", "İlkadım"] },
  { "city": "Siirt", "plate_code": 56, "counties": ["Baykan", "Eruh", "Kurtalan", "Pervari", "Merkez", "Şirvan", "Tillo"] },
  { "city": "Sinop", "plate_code": 57, "counties": ["Ayancık", "Boyabat", "Durağan", "Erfelek", "Gerze", "Merkez", "Türkeli", "Dikmen", "Saraydüzü"] },
  { "city": "Sivas", "plate_code": 58, "counties": ["Divriği", "Gemerek", "Gürün", "Hafik", "İmranlı", "Kangal", "Koyulhisar", "Merkez", "Suşehri", "Şarkışla", "Yıldızeli", "Zara", "Akıncılar", "Altınyayla", "Doğanşar", "Gölova", "Ulaş"] },
  { "city": "Tekirdağ", "plate_code": 59, "counties": ["Çerkezköy", "Çorlu", "Ergene", "Hayrabolu", "Malkara", "Muratlı", "Saray", "Süleymanpaşa", "Kapaklı", "Şarköy", "Marmaraereğlisi"] },
  { "city": "Tokat", "plate_code": 60, "counties": ["Almus", "Artova", "Erbaa", "Niksar", "Reşadiye", "Merkez", "Turhal", "Zile", "Pazar", "Yeşilyurt", "Başçiftlik", "Sulusaray"] },
  { "city": "Trabzon", "plate_code": 61, "counties": ["Akçaabat", "Araklı", "Arsin", "Çaykara", "Maçka", "Of", "Ortahisar", "Sürmene", "Tonya", "Vakfıkebir", "Yomra", "Beşikdüzü", "Şalpazarı", "Çarşıbaşı", "Dernekpazarı", "Düzköy", "Hayrat", "Köprübaşı"] },
  { "city": "Tunceli", "plate_code": 62, "counties": ["Çemişgezek", "Hozat", "Mazgirt", "Nazımiye", "Ovacık", "Pertek", "Pülümür", "Merkez"] },
  { "city": "Şanlıurfa", "plate_code": 63, "counties": ["Akçakale", "Birecik", "Bozova", "Ceylanpınar", "Eyyübiye", "Halfeti", "Haliliye", "Hilvan", "Karaköprü", "Siverek", "Suruç", "Viranşehir", "Harran"] },
  { "city": "Uşak", "plate_code": 64, "counties": ["Banaz", "Eşme", "Karahallı", "Sivaslı", "Ulubey", "Merkez"] },
  { "city": "Van", "plate_code": 65, "counties": ["Başkale", "Çatak", "Erciş", "Gevaş", "Gürpınar", "İpekyolu", "Muradiye", "Özalp", "Tuşba", "Bahçesaray", "Çaldıran", "Edremit", "Saray"] },
  { "city": "Yozgat", "plate_code": 66, "counties": ["Akdağmadeni", "Boğazlıyan", "Çayıralan", "Çekerek", "Sarıkaya", "Sorgun", "Şefaatli", "Yerköy", "Merkez", "Aydıncık", "Çandır", "Kadışehri", "Saraykent", "Yenifakılı"] },
  { "city": "Zonguldak", "plate_code": 67, "counties": ["Çaycuma", "Devrek", "Ereğli", "Merkez", "Alaplı", "Gökçebey"] },
  { "city": "Aksaray", "plate_code": 68, "counties": ["Ağaçören", "Eskil", "Gülağaç", "Güzelyurt", "Merkez", "Ortaköy", "Sarıyahşi"] },
  { "city": "Bayburt", "plate_code": 69, "counties": ["Merkez", "Aydıntepe", "Demirözü"] },
  { "city": "Karaman", "plate_code": 70, "counties": ["Ermenek", "Merkez", "Ayrancı", "Kazımkarabekir", "Başyayla", "Sarıveliler"] },
  { "city": "Kırıkkale", "plate_code": 71, "counties": ["Delice", "Keskin", "Merkez", "Sulakyurt", "Bahşili", "Balışeyh", "Çelebi", "Karakeçili", "Yahşihan"] },
  { "city": "Batman", "plate_code": 72, "counties": ["Merkez", "Beşiri", "Gercüş", "Kozluk", "Sason", "Hasankeyf"] },
  { "city": "Şırnak", "plate_code": 73, "counties": ["Beytüşşebap", "Cizre", "İdil", "Silopi", "Merkez", "Uludere", "Güçlükonak"] },
  { "city": "Bartın", "plate_code": 74, "counties": ["Merkez", "Kurucaşile", "Ulus", "Amasra"] },
  { "city": "Ardahan", "plate_code": 75, "counties": ["Merkez", "Çıldır", "Göle", "Hanak", "Posof", "Damal"] },
  { "city": "Iğdır", "plate_code": 76, "counties": ["Aralık", "Merkez", "Tuzluca", "Karakoyunlu"] },
  { "city": "Yalova", "plate_code": 77, "counties": ["Merkez", "Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Termal"] },
  { "city": "Karabük", "plate_code": 78, "counties": ["Eflani", "Eskipazar", "Merkez", "Ovacık", "Safranbolu", "Yenice"] },
  { "city": "Kilis", "plate_code": 79, "counties": ["Merkez", "Elbeyli", "Musabeyli", "Polateli"] },
  { "city": "Osmaniye", "plate_code": 80, "counties": ["Bahçe", "Kadirli", "Merkez", "Düziçi", "Hasanbeyli", "Sumbas", "Toprakkale"] },
  { "city": "Düzce", "plate_code": 81, "counties": ["Akçakoca", "Merkez", "Yığılca", "Cumayeri", "Gölyaka", "Çilimli", "Gümüşova", "Kaynaşlı"] }
];

// Map 81 Cities for Dropdowns
export const CITIES = TURKEY_DATA.map(d => d.city).sort();

// Create a lookup for districts (Used for quick access if needed, though we often filter dynamically)
export const DISTRICTS: Record<string, string[]> = TURKEY_DATA.reduce((acc, curr) => {
    acc[curr.city] = curr.counties;
    return acc;
}, {} as Record<string, string[]>);

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "İstanbul": { lat: 41.0082, lng: 28.9784 },
  "Ankara": { lat: 39.9208, lng: 32.8541 },
  "İzmir": { lat: 38.4237, lng: 27.1428 },
  "Antalya": { lat: 36.8969, lng: 30.7133 },
  "Bursa": { lat: 40.1885, lng: 29.0610 }
  // Note: For a real app, we would need coordinates for all 81 provinces to center maps correctly.
};

export const MOCK_SALON_TYPES: SalonType[] = [
  { 
    id: 'st1', 
    name: 'Kuaför Salonları', 
    slug: 'kuafor',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'st2', 
    name: 'Berber Salonları', 
    slug: 'berber',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b7f304?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'st3', 
    name: 'Güzellik Merkezleri', 
    slug: 'guzellik',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'st4', 
    name: 'Masaj ve Spa', 
    slug: 'spa',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'st5', 
    name: 'Makyaj Stüdyoları', 
    slug: 'makyaj',
    image: 'https://images.unsplash.com/photo-1487412947132-26c25fc496a7?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'st6', 
    name: 'Tırnak Tasarım', 
    slug: 'tirnak',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'st7', 
    name: 'Fizyoterapi', 
    slug: 'terapi',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'st8', 
    name: 'Solaryum', 
    slug: 'solaryum',
    image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'st10', 
    name: 'Dövme Stüdyoları', 
    slug: 'dovme',
    image: 'https://images.unsplash.com/photo-1565551332972-76fa2a63273e?q=80&w=800&auto=format&fit=crop'
  },
];

export const MOCK_SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'sc1', name: 'Saç', slug: 'sac', icon: 'content_cut' },
  { id: 'sc2', name: 'Tırnak', slug: 'tirnak', icon: 'brush' },
  { id: 'sc3', name: 'Makyaj ve Bakış Tasarımı', slug: 'makyaj', icon: 'face' },
  { id: 'sc4', name: 'Vücut Bakımı ve Solaryum', slug: 'vucut', icon: 'accessibility_new' },
  { id: 'sc5', name: 'Lazer Epilasyon', slug: 'lazer', icon: 'flash_on' },
  { id: 'sc6', name: 'Erkek', slug: 'erkek', icon: 'face_retouching_natural' },
  { id: 'sc7', name: 'Masaj ve Spa', slug: 'masaj', icon: 'spa' },
  { id: 'sc8', name: 'Yüz ve Cilt Bakımı', slug: 'cilt', icon: 'clean_hands' },
];

// Dynamically generate header menu items from categories
export const HEADER_MENU_ITEMS = MOCK_SERVICE_CATEGORIES.map(c => c.name);

export const CATEGORIES = MOCK_SALON_TYPES.map(t => t.name);

export const FEATURES = [
  'Otopark', 
  'Klima', 
  'İkram', 
  'Wi-Fi', 
  'Çocuk Dostu', 
  'Evcil Hayvan Dostu',
  'Özel Oda',
  'Engelliye Uygun'
];

export const SORT_OPTIONS = [
  'Önerilen', 
  'En Yakın', 
  'En Yüksek Puanlı', 
  'En Çok Yorum Alan', 
  'Fiyat (Artan)', 
  'Fiyat (Azalan)'
];

// Expanded Mock Data for Map Testing
export const MOCK_SALONS: Salon[] = [
  // İSTANBUL
  {
    id: "1",
    name: "Luxe Salon & Spa",
    location: "Beşiktaş, İstanbul",
    city: "İstanbul",
    district: "Beşiktaş",
    rating: 0, 
    reviewCount: 0,
    image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=800&auto=format&fit=crop",
    tags: ["Kuaför Salonları", "Masaj ve Spa", "Lüks", "Saç", "Fön", "Boyama", "Masaj", "Spa"],
    startPrice: 450,
    isSponsored: true,
    coordinates: { lat: 41.0422, lng: 29.0067 }
  },
  {
    id: "2",
    name: "Golden Cut Barber",
    location: "Kadıköy, İstanbul",
    city: "İstanbul",
    district: "Kadıköy",
    rating: 0,
    reviewCount: 0,
    image: "https://images.unsplash.com/photo-1503951914875-452162b7f304?q=80&w=800&auto=format&fit=crop",
    tags: ["Berber Salonları", "Sakal Tıraşı", "Erkek", "Saç Kesimi", "Erkek Bakım"],
    startPrice: 200,
    coordinates: { lat: 40.9911, lng: 29.0234 }
  },
  {
    id: "4",
    name: "Nail Artistry",
    location: "Nişantaşı, İstanbul",
    city: "İstanbul",
    district: "Şişli",
    rating: 0,
    reviewCount: 0,
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=800&auto=format&fit=crop",
    tags: ["Tırnak Tasarım", "Manikür", "Tırnak", "Pedikür", "Nail Art", "Kalıcı Oje"],
    startPrice: 300,
    coordinates: { lat: 41.0518, lng: 28.9945 }
  },
  
  // ANKARA
  {
    id: "3",
    name: "Lotus Wellness",
    location: "Çankaya, Ankara",
    city: "Ankara",
    district: "Çankaya",
    rating: 0,
    reviewCount: 0,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
    tags: ["Masaj ve Spa", "Sağlıklı Yaşam ve Diyet Merkezleri", "Masaj", "Spa", "Terapi"],
    startPrice: 900,
    coordinates: { lat: 39.9208, lng: 32.8541 }
  },
  {
    id: "ank1",
    name: "Ankara Estetik",
    location: "Kızılay, Ankara",
    city: "Ankara",
    district: "Çankaya", // Corrected for mock data consistency with new dataset
    rating: 0,
    reviewCount: 0,
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop",
    tags: ["Güzellik Merkezleri", "Lazer Epilasyon", "Lazer", "Epilasyon", "Cilt Bakımı"],
    startPrice: 750,
    coordinates: { lat: 39.9250, lng: 32.8500 }
  },

  // İZMİR
  {
    id: "5",
    name: "Elite Hair Studio",
    location: "Alsancak, İzmir",
    city: "İzmir",
    district: "Konak", // Adjusted to match real district list (Alsancak is a neighborhood in Konak)
    rating: 0,
    reviewCount: 0,
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop",
    tags: ["Kuaför Salonları", "Renklendirme", "Saç", "Ombre", "Gelin Saçı"],
    startPrice: 550,
    coordinates: { lat: 38.4357, lng: 27.1408 }
  },
  {
    id: "izm1",
    name: "Kordon Barber Club",
    location: "Konak, İzmir",
    city: "İzmir",
    district: "Konak",
    rating: 0,
    reviewCount: 0,
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop",
    tags: ["Berber Salonları", "VIP", "Erkek", "Tıraş", "Saç"],
    startPrice: 350,
    coordinates: { lat: 38.4192, lng: 27.1287 }
  },

  // ANTALYA
  {
    id: "6",
    name: "Zen Therapy Center",
    location: "Lara, Antalya",
    city: "Antalya",
    district: "Muratpaşa", // Lara is in Muratpaşa
    rating: 0,
    reviewCount: 0,
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop",
    tags: ["Fizyoterapi", "Masaj ve Spa", "Masaj", "Fizyoterapi"],
    startPrice: 1200,
    coordinates: { lat: 36.8524, lng: 30.7960 }
  },
  {
    id: "ant1",
    name: "Sun & Shine Solaryum",
    location: "Konyaaltı, Antalya",
    city: "Antalya",
    district: "Konyaaltı",
    rating: 0,
    reviewCount: 0,
    image: "https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=800&auto=format&fit=crop",
    tags: ["Solaryum", "Solaryum", "Bronzlaşma", "Vücut Bakımı"],
    startPrice: 200,
    coordinates: { lat: 36.8850, lng: 30.6500 }
  }
];

export const MOCK_STAFF: Staff[] = [
  { id: "s1", name: "Elif Yılmaz", role: "Saç Tasarım Uzmanı", rating: 4.9, image: "https://i.pravatar.cc/150?u=elif", isOnline: true, specialty: "Renklendirme" },
  { id: "s2", name: "Can Demir", role: "Kıdemli Berber", rating: 5.0, image: "https://i.pravatar.cc/150?u=can", specialty: "Sakal Bakımı" },
  { id: "s3", name: "Zeynep Kaya", role: "Manikür Uzmanı", rating: 4.7, image: "https://i.pravatar.cc/150?u=zeynep", specialty: "Nail Art" },
  { id: "s4", name: "Mert Şahin", role: "Cilt Bakım Uzmanı", rating: 4.8, image: "https://i.pravatar.cc/150?u=mert", isOnline: true, specialty: "Anti-Aging" },
  { id: "s5", name: "Ayşe Yıldız", role: "Makyaj Artisti", rating: 4.9, image: "https://i.pravatar.cc/150?u=ayse", isOnline: false, specialty: "Gelin Makyajı" }
];

export const MOCK_SERVICES: Service[] = [
  // SAÇ (sc1)
  { id: "h1", category_id: "sc1", name: "Fön", duration: "30 dk", price: 150, category: "Saç" },
  { id: "h2", category_id: "sc1", name: "Saç Kesimi", duration: "45 dk", price: 400, category: "Saç" },
  { id: "h3", category_id: "sc1", name: "Saç Boyama (Dip / Bütün)", duration: "120 dk", price: 1500, category: "Saç" },
  { id: "h4", category_id: "sc1", name: "Saç Bakımı (Keratin / Botoks)", duration: "90 dk", price: 1200, category: "Saç" },
  { id: "h5", category_id: "sc1", name: "Ombre & Sombre", duration: "180 dk", price: 2500, category: "Saç" },
  { id: "h6", category_id: "sc1", name: "Gelin Saçı & Nişan Saçı", duration: "120 dk", price: 3000, category: "Saç" },
  { id: "h7", category_id: "sc1", name: "Röfle & Gölge", duration: "180 dk", price: 2200, category: "Saç" },
  { id: "h8", category_id: "sc1", name: "Saç Cilası", duration: "30 dk", price: 600, category: "Saç" },
  { id: "h9", category_id: "sc1", name: "Perma", duration: "120 dk", price: 1500, category: "Saç" },
  { id: "h10", category_id: "sc1", name: "Brezilya Fönü", duration: "150 dk", price: 2000, category: "Saç" },
  { id: "h11", category_id: "sc1", name: "Saç Kaynak (Mikro / Boncuk)", duration: "240 dk", price: 5000, category: "Saç" },
  { id: "h12", category_id: "sc1", name: "Topuz & Maşa", duration: "60 dk", price: 750, category: "Saç" },

  // TIRNAK (sc2)
  { id: "n1", category_id: "sc2", name: "Manikür", duration: "30 dk", price: 250, category: "Tırnak" },
  { id: "n2", category_id: "sc2", name: "Pedikür", duration: "45 dk", price: 350, category: "Tırnak" },
  { id: "n3", category_id: "sc2", name: "Kalıcı Oje", duration: "45 dk", price: 350, category: "Tırnak" },
  { id: "n4", category_id: "sc2", name: "Protez Tırnak", duration: "120 dk", price: 900, category: "Tırnak" },
  { id: "n5", category_id: "sc2", name: "Jel Tırnak", duration: "90 dk", price: 800, category: "Tırnak" },
  { id: "n6", category_id: "sc2", name: "Nail Art", duration: "15 dk", price: 50, category: "Tırnak" },
  { id: "n7", category_id: "sc2", name: "Oje Sürümü", duration: "15 dk", price: 100, category: "Tırnak" },
  { id: "n8", category_id: "sc2", name: "Jel / Protez Tırnak Çıkarma", duration: "45 dk", price: 200, category: "Tırnak" },
  { id: "n9", category_id: "sc2", name: "Parafin Bakımı", duration: "30 dk", price: 300, category: "Tırnak" },
  { id: "n10", category_id: "sc2", name: "Tırnak Tamiri", duration: "15 dk", price: 50, category: "Tırnak" },

  // MAKYAJ (sc3)
  { id: "m1", category_id: "sc3", name: "Klasik Makyaj", duration: "45 dk", price: 800, category: "Makyaj ve Bakış Tasarımı" },
  { id: "m2", category_id: "sc3", name: "Profesyonel Makyaj (Gece / Davet)", duration: "60 dk", price: 1200, category: "Makyaj ve Bakış Tasarımı" },
  { id: "m3", category_id: "sc3", name: "Gelin Makyajı", duration: "90 dk", price: 2500, category: "Makyaj ve Bakış Tasarımı" },
  { id: "m4", category_id: "sc3", name: "Kirpik Lifting", duration: "60 dk", price: 600, category: "Makyaj ve Bakış Tasarımı" },
  { id: "m5", category_id: "sc3", name: "İpek Kirpik (Klasik / Volüm)", duration: "120 dk", price: 1500, category: "Makyaj ve Bakış Tasarımı" },
  { id: "m6", category_id: "sc3", name: "Kaş Laminasyonu", duration: "45 dk", price: 500, category: "Makyaj ve Bakış Tasarımı" },
  { id: "m7", category_id: "sc3", name: "Kaş Tasarımı & Alımı", duration: "30 dk", price: 200, category: "Makyaj ve Bakış Tasarımı" },
  { id: "m8", category_id: "sc3", name: "Microblading (Kalıcı Makyaj)", duration: "120 dk", price: 3000, category: "Makyaj ve Bakış Tasarımı" },
  { id: "m9", category_id: "sc3", name: "Dudak Renklendirme", duration: "90 dk", price: 2500, category: "Makyaj ve Bakış Tasarımı" },
  { id: "m10", category_id: "sc3", name: "Dipliner / Eyeliner", duration: "90 dk", price: 2000, category: "Makyaj ve Bakış Tasarımı" },

  // VÜCUT (sc4)
  { id: "v1", category_id: "sc4", name: "Vücut Bakımı (Kese / Köpük)", duration: "60 dk", price: 700, category: "Vücut Bakımı ve Solaryum" },
  { id: "v2", category_id: "sc4", name: "Ağda (Tüm Vücut)", duration: "60 dk", price: 600, category: "Vücut Bakımı ve Solaryum" },
  { id: "v3", category_id: "sc4", name: "Ağda (Bölgesel)", duration: "30 dk", price: 200, category: "Vücut Bakımı ve Solaryum" },
  { id: "v4", category_id: "sc4", name: "Bölgesel İncelme (G5 / Pasif Jimnastik)", duration: "45 dk", price: 500, category: "Vücut Bakımı ve Solaryum" },
  { id: "v5", category_id: "sc4", name: "Solaryum", duration: "10 dk", price: 150, category: "Vücut Bakımı ve Solaryum" },
  { id: "v6", category_id: "sc4", name: "Selülit Masajı", duration: "45 dk", price: 600, category: "Vücut Bakımı ve Solaryum" },
  { id: "v7", category_id: "sc4", name: "Vücut Peelingi", duration: "30 dk", price: 400, category: "Vücut Bakımı ve Solaryum" },
  { id: "v8", category_id: "sc4", name: "Lenf Drenaj", duration: "30 dk", price: 300, category: "Vücut Bakımı ve Solaryum" },

  // LAZER (sc5)
  { id: "l1", category_id: "sc5", name: "Tüm Vücut Lazer", duration: "90 dk", price: 2000, category: "Lazer Epilasyon" },
  { id: "l2", category_id: "sc5", name: "Koltuk Altı Lazer", duration: "15 dk", price: 300, category: "Lazer Epilasyon" },
  { id: "l3", category_id: "sc5", name: "Bacak Lazer (Tüm / Yarım)", duration: "45 dk", price: 800, category: "Lazer Epilasyon" },
  { id: "l4", category_id: "sc5", name: "Kol Lazer (Tüm / Yarım)", duration: "30 dk", price: 600, category: "Lazer Epilasyon" },
  { id: "l5", category_id: "sc5", name: "Sırt Lazer", duration: "30 dk", price: 700, category: "Lazer Epilasyon" },
  { id: "l6", category_id: "sc5", name: "Göğüs Lazer", duration: "30 dk", price: 500, category: "Lazer Epilasyon" },
  { id: "l7", category_id: "sc5", name: "Genital Bölge Lazer", duration: "30 dk", price: 600, category: "Lazer Epilasyon" },
  { id: "l8", category_id: "sc5", name: "Yüz / Çene Bölgesi Lazer", duration: "15 dk", price: 300, category: "Lazer Epilasyon" },

  // ERKEK (sc6)
  { id: "e1", category_id: "sc6", name: "Erkek Saç Kesimi", duration: "30 dk", price: 250, category: "Erkek" },
  { id: "e2", category_id: "sc6", name: "Sakal Tıraşı & Şekillendirme", duration: "20 dk", price: 150, category: "Erkek" },
  { id: "e3", category_id: "sc6", name: "Saç ve Sakal Kesimi (Paket)", duration: "50 dk", price: 350, category: "Erkek" },
  { id: "e4", category_id: "sc6", name: "Erkek Saç Boyama (Beyaz Kapatma)", duration: "45 dk", price: 500, category: "Erkek" },
  { id: "e5", category_id: "sc6", name: "Erkek Cilt Bakımı", duration: "45 dk", price: 600, category: "Erkek" },
  { id: "e6", category_id: "sc6", name: "Erkek Ağda (Ense / Kulak / Yanak)", duration: "15 dk", price: 150, category: "Erkek" },
  { id: "e7", category_id: "sc6", name: "Erkek Lazer Epilasyon", duration: "30 dk", price: 800, category: "Erkek" },
  { id: "e8", category_id: "sc6", name: "Manikür & Pedikür (Erkek)", duration: "45 dk", price: 400, category: "Erkek" },
  { id: "e9", category_id: "sc6", name: "Saç Yıkama & Fön", duration: "15 dk", price: 100, category: "Erkek" },

  // MASAJ (sc7)
  { id: "ms1", category_id: "sc7", name: "Klasik İsveç Masajı", duration: "60 dk", price: 1000, category: "Masaj ve Spa" },
  { id: "ms2", category_id: "sc7", name: "Aromaterapi Masajı", duration: "60 dk", price: 1200, category: "Masaj ve Spa" },
  { id: "ms3", category_id: "sc7", name: "Derin Doku (Deep Tissue) Masajı", duration: "60 dk", price: 1300, category: "Masaj ve Spa" },
  { id: "ms4", category_id: "sc7", name: "Medikal Masaj", duration: "50 dk", price: 1200, category: "Masaj ve Spa" },
  { id: "ms5", category_id: "sc7", name: "Ayak Refleksolojisi", duration: "40 dk", price: 800, category: "Masaj ve Spa" },
  { id: "ms6", category_id: "sc7", name: "Bali Masajı", duration: "60 dk", price: 1400, category: "Masaj ve Spa" },

  // CİLT (sc8)
  { id: "c1", category_id: "sc8", name: "Klasik Cilt Bakımı", duration: "60 dk", price: 800, category: "Yüz ve Cilt Bakımı" },
  { id: "c2", category_id: "sc8", name: "Medikal Cilt Bakımı (Hydrafacial)", duration: "90 dk", price: 1500, category: "Yüz ve Cilt Bakımı" },
  { id: "c3", category_id: "sc8", name: "Anti-Aging Bakım", duration: "75 dk", price: 1800, category: "Yüz ve Cilt Bakımı" },
  { id: "c4", category_id: "sc8", name: "Akne Tedavisi", duration: "60 dk", price: 1000, category: "Yüz ve Cilt Bakımı" },
  { id: "c5", category_id: "sc8", name: "Kimyasal Peeling", duration: "45 dk", price: 1200, category: "Yüz ve Cilt Bakımı" },
  { id: "c6", category_id: "sc8", name: "Dermapen", duration: "60 dk", price: 1400, category: "Yüz ve Cilt Bakımı" },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    salon_id: "1",
    user_id: "u101",
    user_name: "Ayşe K.",
    user_avatar: "https://i.pravatar.cc/150?u=u101",
    rating: 5,
    comment: "Harika bir deneyimdi! Personel çok ilgili ve profesyonel. Kesinlikle tekrar geleceğim.",
    date: "2023-10-15"
  },
  {
    id: "r2",
    salon_id: "1",
    user_id: "u102",
    user_name: "Mehmet T.",
    user_avatar: "https://i.pravatar.cc/150?u=u102",
    rating: 4,
    comment: "Hizmet kalitesi çok iyi ancak randevu saatinde biraz beklemek zorunda kaldım. Onun dışında her şey mükemmeldi.",
    date: "2023-10-12"
  },
  {
    id: "r3",
    salon_id: "1",
    user_id: "u103",
    user_name: "Selin Y.",
    rating: 5,
    comment: "Luxe Salon favorim! Özellikle cilt bakımı hizmetini herkese tavsiye ederim.",
    date: "2023-10-01"
  },
  {
    id: "r4",
    salon_id: "2",
    user_id: "u104",
    user_name: "Burak Ö.",
    rating: 5,
    comment: "Kadıköy'ün en iyi berberi. Muhabbetleri de tıraşları kadar iyi.",
    date: "2023-09-28"
  },
  {
    id: "r5",
    salon_id: "2",
    user_id: "u105",
    user_name: "Canan D.",
    rating: 3,
    comment: "Fena değil, ama fiyatlar biraz yüksek geldi.",
    date: "2023-09-15"
  }
];
