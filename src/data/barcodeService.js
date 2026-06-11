import { ALLERGY_TYPES } from './allergens'

/**
 * barcodeService.js - Barcode product lookup with Arabic-first ingredients
 *
 * Ingredients are ALWAYS returned in Arabic regardless of app language.
 * English raw text is kept separately for allergy keyword matching.
 * Retries API up to 2 times on failure before falling back to local DB.
 */

// Comprehensive English → Arabic ingredient dictionary
const INGREDIENT_AR = {
  'sugar': 'سكر', 'cane sugar': 'سكر القصب', 'brown sugar': 'سكر بني',
  'powdered sugar': 'سكر بودرة', 'icing sugar': 'سكر ناعم',
  'salt': 'ملح', 'sea salt': 'ملح البحر', 'iodized salt': 'ملح معالج باليود',
  'water': 'ماء', 'mineral water': 'ماء معدني',
  'milk': 'حليب', 'whole milk': 'حليب كامل الدسم', 'skim milk': 'حليب منزوع الدسم',
  'milk powder': 'حليب مجفف', 'whole milk powder': 'حليب مجفف كامل',
  'skimmed milk powder': 'حليب مجفف منزوع الدسم', 'condensed milk': 'حليب مكثف',
  'buttermilk': 'لبن', 'whey': 'مصل اللبن', 'whey powder': 'مسحوق مصل اللبن',
  'lactose': 'لاكتوز', 'casein': 'كازين',
  'cocoa': 'كاكاو', 'cocoa butter': 'زبدة الكاكاو', 'cocoa mass': 'كتلة الكاكاو',
  'cocoa powder': 'مسحوق الكاكاو', 'cocoa paste': 'عجينة الكاكاو',
  'chocolate': 'شوكولاتة', 'dark chocolate': 'شوكولاتة داكنة',
  'milk chocolate': 'شوكولاتة بالحليب', 'white chocolate': 'شوكولاتة بيضاء',
  'wheat flour': 'دقيق القمح', 'flour': 'دقيق', 'wheat': 'قمح',
  'enriched flour': 'دقيق مدعم', 'self-raising flour': 'دقيق ذاتي الرفع',
  'semolina': 'سميد', 'durum wheat': 'قمح صلب',
  'palm oil': 'زيت النخيل', 'palm fat': 'دهن النخيل',
  'sunflower oil': 'زيت دوار الشمس', 'sunflower lecithin': 'ليسيثين دوار الشمس',
  'vegetable oil': 'زيت نباتي', 'vegetable fat': 'دهن نباتي',
  'soybean oil': 'زيت فول الصويا', 'canola oil': 'زيت الكانولا',
  'rapeseed oil': 'زيت الكانولا', 'coconut oil': 'زيت جوز الهند',
  'olive oil': 'زيت الزيتون', 'corn oil': 'زيت الذرة',
  'butter': 'زبدة', 'butter oil': 'زيت الزبدة', 'ghee': 'سمن',
  'cream': 'كريمة', 'heavy cream': 'كريمة ثقيلة', 'sour cream': 'كريمة حامضة',
  'cheese': 'جبن', 'cream cheese': 'جبن كريمي', 'cheddar': 'شيدر',
  'mozzarella': 'موزاريلا', 'parmesan': 'بارميزان', 'yogurt': 'زبادي',
  'egg': 'بيض', 'eggs': 'بيض', 'egg white': 'بياض البيض', 'egg powder': 'مسحوق البيض',
  'egg yolk': 'صفار البيض', 'dried egg': 'بيض مجفف', 'whole egg': 'بيض كامل',
  'peanut': 'فول سوداني', 'peanuts': 'فول سوداني', 'peanut butter': 'زبدة الفول السوداني',
  'hazelnut': 'بندق', 'hazelnuts': 'بندق', 'hazelnut paste': 'معجون البندق',
  'almond': 'لوز', 'almonds': 'لوز', 'almond paste': 'معجون اللوز',
  'walnut': 'جوز', 'walnuts': 'جوز', 'cashew': 'كاجو', 'cashews': 'كاجو',
  'pistachio': 'فستق', 'pistachios': 'فستق', 'macadamia': 'مكاديميا',
  'pecan': 'بيكان', 'pecans': 'بيكان', 'nut': 'مكسرات', 'nuts': 'مكسرات',
  'tree nuts': 'مكسرات شجرية', 'mixed nuts': 'مكسرات مشكلة',
  'soy': 'صويا', 'soya': 'صويا', 'soybeans': 'فول الصويا',
  'soy sauce': 'صوص الصويا', 'soy protein': 'بروتين الصويا',
  'soy lecithin': 'ليسيثين الصويا', 'soya lecithin': 'ليسيثين الصويا',
  'soy flour': 'دقيق الصويا', 'tofu': 'توفو', 'edamame': 'إدامامي',
  'rice': 'أرز', 'rice flour': 'دقيق الأرز', 'rice starch': 'نشا الأرز',
  'corn': 'ذرة', 'corn starch': 'نشا الذرة', 'cornstarch': 'نشا الذرة',
  'corn syrup': 'شراب الذرة', 'maize': 'ذرة', 'maize starch': 'نشا الذرة',
  'potato': 'بطاطس', 'potatoes': 'بطاطس', 'potato starch': 'نشا البطاطس',
  'potato flakes': 'رقائق البطاطس',
  'tomato': 'طماطم', 'tomato paste': 'معجون طماطم', 'tomato powder': 'مسحوق الطماطم',
  'tomato sauce': 'صوص الطماطم', 'tomato puree': 'بيوريه الطماطم',
  'onion': 'بصل', 'onion powder': 'مسحوق البصل',
  'garlic': 'ثوم', 'garlic powder': 'مسحوق الثوم',
  'lemon': 'ليمون', 'lemon juice': 'عصير ليمون', 'lemon peel': 'قشر الليمون',
  'lime': 'ليمون أخضر', 'citric acid': 'حمض الليمون', 'citrus': 'حمضيات',
  'vinegar': 'خل', 'white vinegar': 'خل أبيض', 'apple cider vinegar': 'خل التفاح',
  'mustard': 'خردل', 'mustard seed': 'بذور الخردل',
  'sesame': 'سمسم', 'sesame seeds': 'بذور السمسم', 'sesame oil': 'زيت السمسم',
  'tahini': 'طحينة', 'hummus': 'حمص',
  'fish': 'سمك', 'tuna': 'تونة', 'tuna fish': 'سمك التونة',
  'salmon': 'سلمون', 'anchovy': 'أنشوجة', 'sardine': 'سردين',
  'shrimp': 'ربيان', 'prawns': 'جمبري', 'seafood': 'مأكولات بحرية',
  'crab': 'سلطعون', 'lobster': 'كركند', 'squid': 'حبار', 'calamari': 'كاليماري',
  'chicken': 'دجاج', 'chicken meat': 'لحم دجاج',
  'beef': 'لحم بقر', 'meat': 'لحم', 'lamb': 'لحم غنم',
  'pork': 'لحم خنزير', 'bacon': 'لحم مقدد',
  'gelatin': 'جيلاتين', 'collagen': 'كولاجين',
  'honey': 'عسل', 'maple syrup': 'شراب القيقب', 'molasses': 'دبس',
  'vanilla': 'فانيلا', 'vanilla extract': 'خلاصة الفانيلا', 'vanillin': 'فانيلين',
  'cinnamon': 'قرفة', 'ginger': 'زنجبيل', 'turmeric': 'كركم',
  'pepper': 'فلفل', 'black pepper': 'فلفل أسود', 'white pepper': 'فلفل أبيض',
  'chili': 'فلفل حار', 'paprika': 'بابريكا', 'cumin': 'كمون',
  'cardamom': 'هيل', 'clove': 'قرنفل', 'nutmeg': 'جوزة الطيب',
  'saffron': 'زعفران', 'thyme': 'زعتر', 'oregano': 'أوريغانو',
  'basil': 'ريحان', 'parsley': 'بقدونس', 'mint': 'نعناع',
  'spices': 'بهارات', 'herbs': 'أعشاب', 'seasoning': 'توابل',
  'yeast': 'خميرة', 'baking powder': 'بيكنغ باودر', 'baking soda': 'بيكربونات الصوديوم',
  'emulsifier': 'مستحلب', 'emulsifiers': 'مستحلبات',
  'stabilizer': 'مثبت', 'stabilizers': 'مثبتات',
  'preservative': 'مادة حافظة', 'preservatives': 'مواد حافظة',
  'antioxidant': 'مضاد أكسدة', 'antioxidants': 'مضادات الأكسدة',
  'artificial flavor': 'نكهة صناعية', 'natural flavor': 'نكهة طبيعية',
  'flavoring': 'منكهات', 'flavourings': 'منكهات', 'aroma': 'عطر',
  'food coloring': 'ملون غذائي', 'color': 'لون', 'colours': 'ألوان',
  'caramel': 'كراميل', 'caramel color': 'لون الكراميل',
  'glucose': 'جلوكوز', 'glucose syrup': 'شراب الجلوكوز',
  'fructose': 'فركتوز', 'high fructose corn syrup': 'شراب الذرة عالي الفركتوز',
  'dextrose': 'دكستروز', 'sucrose': 'سكروز', 'invert sugar': 'سكر محول',
  'maltodextrin': 'مالتوديكسترين', 'starch': 'نشا', 'modified starch': 'نشا معدل',
  'pectin': 'بكتين', 'agar': 'أجار', 'carrageenan': 'كاراجينان',
  'guar gum': 'صمغ الغوار', 'xanthan gum': 'صمغ الزانتان',
  'lecithin': 'ليسيثين', 'mono and diglycerides': 'أحادي وثنائي الجليسريد',
  'sodium bicarbonate': 'بيكربونات الصوديوم',
  'calcium carbonate': 'كربونات الكالسيوم',
  'ascorbic acid': 'حمض الأسكوربيك', 'acetic acid': 'حمض الخليك',
  'lactic acid': 'حمض اللاكتيك', 'malic acid': 'حمض الماليك',
  'phosphoric acid': 'حمض الفوسفوريك',
  'strawberry': 'فراولة', 'strawberries': 'فراولة',
  'mango': 'مانجو', 'banana': 'موز', 'apple': 'تفاح', 'orange': 'برتقال',
  'grape': 'عنب', 'raspberry': 'توت', 'blueberry': 'توت أزرق',
  'cherry': 'كرز', 'peach': 'خوخ', 'pineapple': 'أناناس', 'coconut': 'جوز الهند',
  'cucumber': 'خيار', 'spinach': 'سبانخ', 'lettuce': 'خس',
  'carrot': 'جزر', 'celery': 'كرفس', 'broccoli': 'بروكلي',
  'vitamin d': 'فيتامين د', 'vitamin c': 'فيتامين سي', 'vitamin a': 'فيتامين أ',
  'vitamin e': 'فيتامين هـ', 'vitamin b': 'فيتامين ب',
  'folic acid': 'حمض الفوليك', 'niacin': 'نياسين', 'riboflavin': 'ريبوفلافين',
  'thiamine': 'ثيامين', 'biotin': 'بيوتين',
  'calcium': 'كالسيوم', 'iron': 'حديد', 'zinc': 'زنك', 'magnesium': 'مغنيسيوم',
  'potassium': 'بوتاسيوم', 'sodium': 'صوديوم', 'phosphorus': 'فسفور',
  'bread crumbs': 'بقسماط', 'breadcrumbs': 'بقسماط',
  'carbonated water': 'ماء غازي', 'sparkling water': 'ماء فوار',
  'coffee': 'قهوة', 'tea': 'شاي', 'cocoa extract': 'خلاصة الكاكاو',
  'oat': 'شوفان', 'oats': 'شوفان', 'oat flour': 'دقيق الشوفان',
  'barley': 'شعير', 'rye': 'جاودار', 'malt': 'شعير مملح',
  'malt extract': 'خلاصة الشعير', 'barley malt': 'شعير مملح',
}

