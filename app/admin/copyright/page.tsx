"use client";

import { useState, useEffect } from "react";
import { 
  Trash2, Edit2, X, Upload, Download, FileText, Shield, 
  Copyright, Calendar, Award, Search, Filter, 
  Eye, Plus, Database, RefreshCw, ExternalLink,
  ChevronDown, ChevronUp, Users, Tag, File, Folder,
  MoreVertical, Star, CheckCircle, AlertCircle,
  BarChart, TrendingUp, PieChart
} from "lucide-react";

interface Copyright {
  id: number;
  id_profil?: number | null;
  judul: string;
  nomor_pendaftaran: string;
  tahun: number | string;
  deskripsi: string;
  link?: string;
  created_at?: string;
}

interface Stats {
  total: number;
  byYear: { [key: string]: number };
  recent: number;
  pending: number;
}

export default function AdminCopyrightPage() {
  const [form, setForm] = useState({
    judul: "",
    nomor_pendaftaran: "",
    tahun: new Date().getFullYear().toString(),
    deskripsi: "",
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyrights, setCopyrights] = useState<Copyright[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Copyright>>({});
  const [editFile, setEditFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<Stats>({
    total: 0,
    byYear: {},
    recent: 0,
    pending: 0
  });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    fetchCopyrights();
  }, []);

  const fetchCopyrights = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hak-cipta");
      if (!res.ok) throw new Error("Gagal mengambil data hak cipta");
      
      const data = await res.json();
      const copyrightsData = Array.isArray(data) ? data : (data.data || []);
      setCopyrights(copyrightsData);
      
      // Calculate statistics
      const yearCount: { [key: string]: number } = {};
      const currentYear = new Date().getFullYear();
      let recentCount = 0;
      
      copyrightsData.forEach((copyright: Copyright) => {
        const year = copyright.tahun?.toString() || "Tidak ada tahun";
        yearCount[year] = (yearCount[year] || 0) + 1;
        
        // Count recent (current year)
        if (copyright.tahun?.toString() === currentYear.toString()) {
          recentCount++;
        }
      });
      
      setStats({
        total: copyrightsData.length,
        byYear: yearCount,
        recent: recentCount,
        pending: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      console.error("Gagal fetch copyright:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.judul.trim()) {
      setError("Judul hak cipta harus diisi");
      return;
    }
    if (!form.nomor_pendaftaran.trim()) {
      setError("Nomor pendaftaran harus diisi");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("judul", form.judul);
      formData.append("nomor_pendaftaran", form.nomor_pendaftaran);
      formData.append("tahun", form.tahun);
      formData.append("deskripsi", form.deskripsi);
      if (file) formData.append("file", file);

      const res = await fetch("/api/hak-cipta", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal upload hak cipta");
      }

      setSuccess("Hak cipta berhasil ditambahkan!");
      setForm({ 
        judul: "", 
        nomor_pendaftaran: "", 
        tahun: new Date().getFullYear().toString(), 
        deskripsi: "" 
      });
      setFile(null);
      fetchCopyrights();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Gagal upload hak cipta!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (copyright: Copyright) => {
    setEditId(copyright.id);
    setEditForm({ ...copyright });
    setEditFile(null);
    setError(null);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFile(e.target.files?.[0] || null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("id", String(editId));
      formData.append("judul", editForm.judul || "");
      formData.append("nomor_pendaftaran", editForm.nomor_pendaftaran || "");
      formData.append("tahun", editForm.tahun?.toString() || "");
      formData.append("deskripsi", editForm.deskripsi || "");
      if (editFile) formData.append("file", editFile);

      const res = await fetch("/api/hak-cipta", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengedit hak cipta");
      }

      setEditId(null);
      setEditForm({});
      setEditFile(null);
      setSuccess("Hak cipta berhasil diperbarui!");
      fetchCopyrights();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Gagal mengedit hak cipta!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus hak cipta ini? Tindakan ini tidak dapat dibatalkan.")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/hak-cipta?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus hak cipta");
      }

      setSuccess("Hak cipta berhasil dihapus!");
      fetchCopyrights();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Gagal menghapus hak cipta!");
    } finally {
      setLoading(false);
    }
  };

  const filteredCopyrights = copyrights
    .filter(copyright => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" || 
        copyright.judul?.toLowerCase().includes(searchLower) ||
        copyright.nomor_pendaftaran?.toLowerCase().includes(searchLower) ||
        copyright.deskripsi?.toLowerCase().includes(searchLower);
      
      const matchesYear = filterYear === "all" || copyright.tahun?.toString() === filterYear;
      
      return matchesSearch && matchesYear;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return parseInt(a.tahun?.toString() || "0") - parseInt(b.tahun?.toString() || "0");
        case "newest":
        default:
          return parseInt(b.tahun?.toString() || "0") - parseInt(a.tahun?.toString() || "0");
      }
    });

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterYear("all");
  };

  const getYearOptions = () => {
    const years = Object.keys(stats.byYear).sort((a, b) => parseInt(b) - parseInt(a));
    return ["all", ...years];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg">
              <Copyright className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Management Hak Cipta</h1>
              <p className="text-gray-600 mt-1">Kelola data hak cipta, paten, dan kekayaan intelektual</p>
            </div>
          </div>
          
          <button
            onClick={fetchCopyrights}
            disabled={loading}
            className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-600" />
                Statistics
              </h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Total Hak Cipta</span>
                    <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Tahun Ini</span>
                    <span className="text-2xl font-bold text-gray-900">{stats.recent}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                      style={{ width: `${(stats.recent / Math.max(stats.total, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Tahun Terdaftar</span>
                    <span className="text-2xl font-bold text-gray-900">{Object.keys(stats.byYear).length}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${(Object.keys(stats.byYear).length / Math.max(stats.total, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Dokumen Digital</span>
                  <span className="font-bold text-gray-900">
                    {copyrights.filter(c => c.link).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Add New Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Tambah Hak Cipta Baru
              </h3>
              
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Tambah Data
              </button>
              
              <p className="text-sm text-gray-600 mt-4">
                Upload hak cipta baru dengan mengisi form di atas
              </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-600" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                  <span className="font-medium">Export Data</span>
                  <Download className="w-4 h-4" />
                </button>
                <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                  <span className="font-medium">Backup Database</span>
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Form Tambah Data</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">Kategori: </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Hak Cipta
                  </span>
                </div>
              </div>

              {success && (
                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <p className="text-emerald-800 font-medium">{success}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Judul Hak Cipta
                      </span>
                    </label>
                    <input
                      name="judul"
                      placeholder="Masukkan judul hak cipta"
                      value={form.judul}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Nomor Pendaftaran
                      </span>
                    </label>
                    <input
                      name="nomor_pendaftaran"
                      placeholder="Contoh: 000123456789"
                      value={form.nomor_pendaftaran}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Tahun
                      </span>
                    </label>
                    <input
                      name="tahun"
                      type="number"
                      placeholder="YYYY"
                      value={form.tahun}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <File className="w-4 h-4" />
                        Upload File
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Deskripsi
                    </span>
                  </label>
                  <textarea
                    name="deskripsi"
                    placeholder="Deskripsikan hak cipta ini..."
                    value={form.deskripsi}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 min-h-[100px]"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Simpan Data
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">Daftar Hak Cipta</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    {filteredCopyrights.length}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 w-full md:w-64"
                    />
                  </div>

                  <div className="flex gap-3">
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    >
                      <option value="all">All Years</option>
                      {getYearOptions()
                        .filter(opt => opt !== "all")
                        .map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))
                      }
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Copyrights List */}
              <div className="space-y-4">
                {filteredCopyrights.length > 0 ? (
                  filteredCopyrights.map((copyright) => (
                    <div
                      key={copyright.id}
                      className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-5">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                              <Copyright className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg mb-1">
                                {copyright.judul}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  {copyright.nomor_pendaftaran}
                                </span>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {copyright.tahun}
                                </span>
                                {copyright.link && (
                                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    File
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {copyright.link && (
                              <a
                                href={copyright.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                title="View File"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => handleEdit(copyright)}
                              disabled={loading}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(copyright.id)}
                              disabled={loading}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setExpandedId(expandedId === copyright.id ? null : copyright.id)}
                              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              {expandedId === copyright.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedId === copyright.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Deskripsi</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {copyright.deskripsi || "Tidak ada deskripsi"}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Metadata</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">ID Database:</span>
                                    <span className="font-mono text-sm font-bold text-gray-900">
                                      {copyright.id.toString().padStart(6, '0')}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Dibuat:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {copyright.created_at ? new Date(copyright.created_at).toLocaleDateString('id-ID') : '-'}
                                    </span>
                                  </div>
                                  {copyright.link && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">File URL:</span>
                                      <a
                                        href={copyright.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                      >
                                        View
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                      <Folder className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {searchQuery || filterYear !== "all" ? "No Results Found" : "No Copyrights Yet"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery || filterYear !== "all" 
                        ? "Try different search criteria or clear filters"
                        : "Add your first copyright using the form above"}
                    </p>
                    {(searchQuery || filterYear !== "all") && (
                      <button
                        onClick={handleClearFilters}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Copyright className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">This Year</p>
                    <p className="text-xl font-bold text-gray-900">{stats.recent}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <PieChart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Years</p>
                    <p className="text-xl font-bold text-gray-900">{Object.keys(stats.byYear).length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Documents</p>
                    <p className="text-xl font-bold text-gray-900">
                      {copyrights.filter(c => c.link).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                  <Edit2 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Edit Hak Cipta</h3>
              </div>
              <button
                onClick={() => {
                  setEditId(null);
                  setEditForm({});
                  setEditFile(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Judul Hak Cipta
                  </label>
                  <input
                    name="judul"
                    value={editForm.judul || ""}
                    onChange={handleEditChange}
                    className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nomor Pendaftaran
                  </label>
                  <input
                    name="nomor_pendaftaran"
                    value={editForm.nomor_pendaftaran || ""}
                    onChange={handleEditChange}
                    className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tahun Pendaftaran
                  </label>
                  <input
                    name="tahun"
                    type="number"
                    value={editForm.tahun || ""}
                    onChange={handleEditChange}
                    className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    File Baru (Opsional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleEditFileChange}
                    className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {editForm.link && !editFile && (
                    <div className="mt-2">
                      <a
                        href={editForm.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Lihat File Saat Ini
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Deskripsi Hak Cipta
                </label>
                <textarea
                  name="deskripsi"
                  value={editForm.deskripsi || ""}
                  onChange={handleEditChange}
                  className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 min-h-[120px]"
                  rows={4}
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setEditForm({});
                    setEditFile(null);
                  }}
                  className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}