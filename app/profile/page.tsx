"use client"

import { useEffect, useState } from 'react'
import {
  Mail, Phone, MapPin, GraduationCap,
  Calendar, Award, Briefcase, User,
  BookOpen, Star, Users, FileText,
  Building, Shield, Lock, Home, Search, Bell, Menu, ChevronDown, LogOut
} from 'lucide-react'

interface ProfileData {
  nama: string
  nidn: string
  jabatan: string
  fakultas: string
  prodi: string
  email: string
  telepon: string
  alamat: string
  pendidikan_terakhir: string
  universitas: string
  tahun_lulus: number
  deskripsi: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tentang')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [activityMenuOpen, setActivityMenuOpen] = useState(false)

  useEffect(() => {
    const savedProfile = localStorage.getItem('dosenProfile')

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    } else {
      setProfile({
        nama: "Prof. Dr. Pudji Widodo, M.Si.",
        nidn: "0023056701",
        jabatan: "Guru Besar Taksonomi Tumbuhan",
        fakultas: "Fakultas Biologi",
        prodi: "Program Studi Biologi",
        email: "pudji.widodo@unsoed.ac.id",
        telepon: "(0281) 1234567",
        alamat: "Gedung Biologi Lt. 3, Kampus Unsoed, Purwokerto 53122",
        pendidikan_terakhir: "S3 (Doktor) Biologi",
        universitas: "Institut Pertanian Bogor",
        tahun_lulus: 2010,
        deskripsi: `Saya Prof. Dr. Pudji Widodo, M.Si., Guru Besar dan dosen Fakultas Biologi Universitas Jenderal Soedirman (Unsoed) Purwokerto dengan spesialisasi dalam bidang Taksonomi Tumbuhan.

Saya menyelesaikan pendidikan Doktor (S3) pada tahun 2010 di Departemen Biologi, Institut Pertanian Bogor (IPB). Pendidikan Magister (S2) diselesaikan pada tahun 1998 di Lincoln University, New Zealand, serta pendidikan Sarjana (S1) pada tahun 1985 di Fakultas Biologi Universitas Jenderal Soedirman Purwokerto.

Fokus penelitian saya adalah pada genus Syzygium (jambu) dengan kontribusi signifikan dalam identifikasi dan konservasi spesies langka. Saya telah mempublikasikan lebih dari 50 karya ilmiah dalam jurnal nasional dan internasional.`
      })
    }
    setLoading(false)
  }, [])

  const mataKuliah = [
    { kode: "BIO401", nama: "Taksonomi Tumbuhan", sks: 3, semester: "Ganjil" },
    { kode: "BIO402", nama: "Struktur dan Perkembangan Tumbuhan I", sks: 3, semester: "Ganjil" },
    { kode: "BIO403", nama: "Dendrologi", sks: 2, semester: "Genap" },
    { kode: "BIO404", nama: "Konservasi Tumbuhan Langka", sks: 2, semester: "Genap" }
  ]

  const penelitian = [
    { judul: "Taksonomi dan Filogeni Genus Syzygium di Indonesia", tahun: "2018-2023", status: "Selesai" },
    { judul: "Konservasi Tumbuhan Langka Jawa Tengah", tahun: "2020-2024", status: "Berjalan" },
    { judul: "Diversitas Flora di Kawasan Karst", tahun: "2021-2023", status: "Selesai" },
    { judul: "Etnobotani Masyarakat Lokal", tahun: "2022-2025", status: "Berjalan" }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <button className="text-gray-600 hover:text-blue-600">Beranda</button>
            <span className="text-gray-400">/</span>
            <button className="text-blue-600 font-medium">Profil Dosen</button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 font-medium">{profile.nama}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <div className="w-40 h-40 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/30 p-1">
                <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
                  <User size={80} className="text-white" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                PROFESOR
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{profile.nama}</h1>
              <p className="text-xl text-blue-100 mb-4">{profile.jabatan}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Shield size={18} />
                  <span>NIDN: {profile.nidn}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Building size={18} />
                  <span>{profile.fakultas}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Kontak Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Mail className="text-blue-600" />
                Informasi Kontak
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Mail className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Phone className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Telepon</p>
                    <p className="font-medium">{profile.telepon}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <MapPin className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Lokasi</p>
                    <p className="font-medium">{profile.alamat}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pendidikan */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Award className="text-green-600" />
                Pendidikan
              </h3>
              <div className="relative pl-8 border-l-2 border-green-200">
                <div className="absolute left-[-9px] top-0 w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={14} className="text-yellow-500" />
                    <h4 className="font-bold text-gray-800">{profile.pendidikan_terakhir}</h4>
                  </div>
                  <p className="text-gray-600 mb-2">{profile.universitas}</p>
                  <div className="flex items-center gap-2 text-green-600">
                    <Calendar size={14} />
                    <span className="text-sm">Lulus {profile.tahun_lulus}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistik */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-6">Statistik</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-2xl font-bold">25+</div>
                  <div className="text-sm text-blue-100">Tahun Mengajar</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-2xl font-bold">50+</div>
                  <div className="text-sm text-blue-100">Publikasi</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-2xl font-bold">15</div>
                  <div className="text-sm text-blue-100">Penelitian</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-blue-100">Mahasiswa</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-white p-2 rounded-2xl shadow-lg mb-8">
              {['tentang', 'pengajaran', 'penelitian'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${activeTab === tab
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                >
                  {tab === 'tentang' && 'Tentang Saya'}
                  {tab === 'pengajaran' && 'Pengajaran'}
                  {tab === 'penelitian' && 'Penelitian'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'tentang' && (
                <>
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <Briefcase className="text-blue-600" size={24} />
                      <h2 className="text-2xl font-bold text-gray-800">Profil Akademik Saya</h2>
                    </div>
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                      {profile.deskripsi}
                    </div>
                  </div>

                  {/* Bidang Keahlian */}
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Bidang Keahlian Saya</h2>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { name: "Taksonomi Tumbuhan", level: "Expert" },
                        { name: "Genus Syzygium", level: "Spesialis" },
                        { name: "Dendrologi", level: "Advanced" },
                        { name: "Konservasi Tumbuhan", level: "Expert" },
                        { name: "Biologi Tumbuhan", level: "Expert" },
                        { name: "Etnobotani", level: "Intermediate" }
                      ].map((skill, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-gray-800">{skill.name}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${skill.level === 'Expert' ? 'bg-red-100 text-red-800' :
                                skill.level === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {skill.level}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${skill.level === 'Expert' ? 'bg-red-500 w-5/6' :
                                skill.level === 'Advanced' ? 'bg-blue-500 w-3/4' :
                                  'bg-green-500 w-2/3'
                              }`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'pengajaran' && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <BookOpen className="text-blue-600" size={24} />
                      <h2 className="text-2xl font-bold text-gray-800">Mata Kuliah yang Saya Ampu</h2>
                    </div>
                    <div className="text-sm text-gray-500">
                      Total: {mataKuliah.length} mata kuliah
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mataKuliah.map((mk, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="text-blue-600" size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 mb-1">{mk.nama}</h4>
                            <p className="text-sm text-gray-600 mb-2">Kode: {mk.kode} • {mk.sks} SKS</p>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                Semester {mk.semester}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {mk.sks} SKS
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <div className="inline-flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{mataKuliah.length}</p>
                        <p className="text-sm text-gray-500">Mata Kuliah</p>
                      </div>
                      <div className="h-8 w-px bg-gray-300"></div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {mataKuliah.reduce((sum, mk) => sum + mk.sks, 0)}
                        </p>
                        <p className="text-sm text-gray-500">Total SKS</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'penelitian' && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="text-green-600" size={24} />
                    <h2 className="text-2xl font-bold text-gray-800">Aktivitas Penelitian Saya</h2>
                  </div>
                  <div className="space-y-6">
                    {penelitian.map((item, index) => (
                      <div key={index} className="p-5 border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white rounded-r-xl hover:shadow-md transition-shadow">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 mb-2">{item.judul}</h4>
                            <div className="flex items-center gap-4 mb-3">
                              <span className="text-sm text-gray-600">
                                Periode: {item.tahun}
                              </span>
                              <span className={`text-sm px-2 py-1 rounded ${item.status === 'Berjalan' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {item.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">Taksonomi</span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Konservasi</span>
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Biodiversitas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <p className="text-2xl font-bold text-gray-800">
                          {penelitian.filter(p => p.status === 'Berjalan').length}
                        </p>
                        <p className="text-sm text-gray-600">Penelitian Berjalan</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <p className="text-2xl font-bold text-gray-800">
                          {penelitian.filter(p => p.status === 'Selesai').length}
                        </p>
                        <p className="text-sm text-gray-600">Penelitian Selesai</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Fakultas Biologi</p>
                <p className="text-sm text-gray-600">Universitas Jenderal Soedirman</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Profil Akademik
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Profil dosen ini bersifat informatif dan tidak dapat diubah
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}