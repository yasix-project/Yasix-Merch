# YasixMerch — Smart Point of Sale & Automated Document Printing System

> Solusi Digitalisasi Transaksi dan Manajemen Antrean Terpadu Business Center SMK Yadika 6

---

## 📌 Latar Belakang Masalah & Solusi Inovasi

### Permasalahan

Business Center (BC) SMK Yadika 6 merupakan unit produksi sekolah yang melayani kebutuhan operasional harian ratusan siswa dan guru, mulai dari pembelian alat tulis kantor (ATK), atribut seragam, konsumsi, hingga jasa cetak (print) dokumen tugas.

Pada jam-jam krusial seperti jam istirahat dan jam masuk sekolah, sering terjadi **penumpukan antrean panjang (bottleneck)** di area konter kasir. Masalah ini dipicu oleh:

1. **Pencatatan Transaksi Manual/Konvensional:** Waktu transaksi per pelanggan lambat karena kasir harus menghitung total belanja, memeriksa stok manual, dan menulis nota secara manual.
2. **Antrean Jasa Cetak yang Tidak Efisien:** Siswa harus menyerahkan flashdisk atau mengirim file via WhatsApp secara bergantian di komputer kasir, menunggu dokumen dihitung halamannya secara manual, dan menunggu dokumen dicetak saat itu juga, yang menghambat antrean transaksi barang fisik.
3. **Rekonsiliasi Kas yang Rentan Selisih (Fraud/Human Error):** Tidak adanya sistem shift yang mengunci modal awal dan menghitung fisik kas saat pergantian petugas jaga kasir.

### Solusi Inovasi (YasixMerch)

**YasixMerch** hadir sebagai sistem terpadu (*All-in-One School POS & Self-Service Printing Platform*) yang memecah kepadatan di Business Center melalui:

* **Terminal POS Kasir Cepat:** Antarmuka kasir berbasis web yang responsif dengan *quick cash*, pemindaian barcode, integrasi diskon/member NIS siswa, dan cetak struk thermal otomatis.
* **Manajemen Shift Kasir Ketat:** Alur buka/tutup shift dengan validasi modal awal dan uang fisik akhir untuk menjamin akuntabilitas kas operasional.
* **Sistem Antrean Cetak Mandiri (Self-Service Print Queue):** Siswa dapat mengunggah file PDF secara mandiri dari perangkat mereka, sistem membaca jumlah halaman secara otomatis via `pdf-lib`, menghitung estimasi biaya seketika, dan kasir cukup memproses dokumen dari antrean layar khusus tanpa flashdisk.


* **Pre-order Transaksi Siswa:** Fitur pemesanan mandiri oleh siswa untuk mengurangi antrean di depan etalase barang.



---

## 🛠️ Tech Stack

* **Frontend:** React 18 / 19, Vite, Tailwind CSS v4, Zustand (State Management), TanStack Query v5 (Server Cache & Synchronization), Lucide React, React-to-Print.
* **Backend:** Node.js, Express.js (RESTful API Architecture).
* **Database & ORM:** PostgreSQL / MySQL, Prisma ORM.
* **Libraries & Keamanan:** `pdf-lib` (Document Parsing & Page Counting), Multer (File Handling), Express Rate Limit (Brute Force Protection), JWT & Bcrypt (Authentication & RBAC).



---

## 📂 Struktur Direktori Repositori

```text
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # Skema database & relasi tabel
│   ├── src/
│   │   ├── config/               # Konfigurasi database & environment
│   │   ├── controllers/          # Logika pemrosesan data API
│   │   ├── middlewares/          # Auth JWT, RBAC, Upload Multer, Rate Limiter
│   │   ├── routes/               # Routing endpoint API Express
│   │   └── services/             # Abstraksi business logic & hitungan PDF
│   ├── uploads/                  # Penyimpanan lokal gambar produk & dokumen cetak
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Axios instance & service layer
│   │   ├── components/           # UI kit modular & sub-komponen POS
│   │   ├── hooks/                # Custom hooks TanStack Query
│   │   ├── layouts/              # AdminLayout & KasirLayout (Shift Protected)
│   │   ├── pages/                # Halaman Admin, Kasir POS, Riwayat, & Antrean Print
│   │   ├── store/                # Zustand stores (Auth, POS Cart, Shift)
│   │   └── utils/                # Formatter Rupiah, Tanggal, Helper gambar
│   ├── package.json
│   └── vite.config.js
│
└── README.md

```

---

## 📋 Dokumentasi API Endpoints

Seluruh endpoint terproteksi mewajibkan header: `Authorization: Bearer <token>`.

### 1. Autentikasi (`/api/v1/auth`)

| Method | Endpoint | Hak Akses | Deskripsi |
| --- | --- | --- | --- |
| `POST` | `/login`

 | Publik

 | Login umum pengguna dengan rate limiter

 |
| `POST` | `/login/admin`

 | Publik

 | Login khusus administrator dengan rate limiter ketat

 |
| `POST` | `/register-siswa`

 | `ADMIN`

 | Mendaftarkan akun siswa baru ke dalam sistem

 |
| `GET` | `/me`

 | Terautentikasi

 | Mengambil data profil pengguna yang sedang login

 |
| `PUT` | `/profile`

 | Terautentikasi

 | Memperbarui informasi profil pengguna

 |

### 2. Shift Kasir (`/api/v1/shifts`)

| Method | Endpoint | Hak Akses | Deskripsi |
| --- | --- | --- | --- |
| `POST` | `/start`

 | `ADMIN`, `KASIR`

 | Membuka shift kasir baru dan input modal awal kas |
