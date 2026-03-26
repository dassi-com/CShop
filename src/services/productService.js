import axiosInstance from '../config/axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api-final-m259.onrender.com/api'
export const IMAGE_BASE = BASE_URL.replace('/api', '')

// Construit l'URL complète d'une image
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://placehold.co/400x400/1a1a2e/c084fc?text=No+Image'
  if (imagePath.startsWith('http')) return imagePath
  const clean = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  return `${IMAGE_BASE}/${clean}`
}

const productService = {
  getAllProducts: async (page = 1) => {
    const response = await axiosInstance.get(`/products?page=${page}`)
    return response
  },

  getProductById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`)
    return response
  },

  // Admin - nécessite FormData (multipart/form-data) pour l'image
  createProduct: async (formData) => {
    const response = await axiosInstance.post('/products/add-product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response
  },

  // Admin - PUT avec query param _id
  updateProduct: async (id, formData) => {
    const response = await axiosInstance.put(
      `/products/update-product?_id=${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response
  },

  // Admin - DELETE avec query param _id
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/products/delete-product?_id=${id}`)
    return response
  },
}

export default productService
