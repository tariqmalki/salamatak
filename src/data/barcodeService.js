import { ALLERGY_TYPES } from './allergens'

/**
 * barcodeService.js - Bilingual product lookup via Open Food Facts API
 *
 * Accepts a `lang` parameter ('ar' or 'en') and returns product data
 * in the matching language. Falls back to the other language if
 * translation is unavailable.
 */

// Common ingredient translations (English → Arabic)
const INGREDIENT_AR = {
  'sugar': 'سكر', 'salt': 'ملح', 'water': 'ماء', 'milk': 'حليب',
  'milk powder': 'حليب مجفف', 'whole milk powder': 'حليب مجفف كامل',
  'skimmed milk powder': 'حليب مجفف منزوع الدسم',
  'cocoa': 'كاكاو', 'cocoa butter': 'زبدة الكاكاو', 'cocoa mass': 'كتلة الكاكاو',
  'cocoa powder': 'مسحوق الكاكاو',
  'chocolate': 'شوكولاتة', 'dark chocolate': 'شوكولاتة داكنة',
  'wheat flour': 'دقيق القمح', 'flour': 'دقيق', 'wheat': 'قمح',
  'palm oil': 'زيت النخيل', 'sunflower oil': 'زيت دوار الشمس',
  'vegetable oil': 'زيت نباتي', 'soybean oil': 'زيت فول الصويا',
  'rapeseed oil': 'زيت الكانولا', 'olive oil': 'زيت الزيتون',
  'butter': 'زبدة', 'cream': 'كريمة', 'cheese': 'جبن',
  'egg': 'بيض', 'eggs': 'بيض', 'egg white': 'بياض البيض',
  'egg yolk': 'صفار البيض',
  'peanut': 'فول سوداني', 'peanuts': 'فول سوداني',
  'hazelnut': 'بندق', 'hazelnuts': 'بندق',
  'almond': 'لوز', 'almonds': 'لوز',
  'walnut': 'جوز', 'walnuts': 'جوز',
  'cashew': 'كاجو', 'pistachio': 'فستق',
  'soy': 'صويا', 'soya': 'صويا', 'soy sauce': 'صوص الصويا',
  'soy lecithin': 'ليسيثين الصويا', 'soya lecithin': 'ليسيثين الصويا',
  'tofu': 'توفو',
  'rice': 'أرز', 'rice flour': 'دقيق الأرز',
  'corn': 'ذرة', 'corn starch': 'نشا الذرة', 'maize': 'ذرة',
  'potato': 'بطاطس', 'potatoes': 'بطاطس', 'potato starch': 'نشا البطاطس',
  'tomato': 'طماطم', 'tomato paste': 'معجون طماطم',
  'onion': 'بصل', 'garlic': 'ثوم',
  'lemon': 'ليمون', 'lemon juice': 'عصير ليمون', 'citric acid': 'حمض الليمون',
  'vinegar': 'خل', 'mustard': 'خردل',
  'sesame': 'سمسم', 'sesame seeds': 'بذور السمسم', 'tahini': 'طحينة',
  'fish': 'سمك', 'tuna': 'تونة', 'salmon': 'سلمون',
  'shrimp': 'ربيان', 'seafood': 'مأكولات بحرية',
  'chicken': 'دجاج', 'beef': 'لحم بقر', 'meat': 'لحم',
  'gelatin': 'جيلاتين', 'honey': 'عسل',
  'vanilla': 'فانيلا', 'cinnamon': 'قرفة', 'pepper': 'فلفل',
  'spices': 'بهارات', 'herbs': 'أعشاب',
  'yeast': 'خميرة', 'baking powder': 'بيكنغ باودر',
  'emulsifier': 'مستحلب', 'stabilizer': 'مثبت', 'preservative': 'مادة حافظة',
  'artificial flavor': 'نكهة صناعية', 'natural flavor': 'نكهة طبيعية',
  'food coloring': 'ملون غذائي', 'caramel': 'كراميل',
  'glucose': 'جلوكوز', 'fructose': 'فركتوز', 'lactose': 'لاكتوز',
  'maltodextrin': 'مالتوديكسترين', 'starch': 'نشا',
  'strawberry': 'فراولة', 'mango': 'مانجو', 'banana': 'موز',
  'apple': 'تفاح', 'orange': 'برتقال',
  'cucumber': 'خيار', 'spinach': 'سبانخ', 'lettuce': 'خس',
  'vitamin d': 'فيتامين د', 'vitamin c': 'فيتامين سي',
  'calcium': 'كالسيوم', 'iron': 'حديد',
  'bread crumbs': 'بقسماط', 'modified starch': 'نشا معدل',
}

