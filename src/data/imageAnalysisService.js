import { ALLERGY_TYPES } from './allergens'

/**
 * imageAnalysisService.js v4 - Multi-region food image analysis
 *
 * Key fixes over v3:
 *  1. BEST-MATCH-PER-PIXEL: each pixel only votes for the single closest
 *     food signature, not all overlapping ones. Eliminates the main source
 *     of false positives (one beige pixel inflating nuts + sesame + pasta).
 *  2. Lower thresholds: 1.5% per-region (was 4%), 2 regions for confirmed
 *     (was 3). Catches small garnishes like nut sprinkles.
 *  3. 200×200 canvas for more pixel data.
 *  4. Allergy matching restructured with explicit full-scan guarantee.
 */

// ─── Food color signatures ──────────────────────────────────────────
// Center point (hC, sC, lC) is used for best-match distance scoring.
const SIGS = [
  // Greens
  { id: 'lettuce', hC: 118, sC: 55, lC: 35, hMin: 80, hMax: 155, sMin: 25, sMax: 100, lMin: 20, lMax: 50,
    name: 'lettuce / salad greens', nameAr: 'خس / سلطة', keywords: ['lettuce', 'salad greens'] },
  { id: 'spinach', hC: 130, sC: 38, lC: 35, hMin: 100, hMax: 160, sMin: 15, sMax: 60, lMin: 25, lMax: 45,
    name: 'spinach', nameAr: 'سبانخ', keywords: ['spinach'] },
  { id: 'cucumber', hC: 115, sC: 50, lC: 52, hMin: 85, hMax: 150, sMin: 20, sMax: 80, lMin: 40, lMax: 65,
    name: 'cucumber', nameAr: 'خيار', keywords: ['cucumber', 'pickle'] },

  // Yellows
  { id: 'fries', hC: 50, sC: 75, lC: 64, hMin: 42, hMax: 58, sMin: 50, sMax: 100, lMin: 50, lMax: 78,
    name: 'french fries / potatoes', nameAr: 'بطاطس مقلية', keywords: ['potato', 'fries'] },
  { id: 'cheese', hC: 42, sC: 70, lC: 68, hMin: 35, hMax: 50, sMin: 40, sMax: 100, lMin: 55, lMax: 80,
    name: 'cheese', nameAr: 'جبن', keywords: ['cheese', 'milk', 'dairy'] },
  { id: 'egg', hC: 52, sC: 72, lC: 71, hMin: 45, hMax: 60, sMin: 50, sMax: 100, lMin: 60, lMax: 82,
    name: 'egg', nameAr: 'بيض', keywords: ['egg'] },
  { id: 'lemon', hC: 57, sC: 78, lC: 72, hMin: 50, hMax: 65, sMin: 55, sMax: 100, lMin: 60, lMax: 85,
    name: 'lemon / citrus', nameAr: 'ليمون', keywords: ['lemon', 'lime', 'citrus'] },

  // Oranges
  { id: 'chicken', hC: 25, sC: 70, lC: 58, hMin: 15, hMax: 35, sMin: 45, sMax: 100, lMin: 45, lMax: 70,
    name: 'chicken / fried food', nameAr: 'دجاج / مقليات', keywords: ['chicken'] },
  { id: 'mango', hC: 35, sC: 75, lC: 61, hMin: 25, hMax: 45, sMin: 55, sMax: 100, lMin: 50, lMax: 72,
    name: 'mango', nameAr: 'مانجو', keywords: ['mango'] },

  // Browns
  { id: 'bread', hC: 27, sC: 52, lC: 32, hMin: 15, hMax: 38, sMin: 25, sMax: 80, lMin: 20, lMax: 45,
    name: 'bread / baked goods', nameAr: 'خبز / مخبوزات', keywords: ['bread', 'flour', 'wheat', 'gluten'] },
  { id: 'meat', hC: 28, sC: 55, lC: 29, hMin: 18, hMax: 40, sMin: 30, sMax: 90, lMin: 18, lMax: 40,
    name: 'meat', nameAr: 'لحم', keywords: ['meat', 'beef'] },
  { id: 'chocolate', hC: 20, sC: 45, lC: 15, hMin: 10, hMax: 30, sMin: 20, sMax: 70, lMin: 8, lMax: 22,
    name: 'chocolate', nameAr: 'شوكولاتة', keywords: ['chocolate', 'cocoa', 'cacao'] },
  { id: 'soy_sauce', hC: 30, sC: 30, lC: 17, hMin: 20, hMax: 40, sMin: 10, sMax: 50, lMin: 10, lMax: 25,
    name: 'soy sauce / dark sauce', nameAr: 'صوص صويا', keywords: ['soy sauce', 'soy', 'soya'] },

  // Beige / Tan
  { id: 'nuts', hC: 38, sC: 32, lC: 66, hMin: 28, hMax: 48, sMin: 15, sMax: 50, lMin: 55, lMax: 78,
    name: 'nuts / seeds', nameAr: 'مكسرات', keywords: ['nut', 'peanut', 'almond', 'cashew', 'walnut'] },
  { id: 'sesame', hC: 37, sC: 37, lC: 69, hMin: 30, hMax: 45, sMin: 20, sMax: 55, lMin: 58, lMax: 80,
    name: 'sesame / tahini', nameAr: 'سمسم / طحينة', keywords: ['sesame', 'tahini'] },
  { id: 'pasta', hC: 43, sC: 42, lC: 49, hMin: 35, hMax: 52, sMin: 20, sMax: 65, lMin: 40, lMax: 58,
    name: 'pasta / noodles', nameAr: 'معكرونة', keywords: ['pasta', 'flour', 'wheat', 'gluten'] },

  // Reds (wrapping hue)
  { id: 'tomato', hC: 5, sC: 70, lC: 40, hMin: 350, hMax: 12, sMin: 40, sMax: 100, lMin: 25, lMax: 55,
    name: 'tomato / ketchup', nameAr: 'طماطم / كاتشب', keywords: ['tomato'] },
  { id: 'strawberry', hC: 358, sC: 72, lC: 40, hMin: 348, hMax: 10, sMin: 45, sMax: 100, lMin: 30, lMax: 50,
    name: 'strawberry', nameAr: 'فراولة', keywords: ['strawberry', 'strawberries'] },

  // Pinks
  { id: 'shrimp', hC: 350, sC: 42, lC: 66, hMin: 338, hMax: 360, sMin: 20, sMax: 65, lMin: 55, lMax: 78,
    name: 'shrimp / seafood', nameAr: 'ربيان / مأكولات بحرية', keywords: ['shrimp', 'seafood'] },
  { id: 'salmon', hC: 10, sC: 42, lC: 66, hMin: 0, hMax: 20, sMin: 20, sMax: 65, lMin: 55, lMax: 78,
    name: 'salmon / fish', nameAr: 'سلمون / سمك', keywords: ['salmon', 'fish', 'seafood', 'tuna'] },

  // Whites
  { id: 'rice', hC: 0, sC: 5, lC: 86, hMin: 0, hMax: 360, sMin: 0, sMax: 12, lMin: 78, lMax: 94,
    name: 'rice', nameAr: 'أرز', keywords: ['rice'] },
  { id: 'cream', hC: 45, sC: 25, lC: 87, hMin: 30, hMax: 60, sMin: 10, sMax: 40, lMin: 80, lMax: 95,
    name: 'cream / dairy', nameAr: 'كريمة / حليب', keywords: ['cream', 'milk', 'dairy'] },
]

