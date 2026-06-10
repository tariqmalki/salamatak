import { ALLERGY_TYPES } from './allergens'

/**
 * imageAnalysisService.js - Analyzes food images using color-based detection
 *
 * Pipeline: Image → Canvas pixel sampling → Color clustering →
 *           Food/ingredient mapping → Allergy check → Result
 *
 * This reads the ACTUAL image content. Different images produce different results.
 * No mock meals, no restaurant data, no predefined lists.
 */

// Maps color ranges (HSL) to food ingredients they commonly represent
const COLOR_FOOD_MAP = [
  // Browns - fried food, bread, meat, chocolate, nuts
  { hMin: 15, hMax: 40, sMin: 20, sMax: 100, lMin: 15, lMax: 45,
    foods: [
      { name: 'bread', nameAr: 'خبز', keywords: ['bread', 'flour', 'gluten'] },
      { name: 'fried coating', nameAr: 'طبقة مقلية', keywords: ['flour', 'breaded'] },
      { name: 'meat', nameAr: 'لحم', keywords: ['meat', 'beef'] },
    ]},
  // Dark brown - chocolate, coffee, dark sauces
  { hMin: 10, hMax: 35, sMin: 15, sMax: 80, lMin: 5, lMax: 20,
    foods: [
      { name: 'chocolate', nameAr: 'شوكولاتة', keywords: ['chocolate', 'cocoa'] },
      { name: 'soy sauce', nameAr: 'صوص صويا', keywords: ['soy sauce', 'soy'] },
    ]},
  // Golden/yellow - fries, cheese, pasta, eggs
  { hMin: 35, hMax: 55, sMin: 30, sMax: 100, lMin: 40, lMax: 75,
    foods: [
      { name: 'french fries / potatoes', nameAr: 'بطاطس مقلية', keywords: ['potato', 'fries'] },
      { name: 'cheese', nameAr: 'جبن', keywords: ['cheese', 'dairy', 'milk'] },
      { name: 'egg', nameAr: 'بيض', keywords: ['egg'] },
      { name: 'pasta', nameAr: 'معكرونة', keywords: ['pasta', 'flour', 'wheat'] },
    ]},
  // Orange/amber - chicken, carrots, sauce
  { hMin: 15, hMax: 35, sMin: 40, sMax: 100, lMin: 45, lMax: 70,
    foods: [
      { name: 'chicken', nameAr: 'دجاج', keywords: ['chicken'] },
      { name: 'sauce', nameAr: 'صوص', keywords: ['sauce'] },
    ]},
  // Red - tomato, ketchup, strawberry, red pepper
  { hMin: 345, hMax: 360, sMin: 30, sMax: 100, lMin: 20, lMax: 60,
    foods: [
      { name: 'tomato sauce / ketchup', nameAr: 'صوص طماطم / كاتشب', keywords: ['tomato'] },
      { name: 'strawberry', nameAr: 'فراولة', keywords: ['strawberry'] },
    ]},
  { hMin: 0, hMax: 15, sMin: 30, sMax: 100, lMin: 20, lMax: 60,
    foods: [
      { name: 'tomato sauce / ketchup', nameAr: 'صوص طماطم / كاتشب', keywords: ['tomato'] },
      { name: 'strawberry', nameAr: 'فراولة', keywords: ['strawberry'] },
    ]},
  // Green - lettuce, salad, vegetables, cucumber
  { hMin: 80, hMax: 160, sMin: 20, sMax: 100, lMin: 15, lMax: 65,
    foods: [
      { name: 'lettuce / salad greens', nameAr: 'خس / سلطة خضراء', keywords: ['lettuce', 'salad greens'] },
      { name: 'cucumber', nameAr: 'خيار', keywords: ['cucumber'] },
      { name: 'spinach', nameAr: 'سبانخ', keywords: ['spinach'] },
    ]},
  // White/cream - rice, dairy, cream, bread interior
  { hMin: 0, hMax: 360, sMin: 0, sMax: 15, lMin: 75, lMax: 95,
    foods: [
      { name: 'rice', nameAr: 'أرز', keywords: ['rice'] },
      { name: 'cream / dairy', nameAr: 'كريمة / حليب', keywords: ['cream', 'milk', 'dairy'] },
      { name: 'bread', nameAr: 'خبز', keywords: ['bread', 'flour'] },
    ]},
  // Beige/tan - hummus, tahini, nuts, sesame
  { hMin: 30, hMax: 50, sMin: 15, sMax: 50, lMin: 55, lMax: 80,
    foods: [
      { name: 'tahini / hummus', nameAr: 'طحينة / حمص', keywords: ['tahini', 'sesame', 'hummus'] },
      { name: 'nuts', nameAr: 'مكسرات', keywords: ['nut', 'peanut', 'almond'] },
    ]},
  // Pink/salmon - shrimp, salmon, ham
  { hMin: 340, hMax: 360, sMin: 20, sMax: 70, lMin: 55, lMax: 80,
    foods: [
      { name: 'shrimp', nameAr: 'ربيان', keywords: ['shrimp', 'seafood'] },
      { name: 'salmon', nameAr: 'سلمون', keywords: ['salmon', 'fish', 'seafood'] },
    ]},
  { hMin: 0, hMax: 20, sMin: 20, sMax: 70, lMin: 55, lMax: 80,
    foods: [
      { name: 'shrimp', nameAr: 'ربيان', keywords: ['shrimp', 'seafood'] },
      { name: 'salmon', nameAr: 'سلمون', keywords: ['salmon', 'fish', 'seafood'] },
    ]},
  // Yellow-orange fruit - mango
  { hMin: 40, hMax: 55, sMin: 60, sMax: 100, lMin: 50, lMax: 70,
    foods: [
      { name: 'mango', nameAr: 'مانجو', keywords: ['mango'] },
    ]},
  // Bright yellow - lemon
  { hMin: 50, hMax: 65, sMin: 60, sMax: 100, lMin: 55, lMax: 80,
    foods: [
      { name: 'lemon', nameAr: 'ليمون', keywords: ['lemon', 'citrus'] },
    ]},
  // Dark green-brown - seaweed, tuna
  { hMin: 60, hMax: 120, sMin: 10, sMax: 40, lMin: 15, lMax: 35,
    foods: [
      { name: 'tuna / dark fish', nameAr: 'تونة / سمك', keywords: ['tuna', 'fish', 'seafood'] },
    ]},
]

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/**
 * analyzeImage - Extract color data from an image and detect food ingredients
 *
 * @param {string} imageSrc - Data URL of the uploaded image
 * @returns {Promise<Object>} Analysis results with detected ingredients
 */