function translateIngredient(text, toLang) {
  if (toLang === 'en') return text
  const lower = text.toLowerCase().trim()
  if (INGREDIENT_AR[lower]) return INGREDIENT_AR[lower]
  for (const [en, ar] of Object.entries(INGREDIENT_AR)) {
    if (lower.includes(en)) return lower.replace(en, ar)
  }
  return text
}

// Local fallback database with bilingual data
const localDatabase = {
  '6281000000001': {
    name: 'Almarai Full Cream Milk', nameAr: 'حليب المراعي كامل الدسم',
    brand: 'Almarai', brandAr: 'المراعي',
    ingredients: ['milk', 'vitamin D'],
    ingredientsAr: ['حليب', 'فيتامين د'],
    image: '',
  },
  '6281000000002': {
    name: 'Indomie Instant Noodles', nameAr: 'إندومي نودلز',
    brand: 'Indomie', brandAr: 'إندومي',
    ingredients: ['wheat flour', 'palm oil', 'salt', 'soy sauce', 'spices'],
    ingredientsAr: ['دقيق القمح', 'زيت النخيل', 'ملح', 'صوص الصويا', 'بهارات'],
    image: '',
  },
  '6281000000003': {
    name: 'Galaxy Chocolate Bar', nameAr: 'شوكولاتة جالكسي',
    brand: 'Galaxy', brandAr: 'جالكسي',
    ingredients: ['cocoa', 'milk powder', 'sugar', 'hazelnut', 'emulsifier'],
    ingredientsAr: ['كاكاو', 'حليب مجفف', 'سكر', 'بندق', 'مستحلب'],
    image: '',
  },
  '6281000000005': {
    name: 'Al Rabee Apple Juice', nameAr: 'عصير تفاح الربيع',
    brand: 'Al Rabee', brandAr: 'الربيع',
    ingredients: ['apple concentrate', 'water', 'sugar'],
    ingredientsAr: ['مركز التفاح', 'ماء', 'سكر'],
    image: '',
  },
  '6281000000008': {
    name: 'Americana Chicken Nuggets', nameAr: 'ناغتس أمريكانا',
    brand: 'Americana', brandAr: 'أمريكانا',
    ingredients: ['chicken', 'wheat flour', 'bread crumbs', 'eggs', 'spices'],
    ingredientsAr: ['دجاج', 'دقيق القمح', 'بقسماط', 'بيض', 'بهارات'],
    image: '',
  },
  '6281000000011': {
    name: 'Snickers Bar', nameAr: 'سنيكرز',
    brand: 'Mars', brandAr: 'مارس',
    ingredients: ['chocolate', 'peanut', 'caramel', 'milk', 'sugar', 'egg white'],
    ingredientsAr: ['شوكولاتة', 'فول سوداني', 'كراميل', 'حليب', 'سكر', 'بياض البيض'],
    image: '',
  },
  '6281000000012': {
    name: 'Tuna Can', nameAr: 'تونة معلبة',
    brand: 'Almarai', brandAr: 'المراعي',
    ingredients: ['tuna fish', 'sunflower oil', 'salt'],
    ingredientsAr: ['سمك التونة', 'زيت دوار الشمس', 'ملح'],
    image: '',
  },
}

