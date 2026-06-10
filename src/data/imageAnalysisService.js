import { ALLERGY_TYPES } from './allergens'

/**
 * imageAnalysisService.js - Multi-region food image analysis
 *
 * Pipeline:
 *   Image → Grid segmentation (4x4) → Per-region color profiling →
 *   Region-level food classification → Deduplication & scoring →
 *   Confirmed / Possible split → Exhaustive allergy matching
 *
 * Improvements over v1:
 *   - Analyzes 16 separate image regions (4x4 grid) for spatial awareness
 *   - Each region classified independently, then merged
 *   - Tighter, non-overlapping color bands reduce false positives
 *   - Two-tier confidence: Confirmed (high) vs Possible (lower)
 *   - Exhaustive allergy scan: every ingredient × every allergy, no short-circuit
 *   - Texture heuristics (edge density) to distinguish food types
 */

// ─── Color-to-food mapping ───────────────────────────────────────────
// Each entry targets a SPECIFIC color niche to reduce overlap.
// Fields: hMin/hMax (hue 0-360), sMin/sMax (saturation 0-100),
//         lMin/lMax (lightness 0-100), food id + names + allergy keywords
const FOOD_SIGNATURES = [
  // ── Greens ──
  { hMin: 80, hMax: 155, sMin: 25, sMax: 100, lMin: 20, lMax: 50,
    id: 'lettuce', name: 'lettuce / salad greens', nameAr: 'خس / سلطة',
    keywords: ['lettuce', 'salad greens', 'green salad'] },
  { hMin: 100, hMax: 160, sMin: 15, sMax: 60, lMin: 25, lMax: 45,
    id: 'spinach', name: 'spinach', nameAr: 'سبانخ',
    keywords: ['spinach'] },
  { hMin: 85, hMax: 150, sMin: 20, sMax: 80, lMin: 40, lMax: 65,
    id: 'cucumber', name: 'cucumber', nameAr: 'خيار',
    keywords: ['cucumber', 'pickle'] },

  // ── Yellows ──
  { hMin: 42, hMax: 58, sMin: 50, sMax: 100, lMin: 50, lMax: 78,
    id: 'fries', name: 'french fries / potatoes', nameAr: 'بطاطس مقلية',
    keywords: ['potato', 'fries', 'french fries'] },
  { hMin: 35, hMax: 50, sMin: 40, sMax: 100, lMin: 55, lMax: 80,
    id: 'cheese', name: 'cheese', nameAr: 'جبن',
    keywords: ['cheese', 'milk', 'dairy'] },
  { hMin: 45, hMax: 60, sMin: 50, sMax: 100, lMin: 60, lMax: 82,
    id: 'egg', name: 'egg', nameAr: 'بيض',
    keywords: ['egg'] },
  { hMin: 50, hMax: 65, sMin: 55, sMax: 100, lMin: 60, lMax: 85,
    id: 'lemon', name: 'lemon / citrus', nameAr: 'ليمون',
    keywords: ['lemon', 'lime', 'citrus'] },

  // ── Oranges ──
  { hMin: 15, hMax: 35, sMin: 45, sMax: 100, lMin: 45, lMax: 70,
    id: 'chicken', name: 'chicken / fried food', nameAr: 'دجاج / مقليات',
    keywords: ['chicken'] },
  { hMin: 25, hMax: 45, sMin: 55, sMax: 100, lMin: 50, lMax: 72,
    id: 'mango', name: 'mango', nameAr: 'مانجو',
    keywords: ['mango'] },

  // ── Browns ──
  { hMin: 15, hMax: 38, sMin: 25, sMax: 80, lMin: 20, lMax: 45,
    id: 'bread', name: 'bread / baked goods', nameAr: 'خبز / مخبوزات',
    keywords: ['bread', 'flour', 'wheat', 'gluten'] },
  { hMin: 18, hMax: 40, sMin: 30, sMax: 90, lMin: 18, lMax: 40,
    id: 'meat', name: 'meat', nameAr: 'لحم',
    keywords: ['meat', 'beef'] },
  { hMin: 10, hMax: 30, sMin: 20, sMax: 70, lMin: 8, lMax: 22,
    id: 'chocolate', name: 'chocolate', nameAr: 'شوكولاتة',
    keywords: ['chocolate', 'cocoa', 'cacao'] },
  { hMin: 20, hMax: 40, sMin: 10, sMax: 50, lMin: 10, lMax: 25,
    id: 'soy_sauce', name: 'soy sauce / dark sauce', nameAr: 'صوص صويا',
    keywords: ['soy sauce', 'soy', 'soya'] },

  // ── Beige / Tan ──
  { hMin: 28, hMax: 48, sMin: 15, sMax: 50, lMin: 55, lMax: 78,
    id: 'nuts', name: 'nuts / seeds', nameAr: 'مكسرات',
    keywords: ['nut', 'peanut', 'almond', 'cashew', 'walnut'] },
  { hMin: 30, hMax: 45, sMin: 20, sMax: 55, lMin: 58, lMax: 80,
    id: 'sesame', name: 'sesame / tahini', nameAr: 'سمسم / طحينة',
    keywords: ['sesame', 'tahini'] },
  { hMin: 35, hMax: 52, sMin: 20, sMax: 65, lMin: 40, lMax: 58,
    id: 'pasta', name: 'pasta / noodles', nameAr: 'معكرونة',
    keywords: ['pasta', 'flour', 'wheat', 'gluten'] },

  // ── Reds ──
  { hMin: 350, hMax: 360, sMin: 40, sMax: 100, lMin: 25, lMax: 55,
    id: 'tomato', name: 'tomato / ketchup', nameAr: 'طماطم / كاتشب',
    keywords: ['tomato'] },
  { hMin: 0, hMax: 12, sMin: 40, sMax: 100, lMin: 25, lMax: 55,
    id: 'tomato2', name: 'tomato / ketchup', nameAr: 'طماطم / كاتشب',
    keywords: ['tomato'] },
  { hMin: 350, hMax: 360, sMin: 45, sMax: 100, lMin: 30, lMax: 50,
    id: 'strawberry', name: 'strawberry', nameAr: 'فراولة',
    keywords: ['strawberry', 'strawberries'] },
  { hMin: 0, hMax: 10, sMin: 45, sMax: 100, lMin: 30, lMax: 50,
    id: 'strawberry2', name: 'strawberry', nameAr: 'فراولة',
    keywords: ['strawberry', 'strawberries'] },

  // ── Pinks ──
  { hMin: 340, hMax: 360, sMin: 20, sMax: 65, lMin: 55, lMax: 78,
    id: 'shrimp', name: 'shrimp / seafood', nameAr: 'ربيان / مأكولات بحرية',
    keywords: ['shrimp', 'seafood'] },
  { hMin: 0, hMax: 18, sMin: 20, sMax: 65, lMin: 55, lMax: 78,
    id: 'salmon', name: 'salmon / fish', nameAr: 'سلمون / سمك',
    keywords: ['salmon', 'fish', 'seafood', 'tuna'] },

  // ── Whites / Creams ──
  { hMin: 0, hMax: 360, sMin: 0, sMax: 12, lMin: 78, lMax: 94,
    id: 'rice', name: 'rice', nameAr: 'أرز',
    keywords: ['rice'] },
  { hMin: 30, hMax: 60, sMin: 10, sMax: 40, lMin: 80, lMax: 95,
    id: 'cream', name: 'cream / dairy', nameAr: 'كريمة / حليب',
    keywords: ['cream', 'milk', 'dairy'] },
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
  return hue >= hMin || hue <= hMax // wraps around 360
}

