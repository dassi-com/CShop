import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api-final-m259.onrender.com/api';
const TIMEOUT = 30000; 

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Gestion des erreurs de timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Le serveur met trop de temps à répondre. Veuillez réessayer.',
        status: 'TIMEOUT_ERROR'
      });
    }

    // Gestion des erreurs 401 (non autorisé)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // ✅ NE PAS REDIRIGER VERS /login
      // On laisse le composant gérer l'état
      console.log('Session expirée - utilisateur déconnecté');
      
      // Option 1: On peut émettre un événement personnalisé
      window.dispatchEvent(new Event('unauthorized'));
    }

    // Rejeter avec un message d'erreur approprié
    return Promise.reject({
      message: error.response?.data?.message || 'Erreur de connexion au serveur',
      status: error.response?.status || 'NETWORK_ERROR',
      data: error.response?.data
    });
  }
);

export const api = {
  get: (url, config) => axiosInstance.get(url, config),
  post: (url, data, config) => axiosInstance.post(url, data, config),
  put: (url, data, config) => axiosInstance.put(url, data, config),
  delete: (url, config) => axiosInstance.delete(url, config),
};

export default axiosInstance;