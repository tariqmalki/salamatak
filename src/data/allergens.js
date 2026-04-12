// List of allergy types with icons, labels in both languages, and keywords
export const ALLERGY_TYPES = [
  {
    id: 'nuts',
    label: 'Nuts',
    labelAr: 'مكسرات',
    icon: '🥜',
    // Keywords used to detect this allergen in dish names/descriptions
    keywords: [
      'peanut', 'almond', 'cashew', 'walnut', 'pistachio', 'hazelnut',
      'pecan', 'macadamia', 'nutella', 'praline', 'marzipan', 'nut',
      'فستق', 'لوز', 'جوز', 'كاجو', 'بندق', 'مكسرات'
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
      'حليب', 'جبن', 'زبدة', 'قشطة', 'لبن'
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
      'بيض', 'مايونيز'
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
      'breaded', 'batter', 'soy sauce', 'gluten',
      'خبز', 'دقيق', 'معكرونة', 'كيك', 'غلوتين'
    ],
  },
  {
    id: 'seafood',
    label: 'Seafood',
    labelAr: 'مأكولات بحرية',
    icon: '🦐',
    keywords: [
      'shrimp', 'prawn', 'lobster', 'crab', 'fish', 'salmon', 'tuna',
      'oyster', 'clam', 'mussel', 'anchovy', 'squid', 'calamari',
      'sushi', 'sashimi', 'seafood',
      'سمك', 'ربيان', 'جمبري', 'تونة', 'سلمون', 'بحري'
    ],
  },
]

// Helper: check if a text contains allergens for given allergy IDs
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
