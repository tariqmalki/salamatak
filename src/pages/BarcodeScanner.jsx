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

  const [selectedAllergies] = useState(() => {
    const saved = localStorage.getItem('salamatak-allergies')
    return saved ? JSON.parse(saved) : ['nuts']
  })

  const handleScan = async () => {
    if (!barcode.trim()) return
    setScanning(true)
    setNotFound(false)
    setResult(null)
    setError(null)

    try {
      const product = await lookupBarcode(barcode.trim(), selectedAllergies)
      if (product) {
        setResult(product)
      } else {
        setNotFound(true)
      }
    } catch {
      setError(isAr ? 'حدث خطأ أثناء البحث. حاول مرة أخرى.' : 'An error occurred. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  // Open the device camera
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
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch {
      setCameraError(isAr ? 'لا يمكن الوصول للكاميرا. تأكد من إعطاء الإذن.' : 'Cannot access camera. Please grant permission.')
    }
  }

  // Stop the camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
    setPhotoPreview(null)
  }

  // Capture a photo from the video feed
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/png')
    setPhotoPreview(imageData)
    detectBarcodeFromImage(canvas)
  }

  // Try to detect barcode from the captured image using BarcodeDetector API
  const detectBarcodeFromImage = async (canvas) => {
    setDetectingBarcode(true)

    // Try native BarcodeDetector API (Chrome, Edge, Android)
    if ('BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
        })
        const barcodes = await detector.detect(canvas)
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue
          setBarcode(code)
          stopCamera()
          setDetectingBarcode(false)
          return
        }
      } catch {
        // BarcodeDetector failed, fall through
      }
    }

    setDetectingBarcode(false)
    // If detection failed, keep the photo and let user type manually
  }

  // Handle image file upload (for devices where camera stream doesn't work)
  const handleFileCapture = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoPreview(URL.createObjectURL(file))
    setDetectingBarcode(true)

    // Try BarcodeDetector on the uploaded image
    if ('BarcodeDetector' in window) {
      try {
        const bitmap = await createImageBitmap(file)
        const detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
        })
        const barcodes = await detector.detect(bitmap)
        if (barcodes.length > 0) {
          setBarcode(barcodes[0].rawValue)
          setDetectingBarcode(false)
          return
        }
      } catch {
        // Fall through
      }
    }

    setDetectingBarcode(false)
  }

  const sampleBarcodes = [
    { code: '5000159484695', label: isAr ? 'كيت كات' : 'KitKat' },
    { code: '3017620422003', label: isAr ? 'نوتيلا' : 'Nutella' },
    { code: '7622210449283', label: isAr ? 'أوريو' : 'Oreo' },
    { code: '5449000000996', label: isAr ? 'كوكا كولا' : 'Coca-Cola' },
    { code: '8690504032956', label: isAr ? 'إندومي' : 'Indomie' },
    { code: '5000159407236', label: isAr ? 'مارس' : 'Mars Bar' },
    { code: '6281000000011', label: isAr ? 'سنيكرز (محلي)' : 'Snickers (local)' },
    { code: '6281000000008', label: isAr ? 'ناغتس (محلي)' : 'Nuggets (local)' },
  ]

  const hasAllergens = result?.matchedAllergenIds?.length > 0
  const riskLevel = !result ? 'green' : hasAllergens ? 'red' : 'green'
  const riskColors = { red: 'bg-red-50 border-red-300', green: 'bg-green-50 border-green-300' }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">{t('barcode.title')}</h1>
      <p className="text-gray-500 mb-6">{t('barcode.subtitle')}</p>

      {/* Camera section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        {/* Camera buttons */}
        {!cameraActive && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={startCamera}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="text-xl">📸</span>
              {isAr ? 'افتح الكاميرا' : 'Open Camera'}
            </button>
            <label className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
              <span className="text-xl">🖼️</span>
              {isAr ? 'رفع صورة باركود' : 'Upload Barcode Photo'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileCapture}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Camera error */}
        {cameraError && (
          <div className="bg-red-50 rounded-xl p-3 mb-4 text-center">
            <p className="text-red-600 text-sm">{cameraError}</p>
          </div>
        )}

        {/* Live camera feed */}
        {cameraActive && (
          <div className="mb-4">
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl" />
              {/* Scan target overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-24 border-2 border-white/70 rounded-lg">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/60 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <button
                onClick={capturePhoto}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="text-xl">📷</span>
                {isAr ? 'التقط صورة' : 'Take Photo'}
              </button>
              <button
                onClick={stopCamera}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-all cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}

        {/* Photo preview after capture */}
        {photoPreview && !cameraActive && (
          <div className="mb-4">
            <img src={photoPreview} alt="Captured barcode" className="w-full max-h-48 object-contain rounded-xl border border-gray-200" />
            {detectingBarcode && (
              <p className="text-center text-emerald-600 text-sm mt-2 animate-pulse">
                {isAr ? '🔍 جاري اكتشاف الباركود...' : '🔍 Detecting barcode...'}
              </p>
            )}
            {!detectingBarcode && !barcode && (
              <p className="text-center text-gray-500 text-sm mt-2">
                {isAr ? 'لم يتم اكتشاف باركود تلقائياً. أدخل الرقم يدوياً أدناه.' : 'Barcode not detected automatically. Enter the number manually below.'}
              </p>
            )}
          </div>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Manual barcode input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder={t('barcode.placeholder')}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
          <button
            onClick={handleScan}
            disabled={!barcode.trim() || scanning}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            {scanning ? t('common.scanning') : t('common.scan')}
          </button>
        </div>

        {/* Sample barcodes */}
        <div className="mt-4">
          <p className="text-xs text-gray-400 mb-2">{t('barcode.sampleTitle')}</p>
          <div className="flex flex-wrap gap-2">
            {sampleBarcodes.map((sample) => (
              <button
                key={sample.code}
                onClick={() => setBarcode(sample.code)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors font-mono cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scanning animation */}
      {scanning && (
        <div className="text-center py-8">
          <div className="text-6xl animate-pulse mb-3">📡</div>
          <p className="text-emerald-700 font-medium">{t('barcode.scanningText')}</p>
          <p className="text-gray-400 text-sm">{t('barcode.scanningSub')}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200 text-center mb-6">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Not found */}
      {notFound && (
        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">{t('barcode.notFound')}</h3>
          <p className="text-gray-500">
            {isAr
              ? `المنتج برقم "${barcode}" غير موجود. جرب منتجًا آخر.`
              : `Product not found for barcode "${barcode}". Please try another item.`}
          </p>
        </div>
      )}

      {/* Result card */}
      {result && !scanning && (
        <div className={`rounded-2xl border-2 overflow-hidden ${riskColors[riskLevel]}`}>
          <div className="p-6">
            {/* Product header */}
            <div className="flex items-start gap-4 mb-5">
              {result.image && (
                <img src={result.image} alt={result.name} className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-800">{result.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('barcode.brand')} {result.brand}</p>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {result.source === 'api'
                    ? (isAr ? '🌐 بيانات حية من Open Food Facts' : '🌐 Live data from Open Food Facts')
                    : (isAr ? '📦 بيانات محلية' : '📦 Local database')}
                </span>
              </div>
              <span className={`text-lg font-bold shrink-0 ${hasAllergens ? 'text-red-700' : 'text-green-700'}`}>
                {hasAllergens ? t('barcode.highRisk') : t('barcode.safeRisk')}
              </span>
            </div>

            {/* Ingredients */}
            {result.ingredients.length > 0 && (
              <div className="mb-5">
                <h4 className="font-semibold text-gray-700 mb-2">{t('barcode.ingredientsLabel')}</h4>
                <div className="flex flex-wrap gap-2">
                  {result.ingredients.map((ingredient, idx) => {
                    const matchedAllergyId = isIngredientAllergen(ingredient, selectedAllergies)
                    const isDangerous = matchedAllergyId !== null
                    const allergyData = isDangerous ? ALLERGY_TYPES.find((a) => a.id === matchedAllergyId) : null
                    return (
                      <span key={`${ingredient}-${idx}`}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          isDangerous
                            ? 'bg-red-200 text-red-800 border-2 border-red-400 ring-2 ring-red-200'
                            : 'bg-white text-gray-600 border border-gray-200'
                        }`}>
                        {isDangerous && <span className={isAr ? 'ml-1' : 'mr-1'}>{allergyData?.icon} 🔴</span>}
                        {ingredient}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {result.ingredients.length === 0 && (
              <div className="mb-5 bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-gray-500 text-sm">
                  {isAr ? 'لا توجد قائمة مكونات متاحة لهذا المنتج.' : 'No ingredients list available for this product.'}
                </p>
              </div>
            )}

            {/* Matched allergens */}
            {hasAllergens && (
              <div className="mb-5">
                <h4 className="font-semibold text-red-700 mb-2">{t('barcode.containsAllergens')}</h4>
                <div className="flex flex-wrap gap-2">
                  {result.matchedAllergenIds.map((allergenId) => {
                    const allergy = ALLERGY_TYPES.find((a) => a.id === allergenId)
                    return (
                      <span key={allergenId} className="px-4 py-2 rounded-full text-sm font-bold bg-red-600 text-white">
                        {allergy?.icon} {isAr ? allergy?.labelAr : allergy?.label}
                        {t('barcode.youAreAllergic')}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Final verdict */}
            {hasAllergens ? (
              <div className="bg-red-100 rounded-xl p-4 border border-red-300">
                <p className="text-red-800 font-bold text-lg">{t('barcode.dangerMessage')}</p>
                <p className="text-red-600 text-sm mt-1">{t('barcode.dangerSub')}</p>
              </div>
            ) : (
              <div className="bg-green-100 rounded-xl p-4 border border-green-300">
                <p className="text-green-800 font-bold">{t('barcode.safeMessage')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
