"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface ProfileData {
  id?: number
  nama: string
  nidn: string
  jabatan: string
  fakultas: string
  prodi: string
  email: string
  telepon: string
  alamat: string
  pendidikan_terakhir: string
  universitas: string
  tahun_lulus: number
  deskripsi: string
}

export default function ProfileEditPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  const [formData, setFormData] = useState<ProfileData>({
    nama: "",
    nidn: "",
    jabatan: "",
    fakultas: "",
    prodi: "",
    email: "",
    telepon: "",
    alamat: "",
    pendidikan_terakhir: "",
    universitas: "",
    tahun_lulus: new Date().getFullYear(),
    deskripsi: "",
  })

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth")
    if (!auth) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
      fetchProfileData()
    }
  }, [router])

  const fetchProfileData = async () => {
    try {
      setPageLoading(true)
      const response = await fetch("/api/dosen")
      if (!response.ok) throw new Error("Failed to fetch profile")
      const data = await response.json()

      if (data.length > 0) {
        setFormData(data[0])
      }
    } catch (err) {
      console.error("[v0] Error fetching profile:", err)
      setError("Gagal memuat data profil")
    } finally {
      setPageLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tahun_lulus" ? Number.parseInt(value) : value,
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validasi input
    if (!formData.nama || !formData.email) {
      setError("Nama dan Email harus diisi!")
      setLoading(false)
      return
    }

    try {
      const method = formData.id ? "PUT" : "POST"
      const response = await fetch("/api/dosen", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save profile")
      }

      const result = await response.json()

      // Update form dengan id jika ini adalah insert baru
      if (!formData.id && result.id) {
        setFormData((prev) => ({ ...prev, id: result.id }))
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error("[v0] Error saving profile:", err)
      setError(err instanceof Error ? err.message : "Error menyimpan profil")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <Link href="/admin/dashboard" className="hover:opacity-80 transition-opacity">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Profil Dosen</h1>
            <p className="text-primary-foreground/80 text-sm">Perbarui informasi profil pribadi Anda</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            Profil berhasil disimpan!
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {pageLoading ? (
          <div className="text-center py-12">
            <p className="text-foreground/60">Memuat data profil...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">NIDN</label>
                <input
                  type="text"
                  name="nidn"
                  value={formData.nidn}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Jabatan</label>
                <input
                  type="text"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Fakultas</label>
                <input
                  type="text"
                  name="fakultas"
                  value={formData.fakultas}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Program Studi</label>
                <input
                  type="text"
                  name="prodi"
                  value={formData.prodi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Telepon</label>
                <input
                  type="tel"
                  name="telepon"
                  value={formData.telepon}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Alamat</label>
                <input
                  type="text"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Pendidikan Terakhir</label>
                <input
                  type="text"
                  name="pendidikan_terakhir"
                  value={formData.pendidikan_terakhir}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Universitas</label>
                <input
                  type="text"
                  name="universitas"
                  value={formData.universitas}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-foreground mb-2">Tahun Lulus</label>
              <input
                type="number"
                name="tahun_lulus"
                value={formData.tahun_lulus}
                onChange={handleChange}
                min="1950"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-foreground mb-2">Deskripsi Singkat</label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={6}
                placeholder="Ceritakan tentang Anda, keahlian, dan pengalaman akademik..."
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <Link
                href="/admin/dashboard"
                className="px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-secondary transition-colors"
              >
                Batal
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
