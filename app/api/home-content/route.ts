import { connection } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const db = await connection()
    const [rows] = await db.query("SELECT * FROM home_content ORDER BY id DESC")
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch home content" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { judul, isi, foto } = await request.json()

    if (!judul || !isi) {
      return NextResponse.json({ error: "judul and isi are required" }, { status: 400 })
    }

    const db = await connection()
    await db.query("INSERT INTO home_content (judul, isi, foto) VALUES (?, ?, ?)", [judul, isi, foto || null])

    return NextResponse.json({ message: "Home content added successfully" }, { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to add home content" }, { status: 500 })
  }
}
