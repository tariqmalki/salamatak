import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations } from '../data/ui-translations'

/**
 * LanguageContext - Manages app-wide language state (Arabic / English)
 *
 * Provides:
 * - lang: current language code ('ar' or 'en')
 * - setLang: function to change language
 * - t: translation function - t('key') returns translated string
 * - isAr: boolean shortcut for checking if Arabic is active
 *
 * Arabic is the DEFAULT language. Preference is saved to localStorage.
 * Switching language also updates document dir (rtl/ltr) and lang attributes.
 */

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  // Load saved language preference, default to Arabic
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('salamatak-lang') || 'ar'
  })

  const isAr = lang === 'ar'

  // Update document attributes and save preference when language changes
  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    localStorage.setItem('salamatak-lang', lang)
  }, [lang, isAr])

  // Set language with validation
  const setLang = useCallback((newLang) => {
    if (newLang === 'ar' || newLang === 'en') {
      setLangState(newLang)
    }
  }, [])

  // Translation function - looks up key in translations object
  // Supports dot notation for nested keys: t('landing.title')
  const t = useCallback((key) => {
    const keys = key.split('.')
    let value = translations[lang]
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback: return key if translation not found
        return key
      }
    }
    return value
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isAr }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Custom hook for consuming language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