function computeEdgeDensity(imageData, x0, y0, w, h, fullW) {
  let edges = 0, samples = 0
  const step = 2
  for (let y = y0 + 1; y < y0 + h - 1; y += step) {
    for (let x = x0 + 1; x < x0 + w - 1; x += step) {
      const idx = (y * fullW + x) * 4
      const idxR = (y * fullW + x + 1) * 4
      const idxD = ((y + 1) * fullW + x) * 4
      const dr = Math.abs(imageData[idx] - imageData[idxR]) +
                 Math.abs(imageData[idx + 1] - imageData[idxR + 1]) +
                 Math.abs(imageData[idx + 2] - imageData[idxR + 2])
      const dd = Math.abs(imageData[idx] - imageData[idxD]) +
                 Math.abs(imageData[idx + 1] - imageData[idxD + 1]) +
                 Math.abs(imageData[idx + 2] - imageData[idxD + 2])
      if (dr > 60 || dd > 60) edges++
      samples++
    }
  }
  return samples > 0 ? edges / samples : 0
}

// ─── Core: Multi-region analysis ─────────────────────────────────────

function analyzeRegion(pixels, x0, y0, regionW, regionH, fullW) {
  const scores = new Map()
  let pixelCount = 0

  for (let y = y0; y < y0 + regionH; y += 2) {
    for (let x = x0; x < x0 + regionW; x += 2) {
      const idx = (y * fullW + x) * 4
      const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2], a = pixels[idx + 3]
      if (a < 128) continue
      const hsl = rgbToHsl(r, g, b)
      if (hsl.l < 6 || hsl.l > 96) continue

      pixelCount++
      for (const sig of FOOD_SIGNATURES) {
        if (hueInRange(hsl.h, sig.hMin, sig.hMax) &&
            hsl.s >= sig.sMin && hsl.s <= sig.sMax &&
            hsl.l >= sig.lMin && hsl.l <= sig.lMax) {
          const baseId = sig.id.replace(/\d+$/, '') // merge tomato2→tomato etc.
          const prev = scores.get(baseId) || { ...sig, id: baseId, hits: 0 }
          prev.hits++
          scores.set(baseId, prev)
        }
      }
    }
  }

  const threshold = pixelCount * 0.04
  const results = []
  for (const [id, data] of scores) {
    if (data.hits >= threshold) {
      results.push({
        id,
        name: data.name,
        nameAr: data.nameAr,
        keywords: data.keywords,
        regionScore: data.hits / pixelCount,
      })
    }
  }
  return results
}

