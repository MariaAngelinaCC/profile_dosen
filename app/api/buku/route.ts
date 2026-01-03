// app/api/buku/route.ts
import { connection } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"

// Buat folder upload jika belum ada
const uploadDir = join(process.cwd(), "public", "uploads", "buku")
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true })
}

const uploadCoverDir = join(uploadDir, "covers")
const uploadFileDir = join(uploadDir, "files")

if (!existsSync(uploadCoverDir)) mkdirSync(uploadCoverDir, { recursive: true })
if (!existsSync(uploadFileDir)) mkdirSync(uploadFileDir, { recursive: true })

// GET - Fetch semua buku
// app/api/buku/route.ts - Perbaikan bagian GET

// GET - Fetch semua buku
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const tahun = searchParams.get("tahun")
    
    let query = "SELECT * FROM buku WHERE 1=1"
    const params: any[] = []
    
    if (search) {
      query += " AND (judul LIKE ? OR penerbit LIKE ? OR isbn LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (tahun) {
      query += " AND tahun = ?"
      params.push(tahun)
    }
    
    query += " ORDER BY tahun DESC, judul ASC"
    
    const [results]: any = await connection.query(query, params)
    
    // PERBAIKAN: Tambahkan base URL yang benar
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    // PERBAIKAN: Path yang benar untuk file upload
    const booksWithUrls = results.map((book: any) => ({
      ...book,
      // Gunakan path yang benar - RELATIVE dari public folder
      cover_url: book.cover ? `/uploads/buku/covers/${book.cover}` : null,
      file_url: book.link ? `/uploads/buku/files/${book.link}` : null,
      // Atau jika ingin full URL (untuk external)
      cover_full_url: book.cover ? `${baseUrl}/uploads/buku/covers/${book.cover}` : null,
      file_full_url: book.link ? `${baseUrl}/uploads/buku/files/${book.link}` : null
    }))
    
    return NextResponse.json({ 
      success: true, 
      data: booksWithUrls 
    })
  } catch (error: any) {
    console.error("[GET] Fetch buku error:", error)
    return NextResponse.json({ 
      error: "Terjadi kesalahan saat mengambil data buku",
      detail: error.message 
    }, { status: 500 })
  }
}

