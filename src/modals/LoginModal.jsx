import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'

const LoginModal = ({ onClose, onOpenRegister }) => {
  // États pour les champs du formulaire
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // États pour la gestion des erreurs et du chargement
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Récupérer la fonction login du contexte
  const { login } = useAuth()

  // Fonction de validation
  const validateForm = () => {
    const errors = {}
    
    if (!email.trim()) {
      errors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Format d'email invalide"
    }
    
    if (!password) {
      errors.password = "Le mot de passe est requis"
    } else if (password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères"
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Valider le formulaire
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Appel API via authService
      const response = await authService.login({ email, password })
      
      // Vérifier la structure de la réponse
      if (response.success && response.data) {
        const { token, user } = response.data
        
        // Mettre à jour le contexte d'authentification
        await login(user)
        
        // Fermer le modal
        onClose()
      } else {
        setError(response.message || "Erreur de connexion")
      }
    } catch (err) {
      console.error("Erreur de connexion:", err)
      
      // Gestion des différentes erreurs
      if (err.status === 401) {
        setError("Email ou mot de passe incorrect")
      } else if (err.status === 404) {
        setError("Utilisateur non trouvé")
      } else if (err.status === 500) {
        setError("Erreur serveur. Veuillez réessayer plus tard")
      } else if (err.message === 'Network Error') {
        setError("Impossible de se connecter au serveur. Vérifiez votre connexion")
      } else {
        setError(err.message || "Une erreur est survenue lors de la connexion")
      }
    } finally {
      setLoading(false)
    }
  }

  // Gestionnaire pour ouvrir le modal d'inscription
  const handleOpenRegister = () => {
    onClose() // Fermer le modal de login
    if (onOpenRegister) {
      onOpenRegister() // Ouvrir le modal d'inscription
    }
  }

  // Raccourci clavier (Enter pour soumettre)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e)
    }
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-base-100 rounded-2xl w-full max-w-md shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête du modal */}
        <div className="flex justify-between items-center p-6 border-b border-base-300">
          <h3 className="text-2xl font-bold text-fuchsia-500">
            Connexion
          </h3>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-300 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Message d'erreur général */}
          {error && (
            <motion.div 
              className="alert alert-error shadow-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}
          
          {/* Champ Email */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </span>
            </label>
            <div className="relative">
              <input 
                type="email" 
                placeholder="exemple@email.com" 
                className={`input input-bordered w-full pl-10 pr-4 py-3 bg-base-200 focus:bg-base-100 transition-colors ${
                  fieldErrors.email ? 'input-error' : ''
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors({...fieldErrors, email: ''})
                  }
                }}
                onKeyPress={handleKeyPress}
                disabled={loading}
                autoFocus
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {fieldErrors.email && (
              <label className="label">
                <span className="label-text-alt text-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                </span>
              </label>
            )}
          </div>
          
          {/* Champ Mot de passe */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-1">
                <Lock className="w-4 h-4" />
                Mot de passe
              </span>
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                className={`input input-bordered w-full pl-10 pr-12 py-3 bg-base-200 focus:bg-base-100 transition-colors ${
                  fieldErrors.password ? 'input-error' : ''
                }`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) {
                    setFieldErrors({...fieldErrors, password: ''})
                  }
                }}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <label className="label">
                <span className="label-text-alt text-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </span>
              </label>
            )}
            
            {/* Lien mot de passe oublié */}
            <div className="flex justify-end mt-1">
              <button 
                type="button"
                className="text-xs text-fuchsia-500 hover:text-fuchsia-400 transition-colors"
                onClick={() => alert("Fonctionnalité de récupération de mot de passe à venir")}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>
          
          {/* Bouton de connexion */}
          <button 
            type="submit" 
            className={`btn btn-primary w-full bg-fuchsia-500 hover:bg-fuchsia-600 border-none text-white mt-6 ${
              loading ? 'loading' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
          
          {/* Séparateur */}
          <div className="divider text-xs text-gray-400">OU</div>
          
          {/* Lien vers inscription */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <button 
                type="button"
                onClick={handleOpenRegister}
                className="text-fuchsia-500 hover:text-fuchsia-400 font-medium transition-colors"
                disabled={loading}
              >
                S'inscrire
              </button>
            </p>
          </div>
          
          {/* Informations de démo */}
          <div className="mt-4 p-3 bg-base-200 rounded-lg border border-base-300">
            <p className="text-xs text-center text-gray-400">
              <span className="font-medium text-fuchsia-500">Demo:</span>
            </p>
            <p className="text-xs text-center text-gray-400 mt-1">
              Email: demo@starchop.com<br />
              Mot de passe: demo123
            </p>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default LoginModal