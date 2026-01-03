# Quick Start Guide

Setup cepat untuk mulai menggunakan website profil dosen.

## 5 Menit Setup

### 1. Prerequisites
- XAMPP dengan MySQL installed
- Node.js 16+ installed
- Code editor (VSCode recommended)

### 2. Clone & Install (2 menit)
\`\`\`bash
git clone <repository>
cd website-profil-dosen
npm install
\`\`\`

### 3. Database Setup (1 menit)
a. Buka PHPMyAdmin: http://localhost/phpmyadmin
b. Create database `db_biodosen`
c. Run SQL scripts dari `SETUP_DATABASE.md`

### 4. Environment (30 detik)
Buat `.env.local`:
\`\`\`env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=db_biodosen
\`\`\`

### 5. Run! (30 detik)
\`\`\`bash
npm run dev
\`\`\`

Buka: http://localhost:3000

## Admin Login
- Username: `dosen1`
- Password: `password123`

## Selanjutnya?

1. Update profil dosen di admin panel
2. Tambahkan publikasi, buku, penelitian, dll
3. Customize design sesuai kebutuhan
4. Deploy ke Vercel atau cloud lainnya

Lihat dokumentasi lengkap di file `README.md`, `SETUP_DATABASE.md`, `DEPLOYMENT.md`
\`\`\`
