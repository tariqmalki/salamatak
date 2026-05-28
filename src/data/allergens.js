/**
 * allergens.js - Allergy types and detection logic
 *
 * This file defines 17 allergy categories and provides
 * a keyword-based detection system to simulate AI allergen analysis.
 * Each allergy has keywords in both English and Arabic for bilingual support.
 */

export const ALLERGY_TYPES = [
  {
    id: 'nuts',
    label: 'Nuts',
    labelAr: 'مكسرات',
    icon: '🥜',
    keywords: [
      'peanut', 'almond', 'cashew', 'walnut', 'pistachio',
      'pecan', 'macadamia', 'nutella', 'praline', 'marzipan', 'nut',
      'peanut butter', 'almond milk', 'trail mix',
      'فستق', 'لوز', 'جوز', 'كاجو', 'مكسرات', 'زبدة الفول السوداني'
    ],
  },
  {
    id: 'milk',
    label: 'Milk',
    labelAr: 'حليب',
    icon: '🥛',
    keywords: [
      'milk', 'cheese', 'cream', 'butter', 'yogurt', 'whey', 'lactose',
      'dairy', 'cheddar', 'mozzarella', 'parmesan', 'béchamel', 'bechamel',
      'cream cheese', 'ice cream', 'milkshake', 'latte', 'cappuccino',
      'حليب', 'جبن', 'زبدة', 'قشطة', 'لبن', 'آيس كريم'
    ],
  },
  {
    id: 'eggs',
    label: 'Eggs',
    labelAr: 'بيض',
    icon: '🥚',
    keywords: [
      'egg', 'mayo', 'mayonnaise', 'meringue', 'custard', 'quiche',
      'omelette', 'omelet', 'frittata', 'aioli', 'hollandaise',
      'egg wash', 'egg white', 'egg yolk',
      'بيض', 'مايونيز', 'عجة'
    ],
  },
  {
    id: 'gluten',
    label: 'Gluten',
    labelAr: 'غلوتين',
    icon: '🌾',
    keywords: [
      'wheat', 'bread', 'flour', 'pasta', 'noodle', 'cake', 'cookie',
      'pastry', 'croissant', 'bun', 'tortilla', 'pita', 'crouton',
      'breaded', 'batter', 'soy sauce', 'gluten', 'bagel', 'muffin',
      'خبز', 'دقيق', 'معكرونة', 'كيك', 'غلوتين', 'خبز عربي'
    ],
  },
  {
    id: 'seafood',
    label: 'Seafood',
    labelAr: 'مأكولات بحرية',
    icon: '🦐',
    keywords: [
      'shrimp', 'prawn', 'lobster', 'crab', 'fish', 'salmon',
      'oyster', 'clam', 'mussel', 'anchovy', 'squid', 'calamari',
      'sushi', 'sashimi', 'seafood', 'fish sauce', 'surimi',
      'سمك', 'ربيان', 'جمبري', 'سلمون', 'بحري', 'كاليماري'
    ],
  },
  {
    id: 'strawberry',
    label: 'Strawberry',
    labelAr: 'فراولة',
    icon: '🍓',
    keywords: [
      'strawberry', 'strawberries', 'berry mix', 'mixed berries',
      'فراولة', 'فراوله', 'توت'
    ],
  },
  {
    id: 'soya',
    label: 'Soya',
    labelAr: 'صويا',
    icon: '🫘',
    keywords: [
      'soy', 'soya', 'soybean', 'soy sauce', 'soy milk', 'tofu',
      'edamame', 'tempeh', 'miso', 'soy lecithin', 'soy protein',
      'صويا', 'فول الصويا', 'صوص الصويا', 'حليب الصويا', 'توفو'
    ],
  },
  {
    id: 'mango',
    label: 'Mango',
    labelAr: 'مانجو',
    icon: '🥭',
    keywords: [
      'mango', 'mangoes', 'mango juice', 'mango smoothie', 'mango chutney',
      'مانجو', 'مانجا', 'عصير مانجو'
    ],
  },
  {
    id: 'potato',
    label: 'Potato',
    labelAr: 'بطاطس',
    icon: '🥔',
    keywords: [
      'potato', 'potatoes', 'fries', 'french fries', 'hash brown',
      'mashed potato', 'baked potato', 'chips', 'wedges', 'tater',
      'بطاطس', 'بطاطا', 'بطاطس مقلية'
    ],
  },
  {
    id: 'lemon',
    label: 'Lemon',
    labelAr: 'ليمون',
    icon: '🍋',
    keywords: [
      'lemon', 'lime', 'citrus', 'lemonade', 'lemon juice', 'lemon zest',
      'ليمون', 'حامض', 'ليموناضة', 'عصير ليمون'
    ],
  },
  {
    id: 'cucumber',
    label: 'Cucumber',
    labelAr: 'خيار',
    icon: '🥒',
    keywords: [
      'cucumber', 'cucumbers', 'pickle', 'pickled', 'gherkin',
      'خيار', 'مخلل'
    ],
  },
  {
    id: 'chocolate',
    label: 'Chocolate',
    labelAr: 'شوكولاتة',
    icon: '🍫',
    keywords: [
      'chocolate', 'cocoa', 'cacao', 'brownie', 'nutella', 'mocha',
      'chocolate chip', 'chocolate sauce', 'ganache', 'truffle',
      'شوكولاتة', 'شوكولا', 'كاكاو', 'براوني', 'موكا'
    ],
  },
  {
    id: 'sesame',
    label: 'Sesame',
    labelAr: 'سمسم',
    icon: '🫓',
    keywords: [
      'sesame', 'sesame seed', 'tahini', 'hummus', 'halva', 'halvah',
      'sesame oil', 'za\'atar',
      'سمسم', 'طحينة', 'حمص', 'حلاوة', 'زعتر'
    ],
  },
  {
    id: 'spinach',
    label: 'Spinach',
    labelAr: 'سبانخ',
    icon: '🥬',
    keywords: [
      'spinach', 'spinach leaf', 'creamed spinach', 'spinach dip',
      'سبانخ'
    ],
  },
  {
    id: 'lettuce',
    label: 'Lettuce',
    labelAr: 'خس',
    icon: '🥗',
    keywords: [
      'lettuce', 'romaine', 'iceberg', 'salad greens', 'green salad',
      'خس', 'سلطة خضراء'
    ],
  },
  {
    id: 'tuna',
    label: 'Tuna',
    labelAr: 'تونة',
    icon: '🐟',
    keywords: [
      'tuna', 'tuna fish', 'tuna salad', 'tuna sandwich', 'tuna steak',
      'تونة', 'تونا'
    ],
  },
  {
    id: 'hazelnut',
    label: 'Hazelnut',
    labelAr: 'بندق',
    icon: '🌰',
    keywords: [
      'hazelnut', 'hazelnuts', 'nutella', 'hazelnut spread',
      'hazelnut milk', 'hazelnut butter', 'gianduja', 'praline',
      'بندق', 'نوتيلا', 'بندقة'
    ],
  },
]

/**
 * detectAllergens - Checks if a text contains allergens for given allergy IDs
 */
export function detectAllergens(text, selectedAllergyIds) {
  const lowerText = text.toLowerCase()
  const found = []

  ALLERGY_TYPES.forEach((allergy) => {
    if (selectedAllergyIds.includes(allergy.id)) {
      const matchedKeywords = allergy.keywords.filter((kw) =>
        lowerText.includes(kw.toLowerCase())
      )
      if (matchedKeywords.length > 0) {
        found.push({
          allergyId: allergy.id,
          label: allergy.label,
          labelAr: allergy.labelAr,
          icon: allergy.icon,
          matchedKeywords,
        })
      }
    }
  })

  return found
}
