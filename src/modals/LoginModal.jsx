import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

const LoginModal = ({ onClose, onOpenRegister }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const { login } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {}
    if (!email.trim()) errors.email = "L'email est requis"
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Format d'email invalide"
    if (!password) errors.password = "Le mot de passe est requis"
    else if (password.length < 6) errors.password = "Minimum 6 caractères"
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Décode le payload JWT pour extraire userId
  const decodeToken = (token) => {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      return JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')))
    } catch {
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')
    setFieldErrors({})
    if (!validateForm()) return

    setLoading(true)
    try {
      // 1. Connexion → obtenir le token
      const response = await authService.login({ email, password })
      if (!response?.success || !response?.token) {
        throw new Error(response?.message || 'Erreur de connexion')
      }
      const token = response.token
      const decoded = decodeToken(token)

      // 2. Préparer userData minimal d'abord
      let userData = { id: decoded?.userId, email, name: email.split('@')[0], roles: [] }
      
      // 3. Sauvegarder le token AVANT d'appeler l'API (important pour l'intercepteur axios)
      login(userData, token)

      // 4. Récupérer le profil complet (name + roles) depuis l'API maintenant que le token est sauvé
      try {
        const profile = await authService.getUserById(decoded?.userId)
        if (profile) {
          userData = {
            id: profile._id || profile.id,
            _id: profile._id || profile.id,
            name: profile.name || email.split('@')[0],
            email: profile.email || email,
            roles: profile.roles || [],
          }
          // Mettre à jour le user dans le context avec les données complètes
          login(userData, token)
        }
      } catch {
        // Profil inaccessible → continuer avec données minimales (c'est OK)
      }

      onClose()

      // Redirection admin si nécessaire
      const isAdmin = userData.roles?.some(r =>
        (typeof r === 'object' ? r?.name : r) === 'admin'
      )
      if (isAdmin) navigate('/admin', { replace: true })

    } catch (err) {
      if (err.status === 401) setError('Email ou mot de passe incorrect')
      else if (err.status === 500) setError('Erreur serveur. Réessayez plus tard.')
      else if (err.status === 'NETWORK_ERROR' || err.status === 'TIMEOUT_ERROR') {
        setError('Impossible de joindre le serveur. Vérifiez votre connexion.')
      } else {
        setError(err.message || 'Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={() => onClose()}
    >
      <motion.div
        className="bg-base-100 rounded-2xl w-full max-w-md shadow-2xl"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-base-300">
          <h3 className="text-2xl font-bold text-fuchsia-500">Connexion</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <motion.div className="alert alert-error shadow-lg" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium flex items-center gap-1"><Mail className="w-4 h-4" />Email</span></label>
            <div className="relative">
              <input
                type="email" placeholder="exemple@email.com"
                className={`input input-bordered w-full pl-10 bg-base-200 ${fieldErrors.email ? 'input-error' : ''}`}
                value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} autoFocus
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {fieldErrors.email && <span className="label-text-alt text-error mt-1">{fieldErrors.email}</span>}
          </div>

          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium flex items-center gap-1"><Lock className="w-4 h-4" />Mot de passe</span></label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                className={`input input-bordered w-full pl-10 pr-12 bg-base-200 ${fieldErrors.password ? 'input-error' : ''}`}
                value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && <span className="label-text-alt text-error mt-1">{fieldErrors.password}</span>}
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full bg-fuchsia-500 hover:bg-fuchsia-600 border-none text-white ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="divider text-xs text-gray-400">OU</div>
          <p className="text-sm text-center text-gray-500">
            Pas encore de compte ?{' '}
            <button type="button" onClick={() => { onClose(); setTimeout(() => onOpenRegister(), 300) }}
              className="text-fuchsia-500 hover:text-fuchsia-400 font-medium">
              S'inscrire
            </button>
          </p>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default LoginModal
