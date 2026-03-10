import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, isAdmin } = useAuth()

  if (!user || !isAdmin) {
    // Redirect to home page if not authenticated or not admin
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute