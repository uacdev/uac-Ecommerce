import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { StoreProvider } from './context/StoreContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import DeliverySelection from './pages/DeliverySelection'
import SuccessDelivery from './pages/SuccessDelivery'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import TrackOrder from './pages/TrackOrder'
import Favorites from './pages/Favorites'
import Products from './pages/Products'
import AboutUs from './pages/AboutUs'

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
            <Route path="/deliver-selection" element={<DeliverySelection />} />
            <Route path="/success-delivery" element={<SuccessDelivery />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/favorites" element={<Favorites />} />
            
            <Route path="/admin/login" element={<AdminLogin />} />
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
          <StoreProvider>
            <Layout />
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
