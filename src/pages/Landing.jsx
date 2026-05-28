import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function Landing() {
  const navigate = useNavigate()
  const { t, isAr, setLang } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col items-center justify-center px-4">
      {/* Language toggle - top corner */}
      <button
        onClick={() => setLang(isAr ? 'en' : 'ar')}
        className="absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
      >
        {isAr ? 'EN' : 'عربي'}
      </button>

      <div className="text-center max-w-2xl">
        <div className="mb-6 animate-bounce">
          <img src="/salamatak/logo.svg" alt="Salamatak" className="h-28 w-28 mx-auto" />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-emerald-800 mb-2">
          {t('landing.title')}
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-600 mb-6">
          {t('landing.subtitle')}
        </h2>

        <p className="text-lg text-gray-600 mb-2 leading-relaxed">
          {t('landing.description1')}
        </p>
        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
          {t('landing.description2')}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: '📷', label: t('landing.menuScanner') },
            { icon: '🍽️', label: t('landing.dishChecker') },
            { icon: '🚨', label: t('landing.emergencyCard') },
            { icon: '🌍', label: t('landing.translatorLabel') },
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-emerald-100 hover:shadow-md hover:scale-105 transition-all"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <div className="text-sm font-semibold text-gray-700">{feature.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/home')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold px-14 py-5 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer active:scale-95"
        >
          {t('landing.startButton')}
        </button>

        <div className="flex justify-center gap-8 mt-10 text-sm text-gray-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">6+</div>
            <div>{t('landing.restaurants')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">30+</div>
            <div>{t('landing.dishes')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">17</div>
            <div>{t('landing.allergyTypes')}</div>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-8">{t('common.builtFor')}</p>
      </div>
    </div>
  )
}
