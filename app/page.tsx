"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Users, FileText, Award, GraduationCap, Calendar, BarChart, Download, Upload, Image as ImageIcon, X, Check, Loader2 } from "lucide-react"

export default function Home() {
  const [counts, setCounts] = useState({
    publikasi: 0,
    buku: 0,
    penghargaan: 0,
    tahunMengajar: 0,
  })

  // State untuk klasifikasi citra
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [classificationResult, setClassificationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Ambil jumlah data dari 4 API
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [pub, buku, exp, penelitian] = await Promise.all([
          fetch("/api/publikasi").then((res) => res.json()),
          fetch("/api/buku").then((res) => res.json()),
          fetch("/api/pengalaman").then((res) => res.json()),
          fetch("/api/penelitian").then((res) => res.json()),
        ])

        setCounts({
          publikasi: pub?.data?.length || 0,
          buku: buku?.data?.length || 0,
          penghargaan: exp?.data?.length || 0,
          tahunMengajar: penelitian?.data?.length || 0,
        })
      } catch (err) {
        console.error("❌ Gagal mengambil data dashboard:", err)
      }
    }

    fetchCounts()
  }, [])

  // Fungsi untuk handle upload gambar
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      setError("Harap upload file gambar (JPEG, PNG, dll.)")
      return
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal 5MB")
      return
    }

    setImageFile(file)
    setError(null)
    setClassificationResult(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Fungsi untuk klasifikasi gambar
  const handleClassifyImage = async () => {
    if (!imageFile) {
      setError("Harap pilih gambar terlebih dahulu")
      return
    }

    setIsUploading(true)
    setError(null)
    setClassificationResult(null)

    try {
      // Buat FormData untuk mengirim file
      const formData = new FormData()
      formData.append('image', imageFile)

      // Kirim ke API endpoint (Anda perlu membuat endpoint ini di /api/classify)
      const response = await fetch('/api/classify', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Gagal melakukan klasifikasi')
      }

      const result = await response.json()
      setClassificationResult(result)
    } catch (err) {
      console.error("Error classifying image:", err)
      setError("Gagal melakukan klasifikasi. Silakan coba lagi.")
      
      // Fallback: Simulasi hasil untuk demo
      // Hapus bagian ini jika sudah memiliki API yang sebenarnya
      setTimeout(() => {
        const mockResult = {
          success: true,
          classification: {
            label: "Klasifikasi Demo",
            confidence: 0.85,
            predicted_class: "Academic Document",
            probabilities: [
              { class: "Academic Document", probability: 0.85 },
              { class: "Research Paper", probability: 0.10 },
              { class: "Book Cover", probability: 0.05 },
            ]
          }
        }
        setClassificationResult(mockResult)
        setIsUploading(false)
      }, 1500)
      return
    }

    setIsUploading(false)
  }

  // Fungsi untuk menghapus gambar
  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setClassificationResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-16 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                <GraduationCap size={16} />
                Profil Akademik Dosen
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Selamat Datang di
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Profil Akademik
                </span>
              </h1>
              <p className="text-lg text-foreground/80 mb-8 max-w-2xl leading-relaxed">
                Jelajahi profil, publikasi ilmiah, penelitian, dan pengabdian masyarakat dari seorang dosen profesional dengan pengalaman bertahun-tahun di dunia akademik.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Users size={20} />
                  Lihat Profil Lengkap
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/publications"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-primary/30 text-primary rounded-xl font-semibold hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                >
                  <FileText size={20} />
                  Telusuri Publikasi
                </Link>
              </div>
            </div>
            
            {/* Profile Image Section */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative mx-auto lg:ml-auto max-w-md">
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 shadow-2xl">
                  {/* Placeholder untuk foto profil - Anda bisa mengganti dengan Image dari next/image */}
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="relative mb-6">
                      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center mx-auto">
                        <Users size={80} className="text-primary" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-accent rounded-full flex items-center justify-center border-4 border-background">
                        <Award size={24} className="text-accent-foreground" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Prof. Dr. John Doe</h3>
                    <p className="text-foreground/70 mb-4">Dosen Fakultas Ilmu Komputer</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                      <Calendar size={16} />
                      <span className="text-sm font-medium">Pengalaman {counts.tahunMengajar}+ tahun</span>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/20 rounded-2xl -z-10 rotate-12"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-2xl -z-10 -rotate-12"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Klasifikasi Citra Digital Section */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Klasifikasi Citra Digital
              </span>
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Unggah gambar untuk melakukan klasifikasi menggunakan model pembelajaran mesin. Mendukung berbagai jenis gambar akademik dan penelitian.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div className="bg-card border-2 border-dashed border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
                  <Upload size={36} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Unggah Gambar</h3>
                <p className="text-foreground/70 mb-6">
                  Pilih file gambar (JPEG, PNG, dll.) dengan ukuran maksimal 5MB
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                />
                
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-semibold cursor-pointer hover:shadow-lg transition-all duration-300 mb-4"
                >
                  <ImageIcon size={20} />
                  Pilih Gambar
                </label>

                <p className="text-sm text-foreground/50">
                  Atau drag and drop file di sini
                </p>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Preview Area */}
              {imagePreview && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">Preview Gambar</h4>
                    <button
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm"
                    >
                      <X size={16} />
                      Hapus
                    </button>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-sm font-medium">
                        {imageFile?.name}
                      </p>
                      <p className="text-white/80 text-xs">
                        {(imageFile?.size ? imageFile.size / 1024 : 0).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Classification Results */}
            <div className="space-y-8">
              {/* Classification Button */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-foreground mb-4">Klasifikasi Gambar</h3>
                <p className="text-foreground/70 mb-6">
                  Klik tombol di bawah untuk memulai proses klasifikasi gambar yang telah diunggah.
                </p>
                
                <button
                  onClick={handleClassifyImage}
                  disabled={!imageFile || isUploading}
                  className={`w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg font-semibold transition-all duration-300 ${
                    !imageFile || isUploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Mulai Klasifikasi
                    </>
                  )}
                </button>

                {!imageFile && (
                  <p className="mt-4 text-sm text-amber-600">
                    * Harap unggah gambar terlebih dahulu
                  </p>
                )}
              </div>

              {/* Results Display */}
              {classificationResult && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full">
                      <Check size={24} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Hasil Klasifikasi</h3>
                      <p className="text-foreground/70">Analisis gambar berhasil dilakukan</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Predicted Class */}
                    <div className="bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="text-sm text-foreground/60 mb-1">Kelas Prediksi</p>
                      <p className="text-2xl font-bold text-foreground">
                        {classificationResult.classification?.predicted_class || classificationResult.classification?.label}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(classificationResult.classification?.confidence || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {((classificationResult.classification?.confidence || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Probability Distribution */}
                    {classificationResult.classification?.probabilities && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-4">Distribusi Probabilitas</h4>
                        <div className="space-y-3">
                          {classificationResult.classification.probabilities.map((prob: any, index: number) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-foreground">{prob.class}</span>
                                <span className="text-foreground/70 font-medium">
                                  {(prob.probability * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-primary/60 to-accent/60 h-2 rounded-full" 
                                  style={{ width: `${prob.probability * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="pt-4 border-t border-border">
                      <h4 className="font-semibold text-foreground mb-3">Informasi Tambahan</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs text-foreground/60">Status</p>
                          <p className="font-medium text-foreground">Berhasil</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs text-foreground/60">Akurasi</p>
                          <p className="font-medium text-foreground">
                            {((classificationResult.classification?.confidence || 0) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <ImageIcon size={24} className="text-primary" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Format Gambar</h4>
              <p className="text-foreground/70 text-sm">
                Mendukung JPEG, PNG, WebP, dan format gambar lainnya hingga 5MB.
              </p>
            </div>
            <div className="bg-accent/5 border border-accent/10 rounded-xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4">
                <BookOpen size={24} className="text-accent" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Kategori Akademik</h4>
              <p className="text-foreground/70 text-sm">
                Dapat mengklasifikasi gambar dokumen, jurnal, buku, dan materi akademik lainnya.
              </p>
            </div>
            <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4">
                <BarChart size={24} className="text-green-500" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Analisis Mendalam</h4>
              <p className="text-foreground/70 text-sm">
                Menyediakan hasil klasifikasi dengan probabilitas dan tingkat kepercayaan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Highlight Aktivitas
              </span>
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Eksplorasi berbagai aktivitas akademik, penelitian, dan pengabdian masyarakat yang telah dilakukan.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Publikasi Terbaru",
                icon: FileText,
                description: "Jurnal internasional & nasional terindeks Scopus",
                count: counts.publikasi,
                color: "border-l-blue-500",
                link: "/publications",
                linkText: "Lihat Publikasi"
              },
              {
                title: "Penelitian",
                icon: BookOpen,
                description: "Proyek penelitian multidisiplin terkini",
                count: counts.buku,
                color: "border-l-green-500",
                link: "/research",
                linkText: "Telusuri Penelitian"
              },
              {
                title: "Pengabdian Masyarakat",
                icon: Users,
                description: "Program pengabdian kepada masyarakat",
                count: counts.penghargaan,
                color: "border-l-amber-500",
                link: "/community-service",
                linkText: "Selengkapnya"
              },
              {
                title: "Pencapaian",
                icon: Award,
                description: "Penghargaan dan sertifikasi profesional",
                count: counts.penghargaan,
                color: "border-l-purple-500",
                link: "/achievements",
                linkText: "Lihat Pencapaian"
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group ${item.color} border-l-4`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                </div>
                <p className="text-foreground/70 mb-6">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Total</p>
                    <p className="text-3xl font-bold text-foreground">{item.count}</p>
                  </div>
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium text-sm group-hover:gap-2 transition-all"
                  >
                    {item.linkText}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}