function translateToArabic(text) {
  const lower = text.toLowerCase().trim()
  // Direct match
  if (INGREDIENT_AR[lower]) return INGREDIENT_AR[lower]
  // Try longest substring match first
  const sorted = Object.entries(INGREDIENT_AR).sort((a, b) => b[0].length - a[0].length)
  for (const [en, ar] of sorted) {
    if (lower === en) return ar
  }
  for (const [en, ar] of sorted) {
    if (lower.includes(en)) {
      return lower.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ar)
    }
  }
  return text
}

// Local fallback database
const localDatabase = {
  '6281000000001': {
    name: 'حليب المراعي كامل الدسم', brand: 'المراعي',
    ingredientsEn: ['milk', 'vitamin D'],
    ingredientsAr: ['حليب', 'فيتامين د'],
    image: '',
  },
  '6281000000002': {
    name: 'إندومي نودلز', brand: 'إندومي',
    ingredientsEn: ['wheat flour', 'palm oil', 'salt', 'soy sauce', 'spices'],
    ingredientsAr: ['دقيق القمح', 'زيت النخيل', 'ملح', 'صوص الصويا', 'بهارات'],
    image: '',
  },
  '6281000000003': {
    name: 'شوكولاتة جالكسي', brand: 'جالكسي',
    ingredientsEn: ['cocoa', 'milk powder', 'sugar', 'hazelnut', 'emulsifier'],
    ingredientsAr: ['كاكاو', 'حليب مجفف', 'سكر', 'بندق', 'مستحلب'],
    image: '',
  },
  '6281000000005': {
    name: 'عصير تفاح الربيع', brand: 'الربيع',
    ingredientsEn: ['apple concentrate', 'water', 'sugar'],
    ingredientsAr: ['مركز التفاح', 'ماء', 'سكر'],
    image: '',
  },
  '6281000000008': {
    name: 'ناغتس أمريكانا', brand: 'أمريكانا',
    ingredientsEn: ['chicken', 'wheat flour', 'bread crumbs', 'eggs', 'spices'],
    ingredientsAr: ['دجاج', 'دقيق القمح', 'بقسماط', 'بيض', 'بهارات'],
    image: '',
  },
  '6281000000011': {
    name: 'سنيكرز', brand: 'مارس',
    ingredientsEn: ['chocolate', 'peanut', 'caramel', 'milk', 'sugar', 'egg white'],
    ingredientsAr: ['شوكولاتة', 'فول سوداني', 'كراميل', 'حليب', 'سكر', 'بياض البيض'],
    image: '',
  },
  '6281000000012': {
    name: 'تونة معلبة', brand: 'المراعي',
    ingredientsEn: ['tuna fish', 'sunflower oil', 'salt'],
    ingredientsAr: ['سمك التونة', 'زيت دوار الشمس', 'ملح'],
    image: '',
  },
}

