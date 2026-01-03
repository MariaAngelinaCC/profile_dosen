import { query } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { username, password, namaLengkap } = await request.json()

        // Validasi input
        if (!username || !password || !namaLengkap) {
            return NextResponse.json({ error: "Username, password, dan nama lengkap harus diisi" }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 })
        }

        // Cek username
        const existingUser = (await query(
            "SELECT id_user FROM user_login WHERE username = ?",
            [username]
        )) as any[];

        if (existingUser.length > 0) {
            return NextResponse.json({ error: "Username sudah terdaftar" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = hashPassword(password)

        // Insert user
        const result = await query(
            "INSERT INTO user_login (namalengkap, username, password) VALUES (?, ?, ?)",
            [namaLengkap, username, hashedPassword]
        )

        return NextResponse.json({
            success: true,
            message: "Akun berhasil dibuat",
            id: (result as any).insertId,
        })
    } catch (error) {
        console.error("[v0] Signup error:", error)
        return NextResponse.json({ error: "Terjadi kesalahan saat membuat akun" }, { status: 500 })
    }
}
