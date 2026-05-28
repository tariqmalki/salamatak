import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ALLERGY_TYPES, detectAllergens } from '../data/allergens'
import { restaurants } from '../data/restaurants'
import { useLanguage } from '../context/LanguageContext'

export default function Home() {
  const { t, isAr } = useLanguage()

  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('salamatak-allergies', JSON.stringify(selectedAllergies))
  }, [selectedAllergies])

  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const getDishSafety = (dish) => {
    if (selectedAllergies.length === 0) return { level: 'unknown', allergens: [] }
    const found = detectAllergens(dish.ingredients, selectedAllergies)
    if (found.length > 0) return { level: 'danger', allergens: found }
    return { level: 'safe', allergens: [] }
  }

  const safetyColors = {
    danger: 'bg-red-100 text-red-700 border-red-200',
    safe: 'bg-green-100 text-green-700 border-green-200',
    unknown: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-1">{t('home.title')}</h1>
      <p className="text-gray-500 mb-6">{t('home.subtitle')}</p>

      {/* Allergy selector */}
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
              <span>{isAr ? allergy.labelAr : allergy.label}</span>
              {isSelected && <span>✓</span>}
            </button>
          )
        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { to: '/scanner', icon: '📷', label: t('home.menuScanner') },
          { to: '/check-dish', icon: '🍽️', label: t('home.checkDish') },
          { to: '/emergency', icon: '🚨', label: t('home.emergencyCard') },
          { to: '/translator', icon: '🌍', label: t('home.translator') },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all text-center no-underline group"
          >
            <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</div>
            <div className="text-sm font-semibold text-gray-700">{item.label}</div>
          </Link>
        ))}
      </div>

      {/* Restaurants */}
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">{t('home.restaurantsTitle')}</h2>

      <div className="space-y-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{isAr ? restaurant.nameAr : restaurant.name}</h3>
                  <p className="text-sm text-gray-500">{isAr ? restaurant.name : restaurant.nameAr} · {restaurant.cuisine}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  restaurant.safetyLevel === 'green' ? 'bg-green-100 text-green-700' :
                  restaurant.safetyLevel === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {restaurant.safetyLevel === 'green' ? t('home.allergyAware') :
                   restaurant.safetyLevel === 'yellow' ? t('home.caution') : t('home.highRisk')}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {restaurant.menu.map((dish) => {
                const safety = getDishSafety(dish)
                return (
                  <div key={dish.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800">{isAr ? dish.nameAr : dish.name}</div>
                      <div className="text-sm text-gray-400">{isAr ? dish.name : dish.nameAr}</div>
                      <div className="text-xs text-gray-400 mt-1 truncate">{dish.ingredients}</div>
                      {safety.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {safety.allergens.map((a) => (
                            <span key={a.allergyId} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                              {a.icon} {isAr ? a.labelAr : a.label}: {a.matchedKeywords.join(', ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-3 ${isAr ? 'mr-4' : 'ml-4'} shrink-0`}>
                      <span className="text-sm font-medium text-emerald-700">{dish.price} {t('common.sar')}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${safetyColors[safety.level]}`}>
                        {safety.level === 'danger' ? t('common.dangerLabel') :
                         safety.level === 'safe' ? t('common.safeLabel') : t('common.unknownLabel')}
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
