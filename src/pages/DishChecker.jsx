import { useState } from 'react'
import { ALLERGY_TYPES, detectAllergens } from '../data/allergens'
import { restaurants } from '../data/restaurants'
import { useLanguage } from '../context/LanguageContext'

/**
 * Dish Checker - Check if a specific dish is safe for user's allergies.
 * Fully bilingual (Arabic RTL / English LTR) via LanguageContext.
 */
export default function DishChecker() {
  const { t, isAr } = useLanguage()

  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts']
  })
  const [restaurantName, setRestaurantName] = useState('')
  const [dishName, setDishName] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [result, setResult] = useState(null)
  const [checking, setChecking] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleCheck = () => {
    setChecking(true)
    setTimeout(() => {
      const lowerRestaurant = restaurantName.toLowerCase()
      const lowerDish = dishName.toLowerCase()
      let matchedDish = null

      for (const restaurant of restaurants) {
        if (restaurant.name.toLowerCase().includes(lowerRestaurant) ||
            restaurant.nameAr.includes(restaurantName)) {
          for (const dish of restaurant.menu) {
            if (dish.name.toLowerCase().includes(lowerDish) ||
                dish.nameAr.includes(dishName)) {
              matchedDish = {
                ...dish,
                restaurantName: restaurant.name,
                restaurantNameAr: restaurant.nameAr,
              }
              break
            }
          }
          if (matchedDish) break
        }
      }

      if (matchedDish) {
        const allergens = detectAllergens(matchedDish.ingredients, selectedAllergies)
        setResult({
          found: true,
          dishName: isAr ? matchedDish.nameAr : matchedDish.name,
          restaurant: isAr ? matchedDish.restaurantNameAr : matchedDish.restaurantName,
          ingredients: matchedDish.ingredients,
          allergens,
          level: allergens.length > 0 ? 'danger' : 'safe',
        })
      } else {
        const combinedText = `${restaurantName} ${dishName}`
        const allergens = detectAllergens(combinedText, selectedAllergies)
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

  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const suggestions = restaurants.map((r) => isAr ? r.nameAr : r.name)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">{t('dishChecker.title')}</h1>
      <p className="text-gray-500 mb-6">{t('dishChecker.subtitle')}</p>

      {/* Allergy selection */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">{t('common.allergicTo')}</h3>
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

      {/* Input form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dishChecker.restaurantLabel')}
          </label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder={t('dishChecker.restaurantPlaceholder')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-base"
          />
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dishChecker.dishLabel')}
          </label>
          <input
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder={t('dishChecker.dishPlaceholder')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 text-base"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dishChecker.uploadLabel')}
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-block bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-5 py-2 rounded-xl transition-colors">
              {t('dishChecker.choosePhoto')}
              <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="Dish" className="h-16 w-16 rounded-xl object-cover shadow" />
            )}
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={!dishName.trim() || !restaurantName.trim() || checking || selectedAllergies.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-all text-lg cursor-pointer active:scale-[0.98]"
        >
          {checking ? t('dishChecker.checkingBtn') : t('dishChecker.checkButton')}
        </button>
      </div>

      {checking && (
        <div className="text-center py-6">
          <div className="text-5xl animate-pulse mb-3">🤖</div>
          <p className="text-emerald-700 font-medium">{t('dishChecker.analyzing')}</p>
        </div>
      )}

      {result && !checking && (
        <div className={`rounded-2xl p-6 border-2 ${
          result.level === 'danger' ? 'bg-red-50 border-red-300' :
          result.level === 'warning' ? 'bg-yellow-50 border-yellow-300' :
          'bg-green-50 border-green-300'
        }`}>
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">
              {result.level === 'danger' ? '🚫' : result.level === 'warning' ? '⚠️' : '✅'}
            </div>
            <h3 className={`text-2xl font-bold ${
              result.level === 'danger' ? 'text-red-700' :
              result.level === 'warning' ? 'text-yellow-700' : 'text-green-700'
            }`}>
              {result.level === 'danger' ? t('dishChecker.dangerResult') :
               result.level === 'warning' ? t('dishChecker.warningResult') :
               t('dishChecker.safeResult')}
            </h3>
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>{t('dishChecker.restaurant')}</strong> {result.restaurant}</p>
            <p><strong>{t('dishChecker.dish')}</strong> {result.dishName}</p>
            {result.ingredients && <p><strong>{t('dishChecker.ingredients')}</strong> {result.ingredients}</p>}
            {!result.found && <p className="text-gray-500 italic">{t('dishChecker.notInDb')}</p>}
          </div>

          {result.allergens.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-red-700 mb-2">{t('dishChecker.detectedAllergens')}</h4>
              <div className="space-y-2">
                {result.allergens.map((a) => (
                  <div key={a.allergyId} className="bg-red-100 rounded-lg px-4 py-2 flex items-center gap-2">
                    <span className="text-xl">{a.icon}</span>
                    <span className="font-medium">{isAr ? a.labelAr : a.label}</span>
                    <span className="text-red-600 text-xs">({a.matchedKeywords.join(', ')})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.hasRiskyKeyword && result.level === 'warning' && (
            <p className="mt-4 text-yellow-700 text-sm">{t('dishChecker.riskyWarning')}</p>
          )}
        </div>
      )}
    </div>
  )
}
