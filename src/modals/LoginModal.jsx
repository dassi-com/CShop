import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LoginModal = ({ onClose }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }
    
    const success = login(email, password)
    if (success) {
      onClose()
    } else {
      setError('Email ou mot de passe incorrect')
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
          <h3 className="text-2xl font-bold text-fuchsia-500">Connexion</h3>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="alert alert-error shadow-lg">
              <span>{error}</span>
            </div>
          )}
          
          {/* Champ Email */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                placeholder="Email" 
                className="input input-bordered w-full pl-10 bg-base-200 focus:bg-base-100 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          {/* Champ Mot de passe */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Mot de passe</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="input input-bordered w-full pl-10 bg-base-200 focus:bg-base-100 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {/* Lien mot de passe oublié */}
          <div className="text-right">
            <a href="#" className="text-sm text-fuchsia-500 hover:text-fuchsia-400">
              Mot de passe oublié ?
            </a>
          </div>
          
          {/* Bouton de connexion */}
          <button type="submit" className="btn btn-primary w-full bg-fuchsia-350 hover:bg-fuchsia-300 border-none text-white">
            Se connecter
          </button>
          
          {/* Lien vers inscription */}
          <p className="text-sm text-center text-gray-500">
            Pas encore de compte ?{' '}
            <button 
              type="button"
              onClick={() => {
                onClose()
                // Ici tu peux ouvrir le modal d'inscription
                document.querySelector('[data-register-button]')?.click()
              }}
              className="text-fuchsia-500 hover:text-fuchsia-400 font-medium"
            >
              S'inscrire
            </button>
          </p>
          
          {/* Demo admin */}
          <div className="mt-4 p-3 bg-base-200 rounded-lg">
            <p className="text-xs text-center text-gray-400">
              <span className="font-medium text-fuchsia-500">Demo Admin:</span> admin@starchop.com / admin123
            </p>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default LoginModal