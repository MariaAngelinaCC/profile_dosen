"use client"

import { Beaker, FileText, Users, Calendar, Download, Filter, Search, ChevronDown, Award, Globe, TrendingUp, ChevronRight, Target, Database, Cpu, BookOpen, ExternalLink, BarChart, Zap, Layers, Cloud, Leaf, File, Folder, Clock, MapPin, Bookmark, Tag, Database as DatabaseIcon } from "lucide-react"
import { useState, useEffect, useMemo } from "react"

interface Research {
  id: number
  id_profil?: number | null
  judul: string
  tahun: number
  bidang: string
  deskripsi: string
  file_laporan: string
  created_at?: string
  // Additional fields for UI enhancement
  status?: string
  dana?: string
  lokasi?: string
  tujuan?: string
  kolaborator?: string[]
  output?: string[]
  metode?: string[]
  durasi?: string
  pendanaan?: string
  website?: string
}

// Interface untuk data dari API
interface ApiResearch {
  id: number
  id_profil?: number | null
  judul: string
  tahun: number | string
  bidang: string
  deskripsi: string
  file_laporan: string
  created_at?: string
  dana?: string
  lokasi?: string
  tujuan?: string
  kolaborator?: string[]
  output?: string[]
  metode?: string[]
  durasi?: string
  pendanaan?: string
  website?: string
}

