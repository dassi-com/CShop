import axios from '../config/axios';

const productService = {
  // Récupérer tous les produits
  getAllProducts: async () => {
    try {
      const response = await axios.get('/products');
      return response; // Déjà formaté par l'intercepteur
    } catch (error) {
      throw error;
    }
  },

  // Récupérer un produit par ID
  getProductById: async (id) => {
    try {
      const response = await axios.get(`/products/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Créer un produit (admin)
  createProduct: async (productData) => {
    try {
      const response = await axios.post('/products', productData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour un produit (admin)
  updateProduct: async (id, productData) => {
    try {
      const response = await axios.put(`/products/${id}`, productData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer un produit (admin)
  deleteProduct: async (id) => {
    try {
      const response = await axios.delete(`/products/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default productService;