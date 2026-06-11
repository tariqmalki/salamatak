import { useState, useRef } from 'react'
import { ALLERGY_TYPES } from '../data/allergens'
import { useLanguage } from '../context/LanguageContext'
import { lookupBarcode, isIngredientAllergen } from '../data/barcodeService'

export default function BarcodeScanner() {
  const { t, isAr } = useLanguage()

  const [barcode, setBarcode] = useState('')
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [detectingBarcode, setDetectingBarcode] = useState(false)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)

  // Read allergies fresh from localStorage on every render to stay in sync
  const getSelectedAllergies = () => {
    try {
      const saved = localStorage.getItem('salamatak-allergies')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  }

  const [selectedAllergies, setSelectedAllergies] = useState(getSelectedAllergies)

  const handleScan = async () => {
    if (!barcode.trim()) return
    setScanning(true)
    setNotFound(false)
    setResult(null)
    setError(null)

    // Re-read allergies fresh at scan time to catch any changes
    const freshAllergies = getSelectedAllergies()
    setSelectedAllergies(freshAllergies)

    if (freshAllergies.length === 0) {
      setError('لم يتم اختيار أي حساسية. اذهب للصفحة الرئيسية لتحديد حساسيتك.')
      setScanning(false)
      return
    }

    try {
      const product = await lookupBarcode(barcode.trim(), freshAllergies)
      if (product) {
        setResult(product)
      } else {
        setNotFound(true)
      }
    } catch {
      setError('حدث خطأ أثناء البحث. حاول مرة أخرى.')
    } finally {
      setScanning(false)
    }
  }

  const startCamera = async () => {
    setCameraError(null)
    setPhotoPreview(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      setCameraActive(true)
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      }, 100)
    } catch {
      setCameraError('لا يمكن الوصول للكاميرا. تأكد من إعطاء الإذن.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
    setCameraActive(false)
    setPhotoPreview(null)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setPhotoPreview(canvas.toDataURL('image/png'))
    detectBarcodeFromImage(canvas)
  }

  const detectBarcodeFromImage = async (canvas) => {
    setDetectingBarcode(true)
    if ('BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] })
        const barcodes = await detector.detect(canvas)
        if (barcodes.length > 0) { setBarcode(barcodes[0].rawValue); stopCamera(); setDetectingBarcode(false); return }
      } catch { /* fall through */ }
    }
    setDetectingBarcode(false)
  }

  const handleFileCapture = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setDetectingBarcode(true)
    if ('BarcodeDetector' in window) {
      try {
        const bitmap = await createImageBitmap(file)
        const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] })
        const barcodes = await detector.detect(bitmap)
        if (barcodes.length > 0) { setBarcode(barcodes[0].rawValue); setDetectingBarcode(false); return }
      } catch { /* fall through */ }
    }
    setDetectingBarcode(false)
  }

  const sampleBarcodes = [
    { code: '5000159484695', label: 'كيت كات' },
    { code: '3017620422003', label: 'نوتيلا' },
    { code: '7622210449283', label: 'أوريو' },
    { code: '5449000000996', label: 'كوكا كولا' },
    { code: '8690504032956', label: 'إندومي' },
    { code: '5000159407236', label: 'مارس' },
    { code: '6281000000011', label: 'سنيكرز' },
    { code: '6281000000008', label: 'ناغتس أمريكانا' },
  ]

  const hasAllergens = result?.matchedAllergenIds?.length > 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">{t('barcode.title')}</h1>
      <p className="text-gray-500 mb-6">{t('barcode.subtitle')}</p>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        {!cameraActive && (
          <div className="flex gap-3 mb-4">
            <button onClick={startCamera}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
              <span className="text-xl">📸</span>
              {isAr ? 'افتح الكاميرا' : 'Open Camera'}
            </button>
            <label className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
              <span className="text-xl">🖼️</span>
              {isAr ? 'رفع صورة باركود' : 'Upload Barcode Photo'}
              <input type="file" accept="image/*" capture="environment" onChange={handleFileCapture} className="hidden" />
            </label>
          </div>
        )}

        {cameraError && (
          <div className="bg-red-50 rounded-xl p-3 mb-4 text-center">
            <p className="text-red-600 text-sm">{cameraError}</p>
          </div>
        )}

        {cameraActive && (
          <div className="mb-4">
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-24 border-2 border-white/70 rounded-lg">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/60 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={capturePhoto}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2">
                <span className="text-xl">📷</span>
                {isAr ? 'التقط صورة' : 'Take Photo'}
              </button>
              <button onClick={stopCamera}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl cursor-pointer">
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}

        {photoPreview && !cameraActive && (
          <div className="mb-4">
            <img src={photoPreview} alt="باركود" className="w-full max-h-48 object-contain rounded-xl border border-gray-200" />
            {detectingBarcode && <p className="text-center text-emerald-600 text-sm mt-2 animate-pulse">🔍 جاري اكتشاف الباركود...</p>}
            {!detectingBarcode && !barcode && <p className="text-center text-gray-500 text-sm mt-2">لم يتم اكتشاف باركود تلقائياً. أدخل الرقم يدوياً أدناه.</p>}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-3">
          <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)}
            placeholder={t('barcode.placeholder')}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-300"
            onKeyDown={(e) => e.key === 'Enter' && handleScan()} />
          <button onClick={handleScan} disabled={!barcode.trim() || scanning}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl cursor-pointer whitespace-nowrap">
            {scanning ? t('common.scanning') : t('common.scan')}
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-400 mb-2">{t('barcode.sampleTitle')}</p>
          <div className="flex flex-wrap gap-2">
            {sampleBarcodes.map((s) => (
              <button key={s.code} onClick={() => setBarcode(s.code)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 font-mono cursor-pointer">
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {scanning && (
        <div className="text-center py-8">
          <div className="text-6xl animate-pulse mb-3">📡</div>
          <p className="text-emerald-700 font-medium">{t('barcode.scanningText')}</p>
          <p className="text-gray-400 text-sm">{t('barcode.scanningSub')}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200 text-center mb-6">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {notFound && (
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">المنتج غير موجود</h3>
          <p className="text-gray-500">المنتج برقم "{barcode}" غير موجود في قاعدة البيانات. جرب منتجًا آخر.</p>
        </div>
      )}

      {result && !scanning && (
        <div className={`rounded-2xl border-2 overflow-hidden ${hasAllergens ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
          <div className="p-6">
            {/* Product header */}
            <div className="flex items-start gap-4 mb-5">
              {result.image && (
                <img src={result.image} alt={result.name} className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-800">{result.name}</h3>
                <p className="text-sm text-gray-500 mt-1">العلامة التجارية: {result.brand}</p>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {result.source === 'api' ? '🌐 بيانات حية من Open Food Facts' : '📦 بيانات محلية'}
                </span>
              </div>
              <span className={`text-lg font-bold shrink-0 ${hasAllergens ? 'text-red-700' : 'text-green-700'}`}>
                {hasAllergens ? '🟥 خطر عالي' : '🟩 آمن'}
              </span>
            </div>

            {/* Ingredients - ALWAYS in Arabic */}
            {result.ingredientsAr.length > 0 ? (
              <div className="mb-5">
                <h4 className="font-semibold text-gray-700 mb-2">المكونات:</h4>
                <div className="flex flex-wrap gap-2" dir="rtl">
                  {result.ingredientsAr.map((ingredientAr, idx) => {
                    const ingredientEn = result.ingredientsEn[idx] || ''
                    const matchedAllergyId = isIngredientAllergen(ingredientAr, ingredientEn, selectedAllergies)
                    const isDangerous = matchedAllergyId !== null
                    const allergyData = isDangerous ? ALLERGY_TYPES.find((a) => a.id === matchedAllergyId) : null
                    return (
                      <span key={`${ingredientAr}-${idx}`}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          isDangerous
                            ? 'bg-red-200 text-red-800 border-2 border-red-400 ring-2 ring-red-200'
                            : 'bg-white text-gray-600 border border-gray-200'
                        }`}>
                        {isDangerous && <span className="ml-1">{allergyData?.icon} 🔴</span>}
                        {ingredientAr}
                      </span>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-5 bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
                <p className="text-yellow-700 font-medium">لم يتم العثور على مكونات المنتج</p>
                <p className="text-yellow-600 text-sm mt-1">هذا المنتج لا يحتوي على قائمة مكونات في قاعدة البيانات.</p>
              </div>
            )}

            {/* Matched allergens */}
            {hasAllergens && (
              <div className="mb-5">
                <h4 className="font-semibold text-red-700 mb-2">يحتوي على مسببات حساسية:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.matchedAllergenIds.map((allergenId) => {
                    const allergy = ALLERGY_TYPES.find((a) => a.id === allergenId)
                    return (
                      <span key={allergenId} className="px-4 py-2 rounded-full text-sm font-bold bg-red-600 text-white">
                        {allergy?.icon} {allergy?.labelAr} - لديك حساسية!
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Final verdict */}
            {hasAllergens ? (
              <div className="bg-red-100 rounded-xl p-4 border border-red-300">
                <p className="text-red-800 font-bold text-lg">🚫 خطر: هذا المنتج يحتوي على مسببات حساسية لديك!</p>
                <p className="text-red-600 text-sm mt-1">لا تتناول هذا المنتج.</p>
              </div>
            ) : (
              <div className="bg-green-100 rounded-xl p-4 border border-green-300">
                <p className="text-green-800 font-bold">✅ يبدو هذا المنتج آمنًا لحساسيتك!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