// POST - Tambah buku baru (dengan upload file)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const judul = formData.get("judul") as string
    const penerbit = formData.get("penerbit") as string
    const tahun = formData.get("tahun") as string
    const isbn = formData.get("isbn") as string
    const deskripsi = formData.get("deskripsi") as string || null
    const coverFile = formData.get("cover") as File
    const fileBuku = formData.get("fileBuku") as File
    
    // Validasi input wajib
    if (!judul || !tahun) {
      return NextResponse.json(
        { error: "Judul dan tahun harus diisi" },
        { status: 400 }
      )
    }
    
    if (!coverFile || coverFile.size === 0) {
      return NextResponse.json(
        { error: "Cover buku wajib diupload" },
        { status: 400 }
      )
    }
    
    if (!fileBuku || fileBuku.size === 0) {
      return NextResponse.json(
        { error: "File buku wajib diupload" },
        { status: 400 }
      )
    }
    
    // Generate unique filenames
    const timestamp = Date.now()
    const coverExt = coverFile.name.split('.').pop()
    const fileExt = fileBuku.name.split('.').pop()
    
    const coverFilename = `cover_${timestamp}.${coverExt}`
    const fileFilename = `file_${timestamp}.${fileExt}`
    
    // Save cover file
    const coverBuffer = await coverFile.arrayBuffer()
    await writeFile(
      join(uploadCoverDir, coverFilename),
      Buffer.from(coverBuffer)
    )
    
    // Save book file
    const fileBuffer = await fileBuku.arrayBuffer()
    await writeFile(
      join(uploadFileDir, fileFilename),
      Buffer.from(fileBuffer)
    )
    
    // Insert ke database
    const [result]: any = await connection.query(
      `INSERT INTO buku (judul, penerbit, tahun, isbn, deskripsi, cover, link) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [judul, penerbit, tahun, isbn, deskripsi, coverFilename, fileFilename]
    )
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Buku berhasil ditambahkan",
        id: result.insertId 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[POST] Create buku error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat menambah buku",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// PATCH - Update buku
// PATCH - Update buku
export async function PATCH(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const id = formData.get("id") as string
    const judul = formData.get("judul") as string
    const penerbit = formData.get("penerbit") as string
    const tahun = formData.get("tahun") as string
    const isbn = formData.get("isbn") as string
    const deskripsi = formData.get("deskripsi") as string || null
    const coverFile = formData.get("cover") as File
    const fileBuku = formData.get("fileBuku") as File
    
    if (!id) {
      return NextResponse.json(
        { error: "ID buku diperlukan" },
        { status: 400 }
      )
    }
    
    // Cek apakah buku ada
    const [existing]: any = await connection.query(
      "SELECT * FROM buku WHERE id = ?",
      [id]
    )
    
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Buku tidak ditemukan" },
        { status: 404 }
      )
    }
    
    const book = existing[0]
    let coverFilename = book.cover
    let fileFilename = book.link
    
    // Handle cover update
    if (coverFile && coverFile.size > 0) {
      const timestamp = Date.now()
      const coverExt = coverFile.name.split('.').pop()
      coverFilename = `cover_${timestamp}.${coverExt}`
      
      const coverBuffer = await coverFile.arrayBuffer()
      await writeFile(
        join(uploadCoverDir, coverFilename),
        Buffer.from(coverBuffer)
      )
      
      // Hapus cover lama jika ada (opsional)
      try {
        if (book.cover) {
          const oldCoverPath = join(uploadCoverDir, book.cover)
          if (existsSync(oldCoverPath)) {
            // Hapus file lama - bisa di-uncomment jika diperlukan
            // await unlink(oldCoverPath)
          }
        }
      } catch (err) {
        console.log("Gagal menghapus cover lama:", err)
      }
    }
    
    // Handle file update
    if (fileBuku && fileBuku.size > 0) {
      const timestamp = Date.now()
      const fileExt = fileBuku.name.split('.').pop()
      fileFilename = `file_${timestamp}.${fileExt}`
      
      const fileBuffer = await fileBuku.arrayBuffer()
      await writeFile(
        join(uploadFileDir, fileFilename),
        Buffer.from(fileBuffer)
      )
      
      // Hapus file lama jika ada (opsional)
      try {
        if (book.link) {
          const oldFilePath = join(uploadFileDir, book.link)
          if (existsSync(oldFilePath)) {
            // Hapus file lama - bisa di-uncomment jika diperlukan
            // await unlink(oldFilePath)
          }
        }
      } catch (err) {
        console.log("Gagal menghapus file lama:", err)
      }
    }
    
    // PERBAIKAN: Hapus updated_at dari query karena kolom tidak ada
    await connection.query(
      `UPDATE buku 
       SET judul = ?, penerbit = ?, tahun = ?, isbn = ?, deskripsi = ?, 
           cover = ?, link = ?
       WHERE id = ?`,
      [judul, penerbit, tahun, isbn, deskripsi, coverFilename, fileFilename, id]
    )
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Buku berhasil diperbarui" 
      }
    )
  } catch (error: any) {
    console.error("[PATCH] Update buku error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat memperbarui buku",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}

// DELETE - Hapus buku
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json(
        { error: "ID buku diperlukan" },
        { status: 400 }
      )
    }
    
    // Cek apakah buku ada
    const [existing]: any = await connection.query(
      "SELECT cover, link FROM buku WHERE id = ?",
      [id]
    )
    
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Buku tidak ditemukan" },
        { status: 404 }
      )
    }
    
    const book = existing[0]
    
    // Hapus dari database
    await connection.query("DELETE FROM buku WHERE id = ?", [id])
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Buku berhasil dihapus" 
      }
    )
  } catch (error: any) {
    console.error("[DELETE] Hapus buku error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat menghapus buku",
        detail: error.message 
      }, 
      { status: 500 }
    )
  }
}