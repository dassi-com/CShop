import axios from '../config/axios';

const authService = {
  // Inscription
  register: async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Connexion
  login: async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    try {
      const response = await axios.get('/user/profile');
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;