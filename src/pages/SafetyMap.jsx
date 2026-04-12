import { restaurants } from '../data/restaurants'

/**
 * Safety Map - Visual map-like display of restaurants color-coded by safety
 *
 * Features:
 * - Static map UI (no real map API - by design)
 * - Color-coded restaurant markers:
 *   Green  = Safe, allergy-aware restaurant
 *   Yellow = Unknown, use caution
 *   Red    = Risky, many allergens
 * - Grouped restaurant lists by safety level
 * - City label (Riyadh & Jeddah)
 * - Grid-based simulated map with animated markers
 */
export default function SafetyMap() {
  // Group restaurants by their safety level for the lists below the map
  const grouped = {
    green: restaurants.filter((r) => r.safetyLevel === 'green'),
    yellow: restaurants.filter((r) => r.safetyLevel === 'yellow'),
    red: restaurants.filter((r) => r.safetyLevel === 'red'),
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page header */}
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">🗺️ Safety Map</h1>
      <p className="text-gray-500 mb-1">See which restaurants are safe for allergy sufferers</p>
      <p className="text-gray-400 text-sm mb-6" dir="rtl">شاهد المطاعم الآمنة لمن يعانون من الحساسية</p>

      {/* Map legend - explains the color coding */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-600">Safe - Allergy Aware</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="text-sm font-medium text-gray-600">Unknown - Use Caution</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium text-gray-600">Risky - Many Allergens</span>
        </div>
      </div>

      {/* Simulated map area with grid background */}
      <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-200 mb-8 relative overflow-hidden">
        {/* Grid lines to simulate a map background */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-emerald-800" style={{ height: '12.5%' }}></div>
          ))}
        </div>

        {/* City label */}
        <div className="text-center mb-6 relative z-10">
          <h3 className="text-lg font-bold text-emerald-800">📍 Riyadh & Jeddah Area</h3>
          <p className="text-sm text-emerald-600">الرياض وجدة</p>
        </div>

        {/* Restaurant markers on the simulated map */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
          {restaurants.map((r) => {
            // Color styles for each safety level
            const colors = {
              green: 'bg-green-100 border-green-400 hover:bg-green-200',
              yellow: 'bg-yellow-100 border-yellow-400 hover:bg-yellow-200',
              red: 'bg-red-100 border-red-400 hover:bg-red-200',
            }
            // Dot colors for the animated marker
            const dots = {
              green: 'bg-green-500',
              yellow: 'bg-yellow-500',
              red: 'bg-red-500',
            }
            return (
              <div
                key={r.id}
                className={`rounded-2xl p-4 border-2 transition-all hover:shadow-md ${colors[r.safetyLevel]}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {/* Animated pulsing dot */}
                  <div className={`w-3 h-3 rounded-full ${dots[r.safetyLevel]} animate-pulse`}></div>
                  <span className="font-bold text-gray-800 text-sm">{r.name}</span>
                </div>
                <div className="text-xs text-gray-500">{r.nameAr}</div>
                <div className="text-xs text-gray-400 mt-1">{r.cuisine}</div>
                <div className="text-xs mt-1 font-medium">
                  {r.safetyLevel === 'green' ? '✅ Safe' :
                   r.safetyLevel === 'yellow' ? '⚠️ Caution' : '🚫 Risky'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed restaurant lists grouped by safety level */}
      <div className="space-y-6">
        {/* Safe restaurants */}
        <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
          <h3 className="text-lg font-bold text-green-800 mb-3">🟢 Safe Restaurants ({grouped.green.length})</h3>
          <div className="space-y-2">
            {grouped.green.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-800">{r.name}</span>
                  <span className="text-sm text-gray-400 ml-2">{r.nameAr}</span>
                </div>
                <span className="text-xs text-green-600 font-medium">{r.menu.length} items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Caution restaurants */}
        <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
          <h3 className="text-lg font-bold text-yellow-800 mb-3">🟡 Use Caution ({grouped.yellow.length})</h3>
          <div className="space-y-2">
            {grouped.yellow.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-800">{r.name}</span>
                  <span className="text-sm text-gray-400 ml-2">{r.nameAr}</span>
                </div>
                <span className="text-xs text-yellow-600 font-medium">{r.menu.length} items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risky restaurants */}
        <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
          <h3 className="text-lg font-bold text-red-800 mb-3">🔴 High Risk ({grouped.red.length})</h3>
          <div className="space-y-2">
            {grouped.red.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-800">{r.name}</span>
                  <span className="text-sm text-gray-400 ml-2">{r.nameAr}</span>
                </div>
                <span className="text-xs text-red-600 font-medium">{r.menu.length} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
