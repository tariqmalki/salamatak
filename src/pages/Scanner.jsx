import { useState } from 'react'
import { ALLERGY_TYPES } from '../data/allergens'
import { useLanguage } from '../context/LanguageContext'
import { analyzeImage, checkIngredientsForAllergens } from '../data/imageAnalysisService'

/**
 * Scanner - Analyzes the ACTUAL uploaded food image for ingredients
 *
 * Pipeline: Image upload → Canvas pixel analysis → Color-based ingredient
 * detection → Allergy comparison → Highlighted results
 *
 * NO mock meals. NO restaurant data. NO predefined lists.
 * Each image is analyzed individually based on its visual content.
 */
export default function Scanner() {
  const { t, isAr } = useLanguage()

  const [selectedAllergies, setSelectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts']
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
      setAnalysisResult(null)
    }
  }

  // Analyze the ACTUAL uploaded image - no mock data
  const handleScan = async () => {
    if (!imagePreview) return
    setScanning(true)
    setAnalysisResult(null)

    // Step 1: Analyze the image pixels to detect food ingredients
    const { detectedFoods } = await analyzeImage(imagePreview)

    // Step 2: Compare detected ingredients against user's allergies
    const result = checkIngredientsForAllergens(detectedFoods, selectedAllergies)

    setAnalysisResult(result)
    setScanning(false)
  }

  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const clearAll = () => {
    setImagePreview(null)
    setAnalysisResult(null)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">{t('scanner.title')}</h1>
      <p className="text-gray-500 mb-6">{t('scanner.subtitle')}</p>

      {/* Allergy selection */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">{t('scanner.checkFor')}</h3>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_TYPES.map((allergy) => (
            <button
              key={allergy.id}
              onClick={() => toggleAllergy(allergy.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                selectedAllergies.includes(allergy.id)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
              }`}
            >
              {allergy.icon} {isAr ? allergy.labelAr : allergy.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image upload area */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6 text-center">
        {imagePreview ? (
          <div>
            <img src={imagePreview} alt="Uploaded meal" className="max-h-72 mx-auto rounded-xl mb-4 shadow-md" />
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={handleScan}
                disabled={scanning || selectedAllergies.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold px-8 py-3 rounded-full transition-all cursor-pointer"
              >
                {scanning ? (isAr ? '🔍 جاري التحليل...' : '🔍 Analyzing...') : (isAr ? '🔍 تحليل الصورة' : '🔍 Analyze Image')}
              </button>
              <button
                onClick={clearAll}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-6 py-3 rounded-full transition-all cursor-pointer"
              >
                {t('common.clear')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-500 mb-2">{isAr ? 'ارفع صورة الوجبة لتحليلها' : 'Upload a meal photo to analyze it'}</p>
            <p className="text-gray-400 text-sm mb-4">{isAr ? 'سيتم تحليل الصورة الفعلية لاكتشاف المكونات' : 'The actual image will be analyzed to detect ingredients'}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <label className="cursor-pointer inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-full transition-all">
                {isAr ? '📷 التقط صورة' : '📷 Take Photo'}
                <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
              </label>
              <label className="cursor-pointer inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full transition-all">
                {isAr ? '🖼️ اختر من المعرض' : '🖼️ Choose from Gallery'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Scanning animation */}
      {scanning && (
        <div className="text-center py-8">
          <div className="text-5xl animate-pulse mb-4">🤖</div>
          <p className="text-emerald-700 font-medium">{isAr ? 'جاري تحليل صورة الوجبة...' : 'Analyzing meal image...'}</p>
          <p className="text-gray-400 text-sm">{isAr ? 'اكتشاف المكونات من الصورة والتحقق من المسببات' : 'Detecting ingredients from image and checking for allergens'}</p>
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Analysis results */}
      {analysisResult && !scanning && (
        <div>
          {/* Overall verdict */}
          {analysisResult.hasAnyAllergen ? (
            <div className="bg-red-50 rounded-2xl p-5 border-2 border-red-300 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🚫</span>
                <div>
                  <h3 className="text-xl font-bold text-red-700">
                    {isAr ? 'تحذير! تم اكتشاف مسببات حساسية' : 'Warning! Allergens detected'}
                  </h3>
                  <p className="text-red-600 text-sm">
                    {isAr
                      ? 'هذه الوجبة تحتوي على مكونات لديك حساسية منها. لا تأكل هذه الوجبة.'
                      : 'This meal contains ingredients you are allergic to. Do NOT eat this meal.'}
                  </p>
                </div>
              </div>
            </div>
          ) : analysisResult.ingredients.length > 0 ? (
            <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-300 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">✅</span>
                <div>
                  <h3 className="text-xl font-bold text-green-700">
                    {isAr ? 'لم يتم اكتشاف مسببات حساسية' : 'No allergens detected in this meal'}
                  </h3>
                  <p className="text-green-600 text-sm">
                    {isAr
                      ? 'بناءً على تحليل الصورة، لم يتم العثور على مكونات تسبب لك حساسية.'
                      : 'Based on image analysis, no ingredients matching your allergies were found.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 rounded-2xl p-5 border-2 border-yellow-300 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">⚠️</span>
                <div>
                  <h3 className="text-xl font-bold text-yellow-700">
                    {isAr ? 'لم يتم التعرف على مكونات واضحة' : 'No clear ingredients detected'}
                  </h3>
                  <p className="text-yellow-600 text-sm">
                    {isAr
                      ? 'حاول التقاط صورة أوضح للوجبة مع إضاءة جيدة.'
                      : 'Try taking a clearer photo of the meal with good lighting.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detected ingredients list */}
          {analysisResult.ingredients.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">
                {isAr ? '🍽️ المكونات المكتشفة من الصورة:' : '🍽️ Ingredients detected from image:'}
              </h3>

              <div className="space-y-3">
                {analysisResult.ingredients.map((item, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-4 border-2 transition-all ${
                      item.isDangerous
                        ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Danger indicator */}
                        <span className={`text-2xl shrink-0 ${item.isDangerous ? 'animate-pulse' : ''}`}>
                          {item.isDangerous ? '🔴' : '🟢'}
                        </span>
                        <div>
                          <div className={`font-semibold ${item.isDangerous ? 'text-red-800' : 'text-gray-800'}`}>
                            {isAr ? item.nameAr : item.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {isAr ? item.name : item.nameAr}
                          </div>
                          {/* Show which allergies this ingredient triggers */}
                          {item.isDangerous && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.matchedAllergies.map((a) => (
                                <span key={a.id} className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-bold">
                                  {a.icon} {isAr ? a.labelAr : a.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Confidence bar */}
                      <div className="shrink-0 text-center">
                        <div className="text-xs text-gray-400 mb-1">{isAr ? 'الثقة' : 'Confidence'}</div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.isDangerous ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.confidence}%</div>
                      </div>
                    </div>

                    {/* Warning message for dangerous ingredients */}
                    {item.isDangerous && (
                      <div className="mt-3 bg-red-100 rounded-lg p-2 border border-red-200">
                        <p className="text-red-700 text-sm font-medium">
                          {isAr
                            ? `⚠️ هذه الوجبة تحتوي على ${item.nameAr}، وأنت لديك حساسية منها. لا تأكل هذه الوجبة.`
                            : `⚠️ This meal contains ${item.name}, which you are allergic to. Do NOT eat this meal.`}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Analysis note */}
              <div className="mt-4 bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">
                  {isAr
                    ? '📊 التحليل مبني على المحتوى المرئي للصورة. للتأكد، اسأل موظفي المطعم عن المكونات.'
                    : '📊 Analysis is based on the visual content of the image. For certainty, ask restaurant staff about ingredients.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
