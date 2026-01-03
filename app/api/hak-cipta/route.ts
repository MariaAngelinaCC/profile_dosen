import { connection } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"

// Konfigurasi upload
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "copyrights")
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

// Pastikan direktori upload ada
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true })
}

export async function GET() {
  try {
    const [rows] = await connection.query(
      "SELECT * FROM copyright ORDER BY created_at DESC, tahun DESC"
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data hak cipta" }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Ambil data dari form
    const judul = formData.get("judul") as string
    const nomor_pendaftaran = formData.get("nomor_pendaftaran") as string
    const tahun = formData.get("tahun") as string
    const deskripsi = formData.get("deskripsi") as string
    const file = formData.get("file") as File | null

    // Validasi input
    if (!judul?.trim()) {
      return NextResponse.json(
        { error: "Judul hak cipta harus diisi" }, 
        { status: 400 }
      )
    }

    if (!nomor_pendaftaran?.trim()) {
      return NextResponse.json(
        { error: "Nomor pendaftaran harus diisi" }, 
        { status: 400 }
      )
    }

    let fileUrl = null
    let fileName = null

    // Handle file upload jika ada
    if (file && file.size > 0) {
      // Validasi ukuran file
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Ukuran file terlalu besar. Maksimal 10MB" }, 
          { status: 400 }
        )
      }

      // Validasi tipe file
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Format file tidak didukung. Gunakan PDF, JPG, JPEG, PNG, atau WebP" }, 
          { status: 400 }
        )
      }

      // Generate nama file unik
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      fileName = `copyright_${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`
      const filePath = join(UPLOAD_DIR, fileName)
      
      // Convert file ke buffer dan simpan
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Generate URL untuk akses file
      fileUrl = `/uploads/copyrights/${fileName}`
    }

    // Insert ke database
    await connection.query(
      `INSERT INTO copyright 
       (judul, nomor_pendaftaran, tahun, link, deskripsi, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        judul.trim(),
        nomor_pendaftaran.trim(),
        tahun || new Date().getFullYear(),
        fileUrl,
        deskripsi?.trim() || null
      ]
    )

    return NextResponse.json(
      { 
        message: "Hak cipta berhasil ditambahkan",
        fileUrl: fileUrl 
      }, 
      { status: 201 }
    )
  } catch (error) {
    console.error("Error uploading copyright:", error)
    return NextResponse.json(
      { error: "Gagal menambahkan hak cipta" }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Ambil data dari form
    const id = formData.get("id") as string
    const judul = formData.get("judul") as string
    const nomor_pendaftaran = formData.get("nomor_pendaftaran") as string
    const tahun = formData.get("tahun") as string
    const deskripsi = formData.get("deskripsi") as string
    const file = formData.get("file") as File | null

    if (!id) {
      return NextResponse.json(
        { error: "ID hak cipta diperlukan" }, 
        { status: 400 }
      )
    }

    // Ambil data lama untuk mendapatkan file yang ada
    const [existingRows]: any = await connection.query(
      "SELECT link FROM copyright WHERE id = ?",
      [id]
    )

    if (existingRows.length === 0) {
      return NextResponse.json(
        { error: "Hak cipta tidak ditemukan" }, 
        { status: 404 }
      )
    }

    const existingLink = existingRows[0].link
    let fileUrl = existingLink

    // Handle file upload baru jika ada
    if (file && file.size > 0) {
      // Validasi ukuran file
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Ukuran file terlalu besar. Maksimal 10MB" }, 
          { status: 400 }
        )
      }

      // Validasi tipe file
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Format file tidak didukung. Gunakan PDF, JPG, JPEG, PNG, atau WebP" }, 
          { status: 400 }
        )
      }

      // Generate nama file unik
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `copyright_${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`
      const filePath = join(UPLOAD_DIR, fileName)
      
      // Convert file ke buffer dan simpan
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Update URL file
      fileUrl = `/uploads/copyrights/${fileName}`
    }

    // Update data di database
    await connection.query(
      `UPDATE copyright 
       SET judul = ?, 
           nomor_pendaftaran = ?, 
           tahun = ?, 
           link = ?, 
           deskripsi = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        judul?.trim() || '',
        nomor_pendaftaran?.trim() || '',
        tahun || new Date().getFullYear(),
        fileUrl,
        deskripsi?.trim() || null,
        id
      ]
    )

    return NextResponse.json(
      { 
        message: "Hak cipta berhasil diperbarui",
        fileUrl: fileUrl 
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error("Error updating copyright:", error)
    return NextResponse.json(
      { error: "Gagal memperbarui hak cipta" }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID hak cipta diperlukan" }, 
        { status: 400 }
      )
    }

    // Ambil data file sebelum menghapus untuk menghapus file fisik jika ada
    const [rows]: any = await connection.query(
      "SELECT link FROM copyright WHERE id = ?",
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Hak cipta tidak ditemukan" }, 
        { status: 404 }
      )
    }

    // Hapus file fisik jika ada
    const fileLink = rows[0].link
    if (fileLink) {
      try {
        const filePath = join(process.cwd(), 'public', fileLink)
        const { unlink } = await import('fs/promises')
        await unlink(filePath)
      } catch (fileError) {
        console.error("Error deleting file:", fileError)
        // Lanjutkan meski gagal hapus file
      }
    }

    // Hapus dari database
    await connection.query("DELETE FROM copyright WHERE id = ?", [id])

    return NextResponse.json(
      { message: "Hak cipta berhasil dihapus" }, 
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting copyright:", error)
    return NextResponse.json(
      { error: "Gagal menghapus hak cipta" }, 
      { status: 500 }
    )
  }
}

// Fungsi untuk mendapatkan detail hak cipta berdasarkan ID (optional)
export async function GET_BY_ID(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID hak cipta diperlukan" }, 
        { status: 400 }
      )
    }

    const [rows]: any = await connection.query(
      "SELECT * FROM copyright WHERE id = ?",
      [id]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Hak cipta tidak ditemukan" }, 
        { status: 404 }
      )
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data hak cipta" }, 
      { status: 500 }
    )
  }
}