import React, { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [])

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-fuchsia-500 mb-2">Paiement réussi !</h2>
          <p className="text-gray-600 mb-4">Merci pour votre achat. Votre commande est confirmée.</p>
          {orderId && (
            <p className="text-sm text-gray-400 mb-6 font-mono">
              N° commande : {orderId}
            </p>
          )}
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
