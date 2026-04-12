import { useState } from 'react'
import { barcodeDatabase } from '../data/barcodes'
import { ALLERGY_TYPES } from '../data/allergens'

/**
 * Barcode Scanner (Simulated) - Look up products by barcode number
 *
 * Features:
 * - User enters a barcode number (or picks from samples)
 * - App looks up the product in a simulated database
 * - Shows product name, brand, ingredients, and allergens
 * - Color-coded risk level (Red/Yellow/Green)
 * - Highlights ingredients that are allergens
 * - Personalized danger warning if product matches user's allergies
 *
 * Note: This is a simulated scanner. In a real app, this would use
 * the device camera to scan actual barcodes.
 */
export default function BarcodeScanner() {
  const [barcode, setBarcode] = useState('')         // Barcode input
  const [result, setResult] = useState(null)         // Lookup result
  const [scanning, setScanning] = useState(false)    // Loading state
  const [notFound, setNotFound] = useState(false)    // Product not in database

  // Load user's allergy preferences
  const [selectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts']
  })

  // Look up the barcode in our simulated database
  const handleScan = () => {
    if (!barcode.trim()) return

    setScanning(true)
    setNotFound(false)
    setResult(null)

    // Simulate a 1.5 second scanning delay
    setTimeout(() => {
      const product = barcodeDatabase[barcode.trim()]
      if (product) {
        // Product found - check if any allergens match user's profile
        const matchedAllergens = product.allergens.filter((a) =>
          selectedAllergies.includes(a)
        )
        setResult({ ...product, matchedAllergens })
      } else {
        setNotFound(true)
      }
      setScanning(false)
    }, 1500)
  }

  // Quick-fill sample barcodes for easy testing
  const sampleBarcodes = [
    { code: '6281000000001', label: 'Almarai Milk' },
    { code: '6281000000003', label: 'Galaxy Chocolate' },
    { code: '6281000000005', label: 'Al Rabee Juice' },
    { code: '6281000000008', label: 'Americana Nuggets' },
    { code: '6281000000011', label: 'Snickers Bar' },
    { code: '6281000000012', label: 'Tuna Can' },
  ]

  // Color styles for each risk level
  const riskColors = {
    red: 'bg-red-50 border-red-300',
    yellow: 'bg-yellow-50 border-yellow-300',
    green: 'bg-green-50 border-green-300',
  }

  const riskLabels = {
    red: { text: '🟥 HIGH RISK', color: 'text-red-700' },
    yellow: { text: '🟨 CAUTION', color: 'text-yellow-700' },
    green: { text: '🟩 SAFE', color: 'text-green-700' },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">📊 Barcode Scanner</h1>
      <p className="text-gray-500 mb-1">Enter a product barcode to check ingredients and allergens</p>
      <p className="text-gray-400 text-sm mb-6" dir="rtl">أدخل رقم الباركود للتحقق من المكونات والمواد المسببة للحساسية</p>

      {/* Barcode input area */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode number..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
          <button
            onClick={handleScan}
            disabled={!barcode.trim() || scanning}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            {scanning ? '🔍...' : '🔍 Scan'}
          </button>
        </div>

        {/* Sample barcodes for testing */}
        <div className="mt-4">
          <p className="text-xs text-gray-400 mb-2">Try these sample barcodes:</p>
          <div className="flex flex-wrap gap-2">
            {sampleBarcodes.map((sample) => (
              <button
                key={sample.code}
                onClick={() => setBarcode(sample.code)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors font-mono cursor-pointer"
              >
                {sample.code} ({sample.label})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scanning animation */}
      {scanning && (
        <div className="text-center py-8">
          <div className="text-6xl animate-pulse mb-3">📡</div>
          <p className="text-emerald-700 font-medium">Scanning barcode...</p>
          <p className="text-gray-400 text-sm">Looking up product database</p>
        </div>
      )}

      {/* Product not found message */}
      {notFound && (
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Product Not Found</h3>
          <p className="text-gray-500">
            Barcode "{barcode}" is not in our database. Try one of the sample barcodes above.
          </p>
        </div>
      )}

      {/* Product result card */}
      {result && !scanning && (
        <div className={`rounded-2xl border-2 overflow-hidden ${riskColors[result.riskLevel]}`}>
          <div className="p-6">
            {/* Product header - name, Arabic name, brand */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{result.name}</h3>
                <p className="text-lg text-gray-600">{result.nameAr}</p>
                <p className="text-sm text-gray-400 mt-1">Brand: {result.brand}</p>
              </div>
              {/* Risk level badge */}
              <span className={`text-xl font-bold shrink-0 ${riskLabels[result.riskLevel].color}`}>
                {riskLabels[result.riskLevel].text}
              </span>
            </div>

            {/* Ingredients list - highlights allergen ingredients */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Ingredients:</h4>
              <div className="flex flex-wrap gap-2">
                {result.ingredients.map((ingredient) => {
                  // Check if this ingredient is an allergen
                  const isAllergen = result.allergens.some((a) =>
                    ALLERGY_TYPES.find((at) => at.id === a)?.keywords.some((kw) =>
                      ingredient.toLowerCase().includes(kw.toLowerCase())
                    )
                  )
                  return (
                    <span
                      key={ingredient}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isAllergen
                          ? 'bg-red-200 text-red-800 border border-red-300'
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      {isAllergen && '⚠️ '}{ingredient}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Allergen warnings */}
            {result.allergens.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Contains these allergens:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.allergens.map((allergenId) => {
                    const allergy = ALLERGY_TYPES.find((a) => a.id === allergenId)
                    const isUserAllergic = selectedAllergies.includes(allergenId)
                    return (
                      <span
                        key={allergenId}
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                          isUserAllergic
                            ? 'bg-red-600 text-white'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {allergy?.icon} {allergy?.label}
                        {isUserAllergic && ' - YOU ARE ALLERGIC!'}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Personalized risk assessment based on user's allergies */}
            {result.matchedAllergens.length > 0 ? (
              <div className="bg-red-100 rounded-xl p-4 border border-red-300">
                <p className="text-red-800 font-bold text-lg">
                  🚫 DANGER: This product contains allergens you are allergic to!
                </p>
                <p className="text-red-600 text-sm mt-1">
                  Do not consume this product. / لا تتناول هذا المنتج
                </p>
              </div>
            ) : result.allergens.length > 0 ? (
              <div className="bg-yellow-100 rounded-xl p-4 border border-yellow-300">
                <p className="text-yellow-800 font-bold">
                  ⚠️ This product contains allergens, but none that match your profile.
                </p>
              </div>
            ) : (
              <div className="bg-green-100 rounded-xl p-4 border border-green-300">
                <p className="text-green-800 font-bold">
                  ✅ This product appears safe for your allergies!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
