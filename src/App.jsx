import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Scanner from './pages/Scanner'
import DishChecker from './pages/DishChecker'
import Emergency from './pages/Emergency'
import Translator from './pages/Translator'
import Recommendations from './pages/Recommendations'
import SafetyMap from './pages/SafetyMap'
import Community from './pages/Community'
import KidsMode from './pages/KidsMode'
import BarcodeScanner from './pages/BarcodeScanner'

function App() {
  const location = useLocation()

  // Don't show navbar on landing page
  const showNavbar = location.pathname !== '/'

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {showNavbar && <Navbar />}

      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />

        {/* Main pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/check-dish" element={<DishChecker />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/community" element={<Community />} />

        {/* Extra pages */}
        <Route path="/translator" element={<Translator />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/safety-map" element={<SafetyMap />} />
        <Route path="/kids-mode" element={<KidsMode />} />
        <Route path="/barcode" element={<BarcodeScanner />} />

        {/* Catch-all redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
