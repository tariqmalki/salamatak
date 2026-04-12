import { useState } from 'react'
import { ALLERGY_TYPES } from '../data/allergens'

/**
 * Kids Mode - Simplified visual interface for children
 *
 * Features:
 * - Large icons instead of text for easy understanding
 * - Big toggle buttons for selecting allergies
 * - Color-coded food grid:
 *   Green background + ✔️ = Safe to eat
 *   Red background + ❌ = NOT safe to eat
 * - Common food items mapped to allergen categories
 * - Fun, kid-friendly design with big elements
 * - Legend at the bottom explaining the symbols
 *
 * Example display:
 *   🥛 ❌  (milk - not safe if allergic)
 *   🥜 ❌  (nuts - not safe if allergic)
 *   🍞 ✔   (bread - safe if only nut allergy)
 */
export default function KidsMode() {
  // Load saved allergy preferences
  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts', 'milk']
  })

  // Toggle an allergy on/off
  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  // Common food items with their allergen associations
  // Each food maps to one or more allergen categories
  const foodItems = [
    { name: 'Milk', icon: '🥛', allergens: ['milk'] },
    { name: 'Cheese', icon: '🧀', allergens: ['milk'] },
    { name: 'Bread', icon: '🍞', allergens: ['gluten'] },
    { name: 'Cookies', icon: '🍪', allergens: ['gluten', 'eggs', 'milk'] },
    { name: 'Peanuts', icon: '🥜', allergens: ['nuts'] },
    { name: 'Shrimp', icon: '🦐', allergens: ['seafood'] },
    { name: 'Fish', icon: '🐟', allergens: ['seafood'] },
    { name: 'Eggs', icon: '🥚', allergens: ['eggs'] },
    { name: 'Cake', icon: '🎂', allergens: ['gluten', 'eggs', 'milk'] },
    { name: 'Rice', icon: '🍚', allergens: [] },
    { name: 'Banana', icon: '🍌', allergens: [] },
    { name: 'Apple', icon: '🍎', allergens: [] },
    { name: 'Chicken', icon: '🍗', allergens: [] },
    { name: 'Salad', icon: '🥗', allergens: [] },
    { name: 'Juice', icon: '🧃', allergens: [] },
    { name: 'Water', icon: '💧', allergens: [] },
    { name: 'Pizza', icon: '🍕', allergens: ['gluten', 'milk'] },
    { name: 'Ice Cream', icon: '🍦', allergens: ['milk', 'eggs'] },
    { name: 'Chocolate', icon: '🍫', allergens: ['milk', 'nuts'] },
    { name: 'Pasta', icon: '🍝', allergens: ['gluten'] },
    { name: 'Soup', icon: '🍲', allergens: [] },
    { name: 'Honey', icon: '🍯', allergens: [] },
    { name: 'Yogurt', icon: '🥄', allergens: ['milk'] },
    { name: 'Butter', icon: '🧈', allergens: ['milk'] },
  ]

  // Check if a food is safe based on the user's selected allergies
  // Safe = none of the food's allergens match the user's allergies
  const isFoodSafe = (food) => {
    return !food.allergens.some((a) => selectedAllergies.includes(a))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Fun header for kids - large and colorful */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">👶</div>
        <h1 className="text-4xl font-extrabold text-emerald-800">Kids Mode</h1>
        <h2 className="text-2xl text-emerald-600 font-bold">وضع الأطفال</h2>
        <p className="text-gray-500 mt-2 text-lg">Tap foods to see if they're safe!</p>
        <p className="text-gray-400" dir="rtl">اضغط على الأطعمة لمعرفة إذا كانت آمنة!</p>
      </div>

      {/* Allergy selector - extra large buttons for kids */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-xl font-bold text-gray-700 text-center mb-4">
          I'm allergic to: / أنا عندي حساسية من:
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {ALLERGY_TYPES.map((allergy) => {
            const isSelected = selectedAllergies.includes(allergy.id)
            return (
              <button
                key={allergy.id}
                onClick={() => toggleAllergy(allergy.id)}
                className={`flex flex-col items-center p-4 rounded-2xl border-3 text-center transition-all w-24 cursor-pointer ${
                  isSelected
                    ? 'bg-red-100 border-red-400 shadow-md scale-110'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-4xl mb-1">{allergy.icon}</span>
                <span className={`text-xs font-bold ${isSelected ? 'text-red-600' : 'text-gray-500'}`}>
                  {isSelected ? '❌ NO!' : allergy.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Food grid - large icons in a responsive grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {foodItems.map((food) => {
          const safe = isFoodSafe(food)
          return (
            <div
              key={food.name}
              className={`relative rounded-2xl p-4 text-center border-2 transition-all hover:scale-105 ${
                safe
                  ? 'bg-green-50 border-green-300 hover:bg-green-100'
                  : 'bg-red-50 border-red-300 hover:bg-red-100'
              }`}
            >
              {/* Large food emoji icon */}
              <div className="text-5xl mb-2">{food.icon}</div>

              {/* Safe (✔️) or Unsafe (❌) indicator */}
              <div className={`text-2xl ${safe ? 'text-green-500' : 'text-red-500'}`}>
                {safe ? '✔️' : '❌'}
              </div>

              {/* Food name - small text below */}
              <div className={`text-xs font-bold mt-1 ${safe ? 'text-green-700' : 'text-red-700'}`}>
                {food.name}
              </div>

              {/* Warning overlay for unsafe foods */}
              {!safe && (
                <div className="absolute top-1 right-1">
                  <span className="text-lg">⛔</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend explaining the symbols */}
      <div className="flex justify-center gap-8 mt-8 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-lg">
          <span className="text-2xl">✔️</span>
          <span className="font-bold text-green-700">Safe! آمن</span>
        </div>
        <div className="flex items-center gap-2 text-lg">
          <span className="text-2xl">❌</span>
          <span className="font-bold text-red-700">Not Safe! غير آمن</span>
        </div>
      </div>
    </div>
  )
}
