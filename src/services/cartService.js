import axios from '../config/axios';

const orderService = {
  // Récupérer toutes les commandes
  getOrders: async () => {
    try {
      const response = await axios.get('/orders');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une commande par ID
  getOrderById: async (id) => {
    try {
      const response = await axios.get(`/orders/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Créer une commande
  createOrder: async (orderData) => {
    try {
      const response = await axios.post('/orders', orderData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default orderService;