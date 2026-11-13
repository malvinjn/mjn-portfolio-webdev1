# MJN.dev — Personal Portfolio & Project Showcase

Final Submission untuk **Pelatihan Web Development 1 KMTETI FT UGM**. Aplikasi web portofolio interaktif yang menampilkan katalog proyek, pencarian dan filter berbasis state, serta manajemen data proyek dan keahlian (CRUD) menggunakan database relasional Supabase dengan Row Level Security (RLS).

## 🔗 Live Link
- **Live URL:** [https://webdev1-submission.vercel.app](https://webdev1-submission.vercel.app) *(Ganti dengan URL Vercel Anda setelah deploy)*

## ✨ Fitur Utama
- **3 Halaman Utama:**
  - **Home (`/`):** Ringkasan profil, daftar keahlian (*skills*), dan *Featured Projects* dari database.
  - **Projects (`/projects`):** Katalog lengkap proyek dengan fitur *real-time search* dan filter kategori menggunakan `useState`.
  - **Manage CRUD (`/manage`):** Halaman manajemen data proyek dan relasi *skills* (*Create, Read, Update, Delete*) dengan autentikasi Supabase Auth, validasi input, serta pesan *success* dan *error*.
- **Database Relasional & Keamanan (RLS):** Menggunakan 3 tabel berelasi (`projects`, `skills`, `project_skills`) dengan kebijakan RLS (*public read* untuk pengunjung dan *authenticated write* untuk admin).
- **Responsive & Accessible (a11y):** Mendukung layar `360px` hingga desktop, *semantic HTML*, *labeled form inputs*, `alt` text pada gambar, serta `<title>` dan *meta description* unik di setiap halaman.

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase (PostgreSQL & GoTrue Auth)
- **Deployment:** Vercel

## 🚀 Cara Menjalankan di Lokal (Setup)

1. **Clone repository:**
   ```bash
   git clone [https://github.com/username/webdev1-submission.git](https://github.com/username/webdev1-submission.git)
   cd webdev1-submission