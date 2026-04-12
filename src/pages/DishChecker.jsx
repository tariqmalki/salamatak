import { useState } from 'react'
import { ALLERGY_TYPES, detectAllergens } from '../data/allergens'
import { restaurants } from '../data/restaurants'

/**
 * Dish Checker - IMPORTANT FEATURE
 *
 * Allows users to check if a specific dish at a specific restaurant
 * is safe for their allergies. This is the core safety feature.
 *
 * How it works:
 * 1. User enters a restaurant name and dish name
 * 2. Optionally uploads a photo of the dish
 * 3. App first checks its database for an exact match
 * 4. If found, uses actual ingredient data for analysis
 * 5. If not found, uses keyword matching on the dish name
 *    (e.g., "peanut", "almond", "cream" trigger warnings)
 * 6. Shows results: 🚫 DANGEROUS, ⚠️ CAUTION, or ✅ SAFE
 */
export default function DishChecker() {
  // Load user's saved allergy preferences
  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts']
  })
  const [restaurantName, setRestaurantName] = useState('')  // Restaurant input
  const [dishName, setDishName] = useState('')              // Dish name input
  const [imagePreview, setImagePreview] = useState(null)    // Optional dish photo
  const [result, setResult] = useState(null)                // Check result
  const [checking, setChecking] = useState(false)           // Loading state

  // Handle optional dish image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  // Main check function - simulates AI analysis
  const handleCheck = () => {
    setChecking(true)

    // Simulate a 1.5 second "AI processing" delay
    setTimeout(() => {
      const lowerRestaurant = restaurantName.toLowerCase()
      const lowerDish = dishName.toLowerCase()

      let matchedDish = null

      // Step 1: Try to find an exact match in our restaurant database
      for (const restaurant of restaurants) {
        if (restaurant.name.toLowerCase().includes(lowerRestaurant) ||
            restaurant.nameAr.includes(restaurantName)) {
          for (const dish of restaurant.menu) {
            if (dish.name.toLowerCase().includes(lowerDish) ||
                dish.nameAr.includes(dishName)) {
              matchedDish = { ...dish, restaurantName: restaurant.name }
              break
            }
          }
          if (matchedDish) break
        }
      }

      if (matchedDish) {
        // Found in database - use actual ingredient data for accurate results
        const allergens = detectAllergens(matchedDish.ingredients, selectedAllergies)
        setResult({
          found: true,
          dishName: matchedDish.name,
          restaurant: matchedDish.restaurantName,
          ingredients: matchedDish.ingredients,
          allergens,
          level: allergens.length > 0 ? 'danger' : 'safe',
        })
      } else {
        // Step 2: Not in database - fall back to keyword matching
        const combinedText = `${restaurantName} ${dishName}`
        const allergens = detectAllergens(combinedText, selectedAllergies)

        // Check for risky keywords that suggest hidden allergens
        const riskyKeywords = ['sauce', 'cream', 'special', 'secret', 'mixed', 'assorted', 'dressing']
        const hasRiskyKeyword = riskyKeywords.some((kw) => lowerDish.includes(kw))

        let level = 'safe'
        if (allergens.length > 0) level = 'danger'
        else if (hasRiskyKeyword) level = 'warning'

        setResult({
          found: false,
          dishName,
          restaurant: restaurantName,
          ingredients: null,
          allergens,
          level,
          hasRiskyKeyword,
        })
      }

      setChecking(false)
    }, 1500)
  }

  // Toggle allergy selection
  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  // Quick-fill restaurant name suggestions from our database
  const suggestions = restaurants.map((r) => r.name)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">🍽️ Dish Checker</h1>
      <p className="text-gray-500 mb-1">Enter a restaurant and dish to check if it's safe for you</p>
      <p className="text-gray-400 text-sm mb-6" dir="rtl">أدخل اسم المطعم والطبق للتحقق من سلامته</p>

      {/* Allergy selection */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Your allergies:</h3>
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

      {/* Input form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        {/* Restaurant name input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant Name <span className="text-gray-400">اسم المطعم</span>
          </label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="e.g., Al Baik, Kudu, Shawarmer..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-base"
          />
          {/* Quick suggestion buttons for known restaurants */}
          <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.map((name) => (
              <button
                key={name}
                onClick={() => setRestaurantName(name)}
                className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Dish name input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dish Name <span className="text-gray-400">اسم الطبق</span>
          </label>
          <input
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder="e.g., Chicken Nuggets, Nutella Crepe..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-base"
          />
        </div>

        {/* Optional image upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image (optional) <span className="text-gray-400">رفع صورة</span>
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-block bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-5 py-2 rounded-xl transition-colors">
              📷 Choose Photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="Dish" className="h-16 w-16 rounded-xl object-cover shadow" />
            )}
          </div>
        </div>

        {/* Check button - disabled until both fields are filled */}
        <button
          onClick={handleCheck}
          disabled={!dishName.trim() || !restaurantName.trim() || checking || selectedAllergies.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-all text-lg cursor-pointer active:scale-[0.98]"
        >
          {checking ? '🔍 Checking...' : '🔍 Check This Dish'}
        </button>
      </div>

      {/* Checking animation */}
      {checking && (
        <div className="text-center py-6">
          <div className="text-5xl animate-pulse mb-3">🤖</div>
          <p className="text-emerald-700 font-medium">Analyzing dish ingredients...</p>
          <p className="text-gray-400 text-sm" dir="rtl">جاري تحليل مكونات الطبق...</p>
        </div>
      )}

      {/* Result card - shown after check completes */}
      {result && !checking && (
        <div className={`rounded-2xl p-6 border-2 ${
          result.level === 'danger' ? 'bg-red-50 border-red-300' :
          result.level === 'warning' ? 'bg-yellow-50 border-yellow-300' :
          'bg-green-50 border-green-300'
        }`}>
          {/* Result header with big icon */}
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">
              {result.level === 'danger' ? '🚫' : result.level === 'warning' ? '⚠️' : '✅'}
            </div>
            <h3 className={`text-2xl font-bold ${
              result.level === 'danger' ? 'text-red-700' :
              result.level === 'warning' ? 'text-yellow-700' :
              'text-green-700'
            }`}>
              {result.level === 'danger' ? 'DANGEROUS - Contains Allergens!' :
               result.level === 'warning' ? 'CAUTION - May Contain Allergens' :
               'SAFE - No Allergens Detected'}
            </h3>
            {/* Arabic translation of result */}
            <p className={`text-lg mt-1 ${
              result.level === 'danger' ? 'text-red-600' :
              result.level === 'warning' ? 'text-yellow-600' :
              'text-green-600'
            }`} dir="rtl">
              {result.level === 'danger' ? '!خطر - يحتوي على مسببات الحساسية' :
               result.level === 'warning' ? 'تحذير - قد يحتوي على مسببات الحساسية' :
               'آمن - لم يتم اكتشاف مسببات حساسية'}
            </p>
          </div>

          {/* Dish details */}
          <div className="space-y-2 text-sm">
            <p><strong>Restaurant:</strong> {result.restaurant}</p>
            <p><strong>Dish:</strong> {result.dishName}</p>
            {result.ingredients && <p><strong>Ingredients:</strong> {result.ingredients}</p>}
            {!result.found && (
              <p className="text-gray-500 italic">
                This dish was not found in our database. Results are based on keyword analysis.
              </p>
            )}
          </div>

          {/* Detected allergen details */}
          {result.allergens.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-red-700 mb-2">Detected Allergens:</h4>
              <div className="space-y-2">
                {result.allergens.map((a) => (
                  <div key={a.allergyId} className="bg-red-100 rounded-lg px-4 py-2 flex items-center gap-2">
                    <span className="text-xl">{a.icon}</span>
                    <span className="font-medium">{a.label}</span>
                    <span className="text-red-600 text-xs">({a.matchedKeywords.join(', ')})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning for risky keywords */}
          {result.hasRiskyKeyword && result.level === 'warning' && (
            <p className="mt-4 text-yellow-700 text-sm">
              This dish contains words like "sauce", "cream", or "special" which may contain hidden allergens. Please ask the restaurant staff.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
