import { useState } from 'react'
import { ALLERGY_TYPES } from '../data/allergens'
import { useLanguage } from '../context/LanguageContext'

export default function Emergency() {
  const { t, isAr } = useLanguage()

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

  const userAllergies = ALLERGY_TYPES.filter((a) => selectedAllergies.includes(a.id))

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-red-600 text-white rounded-3xl p-8 text-center mb-6 shadow-lg">
        <div className="text-6xl mb-4">🚨</div>
        <h1 className="text-4xl font-extrabold mb-2">{t('emergency.title')}</h1>
        <h2 className="text-2xl font-bold">{t('emergency.titleEn')}</h2>
        <p className="text-red-200 mt-2 text-sm">{t('emergency.showCard')}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border-2 border-red-200 overflow-hidden mb-6">
        <div className="bg-red-50 px-6 py-4 border-b border-red-100">
          <h3 className="text-xl font-bold text-red-800">{t('emergency.medicalInfo')}</h3>
        </div>

        <div className="p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">{t('emergency.myAllergies')}</h4>

          {userAllergies.length === 0 ? (
            <p className="text-gray-400 text-center py-4">{t('common.noAllergiesSelected')}</p>
          ) : (
            <div className="space-y-4">
              {userAllergies.map((allergy) => (
                <div key={allergy.id} className="bg-red-50 rounded-2xl p-5 border border-red-100">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{allergy.icon}</span>
                    <div>
                      <div className="text-2xl font-bold text-red-700">{isAr ? allergy.labelAr : allergy.label}</div>
                      <div className="text-xl text-red-600">{isAr ? allergy.label : allergy.labelAr}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-red-800 mb-2">{t('emergency.forbiddenFoods')}</div>
                    <div className="flex flex-wrap gap-2">
                      {(t(`forbidden.${allergy.id}`) || []).map((food) => (
                        <span key={food} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
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

        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100">
          <h4 className="text-lg font-bold text-gray-800 mb-3">{t('emergency.emergencyContact')}</h4>

          {editing ? (
            <div className="flex gap-2">
              <input
                type="tel"
                value={tempContact}
                onChange={(e) => setTempContact(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder={t('emergency.enterPhone')}
              />
              <button onClick={saveContact} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-emerald-700 transition-colors">
                {t('common.save')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a href={`tel:${emergencyContact}`} className="flex-1 bg-red-600 text-white text-3xl font-bold py-4 rounded-2xl text-center no-underline hover:bg-red-700 transition-colors block">
                📞 {emergencyContact}
              </a>
              <button onClick={() => setEditing(true)} className="bg-gray-200 text-gray-600 px-4 py-4 rounded-2xl font-medium cursor-pointer hover:bg-gray-300 transition-colors">
                {t('emergency.edit')}
              </button>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <a href="tel:997" className="flex-1 bg-red-100 text-red-700 py-2 rounded-xl text-center font-medium no-underline text-sm hover:bg-red-200 transition-colors">
              {t('emergency.saudiEmergency')}
            </a>
            <a href="tel:911" className="flex-1 bg-red-100 text-red-700 py-2 rounded-xl text-center font-medium no-underline text-sm hover:bg-red-200 transition-colors">
              {t('emergency.ambulance')}
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a href="tel:997" className="bg-red-600 text-white rounded-2xl p-5 text-center font-bold text-lg no-underline hover:bg-red-700 transition-colors">
          {t('emergency.callEmergency')}
          <br />
          <span className="text-sm font-normal">{t('emergency.callEmergencySub')}</span>
        </a>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: isAr ? 'بطاقة الحساسية - سلامتك' : 'My Allergy Card - Salamatak',
                text: `${isAr ? 'تنبيه حساسية: لدي حساسية من' : 'ALLERGY ALERT: I have allergies to'}: ${userAllergies.map(a => isAr ? a.labelAr : a.label).join(', ')}. ${isAr ? 'رقم الطوارئ' : 'Emergency contact'}: ${emergencyContact}`,
              })
            }
          }}
          className="bg-blue-600 text-white rounded-2xl p-5 text-center font-bold text-lg cursor-pointer hover:bg-blue-700 transition-colors"
        >
          {t('emergency.shareCard')}
          <br />
          <span className="text-sm font-normal">{t('emergency.shareCardSub')}</span>
        </button>
      </div>
    </div>
  )
}
