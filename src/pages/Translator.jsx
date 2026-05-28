import { useState } from 'react'
import { allergyTranslations } from '../data/translations'
import { ALLERGY_TYPES } from '../data/allergens'
import { useLanguage } from '../context/LanguageContext'

export default function Translator() {
  const { t, isAr } = useLanguage()
  const [selectedAllergy, setSelectedAllergy] = useState('nuts')
  const [copiedLang, setCopiedLang] = useState(null)

  const translation = allergyTranslations[selectedAllergy]

  const handleCopy = (text, lang) => {
    navigator.clipboard?.writeText(text)
    setCopiedLang(lang)
    setTimeout(() => setCopiedLang(null), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">{t('translator.title')}</h1>
      <p className="text-gray-500 mb-6">{t('translator.subtitle')}</p>

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
            {allergy.icon} {isAr ? allergy.labelAr : allergy.label}
          </button>
        ))}
      </div>

      {translation && (
        <div className="mb-6 text-center">
          <span className="text-5xl">{translation.icon}</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">{isAr ? translation.titleAr : translation.title}</h2>
          <p className="text-xl text-gray-600">{isAr ? translation.title : translation.titleAr}</p>
        </div>
      )}

      {translation && (
        <div className="space-y-4">
          {translation.translations.map((item) => (
            <div key={item.lang} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{item.flag}</span>
                <span className="font-bold text-gray-700 text-lg">{item.lang}</span>
              </div>
              <p className="text-lg leading-relaxed text-gray-800 bg-gray-50 rounded-xl p-4" dir={item.lang === 'Arabic' ? 'rtl' : 'ltr'}>
                {item.text}
              </p>
              <button
                onClick={() => handleCopy(item.text, item.lang)}
                className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer transition-colors"
              >
                {copiedLang === item.lang ? t('translator.copied') : t('translator.copyButton')}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-center">
        <p className="text-sm text-emerald-700">{t('translator.tip')}</p>
      </div>
    </div>
  )
}
