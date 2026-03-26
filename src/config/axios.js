import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api-final-m259.onrender.com/api'

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Injecte automatiquement le token JWT dans chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Déballes la réponse + gère les erreurs globales
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Le serveur met trop de temps à répondre. Réessayez.',
        status: 'TIMEOUT_ERROR',
      })
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('unauthorized'))
    }
    return Promise.reject({
      message: error.response?.data?.message || 'Erreur de connexion au serveur',
      status: error.response?.status || 'NETWORK_ERROR',
      data: error.response?.data,
    })
  }
)

export const api = {
  get: (url, config) => axiosInstance.get(url, config),
  post: (url, data, config) => axiosInstance.post(url, data, config),
  put: (url, data, config) => axiosInstance.put(url, data, config),
  delete: (url, config) => axiosInstance.delete(url, config),
}

export default axiosInstance
