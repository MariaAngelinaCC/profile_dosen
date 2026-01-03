"use client"

import { useState, useEffect, useMemo } from "react"
import { Award, Calendar, ExternalLink, Lock, Shield, Copyright, FileText, Search, Filter, ChevronDown, TrendingUp, Database as DatabaseIcon, Globe, BookOpen, Download, Tag, File, Folder, Clock, Users } from "lucide-react"

interface Copyright {
  id_hak_cipta: number
  judul: string
  nomor_pendaftaran: string
  tahun: number
  link?: string
  deskripsi: string
  kategori?: string
  jenis?: string
  pemegang_hak?: string
  created_at?: string
  status?: string
}

interface Stats {
  total: number
  totalYears: number
  recentYear: number
  withLinks: number
}

export default function CopyrightPage() {
  const [copyrights, setCopyrights] = useState<Copyright[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [expandedDescription, setExpandedDescription] = useState<number | null>(null)
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalYears: 0,
    recentYear: new Date().getFullYear(),
    withLinks: 0
  })

  // Helper function untuk safe string comparison
  const safeStringIncludes = (str: any, query: string): boolean => {
    if (!str) return false
    return str.toString().toLowerCase().includes(query.toLowerCase())
  }

  // Get unique years for filtering
  const uniqueYears = useMemo(() => {
    const yearsSet = new Set(copyrights.map(c => c.tahun).filter(Boolean))
    return Array.from(yearsSet).sort((a, b) => b - a)
  }, [copyrights])

  // Get unique kategori
  const uniqueKategori = useMemo(() => {
    const kategoriSet = new Set(copyrights.map(c => c.kategori).filter(Boolean))
    return Array.from(kategoriSet).sort() as string[]
  }, [copyrights])

  useEffect(() => {
    async function fetchCopyrights() {
      try {
        setLoading(true)
        const response = await fetch("/api/hak-cipta")
        if (!response.ok) throw new Error("Gagal mengambil data hak cipta")
        
        const data = await response.json()
        const normalizedData = data.map((item: any) => ({
          id_hak_cipta: item.id_hak_cipta || item.id || 0,
          judul: item.judul || "Judul tidak tersedia",
          nomor_pendaftaran: item.nomor_pendaftaran || "N/A",
          tahun: item.tahun || new Date().getFullYear(),
          link: item.link || "",
          deskripsi: item.deskripsi || "Deskripsi tidak tersedia",
          kategori: item.kategori || "Lainnya",
          jenis: item.jenis || "Hak Cipta",
          pemegang_hak: item.pemegang_hak || "Pemegang hak tidak tersedia",
          created_at: item.created_at || new Date().toISOString(),
          status: item.status || "Terdaftar"
        }))
        
        setCopyrights(normalizedData)
        
        // Calculate statistics
        const years = normalizedData.map((c: Copyright) => c.tahun)
        const recentYear = years.length > 0 ? Math.max(...years) : new Date().getFullYear()
        const withLinks = normalizedData.filter((c: Copyright) => c.link).length
        const yearsSet = new Set(years)
        
        setStats({
          total: normalizedData.length,
          totalYears: yearsSet.size,
          recentYear,
          withLinks
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        console.error("Error fetching copyrights:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCopyrights()
  }, [])

  const filteredCopyrights = useMemo(() => {
    let filtered = copyrights
    
    // Kategori filter
    if (filterBy.startsWith("kategori-")) {
      const kategori = filterBy.replace("kategori-", "")
      filtered = filtered.filter((c: Copyright) => c.kategori === kategori)
    }
    
    // Year filter
    else if (filterBy.startsWith("year-")) {
      const year = parseInt(filterBy.replace("year-", ""))
      filtered = filtered.filter((c: Copyright) => c.tahun === year)
    }
    
    // Jenis filter
    else if (filterBy.startsWith("jenis-")) {
      const jenis = filterBy.replace("jenis-", "")
      filtered = filtered.filter((c: Copyright) => c.jenis === jenis)
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((c: Copyright) => 
        safeStringIncludes(c.judul, query) ||
        safeStringIncludes(c.deskripsi, query) ||
        safeStringIncludes(c.nomor_pendaftaran, query) ||
        safeStringIncludes(c.kategori, query) ||
        safeStringIncludes(c.jenis, query) ||
        safeStringIncludes(c.pemegang_hak, query)
      )
    }
    
    // Sort
    filtered = [...filtered].sort((a: Copyright, b: Copyright) => {
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
  }, [copyrights, filterBy, searchQuery, sortBy])

  const getStatusColor = (status?: string) => {
    const stat = status?.toLowerCase() || ""
    if (stat.includes('terdaftar') || stat.includes('registered')) {
      return "bg-gradient-to-r from-emerald-500 to-green-500"
    } else if (stat.includes('proses') || stat.includes('pending')) {
      return "bg-gradient-to-r from-amber-500 to-orange-500"
    } else if (stat.includes('ditolak') || stat.includes('rejected')) {
      return "bg-gradient-to-r from-red-500 to-rose-500"
    } else {
      return "bg-gradient-to-r from-blue-500 to-cyan-500"
    }
  }

  const getStatusBadge = (status?: string) => {
    const stat = status?.toLowerCase() || ""
    
    if (stat.includes('terdaftar') || stat.includes('registered')) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
          <Shield size={16} className="text-emerald-600" />
          <span className="font-bold text-emerald-700">Terdaftar</span>
        </div>
      )
    } else if (stat.includes('proses') || stat.includes('pending')) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
          <Clock size={16} className="text-amber-600" />
          <span className="font-bold text-amber-700">Dalam Proses</span>
        </div>
      )
    } else if (stat.includes('ditolak') || stat.includes('rejected')) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg">
          <Shield size={16} className="text-red-600" />
          <span className="font-bold text-red-700">Ditolak</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
          <Shield size={16} className="text-blue-600" />
          <span className="font-bold text-blue-700">Terdaftar</span>
        </div>
      )
    }
  }

  const getKategoriColor = (kategori?: string) => {
    const kat = kategori?.toLowerCase() || ''
    if (kat.includes('software') || kat.includes('aplikasi') || kat.includes('program')) {
      return "from-purple-100 to-pink-100 text-purple-700 border-purple-200"
    } else if (kat.includes('buku') || kat.includes('literatur') || kat.includes('tulisan')) {
      return "from-blue-100 to-cyan-100 text-blue-700 border-blue-200"
    } else if (kat.includes('musik') || kat.includes('audio') || kat.includes('lagu')) {
      return "from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
    } else if (kat.includes('seni') || kat.includes('visual') || kat.includes('gambar')) {
      return "from-amber-100 to-orange-100 text-amber-700 border-amber-200"
    } else if (kat.includes('desain') || kat.includes('model') || kat.includes('produk')) {
      return "from-indigo-100 to-violet-100 text-indigo-700 border-indigo-200"
    } else {
      return "from-gray-100 to-gray-200 text-gray-700 border-gray-300"
    }
  }

  const getJenisIcon = (jenis?: string) => {
    const jns = jenis?.toLowerCase() || ''
    if (jns.includes('hak cipta') || jns.includes('copyright')) {
      return <Copyright className="text-blue-500" size={20} />
    } else if (jns.includes('paten') || jns.includes('patent')) {
      return <Shield className="text-emerald-500" size={20} />
    } else if (jns.includes('merek') || jns.includes('trademark')) {
      return <Tag className="text-purple-500" size={20} />
    } else if (jns.includes('desain industri')) {
      return <FileText className="text-amber-500" size={20} />
    } else {
      return <Lock className="text-gray-500" size={20} />
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
            <Copyright className="w-10 h-10 text-white" />
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
              <Shield size={18} />
              <span>Portofolio Kekayaan Intelektual</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Hak Cipta</span>
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                & Kekayaan Intelektual
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl leading-relaxed">
              Dokumentasi legal hak cipta, paten, merek dagang, dan kekayaan intelektual 
              lainnya yang telah terdaftar dan terlindungi hukum.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: "Total Hak Cipta", 
              value: stats.total, 
              icon: Copyright,
              color: "from-blue-500 to-cyan-500",
              description: "Dokumen legal"
            },
            { 
              label: "Tahun Terbaru", 
              value: stats.recentYear, 
              icon: Calendar,
              color: "from-emerald-500 to-green-500",
              description: "Pendaftaran terbaru"
            },
            { 
              label: "Sertifikat Digital", 
              value: stats.withLinks, 
              icon: FileText,
              color: "from-purple-500 to-pink-500",
              description: "Tersedia online"
            },
            { 
              label: "Rentang Tahun", 
              value: stats.totalYears, 
              icon: TrendingUp,
              color: "from-amber-500 to-orange-500",
              description: "Kepemilikan"
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
                      placeholder="Cari hak cipta berdasarkan judul, nomor pendaftaran, kategori, atau kata kunci..."
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
                        {copyrights.filter((c: Copyright) => c.tahun === year).length}
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
                              {copyrights.filter((c: Copyright) => c.tahun === year).length}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Kategori Filter */}
              {uniqueKategori.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Filter Berdasarkan Kategori:</p>
                  <div className="flex flex-wrap gap-3">
                    {uniqueKategori.slice(0, 5).map((kategori: string) => (
                      <button
                        key={kategori}
                        onClick={() => setFilterBy(`kategori-${kategori}`)}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                          filterBy === `kategori-${kategori}`
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow border border-gray-200"
                        }`}
                      >
                        <Tag size={16} />
                        {kategori}
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                          {copyrights.filter((c: Copyright) => c.kategori === kategori).length}
                        </span>
                      </button>
                    ))}
                    {uniqueKategori.length > 5 && (
                      <div className="relative group">
                        <button className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 shadow-sm hover:shadow transition-all flex items-center gap-2">
                          <span>Lainnya</span>
                          <ChevronDown size={16} />
                        </button>
                        <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                          {uniqueKategori.slice(5).map((kategori: string) => (
                            <button
                              key={kategori}
                              onClick={() => setFilterBy(`kategori-${kategori}`)}
                              className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between"
                            >
                              <span className="truncate max-w-[150px]">{kategori}</span>
                              <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                                {copyrights.filter((c: Copyright) => c.kategori === kategori).length}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Copyright className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">Gagal Memuat Data Hak Cipta</h3>
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

          {/* Copyright Cards */}
          <div className="space-y-8">
            {filteredCopyrights.map((copyright: Copyright) => (
              <div
                key={copyright.id_hak_cipta}
                className="group bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 overflow-hidden"
              >
                <div className="p-8">
                  {/* Header with Year and Status */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                        {getJenisIcon(copyright.jenis)}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                        <Calendar size={16} className="text-gray-600" />
                        <span className="font-bold text-gray-700">{copyright.tahun}</span>
                      </div>
                      {getStatusBadge(copyright.status)}
                    </div>
                    
                    {/* Database ID Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
                      <DatabaseIcon size={16} className="text-gray-600" />
                      <span className="font-mono text-sm text-gray-700">
                        ID: {copyright.id_hak_cipta.toString().padStart(4, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-snug group-hover:text-blue-700 transition-colors">
                    {copyright.judul || "Judul tidak tersedia"}
                  </h3>

                  {/* Kategori and Jenis Badges */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {copyright.kategori && (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getKategoriColor(copyright.kategori)}`}>
                        <Tag size={16} />
                        <span className="font-semibold">{copyright.kategori}</span>
                      </span>
                    )}
                    {copyright.jenis && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg border border-purple-200">
                        {getJenisIcon(copyright.jenis)}
                        <span className="font-semibold">{copyright.jenis}</span>
                      </span>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <Award size={18} className="text-gray-500" />
                      <div className="text-sm text-gray-600">
                        <span className="font-bold text-gray-700">No. Pendaftaran:</span>{' '}
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {copyright.nomor_pendaftaran}
                        </span>
                      </div>
                    </div>
                    {copyright.pemegang_hak && (
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          <span className="font-bold text-gray-700">Pemegang:</span> {copyright.pemegang_hak}
                        </span>
                      </div>
                    )}
                    {copyright.created_at && (
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Ditambahkan: {new Date(copyright.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-700">Deskripsi Hak Cipta</p>
                      <button
                        onClick={() => toggleDescription(copyright.id_hak_cipta)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        {expandedDescription === copyright.id_hak_cipta ? 'Sembunyikan' : 'Baca Selengkapnya'}
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform ${expandedDescription === copyright.id_hak_cipta ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                    <p className={`text-gray-600 leading-relaxed transition-all duration-300 ${
                      expandedDescription === copyright.id_hak_cipta ? '' : 'line-clamp-3'
                    }`}>
                      {copyright.deskripsi || "Deskripsi tidak tersedia"}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          copyright.link 
                            ? "bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300"
                        }`}>
                          {copyright.link ? (
                            <ExternalLink size={24} className="text-emerald-500" />
                          ) : (
                            <File className="text-gray-500" size={24} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            {copyright.link ? "Sertifikat Digital Tersedia" : "Sertifikat Tidak Tersedia"}
                          </p>
                          {copyright.link && (
                            <p className="text-sm text-gray-600">
                              Sertifikat resmi tersedia untuk dilihat online
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {copyright.link ? (
                          <a
                            href={copyright.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl hover:gap-4 hover:-translate-y-0.5 transition-all duration-300 group/link"
                          >
                            <ExternalLink size={20} />
                            Lihat Sertifikat
                            <span className="group-hover/link:rotate-12 transition-transform">→</span>
                          </a>
                        ) : (
                          <button className="inline-flex items-center gap-3 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                            <Lock size={20} />
                            Sertifikat Terlindungi
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
          {filteredCopyrights.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl mb-8">
                <Folder className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {searchQuery ? "Hak Cipta Tidak Ditemukan" : "Belum Ada Hak Cipta"}
              </h3>
              <p className="text-gray-600 max-w-xl mx-auto mb-10 text-lg">
                {searchQuery 
                  ? `Tidak ditemukan hak cipta dengan kata kunci "${searchQuery}". 
                     Coba dengan kata kunci yang berbeda atau gunakan filter lain.`
                  : filterBy !== "all"
                    ? filterBy.startsWith("year-")
                      ? `Belum ada hak cipta dari tahun ${filterBy.replace("year-", "")}.`
                      : `Belum ada hak cipta dalam kategori ${filterBy.replace("kategori-", "")}.`
                    : "Belum ada data hak cipta yang tersedia dalam database."}
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
                  Lihat Semua Hak Cipta
                </button>
              </div>
            </div>
          )}

          {/* Footer Info */}
          {filteredCopyrights.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-gray-600">
                    Menampilkan <span className="font-bold text-gray-900">{filteredCopyrights.length}</span> dari{' '}
                    <span className="font-bold text-gray-900">{stats.total}</span> hak cipta
                    {filterBy !== "all" && (
                      filterBy.startsWith("year-")
                        ? ` (tahun: ${filterBy.replace("year-", "")})`
                        : ` (kategori: ${filterBy.replace("kategori-", "")})`
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

      {/* Legal Information Section */}
      {copyrights.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Informasi Legal
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Terdaftar Legal</h3>
                    <p className="text-gray-600">
                      Semua karya telah didaftarkan di Kementerian Hukum dan HAM Republik Indonesia.
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Terlindungi Hukum</h3>
                    <p className="text-gray-600">
                      Dilindungi oleh UU Hak Cipta No. 28 Tahun 2014 dan peraturan internasional.
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gradient-to-r from-emerald-200 to-green-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Masa Berlaku</h3>
                    <p className="text-gray-600">
                      Berlaku seumur hidup pencipta + 70 tahun setelah pencipta meninggal dunia.
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gradient-to-r from-amber-200 to-orange-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}