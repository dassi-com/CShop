import axiosInstance from '../config/axios'

const orderService = {
  // GET /api/orders – commandes de l'utilisateur connecté
  getOrders: async () => {
    const response = await axiosInstance.get('/orders')
    return response
  },

  // GET /api/orders/:id
  getOrderById: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`)
    return response
  },

  // POST /api/orders – crée une commande
  // API attend : { items: [{ productId, quantity }] }
  createOrder: async (items) => {
    const payload = {
      items: items.map(item => ({
        productId: item._id || item.id,
        quantity: item.quantity,
      })),
    }
    const response = await axiosInstance.post('/orders', payload)
    return response
  },

  // PUT /api/orders/:id/cancel
  cancelOrder: async (id) => {
    const response = await axiosInstance.put(`/orders/${id}/cancel`)
    return response
  },
}

export default orderService
