import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const results = await query("SELECT * FROM publikasi ORDER BY tahun DESC");
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Fetch publikasi error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data publikasi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { judul, tahun, jenis, link, deskripsi } = await request.json();

    if (!judul || !tahun)
      return NextResponse.json(
        { error: "Judul dan tahun wajib diisi!" },
        { status: 400 }
      );

    await query(
      "INSERT INTO publikasi (judul, tahun, jenis, link, deskripsi) VALUES (?, ?, ?, ?, ?)",
      [judul, tahun, jenis, link, deskripsi]
    );

    return NextResponse.json({
      success: true,
      message: "Publikasi berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Tambah publikasi error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menambah publikasi" },
      { status: 500 }
    );
  }
}
