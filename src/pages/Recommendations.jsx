import { useState, useMemo } from 'react'
import { ALLERGY_TYPES, detectAllergens } from '../data/allergens'
import { restaurants } from '../data/restaurants'

/**
 * AI Meal Recommendations - Suggests safe dishes based on user's allergies
 *
 * Features:
 * - Filters all dishes from all restaurants
 * - Only shows dishes that are FREE of the user's selected allergens
 * - Displays results in a clean grid with restaurant info
 * - Shows dish price and restaurant safety level
 * - Uses useMemo for efficient re-computation when allergies change
 *
 * This simulates an AI recommendation engine by filtering the dataset.
 */
export default function Recommendations() {
  // Load user's saved allergy preferences
  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts']
  })

  // Compute safe dishes - recalculates only when allergies change
  const safeDishes = useMemo(() => {
    if (selectedAllergies.length === 0) return []

    const results = []
    // Go through every restaurant and every dish
    restaurants.forEach((restaurant) => {
      restaurant.menu.forEach((dish) => {
        // Check if this dish contains any of the user's allergens
        const allergens = detectAllergens(dish.ingredients, selectedAllergies)
        // Only include dishes with ZERO allergen matches
        if (allergens.length === 0) {
          results.push({
            ...dish,
            restaurantName: restaurant.name,
            restaurantNameAr: restaurant.nameAr,
            safetyLevel: restaurant.safetyLevel,
          })
        }
      })
    })
    return results
  }, [selectedAllergies])

  // Toggle allergy selection
  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">✅ Safe Meal Recommendations</h1>
      <p className="text-gray-500 mb-1">AI-powered suggestions for dishes that are safe for your allergies</p>
      <p className="text-gray-400 text-sm mb-6" dir="rtl">توصيات ذكية بوجبات آمنة لحساسيتك</p>

      {/* Allergy selection */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">I'm allergic to:</h3>
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

      {/* Results summary - shows count of safe dishes found */}
      {selectedAllergies.length > 0 && (
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 mb-6 flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <p className="font-semibold text-emerald-800">
              Found {safeDishes.length} safe dishes for you!
            </p>
            <p className="text-sm text-emerald-600">
              These dishes don't contain any of your selected allergens
            </p>
          </div>
        </div>
      )}

      {/* Dish cards grid */}
      {selectedAllergies.length === 0 ? (
        // No allergies selected prompt
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">👆</div>
          <p>Select at least one allergy to see recommendations</p>
          <p className="text-sm" dir="rtl">اختر حساسية واحدة على الأقل لمشاهدة التوصيات</p>
        </div>
      ) : safeDishes.length === 0 ? (
        // No safe dishes found
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">😔</div>
          <p>No safe dishes found for your combination of allergies</p>
          <p className="text-sm" dir="rtl">لم يتم العثور على أطباق آمنة لمجموعة حساسيتك</p>
        </div>
      ) : (
        // Display safe dishes in a responsive grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 hover:shadow-md transition-shadow"
            >
              {/* Dish name + safety badge */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-gray-800">{dish.name}</h4>
                  <p className="text-sm text-gray-500">{dish.nameAr}</p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold shrink-0">
                  ✅ SAFE
                </span>
              </div>

              {/* Restaurant info */}
              <div className="text-sm text-gray-500 mb-3">
                📍 {dish.restaurantName} ({dish.restaurantNameAr})
              </div>

              {/* Ingredients */}
              <div className="text-xs text-gray-400 mb-3">
                {dish.ingredients}
              </div>

              {/* Price and restaurant safety level */}
              <div className="flex items-center justify-between">
                <span className="text-emerald-700 font-bold">{dish.price} SAR</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  dish.safetyLevel === 'green' ? 'bg-green-100 text-green-600' :
                  dish.safetyLevel === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {dish.safetyLevel === 'green' ? '🟢 Allergy-Aware Restaurant' :
                   dish.safetyLevel === 'yellow' ? '🟡 Caution' : '🔴 Ask Staff'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
