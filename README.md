# Website Profil Dosen Pribadi

Website sistem informasi profil dosen tunggal yang menampilkan informasi akademik, publikasi ilmiah, penelitian, dan pengabdian masyarakat dengan integrasi database MySQL.

## Fitur Utama

### Halaman Publik
- **Beranda** - Sambutan, foto utama, dan highlight aktivitas terbaru
- **Profil** - Data pribadi dari database, riwayat pendidikan, dan informasi kontak
- **Publikasi** - Daftar publikasi jurnal dan konferensi dengan filter (dari database)
- **Buku** - Daftar buku karya yang telah dipublikasikan (dari database)
- **Pengalaman** - Pengalaman akademik dan profesional (dari database)
- **Penelitian** - Daftar penelitian dengan deskripsi dan file laporan (dari database)
- **Pengabdian** - Kegiatan pengabdian masyarakat dengan dokumentasi (dari database)
- **Hak Cipta** - Daftar kekayaan intelektual dan paten (dari database)

### Admin Panel
- **Login** - Autentikasi admin dengan database MySQL
- **Dashboard** - Ringkasan statistik dan navigasi ke halaman pengelolaan
- **Edit Profil** - Form lengkap untuk mengedit data pribadi dan akademik
- **Kelola Konten** - Akses ke semua halaman pengelolaan konten dengan database integration

## Teknologi yang Digunakan

- **Frontend**: Next.js 16 dengan React 19, TypeScript
- **Styling**: Tailwind CSS v4 dengan design tokens
- **Icons**: Lucide React
- **Database**: MySQL dengan XAMPP (local) atau cloud database
- **ORM/Query**: mysql2/promise library
- **Forms**: React Hook Form + Zod validation

## Struktur Project

\`\`\`
/app
  /(public pages) - Halaman publik dengan data dari database
  /api
    /auth - Authentication endpoints
    /dosen - API untuk profil dosen
    /publikasi - API untuk publikasi
    /buku - API untuk buku
    /penelitian - API untuk penelitian
    /pengalaman - API untuk pengalaman
    /pengabdian - API untuk pengabdian
    /hak-cipta - API untuk hak cipta
  /admin
    /login - Halaman login admin
    /dashboard - Dashboard admin
    /profile-edit - Edit profil
/components
  /navigation.tsx - Navigasi utama dengan submenu
  /footer.tsx - Footer dengan informasi kontak
/lib
  /db.ts - Database connection & query
  /auth.ts - Password hashing & token utilities
/public
  /images - Folder untuk menyimpan gambar
\`\`\`

## Demo Credentials

\`\`\`
Username: dosen1
Password: password123
\`\`\`

## Quick Start

### Prasyarat
- XAMPP dengan MySQL installed
- Node.js 16+ installed

### Setup (5 Menit)
1. Install dependencies: `npm install`
2. Buat `.env.local` dengan konfigurasi database (lihat SETUP_DATABASE.md)
3. Setup database MySQL: Follow panduan di `SETUP_DATABASE.md`
4. Jalankan dev server: `npm run dev`
5. Akses http://localhost:3000

Lihat `QUICK_START.md` untuk panduan lengkap setup cepat.

## Database Integration

Website telah terintegrasi dengan MySQL database. Semua data disimpan di database bukan di hardcoded state.

### Database Tables
- `dosen` - Data profil dosen
- `publikasi` - Data publikasi ilmiah
- `buku` - Data buku karya
- `penelitian` - Data penelitian
- `pengalaman` - Data pengalaman profesional
- `pengabdian` - Data pengabdian masyarakat
- `hak_cipta` - Data hak cipta/paten

### API Endpoints
Semua endpoints tersedia di `/api`:
- `GET/PUT /api/dosen` - Profil dosen
- `GET/POST /api/publikasi` - Publikasi ilmiah
- `GET/POST /api/buku` - Buku karya
- `GET/POST /api/penelitian` - Penelitian
- `GET/POST /api/pengalaman` - Pengalaman
- `GET/POST /api/pengabdian` - Pengabdian
- `GET/POST /api/hak-cipta` - Hak cipta
- `POST /api/auth/login` - Login authentication

Lihat `SETUP_DATABASE.md` untuk dokumentasi API lengkap.

## Cara Menggunakan

### Akses Public
1. Buka website di browser
2. Navigasikan ke halaman-halaman publik menggunakan menu navigasi
3. Semua data ter-load dari database secara real-time

### Admin Access
1. Klik tombol "Admin" di navigasi atas
2. Masuk dengan username `dosen1` dan password `password123`
3. Di dashboard, pilih konten yang ingin dikelola
4. Edit profil pada halaman "Edit Profil"

## Documentation

Project dilengkapi dengan dokumentasi lengkap:

- **QUICK_START.md** - Setup cepat dalam 5 menit
- **SETUP_DATABASE.md** - Setup database MySQL dan integrasi
- **ADMIN_GUIDE.md** - Panduan menggunakan admin panel
- **TESTING.md** - Testing checklist dan procedures
- **DEPLOYMENT.md** - Deployment ke Vercel, Railway, atau VPS
- **README.md** - File ini

Silakan baca dokumentasi sesuai kebutuhan Anda.

## Database Configuration

### Local Development (XAMPP)
\`\`\`env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=db_biodosen
\`\`\`

### Production (Cloud Database)
Ganti dengan credentials dari Neon, Railway, atau cloud provider lainnya.

## Customization

### Mengubah Data
- Data publik: Semua data ter-manage melalui admin panel atau API
- Tidak perlu edit component code lagi

### Mengubah Warna
Edit file `app/globals.css` - ubah CSS variables pada `:root` untuk light mode dan `.dark` untuk dark mode.

### Menambah Halaman
1. Buat folder baru di `/app`
2. Buat file `page.tsx` di folder tersebut
3. Tambah link di komponen Navigation
4. Buat API route jika diperlukan

## Deployment

Website siap untuk di-deploy ke production. Ikuti panduan di `DEPLOYMENT.md`:
- Vercel (recommended)
- Railway
- Self-hosted VPS

Database harus dimigrasi ke cloud provider (Neon PostgreSQL, MySQL cloud, dll) sebelum deployment.

## Features Roadmap

- Pengelolaan publikasi, buku, dan penelitian di admin panel (coming soon)
- Upload file dan gambar (coming soon)
- Email notification (coming soon)
- Export data ke PDF (coming soon)
- Multi-language support (coming soon)
- Analytics dashboard (coming soon)

## Support

Untuk bantuan atau pertanyaan:
- Email: ahmad.rahman@universitas.ac.id
- Telepon: +62 812 345 6789

---

**Terakhir diperbarui**: November 2025
**Database Integration**: Version 1.0
