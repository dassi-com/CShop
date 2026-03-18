import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Trash2, Plus, Minus, ArrowLeft, CreditCard, Smartphone, 
  Wallet, CheckCircle, Phone, Mail, User, MapPin, Clock,
  AlertCircle, Loader
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { calculateSubtotal, calculateTotal, formatPrice } from '../utils/CartUtils'
import axios from 'axios'

const API_URL = 'https://api-final-m259.onrender.com/api'

const Cart = () => {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStep, setPaymentStep] = useState('method') // method, customer, processing
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  
  // États pour les formulaires
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    deliveryTime: 'standard'
  })

  // États pour la commande
  const [orderData, setOrderData] = useState(null)

  const handleCustomerInfoChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    })
  }

  const validateCustomerInfo = () => {
    if (!customerInfo.fullName.trim()) return 'Nom complet requis'
    if (!customerInfo.email.trim() || !/\S+@\S+\.\S+/.test(customerInfo.email)) return 'Email valide requis'
    if (!customerInfo.phone.trim() || !/^[0-9]{8,12}$/.test(customerInfo.phone)) return 'Téléphone valide requis (8-12 chiffres)'
    if (!customerInfo.address.trim()) return 'Adresse requise'
    if (!customerInfo.city.trim()) return 'Ville requise'
    return null
  }

  // Créer la commande dans le backend
  const createOrder = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Calculer le total avec frais de livraison
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

      console.log('📤 Création commande:', orderPayload)

      const response = await axios.post(`${API_URL}/orders`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('✅ Commande créée:', response.data)
      
      // Récupérer l'ID de la commande (selon le format de réponse)
      const orderId = response.data?.order?._id || response.data?.data?._id || response.data?._id
      
      return { orderId, totalAmount }
      
    } catch (error) {
      console.error('❌ Erreur création commande:', error)
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la commande')
    }
  }

  // Initialiser le paiement CinetPay
  const initiateCinetPayPayment = async (orderId, amount) => {
    try {
      const token = localStorage.getItem('token')
      
      const payload = { orderId }
      
      console.log('📤 Initiation paiement CinetPay:', payload)

      const response = await axios.post(`${API_URL}/payments/cinetpay/initiate`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('✅ Paiement initié:', response.data)
      
      // Récupérer l'URL de paiement et l'ID de paiement
      const paymentUrl = response.data?.paymentUrl
      const paymentId = response.data?.paymentId
      
      if (!paymentUrl) {
        throw new Error('URL de paiement non reçue')
      }
      
      return { paymentUrl, paymentId }
      
    } catch (error) {
      console.error('❌ Erreur initiation paiement:', error)
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'initialisation du paiement')
    }
  }

  const handleSubmitCustomerInfo = async (e) => {
    e.preventDefault()
    
    const error = validateCustomerInfo()
    if (error) {
      setPaymentError(error)
      return
    }

    setProcessingPayment(true)
    setPaymentError('')

    try {
      // 1. Créer la commande
      const { orderId, totalAmount } = await createOrder()
      
      // Sauvegarder les infos pour plus tard
      setOrderData({ orderId, totalAmount, customerInfo })
      
      // 2. Initier le paiement CinetPay
      const { paymentUrl, paymentId } = await initiateCinetPayPayment(orderId, totalAmount)
      
      // 3. Sauvegarder l'ID de paiement dans le state
      setOrderData(prev => ({ ...prev, paymentId }))
      
      // 4. Rediriger vers CinetPay
      window.location.href = paymentUrl
      
    } catch (err) {
      console.error('❌ Erreur:', err)
      setPaymentError(err.message || 'Une erreur est survenue')
      setProcessingPayment(false)
    }
  }

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-fuchsia-300">
              {paymentStep === 'method' && 'Paiement sécurisé'}
              {paymentStep === 'customer' && 'Informations de livraison'}
              {paymentStep === 'processing' && 'Traitement en cours...'}
            </h3>
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Message d'erreur */}
          {paymentError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{paymentError}</span>
            </div>
          )}

          {/* Résumé de la commande */}
          <div className="bg-fuchsia-50 p-4 rounded-xl mb-4">
            <p className="text-sm text-fuchsia-700 mb-2">Récapitulatif :</p>
            <div className="space-y-1 text-sm">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-600">{item.name} x{item.quantity}</span>
                  <span className="font-medium text-fuchsia-300">{formatPrice(calculateSubtotal(item.price, item.quantity))}</span>
                </div>
              ))}
              <div className="border-t border-fuchsia-200 mt-2 pt-2">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-700">Total :</span>
                  <span className="text-fuchsia-300">{formatPrice(calculateTotal(cartItems))}</span>
                </div>
                {customerInfo.deliveryTime === 'express' && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Livraison express</span>
                    <span className="text-fuchsia-300">+2 000 FCFA</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Étape 1: Choix de la méthode - FIXÉ SUR CINETPAY */}
          {paymentStep === 'method' && (
            <>
              <div className="space-y-3 mb-6">
                <div className="w-full p-4 bg-fuchsia-50 rounded-xl border-2 border-fuchsia-300 flex items-center gap-3">
                  <div className="w-10 h-10 bg-fuchsia-200 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-fuchsia-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">CinetPay</p>
                    <p className="text-sm text-gray-500">Mobile Money & Cartes bancaires</p>
                  </div>
                  <div className="text-fuchsia-300 font-bold">XAF</div>
                </div>
              </div>

              <button
                onClick={() => setPaymentStep('customer')}
                className="w-full py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg transition-colors font-medium"
              >
                Continuer
              </button>

              <p className="text-xs text-center text-gray-500 mt-4">
                Paiement 100% sécurisé via CinetPay
              </p>
            </>
          )}

          {/* Étape 2: Formulaire client */}
          {paymentStep === 'customer' && (
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
                    placeholder="Jean Dupont"
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
                    placeholder="jean@email.com"
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
                    placeholder="77 123 45 67"
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
                    Traitement...
                  </>
                ) : (
                  'Payer avec CinetPay'
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentStep('method')}
                className="w-full text-sm text-fuchsia-300 hover:text-fuchsia-400"
                disabled={processingPayment}
              >
                ← Retour
              </button>
            </form>
          )}

          {/* Étape de traitement */}
          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-10 h-10 text-fuchsia-300 animate-spin" />
              </div>
              <p className="text-gray-700 font-semibold mb-2">Initialisation du paiement...</p>
              <p className="text-sm text-gray-500">Redirection vers CinetPay</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-fuchsia-300 mb-4">Votre panier est vide</h2>
          <p className="text-gray-400 mb-8">Vous n'avez pas encore ajouté d'articles à votre panier.</p>
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg transition-colors">
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
          {/* Cart Items */}
          <div className="lg:w-2/3">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg mb-4 overflow-hidden border border-gray-200">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="sm:w-24 sm:h-24">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x400/e2e8f0/fuchsia?text=Image'
                        }}
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                      <p className="text-fuchsia-300 font-bold">{formatPrice(item.price)}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-gray-800 font-semibold">{item.quantity}</span>
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Subtotal and Remove */}
                    <div className="text-right min-w-[100px]">
                      <div className="font-bold text-fuchsia-300">
                        {formatPrice(calculateSubtotal(item.price, item.quantity))}
                      </div>
                      <button 
                        className="mt-2 text-red-500 hover:text-red-700 transition-colors"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center mt-4">
              <button 
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                onClick={clearCart}
              >
                <Trash2 className="w-4 h-4" />
                Vider le panier
              </button>
              
              <Link to="/" className="flex items-center gap-2 px-4 py-2 text-fuchsia-300 hover:text-fuchsia-400 hover:bg-fuchsia-50 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Continuer mes achats
              </Link>
            </div>
          </div>
          
          {/* Cart Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-bold text-fuchsia-300 mb-4">Récapitulatif</h2>
                
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} <span className="text-gray-800 font-medium">x{item.quantity}</span></span>
                      <span className="text-fuchsia-300 font-semibold">{formatPrice(calculateSubtotal(item.price, item.quantity))}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-fuchsia-300">{formatPrice(calculateTotal(cartItems))}</span>
                  </div>
                </div>
                
                <button 
                  className="w-full py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 mb-3"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <CreditCard className="w-4 h-4" />
                  Payer avec CinetPay
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  Paiement sécurisé • Mobile Money & Cartes
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">
                  XAF (Franc CFA)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && <PaymentModal />}
      </div>
    </div>
  )
}

export default Cart