# Panduan Lengkap Deployment YasixMerch (GTNIC 2026)

Panduan ini dirancang agar aplikasi **YasixMerch** dapat diakses secara online oleh dewan juri lomba maupun publik, dengan seluruh fungsi (POS Kasir, Shift, Antrean Print PDF, Katalog Produk, dan Pre-order Siswa) berjalan 100% normal.

---

## 🏗️ Rekomendasi Arsitektur (Opsi 1: PaaS)

Untuk hasil tercepat, gratis, dan stabil:
- **Database:** Railway MySQL (Tersedia dalam 1 klik di Railway)
- **Backend API:** Railway Web Service (Node.js + Prisma ORM)
- **Persistent Disk:** Railway Volume (Menyimpan file foto produk & PDF cetak agar tidak hilang)
- **Frontend SPA:** Vercel (Hosting gratis khusus Vite React, loading instan, CDN global, SSL otomatis)

```
[ Frontend: Vercel ]
        │
        ▼ HTTPS
[ Backend: Railway Service ] ◄── (Volume: /uploads)
        │
        ▼ Private Network
[ Database: Railway MySQL ]
```

---

## 🚀 Langkah 1: Persiapan Repository GitHub

1. Pastikan seluruh perubahan kode terbaru telah di-*commit* dan di-*push* ke repository GitHub Anda:
   ```bash
   git add .
   git commit -m "chore: setup deployment configurations"
   git push origin main
   ```

---

## 🐬 Langkah 2: Deploy Database & Backend di Railway

