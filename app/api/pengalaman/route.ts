import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch semua pengalaman
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kategori = searchParams.get("kategori")
    const tahun = searchParams.get("tahun")
    const search = searchParams.get("search")
    const id_profil = searchParams.get("id_profil")
    
    let queryString = "SELECT * FROM experience WHERE 1=1"
    const params: any[] = []
    
    // Filter by id_profil (opsional, bisa null)
    if (id_profil) {
      queryString += " AND id_profil = ?"
      params.push(id_profil)
    }
    
    // Filter by kategori
    if (kategori) {
      queryString += " AND kategori = ?"
      params.push(kategori)
    }
    
    // Filter by tahun
    if (tahun) {
      queryString += " AND tahun = ?"
      params.push(tahun)
    }
    
    // Search filter
    if (search) {
      queryString += " AND (judul LIKE ? OR instansi LIKE ? OR deskripsi LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    queryString += " ORDER BY tahun DESC, id DESC"
    
    const results = await query(queryString, params)
    
    // Konversi tahun dari YEAR(4) ke string
    const formattedResults = results.map((item: any) => ({
      ...item,
      tahun: item.tahun ? item.tahun.toString() : null
    }))
    
    return NextResponse.json({ 
      success: true, 
      data: formattedResults 
    })
  } catch (error: any) {
    console.error("[GET] Fetch pengalaman error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat mengambil data pengalaman",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// POST - Tambah pengalaman baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id_profil = null, // opsional, bisa null
      kategori, 
      judul, 
      instansi, 
      tahun, 
      deskripsi 
    } = body

    // Validasi input wajib
    if (!kategori || !judul || !instansi || !tahun) {
      return NextResponse.json(
        { error: "Kategori, judul, instansi, dan tahun harus diisi" },
        { status: 400 }
      )
    }

    // Validasi kategori
    const validKategori = ['Speaker', 'Reviewer', 'Professional']
    if (!validKategori.includes(kategori)) {
      return NextResponse.json(
        { error: "Kategori harus salah satu dari: Speaker, Reviewer, Professional" },
        { status: 400 }
      )
    }

    // Validasi tahun (untuk YEAR(4))
    const tahunNum = parseInt(tahun)
    const currentYear = new Date().getFullYear()
    if (isNaN(tahunNum) || tahunNum < 1900 || tahunNum > currentYear + 5) {
      return NextResponse.json(
        { error: `Tahun harus valid (1900 - ${currentYear + 5})` },
        { status: 400 }
      )
    }

    const result = await query(
      "INSERT INTO experience (id_profil, kategori, judul, instansi, tahun, deskripsi) VALUES (?, ?, ?, ?, ?, ?)",
      [
        id_profil, // bisa null
        kategori, 
        judul, 
        instansi, 
        tahunNum, // kirim sebagai number untuk YEAR(4)
        deskripsi || null
      ]
    )

    return NextResponse.json(
      { 
        success: true, 
        message: "Pengalaman berhasil ditambahkan",
        id: result.insertId 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[POST] Create pengalaman error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat menambah pengalaman",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// PUT - Update pengalaman (full update)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "ID pengalaman diperlukan" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      id_profil, 
      kategori, 
      judul, 
      instansi, 
      tahun, 
      deskripsi 
    } = body

    // Validasi input wajib
    if (!kategori || !judul || !instansi || !tahun) {
      return NextResponse.json(
        { error: "Kategori, judul, instansi, dan tahun harus diisi" },
        { status: 400 }
      )
    }

    // Validasi kategori
    const validKategori = ['Speaker', 'Reviewer', 'Professional']
    if (!validKategori.includes(kategori)) {
      return NextResponse.json(
        { error: "Kategori harus salah satu dari: Speaker, Reviewer, Professional" },
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

    // Cek apakah pengalaman ada
    const existing = await query("SELECT id FROM experience WHERE id = ?", [id])
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Pengalaman tidak ditemukan" },
        { status: 404 }
      )
    }

    // Update data
    await query(
      `UPDATE experience 
       SET id_profil = ?, kategori = ?, judul = ?, instansi = ?, tahun = ?, deskripsi = ?
       WHERE id = ?`,
      [
        id_profil || null, // bisa null
        kategori, 
        judul, 
        instansi, 
        tahunNum, 
        deskripsi || null,
        id
      ]
    )

    return NextResponse.json(
      { 
        success: true, 
        message: "Pengalaman berhasil diperbarui" 
      }
    )
  } catch (error: any) {
    console.error("[PUT] Update pengalaman error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat memperbarui pengalaman",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// PATCH - Partial update pengalaman
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "ID pengalaman diperlukan" },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Cek apakah pengalaman ada
    const existing = await query("SELECT * FROM experience WHERE id = ?", [id])
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Pengalaman tidak ditemukan" },
        { status: 404 }
      )
    }

    const currentData = existing[0]
    
    // Gabungkan data lama dengan data baru
    const updatedData = {
      id_profil: body.id_profil !== undefined ? body.id_profil : currentData.id_profil,
      kategori: body.kategori !== undefined ? body.kategori : currentData.kategori,
      judul: body.judul !== undefined ? body.judul : currentData.judul,
      instansi: body.instansi !== undefined ? body.instansi : currentData.instansi,
      tahun: body.tahun !== undefined ? body.tahun : currentData.tahun,
      deskripsi: body.deskripsi !== undefined ? body.deskripsi : currentData.deskripsi
    }

    // Validasi kategori jika diupdate
    if (body.kategori !== undefined) {
      const validKategori = ['Speaker', 'Reviewer', 'Professional']
      if (!validKategori.includes(body.kategori)) {
        return NextResponse.json(
          { error: "Kategori harus salah satu dari: Speaker, Reviewer, Professional" },
          { status: 400 }
        )
      }
    }

    // Validasi tahun jika diupdate
    if (body.tahun !== undefined) {
      const tahunNum = parseInt(body.tahun)
      const currentYear = new Date().getFullYear()
      if (isNaN(tahunNum) || tahunNum < 1900 || tahunNum > currentYear + 5) {
        return NextResponse.json(
          { error: `Tahun harus valid (1900 - ${currentYear + 5})` },
          { status: 400 }
        )
      }
      updatedData.tahun = tahunNum
    }

    // Update data
    await query(
      `UPDATE experience 
       SET id_profil = ?, kategori = ?, judul = ?, instansi = ?, tahun = ?, deskripsi = ?
       WHERE id = ?`,
      [
        updatedData.id_profil,
        updatedData.kategori,
        updatedData.judul,
        updatedData.instansi,
        updatedData.tahun,
        updatedData.deskripsi,
        id
      ]
    )

    return NextResponse.json(
      { 
        success: true, 
        message: "Pengalaman berhasil diperbarui" 
      }
    )
  } catch (error: any) {
    console.error("[PATCH] Partial update pengalaman error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat memperbarui pengalaman",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// DELETE - Hapus pengalaman
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "ID pengalaman diperlukan" },
        { status: 400 }
      )
    }

    // Cek apakah pengalaman ada
    const existing = await query("SELECT id FROM experience WHERE id = ?", [id])
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Pengalaman tidak ditemukan" },
        { status: 404 }
      )
    }

    // Hapus data
    await query("DELETE FROM experience WHERE id = ?", [id])

    return NextResponse.json(
      { 
        success: true, 
        message: "Pengalaman berhasil dihapus" 
      }
    )
  } catch (error: any) {
    console.error("[DELETE] Hapus pengalaman error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat menghapus pengalaman",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}