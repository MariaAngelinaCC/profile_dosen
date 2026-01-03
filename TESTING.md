# Testing Guide - Website Profil Dosen

Panduan testing aplikasi sebelum production deployment.

## Testing Checklist

### 1. Setup & Environment
- [ ] Database MySQL terkoneksi dengan baik
- [ ] .env.local sudah dikonfigurasi
- [ ] npm run dev berjalan tanpa error
- [ ] Tidak ada console warnings

### 2. Frontend - Public Pages

#### Homepage (/)
- [ ] Hero section muncul dengan benar
- [ ] CTA buttons responsive
- [ ] Highlight activities section menampilkan data dengan benar
- [ ] Stats section menampilkan angka

#### Profile (/profile)
- [ ] Sidebar menampilkan informasi profil dari database
- [ ] Data dosen loading dengan baik
- [ ] Contact information terformat benar
- [ ] Riwayat pendidikan muncul
- [ ] Stats cards responsive

#### Publications (/publications)
- [ ] Publikasi ter-load dari database
- [ ] Filter by jenis (Journal/Conference) bekerja
- [ ] Pagination jika banyak data
- [ ] Link publikasi bekerja
- [ ] Error handling jika tidak ada data

#### Books (/books)
- [ ] Buku ter-load dari database
- [ ] Grid layout responsive
- [ ] Book info (ISBN, tahun) muncul
- [ ] Link ke buku bekerja

#### Research (/research)
- [ ] Penelitian ter-load dari database
- [ ] Download laporan link bekerja
- [ ] Status penelitian menampilkan dengan benar

#### Experience (/experience)
- [ ] Pengalaman ter-load dari database
- [ ] Category icons/badges menampilkan dengan benar
- [ ] Timeline/tahun menampilkan dengan benar

#### Community Service (/community-service)
- [ ] Kegiatan ter-load dari database
- [ ] Foto/images menampilkan dengan benar
- [ ] Lokasi dan tahun informasi muncul

### 3. Admin Panel

#### Login (/admin/login)
- [ ] Form input berfungsi
- [ ] Error message muncul untuk invalid credentials
- [ ] Redirect ke dashboard setelah berhasil login
- [ ] Session tersimpan di localStorage

#### Dashboard (/admin/dashboard)
- [ ] Menu links mengarah ke halaman yang benar
- [ ] Quick stats muncul
- [ ] Account info menampilkan user yang login
- [ ] Logout button berfungsi dan clear session

### 4. API Testing

Gunakan Postman atau cURL untuk test:

#### Auth Login
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"dosen1","password":"password123"}'
\`\`\`

Expected response:
\`\`\`json
{
  "success": true,
  "dosen": {
    "id": 1,
    "nama_lengkap": "Dr. Ahmad Rahman",
    "username": "dosen1"
  }
}
\`\`\`

#### Get Dosen
\`\`\`bash
curl http://localhost:3000/api/dosen
\`\`\`

#### Get Publikasi
\`\`\`bash
curl http://localhost:3000/api/publikasi
curl http://localhost:3000/api/publikasi?jenis=journal
\`\`\`

#### Get Buku
\`\`\`bash
curl http://localhost:3000/api/buku
\`\`\`

#### Get Penelitian
\`\`\`bash
curl http://localhost:3000/api/penelitian
\`\`\`

#### Get Pengalaman
\`\`\`bash
curl http://localhost:3000/api/pengalaman
\`\`\`

#### Get Pengabdian
\`\`\`bash
curl http://localhost:3000/api/pengabdian
\`\`\`

### 5. Database Testing

Pastikan semua data di database sudah tersimpan dengan benar:

\`\`\`sql
-- Check dosen data
SELECT * FROM dosen;

-- Check publikasi data
SELECT * FROM publikasi ORDER BY tahun DESC;

-- Check buku data
SELECT * FROM buku ORDER BY tahun DESC;

-- Check penelitian data
SELECT * FROM penelitian ORDER BY tahun DESC;

-- Check pengalaman data
SELECT * FROM pengalaman ORDER BY tahun_mulai DESC;

-- Check pengabdian data
SELECT * FROM pengabdian ORDER BY tahun DESC;

-- Check hak_cipta data
SELECT * FROM hak_cipta ORDER BY tahun_daftar DESC;
\`\`\`

### 6. Responsive Testing

Test di berbagai ukuran screen:
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px+)
- [ ] Large screens (1400px+)

### 7. Browser Compatibility

Test di browser:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 8. Performance Testing

- [ ] Page load time < 3 detik
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] API response time < 500ms

### 9. Security Testing

- [ ] Session expires setelah logout
- [ ] Cannot access admin panel tanpa login
- [ ] SQL injection protected
- [ ] XSS protection
- [ ] CSRF protection (jika applicable)

### 10. Error Handling

- [ ] Error message muncul jika database connection gagal
- [ ] Error message jika API request gagal
- [ ] Graceful degradation untuk missing data
- [ ] Proper error logging

## Test Report Template

\`\`\`
Date: [DATE]
Tester: [NAME]
Version: [VERSION]

Test Results:
- Frontend: [PASS/FAIL]
- API: [PASS/FAIL]
- Database: [PASS/FAIL]
- Admin Panel: [PASS/FAIL]

Issues Found:
1. [Issue description]
2. [Issue description]

Status: [READY FOR PRODUCTION / NEEDS FIXES]
\`\`\`

## Common Issues & Solutions

### Issue: Database connection timeout
**Solution**: Check if MySQL server running, verify credentials di .env.local

### Issue: API returns 500 error
**Solution**: Check server logs, verify database query

### Issue: Images not loading
**Solution**: Check image path, verify file exists in /public folder

### Issue: Login fails
**Solution**: Verify username/password di database, check if password hashing matches

## Automated Testing (Optional)

Setup Jest untuk unit testing:

\`\`\`bash
npm install --save-dev jest @types/jest
\`\`\`

Create test files:
- `__tests__/api/auth.test.ts`
- `__tests__/api/dosen.test.ts`
- `__tests__/pages/profile.test.tsx`
\`\`\`
