import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, User, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

const RegisterModal = ({ onClose, onOpenLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [step, setStep] = useState('register') // 'register' ou 'login'
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
    if (apiError) setApiError('')
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    
    return newErrors
  }

// Dans RegisterModal.jsx, modifiez la fonction loginAfterRegister

const loginAfterRegister = async (email, password) => {
  try {
    console.log("🔄 Tentative de connexion automatique...")
    
    const loginResponse = await authService.login({ email, password })
    
    console.log("✅ Réponse login:", loginResponse)
    
    let token = null
    
    if (loginResponse?.token) {
      token = loginResponse.token
    } else if (loginResponse?.data?.token) {
      token = loginResponse.data.token
    } else if (loginResponse?.success && loginResponse?.token) {
      token = loginResponse.token
    } else {
      throw new Error("Token non trouvé")
    }
    
    // Récupérer les infos utilisateur (même fonction que dans LoginModal)
    const getUserInfo = async (token, email) => {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        console.log("Token décodé:", decodedToken);
        
        return {
          id: decodedToken.userId,
          email: email,
          name: email.split('@')[0],
          role: decodedToken.role || 'user'
        };
        
      } catch (error) {
        console.error("Erreur décodage:", error);
        return {
          email: email,
          name: email.split('@')[0],
          role: 'user'
        };
      }
    };
    
    const userData = await getUserInfo(token, email)
    
    return { userData, token }
    
  } catch (error) {
    console.error("❌ Erreur connexion automatique:", error)
    throw error
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
      console.log("📤 Tentative d'inscription avec:", formData)
      
      // 1. Inscription
      const registerResponse = await authService.register(formData)
      
      console.log("✅ Réponse inscription:", registerResponse)
      
      // Vérifier si l'inscription a réussi
      if (registerResponse?.success === true) {
        console.log("✅ Inscription réussie!")
        
        // 2. Connexion automatique
        try {
          const { userData, token } = await loginAfterRegister(formData.email, formData.password)
          
          console.log("✅ Connexion automatique réussie!")
          
          // Fermer le modal
          onClose()
          
          // Redirection basée sur le rôle
          if (userData?.role === 'admin') {
            console.log("👑 Admin détecté, redirection vers /admin")
            navigate('/admin', { replace: true })
          } else {
            console.log("👤 Utilisateur standard, reste sur la page d'accueil")
            // Rester sur la page actuelle
          }
          
        } catch (loginError) {
          // Si la connexion automatique échoue, on ouvre le modal de connexion
          console.log("⚠️ Connexion automatique échouée, redirection vers login")
          setStep('login')
          onClose()
          if (onOpenLogin) {
            setTimeout(() => onOpenLogin(), 300)
          }
        }
        
      } else {
        throw new Error(registerResponse?.message || "Erreur lors de l'inscription")
      }
      
    } catch (err) {
      console.error("❌ Erreur détaillée:", err)
      
      if (err.response?.status === 400) {
        setApiError("Données invalides. Vérifiez vos informations.")
      } else if (err.response?.status === 409) {
        setApiError("Cet email est déjà utilisé")
      } else if (err.response?.status === 500) {
        setApiError("Erreur serveur. Veuillez réessayer plus tard")
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setApiError("Impossible de se connecter au serveur")
      } else if (err.message) {
        setApiError(err.message)
      } else {
        setApiError("Une erreur est survenue lors de l'inscription")
      }
    } finally {
      setLoading(false)
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
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b border-base-300">
          <h3 className="text-2xl font-bold text-fuchsia-500">Inscription</h3>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-300"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Message d'erreur API */}
          {apiError && (
            <motion.div 
              className="alert alert-error shadow-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{apiError}</span>
            </motion.div>
          )}

          {/* Message de succès temporaire */}
          {step === 'login' && (
            <motion.div 
              className="alert alert-success shadow-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span>Inscription réussie ! Veuillez vous connecter.</span>
            </motion.div>
          )}

          {/* Champ Nom */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-1">
                <User className="w-4 h-4" />
                Nom complet
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                name="name"
                placeholder="Votre nom" 
                className={`input input-bordered w-full pl-10 bg-base-200 focus:bg-base-100 transition-colors ${
                  errors.name ? 'input-error' : ''
                }`}
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                autoFocus
              />
            </div>
            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </span>
              </label>
            )}
          </div>
          
          {/* Champ Email */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                name="email"
                placeholder="exemple@email.com" 
                className={`input input-bordered w-full pl-10 bg-base-200 focus:bg-base-100 transition-colors ${
                  errors.email ? 'input-error' : ''
                }`}
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                name="password"
                placeholder="••••••••" 
                className={`input input-bordered w-full pl-10 bg-base-200 focus:bg-base-100 transition-colors ${
                  errors.password ? 'input-error' : ''
                }`}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </span>
              </label>
            )}
            <label className="label">
              <span className="label-text-alt text-gray-400">
                Minimum 6 caractères
              </span>
            </label>
          </div>
          
          {/* Bouton d'inscription */}
          <button 
            type="submit" 
            className={`btn btn-primary w-full bg-fuchsia-500 hover:bg-fuchsia-600 border-none text-white ${
              loading ? 'loading' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Inscription en cours...' : "S'inscrire"}
          </button>
          
          {/* Lien vers connexion */}
          <div className="divider text-xs text-gray-400">OU</div>
          
          <p className="text-sm text-center text-gray-500">
            Déjà un compte ?{' '}
            <button 
              type="button"
              onClick={() => {
                onClose()
                if (onOpenLogin) {
                  setTimeout(() => onOpenLogin(), 300)
                }
              }}
              className="text-fuchsia-500 hover:text-fuchsia-400 font-medium transition-colors"
              disabled={loading}
            >
              Se connecter
            </button>
          </p>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default RegisterModal