"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit2, X, FileText, Link, BookOpen } from "lucide-react";

interface Penelitian {
  id: number;
  id_profil: number | null;
  judul: string;
  tahun: string | number;
  bidang: string | null;
  deskripsi: string | null;
  file_laporan: string | null;
  created_at?: string;
}

export default function AdminResearchPage() {
  const [form, setForm] = useState({
    judul: "",
    tahun: new Date().getFullYear().toString(),
    bidang: "",
    deskripsi: "",
    file_laporan: "",
  });
  const [loading, setLoading] = useState(false);
  const [researches, setResearches] = useState<Penelitian[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Penelitian>>({});

  useEffect(() => {
    fetchResearches();
  }, []);

  const fetchResearches = async () => {
    try {
      const res = await fetch("/api/penelitian");
      if (!res.ok) throw new Error("Gagal mengambil data penelitian");
      
      const data = await res.json();
      setResearches(data.data || []);
    } catch (err) {
      console.error("Gagal fetch researches:", err);
      alert("Gagal mengambil data penelitian");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validasi
      if (!form.judul.trim()) {
        throw new Error("Judul penelitian harus diisi");
      }

      const payload = {
        judul: form.judul,
        tahun: form.tahun ? parseInt(form.tahun) : new Date().getFullYear(),
        bidang: form.bidang || null,
        deskripsi: form.deskripsi || null,
        file_laporan: form.file_laporan || null,
      };

      const res = await fetch("/api/penelitian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal tambah penelitian");
      }

      // Reset form
      setForm({
        judul: "",
        tahun: new Date().getFullYear().toString(),
        bidang: "",
        deskripsi: "",
        file_laporan: "",
      });

      // Refresh data
      await fetchResearches();
      
      alert("Penelitian berhasil ditambahkan!");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal tambah penelitian!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (res: Penelitian) => {
    setEditId(res.id);
    setEditForm({ 
      ...res,
      tahun: res.tahun?.toString() || new Date().getFullYear().toString()
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    
    setLoading(true);
    try {
      // Validasi
      if (!editForm.judul?.trim()) {
        throw new Error("Judul penelitian harus diisi");
      }

      const payload = {
        id: editId,
        judul: editForm.judul,
        tahun: editForm.tahun ? parseInt(editForm.tahun.toString()) : new Date().getFullYear(),
        bidang: editForm.bidang || null,
        deskripsi: editForm.deskripsi || null,
        file_laporan: editForm.file_laporan || null,
      };

      const res = await fetch("/api/penelitian", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal edit penelitian");
      }

      setEditId(null);
      setEditForm({});
      await fetchResearches();
      
      alert("Penelitian berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal edit penelitian!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus penelitian ini?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/penelitian?id=${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal hapus penelitian");
      }
      
      await fetchResearches();
      alert("Penelitian berhasil dihapus!");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal hapus penelitian!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Penelitian</h1>
          <p className="text-gray-600">Kelola data penelitian dan publikasi ilmiah</p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              Total: {researches.length} penelitian
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
              {new Date().getFullYear()}: {researches.filter(r => r.tahun == new Date().getFullYear()).length} penelitian
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Tambah Penelitian Baru</h2>
                  <p className="text-sm text-gray-600">Isi form untuk menambah data penelitian</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Penelitian *
                    </label>
                    <input
                      name="judul"
                      placeholder="Judul penelitian"
                      value={form.judul}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahun *
                    </label>
                    <input
                      name="tahun"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      placeholder="Tahun"
                      value={form.tahun}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bidang Penelitian
                  </label>
                  <input
                    name="bidang"
                    placeholder="Contoh: Kecerdasan Buatan, Data Science, dll"
                    value={form.bidang}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    placeholder="Deskripsi singkat tentang penelitian"
                    value={form.deskripsi}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Laporan (URL atau nama file)
                  </label>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <input
                      name="file_laporan"
                      placeholder="Contoh: laporan_2024.pdf atau https://..."
                      value={form.file_laporan}
                      onChange={handleChange}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Masukkan nama file atau link ke laporan penelitian
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Penelitian"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Daftar Penelitian</h3>
                <button
                  onClick={fetchResearches}
                  disabled={loading}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                  title="Refresh data"
                >
                  <div className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}>↻</div>
                </button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {researches.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada data penelitian</p>
                    <p className="text-sm text-gray-400 mt-1">Mulai tambah penelitian pertama Anda</p>
                  </div>
                ) : (
                  researches.map((res) => (
                    <div
                      key={res.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 bg-white group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {res.tahun}
                            </span>
                            {res.bidang && (
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                {res.bidang}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                            {res.judul}
                          </h4>
                          {res.deskripsi && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {res.deskripsi}
                            </p>
                          )}
                          {res.file_laporan && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600 truncate">
                                {res.file_laporan}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 ml-2">
                          <button
                            onClick={() => handleEdit(res)}
                            disabled={loading}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(res.id)}
                            disabled={loading}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Edit2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Edit Penelitian</h3>
                    <p className="text-sm text-gray-600">Perbarui data penelitian</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditId(null);
                    setEditForm({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Penelitian *
                    </label>
                    <input
                      name="judul"
                      placeholder="Judul penelitian"
                      value={editForm.judul || ""}
                      onChange={handleEditChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahun *
                    </label>
                    <input
                      name="tahun"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      placeholder="Tahun"
                      value={editForm.tahun || ""}
                      onChange={handleEditChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bidang Penelitian
                  </label>
                  <input
                    name="bidang"
                    placeholder="Contoh: Kecerdasan Buatan, Data Science, dll"
                    value={editForm.bidang || ""}
                    onChange={handleEditChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    placeholder="Deskripsi singkat tentang penelitian"
                    value={editForm.deskripsi || ""}
                    onChange={handleEditChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Laporan (URL atau nama file)
                  </label>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <input
                      name="file_laporan"
                      placeholder="Contoh: laporan_2024.pdf atau https://..."
                      value={editForm.file_laporan || ""}
                      onChange={handleEditChange}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(null);
                      setEditForm({});
                    }}
                    className="px-5 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}