| `GET` | `/active`

 | `ADMIN`, `KASIR`

 | Memeriksa status shift kasir yang aktif saat ini |
| `POST` | `/end`

 | `ADMIN`, `KASIR`

 | Menutup shift kasir dan input rekonsiliasi kas fisik |
| `GET` | `/`

 | `ADMIN`

 | Menampilkan seluruh riwayat shift kasir |

### 3. Produk & Kategori (`/api/v1/products` & `/api/v1/categories`)

| Method | Endpoint | Hak Akses | Deskripsi |
| --- | --- | --- | --- |
| `GET` | `/products`

 | Terautentikasi

 | Mengambil seluruh katalog produk aktif

 |
| `GET` | `/products/low-stock`

 | `ADMIN`, `KASIR`

 | Peringatan stok produk yang menyentuh batas minimum

 |
| `GET` | `/products/:id`

 | Terautentikasi

 | Mengambil detail spesifik produk

 |
| `POST` | `/products`

 | `ADMIN`

 | Menambahkan produk baru (mendukung upload gambar)

 |
| `PUT` | `/products/:id`

 | `ADMIN`

 | Memperbarui data produk & gambar

 |
| `DELETE` | `/products/:id`

 | `ADMIN`

 | Menghapus data produk

 |
| `GET` | `/categories`

 | Terautentikasi

 | Mengambil seluruh daftar kategori produk

 |
| `POST` | `/categories`

 | `ADMIN`

 | Menambahkan kategori baru

 |

### 4. Transaksi & POS (`/api/v1/transactions`)

| Method | Endpoint | Hak Akses | Deskripsi |
| --- | --- | --- | --- |
| `POST` | `/checkout`

 | `ADMIN`, `KASIR`

 | Checkout transaksi langsung di terminal POS kasir |
| `GET` | `/`

 | `ADMIN`, `KASIR`

 | Mengambil seluruh riwayat transaksi penjualan

 |
| `GET` | `/:id`

 | `ADMIN`, `KASIR`

 | Detail transaksi untuk cetak/cetak ulang struk

 |
| `POST` | `/pre-order`

 | `SISWA`

 | Pemesanan barang secara mandiri oleh siswa

 |
| `PATCH` | `/:id/complete`

 | `ADMIN`, `KASIR`

 | Pelunasan dan pengambilan barang pesanan pre-order

 |
| `PATCH` | `/:id/cancel`

 | `ADMIN`, `KASIR`

 | Pembatalan transaksi & pengembalian stok barang

 |

### 5. Jasa Cetak Dokumen (`/api/v1/print`)

| Method | Endpoint | Hak Akses | Deskripsi |
| --- | --- | --- | --- |
| `POST` | `/estimate`

 | Terautentikasi

 | Parsing PDF otomatis untuk hitung halaman & biaya

 |
| `POST` | `/order`

 | Terautentikasi

 | Submit order cetak dokumen mandiri oleh siswa

 |
| `GET` | `/orders`

 | `ADMIN`, `KASIR`

 | Menampilkan antrean order cetak aktif di kasir

 |

### 6. Siswa, Voucher & Analitik

| Method | Endpoint | Hak Akses | Deskripsi |
| --- | --- | --- | --- |
| `GET` | `/students`

 | `ADMIN`, `KASIR`

 | Daftar data siswa/member Business Center

 |
| `PATCH` | `/students/:id/points`

 | `ADMIN`, `KASIR`

 | Penambahan atau pemotongan poin loyalitas siswa

 |
| `POST` | `/vouchers/validate`

 | Terautentikasi

 | Validasi kupon diskon sebelum transaksi diproses

 |
| `GET` | `/analytics/dashboard`

 | `ADMIN`

 | Metrik ringkasan omzet, laba, dan penjualan

 |
| `GET` | `/analytics/sales`

 | `ADMIN`

 | Laporan penjualan berkala untuk monitoring

 |

---

## 🔑 Akun Uji Coba Pengujian Juri

Gunakan kredensial berikut untuk menguji masing-masing *role* hak akses pada antarmuka aplikasi:

| Role | Username / Email | Password | Hak Akses Utama |
| --- | --- | --- | --- |
| **ADMINISTRATOR** | `[ISI_EMAIL_ADMIN]` | `[ISI_PASSWORD_ADMIN]` | Back-office penuh, Analitik Dashboard, Manajemen Produk/Kategori/Voucher. |
| **KASIR** | `[ISI_EMAIL_KASIR]` | `[ISI_PASSWORD_KASIR]` | Buka/Tutup Shift, Terminal POS Kasir, Riwayat Transaksi, Antrean Print. |
| **SISWA (MEMBER)** | `[ISI_EMAIL_SISWA]` | `[ISI_PASSWORD_SISWA]` | Order Print Mandiri, Pre-order Barang, Cek Poin & Riwayat Belanja. |

---

## 🔗 Tautan Media & Demonstrasi

* **Live Demo Aplikasi:** `[ISI_URL_DEPLOYMENT_FRONTEND]`
* **API Server Base URL:** `[ISI_URL_DEPLOYMENT_BACKEND]`
* **Video Demonstrasi Produk (YouTube / Drive):** `[ISI_LINK_VIDEO_GTNIC]`

---

## 👥 Tim Pengembang (GTNIC 2026)

* **Institusi:** SMK Yadika 6
* **Kategori Inovasi:** Software & Digital Transformation
* **Kontributor:** `[ISI_NAMA_LENGKAP_ANGGOTA_TIM]`
