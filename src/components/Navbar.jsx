import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, LogIn, UserPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import LoginModal from '../modals/LoginModal'
import RegisterModal from '../modals/RegisterModal'

const Navbar = () => {
  const { getCartCount } = useCart()
  const { user, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [cartAnimation, setCartAnimation] = useState(false)
  const cartCount = getCartCount()

  // Trigger cart animation when item is added
  useEffect(() => {
    if (cartCount > 0) {
      setCartAnimation(true)
      const timer = setTimeout(() => setCartAnimation(false), 300)
      return () => clearTimeout(timer)
    }
  }, [cartCount])

  return (
    <>
      <div className="navbar bg-base-100 shadow-lg px-4 md:px-8 fixed top-0 left-0 right-0 z-50">
        <div className="navbar-start">
          <Link to="/" className="flex items-center gap-2">
            <Star className="w-6 h-6 text-fuchsia-500" />
            <span className="text-xl font-bold">CShop</span>
          </Link>
        </div>
        
        <div className="navbar-center hidden sm:flex">
          <Link to="/" className="btn btn-ghost btn-sm">
            Home
          </Link>
        </div>
        
        <div className="navbar-end gap-2">
          {/* Mobile menu - Home link for small screens */}
          <Link to="/" className="btn btn-ghost btn-sm sm:hidden">
            Home
          </Link>
          
          <Link to="/cart" className="btn btn-ghost btn-circle relative">
            <motion.div
              animate={cartAnimation ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
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
                <div className="w-8 rounded-full bg-fuchsia-500 text-white flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </label>
              <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 z-50">
                <li className="menu-title">
                  <span>{user.name}</span>
                </li>
                <li><a onClick={logout}>Logout</a></li>
              </ul>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="btn btn-ghost btn-sm gap-1"
                data-login-button
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </button>
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="btn btn-primary btn-sm gap-1 bg-fuchsia-300 hover:bg-fuchsia-'350 border-none"
                data-register-button
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Register</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Espace pour compenser la navbar fixed */}
      <div className="h-16"></div>

      <AnimatePresence>
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
        {showRegisterModal && (
          <RegisterModal onClose={() => setShowRegisterModal(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar