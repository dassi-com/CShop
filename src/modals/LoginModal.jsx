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

  // Fonction pour décoder le token JWT
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Erreur décodage token:", error);
      return null;
    }
  };

  // Fonction pour obtenir les infos utilisateur
  const getUserInfo = (token, email) => {
    try {
      const decodedToken = decodeToken(token);
      console.log("Token décodé:", decodedToken);
      
      // Vérifier si l'utilisateur est admin (vous pouvez adapter selon votre logique)
      const isAdmin = email === 'admin@cshop.com' || decodedToken?.role === 'admin';
      
      return {
        id: decodedToken?.userId || 'unknown',
        email: email,
        name: email.split('@')[0],
        role: isAdmin ? 'admin' : 'user'
      };
      
    } catch (error) {
      console.error("Erreur création user:", error);
      return {
        email: email,
        name: email.split('@')[0],
        role: email === 'admin@cshop.com' ? 'admin' : 'user'
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation() // 👈 ESSENTIEL POUR ÉVITER LES CONFLITS
    
    setError('')
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      console.log("📤 Tentative de connexion avec:", { email })
      
      const response = await authService.login({ email, password })
      
      console.log("✅ Réponse API reçue:", response)
      
      // Vérifier que la réponse est valide
      if (!response || !response.success) {
        throw new Error(response?.message || "Erreur de connexion")
      }
      
      // Extraire le token
      const token = response.token
      
      if (!token) {
        throw new Error("Token non trouvé dans la réponse")
      }
      
      console.log("🔑 Token reçu")
      
      // Créer l'objet utilisateur
      const userData = getUserInfo(token, email)
      
      console.log("👤 Données utilisateur:", userData)
      console.log("👑 Rôle utilisateur:", userData.role)
      
      // Mettre à jour le contexte d'authentification
      await login(userData, token)
      
      // Vérifier que onClose est bien une fonction
      if (typeof onClose === 'function') {
        onClose() // Fermer le modal
      } else {
        console.warn("onClose n'est pas une fonction")
      }
      
      // Rediriger si c'est un admin
      if (userData.role === 'admin') {
        console.log("👑 Admin détecté, redirection vers /admin")
        navigate('/admin', { replace: true })
      } else {
        console.log("👤 Utilisateur simple, reste sur la page d'accueil")
        // Rester sur la page actuelle
      }
      
    } catch (err) {
      console.error("❌ Erreur de connexion:", err)
      
      if (err.status === 401) {
        setError("Email ou mot de passe incorrect")
      } else if (err.status === 404) {
        setError("Utilisateur non trouvé")
      } else if (err.status === 500) {
        setError("Erreur serveur. Veuillez réessayer plus tard")
      } else if (err.message === 'Network Error' || err.status === 'NETWORK_ERROR') {
        setError("Impossible de se connecter au serveur. Vérifiez votre connexion")
      } else if (err.message) {
        setError(err.message)
      } else {
        setError("Une erreur est survenue lors de la connexion")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenRegister = () => {
    if (typeof onClose === 'function') {
      onClose()
    }
    if (onOpenRegister) {
      setTimeout(() => onOpenRegister(), 300)
    }
  }

  // Reste du JSX identique...
  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (typeof onClose === 'function') {
          onClose()
        }
      }}
    >
      <motion.div 
        className="bg-base-100 rounded-2xl w-full max-w-md shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-base-300">
          <h3 className="text-2xl font-bold text-fuchsia-500">
            Connexion
          </h3>
          <button 
            onClick={() => {
              if (typeof onClose === 'function') {
                onClose()
              }
            }}
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-300 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {fieldErrors.email && (
              <label className="label">
                <span className="label-text-alt text-error">{fieldErrors.email}</span>
              </label>
            )}
          </div>
          
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
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <label className="label">
                <span className="label-text-alt text-error">{fieldErrors.password}</span>
              </label>
            )}
          </div>
          
          <button 
            type="submit" 
            className={`btn btn-primary w-full bg-fuchsia-500 hover:bg-fuchsia-600 border-none text-white ${
              loading ? 'loading' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          
          <div className="divider text-xs text-gray-400">OU</div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <button 
                type="button"
                onClick={handleOpenRegister}
                className="text-fuchsia-500 hover:text-fuchsia-400 font-medium"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default LoginModal