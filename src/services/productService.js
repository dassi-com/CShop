import axiosInstance from '../config/axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api-final-m259.onrender.com/api'
export const IMAGE_BASE = BASE_URL.replace('/api', '')

// Construit l'URL complète d'une image
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://placehold.co/400x400/1a1a2e/c084fc?text=No+Image'
  }
  
  // Si c'est déjà une URL complète, la retourner
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Nettoyer le chemin : supprimer les slashes au début si présents
  let cleanPath = imagePath
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1)
  }
  
  // Construire l'URL finale avec le base URL
  const imageUrl = `${IMAGE_BASE}/${cleanPath}`
  
  // Log pour déboguer
  console.log('[getImageUrl] imagePath:', imagePath, '-> imageUrl:', imageUrl)
  
  return imageUrl
}

// Cache local pour les images - fallback si le backend ne les retourne pas
const imageCache = new Map()

const productService = {
  getAllProducts: async (page = 1) => {
    const response = await axiosInstance.get(`/products?page=${page}`)
    
    // Si les produits n'ont pas d'image, les restaurer du cache si possible
    if (response?.data && Array.isArray(response.data)) {
      response.data = response.data.map(product => {
        if (!product.image && imageCache.has(product._id)) {
          console.log(`[productService] Restauration image cachée pour: ${product.name}`)
          product.image = imageCache.get(product._id)
        }
        return product
      })
    }
    
    return response
  },

  getProductById: async (id) => {
    const response = await axiosInstance.get(`/products/${id}`)
    
    // Cacher l'image si elle existe
    if (response?.image) {
      imageCache.set(id, response.image)
    }
    
    return response
  },

  // Admin - nécessite FormData (multipart/form-data) pour l'image
  createProduct: async (formData) => {
    const response = await axiosInstance.post('/products/add-product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    
    // Cacher l'image si elle existe dans la réponse
    if (response?._id && response?.image) {
      imageCache.set(response._id, response.image)
      console.log(`[productService] Image cachée pour produit créé: ${response._id}`)
    }
    
    return response
  },

  // Admin - PUT avec query param _id
  updateProduct: async (id, formData) => {
    const response = await axiosInstance.put(
      `/products/update-product?_id=${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    
    // Mettre à jour le cache si image dans la réponse
    if (response?.image) {
      imageCache.set(id, response.image)
      console.log(`[productService] Image cachée pour produit modifié: ${id}`)
    }
    
    return response
  },

  // Admin - DELETE avec query param _id
  deleteProduct: async (id) => {
    // Supprimer du cache
    imageCache.delete(id)
    const response = await axiosInstance.delete(`/products/delete-product?_id=${id}`)
    return response
  },

  // Utilitaire pour vider le cache
  clearImageCache: () => {
    imageCache.clear()
    console.log('[productService] Cache image vidé')
  },

  // Utilitaire pour afficher le cache
  getImageCache: () => imageCache,
}

export default productService
