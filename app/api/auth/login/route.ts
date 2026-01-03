import { query } from "@/lib/db"
import { comparePassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password harus diisi" }, { status: 400 })
    }

    // <-- GANTI: cari di tabel user_login (sesuai skema yang kamu kirim)
    const results = (await query(
      "SELECT id_user AS id, username, password FROM user_login WHERE username = ?",
      [username]
    )) as any[]

    if (results.length === 0) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 })
    }

    const user = results[0]

    // comparePassword di lib/db.ts melakukan hashing SHA-256 terhadap input
    if (!comparePassword(password, user.password)) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 })
    }

    // Jika lolos, kembalikan response sukses (kamu bisa set session/token di sini)
    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan saat login" }, { status: 500 })
  }
}