"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Publication {
  id: string | number;
  judul: string;
  tahun: string;
  jenis: "Journal" | "Conference";
  link: string;
  deskripsi: string;
  created_at?: string;
  updated_at?: string;
}

export default function PublicationManager() {
  const router = useRouter();
  const [form, setForm] = useState({
    judul: "",
    tahun: new Date().getFullYear().toString(),
    jenis: "Journal" as "Journal" | "Conference",
    link: "",
    deskripsi: ""
  });

  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null);
  const [filter, setFilter] = useState<"all" | "Journal" | "Conference">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title-asc" | "title-desc">("newest");

  // Fetch publications on component mount
  useEffect(() => {
    fetchPublications();
  }, [filter]);

// Ganti bagian useEffect untuk filtering:

useEffect(() => {
  let result = [...publications];

  // Filter by jenis
  if (filter !== "all") {
    result = result.filter(pub => pub.jenis === filter);
  }

  // Search filter - FIXED: handle tahun as number
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter(pub =>
      pub.judul.toLowerCase().includes(query) ||
      (pub.deskripsi && pub.deskripsi.toLowerCase().includes(query)) ||
      // Konversi tahun ke string untuk pencarian
      pub.tahun.toString().includes(query)
    );
  }

  // Sorting
  switch (sortBy) {
    case "newest":
      result.sort((a, b) => {
        // Pastikan tahun adalah number untuk sorting
        const yearA = parseInt(a.tahun.toString());
        const yearB = parseInt(b.tahun.toString());
        return yearB - yearA;
      });
      break;
    case "oldest":
      result.sort((a, b) => {
        const yearA = parseInt(a.tahun.toString());
        const yearB = parseInt(b.tahun.toString());
        return yearA - yearB;
      });
      break;
    case "title-asc":
      result.sort((a, b) => a.judul.localeCompare(b.judul));
      break;
    case "title-desc":
      result.sort((a, b) => b.judul.localeCompare(a.judul));
      break;
  }

  setFilteredPublications(result);
}, [publications, filter, searchQuery, sortBy]);

  const fetchPublications = async () => {
    setFetching(true);
    try {
      const url = filter === "all" 
        ? "/api/publikasi" 
        : `/api/publikasi?jenis=${filter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data publikasi");
      }
      
      setPublications(data.data || []);
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Gagal memuat publikasi");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.judul.trim()) {
      setError("Judul publikasi harus diisi");
      return;
    }
    
    const tahunStr = form.tahun.toString();
    if (!tahunStr.trim()) {
      setError("Tahun harus diisi");
      return;
    }
    
    const tahunNum = parseInt(tahunStr);
    if (isNaN(tahunNum) || tahunNum < 1900 || tahunNum > new Date().getFullYear() + 5) {
      setError("Tahun harus valid (1900 - " + (new Date().getFullYear() + 5) + ")");
      return;
    }
  
    setLoading(true);
    setError("");
    setSuccess("");
  
    try {
      // PERBAIKAN: Gunakan URL yang benar untuk edit
      const url = editingId 
        ? `/api/publikasi?id=${editingId}`  // Ini sudah benar
        : "/api/publikasi";
      
      const method = editingId ? "PUT" : "POST";
  
      const payload = {
        ...form,
        tahun: tahunStr
      };
  
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
  
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.message || `Gagal ${editingId ? 'memperbarui' : 'menyimpan'} publikasi`);
      }
  
      const message = editingId 
        ? "✅ Publikasi berhasil diperbarui!" 
        : "✅ Publikasi berhasil ditambahkan!";
      
      setSuccess(message);
      
      resetForm();
      await fetchPublications();
      
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "Terjadi kesalahan saat menyimpan data publikasi");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pub: Publication) => {
    setForm({
      judul: pub.judul,
      tahun: pub.tahun,
      jenis: pub.jenis,
      link: pub.link || "",
      deskripsi: pub.deskripsi || ""
    });
    setEditingId(pub.id);
    setError("");
    setSuccess("");
    
    document.getElementById("publication-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id: string | number) => {
    try {
      const res = await fetch(`/api/publikasi?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus publikasi");
      }

      setSuccess("🗑️ Publikasi berhasil dihapus!");
      await fetchPublications();
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Gagal menghapus publikasi");
    }
  };

  const resetForm = () => {
    setForm({
      judul: "",
      tahun: new Date().getFullYear().toString(),
      jenis: "Journal",
      link: "",
      deskripsi: ""
    });
    setEditingId(null);
    setError("");
  };

  const getBadgeColor = (jenis: string) => {
    return jenis === "Journal" 
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-purple-100 text-purple-800 border-purple-200";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header dengan Tombol Kembali */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Kembali"
            >
              <svg 
                className="w-5 h-5 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manajemen Publikasi</h1>
              <p className="text-gray-600 mt-1">Kelola publikasi penelitian, jurnal, dan konferensi</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Total: {publications.length} publikasi</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Journal</p>
                <p className="text-2xl font-bold text-blue-800">
                  {publications.filter(p => p.jenis === "Journal").length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Conference</p>
                <p className="text-2xl font-bold text-purple-800">
                  {publications.filter(p => p.jenis === "Conference").length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Publikasi</p>
                <p className="text-2xl font-bold text-gray-800">{publications.length}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div id="publication-form" className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "✏️ Edit Publikasi" : "➕ Tambah Publikasi Baru"}
              </h2>
              {editingId && (
                <button
                  onClick={resetForm}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Judul Publikasi *
                  </label>
                  <input
                    name="judul"
                    placeholder="Masukkan judul publikasi"
                    value={form.judul}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tahun *
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
                    Jenis Publikasi *
                  </label>
                  <select
                    name="jenis"
                    value={form.jenis}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  >
                    <option value="Journal">Journal</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Link Publikasi
                  </label>
                  <input
                    name="link"
                    type="url"
                    placeholder="https://example.com/publication"
                    value={form.link}
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
                  placeholder="Deskripsi singkat tentang publikasi..."
                  value={form.deskripsi}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                />
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
                      {editingId ? "Memperbarui..." : "Menyimpan..."}
                    </>
                  ) : (
                    editingId ? "Update Publikasi" : "Simpan Publikasi"
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
                    placeholder="Cari publikasi..."
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
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">Filter Jenis</label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="all">Semua Jenis</option>
                      <option value="Journal">Journal</option>
                      <option value="Conference">Conference</option>
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
                      <option value="title-asc">Judul A-Z</option>
                      <option value="title-desc">Judul Z-A</option>
                    </select>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Ditemukan: <span className="font-semibold">{filteredPublications.length}</span> publikasi
                  </div>
                  <button
                    onClick={fetchPublications}
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

              {/* Publications List */}
              <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-400px)] custom-scrollbar">
                {filteredPublications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {searchQuery ? (
                      <>
                        <p className="text-gray-600 font-medium mb-1">Tidak ditemukan</p>
                        <p className="text-sm text-gray-500">Tidak ada publikasi dengan kata kunci "{searchQuery}"</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600 font-medium mb-1">Belum ada publikasi</p>
                        <p className="text-sm text-gray-500">Mulai tambahkan publikasi pertama Anda!</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPublications.map((pub) => (
                      <div
                        key={pub.id}
                        className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getBadgeColor(pub.jenis)}`}>
                                {pub.jenis}
                              </span>
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full border border-gray-200">
                                {pub.tahun}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">
                              {pub.judul}
                            </h3>
                            {pub.deskripsi && (
                              <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                                {pub.deskripsi}
                              </p>
                            )}
                            {pub.link && (
                              <a
                                href={pub.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                </svg>
                                Buka Link
                              </a>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-1 ml-2">
                            <button
                              onClick={() => handleEdit(pub)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(pub.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                              title="Hapus"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Delete Confirmation */}
                        {deleteConfirm === pub.id && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                            <p className="text-red-700 font-medium mb-2 text-sm">Hapus publikasi ini?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDelete(pub.id)}
                                className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-800 text-xs rounded hover:bg-gray-300 transition"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        )}
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