# SaaS Rol ve Fonksiyon Analizi (GAP Analysis)

Sistemin Admin, Salon Sahibi (Owner) ve Personel (Staff) akışları incelenmiş olup, profesyonel bir SaaS platformu için gereken "Eksiklik ve İyileştirme" noktaları aşağıda belirlenmiştir.

## 1. Rol ve Yetki Yönetimi (RBAC)
*   **Mevcut Durum:** `CUSTOMER`, `STAFF`, `MANAGER`, `SALON_OWNER`, `SUPER_ADMIN`. (MANAGER eklendi ✅)
*   **Tamamlandı:** `MANAGER` rolü tiplere eklendi, `RoleGuard` ve `middleware.ts` güncellendi.

## 2. Personel Katılımı (Onboarding/Invitation)
*   **Mevcut Durum:** `staff` tablosuna `email` alanı eklendi ve mevcut profillerle otomatik eşleşme (Auto-link) kuruldu ✅.
*   **Eksiklik:** Hesabı olmayan personeller için token tabanlı bir "Davet Linki" süreci henüz yok.
*   **Çözüm:** `InviteService` ile süreli davet kodları ve özel kayıt sayfası.

## 3. Dashboard Farklılaştırması
*   **Personel Dashboard:** Sadece kendi randevularını, günlük takvimini ve kendi performansını görmeli (Tamamlanmak üzere).
*   **Owner Dashboard:** Tüm şubeleri ve genel mali durumu görmeli (Büyük oranda tamamlandı).
*   **Admin Dashboard:** Platformun toplam gelirini, yeni kayıtları ve sistem sağlığını görmeli.

## 4. SaaS ve Multi-Tenant Eksikleri
*   **Abonelik Kontrolü:** `PRO` veya `ENTERPRISE` planında olmayan salonların belirli özelliklere (örn: gelişmiş analitik veya çoklu şube) erişimi kısıtlanmalı.
*   **Domain Routing:** Subdomain yönlendirme teknik altyapısı kuruldu (`middleware.ts`), ancak gerçek şablonlar (temalar) üzerinden render edilmeli.

## Planlanan Aksiyonlar
1.  [x] `UserRole` tipine `MANAGER` eklenmesi.
2.  [x] `RoleGuard` içerisinde `MANAGER` ve `OWNER` yetki geçişlerinin incelenmesi.
3.  [x] Personel için "Sadece Kendi Randevularım" görünümünün `StaffDashboard` üzerinden doğrulanması.
4.  [x] Plan kısıtlamalarının (Plan-based Gate) uygulanması (PRO/ENTERPRISE kontrolü).
5.  [x] Admin Dashboard (Platform geneli istatistikler).
6.  [ ] Çoklu Tema (Tenant Branding) altyapısı (CSS Variables).
7.  [ ] Abonelik ve Ödeme Sayfası (Billing Page).
8.  [ ] İşlem Günlükleri (Audit Logs).
