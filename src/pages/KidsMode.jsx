import { useState } from 'react'
import { ALLERGY_TYPES } from '../data/allergens'
import { useLanguage } from '../context/LanguageContext'

/**
 * Safety-first allergen mapping for Kids Mode
 *
 * Each food lists:
 *   - allergens: confirmed/direct allergens
 *   - commonlyContains: ingredients commonly found in this food category
 *     (recipes, dressings, sauces, garnishes, preparation methods)
 *
 * If a user's allergy matches EITHER list, the food is marked unsafe.
 * When in doubt, exclude rather than show. Child safety is the priority.
 */
const FOOD_ITEMS = [
  { id: 'milk', icon: '🥛',
    allergens: ['milk'],
    commonlyContains: [] },
  { id: 'cheese', icon: '🧀',
    allergens: ['milk'],
    commonlyContains: [] },
  { id: 'bread', icon: '🍞',
    allergens: ['gluten', 'soya'],
    commonlyContains: ['eggs', 'milk', 'sesame'] },
  { id: 'cookies', icon: '🍪',
    allergens: ['gluten', 'eggs', 'milk'],
    commonlyContains: ['nuts', 'hazelnut', 'chocolate', 'soya'] },
  { id: 'peanuts', icon: '🥜',
    allergens: ['nuts'],
    commonlyContains: [] },
  { id: 'shrimp', icon: '🦐',
    allergens: ['seafood'],
    commonlyContains: ['gluten', 'soya', 'eggs'] },
  { id: 'fish', icon: '🐟',
    allergens: ['seafood', 'tuna'],
    commonlyContains: ['lemon', 'gluten', 'eggs'] },
  { id: 'eggs', icon: '🥚',
    allergens: ['eggs'],
    commonlyContains: [] },
  { id: 'cake', icon: '🎂',
    allergens: ['gluten', 'eggs', 'milk'],
    commonlyContains: ['nuts', 'hazelnut', 'chocolate', 'soya', 'strawberry'] },
  { id: 'rice', icon: '🍚',
    allergens: [],
    commonlyContains: ['soya'] },
  { id: 'banana', icon: '🍌',
    allergens: [],
    commonlyContains: [] },
  { id: 'apple', icon: '🍎',
    allergens: [],
    commonlyContains: [] },
  { id: 'chicken', icon: '🍗',
    allergens: [],
    commonlyContains: ['gluten', 'eggs', 'soya', 'lemon'] },
  { id: 'salad', icon: '🥗',
    allergens: ['lettuce'],
    commonlyContains: ['cucumber', 'lemon', 'sesame', 'nuts', 'eggs', 'milk', 'tuna'] },
  { id: 'juice', icon: '🧃',
    allergens: [],
    commonlyContains: ['strawberry', 'mango', 'lemon'] },
  { id: 'water', icon: '💧',
    allergens: [],
    commonlyContains: [] },
  { id: 'pizza', icon: '🍕',
    allergens: ['gluten', 'milk'],
    commonlyContains: ['eggs', 'soya', 'sesame', 'seafood', 'spinach', 'potato'] },
  { id: 'icecream', icon: '🍦',
    allergens: ['milk', 'eggs'],
    commonlyContains: ['nuts', 'hazelnut', 'chocolate', 'strawberry', 'mango'] },
  { id: 'chocolate', icon: '🍫',
    allergens: ['chocolate', 'milk'],
    commonlyContains: ['nuts', 'hazelnut', 'soya', 'gluten', 'eggs'] },
  { id: 'pasta', icon: '🍝',
    allergens: ['gluten'],
    commonlyContains: ['eggs', 'milk', 'soya', 'seafood', 'lemon'] },
  { id: 'soup', icon: '🍲',
    allergens: [],
    commonlyContains: ['milk', 'gluten', 'potato', 'lemon', 'spinach', 'soya', 'sesame'] },
  { id: 'honey', icon: '🍯',
    allergens: [],
    commonlyContains: [] },
  { id: 'yogurt', icon: '🥄',
    allergens: ['milk'],
    commonlyContains: ['strawberry', 'mango'] },
  { id: 'butter', icon: '🧈',
    allergens: ['milk'],
    commonlyContains: [] },
  { id: 'fries', icon: '🍟',
    allergens: ['potato'],
    commonlyContains: ['soya', 'gluten'] },
  { id: 'hamburger', icon: '🍔',
    allergens: ['gluten'],
    commonlyContains: ['milk', 'eggs', 'sesame', 'lettuce', 'cucumber', 'potato', 'soya'] },
  { id: 'hotdog', icon: '🌭',
    allergens: ['gluten'],
    commonlyContains: ['milk', 'soya', 'sesame'] },
  { id: 'strawberryFruit', icon: '🍓',
    allergens: ['strawberry'],
    commonlyContains: [] },
  { id: 'mangoFruit', icon: '🥭',
    allergens: ['mango'],
    commonlyContains: [] },
  { id: 'lemonFruit', icon: '🍋',
    allergens: ['lemon'],
    commonlyContains: [] },
  { id: 'cucumberItem', icon: '🥒',
    allergens: ['cucumber'],
    commonlyContains: [] },
  { id: 'spinachItem', icon: '🥬',
    allergens: ['spinach'],
    commonlyContains: [] },
  { id: 'tunaItem', icon: '🐟',
    allergens: ['tuna', 'seafood'],
    commonlyContains: ['lemon', 'eggs'] },
  { id: 'nutella', icon: '🫙',
    allergens: ['hazelnut', 'nuts', 'chocolate', 'milk'],
    commonlyContains: ['soya'] },
  { id: 'potatoItem', icon: '🥔',
    allergens: ['potato'],
    commonlyContains: [] },
  { id: 'sandwich', icon: '🥪',
    allergens: ['gluten'],
    commonlyContains: ['milk', 'eggs', 'lettuce', 'cucumber', 'sesame', 'soya', 'tuna'] },
]

