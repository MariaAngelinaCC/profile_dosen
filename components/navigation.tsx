"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  const navItems = [
    { href: "/", label: "Beranda" },
    { href: "/profile", label: "Profil" },
    {
      label: "Karya & Publikasi",
      submenu: [
        { href: "/publications", label: "Publikasi" },
        { href: "/books", label: "Buku" },
      ],
    },
    {
      label: "Aktivitas",
      submenu: [
        { href: "/experience", label: "Pengalaman" },
        { href: "/research", label: "Penelitian" },
        { href: "/community-service", label: "Pengabdian" },
        { href: "/copyright", label: "Hak Cipta" },
      ],
    },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <span className="font-semibold text-foreground hidden sm:inline">Profil Dosen</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, idx) =>
              "href" in item ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ) : (
                <div key={idx} className="relative group">
                  <button className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary inline-flex items-center gap-1">
                    {item.label}
                    <ChevronDown size={16} />
                  </button>
                  <div className="absolute left-0 mt-0 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {item.submenu?.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary first:rounded-t-md last:rounded-b-md transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ),
            )}
            <Link
              href="/admin"
              className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            {navItems.map((item, idx) =>
              "href" in item ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <div key={idx}>
                  <button
                    onClick={() => setOpenSubmenu(openSubmenu === item.label ? null : item.label)}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors inline-flex items-center justify-between"
                  >
                    {item.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${openSubmenu === item.label ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openSubmenu === item.label && (
                    <div className="pl-4 space-y-2">
                      {item.submenu?.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="block px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors"
                          onClick={() => {
                            setIsOpen(false)
                            setOpenSubmenu(null)
                          }}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
            <Link
              href="/admin"
              className="block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
