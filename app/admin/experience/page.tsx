"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Trash2, Edit2, X, Plus, Calendar, Building, 
  Award, Mic, BookOpen, Briefcase, Search,
  Download, Save, RefreshCw, Filter
} from "lucide-react";

interface Experience {
  id: number;
  id_profil: number;
  kategori: 'Speaker' | 'Reviewer' | 'Professional';
  judul: string;
  instansi: string;
  tahun: number;
  deskripsi: string;
  created_at: string;
}

export default function AdminExperiencePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    kategori: "" as 'Speaker' | 'Reviewer' | 'Professional' | '',
    judul: "",
    instansi: "",
    tahun: new Date().getFullYear().toString(),
    deskripsi: "",
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "Speaker" | "Reviewer" | "Professional">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title-asc" | "title-desc" | "instansi">("newest");

  // Fetch experiences on component mount
  useEffect(() => {
    fetchExperiences();
  }, [filter]);

  // Filter and sort experiences
  useEffect(() => {
    let result = [...experiences];

    // Filter by kategori
    if (filter !== "all") {
      result = result.filter(exp => exp.kategori === filter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(exp =>
        exp.judul.toLowerCase().includes(query) ||
        (exp.deskripsi && exp.deskripsi.toLowerCase().includes(query)) ||
        exp.instansi.toLowerCase().includes(query) ||
        exp.tahun.toString().includes(query) ||
        exp.kategori.toLowerCase().includes(query)
      );
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => b.tahun - a.tahun);
        break;
      case "oldest":
        result.sort((a, b) => a.tahun - b.tahun);
        break;
      case "title-asc":
        result.sort((a, b) => a.judul.localeCompare(b.judul));
        break;
      case "title-desc":
        result.sort((a, b) => b.judul.localeCompare(a.judul));
        break;
      case "instansi":
        result.sort((a, b) => a.instansi.localeCompare(b.instansi));
        break;
    }

    setFilteredExperiences(result);
  }, [experiences, filter, searchQuery, sortBy]);

  const fetchExperiences = async () => {
    setFetching(true);
    try {
      const url = filter === "all" 
        ? "/api/pengalaman" 
        : `/api/pengalaman?kategori=${filter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data pengalaman");
      }
      
      setExperiences(data.data || []);
      setError("");
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Gagal memuat pengalaman");
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
    
    if (!form.kategori) {
      setError("Kategori pengalaman harus dipilih");
      return;
    }
    if (!form.judul.trim()) {
      setError("Judul pengalaman harus diisi");
      return;
    }
    if (!form.tahun.trim() || parseInt(form.tahun) < 1900 || parseInt(form.tahun) > new Date().getFullYear() + 5) {
      setError("Tahun harus valid (1900 - " + (new Date().getFullYear() + 5) + ")");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const url = editingId 
        ? `/api/pengalaman?id=${editingId}`
        : "/api/pengalaman";
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tahun: parseInt(form.tahun)
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Gagal ${editingId ? 'memperbarui' : 'menyimpan'} pengalaman`);
      }

      const message = editingId 
        ? "✅ Pengalaman berhasil diperbarui!" 
        : "✅ Pengalaman berhasil ditambahkan!";
      
      setSuccess(message);
      
      resetForm();
      await fetchExperiences();
      
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exp: Experience) => {
    setForm({
      kategori: exp.kategori,
      judul: exp.judul,
      instansi: exp.instansi,
      tahun: exp.tahun.toString(),
      deskripsi: exp.deskripsi || ""
    });
    setEditingId(exp.id);
    setError("");
    setSuccess("");
    
    document.getElementById("experience-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/pengalaman?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus pengalaman");
      }

      setSuccess("🗑️ Pengalaman berhasil dihapus!");
      await fetchExperiences();
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Gagal menghapus pengalaman");
    }
  };

  const resetForm = () => {
    setForm({
      kategori: "",
      judul: "",
      instansi: "",
      tahun: new Date().getFullYear().toString(),
      deskripsi: ""
    });
    setEditingId(null);
    setError("");
  };

  const getCategoryColor = (kategori: string) => {
    switch (kategori) {
      case 'Speaker':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'Reviewer':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'Professional':
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (kategori: string) => {
    switch (kategori) {
      case 'Speaker':
        return <Mic className="w-4 h-4" />;
      case 'Reviewer':
        return <BookOpen className="w-4 h-4" />;
      case 'Professional':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const speakerCount = experiences.filter(exp => exp.kategori === 'Speaker').length;
    const reviewerCount = experiences.filter(exp => exp.kategori === 'Reviewer').length;
    const professionalCount = experiences.filter(exp => exp.kategori === 'Professional').length;
    const uniqueYears = Array.from(new Set(experiences.map(exp => exp.tahun))).length;
    const recentYear = experiences.length > 0 
      ? Math.max(...experiences.map(exp => exp.tahun))
      : new Date().getFullYear();

    return {
      total: experiences.length,
      speaker: speakerCount,
      reviewer: reviewerCount,
      professional: professionalCount,
      uniqueYears,
      recentYear
    };
  }, [experiences]);

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
              <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengalaman</h1>
              <p className="text-gray-600 mt-1">Kelola pengalaman sebagai Speaker, Reviewer, dan Professional</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <Award className="w-5 h-5" />
            <span>Total: {stats.total} pengalaman</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Pengalaman</p>
                <p className="text-2xl font-bold text-blue-800">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Speaker</p>
                <p className="text-2xl font-bold text-purple-800">
                  {stats.speaker}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Reviewer</p>
                <p className="text-2xl font-bold text-blue-800">
                  {stats.reviewer}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Professional</p>
                <p className="text-2xl font-bold text-emerald-800">
                  {stats.professional}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div id="experience-form" className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "✏️ Edit Pengalaman" : "➕ Tambah Pengalaman Baru"}
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
                    Kategori Pengalaman *
                  </label>
                  <select
                    name="kategori"
                    value={form.kategori}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Professional">Professional</option>
                  </select>
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
                    placeholder="2024"
                    value={form.tahun}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Judul Pengalaman *
                </label>
                <input
                  name="judul"
                  placeholder="Contoh: Seminar Nasional Teknologi Informasi"
                  value={form.judul}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Instansi/Organisasi
                </label>
                <input
                  name="instansi"
                  placeholder="Contoh: Universitas Indonesia, Google Indonesia, dll."
                  value={form.instansi}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  name="deskripsi"
                  placeholder="Deskripsikan pengalaman Anda secara detail..."
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
                    <span className="flex items-center gap-2">
                      {editingId ? (
                        <>
                          <Save className="w-5 h-5" />
                          Update Pengalaman
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Simpan Pengalaman
                        </>
                      )}
                    </span>
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
                    placeholder="Cari pengalaman..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Filter and Sort Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Filter Kategori</label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="Speaker">Speaker</option>
                      <option value="Reviewer">Reviewer</option>
                      <option value="Professional">Professional</option>
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
                      <option value="instansi">Instansi A-Z</option>
                    </select>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Ditemukan: <span className="font-semibold">{filteredExperiences.length}</span> pengalaman
                  </div>
                  <button
                    onClick={fetchExperiences}
                    disabled={fetching}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Experiences List */}
              <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-400px)] custom-scrollbar">
                {filteredExperiences.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                      <Award className="w-full h-full" />
                    </div>
                    {searchQuery ? (
                      <>
                        <p className="text-gray-600 font-medium mb-1">Tidak ditemukan</p>
                        <p className="text-sm text-gray-500">Tidak ada pengalaman dengan kata kunci "{searchQuery}"</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-600 font-medium mb-1">Belum ada pengalaman</p>
                        <p className="text-sm text-gray-500">Mulai tambahkan pengalaman pertama Anda!</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredExperiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(exp.kategori)} flex items-center gap-1`}>
                                {getCategoryIcon(exp.kategori)}
                                {exp.kategori}
                              </span>
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full border border-gray-200">
                                {exp.tahun}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">
                              {exp.judul}
                            </h3>
                            {exp.instansi && (
                              <div className="flex items-center gap-1 text-gray-600 text-xs mb-2">
                                <Building className="w-3 h-3" />
                                <span className="line-clamp-1">{exp.instansi}</span>
                              </div>
                            )}
                            {exp.deskripsi && (
                              <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                                {exp.deskripsi}
                              </p>
                            )}
                            <div className="text-gray-400 text-xs">
                              ID: {exp.id} • {formatDate(exp.created_at)}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1 ml-2">
                            <button
                              onClick={() => handleEdit(exp)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(exp.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Delete Confirmation */}
                        {deleteConfirm === exp.id && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                            <p className="text-red-700 font-medium mb-2 text-sm">Hapus pengalaman ini?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDelete(exp.id)}
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