// Display names for each food ID
const FOOD_NAMES = {
  milk: { en: 'Milk', ar: 'حليب' },
  cheese: { en: 'Cheese', ar: 'جبن' },
  bread: { en: 'Bread', ar: 'خبز' },
  cookies: { en: 'Cookies', ar: 'كوكيز' },
  peanuts: { en: 'Peanuts', ar: 'فول سوداني' },
  shrimp: { en: 'Shrimp', ar: 'ربيان' },
  fish: { en: 'Fish', ar: 'سمك' },
  eggs: { en: 'Eggs', ar: 'بيض' },
  cake: { en: 'Cake', ar: 'كيك' },
  rice: { en: 'Rice', ar: 'أرز' },
  banana: { en: 'Banana', ar: 'موز' },
  apple: { en: 'Apple', ar: 'تفاح' },
  chicken: { en: 'Chicken', ar: 'دجاج' },
  salad: { en: 'Salad', ar: 'سلطة' },
  juice: { en: 'Juice', ar: 'عصير' },
  water: { en: 'Water', ar: 'ماء' },
  pizza: { en: 'Pizza', ar: 'بيتزا' },
  icecream: { en: 'Ice Cream', ar: 'آيس كريم' },
  chocolate: { en: 'Chocolate', ar: 'شوكولاتة' },
  pasta: { en: 'Pasta', ar: 'معكرونة' },
  soup: { en: 'Soup', ar: 'شوربة' },
  honey: { en: 'Honey', ar: 'عسل' },
  yogurt: { en: 'Yogurt', ar: 'زبادي' },
  butter: { en: 'Butter', ar: 'زبدة' },
  fries: { en: 'Fries', ar: 'بطاطس مقلية' },
  hamburger: { en: 'Burger', ar: 'برجر' },
  hotdog: { en: 'Hot Dog', ar: 'هوت دوج' },
  strawberryFruit: { en: 'Strawberry', ar: 'فراولة' },
  mangoFruit: { en: 'Mango', ar: 'مانجو' },
  lemonFruit: { en: 'Lemon', ar: 'ليمون' },
  cucumberItem: { en: 'Cucumber', ar: 'خيار' },
  spinachItem: { en: 'Spinach', ar: 'سبانخ' },
  tunaItem: { en: 'Tuna', ar: 'تونة' },
  nutella: { en: 'Nutella', ar: 'نوتيلا' },
  potatoItem: { en: 'Potato', ar: 'بطاطس' },
  sandwich: { en: 'Sandwich', ar: 'ساندويتش' },
}

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

  // Safety-first check: unsafe if ANY selected allergy appears in
  // either the confirmed allergens OR the commonlyContains list
  const getFoodSafety = (food) => {
    const directMatch = food.allergens.filter((a) => selectedAllergies.includes(a))
    const commonMatch = food.commonlyContains.filter((a) => selectedAllergies.includes(a))
    const allMatches = [...new Set([...directMatch, ...commonMatch])]

    if (allMatches.length === 0) return { safe: true, reason: null, matches: [] }

    const isDirect = directMatch.length > 0
    return {
      safe: false,
      reason: isDirect ? 'direct' : 'common',
      matches: allMatches,
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">👶</div>
        <h1 className="text-4xl font-extrabold text-emerald-800">{t('kidsMode.title')}</h1>
        <h2 className="text-2xl text-emerald-600 font-bold">{t('kidsMode.titleEn')}</h2>
        <p className="text-gray-500 mt-2 text-lg">{t('kidsMode.subtitle')}</p>
      </div>

      {/* Allergy selector */}
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

      {/* Food grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {FOOD_ITEMS.map((food) => {
          const safety = getFoodSafety(food)
          const name = FOOD_NAMES[food.id]
          return (
            <div key={food.id}
              className={`relative rounded-2xl p-4 text-center border-2 transition-all hover:scale-105 ${
                safety.safe
                  ? 'bg-green-50 border-green-300 hover:bg-green-100'
                  : safety.reason === 'direct'
                    ? 'bg-red-50 border-red-300 hover:bg-red-100'
                    : 'bg-orange-50 border-orange-300 hover:bg-orange-100'
              }`}>
              <div className="text-5xl mb-2">{food.icon}</div>
              <div className={`text-2xl ${
                safety.safe ? 'text-green-500' :
                safety.reason === 'direct' ? 'text-red-500' : 'text-orange-500'
              }`}>
                {safety.safe ? '✔️' : '❌'}
              </div>
              <div className={`text-xs font-bold mt-1 ${
                safety.safe ? 'text-green-700' :
                safety.reason === 'direct' ? 'text-red-700' : 'text-orange-700'
              }`}>
                {name ? (isAr ? name.ar : name.en) : food.id}
              </div>
              {/* Show matched allergy icons on unsafe foods */}
              {!safety.safe && (
                <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                  <span className="text-lg">{safety.reason === 'direct' ? '⛔' : '⚠️'}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-8 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 text-lg">
          <span className="text-2xl">✔️</span>
          <span className="font-bold text-green-700">{t('kidsMode.safeLegend')}</span>
        </div>
        <div className="flex items-center gap-2 text-lg">
          <span className="text-2xl">⛔</span>
          <span className="font-bold text-red-700">
            {isAr ? 'يحتوي على مسبب حساسية' : 'Contains allergen'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-lg">
          <span className="text-2xl">⚠️</span>
          <span className="font-bold text-orange-700">
            {isAr ? 'غالباً يحتوي على مسبب حساسية' : 'Likely contains allergen'}
          </span>
        </div>
      </div>
    </div>
  )
}
