import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const results = await query("SELECT * FROM profil_dosen")

    if (!results || (Array.isArray(results) && results.length === 0)) {
      return NextResponse.json([])
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Fetch profil_dosen error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil data profil" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
      foto,
    } = body

    // Validasi field required
    if (!nama || !email) {
      return NextResponse.json({ error: "Nama dan Email harus diisi" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO profil_dosen 
        (nama, nidn, jabatan, fakultas, prodi, email, telepon, alamat, pendidikan_terakhir, universitas, tahun_lulus, deskripsi, foto)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nama,
        nidn || null,
        jabatan || null,
        fakultas || null,
        prodi || null,
        email,
        telepon || null,
        alamat || null,
        pendidikan_terakhir || null,
        universitas || null,
        tahun_lulus || null,
        deskripsi || null,
        foto || null,
      ],
    )

    return NextResponse.json(
      {
        success: true,
        message: "Data profil berhasil ditambahkan",
        id: (result as any).insertId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Insert profil_dosen error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat menambah data profil" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "ID profil harus disediakan" }, { status: 400 })
    }

    // Construct SQL UPDATE statement
    const fields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(", ")
    const values = Object.values(updateData)

    await query(`UPDATE profil_dosen SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id])

    return NextResponse.json({
      success: true,
      message: "Data profil berhasil diperbarui",
    })
  } catch (error) {
    console.error("[v0] Update profil_dosen error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat mengupdate data profil" }, { status: 500 })
  }
}
