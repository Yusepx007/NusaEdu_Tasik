# 🌴 NusaEdu Tasikmalaya: Digitalisasi Pariwisata & UMKM

> **NusaEdu Tasikmalaya** adalah platform *Mobile Web & AI Tour Guide* interaktif yang dirancang untuk mempromosikan pariwisata, sejarah, dan UMKM di Kota Tasikmalaya. Menggunakan teknologi **Computer Vision (AI Image Matching)** dan **Gamifikasi Edukasi**, aplikasi ini memberikan pengalaman menjelajah kota yang edukatif, modern, dan menyenangkan.

---

## 🌐 Live Deployment Links

| Layanan | Platform | URL Live |
|---|---|---|
| **Frontend Mobile Web** | Vercel | [https://nusaedu-tasik.vercel.app](https://nusaedu-tasik.vercel.app) |
| **Backend API (Laravel)** | Shared Hosting | `https://nusaedu.kotapintar.my.id/api` |
| **AI Scanner API (Python)** | Shared Hosting | `https://kotapintar.my.id/ai` |

---

## 📊 Status Fitur Aplikasi

### ✅ 1. Fitur yang Sudah Selesai & Berfungsi (Fully Functional)

* **📱 Mobile Web Application (Next.js 16 + React 19 + PWA)**:
  * Antarmuka *Mobile-First* modern dengan *smooth micro-animations*, *glassmorphism*, dan performa cepat.
  * Dukungan **PWA (Progressive Web App)** — dapat di-install di layar utama HPAndroid / iOS.
  * Navigasi lengkap: Halaman Utam (*Home*), Katalog Destinasi, Detail Destinasi, Kuis Edukasi, Scan AI, Peta Digital, Mitra UMKM, Komunitas, & Profil User.
  * Penanganan gambar otomatis (*Image Fallback Resolver*) jika URL gambar dari API backend kosong/gagal muat.

* **🔍 AI Image Scanner (Computer Vision - OpenCV ORB + Lowe's Ratio Test)**:
  * Pemindaian lansung melalui kamera perangkat atau unggah foto dari galeri.
  * **Analisis Keyakinan AI (Confidence Score 0-100%)**: Menampilkan persentase akurasi pencocokan gambar.
  * **Sistem Anti-Overfitting (Margin Check)**: Mencegah kesalahan identifikasi tempat dengan membandingkan selisih poin kandidat destinasi terbaik dan runner-up.
  * Pengenalan otomatis & enrichment data destinasi (Nama, Deskripsi, Lokasi, Jam Buka, Tiket, Kategori) saat scan berhasil.
  * Tombol simpan kunjungan untuk menambah poin pengguna ke backend.

* **🧠 Kuis Interaktif & Edukasi Pariwisata**:
  * **Bank Soal Edukasi (22+ Soal)** mencakup Sejarah, Budaya, Kuliner, Landmark, & Geografi Tasikmalaya.
  * Pengocokan soal (*randomized questions*) — 20 soal acak dipilih setiap kali memulai kuis.
  * **Sistem Streak Bonus**: Jawaban benar 3x berturut-turut mendapatkan bonus +5 poin ekstra!
  * Halaman hasil kuis interaktif dengan medali akurasi (🥇 / 🥈 / 🥉 / 📚) & sinkronisasi poin ke akun user.

* **🔐 Backend & Integrasi Data (Laravel API)**:
  * Autentikasi pengguna (Login, Register, User Session).
  * API Destinasi Wisata, Mitra UMKM, Kuis, Posting Komunitas, & Riwayat Kunjungan.
  * Poin gamifikasi terkumpul otomatis pada profil pengguna.

---

### ⏳ 2. Fitur Dalam Tahap Pengembangan / Belum Berjalan Optimal (Roadmap)

* **📸 Ekspansi Dataset Foto Referensi AI (Perlu Tambahan Foto)**:
  * **Status**: Saat ini dataset foto referensi terlengkap (~100 foto pagi & malam) baru tersedia untuk **Alun-Alun Kota Tasikmalaya**.
  * **Keterangan**: Destinasi lain seperti **Patung KH Zainal Mustofa**, **Tugu Adipura**, dan **Situ Gede** saat ini baru menggunakan *seed reference* dasar (1 foto). Diperlukan penambahan 15–30 foto per destinasi dari berbagai sudut dan pencahayaan agar akurasi AI scanner di atas 70%.

* **📍 Validasi Real-time GPS Geofencing**:
  * **Rencana**: Memverifikasi koordinat GPS fisik pengguna saat men-scan lokasi objek wisata untuk memastikan pengguna benar-benar berada di tempat tersebut sebelum poin diberikan.

* **🗺️ Peta Digital Live Route (Mapbox / Leaflet API)**:
  * **Status**: Tampilan peta lokasi destinasi saat ini masih dalam skema visual dasar.
  * **Rencana**: Integrasi peta rute GPS interaktif dengan navigasi petunjuk arah langsung ke tempat wisata atau lokasi mitra UMKM terdekat.

* **🤖 Upgrade AI Model ke YOLOv8 / CNN Custom**:
  * **Rencana**: Meng-upgrade engine scanning dari OpenCV ORB (Feature Matching) ke model deep learning YOLOv8 untuk memungkinkan pendeteksian produk kerajinan/kuliner UMKM secara multi-object.

---

## 📂 Struktur Proyek

```text
NusaEdu_Tasik/
├── mobile-web/                # Frontend Mobile Web (Next.js 16, React 19, TypeScript, PWA)
├── Backend/                   # Backend API (Laravel 10/11, MySQL, REST API)
├── nusaedu-ai/                # Service AI Python Flask (OpenCV, Feature Extraction, Matching Engine)
└── nusaedu_db.sql             # Skema Database MySQL
```

---

## 🛠️ Panduan Instalasi Lokal

### 1. Frontend Mobile Web (`mobile-web`)
```bash
cd mobile-web
npm install
npm run dev -- --webpack
```
Aplikasi dapat dibuka di browser: `http://localhost:3000`

### 2. Backend Laravel (`Backend`)
```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### 3. AI Service (`nusaedu-ai`)
```bash
cd nusaedu-ai
python -m venv venv
# Aktifkan venv (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python app.py
```
API AI akan berjalan di `http://127.0.0.1:5001` (atau port 7860).

---

## 📄 Lisensi

Private Project — Hak Cipta Dilindungi Undang-Undang.
