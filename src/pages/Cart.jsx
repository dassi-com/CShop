import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, Smartphone, Wallet, CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { calculateSubtotal, calculateTotal, formatPrice } from '../utils/CartUtils'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  const handlePayment = () => {
    setProcessingPayment(true)
    
    // Simulation de paiement
    setTimeout(() => {
      setProcessingPayment(false)
      setPaymentSuccess(true)
      
      // Redirection après 2 secondes
      setTimeout(() => {
        setPaymentSuccess(false)
        setShowPaymentModal(false)
        clearCart()
        alert('✅ Paiement effectué avec succès ! Merci pour votre achat.')
      }, 2000)
    }, 2000)
  }

  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-fuchsia-350 mb-4">
            {paymentSuccess ? 'Paiement réussi !' : 'Mode de paiement'}
          </h3>
          
          {paymentSuccess ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-green-600 font-semibold mb-2">Paiement confirmé !</p>
              <p className="text-gray-600 text-sm">Merci pour votre achat</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Montant total à payer : <span className="text-fuchsia-300 font-bold text-xl">{formatPrice(calculateTotal(cartItems))}</span>
              </p>
              
              <div className="space-y-3">
                <button 
                  className={`w-full p-4 bg-gray-50 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'card' ? 'border-fuchsia-"300 bg-fuchsia-50' : 'border-gray-200 hover:border-fuchsia-300'
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="w-10 h-10 bg-fuchsia-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-fuchsia-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">Carte bancaire</p>
                    <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                  </div>
                </button>
                
                <button 
                  className={`w-full p-4 bg-gray-50 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'mobile' ? 'border-fuchsia-300 bg-fuchsia-50' : 'border-gray-200 hover:border-fuchsia-300'
                  }`}
                  onClick={() => setPaymentMethod('mobile')}
                >
                  <div className="w-10 h-10 bg-fuchsia-100 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-fuchsia-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">Mobile Money</p>
                    <p className="text-sm text-gray-500">Orange Money, MTN Money, Moov Money</p>
                  </div>
                </button>
                
                <button 
                  className={`w-full p-4 bg-gray-50 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'wallet' ? 'border-fuchsia-300 bg-fuchsia-50' : 'border-gray-200 hover:border-fuchsia-300'
                  }`}
                  onClick={() => setPaymentMethod('wallet')}
                >
                  <div className="w-10 h-10 bg-fuchsia-100 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-fuchsia-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">Portefeuille électronique</p>
                    <p className="text-sm text-gray-500">PayPal, Wave, Free Money</p>
                  </div>
                </button>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Annuler
                </button>
                <button 
                  className={`flex-1 px-4 py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                    (!paymentMethod || processingPayment) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!paymentMethod || processingPayment}
                  onClick={handlePayment}
                >
                  {processingPayment ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Traitement...
                    </>
                  ) : (
                    'Payer'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-fuchsia-500 mb-4">Votre panier est vide</h2>
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
                      <p className="text-fuchsia-600 font-bold">{formatPrice(item.price)}</p>
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
                <h2 className="text-xl font-bold text-fuchsia-600 mb-4">Récapitulatif</h2>
                
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} <span className="text-gray-800 font-medium">x{item.quantity}</span></span>
                      <span className="text-fuchsia-600 font-semibold">{formatPrice(calculateSubtotal(item.price, item.quantity))}</span>
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
                  className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 mb-3"
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