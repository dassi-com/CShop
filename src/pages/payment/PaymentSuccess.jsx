import React, { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, ArrowLeft } from 'lucide-react'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    // Nettoyer le panier
    localStorage.removeItem('cart')
  }, [])

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-fuchsia-300 mb-2">Paiement réussi !</h2>
          <p className="text-gray-600 mb-4">Merci pour votre achat</p>
          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              N° commande : {orderId}
            </p>
          )}
          <Link to="/" className="inline-flex items-center px-6 py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess