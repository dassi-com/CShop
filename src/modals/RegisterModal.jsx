import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, User, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

const RegisterModal = ({ onClose, onOpenLogin }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    if (apiError) setApiError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis'
    else if (formData.name.length < 2) newErrors.name = 'Minimum 2 caractères'
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalide"
    if (!formData.password) newErrors.password = 'Le mot de passe est requis'
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères'
    return newErrors
  }

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
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setLoading(true)
    setApiError('')

    try {
      // 1. Inscription
      const registerResponse = await authService.register(formData)
      if (!registerResponse?.success) {
        throw new Error(registerResponse?.message || "Erreur lors de l'inscription")
      }

      // 2. Connexion automatique
      const loginResponse = await authService.login({
        email: formData.email,
        password: formData.password,
      })
      if (!loginResponse?.success || !loginResponse?.token) {
        // Inscription OK mais auto-login échoué → renvoyer vers login
        onClose()
        setTimeout(() => onOpenLogin(), 300)
        return
      }

      const token = loginResponse.token
      const decoded = decodeToken(token)

      // 3. Préparer userData minimal d'abord
      let userData = {
        id: decoded?.userId,
        _id: decoded?.userId,
        email: formData.email,
        name: formData.name,
        roles: [],
      }
      
      // 4. Sauvegarder le token AVANT d'appeler l'API
      login(userData, token)

      // 5. Récupérer le profil complet maintenant que le token est sauvé
      try {
        const profile = await authService.getUserById(decoded?.userId)
        if (profile) {
          userData = {
            id: profile._id || profile.id,
            _id: profile._id || profile.id,
            name: profile.name || formData.name,
            email: profile.email || formData.email,
            roles: profile.roles || [],
          }
          // Mettre à jour le user dans le context avec les données complètes
          login(userData, token)
        }
      } catch {}

      onClose()

      const isAdmin = userData.roles?.some(r =>
        (typeof r === 'object' ? r?.name : r) === 'admin'
      )
      if (isAdmin) navigate('/admin', { replace: true })

    } catch (err) {
      if (err.status === 401) setApiError("Email ou données invalides")
      else if (err.message?.includes('existe déjà') || err.status === 409) {
        setApiError('Cet email est déjà utilisé')
      } else if (err.status === 'NETWORK_ERROR' || err.status === 'TIMEOUT_ERROR') {
        setApiError('Impossible de joindre le serveur. Vérifiez votre connexion.')
      } else {
        setApiError(err.message || "Une erreur est survenue lors de l'inscription")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-base-100 rounded-2xl w-full max-w-md shadow-2xl"
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-base-300">
          <h3 className="text-2xl font-bold text-fuchsia-500">Inscription</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {apiError && (
            <motion.div className="alert alert-error shadow-lg" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{apiError}</span>
            </motion.div>
          )}

          {/* Nom */}
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium flex items-center gap-1"><User className="w-4 h-4" />Nom complet</span></label>
            <div className="relative">
              <input type="text" name="name" placeholder="Votre nom"
                className={`input input-bordered w-full pl-10 bg-base-200 ${errors.name ? 'input-error' : ''}`}
                value={formData.name} onChange={handleChange} disabled={loading} autoFocus />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.name && <span className="label-text-alt text-error mt-1">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium flex items-center gap-1"><Mail className="w-4 h-4" />Email</span></label>
            <div className="relative">
              <input type="email" name="email" placeholder="exemple@email.com"
                className={`input input-bordered w-full pl-10 bg-base-200 ${errors.email ? 'input-error' : ''}`}
                value={formData.email} onChange={handleChange} disabled={loading} />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.email && <span className="label-text-alt text-error mt-1">{errors.email}</span>}
          </div>

          {/* Mot de passe */}
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-medium flex items-center gap-1"><Lock className="w-4 h-4" />Mot de passe</span></label>
            <div className="relative">
              <input type="password" name="password" placeholder="••••••••"
                className={`input input-bordered w-full pl-10 bg-base-200 ${errors.password ? 'input-error' : ''}`}
                value={formData.password} onChange={handleChange} disabled={loading} />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.password && <span className="label-text-alt text-error mt-1">{errors.password}</span>}
            <span className="label-text-alt text-gray-400 mt-1">Minimum 6 caractères</span>
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full bg-fuchsia-500 hover:bg-fuchsia-600 border-none text-white ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>

          <div className="divider text-xs text-gray-400">OU</div>
          <p className="text-sm text-center text-gray-500">
            Déjà un compte ?{' '}
            <button type="button" onClick={() => { onClose(); setTimeout(() => onOpenLogin(), 300) }}
              className="text-fuchsia-500 hover:text-fuchsia-400 font-medium" disabled={loading}>
              Se connecter
            </button>
          </p>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default RegisterModal
