# Anniversary Scrollytelling

Aplikasi web interaktif scrollytelling untuk merayakan anniversary dengan animasi scroll yang indah dan storytelling yang engaging.

## Deployment ke Vercel

### Prerequisites
- [Vercel CLI](https://vercel.com/cli) installed globally: `npm i -g vercel`
- [Git](https://git-scm.com/) installed
- [GitHub](https://github.com/) account

### Step-by-Step Deployment

1. **Initialize Git Repository (jika belum ada):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push ke GitHub:**
   ```bash
   # Buat repository baru di GitHub dulu, lalu:
   git remote add origin https://github.com/yourusername/anniversary-scrollytelling.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy ke Vercel:**
   ```bash
   # Login ke Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

4. **Alternatif: Deploy via Vercel Dashboard**
   - Kunjungi [vercel.com](https://vercel.com/)
   - Connect akun GitHub Anda
   - Import repository Anda
   - Vercel akan otomatis detect sebagai Node.js project
   - Click "Deploy"

### Konfigurasi Environment
App ini berjalan di Node.js dengan Express.js server dan serve static files dari directory `public`.

## Fitur

- ✨ **Scrollytelling Interaktif**: Cerita yang berubah seiring dengan scroll
- 🎨 **Animasi Smooth**: Transisi dan animasi yang halus
- 📱 **Responsive Design**: Berfungsi sempurna di desktop dan mobile
- 🎯 **Navigation Dots**: Navigasi visual untuk melompat ke section tertentu
- 📊 **Progress Bar**: Indikator progress scroll
- 💫 **Parallax Effects**: Efek parallax untuk pengalaman visual yang menarik
- 🎪 **Touch/Swipe Support**: Dukungan navigasi touch untuk perangkat mobile

## Teknologi Yang Digunakan

- **Backend**: Node.js dengan Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **Development**: Nodemon untuk hot reload

## Cara Menjalankan

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   Atau untuk production:
   ```bash
   npm start
   ```

3. **Akses Aplikasi**
   Buka browser dan kunjungi `http://localhost:3000`

## Struktur Project

```
anniversary-scrollytelling/
├── server.js                 # Express server
├── package.json              # Dependencies dan scripts
├── README.md                 # Dokumentasi
└── public/                   # Static files
    ├── index.html            # Main HTML file
    ├── styles/
    │   └── main.css          # Main stylesheet
    └── js/
        ├── main.js           # Main application logic
        └── scroll-animations.js  # Scroll animation handlers
```

## Kustomisasi Konten

### Mengedit Konten Anniversary

Edit file `server.js` pada bagian `/api/anniversary-data` untuk mengubah:
- Judul dan subtitle
- Section-section cerita
- Tahun dan konten
- Placeholder untuk gambar

### Menambah Section Baru

1. Tambahkan object baru di array `sections` dalam API endpoint
2. Format yang diperlukan:
   ```javascript
   {
       id: "unique-id",
       title: "Judul Section",
       content: "Konten cerita untuk section ini...",
       year: "2024",
       image: "nama-file-gambar.jpg"
   }
   ```

### Mengganti Gambar

1. Tempatkan file gambar di folder `public/images/`
2. Update referensi gambar di data API
3. Atau modifikasi function `createImageElement()` di `main.js`

## Kustomisasi Visual

### Warna dan Theme

Edit file `public/styles/main.css`:
- Gradient backgrounds: Cari `.hero-section`, `.story-section`
- Accent colors: Ubah variable warna `#667eea` dan `#764ba2`
- Text colors: Modifikasi di bagian typography

### Animasi

Edit file `public/js/scroll-animations.js`:
- Timing animasi: Ubah duration di CSS transitions
- Threshold visibility: Modifikasi nilai di `isElementInViewport()`
- Parallax speed: Sesuaikan di `initParallax()`

## API Endpoints

- `GET /` - Halaman utama
- `GET /api/anniversary-data` - Data konten anniversary dalam format JSON

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

1. **Optimasi Gambar**: Gunakan format WebP atau AVIF untuk gambar
2. **Lazy Loading**: Implementasikan lazy loading untuk konten di bawah fold
3. **Compression**: Enable gzip compression di server
4. **CDN**: Gunakan CDN untuk static assets

## Development

### Hot Reload

Gunakan `npm run dev` untuk development dengan nodemon yang akan restart server otomatis saat ada perubahan.

### Adding Features

1. **New Animations**: Tambahkan di `scroll-animations.js`
2. **New Sections**: Modifikasi struktur data di API
3. **New Styles**: Extend CSS di `main.css`

## Deployment

### Production Build

```bash
npm start
```

### Environment Variables

Set `PORT` environment variable untuk custom port:
```bash
PORT=8080 npm start
```

## Kontribusi

1. Fork repository ini
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## License

MIT License - Silakan gunakan untuk project personal atau komersial.

---

💝 **Selamat Anniversary!** Semoga aplikasi ini membantu Anda merayakan momen spesial dengan cara yang unik dan berkesan.