export function analyzeImage(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 100 // Sample at 100x100 for performance
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)

      const imageData = ctx.getImageData(0, 0, size, size)
      const pixels = imageData.data

      // Count how many pixels fall into each color-food category
      const foodScores = new Map()

      for (let i = 0; i < pixels.length; i += 16) { // Sample every 4th pixel
        const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
        const hsl = rgbToHsl(r, g, b)

        // Skip very dark (shadows) and very bright (highlights) pixels
        if (hsl.l < 8 || hsl.l > 95) continue

        for (const colorRange of COLOR_FOOD_MAP) {
          const hMatch = colorRange.hMin <= colorRange.hMax
            ? (hsl.h >= colorRange.hMin && hsl.h <= colorRange.hMax)
            : (hsl.h >= colorRange.hMin || hsl.h <= colorRange.hMax)

          if (hMatch &&
              hsl.s >= colorRange.sMin && hsl.s <= colorRange.sMax &&
              hsl.l >= colorRange.lMin && hsl.l <= colorRange.lMax) {
            for (const food of colorRange.foods) {
              const current = foodScores.get(food.name) || { ...food, score: 0 }
              current.score += 1
              foodScores.set(food.name, current)
            }
          }
        }
      }

      // Sort by score and take the top detected foods (above a minimum threshold)
      const totalSamples = (size * size) / 4
      const minThreshold = totalSamples * 0.02 // At least 2% of sampled pixels

      const detectedFoods = Array.from(foodScores.values())
        .filter((f) => f.score >= minThreshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((f) => ({
          name: f.name,
          nameAr: f.nameAr,
          keywords: f.keywords,
          confidence: Math.min(95, Math.round((f.score / totalSamples) * 300)),
        }))

      resolve({ detectedFoods })
    }

    img.onerror = () => {
      resolve({ detectedFoods: [] })
    }

    img.src = imageSrc
  })
}

/**
 * checkIngredientsForAllergens - Compare detected ingredients against user allergies
 *
 * @param {Array} detectedFoods - Array from analyzeImage()
 * @param {string[]} selectedAllergyIds - User's selected allergy IDs
 * @returns {Object} Results with matched allergens per ingredient
 */
export function checkIngredientsForAllergens(detectedFoods, selectedAllergyIds) {
  const results = detectedFoods.map((food) => {
    const matchedAllergies = []

    for (const allergyId of selectedAllergyIds) {
      const allergy = ALLERGY_TYPES.find((a) => a.id === allergyId)
      if (!allergy) continue

      const isMatch = food.keywords.some((kw) =>
        allergy.keywords.some((ak) =>
          kw.toLowerCase().includes(ak.toLowerCase()) ||
          ak.toLowerCase().includes(kw.toLowerCase())
        )
      )

      if (isMatch) {
        matchedAllergies.push({
          id: allergy.id,
          label: allergy.label,
          labelAr: allergy.labelAr,
          icon: allergy.icon,
        })
      }
    }

    return {
      ...food,
      isDangerous: matchedAllergies.length > 0,
      matchedAllergies,
    }
  })

  const hasAnyAllergen = results.some((r) => r.isDangerous)

  return { ingredients: results, hasAnyAllergen }
}
