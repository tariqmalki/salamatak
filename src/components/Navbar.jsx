import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
  const location = useLocation()
  const { t, lang, setLang, isAr } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const navLinks = [
    { path: '/home', label: t('nav.home'), icon: '🏠' },
    { path: '/scanner', label: t('nav.scanner'), icon: '📷' },
    { path: '/check-dish', label: t('nav.checkDish'), icon: '🍽️' },
    { path: '/emergency', label: t('nav.emergency'), icon: '🚨' },
    { path: '/community', label: t('nav.community'), icon: '💬' },
  ]

  const moreLinks = [
    { path: '/translator', label: t('nav.translator'), icon: '🌍' },
    { path: '/recommendations', label: t('nav.safeMeals'), icon: '✅' },
    { path: '/safety-map', label: t('nav.safetyMap'), icon: '🗺️' },
    { path: '/kids-mode', label: t('nav.kidsMode'), icon: '👶' },
    { path: '/barcode', label: t('nav.barcode'), icon: '📊' },
  ]

  const toggleLang = () => setLang(isAr ? 'en' : 'ar')

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 no-underline">
            <img src="/salamatak/logo.svg" alt="Salamatak" className="h-9 w-9" />
            <span className="text-xl font-bold text-emerald-700">{t('common.appName')}</span>
          </Link>

          {/* Desktop nav */}
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
                <span className={isAr ? 'ml-1' : 'mr-1'}>{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {t('nav.more')}
              </button>
              {moreOpen && (
                <div className={`absolute ${isAr ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50`}>
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
                      <span className={isAr ? 'ml-2' : 'mr-2'}>{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-full text-sm font-bold border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer mx-2"
            >
              {isAr ? 'EN' : 'عربي'}
            </button>
          </div>

          {/* Mobile: lang toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-full text-sm font-bold border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              {isAr ? 'EN' : 'عربي'}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-2xl cursor-pointer"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white pb-4">
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
              <span className={isAr ? 'ml-2' : 'mr-2'}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
