import { connection } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET - Get all publications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jenis = searchParams.get("jenis")

    // Query dasar
    let query = "SELECT * FROM publikasi"
    const params: any[] = []

    // Jika ada filter jenis (misal ?jenis=Journal)
    if (jenis) {
      query += " WHERE LOWER(jenis) = LOWER(?)"
      params.push(jenis)
    }

    query += " ORDER BY tahun DESC, judul ASC"

    const [rows]: any = await connection.query(query, params)

    return NextResponse.json({ success: true, data: rows })
  } catch (error: any) {
    console.error("❌ Fetch publikasi error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data publikasi", detail: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new publication
export async function POST(request: NextRequest) {
  try {
    const { judul, tahun, jenis, link, deskripsi } = await request.json()

    if (!judul || !tahun || !jenis) {
      return NextResponse.json(
        { error: "Judul, tahun, dan jenis wajib diisi" },
        { status: 400 }
      )
    }

    console.log("🟢 Data diterima:", { judul, tahun, jenis, link, deskripsi })

    const [result]: any = await connection.query(
      "INSERT INTO publikasi (judul, tahun, jenis, link, deskripsi) VALUES (?, ?, ?, ?, ?)",
      [judul, tahun, jenis, link || null, deskripsi || null]
    )

    console.log("✅ Insert result:", result)

    return NextResponse.json(
      { 
        message: "Publikasi berhasil ditambahkan",
        id: result.insertId,
        success: true 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("❌ Database error (detail):", error)
    return NextResponse.json(
      { error: "Gagal menambah publikasi", detail: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update publication
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "ID publikasi diperlukan" },
        { status: 400 }
      )
    }

    const { judul, tahun, jenis, link, deskripsi } = await request.json()

    if (!judul || !tahun || !jenis) {
      return NextResponse.json(
        { error: "Judul, tahun, dan jenis wajib diisi" },
        { status: 400 }
      )
    }

    // Cek apakah publikasi ada
    const [existing]: any = await connection.query(
      "SELECT id FROM publikasi WHERE id = ?",
      [id]
    )

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Publikasi tidak ditemukan" },
        { status: 404 }
      )
    }

    // Konversi tahun ke number untuk database YEAR type
    const tahunNumber = parseInt(tahun);
    
    // PERBAIKAN: Hapus updated_at karena kolom tidak ada di tabel
    await connection.query(
      `UPDATE publikasi 
       SET judul = ?, tahun = ?, jenis = ?, link = ?, deskripsi = ?
       WHERE id = ?`,
      [judul, tahunNumber, jenis, link || null, deskripsi || null, id]
    )

    return NextResponse.json(
      { 
        message: "Publikasi berhasil diperbarui",
        success: true 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("❌ Update publikasi error:", error)
    return NextResponse.json(
      { error: "Gagal memperbarui publikasi", detail: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete publication
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "ID publikasi diperlukan" },
        { status: 400 }
      )
    }

    // Cek apakah publikasi ada
    const [existing]: any = await connection.query(
      "SELECT id FROM publikasi WHERE id = ?",
      [id]
    )

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Publikasi tidak ditemukan" },
        { status: 404 }
      )
    }

    // Hapus data
    await connection.query(
      "DELETE FROM publikasi WHERE id = ?",
      [id]
    )

    return NextResponse.json(
      { 
        message: "Publikasi berhasil dihapus",
        success: true 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("❌ Delete publikasi error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus publikasi", detail: error.message },
      { status: 500 }
    )
  }
}