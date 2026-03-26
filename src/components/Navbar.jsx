import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, LogIn, UserPlus, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import LoginModal from '../modals/LoginModal'
import RegisterModal from '../modals/RegisterModal'

const Navbar = () => {
  const { getCartCount, clearCart } = useCart()
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [cartAnimation, setCartAnimation] = useState(false)
  const cartCount = getCartCount()

  useEffect(() => {
    if (cartCount > 0) {
      setCartAnimation(true)
      const timer = setTimeout(() => setCartAnimation(false), 300)
      return () => clearTimeout(timer)
    }
  }, [cartCount])

  const getUserInitial = () => {
    if (!user) return '?'
    if (user.name?.length > 0) return user.name.charAt(0).toUpperCase()
    if (user.email?.length > 0) return user.email.charAt(0).toUpperCase()
    return 'U'
  }

  const getUserName = () => {
    if (!user) return 'Utilisateur'
    return user.name?.trim() || user.email?.split('@')[0] || 'Utilisateur'
  }

  const handleLogout = () => {
    clearCart()
    logout()
    navigate('/')
  }

  return (
    <>
      <div className="navbar bg-base-100 shadow-lg px-4 md:px-8 fixed top-0 left-0 right-0 z-50">
        <div className="navbar-start">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-fuchsia-400">CShop</span>
          </Link>
        </div>

        <div className="navbar-center hidden sm:flex">
          <Link to="/" className="btn btn-ghost btn-sm">Acceuil</Link>
        </div>

        <div className="navbar-end gap-2">
          <Link to="/" className="btn btn-ghost btn-sm sm:hidden">Acceuil</Link>

          {/* Panier */}
          <Link to="/cart" className="btn btn-ghost btn-circle relative">
            <motion.div animate={cartAnimation ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
              <ShoppingCart className="w-5 h-5" />
            </motion.div>
            {cartCount > 0 && (
              <span className="badge badge-sm badge-primary absolute -top-2 -right-2 bg-fuchsia-500 border-fuchsia-500">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                  {getUserInitial()}
                </div>
              </label>
              <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 z-50 border border-fuchsia-500/20">
                <li className="p-2">
                  <span className="text-xs text-gray-500">Connecté en tant que</span>
                  <span className="font-bold text-fuchsia-500 text-sm">{getUserName()}</span>
                </li>

                {isAdmin && (
                  <li>
                    <Link to="/admin" className="text-fuchsia-500 hover:bg-fuchsia-500/10 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Panneau Admin
                    </Link>
                  </li>
                )}

                <li>
                  <button onClick={handleLogout} className="text-red-500 hover:bg-red-500/10 w-full text-left">
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <button onClick={() => setShowLoginModal(true)} className="btn btn-ghost btn-sm gap-1">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Connexion</span>
              </button>
              <button onClick={() => setShowRegisterModal(true)} className="btn btn-primary btn-sm gap-1 bg-fuchsia-500 hover:bg-fuchsia-600 border-none">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Inscription</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Espaceur */}
      <div className="h-16"></div>

      <AnimatePresence>
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onOpenRegister={() => { setShowLoginModal(false); setShowRegisterModal(true) }}
          />
        )}
        {showRegisterModal && (
          <RegisterModal
            onClose={() => setShowRegisterModal(false)}
            onOpenLogin={() => { setShowRegisterModal(false); setShowLoginModal(true) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
