# Güvenlik Ayarları

Bu proje şifre koruması ile güvenli hale getirilmiştir.

## 🔒 Şifre Değiştirme

### 1. Yeni Şifrenizi Hash'leyin

Tarayıcınızın Console'unu açın (F12) ve şu komutu çalıştırın:

```javascript
crypto.subtle.digest('SHA-256', new TextEncoder().encode('BURAYA_YENİ_ŞİFRENİZİ_YAZIN'))
  .then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('')))
```

### 2. Hash'i Kaydedin

Çıkan uzun hash değerini kopyalayın.

### 3. js/auth.js Dosyasını Güncelleyin

`js/auth.js` dosyasını açın ve şu satırı bulun:

```javascript
const PASSWORD_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
```

Tırnak içindeki değeri kopyaladığınız hash ile değiştirin.

## 📌 Varsayılan Şifre

**Varsayılan şifre:** `password`

**ÖNEMLİ:** İlk kullanımdan önce mutlaka şifrenizi değiştirin!

## 🔐 Güvenlik Özellikleri

### Şu Anda Aktif:
- ✅ SHA-256 hash ile şifre koruması
- ✅ 24 saatlik oturum süresi
- ✅ LocalStorage tabanlı oturum yönetimi
- ✅ Otomatik çıkış butonu

### Ek Güvenlik (Opsiyonel):

#### A. Oturum Süresini Değiştirme

`js/auth.js` dosyasında:

```javascript
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 saat
```

Değerleri değiştirin:
- 1 saat: `1 * 60 * 60 * 1000`
- 12 saat: `12 * 60 * 60 * 1000`
- 7 gün: `7 * 24 * 60 * 60 * 1000`

#### B. Google Sheets API'ye Güvenlik Ekleme

Google Apps Script'inizde şu kontrolleri ekleyin:

```javascript
function doGet(e) {
  // API key kontrolü
  const apiKey = e.parameter.key;
  if (apiKey !== 'YOUR_SECRET_KEY') {
    return ContentService.createTextOutput(JSON.stringify({error: 'Unauthorized'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Normal işlemler...
}
```

Sonra `js/app.js`'de URL'yi güncelleyin:

```javascript
const API_URL = 'YOUR_SCRIPT_URL?key=YOUR_SECRET_KEY';
```

## 🚨 Güvenlik Uyarıları

1. **Git'e şifre eklemeyin**: Auth.js dosyasındaki hash bile olsa paylaşmayın
2. **Güçlü şifre kullanın**: En az 12 karakter, karışık karakterler
3. **API URL'sini gizleyin**: `.gitignore`'a ekleyin
4. **HTTPS kullanın**: GitHub Pages otomatik HTTPS sağlar
5. **Düzenli şifre değiştirin**: Ayda bir şifrenizi güncelleyin

## 🔄 Şifreyi Unuttum?

Eğer şifrenizi unutursanız:

1. `js/auth.js` dosyasını düzenleyin
2. Yeni hash oluşturun (yukarıdaki adımlar)
3. Değiştirin ve GitHub'a push edin
4. `localStorage.clear()` komutunu console'da çalıştırın
5. Sayfayı yenileyin

## 📱 Mobil Erişim

Mobil cihazlardan erişirken:
- Şifreyi tarayıcı kaydetsin mi sorusuna HAYIR deyin
- Her defasında manuel girin
- Genel WiFi'larda dikkatli olun

## 🛡️ Ekstra Koruma

Public repo için ek öneriler:

1. **Robots.txt ekleyin** - Arama motorlarından gizleyin
2. **Cloudflare kullanın** - IP bazlı erişim kontrolü
3. **Private repo yapın** - En güvenli seçenek (ücretli)
4. **VPN kullanın** - Genel ağlarda erişirken

---

**Hatırlatma:** Bu basit bir güvenlik katmanıdır. Çok hassas veriler için private repo veya özel hosting kullanın.
