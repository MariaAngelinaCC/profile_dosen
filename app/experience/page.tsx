"use client"

import { Briefcase, Award, Users, Calendar, Building, MapPin, ChevronDown, Filter, Search, Star, Globe, GraduationCap, TrendingUp, ExternalLink, ChevronRight, Mic, Edit, CheckCircle } from "lucide-react"
import { useState, useEffect, useMemo } from "react"

interface Experience {
  id: number
  id_profil: number | null
  kategori: "Speaker" | "Reviewer" | "Professional"
  judul: string
  instansi: string
  tahun: string | number
  deskripsi: string | null
  created_at?: string
  lokasi?: string
  url?: string
  skills?: string[]
  achievements?: string[]
}

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "Speaker" | "Reviewer" | "Professional">("all")
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")
  const [expandedDescription, setExpandedDescription] = useState<number | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    speaker: 0,
    reviewer: 0,
    professional: 0
  })

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/pengalaman")
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Gagal mengambil data pengalaman")
        }

        const result = await response.json()
        const data = result.data || []
        
        console.log("Data pengalaman dari API:", data)
        
        // Validasi dan normalisasi data dari API
        const normalizedData = data.map((exp: any) => {
          // Pastikan kategori valid
          let validKategori: "Speaker" | "Reviewer" | "Professional" = "Professional"
          if (exp.kategori === "Speaker" || exp.kategori === "Reviewer" || exp.kategori === "Professional") {
            validKategori = exp.kategori
          }
          
          // Konversi tahun ke string jika perlu
          const tahunStr = exp.tahun ? exp.tahun.toString() : ""
          
          return {
            id: exp.id || 0,
            id_profil: exp.id_profil || null,
            kategori: validKategori,
            judul: exp.judul || "Judul tidak tersedia",
            instansi: exp.instansi || "Institusi tidak tersedia",
            tahun: tahunStr,
            deskripsi: exp.deskripsi || null,
            created_at: exp.created_at,
            lokasi: exp.lokasi || "",
            url: exp.url || "#",
            skills: [], // Tidak ada di database, bisa diisi manual jika perlu
            achievements: [] // Tidak ada di database, bisa diisi manual jika perlu
          }
        })
        
        setExperiences(normalizedData)
        
        // Calculate statistics berdasarkan kategori yang valid
        const speaker = normalizedData.filter((exp: Experience) => 
          exp.kategori === "Speaker"
        ).length
        
        const reviewer = normalizedData.filter((exp: Experience) => 
          exp.kategori === "Reviewer"
        ).length
        
        const professional = normalizedData.filter((exp: Experience) => 
          exp.kategori === "Professional"
        ).length
        
        setStats({
          total: normalizedData.length,
          speaker,
          reviewer,
          professional
        })
      } catch (err) {
        console.error("Error fetching experience:", err)
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data pengalaman")
      } finally {
        setLoading(false)
      }
    }

    fetchExperience()
  }, [])

  const filteredExperiences = useMemo(() => {
    let filtered = experiences
    
    // Category filter
    if (filterBy !== "all") {
      filtered = filtered.filter(exp => exp.kategori === filterBy)
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(exp => 
        exp.judul.toLowerCase().includes(query) ||
        exp.instansi.toLowerCase().includes(query) ||
        (exp.deskripsi && exp.deskripsi.toLowerCase().includes(query)) ||
        (exp.lokasi && exp.lokasi.toLowerCase().includes(query))
      )
    }
    
    // Sort by tahun (descending untuk recent, ascending untuk oldest)
    filtered = [...filtered].sort((a, b) => {
      const tahunA = parseInt(a.tahun.toString()) || 0
      const tahunB = parseInt(b.tahun.toString()) || 0
      
      if (sortBy === "oldest") {
        return tahunA - tahunB
      }
      // default: recent
      return tahunB - tahunA
    })
    
    return filtered
  }, [experiences, filterBy, searchQuery, sortBy])

  const getCategoryIcon = (kategori: string) => {
    switch (kategori) {
      case "Speaker":
        return <Mic className="text-purple-500" size={20} />
      case "Reviewer":
        return <Edit className="text-amber-500" size={20} />
      case "Professional":
        return <Briefcase className="text-blue-500" size={20} />
      default:
        return <Briefcase className="text-blue-500" size={20} />
    }
  }

  const getCategoryBadgeColor = (kategori: string) => {
    switch (kategori) {
      case "Speaker":
        return "bg-gradient-to-r from-purple-500 to-pink-500"
      case "Reviewer":
        return "bg-gradient-to-r from-amber-500 to-orange-500"
      case "Professional":
        return "bg-gradient-to-r from-blue-500 to-cyan-500"
      default:
        return "bg-gradient-to-r from-blue-500 to-cyan-500"
    }
  }

  const toggleDescription = (id: number) => {
    setExpandedDescription(expandedDescription === id ? null : id)
  }

  // Helper untuk mendapatkan description yang aman
  const getSafeDescription = (desc: string | null) => {
    return desc || "Tidak ada deskripsi tersedia untuk pengalaman ini."
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-pulse">
            <Briefcase className="w-10 h-10 text-white" />
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
    <div className="w-full bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Briefcase size={18} />
              <span>Pengalaman Professional</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Jejak</span>
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Pengalaman
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl leading-relaxed">
              Koleksi pengalaman profesional sebagai pembicara, peninjau, dan praktisi 
              dalam berbagai forum akademik dan profesional.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: "Total Pengalaman", 
              value: stats.total, 
              icon: Briefcase,
              color: "from-blue-500 to-cyan-500",
              description: "Semua kategori"
            },
            { 
              label: "Speaker", 
              value: stats.speaker, 
              icon: Mic,
              color: "from-purple-500 to-pink-500",
              description: "Pembicara"
            },
            { 
              label: "Reviewer", 
              value: stats.reviewer, 
              icon: Edit,
              color: "from-amber-500 to-orange-500",
              description: "Peninjau"
            },
            { 
              label: "Professional", 
              value: stats.professional, 
              icon: CheckCircle,
              color: "from-emerald-500 to-green-500",
              description: "Profesional"
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
                      placeholder="Cari pengalaman berdasarkan judul, instansi, atau deskripsi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-5 py-4 bg-white/80 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-lg backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "recent" | "oldest")}
                    className="appearance-none pl-5 pr-10 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium shadow-md"
                  >
                    <option value="recent">Terbaru</option>
                    <option value="oldest">Terlama</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilterBy("all")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                  filterBy === "all"
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
                onClick={() => setFilterBy("Speaker")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                  filterBy === "Speaker"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200"
                }`}
              >
                <Mic size={18} />
                Speaker
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                  {stats.speaker}
                </span>
              </button>
              <button
                onClick={() => setFilterBy("Reviewer")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                  filterBy === "Reviewer"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xl scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200"
                }`}
              >
                <Edit size={18} />
                Reviewer
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                  {stats.reviewer}
                </span>
              </button>
              <button
                onClick={() => setFilterBy("Professional")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                  filterBy === "Professional"
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xl scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200"
                }`}
              >
                <Briefcase size={18} />
                Professional
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                  {stats.professional}
                </span>
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">Gagal Memuat Data Pengalaman</h3>
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

          {/* Experience Cards */}
          <div className="space-y-8">
            {filteredExperiences.map((exp, index) => (
              <div
                key={exp.id}
                className="group relative"
              >
                {/* Timeline Line (Desktop only) */}
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-blue-300 to-cyan-200"></div>
                
                {/* Timeline Dot */}
                <div className={`absolute left-8 lg:left-1/2 transform lg:-translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white ${
                  getCategoryBadgeColor(exp.kategori)
                } z-10`}></div>
                
                {/* Experience Card */}
                <div className={`ml-16 lg:ml-0 lg:w-5/12 ${index % 2 === 0 ? 'lg:mr-auto lg:pr-8' : 'lg:ml-auto lg:pl-8'}`}>
                  <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 overflow-hidden">
                    <div className="p-8">
                      {/* Header with Category and Year */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`px-4 py-2 rounded-lg font-bold text-white ${getCategoryBadgeColor(exp.kategori)}`}>
                            {exp.kategori.toUpperCase()}
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                            <Calendar size={16} className="text-gray-600" />
                            <span className="font-bold text-gray-700">
                              Tahun: {exp.tahun}
                            </span>
                          </div>
                        </div>
                        
                        {/* Current/Most Recent Badge */}
                        {index === 0 && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                            <TrendingUp size={16} className="text-green-600" />
                            <span className="font-bold text-green-700">Terbaru</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-snug group-hover:text-blue-700 transition-colors">
                        {exp.judul}
                      </h3>

                      {/* Institution */}
                      <div className="flex flex-wrap items-center gap-6 mb-6">
                        <div className="flex items-center gap-2">
                          <Building size={18} className="text-gray-500" />
                          <span className="font-semibold text-gray-700">
                            {exp.instansi}
                          </span>
                        </div>
                        {exp.lokasi && (
                          <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {exp.lokasi}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-gray-700">Deskripsi</p>
                          {exp.deskripsi && exp.deskripsi.length > 150 && (
                            <button
                              onClick={() => toggleDescription(exp.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                            >
                              {expandedDescription === exp.id ? 'Sembunyikan' : 'Baca Selengkapnya'}
                              <ChevronDown 
                                size={16} 
                                className={`transition-transform ${expandedDescription === exp.id ? 'rotate-180' : ''}`}
                              />
                            </button>
                          )}
                        </div>
                        <p className={`text-gray-600 leading-relaxed transition-all duration-300 ${
                          expandedDescription === exp.id ? '' : exp.deskripsi && exp.deskripsi.length > 150 ? 'line-clamp-3' : ''
                        }`}>
                          {getSafeDescription(exp.deskripsi)}
                        </p>
                      </div>

                      {/* Optional Skills Section */}
                      {exp.skills && exp.skills.length > 0 && (
                        <div className="mb-6">
                          <p className="text-sm text-gray-500 mb-2">Keahlian Terkait:</p>
                          <div className="flex flex-wrap gap-2">
                            {exp.skills.map((skill, idx) => (
                              <span 
                                key={idx} 
                                className={`px-3 py-1.5 rounded-lg border text-sm ${
                                  exp.kategori === "Speaker" 
                                    ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200"
                                    : exp.kategori === "Reviewer"
                                    ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200"
                                    : "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200"
                                } transition-colors`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Dihapus */}
                      {/* Tombol detail dihapus dari sini */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredExperiences.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl mb-8">
                <Briefcase className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {searchQuery ? "Pengalaman Tidak Ditemukan" : "Belum Ada Pengalaman"}
              </h3>
              <p className="text-gray-600 max-w-xl mx-auto mb-10 text-lg">
                {searchQuery 
                  ? `Tidak ditemukan pengalaman dengan kata kunci "${searchQuery}". 
                     Coba dengan kata kunci yang berbeda atau gunakan filter lain.`
                  : filterBy !== "all"
                    ? `Belum ada pengalaman dengan kategori "${filterBy}".`
                    : "Belum ada data pengalaman yang tersedia dalam database."}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setFilterBy("all")
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  Reset Pencarian
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          )}

          {/* Footer Info */}
          {filteredExperiences.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-gray-600">
                    Menampilkan <span className="font-bold text-gray-900">{filteredExperiences.length}</span> dari{' '}
                    <span className="font-bold text-gray-900">{stats.total}</span> pengalaman
                    {filterBy !== "all" && ` (kategori: ${filterBy})`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Data diperbarui: {experiences[0]?.created_at 
                      ? new Date(experiences[0].created_at).toLocaleDateString('id-ID') 
                      : 'Baru saja'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Category Summary - Dihapus */}
      {/* Bagian Category Summary dihapus seluruhnya */}
    </div>
  )
}