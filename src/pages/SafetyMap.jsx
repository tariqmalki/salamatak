import { restaurants } from '../data/restaurants'
import { useLanguage } from '../context/LanguageContext'

export default function SafetyMap() {
  const { t, isAr } = useLanguage()

  const grouped = {
    green: restaurants.filter((r) => r.safetyLevel === 'green'),
    yellow: restaurants.filter((r) => r.safetyLevel === 'yellow'),
    red: restaurants.filter((r) => r.safetyLevel === 'red'),
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">{t('safetyMap.title')}</h1>
      <p className="text-gray-500 mb-6">{t('safetyMap.subtitle')}</p>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-600">{t('safetyMap.legendSafe')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="text-sm font-medium text-gray-600">{t('safetyMap.legendUnknown')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium text-gray-600">{t('safetyMap.legendRisky')}</span>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-3xl p-6 border-2 border-emerald-200 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-emerald-800" style={{ height: '12.5%' }}></div>
          ))}
        </div>

        <div className="text-center mb-6 relative z-10">
          <h3 className="text-lg font-bold text-emerald-800">{t('safetyMap.cityLabel')}</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
          {restaurants.map((r) => {
            const colors = {
              green: 'bg-green-100 border-green-400 hover:bg-green-200',
              yellow: 'bg-yellow-100 border-yellow-400 hover:bg-yellow-200',
              red: 'bg-red-100 border-red-400 hover:bg-red-200',
            }
            const dots = { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' }
            return (
              <div key={r.id} className={`rounded-2xl p-4 border-2 transition-all hover:shadow-md ${colors[r.safetyLevel]}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${dots[r.safetyLevel]} animate-pulse`}></div>
                  <span className="font-bold text-gray-800 text-sm">{isAr ? r.nameAr : r.name}</span>
                </div>
                <div className="text-xs text-gray-500">{isAr ? r.name : r.nameAr}</div>
                <div className="text-xs text-gray-400 mt-1">{r.cuisine}</div>
                <div className="text-xs mt-1 font-medium">
                  {r.safetyLevel === 'green' ? t('safetyMap.safeMarker') :
                   r.safetyLevel === 'yellow' ? t('safetyMap.cautionMarker') : t('safetyMap.riskyMarker')}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-6">
        {[
          { key: 'green', title: t('safetyMap.safeRestaurants'), items: grouped.green, bg: 'bg-green-50 border-green-200', titleColor: 'text-green-800', itemColor: 'text-green-600' },
          { key: 'yellow', title: t('safetyMap.cautionRestaurants'), items: grouped.yellow, bg: 'bg-yellow-50 border-yellow-200', titleColor: 'text-yellow-800', itemColor: 'text-yellow-600' },
          { key: 'red', title: t('safetyMap.riskyRestaurants'), items: grouped.red, bg: 'bg-red-50 border-red-200', titleColor: 'text-red-800', itemColor: 'text-red-600' },
        ].map((section) => (
          <div key={section.key} className={`rounded-2xl p-5 border ${section.bg}`}>
            <h3 className={`text-lg font-bold ${section.titleColor} mb-3`}>{section.title} ({section.items.length})</h3>
            <div className="space-y-2">
              {section.items.map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-800">{isAr ? r.nameAr : r.name}</span>
                    <span className={`text-sm text-gray-400 ${isAr ? 'mr-2' : 'ml-2'}`}>{isAr ? r.name : r.nameAr}</span>
                  </div>
                  <span className={`text-xs ${section.itemColor} font-medium`}>{r.menu.length} {t('safetyMap.items')}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
