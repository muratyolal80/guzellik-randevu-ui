/**
 * Supabase ve Proje Genel Hata Mesajları Eşleştirme Sistemi
 */

export const ERROR_MESSAGES: Record<string, string> = {
  // Auth Hataları
  'Email already in use': 'Bu e-posta adresi zaten başka bir kullanıcı tarafından kullanılıyor.',
  'Password is too short': 'Şifre en az 6 karakter olmalıdır.',
  'Invalid login credentials': 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.',
  'Database error saving new user': 'Kullanıcı oluşturulurken bir veritabanı hatası oluştu.',
  'User already exists': 'Bu kullanıcı zaten sistemde kayıtlı.',
  
  // RLS ve Yetki Hataları
  'new row violates row-level security policy for table "salons"': 'Bu salon kaydını oluşturma veya güncelleme yetkiniz bulunmamaktadır.',
  'new row violates row-level security policy for table "profiles"': 'Profil bilgilerinizi güncelleme yetkiniz yok.',
  'permission denied for table': 'Bu işlem için gerekli yetkilere sahip değilsiniz.',
  
  // Tablo ve Kısıtlamalar
  'duplicate key value violates unique constraint "profiles_phone_key"': 'Bu telefon numarası zaten başka bir kullanıcıya tanımlı.',
  'duplicate key value violates unique constraint "salons_slug_key"': 'Bu salon takma adı (slug) zaten kullanımda.',
  
  // Genel Hatalar
  'Network request failed': 'Ağ bağlantısı hatası. Lütfen internetinizi kontrol edin.',
  'unexpected error': 'Beklenmedik bir hata oluştu. Lütfen teknik destek ile iletişime geçin.',
  'Missing required fields': 'Lütfen tüm zorunlu alanları doldurun.',
};

/**
 * Hata nesnesini veya mesajını kullanıcı dostu Türkçe bir mesaja dönüştürür.
 */
export function getErrorMessage(error: any): string {
  if (!error) return ERROR_MESSAGES['unexpected error'];

  const message = typeof error === 'string' ? error : error.message || '';

  // Tam eşleşme kontrolü
  if (ERROR_MESSAGES[message]) {
    return ERROR_MESSAGES[message];
  }

  // Parçalı eşleşme kontrolü (Postgres hataları için)
  if (message.includes('violates row-level security policy')) {
    if (message.includes('"salons"')) return ERROR_MESSAGES['new row violates row-level security policy for table "salons"'];
    return 'Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor (Güvenlik Politikası).';
  }

  if (message.includes('unique constraint "profiles_phone_key"')) {
    return ERROR_MESSAGES['duplicate key value violates unique constraint "profiles_phone_key"'];
  }

  if (message.includes('unique constraint "profiles_email_key"') || message.includes('Email already in use')) {
    return ERROR_MESSAGES['Email already in use'];
  }

  // Eğer eşleşme bulunamazsa ve mesaj çok teknikse genel hata döndür
  if (message.includes('duplicate key') || message.includes('violates constraint') || message.includes('RLS')) {
    return 'Veritabanı kısıtlaması nedeniyle işlem yapılamadı. Lütfen verilerinizin benzersiz olduğundan emin olun.';
  }

  return message || ERROR_MESSAGES['unexpected error'];
}
