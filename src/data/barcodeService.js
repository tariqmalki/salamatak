import { ALLERGY_TYPES } from './allergens'

/**
 * barcodeService.js - Real product lookup via Open Food Facts API
 *
 * Primary:  Fetches real product data from Open Food Facts (free, no auth)
 * Fallback: Uses local mock database if API fails or product not found
 *
 * Each scan triggers a fresh API call - no caching of previous results.
 */

// Local fallback database for when API is unavailable
const localDatabase = {
  '6281000000001': {
    name: 'Almarai Full Cream Milk',
    brand: 'Almarai',
    ingredients: ['milk', 'vitamin D'],
    image: '',
  },
  '6281000000002': {
    name: 'Indomie Instant Noodles',
    brand: 'Indomie',
    ingredients: ['wheat flour', 'palm oil', 'salt', 'soy sauce', 'spices'],
    image: '',
  },
  '6281000000003': {
    name: 'Galaxy Chocolate Bar',
    brand: 'Galaxy',
    ingredients: ['cocoa', 'milk powder', 'sugar', 'hazelnut', 'emulsifier'],
    image: '',
  },
  '6281000000005': {
    name: 'Al Rabee Apple Juice',
    brand: 'Al Rabee',
    ingredients: ['apple concentrate', 'water', 'sugar'],
    image: '',
  },
  '6281000000008': {
    name: 'Americana Chicken Nuggets',
    brand: 'Americana',
    ingredients: ['chicken', 'wheat flour', 'bread crumbs', 'eggs', 'spices'],
    image: '',
  },
  '6281000000011': {
    name: 'Snickers Bar',
    brand: 'Mars',
    ingredients: ['chocolate', 'peanut', 'caramel', 'milk', 'sugar', 'egg white'],
    image: '',
  },
  '6281000000012': {
    name: 'Tuna Can',
    brand: 'Almarai',
    ingredients: ['tuna fish', 'sunflower oil', 'salt'],
    image: '',
  },
}

/**
 * Parse the ingredients text from Open Food Facts into a clean array.
 * The API returns a comma-separated string with formatting artifacts.
 */
function parseIngredients(ingredientsText) {
  if (!ingredientsText) return []
  return ingredientsText
    .replace(/_/g, '')
    .replace(/\s*\([^)]*\)/g, '')
    .split(/,|;/)
    .map((i) => i.trim().toLowerCase())
    .filter((i) => i.length > 0 && i.length < 60)
    .slice(0, 30)
}

/**
 * Detect which of the user's allergies match against ingredient text.
 * Returns array of matched allergy IDs.
 */
function detectAllergyMatches(ingredients, selectedAllergyIds) {
  const fullText = ingredients.join(' ').toLowerCase()
  const matched = []

  ALLERGY_TYPES.forEach((allergy) => {
    if (!selectedAllergyIds.includes(allergy.id)) return
    const found = allergy.keywords.some((kw) => fullText.includes(kw.toLowerCase()))
    if (found) matched.push(allergy.id)
  })

  return matched
}

/**
 * Check if a single ingredient matches any allergy keywords.
 * Used to highlight individual ingredients in the UI.
 */
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
 * lookupBarcode - Main function to look up a product by barcode
 *
 * 1. Tries Open Food Facts API first (real data)
 * 2. Falls back to local database if API fails
 * 3. Returns null if product not found anywhere
 *
 * Always returns a fresh result (no caching).
 */
export async function lookupBarcode(barcodeNumber, selectedAllergyIds) {
  const code = barcodeNumber.trim()

  // Try the Open Food Facts API first
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${code}.json`,
      { signal: AbortSignal.timeout(8000) }
    )
    const data = await response.json()

    if (data.status === 1 && data.product) {
      const product = data.product
      const name = product.product_name || product.product_name_en || 'Unknown Product'
      const brand = product.brands || 'Unknown Brand'
      const image = product.image_front_small_url || product.image_url || ''

      // Parse ingredients from the API response
      let ingredients = []
      if (product.ingredients_text) {
        ingredients = parseIngredients(product.ingredients_text)
      } else if (product.ingredients_text_en) {
        ingredients = parseIngredients(product.ingredients_text_en)
      } else if (product.ingredients) {
        ingredients = product.ingredients.map((i) => i.text?.toLowerCase()).filter(Boolean).slice(0, 30)
      }

      // Detect allergens from both ingredients and the API's own allergen tags
      const detectedFromIngredients = detectAllergyMatches(ingredients, selectedAllergyIds)

      // Also check Open Food Facts' allergen tags
      const apiAllergenText = (product.allergens_tags || []).join(' ').toLowerCase()
      const detectedFromTags = []
      ALLERGY_TYPES.forEach((allergy) => {
        if (!selectedAllergyIds.includes(allergy.id)) return
        if (detectedFromIngredients.includes(allergy.id)) return
        if (allergy.keywords.some((kw) => apiAllergenText.includes(kw.toLowerCase()))) {
          detectedFromTags.push(allergy.id)
        }
      })

      const allDetected = [...new Set([...detectedFromIngredients, ...detectedFromTags])]

      return {
        source: 'api',
        name,
        brand,
        image,
        ingredients,
        matchedAllergenIds: allDetected,
        apiAllergens: product.allergens_tags || [],
      }
    }
  } catch {
    // API failed - fall through to local database
  }

  // Fallback: check local database
  const local = localDatabase[code]
  if (local) {
    const allDetected = detectAllergyMatches(local.ingredients, selectedAllergyIds)
    return {
      source: 'local',
      name: local.name,
      brand: local.brand,
      image: local.image,
      ingredients: local.ingredients,
      matchedAllergenIds: allDetected,
      apiAllergens: [],
    }
  }

  // Not found anywhere
  return null
}
