import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, ArrowLeft, RefreshCw } from 'lucide-react'
import axiosInstance from '../../config/axios'

const PaymentPending = () => {
  const [searchParams] = useSearchParams()
  const transactionId = searchParams.get('transactionId')
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState(null)

  const checkStatus = async () => {
    if (!transactionId) return
    setChecking(true)
    try {
      const response = await axiosInstance.get(`/payments/cinetpay/status/${transactionId}`)
      setStatus(response)
    } catch (err) {
      console.error('Erreur vérification statut:', err)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-xl">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-yellow-500 mb-2">Paiement en attente</h2>
          <p className="text-gray-600 mb-2">Votre paiement est en cours de traitement.</p>
          {transactionId && (
            <p className="text-sm text-gray-400 mb-6 font-mono">Transaction : {transactionId}</p>
          )}
          {status && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
              Statut : <strong>{status?.data?.payment_status || 'En traitement'}</strong>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {transactionId && (
              <button onClick={checkStatus} disabled={checking}
                className="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-60">
                <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Vérification...' : 'Vérifier le statut'}
              </button>
            )}
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

export default PaymentPending
