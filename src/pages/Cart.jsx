import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trash2, Plus, Minus, ArrowLeft, CreditCard,
  Phone, Mail, User, MapPin, AlertCircle, Loader
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { calculateSubtotal, calculateTotal, formatPrice } from '../utils/CartUtils'
import orderService from '../services/cartService'
import axiosInstance from '../config/axios'

/* ======================= */
/* ✅ MODAL SORTI (FIX) */
/* ======================= */
const PaymentModal = ({
  setShowPaymentModal,
  paymentError,
  cartItems,
  customerInfo,
  handleCustomerInfoChange,
  handleSubmitCustomerInfo,
  processingPayment
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
      <div className="p-6">

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-fuchsia-500">Informations de livraison</h3>
          <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {paymentError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{paymentError}</span>
          </div>
        )}

        <div className="bg-fuchsia-50 p-4 rounded-xl mb-4">
          <p className="text-sm text-fuchsia-700 mb-1">Total à payer :</p>
          <p className="text-2xl font-bold text-fuchsia-500">
            {formatPrice(calculateTotal(cartItems) + (customerInfo.deliveryTime === 'express' ? 2000 : 0))}
          </p>
        </div>

        <form onSubmit={handleSubmitCustomerInfo} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400" />
              <input type="text" name="fullName" value={customerInfo.fullName}
                onChange={handleCustomerInfoChange}
                className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
                required disabled={processingPayment} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400" />
              <input type="email" name="email" value={customerInfo.email}
                onChange={handleCustomerInfoChange}
                className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
                required disabled={processingPayment} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400" />
              <input type="tel" name="phone" value={customerInfo.phone}
                onChange={handleCustomerInfoChange}
                className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
                required disabled={processingPayment} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400" />
              <input type="text" name="address" value={customerInfo.address}
                onChange={handleCustomerInfoChange}
                className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
                required disabled={processingPayment} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="city" value={customerInfo.city}
              onChange={handleCustomerInfoChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required disabled={processingPayment} />

            <select name="deliveryTime" value={customerInfo.deliveryTime}
              onChange={handleCustomerInfoChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
              disabled={processingPayment}>
              <option value="standard">Standard</option>
              <option value="express">Express</option>
            </select>
          </div>

          <button type="submit" disabled={processingPayment}
            className="w-full py-3 bg-fuchsia-500 text-white rounded-lg">
            {processingPayment ? "Redirection..." : "Payer avec CinetPay"}
          </button>

        </form>
      </div>
    </div>
  </div>
)

/* ======================= */
/* ✅ CART */
/* ======================= */

const Cart = () => {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    deliveryTime: 'standard',
  })

  const handleCustomerInfoChange = (e) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value })
  }

  const validateCustomerInfo = () => {
    if (!customerInfo.fullName.trim()) return 'Nom complet requis'
    if (!customerInfo.email.trim() || !/\S+@\S+\.\S+/.test(customerInfo.email)) return 'Email valide requis'
    if (!customerInfo.phone.trim()) return 'Téléphone requis'
    if (!customerInfo.address.trim()) return 'Adresse requise'
    if (!customerInfo.city.trim()) return 'Ville requise'
    return null
  }

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token || !user) {
      setPaymentError('Vous devez être connecté')
      setTimeout(() => navigate('/'), 2000)
      return false
    }
    return true
  }

  const createOrder = async () => {
    const response = await orderService.createOrder(cartItems)
    const orderId = response?._id || response?.data?._id
    if (!orderId) throw new Error('ID commande introuvable')
    return { orderId }
  }

  const initiateCinetPayPayment = async (orderId) => {
    const response = await axiosInstance.post('/payments/cinetpay/initiate', { orderId })
    return response?.data?.paymentUrl
  }

  const handleSubmitCustomerInfo = async (e) => {
    e.preventDefault()
    if (!checkAuth()) return

    const error = validateCustomerInfo()
    if (error) return setPaymentError(error)

    setProcessingPayment(true)
    setPaymentError('')

    try {
      const { orderId } = await createOrder()
      const paymentUrl = await initiateCinetPayPayment(orderId)
      window.location.href = paymentUrl
    } catch (err) {
      setPaymentError(
        err.response?.data?.message ||
        err.message ||
        'Erreur paiement'
      )
    } finally {
      setProcessingPayment(false)
    }
  }

  return (
    <div>
      <button onClick={() => setShowPaymentModal(true)}>
        Payer
      </button>

      {showPaymentModal && (
        <PaymentModal
          setShowPaymentModal={setShowPaymentModal}
          paymentError={paymentError}
          cartItems={cartItems}
          customerInfo={customerInfo}
          handleCustomerInfoChange={handleCustomerInfoChange}
          handleSubmitCustomerInfo={handleSubmitCustomerInfo}
          processingPayment={processingPayment}
        />
      )}
    </div>
  )
}

export default Cart