function parseIngredients(ingredientsText) {
  if (!ingredientsText) return []
  return ingredientsText
    .replace(/_/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .split(/,|;/)
    .map((i) => i.trim())
    .filter((i) => i.length > 0 && i.length < 60)
    .slice(0, 30)
}

function detectAllergyMatches(ingredients, selectedAllergyIds) {
  const fullText = ingredients.join(' ').toLowerCase()
  const matched = []
  ALLERGY_TYPES.forEach((allergy) => {
    if (!selectedAllergyIds.includes(allergy.id)) return
    if (allergy.keywords.some((kw) => fullText.includes(kw.toLowerCase()))) {
      matched.push(allergy.id)
    }
  })
  return matched
}

export function isIngredientAllergen(ingredient, allergenIds) {
  const lower = ingredient.toLowerCase()
  for (const allergenId of allergenIds) {
    const allergy = ALLERGY_TYPES.find((a) => a.id === allergenId)
    if (allergy?.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return allergenId
    }
  }
  return null
}

/**
 * lookupBarcode - Bilingual product lookup
 *
 * @param {string} barcodeNumber
 * @param {string[]} selectedAllergyIds
 * @param {string} lang - 'ar' or 'en'
 */
export async function lookupBarcode(barcodeNumber, selectedAllergyIds, lang = 'en') {
  const code = barcodeNumber.trim()
  const isAr = lang === 'ar'

  // Try Open Food Facts API first
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
      { signal: AbortSignal.timeout(8000) }
    )
    const data = await response.json()

    if (data.status === 1 && data.product) {
      const p = data.product

      // Pick name in preferred language, fallback to other
      const name = isAr
        ? (p.product_name_ar || p.product_name || p.product_name_en || 'منتج غير معروف')
        : (p.product_name_en || p.product_name || 'Unknown Product')
      const brand = p.brands || (isAr ? 'علامة غير معروفة' : 'Unknown Brand')
      const image = p.image_front_small_url || p.image_url || ''

      // Parse ingredients - try Arabic first if Arabic is selected
      let ingredients = []
      let ingredientsRaw = [] // always English for allergy matching
      if (isAr && p.ingredients_text_ar) {
        ingredients = parseIngredients(p.ingredients_text_ar)
      }
      // Always get English/default for allergy keyword matching
      if (p.ingredients_text) {
        ingredientsRaw = parseIngredients(p.ingredients_text)
      } else if (p.ingredients_text_en) {
        ingredientsRaw = parseIngredients(p.ingredients_text_en)
      } else if (p.ingredients) {
        ingredientsRaw = p.ingredients.map((i) => i.text || '').filter(Boolean).slice(0, 30)
      }

      // If no Arabic ingredients from API, translate the English ones
      if (isAr && ingredients.length === 0 && ingredientsRaw.length > 0) {
        ingredients = ingredientsRaw.map((i) => translateIngredient(i, 'ar'))
      }
      // If English mode, use raw
      if (!isAr) {
        ingredients = ingredientsRaw.map((i) => i.toLowerCase())
      }

      // Allergy detection always uses English raw keywords
      const rawForMatching = ingredientsRaw.length > 0
        ? ingredientsRaw
        : ingredients
      const detectedFromIngredients = detectAllergyMatches(
        rawForMatching.map((i) => i.toLowerCase()),
        selectedAllergyIds
      )

      const apiAllergenText = (p.allergens_tags || []).join(' ').toLowerCase()
      const detectedFromTags = []
      ALLERGY_TYPES.forEach((allergy) => {
        if (!selectedAllergyIds.includes(allergy.id)) return
        if (detectedFromIngredients.includes(allergy.id)) return
        if (allergy.keywords.some((kw) => apiAllergenText.includes(kw.toLowerCase()))) {
          detectedFromTags.push(allergy.id)
        }
      })

      return {
        source: 'api',
        name,
        brand,
        image,
        ingredients,
        matchedAllergenIds: [...new Set([...detectedFromIngredients, ...detectedFromTags])],
      }
    }
  } catch {
    // API failed
  }

  // Fallback: local database
  const local = localDatabase[code]
  if (local) {
    const displayIngredients = isAr ? local.ingredientsAr : local.ingredients
    const allDetected = detectAllergyMatches(local.ingredients, selectedAllergyIds)
    return {
      source: 'local',
      name: isAr ? local.nameAr : local.name,
      brand: isAr ? local.brandAr : local.brand,
      image: local.image,
      ingredients: displayIngredients,
      matchedAllergenIds: allDetected,
    }
  }

  return null
}
