"use client"

import { useState, useEffect } from "react";
import { Trash2, Edit2, X, FileText, MapPin, Calendar, HandHeart } from "lucide-react";

interface Pengabdian {
  id: number;
  id_profil: number | null;
  judul: string;
  lokasi: string;
  tahun: string | number;
  deskripsi: string;
  foto_kegiatan: string;
  created_at?: string;
}

export default function AdminPengabdianPage() {
  const [form, setForm] = useState({
    judul: "",
    lokasi: "",
    tahun: new Date().getFullYear().toString(),
    deskripsi: "",
    foto_kegiatan: "",
  });
  const [loading, setLoading] = useState(false);
  const [pengabdian, setPengabdian] = useState<Pengabdian[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Pengabdian>>({});

  useEffect(() => {
    fetchPengabdian();
  }, []);

  const fetchPengabdian = async () => {
    try {
      const res = await fetch("/api/pengabdian");
      if (!res.ok) throw new Error("Gagal mengambil data pengabdian");
      
      const data = await res.json();
      setPengabdian(data.data || []);
    } catch (err) {
      console.error("Gagal fetch pengabdian:", err);
      alert("Gagal mengambil data pengabdian");
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
        throw new Error("Judul pengabdian harus diisi");
      }
      if (!form.lokasi.trim()) {
        throw new Error("Lokasi pengabdian harus diisi");
      }

      const payload = {
        judul: form.judul,
        lokasi: form.lokasi,
        tahun: form.tahun ? parseInt(form.tahun) : new Date().getFullYear(),
        deskripsi: form.deskripsi || null,
        foto_kegiatan: form.foto_kegiatan || null,
      };

      const res = await fetch("/api/pengabdian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal tambah pengabdian");
      }

      // Reset form
      setForm({
        judul: "",
        lokasi: "",
        tahun: new Date().getFullYear().toString(),
        deskripsi: "",
        foto_kegiatan: "",
      });

      // Refresh data
      await fetchPengabdian();
      
      alert("Pengabdian berhasil ditambahkan!");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal tambah pengabdian!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Pengabdian) => {
    setEditId(item.id);
    setEditForm({ 
      ...item,
      tahun: item.tahun?.toString() || new Date().getFullYear().toString()
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
        throw new Error("Judul pengabdian harus diisi");
      }
      if (!editForm.lokasi?.trim()) {
        throw new Error("Lokasi pengabdian harus diisi");
      }

      const payload = {
        id: editId,
        judul: editForm.judul,
        lokasi: editForm.lokasi,
        tahun: editForm.tahun ? parseInt(editForm.tahun.toString()) : new Date().getFullYear(),
        deskripsi: editForm.deskripsi || null,
        foto_kegiatan: editForm.foto_kegiatan || null,
      };

      const res = await fetch("/api/pengabdian", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal edit pengabdian");
      }

      setEditId(null);
      setEditForm({});
      await fetchPengabdian();
      
      alert("Pengabdian berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal edit pengabdian!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Yakin ingin menghapus pengabdian ini?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/pengabdian?id=${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal hapus pengabdian");
      }
      
      await fetchPengabdian();
      alert("Pengabdian berhasil dihapus!");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Gagal hapus pengabdian!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Pengabdian Masyarakat</h1>
          <p className="text-gray-600">Kelola data kegiatan pengabdian masyarakat</p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              Total: {pengabdian.length} kegiatan
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HandHeart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Tambah Kegiatan Pengabdian</h2>
                  <p className="text-sm text-gray-600">Isi form untuk menambah data pengabdian</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Pengabdian *
                  </label>
                  <input
                    name="judul"
                    placeholder="Judul kegiatan pengabdian"
                    value={form.judul}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasi *
                    </label>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <input
                        name="lokasi"
                        placeholder="Lokasi pengabdian"
                        value={form.lokasi}
                        onChange={handleChange}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahun *
                    </label>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <input
                        name="tahun"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 5}
                        placeholder="Tahun"
                        value={form.tahun}
                        onChange={handleChange}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Kegiatan
                  </label>
                  <textarea
                    name="deskripsi"
                    placeholder="Deskripsi lengkap kegiatan pengabdian"
                    value={form.deskripsi}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Kegiatan (URL)
                  </label>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <input
                      name="foto_kegiatan"
                      placeholder="https://example.com/foto-kegiatan.jpg"
                      value={form.foto_kegiatan}
                      onChange={handleChange}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Masukkan URL lengkap ke foto dokumentasi
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
                      "Simpan Pengabdian"
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
                <h3 className="text-lg font-bold text-gray-900">Daftar Pengabdian</h3>
                <button
                  onClick={fetchPengabdian}
                  disabled={loading}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                  title="Refresh data"
                >
                  <div className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}>↻</div>
                </button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {pengabdian.length === 0 ? (
                  <div className="text-center py-8">
                    <HandHeart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada data pengabdian</p>
                    <p className="text-sm text-gray-400 mt-1">Mulai tambah pengabdian pertama Anda</p>
                  </div>
                ) : (
                  pengabdian.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 bg-white group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {item.tahun}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {item.lokasi}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                            {item.judul}
                          </h4>
                          {item.deskripsi && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.deskripsi}
                            </p>
                          )}
                          {item.foto_kegiatan && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600 truncate">
                                Foto tersedia
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 ml-2">
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={loading}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
                    <h3 className="text-xl font-bold text-gray-900">Edit Pengabdian</h3>
                    <p className="text-sm text-gray-600">Perbarui data pengabdian</p>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Pengabdian *
                  </label>
                  <input
                    name="judul"
                    placeholder="Judul kegiatan pengabdian"
                    value={editForm.judul || ""}
                    onChange={handleEditChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokasi *
                    </label>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <input
                        name="lokasi"
                        placeholder="Lokasi pengabdian"
                        value={editForm.lokasi || ""}
                        onChange={handleEditChange}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahun *
                    </label>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <input
                        name="tahun"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 5}
                        placeholder="Tahun"
                        value={editForm.tahun || ""}
                        onChange={handleEditChange}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Kegiatan
                  </label>
                  <textarea
                    name="deskripsi"
                    placeholder="Deskripsi lengkap kegiatan pengabdian"
                    value={editForm.deskripsi || ""}
                    onChange={handleEditChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Kegiatan (URL)
                  </label>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <input
                      name="foto_kegiatan"
                      placeholder="https://example.com/foto-kegiatan.jpg"
                      value={editForm.foto_kegiatan || ""}
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