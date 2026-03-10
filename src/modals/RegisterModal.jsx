import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const RegisterModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const { register } = useAuth()

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
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name) newErrors.name = 'Le nom est requis'
    if (!formData.email) newErrors.email = 'L\'email est requis'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }
    if (!formData.password) newErrors.password = 'Le mot de passe est requis'
    else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    const success = register(formData.name, formData.email, formData.password)
    if (success) {
      onClose()
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
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Champ Nom */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Nom complet</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                name="name"
                placeholder="Votre Nom" 
                className={`input input-bordered w-full pl-10 bg-base-200 focus:bg-base-100 transition-colors ${
                  errors.name ? 'input-error' : ''
                }`}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.name}</span>
              </label>
            )}
          </div>
          
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
                name="email"
                placeholder="Email" 
                className={`input input-bordered w-full pl-10 bg-base-200 focus:bg-base-100 transition-colors ${
                  errors.email ? 'input-error' : ''
                }`}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.email}</span>
              </label>
            )}
          </div>
          
        
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
                name="password"
                placeholder="••••••••" 
                className={`input input-bordered w-full pl-10 bg-base-200 focus:bg-base-100 transition-colors ${
                  errors.password ? 'input-error' : ''
                }`}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.password}</span>
              </label>
            )}
            <label className="label">
              <span className="label-text-alt text-gray-400">
                Minimum 6 caractères
              </span>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full bg-fuchsia-350 hover:bg-fuchsia-300 border-none text-white"
          >
            S'inscrire
          </button>
          
          <p className="text-sm text-center text-gray-500">
            Déjà un compte ?{' '}
            <button 
              type="button"
              onClick={() => {
                onClose()

                document.querySelector('[data-login-button]')?.click()
              }}
              className="text-fuchsia-350 hover:text-fuchsia-300 font-medium"
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