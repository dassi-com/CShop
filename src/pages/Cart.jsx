import React, { useState, useCallback } from 'react'
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

  const handleCustomerInfoChange = useCallback((e) => {
    const { name, value } = e.target
    setCustomerInfo(prev => ({ ...prev, [name]: value }))
  }, [])

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
      setPaymentError('Vous devez être connecté pour effectuer un paiement')
      setTimeout(() => navigate('/'), 2000)
      return false
    }
    return true
  }

  // Crée la commande via POST /api/orders
  // L'API attend : { items: [{ productId, quantity }] }
  const createOrder = async () => {
    const deliveryFee = customerInfo.deliveryTime === 'express' ? 2000 : 0

    // Utilise le service corrigé
    const response = await orderService.createOrder(cartItems)

    // L'API retourne directement l'objet Order (sans wrapper success/data)
    const orderId = response?._id || response?.data?._id
    if (!orderId) throw new Error('ID de commande introuvable dans la réponse')

    const totalAmount = calculateTotal(cartItems) + deliveryFee
    return { orderId, totalAmount }
  }

  // Initie le paiement CinetPay via POST /api/payments/cinetpay/initiate
  const initiateCinetPayPayment = async (orderId) => {
    const response = await axiosInstance.post('/payments/cinetpay/initiate', { orderId })
    const paymentUrl = response?.paymentUrl || response?.data?.paymentUrl
    if (!paymentUrl) throw new Error('URL de paiement non reçue du serveur')
    return paymentUrl
  }

  const handleSubmitCustomerInfo = async (e) => {
    e.preventDefault()
    if (!checkAuth()) return

    const error = validateCustomerInfo()
    if (error) {
      setPaymentError(error)
      return
    }

    setProcessingPayment(true)
    setPaymentError('')

    try {
      const { orderId } = await createOrder()
      const paymentUrl = await initiateCinetPayPayment(orderId)
      window.location.href = paymentUrl
    } catch (err) {
      console.error('Erreur paiement:', err)
      setPaymentError(
        err.message ||
        err.data?.message ||
        'Une erreur est survenue lors du paiement'
      )
    } finally {
      setProcessingPayment(false)
    }
  }

  const PaymentModal = () => (
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
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400" />
                <input type="text" name="fullName" value={customerInfo.fullName}
                  onChange={handleCustomerInfoChange}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-400"
                  placeholder="Jean Mbarga" required disabled={processingPayment} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400" />
                <input type="email" name="email" value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-400"
                  placeholder="jean@email.com" required disabled={processingPayment} />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400" />
                <input type="tel" name="phone" value={customerInfo.phone}
                  onChange={handleCustomerInfoChange}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-400"
                  placeholder="+237 6XX XXX XXX" required disabled={processingPayment} />
              </div>
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400" />
                <input type="text" name="address" value={customerInfo.address}
                  onChange={handleCustomerInfoChange}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-400"
                  placeholder="Rue de la Réunification" required disabled={processingPayment} />
              </div>
            </div>

            {/* Ville + Livraison */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input type="text" name="city" value={customerInfo.city}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-400"
                  placeholder="Yaoundé" required disabled={processingPayment} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Livraison</label>
                <select name="deliveryTime" value={customerInfo.deliveryTime}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-400"
                  disabled={processingPayment}>
                  <option value="standard">Standard (Gratuit)</option>
                  <option value="express">Express (+2 000 FCFA)</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={processingPayment}
              className={`w-full py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${processingPayment ? 'opacity-60 cursor-not-allowed' : ''}`}>
              {processingPayment ? (
                <><Loader className="w-4 h-4 animate-spin" />Redirection vers CinetPay...</>
              ) : (
                <><CreditCard className="w-4 h-4" />Payer avec CinetPay</>
              )}
            </button>

            <p className="text-xs text-center text-gray-500">
              Vous serez redirigé vers le site sécurisé de CinetPay
            </p>
          </form>
        </div>
      </div>
    </div>
  )

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-fuchsia-300 mb-4">Votre panier est vide</h2>
          <p className="text-gray-400 mb-8">Vous n'avez pas encore ajouté d'articles.</p>
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continuer mes achats
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-fuchsia-300 mb-8">Mon Panier</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Liste des articles */}
          <div className="lg:w-2/3">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg mb-4 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-24 sm:h-24 flex-shrink-0">
                    <img
                      src={item.image?.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://api-final-m259.onrender.com'}/${item.image}`}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => e.target.src = 'https://placehold.co/400x400/1a1a2e/c084fc?text=Image'}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-fuchsia-500 font-bold">{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right min-w-[110px]">
                    <div className="font-bold text-fuchsia-500">
                      {formatPrice(calculateSubtotal(item.price, item.quantity))}
                    </div>
                    <button
                      className="mt-2 text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-4">
              <button
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                onClick={clearCart}>
                <Trash2 className="w-4 h-4" />
                Vider le panier
              </button>
              <Link to="/" className="flex items-center gap-2 px-4 py-2 text-fuchsia-300 hover:bg-fuchsia-50 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Continuer mes achats
              </Link>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-bold text-fuchsia-500 mb-4">Récapitulatif</h2>

                <div className="space-y-2 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} <span className="font-medium text-gray-800">x{item.quantity}</span></span>
                      <span className="text-fuchsia-500 font-semibold">{formatPrice(calculateSubtotal(item.price, item.quantity))}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-800">Total :</span>
                    <span className="text-fuchsia-500">{formatPrice(calculateTotal(cartItems))}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                  <CreditCard className="w-4 h-4" />
                  Payer avec CinetPay
                </button>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Paiement sécurisé via CinetPay
                </p>
              </div>
            </div>
          </div>
        </div>

        {showPaymentModal && <PaymentModal />}
      </div>
    </div>
  )
}

export default Cart