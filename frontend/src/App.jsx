import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { trackingApi } from './api/client'
import { getVisitorId } from './lib/visitor'
import { StoreProvider } from './context/StoreContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import OrderFailed from './pages/OrderFailed'
import DeliverySelection from './pages/DeliverySelection'
import SuccessDelivery from './pages/SuccessDelivery'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import ResetPassword from './pages/ResetPassword'
import AccountLogin from './pages/AccountLogin'
import AccountSignup from './pages/AccountSignup'
import AccountResetPassword from './pages/AccountResetPassword'
import Account from './pages/Account'
import TrackOrder from './pages/TrackOrder'
import Favorites from './pages/Favorites'
import Products from './pages/Products'
import AboutUs from './pages/AboutUs'
import PrivacyPolicy from './pages/PrivacyPolicy'
import DataProtection from './pages/DataProtection'
import TermsAndConditions from './pages/TermsAndConditions'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return null
  if (!user) return <Navigate to="/admin/login" replace />
  
  return children
}

function Layout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  // Ping the visit tracker on every storefront navigation. Backend dedupes by
  // (visitorId, dayKey) so a returning visitor on the same day is a free no-op.
  useEffect(() => {
    if (isAdmin) return
    if (location.pathname.startsWith('/account')) return
    trackingApi.visit(getVisitorId(), location.pathname).catch(() => {})
  }, [isAdmin, location.pathname])

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      <Toaster position="top-center" reverseOrder={false} />
      {!isAdmin && <Navbar />}
      <main>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Products />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<Success />} />
            <Route path="/order-failed" element={<OrderFailed />} />
            <Route path="/delivery-selection" element={<DeliverySelection />} />
            {/* Back-compat for the old typo'd path */}
            <Route path="/deliver-selection" element={<DeliverySelection />} />
            <Route path="/success-delivery" element={<SuccessDelivery />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/data-protection" element={<DataProtection />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/favorites" element={<Favorites />} />

            <Route path="/account/login" element={<AccountLogin />} />
            <Route path="/account/signup" element={<AccountSignup />} />
            <Route path="/account/reset-password" element={<AccountResetPassword />} />
            <Route path="/account" element={<Account />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && <Footer />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <CustomerAuthProvider>
            <StoreProvider>
              <Layout />
            </StoreProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
