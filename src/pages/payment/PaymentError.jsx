import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'

const PaymentError = () => {
  const [searchParams] = useSearchParams()
  const message = searchParams.get('message') || 'Une erreur est survenue'

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-fuchsia-300 mb-2">Paiement échoué</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <Link to="/cart" className="inline-flex items-center px-6 py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au panier
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentError