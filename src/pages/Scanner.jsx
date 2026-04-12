import { useState } from 'react'
import { ALLERGY_TYPES, detectAllergens } from '../data/allergens'

/**
 * Smart Menu Scanner - AI-based menu image analyzer
 *
 * Features:
 * - User uploads or captures a photo of a restaurant menu
 * - "AI" analyzes the image (simulated with mock data)
 * - Results are color-coded:
 *   🟥 Dangerous - contains allergens
 *   🟨 Possibly contains allergens (sauces/dressings)
 *   🟩 Safe - no allergens detected
 * - Shows which specific ingredient caused the risk
 *
 * Note: Since we can't use real AI APIs, we simulate the analysis
 * using a predefined set of menu items with known ingredients.
 */
export default function Scanner() {
  // Load user's allergy preferences from localStorage
  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts']
  })
  const [imagePreview, setImagePreview] = useState(null)  // Preview of uploaded image
  const [scanning, setScanning] = useState(false)          // Loading state during "scan"
  const [results, setResults] = useState(null)             // Scan results

  // Simulated menu items that the "AI" would detect from a menu image
  // In a real app, this would come from an image recognition API
  const simulatedMenuItems = [
    { name: 'Grilled Chicken with Rice', description: 'chicken, basmati rice, grilled vegetables, garlic sauce' },
    { name: 'Caesar Salad', description: 'lettuce, croutons, parmesan cheese, egg-based caesar dressing, anchovy' },
    { name: 'Pasta Alfredo', description: 'fettuccine pasta, cream sauce, butter, parmesan cheese, flour' },
    { name: 'Chocolate Brownie', description: 'chocolate, flour, eggs, butter, walnut pieces, cream' },
    { name: 'Fresh Fruit Juice', description: 'mixed fruits, water, sugar' },
    { name: 'Shrimp Tempura', description: 'shrimp, tempura batter, flour, soy sauce' },
    { name: 'Hummus & Pita', description: 'chickpeas, tahini, olive oil, pita bread' },
    { name: 'Nutella Pancakes', description: 'flour pancakes, nutella, hazelnut, banana, cream' },
  ]

  // Handle image upload from camera or file picker
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Read the image file and create a preview URL
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
      setResults(null) // Clear previous results
    }
  }

  // Simulate AI scanning of the menu image
  const handleScan = () => {
    setScanning(true)
    // Simulate a 2-second delay for "AI processing"
    setTimeout(() => {
      // Analyze each simulated menu item for allergens
      const analyzed = simulatedMenuItems.map((item) => {
        const allergens = detectAllergens(item.description, selectedAllergies)
        let level = 'safe'
        if (allergens.length > 0) {
          level = 'danger' // Known allergens found
        } else if (item.description.includes('sauce') || item.description.includes('dressing')) {
          level = 'warning' // Sauces/dressings might contain hidden allergens
        }
        return { ...item, allergens, level }
      })
      setResults(analyzed)
      setScanning(false)
    }, 2000)
  }

  // Toggle an allergy on/off
  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  // Styling for each risk level
  const levelStyles = {
    danger: { bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', label: '🟥 Dangerous' },
    warning: { bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', label: '🟨 Possibly Contains Allergens' },
    safe: { bg: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', label: '🟩 Safe' },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">📷 Smart Menu Scanner</h1>
      <p className="text-gray-500 mb-1">Upload a menu photo and our AI will analyze it for allergens</p>
      <p className="text-gray-400 text-sm mb-6" dir="rtl">ارفع صورة القائمة وسيقوم الذكاء الاصطناعي بتحليلها</p>

      {/* Allergy selection - what to scan for */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Check for these allergies:</h3>
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
              {allergy.icon} {allergy.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image upload area */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6 text-center">
        {imagePreview ? (
          // Image has been uploaded - show preview and scan button
          <div>
            <img
              src={imagePreview}
              alt="Menu preview"
              className="max-h-64 mx-auto rounded-xl mb-4 shadow-md"
            />
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={handleScan}
                disabled={scanning || selectedAllergies.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold px-8 py-3 rounded-full transition-all cursor-pointer"
              >
                {scanning ? '🔍 Analyzing...' : '🔍 Scan for Allergens'}
              </button>
              <button
                onClick={() => { setImagePreview(null); setResults(null) }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-6 py-3 rounded-full transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          // No image yet - show upload prompt
          <label className="cursor-pointer block">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-500 mb-2">Tap to upload a menu photo</p>
            <p className="text-gray-400 text-sm mb-4" dir="rtl">اضغط لرفع صورة القائمة</p>
            <div className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-full transition-all">
              Upload Image
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Scanning animation - shown while "AI" processes */}
      {scanning && (
        <div className="text-center py-8">
          <div className="text-5xl animate-pulse mb-4">🤖</div>
          <p className="text-emerald-700 font-medium">AI is analyzing the menu...</p>
          <p className="text-gray-400 text-sm">Detecting ingredients and checking for allergens</p>
          <p className="text-gray-400 text-xs mt-1" dir="rtl">جاري تحليل المكونات والتحقق من المواد المسببة للحساسية</p>
        </div>
      )}

      {/* Scan results - displayed after analysis */}
      {results && !scanning && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Scan Results
            <span className="text-gray-400 font-normal text-base ml-2">نتائج الفحص</span>
          </h2>
          <div className="space-y-3">
            {results.map((item, index) => {
              const style = levelStyles[item.level]
              return (
                <div key={index} className={`rounded-xl p-4 border ${style.bg} hover:shadow-sm transition-shadow`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      {/* Show specific allergens that were detected */}
                      {item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.allergens.map((a) => (
                            <span key={a.allergyId} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              {a.icon} {a.label}: {a.matchedKeywords.join(', ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Safety badge */}
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