### A. Membuat Project & Database MySQL
1. Buka [Railway.app](https://railway.app/) dan login menggunakan akun GitHub Anda.
2. Klik **"+ New Project"** -> Pilih **"Provision MySQL"**.
3. Railway akan membuatkan database MySQL dalam beberapa detik.

### B. Deploy Backend Service
1. Di halaman project Railway yang sama, klik tombol **"+ New"** (atau "Add Service") -> Pilih **"GitHub Repo"**.
2. Pilih repository `Bussines-Center-Yasix`.
3. Klik service repository tersebut untuk membuka pengaturannya:
   - Masuk ke tab **"Settings"**:
     - Cari bagian **"Root Directory"** -> Klik **Edit** -> Ubah menjadi `/backend`.
     - Bagian **"Build Command"** -> Set ke: `npx prisma generate` *(atau biarkan membaca railway.json)*.
     - Bagian **"Pre-deploy Command"** -> Set ke: `npx prisma migrate deploy` *(PENTING: Dijalankan sebelum start di lingkungan yang sudah terhubung jaringan private database)*.
     - Bagian **"Start Command"** -> Set ke: `node index.js`.
   - Masuk ke tab **"Variables"** -> Tambahkan environment variables berikut:
     - `PORT`: `5000`
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: Masukkan URL internal MySQL Anda, atau klik **Add Reference** dan pilih `${{MySQL.DATABASE_URL}}` (misal: `mysql://root:PASSWORD@mysql.railway.internal:3306/railway`).
     - `JWT_SECRET`: `super_secret_jwt_key_gtnic_2026_yasix`
     - `JWT_EXPIRES_IN`: `1d`
   - Masuk ke tab **"Volumes"** (Sangat Penting):
     - Klik **"Add Volume"**.
     - Mount Path: `/app/uploads` (atau `uploads`).
     - *Fungsi: Menjaga agar foto produk dan file PDF pesanan antrean print siswa tidak terhapus saat backend mengalami restart/redeploy.*
   - Masuk ke tab **"Networking"**:
     - Pada bagian **Public Networking**, klik **"Generate Domain"**.
     - Salin domain yang dibuat, contoh: `https://yasix-backend-production.up.railway.app`.

### C. Menjalankan Seeding Data Awal (Akun Demo Juri)
Setelah migrasi skema berhasil dijalankan lewat Pre-deploy command:
1. Di service backend Railway, buka tab **"Deployments"** -> klik ikon **"..."** pada deployment aktif -> pilih **"Terminal"** (atau via Railway CLI).
2. Jalankan perintah seeding:
   ```bash
   node prisma/seed.js
   ```
   *(Alternatif jika ingin dari komputer lokal: Buka `backend/.env` di laptop Anda, ubah sementara `DATABASE_URL` ke Public URL MySQL Railway, lalu jalankan `npm run db:seed` di terminal lokal).*

---

## ⚡ Langkah 3: Deploy Frontend di Vercel

1. Buka [Vercel.com](https://vercel.com/) dan login dengan GitHub.
2. Klik tombol **"Add New..."** -> Pilih **"Project"**.
3. Cari repository `Bussines-Center-Yasix` dan klik **"Import"**.
4. Di halaman **Configure Project**:
   - **Framework Preset:** Vite (terdeteksi otomatis).
   - **Root Directory:** Klik tombol **Edit** di sebelahnya -> Pilih folder `frontend` -> Klik **Continue**.
   - **Build and Output Settings:** Biarkan default (`npm run build` dan `dist`).
   - **Environment Variables:** Buka dropdown dan tambahkan:
     - Key: `VITE_API_BASE_URL`
     - Value: `https://yasix-backend-production.up.railway.app/api/v1` *(Ganti dengan domain Railway backend yang Anda salin di Langkah 2, WAJIB diakhiri dengan `/api/v1` tanpa trailing slash)*.
5. Klik **"Deploy"**.
6. Tunggu sekitar 30 detik. Vercel akan menghasilkan URL aplikasi, misalnya: `https://yasix-merch.vercel.app`.

---

## 🔑 Kredensial Pengujian untuk Juri Lomba

Berikan URL Vercel kepada juri beserta kredensial berikut (sesuai data seed database):

| Role Pengguna | Email / Identifier | Password | Fitur yang Dapat Diuji Juri |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@smkyadika6.sch.id` | `password123` | Dashboard Analytics, Manajemen Produk & Kategori, Monitoring Shift Kasir, Monitoring Transaksi, Pengaturan |
| **Kasir** | `kasir@smkyadika6.sch.id` | `password123` | Buka Shift (Modal Kas), Terminal POS Ritel, Cetak Struk Thermal, Proses Antrean Cetak Dokumen, Pre-Order Pickup |
| **Siswa (Member)** | `siswa@smkyadika6.sch.id` | `password123` | Katalog Siswa, Order Cetak PDF Mandiri (Kalkulasi Halaman Otomatis), Pre-Order Barang, Monitoring Poin & QR Member |

---

## 🛡️ Checklist Verifikasi Akhir

- [ ] Halaman login terbuka dengan baik di URL Vercel.
- [ ] Buka rute langsung (misal refresh di `/admin/dashboard`) tidak menghasilkan 404 (sudah ditangani oleh `vercel.json`).
- [ ] Login Administrator berhasil dan menampilkan dashboard.
- [ ] Login Kasir berhasil: Masukkan saldo awal shift (misal Rp 50.000) dan masuk ke Terminal POS.
- [ ] Tambah transaksi POS ritel dan coba cetak struk thermal.
- [ ] Login Siswa berhasil: Coba unggah file PDF di menu Cetak Dokumen dan verifikasi jumlah halaman terdeteksi otomatis.
- [ ] Kasir membuka menu Antrean Print dan melihat pesanan cetak siswa tersebut.

---

## ❓ FAQ & Solusi Kendala Umum

1. **Muncul error `P1001: Can't reach database server` saat build image?**
   - Host privat `mysql.railway.internal` belum aktif/terhubung pada tahap *build time*. Pastikan `npx prisma migrate deploy` **TIDAK** dijalankan di Build Command, melainkan di **Pre-deploy Command** (atau gunakan file `backend/railway.json`).
2. **Muncul error CORS di konsol browser?**
   - Backend Express telah dipasangi middleware `cors()` yang mengizinkan semua origin, sehingga frontend Vercel dapat berkomunikasi tanpa terblokir. Pastikan format URL di `VITE_API_BASE_URL` lengkap dengan `https://` dan `/api/v1`.
3. **Apakah kredit Railway gratis cukup untuk lomba?**
   - Ya, Railway menyediakan trial credit $5/bulan yang lebih dari cukup untuk menjalankan backend dan MySQL selama periode penilaian lomba GTNIC 2026.