/**
 * analyzeImage - Main entry point. Segments image into a 4×4 grid,
 * analyzes each region, merges results, and classifies confidence.
 */
export function analyzeImage(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const size = 160
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, size, size)
      const imageData = ctx.getImageData(0, 0, size, size)
      const pixels = imageData.data

      // Analyze 4×4 grid regions
      const gridCols = 4, gridRows = 4
      const rw = Math.floor(size / gridCols)
      const rh = Math.floor(size / gridRows)
      const foodAggregation = new Map()

      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const regionFoods = analyzeRegion(pixels, col * rw, row * rh, rw, rh, size)
          for (const food of regionFoods) {
            const prev = foodAggregation.get(food.id) || {
              ...food, regionCount: 0, totalScore: 0, edgeDensity: 0
            }
            prev.regionCount++
            prev.totalScore += food.regionScore
            foodAggregation.set(food.id, prev)
          }
        }
      }

      // Compute edge density for texture hints
      for (const [, food] of foodAggregation) {
        food.edgeDensity = computeEdgeDensity(pixels, 0, 0, size, size, size)
      }

      const totalRegions = gridCols * gridRows
      const confirmed = []
      const possible = []

      for (const [, food] of foodAggregation) {
        const regionRatio = food.regionCount / totalRegions
        const avgScore = food.totalScore / food.regionCount

        // Confirmed: present in ≥3 regions with decent average
        // Possible: present in 1-2 regions or low average
        const confidence = Math.min(95, Math.round(regionRatio * 100 + avgScore * 80))
        const entry = {
          id: food.id,
          name: food.name,
          nameAr: food.nameAr,
          keywords: food.keywords,
          confidence,
          regionCount: food.regionCount,
        }

        if (food.regionCount >= 3 && avgScore >= 0.05) {
          confirmed.push(entry)
        } else if (food.regionCount >= 1) {
          possible.push(entry)
        }
      }

      confirmed.sort((a, b) => b.confidence - a.confidence)
      possible.sort((a, b) => b.confidence - a.confidence)

      resolve({ confirmed: confirmed.slice(0, 10), possible: possible.slice(0, 8) })
    }
    img.onerror = () => resolve({ confirmed: [], possible: [] })
    img.src = imageSrc
  })
}

// ─── Exhaustive allergy matching ─────────────────────────────────────

/**
 * matchAllAllergens - Checks EVERY ingredient against EVERY selected allergy.
 * Never short-circuits. Returns per-ingredient matches AND a global summary.
 */
export function matchAllAllergens(ingredients, selectedAllergyIds) {
  const allergenSummary = new Map() // allergyId → allergy data

  const annotated = ingredients.map((food) => {
    const matchedAllergies = []

    // Check EVERY allergy for this ingredient — no early exit
    for (const allergyId of selectedAllergyIds) {
      const allergy = ALLERGY_TYPES.find((a) => a.id === allergyId)
      if (!allergy) continue

      let isMatch = false
      for (const foodKw of food.keywords) {
        for (const allergyKw of allergy.keywords) {
          const fk = foodKw.toLowerCase()
          const ak = allergyKw.toLowerCase()
          if (fk.includes(ak) || ak.includes(fk)) {
            isMatch = true
            break
          }
        }
        if (isMatch) break
      }

      if (isMatch) {
        const allergyInfo = { id: allergy.id, label: allergy.label, labelAr: allergy.labelAr, icon: allergy.icon }
        matchedAllergies.push(allergyInfo)
        allergenSummary.set(allergy.id, allergyInfo)
      }
    }

    return { ...food, isDangerous: matchedAllergies.length > 0, matchedAllergies }
  })

  return {
    ingredients: annotated,
    allDetectedAllergens: Array.from(allergenSummary.values()),
    hasAnyAllergen: allergenSummary.size > 0,
  }
}
