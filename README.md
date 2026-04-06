# 30 Days — Productivity Tracker

30 günlük verimlilik takipçisi PWA. Günlük hedefler, alışkanlık takibi, enerji/odak puanlama, su/kahve/adım metrikleri ve Spotify Wrapped tarzı aylık özet.

## Kurulum

```bash
git clone https://github.com/KULLANICI_ADIN/30days.git
cd 30days
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173/30days/` adresinde açılır.

## Deploy (GitHub Pages)

1. GitHub'da `30days` adında yeni repo oluştur
2. Kodu push'la:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADIN/30days.git
   git push -u origin main
   ```
3. GitHub repo → **Settings** → **Pages** → Source: **GitHub Actions** seç
4. İlk push'ta otomatik build + deploy başlar
5. Birkaç dakika sonra `https://KULLANICI_ADIN.github.io/30days/` adresinde canlı

## Özelleştirme

Repo adını değiştirirsen, şu dosyalarda base path'i güncelle:
- `vite.config.js` → `base: '/REPO_ADI/'`
- `index.html` → tüm `/30days/` referansları
- `public/manifest.json` → `start_url` ve `scope`
- `public/sw.js` → `BASE` değişkeni
- `src/main.jsx` → SW register path

## Teknolojiler

- React 18 + Vite
- localStorage (veri saklama)
- Service Worker (çevrimdışı destek)
- PWA (Add to Home Screen)
