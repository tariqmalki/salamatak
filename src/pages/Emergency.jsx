import { useState } from 'react'
import { ALLERGY_TYPES } from '../data/allergens'

// Emergency Mode - displays medical card with allergy info
// Uses large, readable text for quick access in emergencies
export default function Emergency() {
  const [selectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts']
  })

  const [emergencyContact, setEmergencyContact] = useState(() => {
    return localStorage.getItem('salamatak-emergency-contact') || '997'
  })

  const [editing, setEditing] = useState(false)
  const [tempContact, setTempContact] = useState(emergencyContact)

  const saveContact = () => {
    localStorage.setItem('salamatak-emergency-contact', tempContact)
    setEmergencyContact(tempContact)
    setEditing(false)
  }

  // Get full allergy data for selected allergies
  const userAllergies = ALLERGY_TYPES.filter((a) => selectedAllergies.includes(a.id))

  // Forbidden foods per allergy
  const forbiddenFoods = {
    nuts: ['Peanuts', 'Almonds', 'Cashews', 'Walnuts', 'Pistachios', 'Hazelnuts', 'Nutella', 'Peanut butter', 'Marzipan'],
    milk: ['Milk', 'Cheese', 'Butter', 'Cream', 'Yogurt', 'Ice cream', 'Whey protein', 'Béchamel sauce'],
    eggs: ['Eggs', 'Mayonnaise', 'Meringue', 'Custard', 'Egg noodles', 'Some bread', 'Cake', 'Cookies'],
    gluten: ['Bread', 'Pasta', 'Pizza dough', 'Cakes', 'Cookies', 'Flour tortillas', 'Soy sauce', 'Beer'],
    seafood: ['Shrimp', 'Fish', 'Lobster', 'Crab', 'Oysters', 'Calamari', 'Sushi', 'Fish sauce'],
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Big emergency header */}
      <div className="bg-red-600 text-white rounded-3xl p-8 text-center mb-6 shadow-lg">
        <div className="text-6xl mb-4">🚨</div>
        <h1 className="text-4xl font-bold mb-2">EMERGENCY CARD</h1>
        <h2 className="text-2xl font-bold">بطاقة الطوارئ</h2>
        <p className="text-red-200 mt-2">Show this card to medical staff or restaurant employees</p>
      </div>

      {/* Medical card */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-red-200 overflow-hidden mb-6">
        {/* Card header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100">
          <h3 className="text-xl font-bold text-red-800">⚕️ Medical Information / معلومات طبية</h3>
        </div>

        {/* Allergy types */}
        <div className="p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">My Allergies / أنواع الحساسية:</h4>

          {userAllergies.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No allergies selected. Go to Home page to set your allergies.
            </p>
          ) : (
            <div className="space-y-4">
              {userAllergies.map((allergy) => (
                <div key={allergy.id} className="bg-red-50 rounded-2xl p-5 border border-red-100">
                  {/* Allergy name - large text */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{allergy.icon}</span>
                    <div>
                      <div className="text-2xl font-bold text-red-700">{allergy.label}</div>
                      <div className="text-xl text-red-600">{allergy.labelAr}</div>
                    </div>
                  </div>

                  {/* Forbidden foods */}
                  <div>
                    <div className="text-sm font-semibold text-red-800 mb-2">
                      ⛔ Forbidden Foods / أطعمة ممنوعة:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(forbiddenFoods[allergy.id] || []).map((food) => (
                        <span
                          key={food}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          ❌ {food}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emergency contact */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
          <h4 className="text-lg font-bold text-gray-800 mb-3">
            📞 Emergency Contact / رقم الطوارئ:
          </h4>

          {editing ? (
            <div className="flex gap-2">
              <input
                type="tel"
                value={tempContact}
                onChange={(e) => setTempContact(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Enter phone number"
              />
              <button
                onClick={saveContact}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a
                href={`tel:${emergencyContact}`}
                className="flex-1 bg-red-600 text-white text-3xl font-bold py-4 rounded-2xl text-center no-underline hover:bg-red-700 transition-colors block"
              >
                📞 {emergencyContact}
              </a>
              <button
                onClick={() => setEditing(true)}
                className="bg-gray-200 text-gray-600 px-4 py-4 rounded-2xl font-medium cursor-pointer hover:bg-gray-300 transition-colors"
              >
                ✏️ Edit
              </button>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <a
              href="tel:997"
              className="flex-1 bg-red-100 text-red-700 py-2 rounded-xl text-center font-medium no-underline text-sm hover:bg-red-200 transition-colors"
            >
              🏥 Saudi Emergency: 997
            </a>
            <a
              href="tel:911"
              className="flex-1 bg-red-100 text-red-700 py-2 rounded-xl text-center font-medium no-underline text-sm hover:bg-red-200 transition-colors"
            >
              🚑 Ambulance: 911
            </a>
          </div>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href="tel:997"
          className="bg-red-600 text-white rounded-2xl p-5 text-center font-bold text-lg no-underline hover:bg-red-700 transition-colors"
        >
          🚑 Call Emergency
          <br />
          <span className="text-sm font-normal">اتصل بالطوارئ</span>
        </a>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'My Allergy Card - Salamatak',
                text: `ALLERGY ALERT: I have allergies to: ${userAllergies.map(a => a.label).join(', ')}. Emergency contact: ${emergencyContact}`,
              })
            }
          }}
          className="bg-blue-600 text-white rounded-2xl p-5 text-center font-bold text-lg cursor-pointer hover:bg-blue-700 transition-colors"
        >
          📤 Share Card
          <br />
          <span className="text-sm font-normal">مشاركة البطاقة</span>
        </button>
      </div>
    </div>
  )
}
