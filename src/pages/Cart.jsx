import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Trash2, Plus, Minus, ArrowLeft, CreditCard, 
  Phone, Mail, User, MapPin, AlertCircle, Loader
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { calculateSubtotal, calculateTotal, formatPrice } from '../utils/CartUtils'
import axios from 'axios'

const API_URL = 'https://api-final-m259.onrender.com/api'

const Cart = () => {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStep, setPaymentStep] = useState('form')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  
  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    deliveryTime: 'standard'
  })

  const handleCustomerInfoChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    })
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
      setPaymentError('Vous devez être connecté pour effectuer un paiement')
      setTimeout(() => navigate('/'), 2000)
      return false
    }
    return true
  }

  const createOrder = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const deliveryFee = customerInfo.deliveryTime === 'express' ? 2000 : 0
      const totalAmount = calculateTotal(cartItems) + deliveryFee

      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: totalAmount,
        customer: {
          fullName: customerInfo.fullName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city
        },
        deliveryMethod: customerInfo.deliveryTime,
        deliveryFee: deliveryFee,
        status: 'pending'
      }

      const response = await axios.post(`${API_URL}/orders`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const orderId = response.data?.order?._id || response.data?.data?._id || response.data?._id
      return { orderId, totalAmount }
      
    } catch (error) {
      console.error('Erreur création commande:', error)
      throw new Error('Erreur lors de la création de la commande')
    }
  }

  // ✅ SIMPLIFICATION : Envoie juste l'orderId comme demandé par ton collègue
  const initiateCinetPayPayment = async (orderId) => {
    try {
      const token = localStorage.getItem('token')
      
      const payload = { orderId } // Seulement l'ID de la commande
      
      console.log('📤 Envoi à CinetPay:', payload)

      const response = await axios.post(`${API_URL}/payments/cinetpay/initiate`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('✅ Réponse CinetPay:', response.data)
      
      const paymentUrl = response.data?.paymentUrl
      
      if (!paymentUrl) {
        throw new Error('URL de paiement non reçue')
      }
      
      return paymentUrl
      
    } catch (error) {
      console.error('❌ Erreur initiation paiement:', error)
      throw new Error('Erreur lors de l\'initialisation du paiement')
    }
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
      // 1. Créer la commande
      const { orderId } = await createOrder()
      
      // 2. Obtenir l'URL de paiement CinetPay
      const paymentUrl = await initiateCinetPayPayment(orderId)
      
      // 3. Rediriger vers le site officiel de CinetPay
      window.location.href = paymentUrl
      
    } catch (err) {
      console.error('❌ Erreur:', err)
      setPaymentError(err.message)
      setProcessingPayment(false)
    }
  }

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-fuchsia-300">
              Informations de livraison
            </h3>
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {paymentError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{paymentError}</span>
            </div>
          )}

          <div className="bg-fuchsia-50 p-4 rounded-xl mb-4">
            <p className="text-sm text-fuchsia-700 mb-2">Total à payer :</p>
            <p className="text-2xl font-bold text-fuchsia-300">
              {formatPrice(calculateTotal(cartItems) + (customerInfo.deliveryTime === 'express' ? 2000 : 0))}
            </p>
          </div>

          <form onSubmit={handleSubmitCustomerInfo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fuchsia-300" />
                <input
                  type="text"
                  name="fullName"
                  value={customerInfo.fullName}
                  onChange={handleCustomerInfoChange}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                  placeholder="Oumar Diallo"
                  required
                  disabled={processingPayment}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fuchsia-300" />
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                  placeholder="oumar.diallo@email.com"
                  required
                  disabled={processingPayment}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fuchsia-300" />
                <input
                  type="tel"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleCustomerInfoChange}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                  placeholder="+221 77 123 45 67"
                  required
                  disabled={processingPayment}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fuchsia-300" />
                <input
                  type="text"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleCustomerInfoChange}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                  placeholder="123 Rue Principale"
                  required
                  disabled={processingPayment}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  name="city"
                  value={customerInfo.city}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                  placeholder="Dakar"
                  required
                  disabled={processingPayment}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Livraison</label>
                <select
                  name="deliveryTime"
                  value={customerInfo.deliveryTime}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                  disabled={processingPayment}
                >
                  <option value="standard">Standard (Gratuit)</option>
                  <option value="express">Express (+2000 FCFA)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={processingPayment}
              className={`w-full py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                processingPayment ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {processingPayment ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Redirection vers CinetPay...
                </>
              ) : (
                'Payer avec CinetPay'
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-2">
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
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg">
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
                  <div className="sm:w-24 sm:h-24">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => e.target.src = 'https://placehold.co/400x400/FFFFFF/fuchsia?text=Image'}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-fuchsia-300 font-bold">{formatPrice(item.price)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-fuchsia-300">
                      {formatPrice(calculateSubtotal(item.price, item.quantity))}
                    </div>
                    <button onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <button onClick={clearCart} className="text-red-500">
              Vider le panier
            </button>
          </div>
          
          {/* Résumé */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-fuchsia-300 mb-4">Récapitulatif</h2>
              
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-fuchsia-300">{formatPrice(calculateTotal(cartItems))}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg font-medium"
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                Payer avec CinetPay
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                Paiement sécurisé sur CinetPay
              </p>
            </div>
          </div>
        </div>

        {showPaymentModal && <PaymentModal />}
      </div>
    </div>
  )
}

export default Cart