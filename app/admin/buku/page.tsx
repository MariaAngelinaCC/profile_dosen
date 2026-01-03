"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Book {
  id: number;
  judul: string;
  penerbit: string;
  tahun: string | number;
  isbn: string;
  link: string | null;
  deskripsi: string | null;
  cover: string | null;
  created_at: string;
  cover_url?: string;
  file_url?: string;
}

export default function AdminBukuPage() {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    judul: "",
    penerbit: "",
    tahun: new Date().getFullYear().toString(),
    isbn: "",
    deskripsi: ""
  });
  
  const [cover, setCover] = useState<File | null>(null);
  const [fileBuku, setFileBuku] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  // Fetch books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter and sort books
  useEffect(() => {
    let result = [...books];

    // Filter by year
    if (filterYear !== "all") {
      result = result.filter(book => book.tahun.toString() === filterYear);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book => {
        const tahunStr = book.tahun ? book.tahun.toString() : "";
        const deskripsiStr = book.deskripsi ? book.deskripsi.toLowerCase() : "";
        
        return (
          book.judul.toLowerCase().includes(query) ||
          (book.penerbit && book.penerbit.toLowerCase().includes(query)) ||
          (book.isbn && book.isbn.toLowerCase().includes(query)) ||
          deskripsiStr.includes(query) ||
          tahunStr.includes(query)
        );
      });
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => {
          const yearA = a.tahun ? parseInt(a.tahun.toString()) : 0;
          const yearB = b.tahun ? parseInt(b.tahun.toString()) : 0;
          return yearB - yearA;
        });
        break;
      case "oldest":
        result.sort((a, b) => {
          const yearA = a.tahun ? parseInt(a.tahun.toString()) : 0;
          const yearB = b.tahun ? parseInt(b.tahun.toString()) : 0;
          return yearA - yearB;
        });
        break;
      case "title":
        result.sort((a, b) => a.judul.localeCompare(b.judul));
        break;
    }

    setFilteredBooks(result);
  }, [books, filterYear, searchQuery, sortBy]);

  // Fetch books from API
  const fetchBooks = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/buku");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data buku");
      }
      
      // Normalize data with correct URLs
      const normalizedData = (data.data || []).map((book: any) => {
        // If API returns cover_url, use it
        // Otherwise, create URL manually
        let coverUrl = book.cover_url;
        let fileUrl = book.file_url;
        
        // Fallback: create manual URL if not from API
        if (!coverUrl && book.cover) {
          coverUrl = `/uploads/buku/covers/${book.cover}`;
        }
        
        if (!fileUrl && book.link) {
          fileUrl = `/uploads/buku/files/${book.link}`;
        }
        
        return {
          ...book,
          tahun: book.tahun ? book.tahun.toString() : "",
          cover_url: coverUrl,
          file_url: fileUrl
        };
      });
      
      setBooks(normalizedData);
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Gagal memuat data buku");
    } finally {
      setFetching(false);
    }
  };

  // Get unique years for filter
  const uniqueYears = [...new Set(books.map(book => book.tahun.toString()))]
    .sort((a, b) => parseInt(b) - parseInt(a))
    .filter(year => year !== "");

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // Handle cover upload
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCover(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverPreview(null);
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileBuku(file);
  };

  // Reset form
  const resetForm = () => {
    setForm({
      judul: "",
      penerbit: "",
      tahun: new Date().getFullYear().toString(),
      isbn: "",
      deskripsi: ""
    });
    setCover(null);
    setFileBuku(null);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add book
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.judul.trim()) {
      setError("Judul buku harus diisi");
      return;
    }
    
    if (!form.tahun.trim()) {
      setError("Tahun terbit harus diisi");
      return;
    }
    
    if (!cover) {
      setError("Cover buku harus diupload");
      return;
    }
    
    if (!fileBuku) {
      setError("File buku harus diupload");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("judul", form.judul);
      formData.append("penerbit", form.penerbit);
      formData.append("tahun", form.tahun);
      formData.append("isbn", form.isbn);
      formData.append("deskripsi", form.deskripsi);
      if (cover) formData.append("cover", cover);
      if (fileBuku) formData.append("fileBuku", fileBuku);

      const res = await fetch("/api/buku", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal menambahkan buku");
      }

      setSuccess("✅ Buku berhasil ditambahkan!");
      resetForm();
      await fetchBooks();
      
      // Trigger event for other components
      window.dispatchEvent(new Event("content:changed"));
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "Gagal menambahkan buku!");
    } finally {
      setLoading(false);
    }
  };

  // Edit book
  const handleEdit = (book: Book) => {
    setEditId(book.id);
    setForm({
      judul: book.judul,
      penerbit: book.penerbit || "",
      tahun: book.tahun ? book.tahun.toString() : new Date().getFullYear().toString(),
      isbn: book.isbn || "",
      deskripsi: book.deskripsi || ""
    });
    setCover(null);
    setFileBuku(null);
    setEditCoverPreview(book.cover_url || null);
    setError("");
    setSuccess("");
    
    // Scroll to form
    document.getElementById("book-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditId(null);
    resetForm();
    setEditCoverPreview(null);
    setError("");
    setSuccess("");
  };

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("id", editId.toString());
      formData.append("judul", form.judul);
      formData.append("penerbit", form.penerbit);
      formData.append("tahun", form.tahun);
      formData.append("isbn", form.isbn);
      formData.append("deskripsi", form.deskripsi);
      
      if (cover) {
        formData.append("cover", cover);
      }
      
      if (fileBuku) {
        formData.append("fileBuku", fileBuku);
      }

      const res = await fetch("/api/buku", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengedit buku");
      }

      setSuccess("✅ Buku berhasil diperbarui!");
      cancelEdit();
      await fetchBooks();
      
      window.dispatchEvent(new Event("content:changed"));
    } catch (err: any) {
      console.error("Edit error:", err);
      setError(err.message || "Gagal mengedit buku!");
    } finally {
      setLoading(false);
    }
  };

  // Delete book
  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus buku ini?")) return;

    try {
      const res = await fetch(`/api/buku?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus buku");
      }

      setSuccess("🗑️ Buku berhasil dihapus!");
      await fetchBooks();
      
      window.dispatchEvent(new Event("content:changed"));
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Gagal menghapus buku!");
    }
  };

  // Get file icon based on extension
  const getFileIcon = (filename: string | null) => {
    if (!filename) return "📄";
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📕';
      case 'epub': return '📖';
      case 'doc':
      case 'docx': return '📝';
      default: return '📄';
    }
  };

  // Get file type
  const getFileType = (filename: string | null) => {
    if (!filename) return "File";
    const ext = filename.split('.').pop()?.toUpperCase();
    return ext || "File";
  };

  // Placeholder component for missing cover
  const BookCoverPlaceholder = () => (
    <div className="w-16 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300 flex flex-col items-center justify-center">
      <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-xs text-gray-500">No Cover</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Kembali"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manajemen Buku Digital</h1>
              <p className="text-gray-600 mt-1">Kelola koleksi buku digital perpustakaan</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Total: {books.length} buku</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Buku</p>
                <p className="text-2xl font-bold text-blue-800">
                  {books.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Tahun Terbaru</p>
                <p className="text-2xl font-bold text-green-800">
                  {books.length > 0 ? 
                    Math.max(...books.map(b => parseInt(b.tahun.toString() || "0"))) : 
                    new Date().getFullYear()
                  }
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Ditemukan</p>
                <p className="text-2xl font-bold text-purple-800">
                  {filteredBooks.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div id="book-form" className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editId ? "✏️ Edit Buku" : "➕ Tambah Buku Baru"}
              </h2>
              {editId && (
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal Edit
                </button>
              )}
            </div>

            {/* Status Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={editId ? handleEditSubmit : handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Judul Buku *
                  </label>
                  <input
                    name="judul"
                    placeholder="Masukkan judul buku"
                    value={form.judul}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tahun Terbit *
                  </label>
                  <input
                    name="tahun"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    value={form.tahun}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Penerbit
                  </label>
                  <input
                    name="penerbit"
                    placeholder="Nama penerbit"
                    value={form.penerbit}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ISBN
                  </label>
                  <input
                    name="isbn"
                    placeholder="Nomor ISBN"
                    value={form.isbn}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  placeholder="Deskripsi singkat tentang buku..."
                  value={form.deskripsi}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                />
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {editId ? "Ganti Cover Buku" : "Cover Buku *"}
                    <span className="text-xs text-gray-500 ml-1">(jpg, png, max 5MB)</span>
                  </label>
                  
                  {!editId && coverPreview && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={coverPreview}
                        alt="Preview cover"
                        className="w-32 h-48 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  
                  {editId && editCoverPreview && !coverPreview && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Cover saat ini:</p>
                      <img
                        src={editCoverPreview}
                        alt="Current cover"
                        className="w-32 h-48 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="relative">
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                      required={!editId}
                    />
                  </div>
                  {editId && editCoverPreview && (
                    <p className="text-xs text-gray-500">Biarkan kosong jika tidak ingin mengganti cover</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {editId ? "Ganti File Buku" : "File Buku *"}
                    <span className="text-xs text-gray-500 ml-1">(PDF, EPUB, DOCX, max 50MB)</span>
                  </label>
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.epub,.doc,.docx"
                      onChange={handleFileChange}
                      className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                      required={!editId}
                    />
                  </div>
                  {editId && (
                    <p className="text-xs text-gray-500">Biarkan kosong jika tidak ingin mengganti file</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editId ? "Memperbarui..." : "Menyimpan..."}
                    </>
                  ) : (
                    editId ? "Update Buku" : "Simpan Buku"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-full">
            <div className="flex flex-col h-full">
              {/* Search and Filter Section */}
              <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari buku..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <svg 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Filter and Sort Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Filter Tahun</label>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="all">Semua Tahun</option>
                      {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Urutkan</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="newest">Tahun Terbaru</option>
                      <option value="oldest">Tahun Terlama</option>
                      <option value="title">Judul A-Z</option>
                    </select>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Ditemukan: <span className="font-semibold">{filteredBooks.length}</span> buku
                  </div>
                  <button
                    onClick={fetchBooks}
                    disabled={fetching}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                    title="Refresh data"
                  >
                    <svg className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Books List */}
              <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-400px)] custom-scrollbar">
                {filteredBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {searchQuery || filterYear !== "all" ? (
                      <>
                        <p className="text-gray-600 font-medium mb-1">Tidak ditemukan</p>
                        <p className="text-sm text-gray-500">
                          {searchQuery ? `Tidak ada buku dengan kata kunci "${searchQuery}"` : 'Tidak ada buku untuk tahun ini'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600 font-medium mb-1">Belum ada buku</p>
                        <p className="text-sm text-gray-500">Mulai tambahkan buku pertama Anda!</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBooks.map((book) => (
                      <div
                        key={book.id}
                        className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 bg-white"
                      >
                        <div className="flex gap-3">
                          {/* Cover Image */}
                          <div className="flex-shrink-0">
                            {book.cover_url ? (
                              <div className="relative w-16 h-24">
                                <img
                                  src={book.cover_url}
                                  alt={book.judul}
                                  className="w-full h-full object-cover rounded border border-gray-300"
                                  onError={(e) => {
                                    console.error('Cover tidak ditemukan:', book.cover_url);
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      // Clear the parent and create a placeholder div
                                      parent.innerHTML = '';
                                      // You can't directly render JSX here, so we'll create a div with similar structure
                                      const placeholderDiv = document.createElement('div');
                                      placeholderDiv.className = 'w-16 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300 flex flex-col items-center justify-center';
                                      placeholderDiv.innerHTML = `
                                        <svg class="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span class="text-xs text-gray-500">No Cover</span>
                                      `;
                                      parent.appendChild(placeholderDiv);
                                    }
                                  }}
                                  onLoad={() => console.log('Cover berhasil dimuat:', book.cover_url)}
                                />
                              </div>
                            ) : (
                              <BookCoverPlaceholder />
                            )}
                          </div>

                          {/* Book Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 text-sm">
                                  {book.judul}
                                </h3>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                    {book.tahun}
                                  </span>
                                  {book.penerbit && (
                                    <span className="text-xs text-gray-600 truncate max-w-[100px]">
                                      {book.penerbit}
                                    </span>
                                  )}
                                </div>
                                {book.isbn && (
                                  <p className="text-xs text-gray-500 mb-2">
                                    ISBN: {book.isbn}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-1 ml-2">
                                <button
                                  onClick={() => handleEdit(book)}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(book.id)}
                                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                                  title="Hapus"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            {/* File Info */}
                            <div className="mt-2 flex items-center gap-2">
                              {book.file_url && (
                                <a
                                  href={book.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                  title="Download buku"
                                >
                                  <span className="mr-1">{getFileIcon(book.link)}</span>
                                  <span>Download ({getFileType(book.link)})</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}