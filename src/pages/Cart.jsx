import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Trash2, Plus, Minus, ArrowLeft, CreditCard, Smartphone, 
  Wallet, CheckCircle, Phone, Mail, User, MapPin, Clock 
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { calculateSubtotal, calculateTotal, formatPrice } from '../utils/CartUtils'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentStep, setPaymentStep] = useState('method') // method, form, processing, success
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)
  
  // États pour les formulaires
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    deliveryTime: 'standard' // standard, express
  })

  // États pour Orange Money
  const [orangeMoney, setOrangeMoney] = useState({
    phoneNumber: '',
    otpCode: '',
    step: 'phone' // phone, otp, success
  })

  // États pour Carte bancaire
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    step: 'card' // card, success
  })

  const handleCustomerInfoChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    })
  }

  const handleOrangeMoneyChange = (e) => {
    setOrangeMoney({
      ...orangeMoney,
      [e.target.name]: e.target.value
    })
  }

  const handleCardInfoChange = (e) => {
    setCardInfo({
      ...cardInfo,
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

  const validateOrangeMoney = () => {
    if (!orangeMoney.phoneNumber.trim() || !/^[0-9]{8,12}$/.test(orangeMoney.phoneNumber)) {
      return 'Numéro Orange Money valide requis (8-12 chiffres)'
    }
    return null
  }

  const validateCardInfo = () => {
    if (!cardInfo.cardNumber.trim() || !/^[0-9]{16}$/.test(cardInfo.cardNumber.replace(/\s/g, ''))) {
      return 'Numéro de carte valide requis (16 chiffres)'
    }
    if (!cardInfo.cardName.trim()) return 'Nom sur la carte requis'
    if (!cardInfo.expiryDate.trim() || !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(cardInfo.expiryDate)) {
      return 'Date d\'expiration valide requise (MM/AA)'
    }
    if (!cardInfo.cvv.trim() || !/^[0-9]{3}$/.test(cardInfo.cvv)) {
      return 'CVV valide requis (3 chiffres)'
    }
    return null
  }

  const handleOrangeMoneySubmit = (e) => {
    e.preventDefault()
    const error = validateOrangeMoney()
    if (error) {
      alert(error)
      return
    }
    setOrangeMoney({ ...orangeMoney, step: 'otp' })
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault()
    if (!orangeMoney.otpCode || orangeMoney.otpCode.length !== 4) {
      alert('Code OTP à 4 chiffres requis')
      return
    }
    processPayment()
  }

  const handleCardSubmit = (e) => {
    e.preventDefault()
    const error = validateCardInfo()
    if (error) {
      alert(error)
      return
    }
    processPayment()
  }

  const processPayment = () => {
    setProcessingPayment(true)
    
    // Simulation de traitement de paiement
    setTimeout(() => {
      setProcessingPayment(false)
      setPaymentStep('success')
      setPaymentSuccess(true)
      
      // Créer les détails de la commande
      const order = {
        id: 'CMD-' + Date.now(),
        date: new Date().toLocaleDateString('fr-FR'),
        items: cartItems,
        total: calculateTotal(cartItems),
        customer: customerInfo,
        paymentMethod: paymentMethod === 'orange' ? 'Orange Money' : 'Carte bancaire',
        status: 'Confirmée'
      }
      setOrderDetails(order)
      
      // Sauvegarder dans l'historique des commandes (localStorage)
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      orders.push(order)
      localStorage.setItem('orders', JSON.stringify(orders))
      
      // Redirection après 3 secondes
      setTimeout(() => {
        setPaymentSuccess(false)
        setShowPaymentModal(false)
        setPaymentStep('method')
        setPaymentMethod('')
        clearCart()
        alert(`✅ Commande ${order.id} confirmée ! Merci pour votre achat.`)
      }, 3000)
    }, 2000)
  }

  const resetPaymentModal = () => {
    setShowPaymentModal(false)
    setPaymentStep('method')
    setPaymentMethod('')
    setOrangeMoney({ phoneNumber: '', otpCode: '', step: 'phone' })
    setCardInfo({ cardNumber: '', cardName: '', expiryDate: '', cvv: '', step: 'card' })
  }

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-fuchsia-400">
              {paymentStep === 'method' && 'Mode de paiement'}
              {paymentStep === 'form' && paymentMethod === 'orange' && 'Paiement Orange Money'}
              {paymentStep === 'form' && paymentMethod === 'card' && 'Paiement par carte'}
              {paymentStep === 'processing' && 'Traitement en cours...'}
              {paymentStep === 'success' && 'Paiement réussi !'}
            </h3>
            <button 
              onClick={resetPaymentModal}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Résumé de la commande */}
          {paymentStep !== 'success' && (
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-gray-600 mb-2">Récapitulatif de votre commande :</p>
              <div className="space-y-1 text-sm">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">{formatPrice(calculateSubtotal(item.price, item.quantity))}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-2 pt-2 font-bold">
                  <div className="flex justify-between">
                    <span>Total à payer :</span>
                    <span className="text-fuchsia-400">{formatPrice(calculateTotal(cartItems))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 1: Choix de la méthode */}
          {paymentStep === 'method' && (
            <>
              <div className="space-y-3 mb-6">
                <button 
                  className={`w-full p-4 bg-gray-50 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'orange' ? 'border-fuchsia-300 bg-fuchsia-50' : 'border-gray-200 hover:border-fuchsia-300'
                  }`}
                  onClick={() => {
                    setPaymentMethod('orange')
                    setPaymentStep('form')
                  }}
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">Orange Money</p>
                    <p className="text-sm text-gray-500">Paiement mobile sécurisé</p>
                  </div>
                </button>
                
                <button 
                  className={`w-full p-4 bg-gray-50 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'card' ? 'border-fuchsia-300 bg-fuchsia-50' : 'border-gray-200 hover:border-fuchsia-300'
                  }`}
                  onClick={() => {
                    setPaymentMethod('card')
                    setPaymentStep('form')
                  }}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">Carte bancaire</p>
                    <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                  </div>
                </button>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-yellow-700">
                  ⚠️ Simulation uniquement - Aucun paiement réel ne sera effectué
                </p>
              </div>
            </>
          )}

          {/* Étape 2: Formulaire informations client (avant paiement) */}
          {paymentStep === 'form' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const error = validateCustomerInfo()
              if (error) {
                alert(error)
                return
              }
              if (paymentMethod === 'orange') {
                setOrangeMoney({ ...orangeMoney, step: 'phone' })
              } else if (paymentMethod === 'card') {
                processPayment()
              }
            }} className="space-y-4">
              <h4 className="font-semibold text-gray-700 mb-3">Informations de livraison</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={customerInfo.fullName}
                    onChange={handleCustomerInfoChange}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                    placeholder="jean@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerInfoChange}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                    placeholder="77001122"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleCustomerInfoChange}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                    placeholder="123 Rue Principale"
                    required
                  />
                </div>
              </div>

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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode de livraison</label>
                <select
                  name="deliveryTime"
                  value={customerInfo.deliveryTime}
                  onChange={handleCustomerInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                >
                  <option value="standard">Standard (3-5 jours) - Gratuit</option>
                  <option value="express">Express (24h) - 2000 FCFA</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg transition-colors font-medium"
              >
                Continuer vers le paiement
              </button>
            </form>
          )}

          {/* Orange Money - Saisie numéro */}
          {paymentMethod === 'orange' && orangeMoney.step === 'phone' && paymentStep === 'form' && (
            <form onSubmit={handleOrangeMoneySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro Orange Money
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={orangeMoney.phoneNumber}
                    onChange={handleOrangeMoneyChange}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                    placeholder="78 123 45 67"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Vous recevrez une demande de confirmation sur votre téléphone
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
              >
                Recevoir le code de confirmation
              </button>
            </form>
          )}

          {/* Orange Money - Saisie OTP */}
          {paymentMethod === 'orange' && orangeMoney.step === 'otp' && paymentStep === 'form' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code de confirmation
                </label>
                <input
                  type="text"
                  name="otpCode"
                  value={orangeMoney.otpCode}
                  onChange={handleOrangeMoneyChange}
                  maxLength="4"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300 text-center text-2xl tracking-widest"
                  placeholder="••••"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Un code à 4 chiffres vous a été envoyé
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
              >
                Confirmer le paiement
              </button>

              <button
                type="button"
                onClick={() => setOrangeMoney({ ...orangeMoney, step: 'phone' })}
                className="w-full text-sm text-orange-500 hover:text-orange-600"
              >
                ← Modifier le numéro
              </button>
            </form>
          )}

          {/* Carte bancaire - Formulaire */}
          {paymentMethod === 'card' && paymentStep === 'form' && (
            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de carte
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500" />
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardInfo.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
                      setCardInfo({ ...cardInfo, cardNumber: value })
                    }}
                    maxLength="19"
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom sur la carte
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={cardInfo.cardName}
                  onChange={handleCardInfoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                  placeholder="JEAN DUPONT"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardInfo.expiryDate}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '')
                      if (value.length >= 2) {
                        value = value.slice(0,2) + '/' + value.slice(2,4)
                      }
                      setCardInfo({ ...cardInfo, expiryDate: value })
                    }}
                    maxLength="5"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                    placeholder="MM/AA"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardInfo.cvv}
                    onChange={handleCardInfoChange}
                    maxLength="3"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                Payer {formatPrice(calculateTotal(cartItems))}
              </button>
            </form>
          )}

          {/* Traitement */}
          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="loading loading-spinner loading-lg text-fuchsia-400"></div>
              </div>
              <p className="text-gray-700 font-semibold mb-2">Traitement du paiement en cours...</p>
              <p className="text-sm text-gray-500">Veuillez patienter</p>
            </div>
          )}

          {/* Succès */}
          {paymentStep === 'success' && orderDetails && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-green-600 font-bold text-lg mb-2">Paiement réussi !</p>
              <p className="text-gray-600 mb-3">Merci pour votre achat</p>
              
              <div className="bg-gray-50 p-4 rounded-lg text-left mb-4">
                <p className="font-semibold text-gray-700 mb-2">Détails de la commande</p>
                <p className="text-sm">N° commande : {orderDetails.id}</p>
                <p className="text-sm">Date : {orderDetails.date}</p>
                <p className="text-sm">Montant : {formatPrice(orderDetails.total)}</p>
                <p className="text-sm">Paiement : {orderDetails.paymentMethod}</p>
                <p className="text-sm mt-2">Livraison à :</p>
                <p className="text-sm">{orderDetails.customer.fullName}</p>
                <p className="text-sm">{orderDetails.customer.address}</p>
                <p className="text-sm">{orderDetails.customer.city}</p>
              </div>

              <p className="text-xs text-gray-400">
                Redirection automatique dans quelques instants...
              </p>
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
                      <p className="text-fuchsia-400 font-bold">{formatPrice(item.price)}</p>
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
                <h2 className="text-xl font-bold text-fuchsia-400 mb-4">Récapitulatif</h2>
                
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} <span className="text-gray-800 font-medium">x{item.quantity}</span></span>
                      <span className="text-fuchsia-400 font-semibold">{formatPrice(calculateSubtotal(item.price, item.quantity))}</span>
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
                  Procéder au paiement
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  Paiement 100% sécurisé • Simulation uniquement
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