export default function ResearchPage() {
  const [penelitian, setPenelitian] = useState<Research[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState("all") // all, bidang, year
  const [sortBy, setSortBy] = useState("recent") // recent, oldest, year
  const [expandedDescription, setExpandedDescription] = useState<number | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    bidangCount: 0,
    totalYears: 0,
    recentYear: 0,
    withReports: 0
  })

  // Helper function untuk safe string comparison
  const safeStringIncludes = (str: any, query: string): boolean => {
    if (!str) return false
    return str.toString().toLowerCase().includes(query.toLowerCase())
  }

  // Get unique bidang for filtering
  const uniqueBidang = useMemo(() => {
    const bidangSet = new Set(penelitian.map(p => p.bidang).filter(Boolean))
    return Array.from(bidangSet).sort()
  }, [penelitian])

  // Get unique years for filtering
  const uniqueYears = useMemo(() => {
    const yearsSet = new Set(penelitian.map(p => p.tahun).filter(Boolean))
    return Array.from(yearsSet).sort((a, b) => b - a)
  }, [penelitian])

  useEffect(() => {
    const fetchResearch = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/penelitian")
        if (!response.ok) throw new Error("Gagal mengambil data penelitian")

        const result = await response.json()
        const data: ApiResearch[] = result.data || []
        
        // Validasi dan normalisasi data sesuai database structure
        const normalizedData: Research[] = data.map((pen: ApiResearch) => {
          // Parse tahun dari database
          let tahun: number
          if (typeof pen.tahun === 'string') {
            const yearStr = pen.tahun.toString()
            if (/^\d{4}$/.test(yearStr)) {
              tahun = parseInt(yearStr)
            } else {
              tahun = new Date().getFullYear()
            }
          } else if (typeof pen.tahun === 'number') {
            tahun = pen.tahun
          } else {
            tahun = new Date().getFullYear()
          }
          
          // Determine status based on tahun
          const currentYear = new Date().getFullYear()
          const status = tahun === currentYear ? 'Ongoing' : 
                         tahun > currentYear ? 'Planned' : 'Completed'
          
          return {
            id: pen.id || Date.now() + Math.random(),
            id_profil: pen.id_profil !== null && pen.id_profil !== undefined ? pen.id_profil : undefined,
            judul: pen.judul || "Judul tidak tersedia",
            tahun: tahun,
            bidang: pen.bidang || "Lainnya",
            deskripsi: pen.deskripsi || "Deskripsi tidak tersedia",
            file_laporan: pen.file_laporan || "",
            created_at: pen.created_at || new Date().toISOString(),
            // Additional UI fields
            status,
            dana: pen.dana || "",
            lokasi: pen.lokasi || "",
            tujuan: pen.tujuan || "",
            kolaborator: pen.kolaborator || [],
            output: pen.output || [],
            metode: pen.metode || [],
            durasi: pen.durasi || "1 tahun",
            pendanaan: pen.pendanaan || "",
            website: pen.website || "#",
          }
        })
        
        setPenelitian(normalizedData)
        
        // Calculate statistics berdasarkan data database
        const bidangSet = new Set(normalizedData.map(p => p.bidang))
        const years = normalizedData.map(p => p.tahun)
        const recentYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear()
        const withReports = normalizedData.filter(p => p.file_laporan).length
        const yearsSet = new Set(years)
        
        setStats({
          total: normalizedData.length,
          bidangCount: bidangSet.size,
          totalYears: yearsSet.size,
          recentYear,
          withReports
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        console.error("[v0] Research fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchResearch()
  }, [])

  const filteredResearch = useMemo(() => {
    let filtered = penelitian
    
    // Bidang filter
    if (filterBy.startsWith("bidang-")) {
      const bidang = filterBy.replace("bidang-", "")
      filtered = filtered.filter(pen => pen.bidang === bidang)
    }
    
    // Year filter
    else if (filterBy.startsWith("year-")) {
      const year = parseInt(filterBy.replace("year-", ""))
      filtered = filtered.filter(pen => pen.tahun === year)
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(pen => 
        safeStringIncludes(pen.judul, query) ||
        safeStringIncludes(pen.deskripsi, query) ||
        safeStringIncludes(pen.bidang, query) ||
        safeStringIncludes(pen.lokasi, query) ||
        safeStringIncludes(pen.tujuan, query) ||
        (pen.kolaborator && pen.kolaborator.some(kol => safeStringIncludes(kol, query)))
      )
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.tahun - b.tahun
        case "year":
          return b.tahun - a.tahun
        case "recent":
        default:
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          }
          return b.tahun - a.tahun
      }
    })
    
    return filtered
  }, [penelitian, filterBy, searchQuery, sortBy])

  const getStatusColor = (status?: string) => {
    const stat = status?.toLowerCase() || ""
    if (stat.includes('ongoing')) {
      return "bg-gradient-to-r from-blue-500 to-cyan-500"
    } else if (stat.includes('planned')) {
      return "bg-gradient-to-r from-amber-500 to-orange-500"
    } else if (stat.includes('completed')) {
      return "bg-gradient-to-r from-emerald-500 to-green-500"
    } else {
      return "bg-gradient-to-r from-gray-500 to-gray-600"
    }
  }

  const getStatusBadge = (status?: string, tahun?: number) => {
    const currentYear = new Date().getFullYear()
    const stat = status?.toLowerCase() || ""
    
    if (stat.includes('ongoing') || (tahun && tahun === currentYear)) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-blue-700">Berjalan</span>
        </div>
      )
    } else if (stat.includes('planned') || (tahun && tahun > currentYear)) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
          <Clock size={16} className="text-amber-600" />
          <span className="font-bold text-amber-700">Rencana</span>
        </div>
      )
    } else if (stat.includes('completed') || (tahun && tahun < currentYear)) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
          <FileText size={16} className="text-emerald-600" />
          <span className="font-bold text-emerald-700">Selesai</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg">
          <FileText size={16} className="text-gray-600" />
          <span className="font-bold text-gray-700">{status || "Completed"}</span>
        </div>
      )
    }
  }

  const getBidangIcon = (bidang?: string) => {
    const bidangStr = bidang?.toLowerCase() || ''
    if (bidangStr.includes('ai') || bidangStr.includes('machine learning') || bidangStr.includes('deep learning')) {
      return <Cpu className="text-purple-500" size={20} />
    } else if (bidangStr.includes('data') || bidangStr.includes('analytics') || bidangStr.includes('big data')) {
      return <Database className="text-blue-500" size={20} />
    } else if (bidangStr.includes('cloud') || bidangStr.includes('computing') || bidangStr.includes('server')) {
      return <Cloud className="text-cyan-500" size={20} />
    } else if (bidangStr.includes('biology') || bidangStr.includes('bio') || bidangStr.includes('plant')) {
      return <Leaf className="text-green-500" size={20} />
    } else if (bidangStr.includes('software') || bidangStr.includes('web') || bidangStr.includes('app')) {
      return <Layers className="text-indigo-500" size={20} />
    } else if (bidangStr.includes('pendidikan') || bidangStr.includes('education')) {
      return <BookOpen className="text-amber-500" size={20} />
    } else {
      return <Beaker className="text-gray-500" size={20} />
    }
  }

  const getBidangColor = (bidang?: string) => {
    const bidangStr = bidang?.toLowerCase() || ''
    if (bidangStr.includes('ai') || bidangStr.includes('machine learning') || bidangStr.includes('deep learning')) {
      return "from-purple-100 to-pink-100 text-purple-700 border-purple-200"
    } else if (bidangStr.includes('data') || bidangStr.includes('analytics') || bidangStr.includes('big data')) {
      return "from-blue-100 to-cyan-100 text-blue-700 border-blue-200"
    } else if (bidangStr.includes('cloud') || bidangStr.includes('computing') || bidangStr.includes('server')) {
      return "from-cyan-100 to-teal-100 text-cyan-700 border-cyan-200"
    } else if (bidangStr.includes('biology') || bidangStr.includes('bio') || bidangStr.includes('plant')) {
      return "from-green-100 to-emerald-100 text-green-700 border-green-200"
    } else if (bidangStr.includes('software') || bidangStr.includes('web') || bidangStr.includes('app')) {
      return "from-indigo-100 to-violet-100 text-indigo-700 border-indigo-200"
    } else if (bidangStr.includes('pendidikan') || bidangStr.includes('education')) {
      return "from-amber-100 to-orange-100 text-amber-700 border-amber-200"
    } else {
      return "from-gray-100 to-gray-200 text-gray-700 border-gray-300"
    }
  }

  const formatFileName = (filePath: string) => {
    if (!filePath) return "Tidak ada file"
    const fileName = filePath.split('/').pop() || filePath
    return fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName
  }

  const getFileExtension = (filePath: string) => {
    if (!filePath) return "file"
    const extension = filePath.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return 'PDF'
      case 'doc': case 'docx': return 'DOC'
      case 'xls': case 'xlsx': return 'XLS'
      case 'ppt': case 'pptx': return 'PPT'
      case 'zip': case 'rar': return 'ZIP'
      default: return 'FILE'
    }
  }

  const getFileIcon = (filePath: string) => {
    const extension = getFileExtension(filePath)
    switch (extension) {
      case 'PDF': return <File className="text-red-500" size={20} />
      case 'DOC': return <File className="text-blue-500" size={20} />
      case 'XLS': return <File className="text-green-500" size={20} />
      case 'PPT': return <File className="text-orange-500" size={20} />
      default: return <File className="text-gray-500" size={20} />
    }
  }

  const toggleDescription = (id: number) => {
    setExpandedDescription(expandedDescription === id ? null : id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-pulse">
            <Beaker className="w-10 h-10 text-white" />
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
              <DatabaseIcon size={18} />
              <span>Database Penelitian</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Arsip</span>
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Laporan Penelitian
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl leading-relaxed">
              Koleksi terstruktur laporan penelitian akademik dengan metadata lengkap, 
              mencakup berbagai bidang ilmu dan tahun penerbitan.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: "Total Laporan", 
              value: stats.total, 
              icon: FileText,
              color: "from-blue-500 to-cyan-500",
              description: "Dokumen penelitian"
            },
            { 
              label: "Bidang Ilmu", 
              value: stats.bidangCount, 
              icon: Tag,
              color: "from-purple-500 to-pink-500",
              description: "Kategori bidang"
            },
            { 
              label: "Tahun Terbaru", 
              value: stats.recentYear, 
              icon: Calendar,
              color: "from-emerald-500 to-green-500",
              description: "Publikasi terbaru"
            },
            { 
              label: "Dokumen Tersedia", 
              value: stats.withReports, 
              icon: File,
              color: "from-amber-500 to-orange-500",
              description: "File laporan"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      placeholder="Cari laporan penelitian berdasarkan judul, bidang, deskripsi, atau kata kunci..."
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
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-5 pr-10 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium shadow-md"
                  >
                    <option value="recent">Terbaru Ditambahkan</option>
                    <option value="year">Tahun Terbaru</option>
                    <option value="oldest">Tahun Terlama</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="space-y-4">
              {/* Tahun Filter */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Filter Berdasarkan Tahun:</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setFilterBy("all")}
                    className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                      filterBy === "all"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow border border-gray-200"
                    }`}
                  >
                    <Filter size={16} />
                    Semua Tahun
                  </button>
                  {uniqueYears.slice(0, 5).map((year) => (
                    <button
                      key={year}
                      onClick={() => setFilterBy(`year-${year}`)}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                        filterBy === `year-${year}`
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                          : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow border border-gray-200"
                      }`}
                    >
                      <Calendar size={16} />
                      {year}
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {penelitian.filter(p => p.tahun === year).length}
                      </span>
                    </button>
                  ))}
                  {uniqueYears.length > 5 && (
                    <div className="relative group">
                      <button className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 shadow-sm hover:shadow transition-all flex items-center gap-2">
                        <span>Lainnya</span>
                        <ChevronDown size={16} />
                      </button>
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                        {uniqueYears.slice(5).map((year) => (
                          <button
                            key={year}
                            onClick={() => setFilterBy(`year-${year}`)}
                            className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between"
                          >
                            <span>{year}</span>
                            <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                              {penelitian.filter(p => p.tahun === year).length}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bidang Filter */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Filter Berdasarkan Bidang:</p>
                <div className="flex flex-wrap gap-3">
                  {uniqueBidang.slice(0, 6).map((bidang) => (
                    <button
                      key={bidang}
                      onClick={() => setFilterBy(`bidang-${bidang}`)}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                        filterBy === `bidang-${bidang}`
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                          : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow border border-gray-200"
                      }`}
                    >
                      {getBidangIcon(bidang)}
                      {bidang}
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {penelitian.filter(p => p.bidang === bidang).length}
                      </span>
                    </button>
                  ))}
                  {uniqueBidang.length > 6 && (
                    <div className="relative group">
                      <button className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 shadow-sm hover:shadow transition-all flex items-center gap-2">
                        <span>Lainnya</span>
                        <ChevronDown size={16} />
                      </button>
                      <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                        {uniqueBidang.slice(6).map((bidang) => (
                          <button
                            key={bidang}
                            onClick={() => setFilterBy(`bidang-${bidang}`)}
                            className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              {getBidangIcon(bidang)}
                              <span className="truncate max-w-[150px]">{bidang}</span>
                            </div>
                            <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                              {penelitian.filter(p => p.bidang === bidang).length}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Beaker className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">Gagal Memuat Data Penelitian</h3>
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

          {/* Research Cards */}
          <div className="space-y-8">
            {filteredResearch.map((pen) => (
              <div
                key={pen.id}
                className="group bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 overflow-hidden"
              >
                <div className="p-8">
                  {/* Header with Year and Status */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                        {getBidangIcon(pen.bidang)}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                        <Calendar size={16} className="text-gray-600" />
                        <span className="font-bold text-gray-700">{pen.tahun}</span>
                      </div>
                      {getStatusBadge(pen.status, pen.tahun)}
                    </div>
                    
                    {/* Database ID Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
                      <DatabaseIcon size={16} className="text-gray-600" />
                      <span className="font-mono text-sm text-gray-700">
                        ID: {pen.id.toString().padStart(4, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-snug group-hover:text-blue-700 transition-colors">
                    {pen.judul || "Judul tidak tersedia"}
                  </h3>

                  {/* Bidang Badge */}
                  <div className="mb-6">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getBidangColor(pen.bidang)}`}>
                      {getBidangIcon(pen.bidang)}
                      <span className="font-semibold">{pen.bidang}</span>
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    {pen.lokasi && (
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Lokasi: {pen.lokasi}
                        </span>
                      </div>
                    )}
                    {pen.created_at && (
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Ditambahkan: {new Date(pen.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )}
                    {pen.id_profil && (
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Profil ID: {pen.id_profil}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-700">Deskripsi Laporan</p>
                      <button
                        onClick={() => toggleDescription(pen.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        {expandedDescription === pen.id ? 'Sembunyikan' : 'Baca Selengkapnya'}
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform ${expandedDescription === pen.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                    <p className={`text-gray-600 leading-relaxed transition-all duration-300 ${
                      expandedDescription === pen.id ? '' : 'line-clamp-3'
                    }`}>
                      {pen.deskripsi || "Deskripsi tidak tersedia"}
                    </p>
                    {pen.tujuan && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-700 mb-1">Tujuan Penelitian:</p>
                        <p className="text-sm text-blue-600">{pen.tujuan}</p>
                      </div>
                    )}
                  </div>

                  {/* Additional Info (jika ada) */}
                  {(pen.kolaborator && pen.kolaborator.length > 0) && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Kolaborator:</p>
                      <div className="flex flex-wrap gap-2">
                        {pen.kolaborator.map((kol, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors text-sm"
                          >
                            <Users size={14} className="inline mr-1" />
                            {kol}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outputs (jika ada) */}
                  {(pen.output && pen.output.length > 0) && (
                    <div className="mb-8">
                      <p className="text-sm text-gray-500 mb-2">Output Penelitian:</p>
                      <div className="space-y-2">
                        {pen.output.map((out, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <FileText size={14} className="text-blue-500 mt-1 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{out}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Report Section */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          pen.file_laporan 
                            ? "bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300"
                        }`}>
                          {pen.file_laporan ? getFileIcon(pen.file_laporan) : <File className="text-gray-500" size={24} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            {pen.file_laporan ? "File Laporan Tersedia" : "File Laporan Tidak Tersedia"}
                          </p>
                          {pen.file_laporan && (
                            <p className="text-sm text-gray-600">
                              {formatFileName(pen.file_laporan)}
                              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                                {getFileExtension(pen.file_laporan)}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {pen.file_laporan ? (
                          <a
                            href={pen.file_laporan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl hover:gap-4 hover:-translate-y-0.5 transition-all duration-300 group/link"
                          >
                            <Download size={20} />
                            Download Laporan
                            <span className="group-hover/link:rotate-12 transition-transform">→</span>
                          </a>
                        ) : (
                          <button className="inline-flex items-center gap-3 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                            <File size={20} />
                            File Tidak Tersedia
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
          {filteredResearch.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl mb-8">
                <Folder className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {searchQuery ? "Laporan Tidak Ditemukan" : "Belum Ada Laporan"}
              </h3>
              <p className="text-gray-600 max-w-xl mx-auto mb-10 text-lg">
                {searchQuery 
                  ? `Tidak ditemukan laporan dengan kata kunci "${searchQuery}". 
                     Coba dengan kata kunci yang berbeda atau gunakan filter lain.`
                  : filterBy !== "all"
                    ? filterBy.startsWith("year-")
                      ? `Belum ada laporan dari tahun ${filterBy.replace("year-", "")}.`
                      : `Belum ada laporan dalam bidang ${filterBy.replace("bidang-", "")}.`
                    : "Belum ada data laporan penelitian yang tersedia dalam database."}
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
                  onClick={() => setFilterBy("all")}
                  className="px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Lihat Semua Laporan
                </button>
              </div>
            </div>
          )}

          {/* Footer Info */}
          {filteredResearch.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-gray-600">
                    Menampilkan <span className="font-bold text-gray-900">{filteredResearch.length}</span> dari{' '}
                    <span className="font-bold text-gray-900">{stats.total}</span> laporan penelitian
                    {filterBy !== "all" && (
                      filterBy.startsWith("year-")
                        ? ` (tahun: ${filterBy.replace("year-", "")})`
                        : ` (bidang: ${filterBy.replace("bidang-", "")})`
                    )}
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

      {/* Database Insights */}
      {penelitian.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Statistik Database
              </span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <DatabaseIcon size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Records</div>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Tag size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.bidangCount}</div>
                    <div className="text-sm text-gray-600">Bidang Unik</div>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                    style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                    <File size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.withReports}</div>
                    <div className="text-sm text-gray-600">File Tersedia</div>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" 
                    style={{ width: `${(stats.withReports / stats.total) * 100}%` }}></div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalYears}</div>
                    <div className="text-sm text-gray-600">Tahun Unik</div>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" 
                    style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}