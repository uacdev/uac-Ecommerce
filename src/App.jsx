import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { StoreProvider } from './context/StoreContext'
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import DeliverySelection from './pages/DeliverySelection'
import SuccessDelivery from './pages/SuccessDelivery'
import AdminDashboard from './pages/AdminDashboard'
import TrackOrder from './pages/TrackOrder'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'

function Layout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {!isAdmin && <Navbar />}
      <main>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/success" element={<Success />} />
            <Route path="/deliver-selection" element={<DeliverySelection />} />
            <Route path="/success-delivery" element={<SuccessDelivery />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
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
        <StoreProvider>
          <Layout />
        </StoreProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