// ─── Helpers ─────────────────────────────────────────────────────────

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

function hueInRange(hue, hMin, hMax) {
  if (hMin <= hMax) return hue >= hMin && hue <= hMax
  return hue >= hMin || hue <= hMax
}

function hueDist(a, b) {
  const d = Math.abs(a - b)
  return Math.min(d, 360 - d)
}

/**
 * Best-match-per-pixel: find the single signature closest to this HSL.
 * Returns the signature id, or null if no signature matches.
 */
function bestMatchForPixel(hsl) {
  let bestId = null
  let bestDist = Infinity

  for (const sig of SIGS) {
    if (!hueInRange(hsl.h, sig.hMin, sig.hMax)) continue
    if (hsl.s < sig.sMin || hsl.s > sig.sMax) continue
    if (hsl.l < sig.lMin || hsl.l > sig.lMax) continue

    const dist = hueDist(hsl.h, sig.hC) * 1.5 +
                 Math.abs(hsl.s - sig.sC) +
                 Math.abs(hsl.l - sig.lC)

    if (dist < bestDist) {
      bestDist = dist
      bestId = sig.id
    }
  }
  return bestId
}

// ─── Per-region analysis ─────────────────────────────────────────────

function analyzeRegion(pixels, x0, y0, rw, rh, fullW) {
  const votes = new Map()
  let validPixels = 0

  for (let y = y0; y < y0 + rh; y += 2) {
    for (let x = x0; x < x0 + rw; x += 2) {
      const idx = (y * fullW + x) * 4
      if (pixels[idx + 3] < 128) continue
      const hsl = rgbToHsl(pixels[idx], pixels[idx + 1], pixels[idx + 2])
      if (hsl.l < 5 || hsl.l > 96) continue

      validPixels++
      const bestId = bestMatchForPixel(hsl)
      if (bestId) {
        votes.set(bestId, (votes.get(bestId) || 0) + 1)
      }
    }
  }

  if (validPixels === 0) return []

  const threshold = validPixels * 0.015 // 1.5% — catches small garnishes
  const results = []
  for (const [id, count] of votes) {
    if (count >= threshold) {
      const sig = SIGS.find((s) => s.id === id)
      if (sig) {
        results.push({ id, name: sig.name, nameAr: sig.nameAr, keywords: sig.keywords, score: count / validPixels })
      }
    }
  }
  return results
}

