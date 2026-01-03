import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Tentang</h3>
            <p className="text-sm opacity-90">
              Website profil dosen yang menyajikan informasi akademik, publikasi ilmiah, dan pengalaman profesional.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navigasi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:underline opacity-90">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:underline opacity-90">
                  Profil
                </Link>
              </li>
              <li>
                <Link href="/publications" className="hover:underline opacity-90">
                  Publikasi
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:underline opacity-90">
                  Penelitian
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span>dosen@universitas.ac.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>+62 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Universitas, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-90">
          <p>&copy; 2025 Profil Dosen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
