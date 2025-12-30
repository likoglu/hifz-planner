# 📖 Hafızlık Planlayıcı

Kur'an-ı Kerim hafızlık sürecinizi planlamanıza ve takip etmenize yardımcı olan modern bir web uygulaması.

![Hafızlık Planlayıcı](https://img.shields.io/badge/React-18.2-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC) ![PWA](https://img.shields.io/badge/PWA-Ready-green)

## ✨ Özellikler

- 📅 **Dinamik Planlama**: Aylık hedeflerinize göre otomatik haftalık plan oluşturma
- 📊 **İlerleme Takibi**: Cüz bazlı ve sayfa bazlı ilerleme görüntüleme
- 🎯 **Milestone Takibi**: Hafızlık yolculuğunuzdaki önemli noktaları takip edin
- 📱 **PWA Desteği**: Telefona uygulama olarak kurulabilir
- 💾 **Otomatik Kayıt**: Tüm veriler tarayıcınızda güvenle saklanır
- 🔄 **Tekrar Planı**: Akıllı tekrar önerileri
- 📚 **Ezberleme Teknikleri**: Hafızların kullandığı en etkili yöntemler

## 🚀 Hızlı Başlangıç

### Yerel Geliştirme

```bash
# Repoyu klonla
git clone https://github.com/KULLANICI_ADIN/hifz-planner.git
cd hifz-planner

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start
```

Uygulama `http://localhost:3000` adresinde açılacaktır.

### Production Build

```bash
npm run build
```

`build` klasöründe optimize edilmiş dosyalar oluşturulur.

## 🌐 Yayınlama (Deploy)

### Vercel (Önerilen - En Kolay)

1. [vercel.com](https://vercel.com)'a GitHub hesabınızla giriş yapın
2. "New Project" butonuna tıklayın
3. GitHub reponuzu seçin
4. "Deploy" butonuna tıklayın
5. Birkaç dakika içinde `proje-adin.vercel.app` adresinde yayında!

### Netlify

1. [netlify.com](https://netlify.com)'a giriş yapın
2. "Add new site" → "Import an existing project"
3. GitHub reponuzu bağlayın
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
5. "Deploy site" butonuna tıklayın

### GitHub Pages

```bash
# gh-pages paketini ekle
npm install gh-pages --save-dev
```

`package.json`'a ekleyin:
```json
{
  "homepage": "https://KULLANICI_ADIN.github.io/hifz-planner",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

Yayınla:
```bash
npm run deploy
```

## 💾 Veri Saklama

Uygulama **localStorage** kullanarak verileri tarayıcınızda saklar:

- `hifz-settings`: Ayarlarınız (aylık hedef, başlangıç sayfası)
- `hifz-page-statuses`: Sayfa durumları (ezberlendi, çalışılıyor, vb.)

### Veri Yedekleme

Tarayıcı konsolunda (F12) şu komutları kullanabilirsiniz:

```javascript
// Verileri dışa aktar
const backup = {
  settings: localStorage.getItem('hifz-settings'),
  statuses: localStorage.getItem('hifz-page-statuses')
};
console.log(JSON.stringify(backup));

// Verileri içe aktar
const data = { /* backup verisi */ };
localStorage.setItem('hifz-settings', data.settings);
localStorage.setItem('hifz-page-statuses', data.statuses);
location.reload();
```

## 📱 PWA Kurulumu

### iOS (Safari)
1. Uygulamayı Safari'de açın
2. Paylaş butonuna (📤) tıklayın
3. "Ana Ekrana Ekle" seçin

### Android (Chrome)
1. Uygulamayı Chrome'da açın
2. Menü (⋮) → "Uygulamayı yükle" veya "Ana ekrana ekle"

### Desktop (Chrome/Edge)
1. Adres çubuğundaki kurulum ikonuna tıklayın
2. "Yükle" butonuna tıklayın

## 🛠️ Teknolojiler

- **React 18** - UI Framework
- **Tailwind CSS** - Styling
- **Lucide React** - İkonlar
- **LocalStorage** - Veri saklama

## 📝 Lisans

MIT License - Dilediğiniz gibi kullanabilir, değiştirebilir ve dağıtabilirsiniz.

## 🤲 Dua

Allah hafızlık yolculuğunuzu mübarek kılsın ve Kur'an'ı hayatınıza hayat kılsın.

---

**Not**: Bu uygulama Medine Mushafı sayfa numaralarına göre hazırlanmıştır.
