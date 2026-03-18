import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, ArrowLeft } from 'lucide-react'
import axios from 'axios'

const API_URL = 'https://api-final-m259.onrender.com/api'

const PaymentPending = () => {
  const [searchParams] = useSearchParams()
  const transactionId = searchParams.get('transactionId')
  const [status, setStatus] = useState('pending')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      if (!transactionId) return
      
      setChecking(true)
      try {
        const response = await axios.get(`${API_URL}/payments/cinetpay/status/${transactionId}`)
        if (response.data?.status === 'success') {
          setStatus('success')
        } else if (response.data?.status === 'failed') {
          setStatus('failed')
        }
      } catch (error) {
        console.error('Erreur vérification:', error)
      } finally {
        setChecking(false)
      }
    }

    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [transactionId])

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {checking ? (
              <div className="loading loading-spinner loading-lg text-fuchsia-300"></div>
            ) : (
              <Clock className="w-10 h-10 text-yellow-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-fuchsia-300 mb-2">Paiement en attente</h2>
          <p className="text-gray-600 mb-4">
            Votre transaction est en cours de traitement
          </p>
          {status === 'success' ? (
            <Link to="/payment/success" className="inline-flex items-center px-6 py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg transition-colors">
              Voir confirmation
            </Link>
          ) : (
            <Link to="/cart" className="inline-flex items-center px-6 py-3 bg-fuchsia-300 hover:bg-fuchsia-400 text-white rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au panier
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentPending