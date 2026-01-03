import { connection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// ==============================
// GET PROFILE DOSEN
// ==============================
export async function GET() {
  try {
    const [rows]: any = await connection.query(
      "SELECT * FROM profil_dosen LIMIT 1"
    );

    return NextResponse.json({
      success: true,
      data: rows[0] || null,
    });
  } catch (error: any) {
    console.error("❌ Fetch profile error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data profil", detail: error.message },
      { status: 500 }
    );
  }
}

// ==============================
// UPDATE / INSERT PROFILE DOSEN
// ==============================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nama,
      nidn,
      jabatan,
      fakultas,
      prodi,
      email,
      telepon,
      alamat,
      pendidikan_terakhir,
      universitas,
      tahun_lulus,
      deskripsi,
    } = body;

    // Cek apakah data sudah ada
    const [existing]: any = await connection.query(
      "SELECT id_profil FROM profil_dosen LIMIT 1"
    );

    if (existing.length > 0) {
      // UPDATE
      await connection.query(
        `UPDATE profil_dosen SET
          nama = ?,
          nidn = ?,
          jabatan = ?,
          fakultas = ?,
          prodi = ?,
          email = ?,
          telepon = ?,
          alamat = ?,
          pendidikan_terakhir = ?,
          universitas = ?,
          tahun_lulus = ?,
          deskripsi = ?
        WHERE id_profil = ?`,
        [
          nama,
          nidn,
          jabatan,
          fakultas,
          prodi,
          email,
          telepon,
          alamat,
          pendidikan_terakhir,
          universitas,
          tahun_lulus,
          deskripsi,
          existing[0].id_profil,
        ]
      );
    } else {
      // INSERT (pertama kali)
      await connection.query(
        `INSERT INTO profil_dosen
        (nama, nidn, jabatan, fakultas, prodi, email, telepon, alamat,
         pendidikan_terakhir, universitas, tahun_lulus, deskripsi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nama,
          nidn,
          jabatan,
          fakultas,
          prodi,
          email,
          telepon,
          alamat,
          pendidikan_terakhir,
          universitas,
          tahun_lulus,
          deskripsi,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profil berhasil disimpan",
    });
  } catch (error: any) {
    console.error("❌ Save profile error:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan profil", detail: error.message },
      { status: 500 }
    );
  }
}
