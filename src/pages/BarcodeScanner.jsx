import { useState } from 'react'
import { barcodeDatabase } from '../data/barcodes'
import { ALLERGY_TYPES } from '../data/allergens'
import { useLanguage } from '../context/LanguageContext'

export default function BarcodeScanner() {
  const { t, isAr } = useLanguage()

  const [barcode, setBarcode] = useState('')
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [selectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts']
  })

  const handleScan = () => {
    if (!barcode.trim()) return
    setScanning(true)
    setNotFound(false)
    setResult(null)

    setTimeout(() => {
      const product = barcodeDatabase[barcode.trim()]
      if (product) {
        const matchedAllergens = product.allergens.filter((a) => selectedAllergies.includes(a))
        setResult({ ...product, matchedAllergens })
      } else {
        setNotFound(true)
      }
      setScanning(false)
    }, 1500)
  }

  const sampleBarcodes = [
    { code: '6281000000001', label: isAr ? 'حليب المراعي' : 'Almarai Milk' },
    { code: '6281000000003', label: isAr ? 'شوكولاتة جالكسي' : 'Galaxy Chocolate' },
    { code: '6281000000005', label: isAr ? 'عصير الربيع' : 'Al Rabee Juice' },
    { code: '6281000000008', label: isAr ? 'ناغتس أمريكانا' : 'Americana Nuggets' },
    { code: '6281000000011', label: isAr ? 'سنيكرز' : 'Snickers Bar' },
    { code: '6281000000012', label: isAr ? 'تونة' : 'Tuna Can' },
  ]

  const riskColors = {
    red: 'bg-red-50 border-red-300',
    yellow: 'bg-yellow-50 border-yellow-300',
    green: 'bg-green-50 border-green-300',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">{t('barcode.title')}</h1>
      <p className="text-gray-500 mb-6">{t('barcode.subtitle')}</p>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex gap-3">
          <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)}
            placeholder={t('barcode.placeholder')}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
            onKeyDown={(e) => e.key === 'Enter' && handleScan()} />
          <button onClick={handleScan} disabled={!barcode.trim() || scanning}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap">
            {scanning ? t('common.scanning') : t('common.scan')}
          </button>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-400 mb-2">{t('barcode.sampleTitle')}</p>
          <div className="flex flex-wrap gap-2">
            {sampleBarcodes.map((sample) => (
              <button key={sample.code} onClick={() => setBarcode(sample.code)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors font-mono cursor-pointer">
                {sample.code} ({sample.label})
              </button>
            ))}
          </div>
        </div>
      </div>

      {scanning && (
        <div className="text-center py-8">
          <div className="text-6xl animate-pulse mb-3">📡</div>
          <p className="text-emerald-700 font-medium">{t('barcode.scanningText')}</p>
          <p className="text-gray-400 text-sm">{t('barcode.scanningSub')}</p>
        </div>
      )}

      {notFound && (
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">{t('barcode.notFound')}</h3>
          <p className="text-gray-500">{t('barcode.notFoundText').replace('{code}', barcode)}</p>
        </div>
      )}

      {result && !scanning && (
        <div className={`rounded-2xl border-2 overflow-hidden ${riskColors[result.riskLevel]}`}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{isAr ? result.nameAr : result.name}</h3>
                <p className="text-lg text-gray-600">{isAr ? result.name : result.nameAr}</p>
                <p className="text-sm text-gray-400 mt-1">{t('barcode.brand')} {result.brand}</p>
              </div>
              <span className={`text-lg font-bold shrink-0 ${
                result.riskLevel === 'red' ? 'text-red-700' :
                result.riskLevel === 'yellow' ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {result.riskLevel === 'red' ? t('barcode.highRisk') :
                 result.riskLevel === 'yellow' ? t('barcode.cautionRisk') : t('barcode.safeRisk')}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">{t('barcode.ingredientsLabel')}</h4>
              <div className="flex flex-wrap gap-2">
                {result.ingredients.map((ingredient) => {
                  const isAllergen = result.allergens.some((a) =>
                    ALLERGY_TYPES.find((at) => at.id === a)?.keywords.some((kw) =>
                      ingredient.toLowerCase().includes(kw.toLowerCase())
                    )
                  )
                  return (
                    <span key={ingredient} className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isAllergen ? 'bg-red-200 text-red-800 border border-red-300' : 'bg-white text-gray-600 border border-gray-200'
                    }`}>
                      {isAllergen && '⚠️ '}{ingredient}
                    </span>
                  )
                })}
              </div>
            </div>

            {result.allergens.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">{t('barcode.containsAllergens')}</h4>
                <div className="flex flex-wrap gap-2">
                  {result.allergens.map((allergenId) => {
                    const allergy = ALLERGY_TYPES.find((a) => a.id === allergenId)
                    const isUserAllergic = selectedAllergies.includes(allergenId)
                    return (
                      <span key={allergenId} className={`px-4 py-2 rounded-full text-sm font-bold ${
                        isUserAllergic ? 'bg-red-600 text-white' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {allergy?.icon} {isAr ? allergy?.labelAr : allergy?.label}
                        {isUserAllergic && t('barcode.youAreAllergic')}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {result.matchedAllergens.length > 0 ? (
              <div className="bg-red-100 rounded-xl p-4 border border-red-300">
                <p className="text-red-800 font-bold text-lg">{t('barcode.dangerMessage')}</p>
                <p className="text-red-600 text-sm mt-1">{t('barcode.dangerSub')}</p>
              </div>
            ) : result.allergens.length > 0 ? (
              <div className="bg-yellow-100 rounded-xl p-4 border border-yellow-300">
                <p className="text-yellow-800 font-bold">{t('barcode.cautionMessage')}</p>
              </div>
            ) : (
              <div className="bg-green-100 rounded-xl p-4 border border-green-300">
                <p className="text-green-800 font-bold">{t('barcode.safeMessage')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
