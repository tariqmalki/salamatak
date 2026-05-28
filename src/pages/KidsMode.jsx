import { useState } from 'react'
import { ALLERGY_TYPES } from '../data/allergens'
import { useLanguage } from '../context/LanguageContext'

export default function KidsMode() {
  const { t, isAr } = useLanguage()

  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts', 'milk']
  })

  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const foodItems = [
    { name: isAr ? 'حليب' : 'Milk', icon: '🥛', allergens: ['milk'] },
    { name: isAr ? 'جبن' : 'Cheese', icon: '🧀', allergens: ['milk'] },
    { name: isAr ? 'خبز' : 'Bread', icon: '🍞', allergens: ['gluten'] },
    { name: isAr ? 'كوكيز' : 'Cookies', icon: '🍪', allergens: ['gluten', 'eggs', 'milk'] },
    { name: isAr ? 'فول سوداني' : 'Peanuts', icon: '🥜', allergens: ['nuts'] },
    { name: isAr ? 'ربيان' : 'Shrimp', icon: '🦐', allergens: ['seafood'] },
    { name: isAr ? 'سمك' : 'Fish', icon: '🐟', allergens: ['seafood'] },
    { name: isAr ? 'بيض' : 'Eggs', icon: '🥚', allergens: ['eggs'] },
    { name: isAr ? 'كيك' : 'Cake', icon: '🎂', allergens: ['gluten', 'eggs', 'milk'] },
    { name: isAr ? 'أرز' : 'Rice', icon: '🍚', allergens: [] },
    { name: isAr ? 'موز' : 'Banana', icon: '🍌', allergens: [] },
    { name: isAr ? 'تفاح' : 'Apple', icon: '🍎', allergens: [] },
    { name: isAr ? 'دجاج' : 'Chicken', icon: '🍗', allergens: [] },
    { name: isAr ? 'سلطة' : 'Salad', icon: '🥗', allergens: [] },
    { name: isAr ? 'عصير' : 'Juice', icon: '🧃', allergens: [] },
    { name: isAr ? 'ماء' : 'Water', icon: '💧', allergens: [] },
    { name: isAr ? 'بيتزا' : 'Pizza', icon: '🍕', allergens: ['gluten', 'milk'] },
    { name: isAr ? 'آيس كريم' : 'Ice Cream', icon: '🍦', allergens: ['milk', 'eggs'] },
    { name: isAr ? 'شوكولاتة' : 'Chocolate', icon: '🍫', allergens: ['milk', 'nuts'] },
    { name: isAr ? 'معكرونة' : 'Pasta', icon: '🍝', allergens: ['gluten'] },
    { name: isAr ? 'شوربة' : 'Soup', icon: '🍲', allergens: [] },
    { name: isAr ? 'عسل' : 'Honey', icon: '🍯', allergens: [] },
    { name: isAr ? 'زبادي' : 'Yogurt', icon: '🥄', allergens: ['milk'] },
    { name: isAr ? 'زبدة' : 'Butter', icon: '🧈', allergens: ['milk'] },
  ]

  const isFoodSafe = (food) => !food.allergens.some((a) => selectedAllergies.includes(a))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">👶</div>
        <h1 className="text-4xl font-extrabold text-emerald-800">{t('kidsMode.title')}</h1>
        <h2 className="text-2xl text-emerald-600 font-bold">{t('kidsMode.titleEn')}</h2>
        <p className="text-gray-500 mt-2 text-lg">{t('kidsMode.subtitle')}</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-xl font-bold text-gray-700 text-center mb-4">{t('kidsMode.allergicTo')}</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {ALLERGY_TYPES.map((allergy) => {
            const isSelected = selectedAllergies.includes(allergy.id)
            return (
              <button key={allergy.id} onClick={() => toggleAllergy(allergy.id)}
                className={`flex flex-col items-center p-4 rounded-2xl border-3 text-center transition-all w-24 cursor-pointer ${
                  isSelected ? 'bg-red-100 border-red-400 shadow-md scale-110' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}>
                <span className="text-4xl mb-1">{allergy.icon}</span>
                <span className={`text-xs font-bold ${isSelected ? 'text-red-600' : 'text-gray-500'}`}>
                  {isSelected ? t('kidsMode.no') : (isAr ? allergy.labelAr : allergy.label)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {foodItems.map((food) => {
          const safe = isFoodSafe(food)
          return (
            <div key={food.name}
              className={`relative rounded-2xl p-4 text-center border-2 transition-all hover:scale-105 ${
                safe ? 'bg-green-50 border-green-300 hover:bg-green-100' : 'bg-red-50 border-red-300 hover:bg-red-100'
              }`}>
              <div className="text-5xl mb-2">{food.icon}</div>
              <div className={`text-2xl ${safe ? 'text-green-500' : 'text-red-500'}`}>
                {safe ? '✔️' : '❌'}
              </div>
              <div className={`text-xs font-bold mt-1 ${safe ? 'text-green-700' : 'text-red-700'}`}>{food.name}</div>
              {!safe && <div className="absolute top-1 right-1"><span className="text-lg">⛔</span></div>}
            </div>
          )
        })}
      </div>

      <div className="flex justify-center gap-8 mt-8 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-lg">
          <span className="text-2xl">✔️</span>
          <span className="font-bold text-green-700">{t('kidsMode.safeLegend')}</span>
        </div>
        <div className="flex items-center gap-2 text-lg">
          <span className="text-2xl">❌</span>
          <span className="font-bold text-red-700">{t('kidsMode.unsafeLegend')}</span>
        </div>
      </div>
    </div>
  )
}