function parseIngredients(text) {
  if (!text) return []
  return text.replace(/_/g, '').replace(/\s*\([^)]*\)/g, '')
    .split(/,|;/).map((i) => i.trim()).filter((i) => i.length > 0 && i.length < 80).slice(0, 30)
}

/**
 * detectAllergyMatches - Scans ALL provided text sources for allergy keywords.
 * Accepts multiple text arrays and checks every one of them.
 */
function detectAllergyMatches(selectedAllergyIds, ...textArrays) {
  const fullText = textArrays.flat().join(' ').toLowerCase()
  const matched = []
  for (let i = 0; i < selectedAllergyIds.length; i++) {
    const allergyId = selectedAllergyIds[i]
    const allergy = ALLERGY_TYPES.find((a) => a.id === allergyId)
    if (!allergy) continue
    if (allergy.keywords.some((kw) => fullText.includes(kw.toLowerCase()))) {
      matched.push(allergyId)
    }
  }
  return matched
}

/**
 * isIngredientAllergen - Checks BOTH the displayed Arabic text AND
 * the original English text for allergy keyword matches.
 */
export function isIngredientAllergen(ingredientAr, ingredientEn, allergenIds) {
  const lowerAr = ingredientAr.toLowerCase()
  const lowerEn = (ingredientEn || '').toLowerCase()
  for (const allergenId of allergenIds) {
    const allergy = ALLERGY_TYPES.find((a) => a.id === allergenId)
    if (!allergy) continue
    const match = allergy.keywords.some((kw) => {
      const kwl = kw.toLowerCase()
      return lowerEn.includes(kwl) || lowerAr.includes(kwl) || kwl.includes(lowerEn) || kwl.includes(lowerAr)
    })
    if (match) return allergenId
  }
  return null
}

