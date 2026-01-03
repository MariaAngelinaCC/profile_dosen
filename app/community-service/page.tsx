"use client"

import { Users, Calendar, Download, Filter, Search, ChevronDown, Award, Globe, TrendingUp, ChevronRight, Target, Database, Cpu, BookOpen, ExternalLink, BarChart, Zap, Layers, Cloud, Leaf, File, Folder, Clock, MapPin, Bookmark, Tag, Database as DatabaseIcon, Heart, Home, Building2, Trees, School, Hospital, Globe2, HandHeart, Rocket, Lightbulb, Trophy, Sparkles, ArrowRight } from "lucide-react"
import { useState, useEffect, useMemo } from "react"

interface Pengabdian {
  id: number
  id_profil?: number | null
  judul: string
  lokasi: string
  tahun: string | number
  deskripsi: string
  foto_kegiatan: string
  created_at?: string
}

export default function PengabdianPage() {
  const [pengabdian, setPengabdian] = useState<Pengabdian[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [expandedDescription, setExpandedDescription] = useState<number | null>(null)

  useEffect(() => {
    const fetchPengabdian = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/pengabdian")
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Gagal mengambil data pengabdian")
        }

        const result = await response.json()
        const data = result.data || []
        
        const formattedData = data.map((item: any) => ({
          id: item.id || 0,
          id_profil: item.id_profil || null,
          judul: item.judul || "Judul tidak tersedia",
          lokasi: item.lokasi || "Lokasi tidak tersedia",
          tahun: item.tahun ? item.tahun.toString() : new Date().getFullYear().toString(),
          deskripsi: item.deskripsi || "Deskripsi tidak tersedia",
          foto_kegiatan: item.foto_kegiatan || "",
          created_at: item.created_at || new Date().toISOString()
        }))
        
        setPengabdian(formattedData)
      } catch (err) {
        console.error("Error fetching pengabdian:", err)
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data pengabdian")
      } finally {
        setLoading(false)
      }
    }

    fetchPengabdian()
  }, [])

  // Get unique lokasi for filtering
  const uniqueLokasi = useMemo(() => {
    const lokasiSet = new Set(pengabdian.map(p => p.lokasi).filter(Boolean))
    return Array.from(lokasiSet).sort()
  }, [pengabdian])

  // Get unique years for filtering
  const uniqueYears = useMemo(() => {
    const yearsSet = new Set(pengabdian.map(p => parseInt(p.tahun.toString())).filter(Boolean))
    return Array.from(yearsSet).sort((a, b) => b - a)
  }, [pengabdian])

  const filteredPengabdian = useMemo(() => {
    let filtered = pengabdian
    
    if (filterBy.startsWith("lokasi-")) {
      const lokasi = filterBy.replace("lokasi-", "")
      filtered = filtered.filter(peng => peng.lokasi === lokasi)
    }
    
    else if (filterBy.startsWith("year-")) {
      const year = parseInt(filterBy.replace("year-", ""))
      filtered = filtered.filter(peng => parseInt(peng.tahun.toString()) === year)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(peng => 
        peng.judul.toLowerCase().includes(query) ||
        peng.deskripsi.toLowerCase().includes(query) ||
        peng.lokasi.toLowerCase().includes(query)
      )
    }
    
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return parseInt(a.tahun.toString()) - parseInt(b.tahun.toString())
        case "year":
          return parseInt(b.tahun.toString()) - parseInt(a.tahun.toString())
        case "recent":
        default:
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          }
          return parseInt(b.tahun.toString()) - parseInt(a.tahun.toString())
      }
    })
    
    return filtered
  }, [pengabdian, filterBy, searchQuery, sortBy])

  const toggleDescription = (id: number) => {
    setExpandedDescription(expandedDescription === id ? null : id)
  }

  // Stats data
  const stats = useMemo(() => ({
    total: pengabdian.length,
    locations: uniqueLokasi.length,
    years: uniqueYears.length,
    latestYear: uniqueYears[0] || new Date().getFullYear()
  }), [pengabdian, uniqueLokasi, uniqueYears])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-pulse">
            <HandHeart className="w-10 h-10 text-white" />
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
    <div className="w-full bg-gradient-to-b from-blue-50 via-white to-gray-50 min-h-screen">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-16 md:py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-700 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-indigo-800 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-cyan-500 rounded-full opacity-10 blur-2xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 border border-white/20">
              <HandHeart className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Pengabdian
              <span className="block text-4xl md:text-5xl mt-4">Kepada Masyarakat</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
              Dokumentasi kegiatan pengabdian masyarakat dalam berbagai bidang, 
              lokasi, dan tahun pelaksanaan untuk masyarakat Indonesia.
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mb-4 mx-auto">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{stats.total}</div>
                  <div className="text-blue-100 text-sm font-medium">Total Kegiatan</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mb-4 mx-auto">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{stats.locations}</div>
                  <div className="text-blue-100 text-sm font-medium">Lokasi</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl mb-4 mx-auto">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{stats.years}</div>
                  <div className="text-blue-100 text-sm font-medium">Tahun Aktif</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mb-4 mx-auto">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{stats.latestYear}</div>
                  <div className="text-blue-100 text-sm font-medium">Tahun Terbaru</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls Section */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              {/* Search Box */}
              <div className="flex-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20 blur transition-all duration-300 group-hover:opacity-30"></div>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                      <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari kegiatan pengabdian berdasarkan judul, lokasi, atau deskripsi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-16 pr-6 py-5 bg-white border-2 border-blue-100 rounded-2xl focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 text-lg shadow-lg backdrop-blur-sm transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Box */}
              <div className="flex flex-wrap gap-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-10 blur transition-all duration-300 group-hover:opacity-20"></div>
                  <div className="relative flex items-center">
                    <BarChart className="absolute left-4 w-5 h-5 text-blue-600" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none pl-12 pr-10 py-4 bg-white border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100 font-medium shadow-md min-w-[220px]"
                    >
                      <option value="recent">Terbaru Ditambahkan</option>
                      <option value="year">Tahun Terbaru</option>
                      <option value="oldest">Tahun Terlama</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="space-y-8">
              {/* Tahun Filter */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">Filter Berdasarkan Tahun:</p>
                  <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {uniqueYears.length} tahun
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setFilterBy("all")}
                    className={`px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 group ${
                      filterBy === "all"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transform scale-[1.02]"
                        : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl border-2 border-blue-50 hover:border-blue-100"
                    }`}
                  >
                    <Filter size={18} />
                    Semua Tahun
                    {filterBy === "all" && (
                      <Sparkles size={16} className="animate-pulse" />
                    )}
                  </button>
                  {uniqueYears.slice(0, 5).map((year) => (
                    <button
                      key={year}
                      onClick={() => setFilterBy(`year-${year}`)}
                      className={`px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 group ${
                        filterBy === `year-${year}`
                          ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg transform scale-[1.02]"
                          : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl border-2 border-orange-50 hover:border-orange-100"
                      }`}
                    >
                      <Calendar size={18} />
                      {year}
                      {filterBy === `year-${year}` && (
                        <Sparkles size={16} className="animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lokasi Filter */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">Filter Berdasarkan Lokasi:</p>
                  <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {uniqueLokasi.length} lokasi
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {uniqueLokasi.slice(0, 6).map((lokasi) => (
                    <button
                      key={lokasi}
                      onClick={() => setFilterBy(`lokasi-${lokasi}`)}
                      className={`px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 group ${
                        filterBy === `lokasi-${lokasi}`
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-[1.02]"
                          : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl border-2 border-green-50 hover:border-green-100"
                      }`}
                    >
                      <MapPin size={18} />
                      {lokasi.length > 20 ? lokasi.substring(0, 20) + '...' : lokasi}
                      {filterBy === `lokasi-${lokasi}` && (
                        <Sparkles size={16} className="animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8">
              <div className="relative overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-br from-red-50/80 to-orange-50/80 backdrop-blur-sm shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5"></div>
                <div className="relative p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-lg">
                      <Heart className="w-10 h-10 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-red-900 mb-3 flex items-center gap-3">
                        <span className="inline-block w-3 h-8 bg-gradient-to-b from-red-600 to-orange-600 rounded-full"></span>
                        Gagal Memuat Data Pengabdian
                      </h3>
                      <p className="text-red-800 mb-6 text-lg">{error}</p>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => window.location.reload()}
                          className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                        >
                          <Zap size={18} />
                          Coba Lagi
                        </button>
                        <button 
                          onClick={() => setError(null)}
                          className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                <HandHeart className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {filteredPengabdian.length} Kegiatan Ditemukan
                </h3>
                <p className="text-gray-600">
                  {filterBy !== "all" || searchQuery ? "Hasil pencarian dan filter" : "Semua kegiatan pengabdian"}
                </p>
              </div>
            </div>
            {(filterBy !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setFilterBy("all")
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:shadow-lg hover:bg-gray-300 transition-all duration-300 flex items-center gap-2"
              >
                <Filter size={18} />
                Reset Filter
              </button>
            )}
          </div>

          {/* Pengabdian Cards */}
          <div className="space-y-8">
            {filteredPengabdian.map((peng) => (
              <div
                key={peng.id}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-200 hover:border-blue-300"
              >
                {/* Decorative gradient line */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600"></div>
                
                {/* Card content */}
                <div className="p-10">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20"></div>
                        <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                          <HandHeart className="w-8 h-8 text-blue-700" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 shadow-sm">
                          <Calendar className="w-5 h-5 text-orange-600" />
                          <span className="font-bold text-orange-800 text-lg">Tahun: {peng.tahun}</span>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                          <MapPin className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-green-800 text-lg">{peng.lokasi}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl shadow-sm">
                        <DatabaseIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-mono font-bold text-gray-700 text-sm">
                          ID: {peng.id.toString().padStart(4, '0')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title with icon */}
                  <div className="mb-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg mt-1">
                        <Lightbulb className="w-6 h-6 text-blue-700" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 leading-tight group-hover:text-blue-800 transition-colors">
                        {peng.judul}
                      </h3>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                          <BookOpen className="w-5 h-5 text-purple-700" />
                        </div>
                        <p className="text-lg font-bold text-gray-800">Deskripsi Kegiatan</p>
                      </div>
                      <button
                        onClick={() => toggleDescription(peng.id)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-lg font-semibold hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 flex items-center gap-2 group"
                      >
                        {expandedDescription === peng.id ? 'Sembunyikan' : 'Baca Selengkapnya'}
                        <ChevronDown 
                          size={18} 
                          className={`transition-transform duration-300 ${expandedDescription === peng.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                    <div className="relative">
                      <div className={`text-gray-700 leading-relaxed text-lg transition-all duration-500 ${
                        expandedDescription === peng.id ? '' : 'line-clamp-4'
                      }`}>
                        {peng.deskripsi}
                      </div>
                      {!expandedDescription && (
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                      )}
                    </div>
                  </div>

                  {/* Footer with Documentation */}
                  <div className="pt-8 border-t border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className={`relative overflow-hidden rounded-2xl p-1 ${
                          peng.foto_kegiatan 
                            ? "bg-gradient-to-r from-emerald-400 to-green-400"
                            : "bg-gradient-to-r from-gray-300 to-gray-400"
                        }`}>
                          <div className={`p-6 rounded-xl ${
                            peng.foto_kegiatan 
                              ? "bg-gradient-to-br from-emerald-50 to-green-50"
                              : "bg-gradient-to-br from-gray-50 to-gray-100"
                          }`}>
                            {peng.foto_kegiatan ? (
                              <div className="flex flex-col items-center gap-3">
                                <File className="w-10 h-10 text-emerald-600" />
                                <div className="text-center">
                                  <p className="font-bold text-emerald-800 text-lg">Dokumentasi Tersedia</p>
                                  <p className="text-emerald-700 text-sm truncate max-w-[200px]">
                                    {peng.foto_kegiatan.split('/').pop()}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-3">
                                <File className="w-10 h-10 text-gray-500" />
                                <div className="text-center">
                                  <p className="font-bold text-gray-700 text-lg">Belum Ada Dokumentasi</p>
                                  <p className="text-gray-600 text-sm">Foto belum diunggah</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        {peng.foto_kegiatan ? (
                          <a
                            href={peng.foto_kegiatan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative overflow-hidden px-8 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <ExternalLink className="relative w-6 h-6" />
                            <span className="relative">Lihat Dokumentasi Lengkap</span>
                            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                          </a>
                        ) : (
                          <button 
                            disabled
                            className="px-8 py-5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-2xl font-bold text-lg border-2 border-gray-300 flex items-center gap-4 opacity-80"
                          >
                            <File className="w-6 h-6" />
                            <span>Dokumentasi Belum Tersedia</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPengabdian.length === 0 && (
            <div className="text-center py-24">
              <div className="relative inline-block mb-10">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative p-12 bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-gray-200 shadow-2xl">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mb-8">
                    <Folder className="w-20 h-20 text-gray-400" />
                  </div>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                {searchQuery ? "Kegiatan Tidak Ditemukan" : "Belum Ada Kegiatan"}
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-xl leading-relaxed">
                {searchQuery 
                  ? `Maaf, tidak ditemukan kegiatan pengabdian dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain atau lihat semua kegiatan yang tersedia.`
                  : "Belum ada data kegiatan pengabdian yang tersedia. Kegiatan akan ditampilkan di sini setelah data dimasukkan ke sistem."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setFilterBy("all")
                  }}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <Home className="w-6 h-6" />
                  Lihat Semua Kegiatan
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-10 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 border-2 border-gray-300"
                  >
                    <Search className="w-6 h-6" />
                    Hapus Pencarian
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-8">
              <HandHeart className="w-10 h-10 text-white" />
            </div>
            <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto">
              "Pengabdian kepada masyarakat adalah wujud nyata komitmen kami untuk 
              membangun Indonesia yang lebih baik melalui ilmu pengetahuan dan teknologi."
            </p>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-8"></div>
            <p className="text-blue-300">
              © {new Date().getFullYear()} Pengabdian Masyarakat Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}