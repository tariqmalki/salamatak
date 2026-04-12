/**
 * allergens.js - Allergy types and detection logic
 *
 * This file defines the 5 main allergy categories and provides
 * a keyword-based detection system to simulate AI allergen analysis.
 * Each allergy has keywords in both English and Arabic for bilingual support.
 */

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
      'peanut butter', 'almond milk', 'trail mix',
      'فستق', 'لوز', 'جوز', 'كاجو', 'بندق', 'مكسرات', 'زبدة الفول السوداني'
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
      'shrimp', 'prawn', 'lobster', 'crab', 'fish', 'salmon', 'tuna',
      'oyster', 'clam', 'mussel', 'anchovy', 'squid', 'calamari',
      'sushi', 'sashimi', 'seafood', 'fish sauce', 'surimi',
      'سمك', 'ربيان', 'جمبري', 'تونة', 'سلمون', 'بحري', 'كاليماري'
    ],
  },
]

/**
 * detectAllergens - Checks if a text contains allergens for given allergy IDs
 *
 * This simulates AI analysis by doing keyword matching against the text.
 * It returns an array of matched allergens with details about which
 * keywords triggered the match.
 *
 * @param {string} text - The text to analyze (e.g., dish ingredients)
 * @param {string[]} selectedAllergyIds - Array of allergy IDs to check for
 * @returns {Array} Array of matched allergen objects with details
 */
export function detectAllergens(text, selectedAllergyIds) {
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase()
  const found = []

  // Check each allergy type against the text
  ALLERGY_TYPES.forEach((allergy) => {
    // Only check allergies the user has selected
    if (selectedAllergyIds.includes(allergy.id)) {
      // Find which keywords matched
      const matchedKeywords = allergy.keywords.filter((kw) =>
        lowerText.includes(kw.toLowerCase())
      )
      // If any keywords matched, add to results
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
