import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Admin from './pages/Admin'
import ProtectedRoute from './routes/ProtectedRoute'

// Import des pages de paiement
import PaymentSuccess from './pages/payment/PaymentSuccess'
import PaymentError from './pages/payment/PaymentError'
import PaymentPending from './pages/payment/PaymentPending'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-gray-900">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              {/* Routes de paiement CinetPay */}
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/error" element={<PaymentError />} />
              <Route path="/payment/pending" element={<PaymentPending />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App