import { useState } from 'react'
import { allergyTranslations } from '../data/translations'
import { ALLERGY_TYPES } from '../data/allergens'

/**
 * Allergy Translator - Shows allergy warning cards in multiple languages
 *
 * Features:
 * - User selects their allergy type
 * - Shows the warning sentence in 4 languages:
 *   Arabic, English, Turkish, Japanese
 * - Clean card-style UI for each language
 * - Copy to clipboard functionality
 * - RTL support for Arabic text
 *
 * Use case: Show these cards to restaurant staff who speak
 * different languages while traveling or dining out.
 */
export default function Translator() {
  // Default to nuts allergy
  const [selectedAllergy, setSelectedAllergy] = useState('nuts')
  // Track which card was just copied (for feedback)
  const [copiedLang, setCopiedLang] = useState(null)

  // Get translation data for the selected allergy
  const translation = allergyTranslations[selectedAllergy]

  // Copy text to clipboard and show brief feedback
  const handleCopy = (text, lang) => {
    navigator.clipboard?.writeText(text)
    setCopiedLang(lang)
    setTimeout(() => setCopiedLang(null), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">🌍 Allergy Translator</h1>
      <p className="text-gray-500 mb-1">Show these cards to restaurant staff in any language</p>
      <p className="text-gray-400 text-sm mb-6" dir="rtl">اعرض هذه البطاقات لموظفي المطعم بأي لغة</p>

      {/* Allergy type selector - choose which allergy to translate */}
      <div className="flex flex-wrap gap-2 mb-8">
        {ALLERGY_TYPES.map((allergy) => (
          <button
            key={allergy.id}
            onClick={() => setSelectedAllergy(allergy.id)}
            className={`px-5 py-3 rounded-full text-base font-medium border-2 transition-all cursor-pointer ${
              selectedAllergy === allergy.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
            }`}
          >
            {allergy.icon} {allergy.label}
          </button>
        ))}
      </div>

      {/* Translation header showing selected allergy */}
      {translation && (
        <div className="mb-6 text-center">
          <span className="text-5xl">{translation.icon}</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">{translation.title}</h2>
          <p className="text-xl text-gray-600">{translation.titleAr}</p>
        </div>
      )}

      {/* Translation cards - one per language */}
      {translation && (
        <div className="space-y-4">
          {translation.translations.map((t) => (
            <div
              key={t.lang}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Language header with flag */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{t.flag}</span>
                <span className="font-bold text-gray-700 text-lg">{t.lang}</span>
              </div>

              {/* Translation text - uses RTL for Arabic */}
              <p
                className="text-lg leading-relaxed text-gray-800 bg-gray-50 rounded-xl p-4"
                dir={t.lang === 'Arabic' ? 'rtl' : 'ltr'}
              >
                {t.text}
              </p>

              {/* Copy to clipboard button with feedback */}
              <button
                onClick={() => handleCopy(t.text, t.lang)}
                className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer transition-colors"
              >
                {copiedLang === t.lang ? '✅ Copied!' : '📋 Copy to clipboard'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tip at bottom */}
      <div className="mt-8 bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-center">
        <p className="text-sm text-emerald-700">
          💡 <strong>Tip:</strong> Show the card in the restaurant staff's language for best results.
          You can also copy the text and send it via messaging apps.
        </p>
      </div>
    </div>
  )
}
