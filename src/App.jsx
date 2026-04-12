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

/**
 * App - Main application component with routing
 *
 * This is the root component that sets up:
 * - React Router for page navigation
 * - Conditional Navbar (hidden on landing page)
 * - All route definitions for the 10+ pages
 * - Catch-all redirect to landing page
 *
 * Route structure:
 *   /              -> Landing page (no navbar)
 *   /home          -> Home with allergy filter
 *   /scanner       -> Smart Menu Scanner
 *   /check-dish    -> Dish Checker
 *   /emergency     -> Emergency Medical Card
 *   /community     -> Community Reviews
 *   /translator    -> Allergy Translator
 *   /recommendations -> AI Safe Meal Suggestions
 *   /safety-map    -> Safety Map
 *   /kids-mode     -> Kids Mode
 *   /barcode       -> Barcode Scanner
 */
function App() {
  const location = useLocation()

  // Hide the navbar on the landing page for a clean first impression
  const showNavbar = location.pathname !== '/'

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation bar - shown on all pages except landing */}
      {showNavbar && <Navbar />}

      {/* Page routes */}
      <Routes>
        {/* Landing page - first screen users see */}
        <Route path="/" element={<Landing />} />

        {/* Main navigation pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/check-dish" element={<DishChecker />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/community" element={<Community />} />

        {/* Extra feature pages (accessible from "More" menu) */}
        <Route path="/translator" element={<Translator />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/safety-map" element={<SafetyMap />} />
        <Route path="/kids-mode" element={<KidsMode />} />
        <Route path="/barcode" element={<BarcodeScanner />} />

        {/* Catch-all: redirect unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
