import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const [profil]: any = await query("SELECT COUNT(*) AS total FROM profil_dosen")
    const [publikasi]: any = await query("SELECT COUNT(*) AS total FROM publikasi")
    const [buku]: any = await query("SELECT COUNT(*) AS total FROM buku")
    const [pengalaman]: any = await query("SELECT COUNT(*) AS total FROM pengalaman")
    const [penelitian]: any = await query("SELECT COUNT(*) AS total FROM penelitian")
    const [pengabdian]: any = await query("SELECT COUNT(*) AS total FROM pengabdian")
    const [copyright]: any = await query("SELECT COUNT(*) AS total FROM hak_cipta")

    return NextResponse.json({
      profil: profil.total ?? 0,
      publikasi: publikasi.total ?? 0,
      buku: buku.total ?? 0,
      pengalaman: pengalaman.total ?? 0,
      penelitian: penelitian.total ?? 0,
      pengabdian: pengabdian.total ?? 0,
      copyright: copyright.total ?? 0,
    })
  } catch (error) {
    console.error("❌ Error fetching stats:", error)
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
  }
}
