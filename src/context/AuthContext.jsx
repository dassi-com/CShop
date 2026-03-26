import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // isAdmin : vérifie le tableau roles renvoyé par l'API (après populate)
  const isAdmin = user?.roles?.some(r =>
    (typeof r === 'object' ? r?.name : r) === 'admin'
  ) || false

  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')
        if (storedUser && storedToken && storedUser !== 'undefined') {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } else {
          localStorage.removeItem('user')
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }
    loadUserFromStorage()
  }, [])

  const login = (userData, token) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', token)
      setUser(userData)
      return true
    } catch (error) {
      console.error('Erreur login:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('cart')
  }

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
