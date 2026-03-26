import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

const PaymentError = () => {
  const [searchParams] = useSearchParams()
  const message = searchParams.get('message') || 'Une erreur est survenue lors du paiement.'

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Paiement échoué</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/cart" className="inline-flex items-center justify-center px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Link>
            <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentError
