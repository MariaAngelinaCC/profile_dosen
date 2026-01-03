"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  FileText,
  Book,
  Users,
  Award,
  Beaker,
  Heart,
  Lock,
  Home,
  BarChart3,
  Search,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";
import Link from "next/link";

interface AuthData {
  username: string;
  nama_lengkap: string;
  id: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [counts, setCounts] = useState({
    publikasi: 0,
    buku: 0,
    pengalaman: 0,
    penelitian: 0,
    pengabdian: 0,
    hakCipta: 0,
  });

  useEffect(() => {
    // Cek autentikasi admin
    const auth = localStorage.getItem("adminAuth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      try {
        const authParsed = JSON.parse(auth);
        setAuthData(authParsed);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing auth data:", error);
        router.push("/admin/login");
      }
    }
  }, [router]);

  // Ambil jumlah data dari API
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          publikasiRes,
          bukuRes,
          pengalamanRes,
          penelitianRes,
          pengabdianRes,
          hakCiptaRes,
        ] = await Promise.all([
          fetch("/api/publikasi"),
          fetch("/api/buku"),
          fetch("/api/pengalaman"),
          fetch("/api/penelitian"),
          fetch("/api/pengabdian"),
          fetch("/api/hak-cipta"),
        ]);

        const publikasiData = await publikasiRes.json();
        const bukuData = await bukuRes.json();
        const pengalamanData = await pengalamanRes.json();
        const penelitianData = await penelitianRes.json();
        const pengabdianData = await pengabdianRes.json();
        const hakCiptaData = await hakCiptaRes.json();

        // Handle both response formats: { data: [...] } and [...]
        const getLength = (data: any) => {
          if (Array.isArray(data)) return data.length;
          if (data?.data && Array.isArray(data.data)) return data.data.length;
          return 0;
        };

        setCounts({
          publikasi: getLength(publikasiData),
          buku: getLength(bukuData),
          pengalaman: getLength(pengalamanData),
          penelitian: getLength(penelitianData),
          pengabdian: getLength(pengabdianData),
          hakCipta: getLength(hakCiptaData),
        });
      } catch (err) {
        console.error("Gagal memuat jumlah konten:", err);
      }
    };

    fetchCounts();

    // Listen to global content change events so counts can refresh live
    const onContentChanged = () => {
      fetchCounts();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("content:changed", onContentChanged);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("content:changed", onContentChanged);
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
  };

  // Helper function untuk mendapatkan inisial
  const getInitials = (name: string) => {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  };

  if (!isAuthenticated || !authData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: FileText,
      label: "Publikasi",
      href: "/admin/publications",
      count: counts.publikasi,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      description: "Artikel & jurnal"
    },
    { 
      icon: Book, 
      label: "Buku", 
      href: "/admin/buku", 
      count: counts.buku,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      description: "Buku digital"
    },
    {
      icon: Award,
      label: "Pengalaman",
      href: "/admin/experience",
      count: counts.pengalaman,
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      description: "Pengalaman kerja"
    },
    {
      icon: Beaker,
      label: "Penelitian",
      href: "/admin/research",
      count: counts.penelitian,
      color: "bg-gradient-to-br from-red-500 to-red-600",
      description: "Proyek penelitian"
    },
    {
      icon: Heart,
      label: "Pengabdian",
      href: "/admin/community-service",
      count: counts.pengabdian,
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      description: "Pengabdian masyarakat"
    },
    {
      icon: Lock,
      label: "Hak Cipta",
      href: "/admin/copyright",
      count: counts.hakCipta,
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      description: "Hak cipta & paten"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Modern */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Kelola konten Anda</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
            
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
                    {getInitials(authData.nama_lengkap)}
                  </div>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{authData.nama_lengkap}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Selamat datang, <span className="text-primary">{authData.nama_lengkap}</span>! 👋
                </h1>
                <p className="text-gray-600 mt-2">
                  Kelola semua konten Anda dari satu tempat yang terpusat.
                </p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Menu Items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Kelola Konten
              </h2>
              <span className="text-sm text-gray-500">
                Total: {Object.values(counts).reduce((a, b) => a + b, 0)} item
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${item.color} rounded-xl`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary transition">{item.label}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Statistik Cepat
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{counts.publikasi}</p>
                  <p className="text-sm text-gray-600">Publikasi</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{counts.penelitian}</p>
                  <p className="text-sm text-gray-600">Penelitian</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{counts.pengabdian}</p>
                  <p className="text-sm text-gray-600">Pengabdian</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{counts.buku}</p>
                  <p className="text-sm text-gray-600">Buku</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - User Info */}
          <div>
            {/* User Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                    {getInitials(authData.nama_lengkap)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{authData.nama_lengkap}</h3>
                    <p className="text-white/80">Administrator</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Username</p>
                    <p className="font-mono text-sm text-gray-900">{authData.username}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">ID Admin</p>
                    <p className="font-mono text-sm text-gray-900">#{authData.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div className="mb-4 md:mb-0">
              <span>© {new Date().getFullYear()} Admin Dashboard</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-600">Terakhir diupdate: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}