// ─── Main image analysis ─────────────────────────────────────────────

export function analyzeImage(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const size = 200
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)
      const pixels = ctx.getImageData(0, 0, size, size).data

      const gridN = 4
      const rw = size / gridN
      const rh = size / gridN
      const agg = new Map()

      for (let row = 0; row < gridN; row++) {
        for (let col = 0; col < gridN; col++) {
          for (const food of analyzeRegion(pixels, col * rw, row * rh, rw, rh, size)) {
            const prev = agg.get(food.id) || { ...food, regions: 0, totalScore: 0 }
            prev.regions++
            prev.totalScore += food.score
            agg.set(food.id, prev)
          }
        }
      }

      const totalRegions = gridN * gridN
      const confirmed = []
      const possible = []

      for (const [, food] of agg) {
        const avg = food.totalScore / food.regions
        const confidence = Math.min(95, Math.round((food.regions / totalRegions) * 120 + avg * 60))
        const entry = { id: food.id, name: food.name, nameAr: food.nameAr, keywords: food.keywords, confidence, regions: food.regions }

        if (food.regions >= 2 && avg >= 0.03) {
          confirmed.push(entry)
        } else {
          possible.push(entry)
        }
      }

      confirmed.sort((a, b) => b.confidence - a.confidence)
      possible.sort((a, b) => b.confidence - a.confidence)
      resolve({ confirmed: confirmed.slice(0, 12), possible: possible.slice(0, 10) })
    }
    img.onerror = () => resolve({ confirmed: [], possible: [] })
    img.src = imageSrc
  })
}

// ─── Exhaustive allergy matching ─────────────────────────────────────

/**
 * matchAllAllergens - GUARANTEED to check every ingredient × every allergy.
 *
 * Structure enforces no short-circuit:
 *   for each ingredient:
 *     allergyMatches = []             ← fresh array per ingredient
 *     for each allergy:               ← NEVER breaks this loop
 *       if keywordsOverlap → push
 *     annotate ingredient with ALL matches
 *   collect global summary from ALL ingredients
 */
export function matchAllAllergens(ingredients, selectedAllergyIds) {
  const globalAllergenMap = new Map()

  const annotated = ingredients.map((food) => {
    const allergyMatches = []

    // Outer loop: iterate EVERY selected allergy without break/continue
    for (let i = 0; i < selectedAllergyIds.length; i++) {
      const allergyId = selectedAllergyIds[i]
      const allergy = ALLERGY_TYPES.find((a) => a.id === allergyId)
      if (!allergy) continue

      // Check if ANY food keyword overlaps with ANY allergy keyword
      const matched = keywordsOverlap(food.keywords, allergy.keywords)

      if (matched) {
        const info = { id: allergy.id, label: allergy.label, labelAr: allergy.labelAr, icon: allergy.icon }
        allergyMatches.push(info)
        globalAllergenMap.set(allergy.id, info)
      }
      // No break here — always continues to next allergy
    }

    return { ...food, isDangerous: allergyMatches.length > 0, matchedAllergies: allergyMatches }
  })

  return {
    ingredients: annotated,
    allDetectedAllergens: Array.from(globalAllergenMap.values()),
    hasAnyAllergen: globalAllergenMap.size > 0,
  }
}

/**
 * keywordsOverlap - checks if any keyword from list A matches any from list B.
 * A match means one string contains the other (case-insensitive).
 */
function keywordsOverlap(listA, listB) {
  for (const a of listA) {
    const al = a.toLowerCase()
    for (const b of listB) {
      const bl = b.toLowerCase()
      if (al.length >= 3 && bl.length >= 3 && (al.includes(bl) || bl.includes(al))) {
        return true
      }
      if (al === bl) return true
    }
  }
  return false
}
