import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ALLERGY_TYPES, detectAllergens } from '../data/allergens'
import { restaurants } from '../data/restaurants'

// Home page - allergy filter system + restaurant/menu browsing
export default function Home() {
  // Load saved allergies from localStorage, or default to empty
  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : []
  })

  // Save allergy preferences whenever they change
  useEffect(() => {
    localStorage.setItem('salamatak-allergies', JSON.stringify(selectedAllergies))
  }, [selectedAllergies])

  // Toggle an allergy on/off
  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  // Check if a dish is safe based on selected allergies
  const getDishSafety = (dish) => {
    if (selectedAllergies.length === 0) return { level: 'unknown', allergens: [] }
    const found = detectAllergens(dish.ingredients, selectedAllergies)
    if (found.length > 0) return { level: 'danger', allergens: found }
    return { level: 'safe', allergens: [] }
  }

  // Safety badge colors
  const safetyColors = {
    danger: 'bg-red-100 text-red-700 border-red-200',
    safe: 'bg-green-100 text-green-700 border-green-200',
    unknown: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  const safetyLabels = {
    danger: '🟥 Contains Allergens',
    safe: '🟩 Safe',
    unknown: '⬜ Select allergies to check',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page title */}
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">Your Allergy Profile</h1>
      <p className="text-gray-500 mb-6">Select your allergies to filter restaurants and meals</p>

      {/* Allergy selector cards */}
      <div className="flex flex-wrap gap-3 mb-8">
        {ALLERGY_TYPES.map((allergy) => {
          const isSelected = selectedAllergies.includes(allergy.id)
          return (
            <button
              key={allergy.id}
              onClick={() => toggleAllergy(allergy.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full border-2 text-base font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
              }`}
            >
              <span className="text-xl">{allergy.icon}</span>
              <span>{allergy.label}</span>
              <span className="text-sm opacity-75">{allergy.labelAr}</span>
              {isSelected && <span>✓</span>}
            </button>
          )
        })}
      </div>

      {/* Quick links to other features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { to: '/scanner', icon: '📷', label: 'Menu Scanner' },
          { to: '/check-dish', icon: '🍽️', label: 'Check a Dish' },
          { to: '/emergency', icon: '🚨', label: 'Emergency Card' },
          { to: '/translator', icon: '🌍', label: 'Translator' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center no-underline"
          >
            <div className="text-3xl mb-1">{item.icon}</div>
            <div className="text-sm font-medium text-gray-700">{item.label}</div>
          </Link>
        ))}
      </div>

      {/* Restaurant list with filtered menus */}
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">Restaurants & Menus</h2>

      <div className="space-y-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Restaurant header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>
                  <p className="text-sm text-gray-500">
                    {restaurant.nameAr} · {restaurant.cuisine}
                  </p>
                </div>
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

            {/* Menu items */}
            <div className="divide-y divide-gray-50">
              {restaurant.menu.map((dish) => {
                const safety = getDishSafety(dish)
                return (
                  <div key={dish.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{dish.name}</div>
                      <div className="text-sm text-gray-400">{dish.nameAr}</div>
                      <div className="text-xs text-gray-400 mt-1">{dish.ingredients}</div>
                      {/* Show which allergens were found */}
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
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-sm font-medium text-emerald-700">{dish.price} SAR</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${safetyColors[safety.level]}`}>
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
