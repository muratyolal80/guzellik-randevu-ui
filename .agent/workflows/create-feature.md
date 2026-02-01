---
description: Yeni bir özellik (sayfa, bileşen, servis ve DB) oluşturmak için uçtan uca rehber.
---

Bu iş akışı, projenin mimarisine uygun yeni bir modül eklemek için kullanılır.

1. Yeni özelliğin ne olduğunu benden iste (örn: "Favori salonlar sayfasını yap").

2. Ben şu sırayla ilerleyeceğim:
    - **DB:** Gerekirse `/add-sql-migration` ile tabloyu oluştururum.
    - **Types:** `@/types.ts` dosyasına gerekli interface'leri eklerim.
    - **Service:** `/add-service-method` ile DB servislerini yazarım.
    - **Components:** Gerekli UI bileşenlerini `@/components` altında oluştururum.
    - **Page:** `@/app` altında ilgili sayfayı (Server/Client ayrımına dikkat ederek) hazırlarım.

3. Her adımda modern React (Next 16) ve Tailwind standartlarını kullanacağım.

4. İşlem bittiğinde `/db-sync` ile her şeyin yerli yerinde olduğunu kontrol ederim.
