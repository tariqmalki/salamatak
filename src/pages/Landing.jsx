import { useNavigate } from 'react-router-dom'

/**
 * Landing Page - The first screen users see when opening the app
 *
 * Features:
 * - App branding with name in English + Arabic
 * - Short description of what the app does
 * - Feature highlights grid
 * - Animated "Start" button to enter the app
 * - Saudi Arabia themed footer
 */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col items-center justify-center px-4">
      {/* Hero section */}
      <div className="text-center max-w-2xl">
        {/* App logo with bounce animation */}
        <div className="mb-6 animate-bounce">
          <img src="/salamatak/logo.svg" alt="Salamatak logo" className="h-28 w-28 mx-auto" />
        </div>

        {/* App title - English */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-emerald-800 mb-2 tracking-tight">
          Salamatak
        </h1>
        {/* App title - Arabic */}
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-600 mb-6">
          سلامتك
        </h2>

        {/* Description - English */}
        <p className="text-lg text-gray-600 mb-2 leading-relaxed">
          Your personal food allergy safety companion.
          <br />
          Scan menus, check dishes, and stay safe while dining out.
        </p>
        {/* Description - Arabic */}
        <p className="text-lg text-gray-500 mb-8 leading-relaxed" dir="rtl">
          رفيقك الشخصي للسلامة من حساسية الطعام
          <br />
          امسح القوائم، افحص الأطباق، وكن آمنًا أثناء تناول الطعام
        </p>

        {/* Feature highlights - show 4 key features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: '📷', label: 'Menu Scanner', labelAr: 'ماسح القائمة' },
            { icon: '🍽️', label: 'Dish Checker', labelAr: 'فحص الطبق' },
            { icon: '🚨', label: 'Emergency Card', labelAr: 'بطاقة الطوارئ' },
            { icon: '🌍', label: 'Translator', labelAr: 'مترجم الحساسية' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-emerald-100 hover:shadow-md hover:scale-105 transition-all"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <div className="text-sm font-semibold text-gray-700">{feature.label}</div>
              <div className="text-xs text-gray-400">{feature.labelAr}</div>
            </div>
          ))}
        </div>

        {/* Main start button */}
        <button
          onClick={() => navigate('/home')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold px-14 py-5 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer active:scale-95"
        >
          Start Now - ابدأ الآن 🚀
        </button>

        {/* Stats bar */}
        <div className="flex justify-center gap-8 mt-10 text-sm text-gray-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">6+</div>
            <div>Restaurants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">30+</div>
            <div>Dishes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-700">5</div>
            <div>Allergy Types</div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-sm text-gray-400 mt-8">
          Built for high school students in Saudi Arabia 🇸🇦
        </p>
      </div>
    </div>
  )
}
