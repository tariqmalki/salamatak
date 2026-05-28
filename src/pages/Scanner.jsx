import { useState } from 'react'
import { ALLERGY_TYPES, detectAllergens } from '../data/allergens'
import { useLanguage } from '../context/LanguageContext'

export default function Scanner() {
  const { t, isAr } = useLanguage()

  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts']
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState(null)

  const simulatedMenuItems = [
    { name: 'Grilled Chicken with Rice', nameAr: 'دجاج مشوي مع أرز', description: 'chicken, basmati rice, grilled vegetables, garlic sauce' },
    { name: 'Caesar Salad', nameAr: 'سلطة سيزر', description: 'lettuce, croutons, parmesan cheese, egg-based caesar dressing, anchovy' },
    { name: 'Pasta Alfredo', nameAr: 'باستا ألفريدو', description: 'fettuccine pasta, cream sauce, butter, parmesan cheese, flour' },
    { name: 'Chocolate Brownie', nameAr: 'براوني شوكولاتة', description: 'chocolate, flour, eggs, butter, walnut pieces, cream' },
    { name: 'Fresh Fruit Juice', nameAr: 'عصير فواكه طازج', description: 'mixed fruits, water, sugar' },
    { name: 'Shrimp Tempura', nameAr: 'تمبورا ربيان', description: 'shrimp, tempura batter, flour, soy sauce' },
    { name: 'Hummus & Pita', nameAr: 'حمص وخبز', description: 'chickpeas, tahini, olive oil, pita bread' },
    { name: 'Nutella Pancakes', nameAr: 'بان كيك نوتيلا', description: 'flour pancakes, nutella, hazelnut, banana, cream' },
  ]

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
      setResults(null)
    }
  }

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      const analyzed = simulatedMenuItems.map((item) => {
        const allergens = detectAllergens(item.description, selectedAllergies)
        let level = 'safe'
        if (allergens.length > 0) level = 'danger'
        else if (item.description.includes('sauce') || item.description.includes('dressing')) level = 'warning'
        return { ...item, allergens, level }
      })
      setResults(analyzed)
      setScanning(false)
    }, 2000)
  }

  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const levelStyles = {
    danger: { bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', label: t('scanner.dangerous') },
    warning: { bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', label: t('scanner.possiblyContains') },
    safe: { bg: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', label: t('scanner.safeDish') },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">{t('scanner.title')}</h1>
      <p className="text-gray-500 mb-6">{t('scanner.subtitle')}</p>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">{t('scanner.checkFor')}</h3>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_TYPES.map((allergy) => (
            <button
              key={allergy.id}
              onClick={() => toggleAllergy(allergy.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                selectedAllergies.includes(allergy.id)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
              }`}
            >
              {allergy.icon} {isAr ? allergy.labelAr : allergy.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6 text-center">
        {imagePreview ? (
          <div>
            <img src={imagePreview} alt="Menu" className="max-h-64 mx-auto rounded-xl mb-4 shadow-md" />
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={handleScan}
                disabled={scanning || selectedAllergies.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold px-8 py-3 rounded-full transition-all cursor-pointer"
              >
                {scanning ? t('scanner.scanningBtn') : t('scanner.scanButton')}
              </button>
              <button
                onClick={() => { setImagePreview(null); setResults(null) }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-6 py-3 rounded-full transition-all cursor-pointer"
              >
                {t('common.clear')}
              </button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-500 mb-4">{t('scanner.uploadPrompt')}</p>
            <div className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-full transition-all">
              {t('scanner.uploadButton')}
            </div>
            <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
          </label>
        )}
      </div>

      {scanning && (
        <div className="text-center py-8">
          <div className="text-5xl animate-pulse mb-4">🤖</div>
          <p className="text-emerald-700 font-medium">{t('scanner.aiAnalyzing')}</p>
          <p className="text-gray-400 text-sm">{t('scanner.aiSubtext')}</p>
        </div>
      )}

      {results && !scanning && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('scanner.resultsTitle')}</h2>
          <div className="space-y-3">
            {results.map((item, index) => {
              const style = levelStyles[item.level]
              return (
                <div key={index} className={`rounded-xl p-4 border ${style.bg} hover:shadow-sm transition-shadow`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800">{isAr ? item.nameAr : item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      {item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.allergens.map((a) => (
                            <span key={a.allergyId} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              {a.icon} {isAr ? a.labelAr : a.label}: {a.matchedKeywords.join(', ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
