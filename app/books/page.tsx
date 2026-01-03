"use client"

import { BookOpen, ExternalLink, CalendarDays, Filter, Search, ChevronDown, Building, FileText, Image as ImageIcon } from "lucide-react"
import { useState, useEffect, useMemo } from "react"

interface Book {
  id: number
  judul: string
  penerbit: string
  tahun: number
  isbn: string
  deskripsi: string
  link?: string
  cover?: string
  cover_url?: string
  file?: string
  file_url?: string
  file_path?: string
  authors?: string[]
  edition?: string
  pages?: number
  language?: string
  categories?: string[]
  price?: string
  rating?: number
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("tahun")
  const [expandedDescription, setExpandedDescription] = useState<number | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    uniqueYears: 0,
    accessible: 0,
    recentYear: 0,
    avgPages: 0
  })

  // Helper function untuk safe string comparison
  const safeStringIncludes = (str: any, query: string): boolean => {
    if (!str) return false
    return str.toString().toLowerCase().includes(query.toLowerCase())
  }

  // Fungsi untuk mendapatkan URL cover yang benar
  const getBookCoverUrl = (book: Book): string => {
    // Priority 1: cover_url (field utama)
    if (book.cover_url && book.cover_url.trim() !== '') {
      return book.cover_url;
    }
    
    // Priority 2: cover (field alternatif)
    if (book.cover && book.cover.trim() !== '') {
      return book.cover;
    }
    
    // Priority 3: Jika ada file PDF, coba cari cover berdasarkan nama file
    if (book.file) {
      const fileName = book.file.toLowerCase();
      // Cek jika file adalah gambar
      if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        // Asumsikan file berada di folder uploads
        return `/uploads/${book.file}`;
      }
    }
    
    // Priority 4: Default placeholder berdasarkan judul/tahun
    const title = encodeURIComponent(book.judul.substring(0, 30));
    const year = book.tahun || 2024;
    return `https://placehold.co/300x400/3b82f6/ffffff/png?text=${title}+${year}`;
  }

  // Fungsi untuk mendapatkan URL file buku
  const getBookFileUrl = (book: Book): string => {
    // Coba beberapa kemungkinan path/URL
    const possiblePaths = [
      // Priority 1: file_url lengkap dari API
      book.file_url,
      
      // Priority 2: file_path dari API
      book.file_path,
      
      // Priority 3: link dari API
      book.link,
      
      // Priority 4: Jika file hanya nama file (tanpa path)
      book.file ? `/api/buku/${book.id}/file` : null,
      book.file ? `/api/files/${book.file}` : null,
      book.file ? `/uploads/${book.file}` : null,
      book.file ? `/files/${book.file}` : null,
      book.file ? `/public/uploads/${book.file}` : null,
      book.file ? `/public/files/${book.file}` : null,
    ].filter(path => path && path !== "#" && path.trim() !== '');

    // Ambil URL pertama yang valid
    return possiblePaths[0] || "#";
  }

  // Fungsi untuk menangani baca buku
  const handleReadBook = (book: Book) => {
    const fileUrl = getBookFileUrl(book);
    
    if (!fileUrl || fileUrl === "#") {
      alert("Buku tidak tersedia untuk dibaca.");
      return;
    }
    
    // Untuk file PDF, buka di tab baru
    if (fileUrl.toLowerCase().endsWith('.pdf')) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Untuk file lain, coba download
      const a = document.createElement('a');
      a.href = fileUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/buku")
        if (!response.ok) throw new Error("Gagal mengambil data buku")

        const result = await response.json()
        const data = result.data || []
        
        console.log("Data buku dari API:", data);
        
        // Debug: Tampilkan semua field untuk memastikan structure
        if (data.length > 0) {
          console.log("Contoh struktur buku pertama:", Object.keys(data[0]));
          console.log("File info buku pertama:", {
            file: data[0].file,
            file_url: data[0].file_url,
            file_path: data[0].file_path,
            link: data[0].link
          });
        }
        
        // Validasi dan normalisasi data
        const normalizedData = data.map((book: any) => {
          return {
            id: book.id || book.id_buku || Date.now() + Math.random(),
            judul: book.judul || "Judul tidak tersedia",
            penerbit: book.penerbit || "Penerbit tidak tersedia",
            tahun: book.tahun || new Date().getFullYear(),
            isbn: book.isbn || "ISBN tidak tersedia",
            deskripsi: book.deskripsi || "Deskripsi tidak tersedia",
            link: book.link || "#",
            file_url: book.file_url || book.file || "#",
            file_path: book.file_path || book.path || "#",
            file: book.file || "",
            cover: book.cover || "",
            cover_url: book.cover_url || "",
            authors: book.authors || [],
            edition: book.edition || "",
            categories: book.categories || [],
            price: book.price || "",
          }
        })
        
        setBooks(normalizedData)
        
        // Calculate statistics
        const uniqueYears = Array.from(new Set(normalizedData.map((b: Book) => b.tahun)))
        
        // Hitung buku yang bisa diakses (punya file)
        const accessible = normalizedData.filter((b: Book) => {
          const fileUrl = getBookFileUrl(b);
          return fileUrl && fileUrl !== "#";
        }).length;
        
        const recentYear = Math.max(...normalizedData.map((b: Book) => b.tahun), new Date().getFullYear())
        const totalPages = normalizedData.reduce((sum: number, b: Book) => sum + (b.pages || 0), 0)
        const avgPages = normalizedData.length > 0 ? Math.round(totalPages / normalizedData.length) : 0
        
        setStats({
          total: normalizedData.length,
          uniqueYears: uniqueYears.length,
          accessible,
          recentYear,
          avgPages
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        console.error("[Books] Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  const uniqueYears = Array.from(new Set(books.map((b) => b.tahun))).sort((a, b) => b - a)

  const filteredBooks = useMemo(() => {
    let filtered = books
    
    // Year filter
    if (selectedYear) {
      filtered = filtered.filter((b) => b.tahun === selectedYear)
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(b => 
        safeStringIncludes(b.judul, query) ||
        safeStringIncludes(b.deskripsi, query) ||
        safeStringIncludes(b.penerbit, query) ||
        safeStringIncludes(b.isbn, query) ||
        (b.authors && b.authors.some(author => safeStringIncludes(author, query))) ||
        (b.categories && b.categories.some(category => safeStringIncludes(category, query)))
      )
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.judul || "").localeCompare(b.judul || "")
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "tahun":
        default:
          return b.tahun - a.tahun
      }
    })
    
    return filtered
  }, [books, selectedYear, searchQuery, sortBy])

  const toggleDescription = (id: number) => {
    setExpandedDescription(expandedDescription === id ? null : id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-pulse">
            <BookOpen className="w-10 h-10 text-white" />
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
              <BookOpen size={18} />
              <span>Karya Tulis Ilmiah</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Koleksi</span>
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Buku & Referensi
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl leading-relaxed">
              Kumpulan buku, monograf, dan referensi akademik yang telah diterbitkan, 
              mencakup berbagai bidang ilmu dan hasil penelitian mendalam.
            </p>
          </div>
        </div>
      </section>

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
                      placeholder="Cari buku berdasarkan judul, penulis, ISBN, atau kata kunci..."
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
                    <option value="title">Judul (A-Z)</option>
                    <option value="rating">Rating Tertinggi</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedYear(null)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                  selectedYear === null
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200"
                }`}
              >
                <Filter size={18} />
                Semua Tahun
                <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                  {stats.total}
                </span>
              </button>
              {uniqueYears.slice(0, 6).map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
                    selectedYear === year
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200"
                  }`}
                >
                  <CalendarDays size={18} />
                  {year}
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                    {books.filter(b => b.tahun === year).length}
                  </span>
                </button>
              ))}
              {uniqueYears.length > 6 && (
                <div className="relative group">
                  <button className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                    <span>Lainnya</span>
                    <ChevronDown size={16} />
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    {uniqueYears.slice(6).map((year) => (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between"
                      >
                        <span>{year}</span>
                        <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                          {books.filter(b => b.tahun === year).length}
                        </span>
                      </button>
                    ))}
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
                  <BookOpen className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">Gagal Memuat Data Buku</h3>
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

          {/* Books List - SEDERHANA TANPA TOMBOL DOWNLOAD */}
          <div className="space-y-8">
            {filteredBooks.map((book) => {
              const coverUrl = getBookCoverUrl(book);
              const fileUrl = getBookFileUrl(book);
              const hasFile = fileUrl && fileUrl !== "#";
              const hasCover = coverUrl && !coverUrl.includes('placehold.co');
              
              return (
                <div
                  key={book.id}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Book Cover */}
                    <div className="lg:w-1/4 p-8 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                      <div className="relative w-full max-w-xs">
                        <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl shadow-lg overflow-hidden group-hover:shadow-2xl transition-shadow duration-300">
                          {/* Cover Image */}
                          <div className="w-full h-full relative">
                            <img
                              src={coverUrl}
                              alt={`Cover buku ${book.judul}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                console.warn(`Cover gagal dimuat: ${coverUrl}`);
                                const target = e.target as HTMLImageElement;
                                const placeholder = `https://placehold.co/300x400/3b82f6/ffffff/png?text=${encodeURIComponent(book.judul.substring(0, 30))}`;
                                target.src = placeholder;
                              }}
                            />
                            
                            {/* Overlay jika cover placeholder */}
                            {!hasCover && (
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 flex flex-col items-center justify-center p-4">
                                <ImageIcon className="w-12 h-12 text-blue-400 mb-3" />
                                <span className="text-blue-600 text-sm font-medium text-center">
                                  Cover buku {book.tahun}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="lg:w-3/4 p-8">
                      {/* Header with Year and Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="px-4 py-2 rounded-lg text-white font-bold bg-gradient-to-r from-blue-600 to-cyan-600">
                            {book.tahun || "N/A"}
                          </div>
                          {/* Status File Badge */}
                          <div className={`px-4 py-2 rounded-lg font-semibold ${
                            hasFile 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300'
                          }`}>
                            {hasFile ? 'File Tersedia' : 'File Tidak Tersedia'}
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-snug group-hover:text-blue-700 transition-colors">
                        {book.judul || "Judul tidak tersedia"}
                      </h3>

                      {/* ISBN and Publisher */}
                      <div className="flex flex-wrap items-center gap-6 mb-6">
                        <div className="flex items-center gap-2">
                          <Building size={18} className="text-gray-500" />
                          <span className="font-semibold text-gray-700">
                            {book.penerbit || "Penerbit tidak tersedia"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-gray-500" />
                          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded">
                            ISBN: {book.isbn || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-gray-700">Sinopsis</p>
                          <button
                            onClick={() => toggleDescription(book.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                          >
                            {expandedDescription === book.id ? 'Sembunyikan' : 'Baca Selengkapnya'}
                            <ChevronDown 
                              size={16} 
                              className={`transition-transform ${expandedDescription === book.id ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>
                        <p className={`text-gray-600 leading-relaxed transition-all duration-300 ${
                          expandedDescription === book.id ? '' : 'line-clamp-3'
                        }`}>
                          {book.deskripsi || "Deskripsi tidak tersedia"}
                        </p>
                      </div>

                      {/* Action Buttons - HANYA SATU TOMBOL "BACA BUKU" */}
                      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                          {/* Tombol Baca Buku - SATU-SATUNYA TOMBOL */}
                          {hasFile ? (
                            <button
                              onClick={() => handleReadBook(book)}
                              className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl hover:gap-4 hover:-translate-y-0.5 transition-all duration-300 group/link"
                            >
                              <ExternalLink size={20} />
                              Baca Buku
                              <span className="group-hover/link:rotate-12 transition-transform">→</span>
                            </button>
                          ) : (
                            <button 
                              disabled
                              className="inline-flex items-center gap-3 px-8 py-3.5 bg-gray-100 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                            >
                              <BookOpen size={20} />
                              Buku Tidak Tersedia
                            </button>
                          )}
                        </div>
                        
                        {/* Info File (debug mode) */}
                        {process.env.NODE_ENV === 'development' && hasFile && (
                          <div className="text-xs text-gray-400">
                            File: {book.file || 'N/A'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredBooks.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl mb-8">
                <BookOpen className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {searchQuery ? "Buku Tidak Ditemukan" : "Belum Ada Buku"}
              </h3>
              <p className="text-gray-600 max-w-xl mx-auto mb-10 text-lg">
                {searchQuery 
                  ? `Tidak ditemukan buku dengan kata kunci "${searchQuery}". 
                     Coba dengan kata kunci yang berbeda atau gunakan filter lain.`
                  : selectedYear 
                    ? `Belum ada buku yang diterbitkan pada tahun ${selectedYear}.` 
                    : "Belum ada buku yang tersedia dalam database."}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedYear(null)
                  }}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                  Reset Pencarian
                </button>
                <button 
                  onClick={() => setSelectedYear(null)}
                  className="px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Lihat Semua Buku
                </button>
              </div>
            </div>
          )}

          {/* Footer Info */}
          {filteredBooks.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-gray-600">
                    Menampilkan <span className="font-bold text-gray-900">{filteredBooks.length}</span> dari{' '}
                    <span className="font-bold text-gray-900">{stats.total}</span> buku
                    {selectedYear && ` (tahun ${selectedYear})`}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {stats.accessible} buku memiliki file yang dapat diakses
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}