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
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedIsAdmin = localStorage.getItem('isAdmin')
    
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAdmin(storedIsAdmin === 'true')
    }
  }, [])

  const login = (email, password) => {
    // Simulate login - in real app, this would validate with backend
    const userData = { email, name: email.split('@')[0] }
    const adminStatus = email === 'admin@starchop.com' && password === 'admin123'
    
    setUser(userData)
    setIsAdmin(adminStatus)
    
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isAdmin', adminStatus.toString())
    
    return true
  }

  const register = (name, email, password) => {
    // Simulate registration
    const userData = { email, name }
    
    setUser(userData)
    setIsAdmin(false)
    
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isAdmin', 'false')
    
    return true
  }

  const logout = () => {
    setUser(null)
    setIsAdmin(false)
    localStorage.removeItem('user')
    localStorage.removeItem('isAdmin')
  }

  const value = {
    user,
    isAdmin,
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