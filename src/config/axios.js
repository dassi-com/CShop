import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-node-api-b5tp.onrender.com/api';
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
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Le serveur met trop de temps à répondre. Veuillez réessayer.',
        status: 'TIMEOUT_ERROR'
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    return Promise.reject({
      message: error.response?.data?.message || 'Erreur de connexion',
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