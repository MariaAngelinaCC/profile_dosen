// app/api/penelitian/route.ts
import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch semua penelitian
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tahun = searchParams.get("tahun")
    const search = searchParams.get("search")
    
    let queryString = "SELECT * FROM penelitian WHERE 1=1"
    const params: any[] = []
    
    if (tahun) {
      queryString += " AND tahun = ?"
      params.push(tahun)
    }
    
    if (search) {
      queryString += " AND (judul LIKE ? OR bidang LIKE ? OR deskripsi LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    queryString += " ORDER BY tahun DESC, id DESC"
    
    const results = await query(queryString, params)
    
    // Format tahun jika perlu
    const formattedResults = results.map((item: any) => ({
      ...item,
      tahun: item.tahun ? item.tahun.toString() : null
    }))
    
    return NextResponse.json({ success: true, data: formattedResults })
  } catch (error: any) {
    console.error("[GET] Fetch penelitian error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat mengambil data penelitian",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// POST - Tambah penelitian baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id_profil = null,
      judul, 
      tahun, 
      bidang, 
      deskripsi, 
      file_laporan 
    } = body

    // Validasi input wajib
    if (!judul || !tahun) {
      return NextResponse.json(
        { error: "Judul dan tahun harus diisi" },
        { status: 400 }
      )
    }

    // Validasi tahun
    const tahunNum = parseInt(tahun)
    const currentYear = new Date().getFullYear()
    if (isNaN(tahunNum) || tahunNum < 1900 || tahunNum > currentYear + 5) {
      return NextResponse.json(
        { error: `Tahun harus valid (1900 - ${currentYear + 5})` },
        { status: 400 }
      )
    }

    // PERBAIKAN: Konversi undefined ke null
    const result = await query(
      `INSERT INTO penelitian (id_profil, judul, tahun, bidang, deskripsi, file_laporan) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_profil,
        judul,
        tahunNum,
        bidang || null, // Pastikan tidak undefined
        deskripsi || null,
        file_laporan || null
      ]
    )

    return NextResponse.json(
      { 
        success: true, 
        message: "Penelitian berhasil ditambahkan",
        id: (result as any).insertId 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[POST] Create penelitian error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat menambah penelitian",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// PATCH - Update penelitian
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      id_profil,
      judul, 
      tahun, 
      bidang, 
      deskripsi, 
      file_laporan 
    } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID penelitian diperlukan" },
        { status: 400 }
      )
    }

    // Validasi input wajib
    if (!judul || !tahun) {
      return NextResponse.json(
        { error: "Judul dan tahun harus diisi" },
        { status: 400 }
      )
    }

    // Validasi tahun
    const tahunNum = parseInt(tahun)
    const currentYear = new Date().getFullYear()
    if (isNaN(tahunNum) || tahunNum < 1900 || tahunNum > currentYear + 5) {
      return NextResponse.json(
        { error: `Tahun harus valid (1900 - ${currentYear + 5})` },
        { status: 400 }
      )
    }

    // Cek apakah penelitian ada
    const existing = await query("SELECT id FROM penelitian WHERE id = ?", [id])
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Penelitian tidak ditemukan" },
        { status: 404 }
      )
    }

    // Update data
    await query(
      `UPDATE penelitian 
       SET id_profil = ?, judul = ?, tahun = ?, bidang = ?, deskripsi = ?, file_laporan = ?
       WHERE id = ?`,
      [
        id_profil || null,
        judul,
        tahunNum,
        bidang || null,
        deskripsi || null,
        file_laporan || null,
        id
      ]
    )

    return NextResponse.json(
      { 
        success: true, 
        message: "Penelitian berhasil diperbarui" 
      }
    )
  } catch (error: any) {
    console.error("[PATCH] Update penelitian error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat memperbarui penelitian",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// DELETE - Hapus penelitian
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "ID penelitian diperlukan" },
        { status: 400 }
      )
    }

    // Cek apakah penelitian ada
    const existing = await query("SELECT id FROM penelitian WHERE id = ?", [id])
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Penelitian tidak ditemukan" },
        { status: 404 }
      )
    }

    // Hapus data
    await query("DELETE FROM penelitian WHERE id = ?", [id])

    return NextResponse.json(
      { 
        success: true, 
        message: "Penelitian berhasil dihapus" 
      }
    )
  } catch (error: any) {
    console.error("[DELETE] Hapus penelitian error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat menghapus penelitian",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}