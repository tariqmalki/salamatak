import { useState } from 'react'
import { allergyTranslations } from '../data/translations'
import { ALLERGY_TYPES } from '../data/allergens'

// Allergy Translator - shows allergy warning sentences in multiple languages
export default function Translator() {
  const [selectedAllergy, setSelectedAllergy] = useState('nuts')

  const translation = allergyTranslations[selectedAllergy]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">🌍 Allergy Translator</h1>
      <p className="text-gray-500 mb-6">Show these cards to restaurant staff in any language</p>

      {/* Allergy type selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {ALLERGY_TYPES.map((allergy) => (
          <button
            key={allergy.id}
            onClick={() => setSelectedAllergy(allergy.id)}
            className={`px-5 py-3 rounded-full text-base font-medium border-2 transition-all cursor-pointer ${
              selectedAllergy === allergy.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
            }`}
          >
            {allergy.icon} {allergy.label}
          </button>
        ))}
      </div>

      {/* Translation header */}
      {translation && (
        <div className="mb-6 text-center">
          <span className="text-5xl">{translation.icon}</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">{translation.title}</h2>
          <p className="text-xl text-gray-600">{translation.titleAr}</p>
        </div>
      )}

      {/* Translation cards */}
      {translation && (
        <div className="space-y-4">
          {translation.translations.map((t) => (
            <div
              key={t.lang}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Language header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{t.flag}</span>
                <span className="font-bold text-gray-700 text-lg">{t.lang}</span>
              </div>

              {/* Translation text */}
              <p
                className="text-lg leading-relaxed text-gray-800"
                dir={t.lang === 'Arabic' ? 'rtl' : 'ltr'}
              >
                {t.text}
              </p>

              {/* Copy button */}
              <button
                onClick={() => navigator.clipboard?.writeText(t.text)}
                className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
              >
                📋 Copy to clipboard
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
