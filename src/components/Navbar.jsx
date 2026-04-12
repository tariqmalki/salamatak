import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * Navbar - Main navigation bar for the app
 *
 * Features:
 * - Responsive design (desktop + mobile hamburger menu)
 * - Active link highlighting
 * - "More" dropdown for extra pages
 * - Bilingual labels (English + Arabic)
 * - Sticky positioning so it's always visible
 */

// Primary navigation links - shown in the main nav bar
const navLinks = [
  { path: '/home', label: 'Home', labelAr: 'الرئيسية', icon: '🏠' },
  { path: '/scanner', label: 'Scanner', labelAr: 'الماسح', icon: '📷' },
  { path: '/check-dish', label: 'Check Dish', labelAr: 'فحص طبق', icon: '🍽️' },
  { path: '/emergency', label: 'Emergency', labelAr: 'طوارئ', icon: '🚨' },
  { path: '/community', label: 'Community', labelAr: 'المجتمع', icon: '💬' },
]

// Extra pages accessible from "More" dropdown
const moreLinks = [
  { path: '/translator', label: 'Translator', labelAr: 'مترجم', icon: '🌍' },
  { path: '/recommendations', label: 'Safe Meals', labelAr: 'وجبات آمنة', icon: '✅' },
  { path: '/safety-map', label: 'Safety Map', labelAr: 'خريطة الأمان', icon: '🗺️' },
  { path: '/kids-mode', label: 'Kids Mode', labelAr: 'وضع الأطفال', icon: '👶' },
  { path: '/barcode', label: 'Barcode', labelAr: 'باركود', icon: '📊' },
]

export default function Navbar() {
  const location = useLocation()
  // State for mobile menu and more dropdown visibility
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/home" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-bold text-emerald-700">Salamatak</span>
            <span className="text-sm text-emerald-600 hidden sm:inline">سلامتك</span>
          </Link>

          {/* Desktop navigation links - hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium no-underline transition-colors ${
                  location.pathname === link.path
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {/* "More" dropdown for extra pages */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                ⋯ More
              </button>
              {/* Dropdown menu */}
              {moreOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMoreOpen(false)}
                      className={`block px-4 py-2 text-sm no-underline transition-colors ${
                        location.pathname === link.path
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-2xl cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu - slides down when hamburger is clicked */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white pb-4">
          {/* Show all links (primary + more) in mobile */}
          {[...navLinks, ...moreLinks].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-6 py-3 text-sm font-medium no-underline transition-colors ${
                location.pathname === link.path
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{link.icon}</span>
              {link.label}
              <span className="text-gray-400 text-xs ml-2">{link.labelAr}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
