// app/api/pengabdian/route.ts
import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch semua pengabdian
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tahun = searchParams.get("tahun")
    const lokasi = searchParams.get("lokasi")
    const search = searchParams.get("search")
    
    let queryString = "SELECT * FROM pengabdian WHERE 1=1"
    const params: any[] = []
    
    if (tahun) {
      queryString += " AND tahun = ?"
      params.push(tahun)
    }
    
    if (lokasi) {
      queryString += " AND lokasi LIKE ?"
      params.push(`%${lokasi}%`)
    }
    
    if (search) {
      queryString += " AND (judul LIKE ? OR deskripsi LIKE ? OR lokasi LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    queryString += " ORDER BY tahun DESC, id DESC"
    
    const results = await query(queryString, params)
    
    // Format tahun dari YEAR(4) ke string
    const formattedResults = results.map((item: any) => ({
      ...item,
      tahun: item.tahun ? item.tahun.toString() : null
    }))
    
    return NextResponse.json({ success: true, data: formattedResults })
  } catch (error: any) {
    console.error("[GET] Fetch pengabdian error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat mengambil data pengabdian",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// POST - Tambah pengabdian baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id_profil = null,
      judul, 
      lokasi, 
      tahun, 
      deskripsi, 
      foto_kegiatan 
    } = body

    // Validasi input wajib
    if (!judul || !lokasi || !tahun) {
      return NextResponse.json(
        { error: "Judul, lokasi, dan tahun harus diisi" },
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

    const result = await query(
      `INSERT INTO pengabdian (id_profil, judul, lokasi, tahun, deskripsi, foto_kegiatan) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_profil,
        judul,
        lokasi,
        tahunNum,
        deskripsi || null,
        foto_kegiatan || null
      ]
    )

    return NextResponse.json(
      { 
        success: true, 
        message: "Pengabdian berhasil ditambahkan",
        id: (result as any).insertId 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[POST] Create pengabdian error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat menambah pengabdian",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// PATCH - Update pengabdian
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      id_profil,
      judul, 
      lokasi, 
      tahun, 
      deskripsi, 
      foto_kegiatan 
    } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID pengabdian diperlukan" },
        { status: 400 }
      )
    }

    // Validasi input wajib
    if (!judul || !lokasi || !tahun) {
      return NextResponse.json(
        { error: "Judul, lokasi, dan tahun harus diisi" },
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

    // Cek apakah pengabdian ada
    const existing = await query("SELECT id FROM pengabdian WHERE id = ?", [id])
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Pengabdian tidak ditemukan" },
        { status: 404 }
      )
    }

    // Update data
    await query(
      `UPDATE pengabdian 
       SET id_profil = ?, judul = ?, lokasi = ?, tahun = ?, deskripsi = ?, foto_kegiatan = ?
       WHERE id = ?`,
      [
        id_profil || null,
        judul,
        lokasi,
        tahunNum,
        deskripsi || null,
        foto_kegiatan || null,
        id
      ]
    )

    return NextResponse.json(
      { 
        success: true, 
        message: "Pengabdian berhasil diperbarui" 
      }
    )
  } catch (error: any) {
    console.error("[PATCH] Update pengabdian error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat memperbarui pengabdian",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// DELETE - Hapus pengabdian
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "ID pengabdian diperlukan" },
        { status: 400 }
      )
    }

    // Cek apakah pengabdian ada
    const existing = await query("SELECT id FROM pengabdian WHERE id = ?", [id])
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Pengabdian tidak ditemukan" },
        { status: 404 }
      )
    }

    // Hapus data
    await query("DELETE FROM pengabdian WHERE id = ?", [id])

    return NextResponse.json(
      { 
        success: true, 
        message: "Pengabdian berhasil dihapus" 
      }
    )
  } catch (error: any) {
    console.error("[DELETE] Hapus pengabdian error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat menghapus pengabdian",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}