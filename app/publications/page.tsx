"use client"

import { ExternalLink, FileText, Calendar, Filter, Download, Search, ChevronRight, Award, Globe, BookOpen, Star, TrendingUp, Users, ChevronDown, Building } from "lucide-react"
import { useState, useEffect, useMemo } from "react"

interface Publication {
  id: number
  judul: string
  tahun: number
  jenis: string
  penerbit: string
  link: string
  deskripsi: string
  doi?: string
  citations?: number
  quartile?: string
  authors?: string[]
  impactFactor?: number
  indexing?: string[]
  pages?: string
}

export default function PublicationsPage() {
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("tahun") // tahun, citations, newest
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    journals: 0,
    conferences: 0,
    citations: 0,
    recentYear: 0,
    q1q2: 0
  })
  const [expandedDescription, setExpandedDescription] = useState<number | null>(null)

  // Helper function untuk safe string comparison
  const safeStringIncludes = (str: any, query: string): boolean => {
    if (!str) return false
    return str.toString().toLowerCase().includes(query.toLowerCase())
  }

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true)
        const filterParam = filter === "all" ? "" : `?jenis=${filter}`
        const response = await fetch(`/api/publikasi${filterParam}`)
        if (!response.ok) throw new Error("Gagal mengambil data publikasi")

        const result = await response.json()
        const data = result.data || []
        
        // Validasi dan normalisasi data
        const normalizedData = data.map((pub: Publication) => ({
          id: pub.id || Date.now() + Math.random(),
          judul: pub.judul || "Judul tidak tersedia",
          tahun: pub.tahun || new Date().getFullYear(),
          jenis: pub.jenis || "journal",
          penerbit: pub.penerbit || "Penerbit tidak tersedia",
          link: pub.link || "#",
          deskripsi: pub.deskripsi || "Deskripsi tidak tersedia",
          doi: pub.doi || "",
          citations: pub.citations || 0,
          quartile: pub.quartile || "",
          authors: pub.authors || [],
          impactFactor: pub.impactFactor || 0,
          indexing: pub.indexing || [],
          pages: pub.pages || ""
        }))
        
        setPublications(normalizedData)
        
        // Calculate statistics
        const journals = normalizedData.filter((p: Publication) => 
          p.jenis.toLowerCase() === "journal"
        ).length
        const conferences = normalizedData.filter((p: Publication) => 
          p.jenis.toLowerCase() === "conference"
        ).length
        const totalCitations = normalizedData.reduce(
          (sum: number, p: Publication) => sum + (p.citations || 0), 0
        )
        const recentYear = Math.max(
          ...normalizedData.map((p: Publication) => p.tahun), 
          new Date().getFullYear()
        )
        const q1q2 = normalizedData.filter((p: Publication) => 
          p.quartile === 'Q1' || p.quartile === 'q1' || 
          p.quartile === 'Q2' || p.quartile === 'q2'
        ).length
        
        setStats({
          total: normalizedData.length,
          journals,
          conferences,
          citations: totalCitations,
          recentYear,
          q1q2
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        console.error("[v0] Publications fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPublications()
  }, [filter])

  const filteredPublications = useMemo(() => {
    let filtered = publications
    
    // Search filter dengan safe access
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => {
        // Check semua field dengan safe function
        return (
          safeStringIncludes(p.judul, query) ||
          safeStringIncludes(p.deskripsi, query) ||
          safeStringIncludes(p.penerbit, query) ||
          safeStringIncludes(p.doi, query) ||
          (p.authors && p.authors.some(author => safeStringIncludes(author, query)))
        )
      })
    }
    
    // Sort dengan safe access untuk citations
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "citations":
          return (b.citations || 0) - (a.citations || 0)
        case "newest":
          return b.tahun - a.tahun
        case "tahun":
        default:
          return b.tahun - a.tahun
      }
    })
    
    return filtered
  }, [publications, searchQuery, sortBy])

  const getQuartileColor = (quartile?: string) => {
    const q = quartile?.toUpperCase() || ""
    switch (q) {
      case "Q1": return "bg-gradient-to-r from-green-500 to-emerald-600"
      case "Q2": return "bg-gradient-to-r from-blue-500 to-cyan-600"
      case "Q3": return "bg-gradient-to-r from-amber-500 to-orange-600"
      case "Q4": return "bg-gradient-to-r from-red-500 to-rose-600"
      default: return "bg-gradient-to-r from-gray-500 to-gray-600"
    }
  }

  const toggleDescription = (id: number) => {
    setExpandedDescription(expandedDescription === id ? null : id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Award size={18} />
              <span>Portofolio Akademik</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Publikasi</span>
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Ilmiah
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl leading-relaxed">
              Koleksi lengkap karya tulis ilmiah dalam bentuk jurnal internasional bereputasi, 
              prosiding konferensi terindeks, dan publikasi akademik berkualitas.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: "Total Publikasi", 
              value: stats.total, 
              icon: FileText,
              color: "from-blue-500 to-cyan-500",
              description: "Karya ilmiah"
            },
            { 
              label: "Jurnal Q1/Q2", 
              value: stats.q1q2, 
              icon: Star,
              color: "from-emerald-500 to-green-500",
              description: "Bereputasi tinggi"
            },
            { 
              label: "Total Citations", 
              value: stats.citations, 
              icon: TrendingUp,
              color: "from-purple-500 to-pink-500",
              description: "Dikutip"
            },
            { 
              label: "Tahun Terbaru", 
              value: stats.recentYear, 
              icon: Calendar,
              color: "from-amber-500 to-orange-500",
              description: "Publikasi terkini"
            },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.description}</div>
                </div>
              </div>
              <p className="text-gray-700 font-medium">{stat.label}</p>
              <div className={`mt-3 h-1.5 w-full bg-gradient-to-r ${stat.color} rounded-full`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-10"></div>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Cari publikasi berdasarkan judul, penulis, DOI, atau kata kunci..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-5 py-4 bg-white/80 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-lg backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sort & Filter */}
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-5 pr-10 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium shadow-md"
                  >
                    <option value="tahun">Tahun Terbaru</option>
                    <option value="citations">Citation Tertinggi</option>
                    <option value="newest">Terbaru Ditambahkan</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                  filter === "all"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200"
                }`}
              >
                <Filter size={18} />
                Semua
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                  {stats.total}
                </span>
              </button>
              <button
                onClick={() => setFilter("journal")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                  filter === "journal"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200"
                }`}
              >
                <BookOpen size={18} />
                Jurnal
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                  {stats.journals}
                </span>
              </button>
              <button
                onClick={() => setFilter("conference")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                  filter === "conference"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200"
                }`}
              >
                <Users size={18} />
                Konferensi
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                  {stats.conferences}
                </span>
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">Gagal Memuat Data Publikasi</h3>
                  <p className="text-red-700">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Publications List - SINGLE COLUMN VERTICAL */}
          <div className="space-y-8">
            {filteredPublications.map((pub) => (
              <div
                key={pub.id}
                className="group bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 overflow-hidden"
              >
                {/* Main Content */}
                <div className="p-8">
                  {/* Header with Year and Type */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-lg text-white font-bold ${getQuartileColor(pub.quartile)}`}>
                        {pub.tahun || "N/A"}
                      </div>
                      <div className={`px-4 py-2 rounded-lg font-semibold ${
                        pub.jenis?.toLowerCase() === "journal" 
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}>
                        {(pub.jenis || "JOURNAL").toUpperCase()}
                      </div>
                      {pub.quartile && (
                        <div className={`px-4 py-2 rounded-lg text-white font-bold ${getQuartileColor(pub.quartile)}`}>
                          {(pub.quartile || "").toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {/* Citations Badge */}
                    {pub.citations && pub.citations > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                        <TrendingUp size={16} className="text-purple-600" />
                        <span className="font-bold text-purple-700">{pub.citations}</span>
                        <span className="text-purple-600">citations</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-snug group-hover:text-blue-700 transition-colors">
                    {pub.judul || "Judul tidak tersedia"}
                  </h3>

                  {/* Publisher and DOI */}
                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <Building size={18} className="text-gray-500" />
                      <span className="font-semibold text-gray-700">
                        {pub.penerbit || "Penerbit tidak tersedia"}
                      </span>
                    </div>
                    {pub.doi && (
                      <div className="flex items-center gap-2">
                        <Globe size={18} className="text-gray-500" />
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded">
                          {pub.doi}
                        </span>
                      </div>
                    )}
                    {pub.pages && (
                      <div className="text-sm text-gray-500">
                        Pages: {pub.pages}
                      </div>
                    )}
                  </div>

                  {/* Authors */}
                  {pub.authors && pub.authors.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Penulis:</p>
                      <div className="flex flex-wrap gap-2">
                        {pub.authors.map((author, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                          >
                            {author || "Author tidak tersedia"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-700">Abstrak</p>
                      <button
                        onClick={() => toggleDescription(pub.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        {expandedDescription === pub.id ? 'Sembunyikan' : 'Baca Selengkapnya'}
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform ${expandedDescription === pub.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                    <p className={`text-gray-600 leading-relaxed transition-all duration-300 ${
                      expandedDescription === pub.id ? '' : 'line-clamp-3'
                    }`}>
                      {pub.deskripsi || "Deskripsi tidak tersedia"}
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-4 mb-8">
                    {pub.impactFactor && pub.impactFactor > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                        <Star size={16} className="text-amber-600" />
                        <span className="font-bold text-amber-700">IF: {pub.impactFactor}</span>
                      </div>
                    )}
                    
                    {pub.indexing && pub.indexing.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pub.indexing.map((index, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg border border-gray-200 text-sm"
                          >
                            {index || "Index"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    {pub.link && pub.link !== "#" ? (
                      <a
                        href={pub.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl hover:gap-4 hover:-translate-y-0.5 transition-all duration-300 group/link"
                      >
                        <ExternalLink size={20} />
                        Akses Full Text
                        <span className="group-hover/link:rotate-12 transition-transform">→</span>
                      </a>
                    ) : (
                      <button className="inline-flex items-center gap-3 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                        <FileText size={20} />
                        Full Text Tersedia
                      </button>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download size={20} />
                      </button>
                      <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPublications.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl mb-8">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {searchQuery ? "Publikasi Tidak Ditemukan" : "Belum Ada Publikasi"}
              </h3>
              <p className="text-gray-600 max-w-xl mx-auto mb-10 text-lg">
                {searchQuery 
                  ? `Tidak ditemukan publikasi dengan kata kunci "${searchQuery}". 
                     Coba dengan kata kunci yang berbeda atau gunakan filter lain.`
                  : filter === "all" 
                    ? "Belum ada publikasi yang tersedia dalam database." 
                    : `Belum ada publikasi dengan kategori "${filter}".`}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setFilter("all")
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  Reset Pencarian
                </button>
                <button 
                  onClick={() => setFilter("all")}
                  className="px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Lihat Semua Publikasi
                </button>
              </div>
            </div>
          )}

          {/* Footer Info */}
          {filteredPublications.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-gray-600">
                    Menampilkan <span className="font-bold text-gray-900">{filteredPublications.length}</span> dari{' '}
                    <span className="font-bold text-gray-900">{stats.total}</span> publikasi
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Sebelumnya
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</span>
                    <span className="text-gray-600">dari 1</span>
                  </div>
                  <button className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}