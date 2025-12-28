# Portfolio Dashboard - Portföy Yönetim Paneli

Modern ve minimalist bir portföy yönetim dashboard uygulaması. Google Sheets üzerinden veri çekerek hisse senedi portföyünüzü, hesaplarınızı ve finansal hareketlerinizi takip edebilirsiniz.

## Özellikler

- **Gerçek Zamanlı Veri**: Google Sheets API entegrasyonu ile canlı veri
- **Hisse Senedi Takibi**: Banka bazlı hisse portföyü görüntüleme
- **Hesap Yönetimi**: Çoklu para birimi desteği ile hesap bakiyeleri
- **Hareket Takibi**: Gelir/gider hareketlerini filtreleme ve görüntüleme
- **Piyasa Görünümü**: En çok işlem gören, yükselen ve düşen hisseler
- **Dark/Light Tema**: Göz dostu tema seçenekleri
- **Responsive Tasarım**: Mobil ve desktop uyumlu arayüz

## Kurulum

### 1. Projeyi İndirin

```bash
git clone https://github.com/kullaniciadi/portfolio-dashboard.git
cd portfolio-dashboard
```

### 2. Tarayıcıda Açın

Herhangi bir web sunucusu kullanarak veya doğrudan tarayıcıda `index.html` dosyasını açabilirsiniz.

**Basit HTTP Sunucu ile:**

```bash
# Python 3
python -m http.server 8000

# Node.js (npx kullanarak)
npx serve

# PHP
php -S localhost:8000
```

Ardından tarayıcınızda `http://localhost:8000` adresine gidin.

## Kullanım

### Google Sheets API Bağlantısı

Uygulamanın çalışması için Google Sheets API endpoint'i gereklidir. `js/app.js` dosyasındaki `API_URL` değişkenini kendi Google Apps Script URL'niz ile değiştirin:

```javascript
const API_URL = 'GOOGLE_APPS_SCRIPT_URL_BURAYA';
```

### Veri Yapısı

Google Sheets'inizde aşağıdaki sekmelerin bulunması beklenmektedir:

#### 1. Hisseler (Stocks)
- Sembol / Hisse Kodu
- Adet
- Son İşlem Fiyatı
- Ortalama Maliyet
- Tutar
- Olası Kar/Zarar
- Hesap (Banka adı)

#### 2. Hesaplar (Accounts)
- Hesap Adı
- Banka
- Bakiye
- PB (Para Birimi: TRY, USD, EUR, Altın)
- IBAN

#### 3. Hareketler (Movements)
- Tarih
- Açıklama
- Ana Kategori (Gelir/Gider)
- Alt Kategori
- Tutar
- Banka
- Etiket

#### 4. Piyasa (Market)
- Liste (EN_AKTIF, KAR_EDEN, ZARAR_EDEN)
- Sembol / Isim
- Son Fiyat
- Fark %

#### 5. Kurlar (Exchange Rates)
- USD, EUR, GRA (Altın)
- alis, satis, degisim

#### 6. Snapshots
- Toplam Varlık
- Nakit TRY
- Döviz TRY
- Altın TRY
- Hisse TRY
- Hisse K/Z

## Proje Yapısı

```
portfolio-dashboard/
├── index.html          # Ana HTML dosyası
├── css/
│   └── styles.css      # Stil dosyası
├── js/
│   └── app.js          # Ana JavaScript dosyası
├── assets/             # Görseller ve diğer kaynaklar
├── README.md           # Proje dokümantasyonu
├── LICENSE             # Lisans dosyası
└── .gitignore          # Git ignore dosyası
```

## Özelleştirme

### Tema Değişikliği

`css/styles.css` dosyasındaki CSS değişkenlerini düzenleyerek renk şemasını özelleştirebilirsiniz:

```css
:root {
    --bg-body: #0B1120;
    --bg-surface: #151F32;
    --color-up: #34D399;
    --color-down: #F87171;
    --color-brand: #60A5FA;
    /* ... diğer değişkenler */
}
```

### API Endpoint Değiştirme

`js/app.js` dosyasındaki `API_URL` sabitini güncelleyin.

## Tarayıcı Desteği

- Chrome (önerilen)
- Firefox
- Safari
- Edge

Modern tarayıcılar gereklidir (ES6+ desteği).

## Teknolojiler

- **HTML5**: Semantik yapı
- **CSS3**: Modern tasarım, CSS Grid, Flexbox, CSS Custom Properties
- **Vanilla JavaScript**: Framework bağımlılığı yok
- **Google Sheets API**: Veri kaynağı
- **Inter Font**: Temiz ve modern tipografi

## Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Sorularınız veya önerileriniz için issue açabilirsiniz.

## Ekran Görüntüleri

### Ana Dashboard
![Dashboard](assets/screenshot-dashboard.png)

### Portföy Görünümü
![Portfolio](assets/screenshot-portfolio.png)

### Hareketler
![Movements](assets/screenshot-movements.png)

---

**Not**: Bu uygulama eğitim ve kişisel kullanım amaçlıdır. Gerçek yatırım kararları için profesyonel danışmanlık alınız.