async function fetchWithRetry(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (response.ok) return await response.json()
    } catch {
      if (attempt === retries) throw new Error('API unavailable')
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  throw new Error('API unavailable')
}

/**
 * lookupBarcode - Returns product with ALWAYS-ARABIC ingredients
 * plus English raw ingredients for allergy matching.
 */
export async function lookupBarcode(barcodeNumber, selectedAllergyIds) {
  const code = barcodeNumber.trim()

  // Try Open Food Facts API with retry
  try {
    const data = await fetchWithRetry(
      `https://world.openfoodfacts.org/api/v0/product/${code}.json`
    )

    if (data.status === 1 && data.product) {
      const p = data.product
      const name = p.product_name_ar || p.product_name || p.product_name_en || 'منتج غير معروف'
      const brand = p.brands || 'علامة غير معروفة'
      const image = p.image_front_small_url || p.image_url || ''

      // Collect ALL available ingredient texts from every language
      const ingredientsEn = parseIngredients(p.ingredients_text_en)
      const ingredientsDefault = parseIngredients(p.ingredients_text)
      const ingredientsArApi = parseIngredients(p.ingredients_text_ar)
      const ingredientsFr = parseIngredients(p.ingredients_text_fr)
      const ingredientsStructured = (p.ingredients || []).map((i) => i.text || '').filter(Boolean).slice(0, 30)

      // Pick best English source for display
      let ingredientsForDisplay = ingredientsEn.length > 0 ? ingredientsEn
        : ingredientsDefault.length > 0 ? ingredientsDefault
        : ingredientsStructured

      // Arabic display: API Arabic → translate best English source
      let ingredientsAr = ingredientsArApi.length > 0 ? ingredientsArApi : []
      if (ingredientsAr.length === 0 && ingredientsForDisplay.length > 0) {
        ingredientsAr = ingredientsForDisplay.map((i) => translateToArabic(i))
      }

      // Allergy detection: scan ALL text sources + API allergen tags + traces
      const allergenTags = (p.allergens_tags || []).join(' ')
      const allergenText = p.allergens || ''
      const tracesTags = (p.traces_tags || []).join(' ')
      const tracesText = p.traces || ''

      const detected = detectAllergyMatches(
        selectedAllergyIds,
        ingredientsEn, ingredientsDefault, ingredientsArApi,
        ingredientsFr, ingredientsStructured,
        [allergenTags, allergenText, tracesTags, tracesText]
      )

      return {
        source: 'api',
        name,
        brand,
        image,
        ingredientsAr,
        ingredientsEn: ingredientsForDisplay,
        matchedAllergenIds: [...new Set(detected)],
      }
    }
  } catch {
    // API failed after retries
  }

  // Fallback: local database
  const local = localDatabase[code]
  if (local) {
    return {
      source: 'local',
      name: local.name,
      brand: local.brand,
      image: local.image,
      ingredientsAr: local.ingredientsAr,
      ingredientsEn: local.ingredientsEn,
      matchedAllergenIds: detectAllergyMatches(selectedAllergyIds, local.ingredientsEn, local.ingredientsAr),
    }
  }

  return null
}
