import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ALLERGY_TYPES, detectAllergens } from '../data/allergens'
import { restaurants } from '../data/restaurants'

/**
 * Home Page - Main dashboard with allergy filter system
 *
 * Features:
 * - Allergy selector (toggle buttons for 5 allergy types)
 * - Persists user's allergy preferences to localStorage
 * - Filters restaurants and meals based on selected allergies
 * - Color-coded safety labels (🟥 Danger, 🟩 Safe, ⬜ Unknown)
 * - Quick-access links to other features
 * - Shows which specific ingredients triggered the allergen warning
 */
export default function Home() {
  // Load saved allergies from localStorage, or default to empty array
  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : []
  })

  // Persist allergy preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('salamatak-allergies', JSON.stringify(selectedAllergies))
  }, [selectedAllergies])

  // Toggle an allergy on or off when user clicks a button
  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  // Check if a dish is safe based on the user's selected allergies
  const getDishSafety = (dish) => {
    // If no allergies selected, we can't determine safety
    if (selectedAllergies.length === 0) return { level: 'unknown', allergens: [] }
    // Use the detectAllergens helper to check ingredients
    const found = detectAllergens(dish.ingredients, selectedAllergies)
    if (found.length > 0) return { level: 'danger', allergens: found }
    return { level: 'safe', allergens: [] }
  }

  // CSS classes for each safety level
  const safetyColors = {
    danger: 'bg-red-100 text-red-700 border-red-200',
    safe: 'bg-green-100 text-green-700 border-green-200',
    unknown: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  // Labels for each safety level
  const safetyLabels = {
    danger: '🟥 Contains Allergens',
    safe: '🟩 Safe',
    unknown: '⬜ Select allergies to check',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page title */}
      <h1 className="text-3xl font-bold text-emerald-800 mb-1">Your Allergy Profile</h1>
      <p className="text-gray-500 mb-6">
        Select your allergies to filter restaurants and meals
        <span className="text-gray-400 mx-2">|</span>
        <span dir="rtl">اختر أنواع حساسيتك</span>
      </p>

      {/* Allergy selector - toggle buttons for each allergy type */}
      <div className="flex flex-wrap gap-3 mb-8">
        {ALLERGY_TYPES.map((allergy) => {
          const isSelected = selectedAllergies.includes(allergy.id)
          return (
            <button
              key={allergy.id}
              onClick={() => toggleAllergy(allergy.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full border-2 text-base font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:shadow-sm'
              }`}
            >
              <span className="text-xl">{allergy.icon}</span>
              <span>{allergy.label}</span>
              <span className="text-sm opacity-75">{allergy.labelAr}</span>
              {isSelected && <span className="ml-1">✓</span>}
            </button>
          )
        })}
      </div>

      {/* Quick-access feature links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { to: '/scanner', icon: '📷', label: 'Menu Scanner', labelAr: 'ماسح القائمة' },
          { to: '/check-dish', icon: '🍽️', label: 'Check a Dish', labelAr: 'فحص طبق' },
          { to: '/emergency', icon: '🚨', label: 'Emergency Card', labelAr: 'بطاقة الطوارئ' },
          { to: '/translator', icon: '🌍', label: 'Translator', labelAr: 'مترجم' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all text-center no-underline group"
          >
            <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</div>
            <div className="text-sm font-semibold text-gray-700">{item.label}</div>
            <div className="text-xs text-gray-400">{item.labelAr}</div>
          </Link>
        ))}
      </div>

      {/* Restaurant list with filtered menus */}
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">
        Restaurants & Menus
        <span className="text-lg text-gray-400 font-normal ml-2">المطاعم والقوائم</span>
      </h2>

      <div className="space-y-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Restaurant header with name and safety badge */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>
                  <p className="text-sm text-gray-500">
                    {restaurant.nameAr} · {restaurant.cuisine}
                  </p>
                </div>
                {/* Restaurant safety level badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    restaurant.safetyLevel === 'green'
                      ? 'bg-green-100 text-green-700'
                      : restaurant.safetyLevel === 'yellow'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {restaurant.safetyLevel === 'green' ? '🟢 Allergy-Aware' :
                   restaurant.safetyLevel === 'yellow' ? '🟡 Caution' : '🔴 High Risk'}
                </span>
              </div>
            </div>

            {/* Individual menu items with allergen detection */}
            <div className="divide-y divide-gray-50">
              {restaurant.menu.map((dish) => {
                const safety = getDishSafety(dish)
                return (
                  <div key={dish.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800">{dish.name}</div>
                      <div className="text-sm text-gray-400">{dish.nameAr}</div>
                      <div className="text-xs text-gray-400 mt-1 truncate">{dish.ingredients}</div>
                      {/* Show which specific allergens were found in this dish */}
                      {safety.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {safety.allergens.map((a) => (
                            <span key={a.allergyId} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                              {a.icon} {a.label}: {a.matchedKeywords.join(', ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <span className="text-sm font-medium text-emerald-700">{dish.price} SAR</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${safetyColors[safety.level]}`}>
                        {safetyLabels[safety.level]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
