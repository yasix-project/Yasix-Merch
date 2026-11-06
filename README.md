# YasixMerch — Smart Point of Sale & Automated Document Printing System

> Solusi Digitalisasi Transaksi dan Manajemen Antrean Terpadu Business Center SMK Yadika 6 (GTNIC 2026)

## 📌 Latar Belakang Masalah & Urgensi Inovasi

### 1. Masalah Operasional di Business Center (BC) SMK Yadika 6

Business Center (BC) SMK Yadika 6 merupakan unit produksi sekolah yang melayani kebutuhan harian ratusan siswa, guru, dan staf—mulai dari pembelian perlengkapan alat tulis kantor (ATK), seragam sekolah, merchandise kejuruan, hingga jasa cetak (print) dokumen tugas dan administrasi.

Pada periode krusial (jam istirahat, pergantian jam pelajaran, dan menjelang batas pengumpulan tugas), kerap terjadi **penumpukan antrean panjang (bottleneck)** di area konter kasir. Masalah ini berakar pada beberapa kendala operasional:

- **Pencatatan Transaksi Konvensional:** Petugas kasir membutuhkan waktu lama untuk menghitung belanjaan, mengecek ketersediaan stok fisik secara manual, dan menghitung nominal kembalian tanpa bantuan kalkulasi otomatis.
- **Kongesti Antrean Jasa Cetak (Print):** Siswa harus bergantian mencolokan flashdisk atau mengirim file via WhatsApp ke komputer kasir. Kasir kemudian harus membuka file, memeriksa jumlah halaman manual, menghitung biaya lembar demi lembar, dan mencetak langsung di tempat sehingga menghalangi alur pembelian barang ritel.
- **Risiko Selisih Kas (Fraud / Human Error):** Ketiadaan audit shift kasir terstruktur mengakibatkan uang modal awal dan rekap fisik saat pergantian kasir sulit ditelusuri secara akurat.

### 2. Solusi Inovasi (YasixMerch)

**YasixMerch** dirancang sebagai ekosistem kasir modern berbasis web yang mengintegrasikan penjualan ritel dan jasa percetakan mandiri dalam satu platform:

- **Terminal POS Kasir Ergonomis:** Dilengkapi _quick cash suggestions_, pencarian barcode kilat, integrasi diskon/voucher, dan cetak struk thermal otomatis via _react-to-print_.
- **Manajemen Shift Kasir Ketat:** Sistem penguncian layar sebelum kasir memasukkan modal awal (_Start Cash_) serta formulir rekonsiliasi kas fisik (_Actual Cash_) saat menutup sesi jaga kasir.
- **Antrean Cetak Mandiri (Self-Service Document Queue):** Siswa dapat mengunggah file PDF melalui portal mereka. Sistem otomatis membaca jumlah halaman secara server-side menggunakan pustaka `pdf-lib`, mengkalkulasi tarif cetak (warna vs hitam-putih), dan menempatkan pesanan pada antrean digital kasir tanpa perlu flashdisk.
- **Pre-order Siswa:** Memungkinkan siswa memesan barang di awal dan kasir tinggal memproses penyerahan barang di konter pengambilan.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend:**
  - **Core:** React, Vite
  - **Styling:** Tailwind CSS, Lucide React Icons
  - **State Management:** Zustand (Auth Session, Cart Store, dan LocalShift Persistence)
  - **Data Fetching & Cache:** TanStack Query (React Query)
  - **Printing Engine:** `react-to-print` (Thermal Receipt Direct Output)
- **Backend:**
  - **Runtime & Framework:** Node.js, Express.js (REST API Architecture)
  - **Database & ORM:** PostgreSQL / MySQL, Prisma ORM
  - **Document Parsing Engine:** `pdf-lib` (Ekstraksi Halaman PDF Server-side)
  - **Keamanan & Middleware:** JSON Web Token (JWT), Bcrypt, Express Rate Limiter, Multer File Filter

---

## 📂 Struktur Repositori

