import axiosInstance from '../config/axios'

const authService = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData)
    return response
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials)
    return response
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Récupère le profil complet depuis GET /api/users/:id (avec roles peuplés)
  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}`)
    return response
  },
}

export default authService
