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

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')
        
        // Vérifier si storedUser existe et n'est pas "undefined"
        if (storedUser && storedToken && storedUser !== 'undefined') {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          console.log('Utilisateur chargé:', parsedUser)
        } else {
          // Nettoyer le localStorage si les données sont invalides
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

  const login = async (userData, token) => {
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

  const register = async (userData, token) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', token)
      setUser(userData)
      return true
    } catch (error) {
      console.error('Erreur register:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const value = {
    user,
    isAdmin,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}