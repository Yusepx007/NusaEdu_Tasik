# NusaEdu Tasikmalaya: Digitalisasi Pariwisata dan UMKM

> **NusaEdu Tasikmalaya** adalah platform berbasis AI yang dirancang untuk mempromosikan pariwisata dan UMKM di Kota Tasikmalaya. Melalui teknologi Computer Vision dan Gamifikasi, aplikasi ini mengubah pengalaman menjelajah kota menjadi petualangan yang interaktif dan edukatif.

![Preview Antarmuka Aplikasi NusaEdu](/Backend/public/images/nusaedu-preview.png)

## 🚀 Fitur Unggulan

### 1. AI-Powered Tour Guide
Menggunakan model **YOLOv8** dan **Embedding Similarity**, sistem mampu mengenali landmark ikonik dan produk UMKM dari foto yang diunggah pengguna secara akurat.

**Fitur Detail:**
- **Pengenalan Landmark**: Mendeteksi objek seperti Tugu Adipura, Alun-Alun, dan Situ Gede.
- **Produk UMKM**: Mengidentifikasi makanan khas dan kerajinan lokal yang tersebar di seluruh Tasikmalaya.
- **Validasi Real-time**: Sistem mengecek apakah objek yang difoto benar-benar berada di lokasi yang dituju melalui koordinat GPS pengguna.

### 2. Sistem Poin & Ranking (Gamifikasi)
Setiap destinasi atau UMKM yang berhasil di-scan memberikan poin kepada pengguna, mendorong mereka untuk lebih aktif berkeliling kota.

- **Papan Peringkat (Leaderboard)**: Menampilkan pengguna dengan poin tertinggi.
- **Koleksi Digital**: Pengguna mengumpulkan "koleksi" berupa item digital setiap kali berhasil mengunjungi lokasi atau membeli produk.

### 3. Ekosistem Digital
- **Backend**: API Laravel dengan arsitektur Modular Monolith.
- **Frontend**: Aplikasi Mobile Web responsif yang dapat diakses melalui browser di perangkat apa pun.
- **AI Service**: Layanan mandiri yang terintegrasi melalui API untuk efisiensi pelatihan dan deployment.

## 📂 Struktur Proyek

```
NusaEdu_Tasik/
├── nusaedu-ai/                # Modul AI (Model YOLO & Embedding)
├── Backend/                   # API Laravel (Auth, Database, Scoring)
├── mobile-web/                # Frontend Mobile Web (React)
└── nusaedu_db.sql             # Skema Database
```

## 🛠 Instalasi & Deployment

Untuk menjalankan proyek ini, ikuti panduan instalasi untuk setiap komponen.

### 1. Backend (Laravel)
1.  Pastikan sudah terinstal **PHP >= 8.1** dan **Composer**.
2.  Navigasi ke folder `Backend`:
    ```bash
    cd Backend
    ```
3.  Install dependensi:
    ```bash
    composer install
    ```
4.  Konfigurasi environment dan database:
    ```bash
    cp .env.example .env
    # Edit file .env sesuai konfigurasi server Anda
    ```
5.  Migrasi database:
    ```bash
    php artisan migrate
    ```
6.  Jalankan server:
    ```bash
    php artisan serve
    ```

### 2. AI Service (YOLOv8)
1.  Install Python dan dependensi yang diperlukan:
    ```bash
    cd nusaedu-ai
    pip install -r requirements.txt
    ```
2.  Siapkan model dengan melatih dataset landmark dan UMKM.
    ```bash
    # (Lihat README.md di folder nusaedu-ai untuk detail training)
    python train.py --data ../data/dataset.yaml
    ```
3.  Jalankan API AI:
    ```bash
    uvicorn main:app --reload
    ```

### 3. Frontend (Mobile Web)
1.  Install Node.js dan npm.
2.  Navigasi ke folder `mobile-web`:
    ```bash
    cd mobile-web
    ```
3.  Install dependensi:
    ```bash
    npm install
    ```
4.  Jalankan server development:
    ```bash
    npm run dev
    ```

## 🤝 Kontribusi

Proyek ini adalah inisiatif kolaboratif. Kontribusi dipersilakan! Silakan fork repositori, buat branch fitur (`git checkout -b feature/AmazingFeature`), commit perubahan (`git commit -m 'Add some AmazingFeature'`), lalu push ke branch (`git push origin feature/AmazingFeature`).

## 📄 Lisensi

Private Project - All rights reserved.
