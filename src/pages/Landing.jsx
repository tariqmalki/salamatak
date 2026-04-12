import { useNavigate } from 'react-router-dom'

// Landing page - first screen users see
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col items-center justify-center px-4">
      {/* Hero section */}
      <div className="text-center max-w-2xl">
        {/* App icon */}
        <div className="text-8xl mb-6 animate-bounce">🛡️</div>

        {/* App title */}
        <h1 className="text-5xl md:text-6xl font-bold text-emerald-800 mb-2">
          Salamatak
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-600 mb-6">
          سلامتك
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-2 leading-relaxed">
          Your personal food allergy safety companion.
        </p>
        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
          رفيقك الشخصي للسلامة من حساسية الطعام
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: '📷', label: 'Menu Scanner' },
            { icon: '🍽️', label: 'Dish Checker' },
            { icon: '🚨', label: 'Emergency Card' },
            { icon: '🌍', label: 'Translator' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="bg-white/80 rounded-2xl p-4 shadow-sm border border-emerald-100"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <div className="text-sm font-medium text-gray-700">{feature.label}</div>
            </div>
          ))}
        </div>

        {/* Start button */}
        <button
          onClick={() => navigate('/home')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold px-12 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
        >
          Start Now - ابدأ الآن
        </button>

        {/* Footer note */}
        <p className="text-sm text-gray-400 mt-8">
          Built for high school students in Saudi Arabia 🇸🇦
        </p>
      </div>
    </div>
  )
}
