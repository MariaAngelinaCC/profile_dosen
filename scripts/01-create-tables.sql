-- ==========================================================
-- DATABASE: db_biodosen
-- ==========================================================

-- Jika database belum ada, buat database
-- CREATE DATABASE IF NOT EXISTS db_biodosen;
-- USE db_biodosen;

-- ==========================================================
-- Login (khusus dosen pemilik web)
-- ==========================================================
CREATE TABLE IF NOT EXISTS user_login (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================================
-- PROFILE (termasuk data pendidikan)
-- ==========================================================
CREATE TABLE IF NOT EXISTS profil_dosen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100),
  nidn VARCHAR(20),
  jabatan VARCHAR(50),
  fakultas VARCHAR(100),
  prodi VARCHAR(100),
  email VARCHAR(100),
  telepon VARCHAR(20),
  alamat VARCHAR(255),
  pendidikan_terakhir VARCHAR(100),
  universitas VARCHAR(100),
  tahun_lulus YEAR(4),
  deskripsi TEXT,
  foto VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================================
-- PUBLICATION (Jurnal & Conference)
-- ==========================================================
CREATE TABLE IF NOT EXISTS publikasi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255),
  tahun YEAR(4),
  jenis ENUM('Journal','Conference'),
  link VARCHAR(255),
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- BOOK
-- ==========================================================
CREATE TABLE IF NOT EXISTS buku (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255),
  penerbit VARCHAR(100),
  tahun YEAR(4),
  isbn VARCHAR(50),
  link VARCHAR(255),
  deskripsi TEXT,
  cover VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- EXPERIENCE (Speaker, Reviewer, Profesional)
-- ==========================================================
CREATE TABLE IF NOT EXISTS experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kategori ENUM('Speaker','Reviewer','Professional'),
  judul VARCHAR(255),
  instansi VARCHAR(100),
  tahun YEAR(4),
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- COPYRIGHT
-- ==========================================================
CREATE TABLE IF NOT EXISTS copyright (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255),
  nomor_pendaftaran VARCHAR(100),
  tahun YEAR(4),
  link VARCHAR(255),
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PENELITIAN
-- ==========================================================
CREATE TABLE IF NOT EXISTS penelitian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255),
  tahun YEAR(4),
  bidang VARCHAR(100),
  deskripsi TEXT,
  file_laporan VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- PENGABDIAN
-- ==========================================================
CREATE TABLE IF NOT EXISTS pengabdian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255),
  lokasi VARCHAR(100),
  tahun YEAR(4),
  deskripsi TEXT,
  foto_kegiatan VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- HOME (untuk isi sambutan, highlight, atau ringkasan)
-- ==========================================================
CREATE TABLE IF NOT EXISTS home_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(100),
  isi TEXT,
  foto VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