```text
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Skema database & relasi relasional
│   │   └── migrations/           # Riwayat migrasi skema database
│   ├── src/
│   │   ├── config/               # Prisma client & konfigurasi server
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middlewares/          # JWT Auth, Role-Based Access Control, Multer, Rate Limiter
│   │   ├── routes/               # Deklarasi router API Express
│   │   └── services/             # Abstraksi kalkulasi PDF & print logic
│   ├── uploads/                  # Media penyimpanan gambar produk & dokumen PDF
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios client & service call definitions
│   │   ├── components/           # Komponen UI modular (Buttons, Tables, Cart, Modals)
│   │   ├── hooks/                # Custom React Query hooks
│   │   ├── layouts/              # AdminLayout & KasirLayout (Shift-Locked)
│   │   ├── pages/                # Modul Kasir POS, Riwayat Transaksi, Antrean Print, Admin
│   │   ├── store/                # Zustand stores (useAuthStore, usePosStore, useShiftStore)
│   │   └── utils/                # Formatter mata uang Rupiah & tanggal
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 📋 Dokumentasi API Endpoints

Seluruh endpoint terproteksi mewajibkan header: `Authorization: Bearer <access_token>`.

### 1. Autentikasi (`/api/v1/auth`)

| Method | Endpoint          | Hak Akses | Deskripsi                                                     |
| :----- | :---------------- | :-------- | :------------------------------------------------------------ |
| `POST` | `/login`          | Public    | Login pengguna umum dengan rate limiting proteksi brute-force |
| `POST` | `/login/admin`    | Public    | Login khusus administrator dengan pengawasan ketat            |
| `POST` | `/register-siswa` | `ADMIN`   | Pendaftaran akun siswa/member baru                            |
| `GET`  | `/me`             | Protected | Mengambil profil user yang sedang aktif                       |
| `PUT`  | `/profile`        | Protected | Memperbarui profil akun user                                  |

### 2. Manajemen Shift Kasir (`/api/v1/shifts`)

| Method | Endpoint  | Hak Akses        | Deskripsi                                                       |
| :----- | :-------- | :--------------- | :-------------------------------------------------------------- |
| `POST` | `/start`  | `ADMIN`, `KASIR` | Membuka shift baru dan mencatat modal awal kas                  |
| `GET`  | `/active` | `ADMIN`, `KASIR` | Mengambil data shift yang sedang berjalan untuk kasir terkait   |
| `POST` | `/end`    | `ADMIN`, `KASIR` | Mengakhiri shift dan mengirim laporan uang fisik aktual di laci |
| `GET`  | `/`       | `ADMIN`          | Rekapitulasi seluruh riwayat shift kasir                        |

### 3. Master Data Produk & Kategori (`/api/v1/products` & `/api/v1/categories`)

| Method   | Endpoint              | Hak Akses        | Deskripsi                                            |
| :------- | :-------------------- | :--------------- | :--------------------------------------------------- |
| `GET`    | `/products`           | Protected        | Mengambil seluruh katalog produk aktif               |
| `GET`    | `/products/low-stock` | `ADMIN`, `KASIR` | Peringatan stok produk yang menyentuh batas minStock |
| `GET`    | `/products/:id`       | Protected        | Mengambil rincian detail 1 produk                    |
| `POST`   | `/products`           | `ADMIN`          | Tambah produk baru beserta upload berkas foto        |
| `PUT`    | `/products/:id`       | `ADMIN`          | Perbarui data produk dan foto                        |
| `DELETE` | `/products/:id`       | `ADMIN`          | Nonaktifkan / hapus produk                           |
| `GET`    | `/categories`         | Protected        | Mengambil seluruh daftar kategori produk             |
| `POST`   | `/categories`         | `ADMIN`          | Tambah kategori baru                                 |
| `PUT`    | `/categories/:id`     | `ADMIN`          | Perbarui nama kategori                               |
| `DELETE` | `/categories/:id`     | `ADMIN`          | Hapus kategori                                       |

### 4. Transaksi & POS Kasir (`/api/v1/transactions`)

| Method  | Endpoint        | Hak Akses        | Deskripsi                                                        |
| :------ | :-------------- | :--------------- | :--------------------------------------------------------------- |
| `POST`  | `/checkout`     | `ADMIN`, `KASIR` | Checkout transaksi POS kasir langsung (mengurangi stok otomatis) |
| `GET`   | `/`             | `ADMIN`, `KASIR` | Riwayat seluruh transaksi                                        |
| `GET`   | `/:id`          | `ADMIN`, `KASIR` | Detail transaksi tunggal untuk pencetakan ulang struk thermal    |
| `POST`  | `/pre-order`    | `SISWA`          | Pesanan barang mandiri sebelum diambil ke konter                 |
| `PATCH` | `/:id/complete` | `ADMIN`, `KASIR` | Konfirmasi penyerahan barang dan pelunasan pre-order             |
| `PATCH` | `/:id/cancel`   | `ADMIN`, `KASIR` | Batalkan transaksi dan kembalikan stok ke etalase                |

### 5. Antrean Cetak Dokumen (`/api/v1/print`)

| Method | Endpoint    | Hak Akses        | Deskripsi                                                            |
| :----- | :---------- | :--------------- | :------------------------------------------------------------------- |
| `POST` | `/estimate` | Protected        | Unggah dokumen sementara untuk kalkulasi otomatis jumlah halaman PDF |
| `POST` | `/order`    | Protected        | Kirim berkas PDF final untuk masuk ke antrean cetak Business Center  |
| `GET`  | `/orders`   | `ADMIN`, `KASIR` | Melihat antrean pesanan cetak masuk secara real-time                 |

### 6. Siswa, Diskon, & Analitik

| Method  | Endpoint               | Hak Akses        | Deskripsi                                                  |
| :------ | :--------------------- | :--------------- | :--------------------------------------------------------- |
| `GET`   | `/students`            | `ADMIN`, `KASIR` | Menampilkan seluruh direktori siswa / member               |
| `PATCH` | `/students/:id/points` | `ADMIN`, `KASIR` | Tambah atau kurangi poin loyalitas siswa                   |
| `GET`   | `/vouchers`            | Protected        | Daftar kupon voucher promo yang aktif                      |
| `POST`  | `/vouchers/validate`   | Protected        | Validasi keabsahan kupon diskon saat checkout kasir        |
| `GET`   | `/analytics/dashboard` | `ADMIN`          | Metrik omzet, total transaksi harian, dan grafik penjualan |
| `GET`   | `/analytics/sales`     | `ADMIN`          | Laporan data penjualan untuk kebutuhan rekapitulasi        |

---

## 🔑 Akun Uji Coba Pengujian (Demo Review)

Gunakan kredensial pengujian berikut untuk mengevaluasi fitur pada masing-masing tingkatan hak akses:

### 1. Administrator (Manajemen & Analitik)
- **Portal Login:** `/admin/login` **(ROUTES RAHASIA)**
- **Nama Pengguna:** `Admin YasixMerch`
- **Email:** `admin@smkyadika6.sch.id`
- **Password:** `password123`
- **Fitur Utama yang Dapat Diuji:**
  - 📊 **Dashboard Analitik:** Monitoring omzet harian, grafik transaksi ritel & print, serta metrik performa.
  - 📦 **Master Produk & Kategori:** Menambah dan mengedit produk, kalkulasi margin otomatis, batas minimum stok, dan unggah foto produk.
  - 👥 **Kelola Siswa & Loyalitas:** Direktori siswa/member dan pengelolaan saldo poin.
  - 🎟️ **Manajemen Voucher:** Pembuatan kode promo diskon nominal/persentase.
  - 🕒 **Audit Shift Kasir:** Rekapitulasi modal awal (*start cash*) vs setoran kas fisik (*actual cash*) dari setiap kasir.
  - 🧾 **Monitoring Transaksi:** Audit seluruh riwayat penjualan dan status pesanan *pre-order*.

### 2. Kasir (Terminal POS & Operasional)
- **Portal Login:** `/login`
- **Nama Pengguna:** `Kasir Shift 1`
- **Email:** `kasir@smkyadika6.sch.id`
- **Password:** `password123`
- **Fitur Utama yang Dapat Diuji:**
  - 🔐 **Buka Shift Kasir:** Input modal awal laci (*Start Cash*) untuk membuka proteksi layar kasir.
  - 🛒 **Terminal POS Ritel:** Pencarian barcode instan, tombol nominal cepat (*quick cash*), dan kalkulasi kembalian.
  - 🖨️ **Cetak Struk Thermal:** Pencetakan struk transaksi langsung via format thermal 58mm/80mm.
  - 📄 **Antrean Cetak Digital:** Memantau dokumen PDF yang dikirim siswa, validasi kalkulasi lembar & warna, dan eksekusi cetak.
  - 📦 **Pre-order Pickup:** Konfirmasi penyerahan dan pelunasan barang pesanan siswa di konter.
  - 🚪 **Tutup Shift Kasir:** Rekonsiliasi kas fisik (*Actual Cash*) untuk mendeteksi selisih kas sebelum berganti giliran jaga.

### 3. Siswa (Member & Pemesanan Mandiri)
- **Portal Login:** `/login`
- **Nama Pengguna:** `Siswa Demo`
- **Email:** `siswa@smkyadika6.sch.id`
- **Password:** `password123`
- **NIS:** `20261001`
- **QR Code Member:** `MEMBER-20261001`
- **Saldo Poin Awal:** `50 Poin`
- **Fitur Utama yang Dapat Diuji:**
  - 🛍️ **Katalog Ritel & Pre-order:** Melihat etalase ATK/merchandise sekolah dan melakukan pemesanan awal (*booking*).
  - 📑 **Self-Service Print Queue:** Unggah berkas PDF tugas, sistem menghitung otomatis jumlah halaman warna vs hitam putih via `pdf-lib` dan menghasilkan estimasi harga instan.
  - 📱 **Kartu Member Digital:** Membuka kartu member virtual dengan QR Code untuk discan di meja kasir.
  - 📜 **Pelacakan Status Pesanan:** Memantau apakah dokumen print sudah siap diambil (*READY*) atau selesai (*COMPLETED*).

---

## 🔗 Tautan Media & Demonstrasi

- **Aplikasi Live Demo:** `[ISI_URL_DEPLOYMENT_FRONTEND]`
- **API Server Endpoint:** `[ISI_URL_DEPLOYMENT_BACKEND]`
- **Video Demonstrasi & Presentasi Produk:** `[ISI_LINK_VIDEO_YOUTUBE_ATAU_DRIVE]`

---

## 👥 Tim Inovasi GTNIC 2026

- **Institusi:** SMK Yadika 6
- **Bidang Inovasi:** Software Engineering & Digital Transformation
- **Susunan Tim Pengembang:**
  - `Sep Meyer Vander F.D` — Lead Developer / Backend & Database Engineer
  - `Miracle Benaya C.T` — Frontend & UI/UX Specialist
  - `M. Khalil Khairudin` — Fullstack Engineer
