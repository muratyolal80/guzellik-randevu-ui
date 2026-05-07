# Entegrasyon: OAuth (Google / Apple)

## Amaç
"Google ile giriş yap" gibi sosyal login seçenekleri. Daha az friction, hızlı kayıt.

## Durum
🟡 **Opsiyonel — kod hazır, Supabase Auth provider config gerekli.**

## Konfigürasyon

### Google OAuth
1. **Google Cloud Console** → OAuth Client ID oluştur
   - Authorized redirect: `http://localhost:8000/auth/v1/callback`
   - Production: `https://kuaforara.com.tr/auth/v1/callback`
2. **Supabase Studio** (`http://localhost:8000`) → Authentication → Providers → Google
   - Client ID + Secret yapıştır
   - "Enable" toggle

### Apple Sign-In
1. **Apple Developer** → App ID + Service ID + Key
2. **Supabase Studio** → Apple provider → key + team ID + key ID

## Kullanım

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${origin}/auth/callback` }
});
```

`/auth/callback` route'u Supabase tarafından handle edilir, kullanıcı login sonrası `/customer/dashboard`'a yönlendirilir.

## Akış

```
Kullanıcı → "Google ile Giriş" butonu
    ↓
Supabase OAuth redirect → Google login sayfası
    ↓
Google → callback URL'e dön (token ile)
    ↓
Supabase Auth → auth.users insert/update
    ↓
profiles tablosuna trigger ile insert (handle_new_user)
    ↓
Cookie set → /customer/dashboard
```

## Test Adımları (Setup sonrası)
1. `/login` → "Google ile Giriş" butonu görünmeli
2. Tıkla → Google OAuth ekranı
3. Hesap seç → app'e geri dön → giriş yapılmış olmalı
4. `auth.users` ve `profiles`'da kayıt oluşmuş olmalı

## Açık Aksiyon (TODO)
- 🟢 **Provider key'leri ayarla** — Google için en azından (Apple opsiyonel)
- 🟢 **Login butonu UI** — `/login` ve `/register` sayfalarında ekle
- 🟢 **Mevcut email ile çakışma** — aynı email Google ile + manuel kayıt → birleştirme akışı
- 🟢 **Rol seçimi (yeni kayıt)** — OAuth ile kayıt olan default CUSTOMER, salon sahibi olmak isterse upgrade akışı
- 🟢 **Apple Sign-In (iOS launch için)** — App Store kuralı: iOS app'te sosyal login varsa Apple da olmalı

## Bağlantılar
- Auth context: [context/AuthContext.tsx](../../context/AuthContext.tsx)
- Supabase Auth docs: https://supabase.com/docs/guides/auth/social-login/auth-google
