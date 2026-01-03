# Setup Database MySQL untuk Website Profil Dosen

Panduan lengkap untuk mengintegrasikan database MySQL XAMPP dengan website profil dosen.

## Prasyarat

- XAMPP dengan MySQL sudah terinstall
- Node.js v16+ terinstall
- npm atau yarn package manager

## Langkah 1: Setup Database di PHPMyAdmin

1. Buka PHPMyAdmin: `http://localhost/phpmyadmin`
2. Buat database baru bernama `db_biodosen`
3. Import SQL file atau buat table secara manual (lihat struktur di bawah)

### Struktur Database

#### Tabel: `dosen`
\`\`\`sql
CREATE TABLE dosen (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_lengkap VARCHAR(255) NOT NULL,
  nidn VARCHAR(20),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  jabatan VARCHAR(100),
  fakultas VARCHAR(100),
  prodi VARCHAR(100),
  email VARCHAR(100),
  telepon VARCHAR(20),
  alamat TEXT,
  universitas VARCHAR(100),
  tahun_lulus INT,
  deskripsi TEXT,
  foto VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

#### Tabel: `publikasi`
\`\`\`sql
CREATE TABLE publikasi (
  id INT PRIMARY KEY AUTO_INCREMENT,
  judul VARCHAR(255) NOT NULL,
  tahun INT,
  jenis VARCHAR(50),
  penerbit VARCHAR(255),
  deskripsi TEXT,
  link VARCHAR(255),
  file_pdf VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

#### Tabel: `buku`
\`\`\`sql
CREATE TABLE buku (
  id INT PRIMARY KEY AUTO_INCREMENT,
  judul VARCHAR(255) NOT NULL,
  pengarang VARCHAR(255),
  penerbit VARCHAR(255),
  tahun INT,
  isbn VARCHAR(20),
  deskripsi TEXT,
  link VARCHAR(255),
  cover VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

#### Tabel: `penelitian`
\`\`\`sql
CREATE TABLE penelitian (
  id INT PRIMARY KEY AUTO_INCREMENT,
  judul VARCHAR(255) NOT NULL,
  tahun INT,
  dana VARCHAR(100),
  status VARCHAR(50),
  deskripsi TEXT,
  laporan VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

#### Tabel: `pengalaman`
\`\`\`sql
CREATE TABLE pengalaman (
  id INT PRIMARY KEY AUTO_INCREMENT,
  jabatan VARCHAR(255) NOT NULL,
  institusi VARCHAR(255),
  tahun_mulai INT,
  tahun_selesai INT,
  deskripsi TEXT,
  kategori VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

#### Tabel: `pengabdian`
\`\`\`sql
CREATE TABLE pengabdian (
  id INT PRIMARY KEY AUTO_INCREMENT,
  judul VARCHAR(255) NOT NULL,
  tahun INT,
  lokasi VARCHAR(255),
  deskripsi TEXT,
  foto VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

#### Tabel: `hak_cipta`
\`\`\`sql
CREATE TABLE hak_cipta (
  id INT PRIMARY KEY AUTO_INCREMENT,
  judul VARCHAR(255) NOT NULL,
  jenis VARCHAR(100),
  nomor_sertifikat VARCHAR(50),
  tahun_daftar INT,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

## Langkah 2: Setup Environment Variables

1. Buat file `.env.local` di root project
2. Copy konfigurasi ini:

\`\`\`env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=db_biodosen
\`\`\`

## Langkah 3: Install Dependencies

\`\`\`bash
npm install
# atau
yarn install
\`\`\`

Dependency yang ditambahkan:
- `mysql2`: Library untuk koneksi MySQL di Node.js

## Langkah 4: Jalankan Development Server

\`\`\`bash
npm run dev
# atau
yarn dev
\`\`\`

Buka `http://localhost:3000` di browser

## Langkah 5: Setup Admin Account

1. Buka PHPMyAdmin dan masuk ke tabel `dosen`
2. Insert data admin:

\`\`\`sql
INSERT INTO dosen (nama_lengkap, nidn, username, password, jabatan, fakultas, prodi, email, telepon, alamat, universitas, tahun_lulus, deskripsi)
VALUES (
  'Dr. Ahmad Rahman',
  '0012345678',
  'dosen1',
  SHA2('password123', 256),
  'Lektor Kepala',
  'Fakultas Teknologi Informasi',
  'Teknik Informatika',
  'ahmad.rahman@universitas.ac.id',
  '+62 812 345 6789',
  'Jakarta, Indonesia',
  'Universitas Gadjah Mada',
  2020,
  'Seorang akademisi berpengalaman...'
);
\`\`\`

**Username**: `dosen1`  
**Password**: `password123`

## Langkah 6: Insert Data Sample

Silakan insert data sample ke setiap tabel sesuai kebutuhan.

### Contoh Insert Publikasi:
\`\`\`sql
INSERT INTO publikasi (judul, tahun, jenis, penerbit, deskripsi, link)
VALUES (
  'Deep Learning untuk Prediksi Time Series dalam IoT',
  2024,
  'Journal',
  'IEEE Transactions on IoT',
  'Penelitian tentang penggunaan deep learning...',
  'https://example.com/publikasi'
);
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login admin

### Dosen
- `GET /api/dosen` - Get profil dosen
- `PUT /api/dosen` - Update profil dosen

### Publikasi
- `GET /api/publikasi` - Get semua publikasi (support ?jenis=)
- `POST /api/publikasi` - Create publikasi baru

### Buku
- `GET /api/buku` - Get semua buku
- `POST /api/buku` - Create buku baru

### Penelitian
- `GET /api/penelitian` - Get semua penelitian
- `POST /api/penelitian` - Create penelitian baru

### Pengalaman
- `GET /api/pengalaman` - Get semua pengalaman
- `POST /api/pengalaman` - Create pengalaman baru

### Pengabdian
- `GET /api/pengabdian` - Get semua pengabdian
- `POST /api/pengabdian` - Create pengabdian baru

### Hak Cipta
- `GET /api/hak-cipta` - Get semua hak cipta
- `POST /api/hak-cipta` - Create hak cipta baru

## Troubleshooting

### Koneksi Database Gagal
- Pastikan XAMPP MySQL sudah berjalan
- Cek konfigurasi `.env.local`
- Verifikasi di PHPMyAdmin bahwa database `db_biodosen` sudah ada

### Login Gagal
- Verifikasi username dan password di tabel `dosen`
- Pastikan password di-hash dengan SHA2 atau sesuai dengan fungsi di `lib/auth.ts`

### Port 3000 Sudah Digunakan
\`\`\`bash
npm run dev -- -p 3001
\`\`\`

## Production Setup

Untuk production, migrasi ke PostgreSQL (Neon) atau cloud MySQL lebih recommended:

1. Setup database di cloud provider
2. Update konfigurasi di `.env.local`
3. Deploy ke Vercel
4. Setup HTTPS dan security best practices

## Security Tips

1. Ubah password default admin
2. Hash password dengan bcrypt untuk production
3. Implementasi JWT tokens untuk session management
4. Setup Row Level Security (RLS) jika menggunakan PostgreSQL
5. Protect API routes dengan authentication middleware
