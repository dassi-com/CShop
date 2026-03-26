import axiosInstance from '../config/axios'

// ⚠️ IMPORTANT: URLs d'images TOUJOURS depuis le backend API (jamais le frontend)
const BACKEND_API_URL = 'https://api-final-m259.onrender.com'

// Construit l'URL complète d'une image
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://placehold.co/400x400/1a1a2e/c084fc?text=No+Image'
  }
  
  // Si c'est déjà une URL complète avec https://, la retourner directement
  if (imagePath.startsWith('https://') || imagePath.startsWith('http://')) {
    console.log('[getImageUrl] URL complète retournée:', imagePath)
    return imagePath
  }
  
  // Si c'est un chemin commençant par /api ou /uploads, on ajoute le backend
  let finalUrl
  if (imagePath.startsWith('/')) {
    // Chemin absolu depuis le backend : /uploads/... ou /api/uploads/...
    finalUrl = `${BACKEND_API_URL}${imagePath}`
  } else if (imagePath.includes('/')) {
    // Chemin relatif : uploads/... ou api/uploads/...
    finalUrl = `${BACKEND_API_URL}/${imagePath}`
  } else {
    // Simple filename : XXX.jpg
    finalUrl = `${BACKEND_API_URL}/uploads/${imagePath}`
  }
  
  console.log('[getImageUrl] imagePath:', imagePath, '-> finalUrl:', finalUrl)
  return finalUrl
}

// Ancienne constante (pour la compatibilité)
export const IMAGE_BASE = BACKEND_API_URL

// Fonction pour corriger les images qui auraient un format incorrecte
const normalizeImagePath = (imagePath) => {
  if (!imagePath) return null
  
  // Si c'est déjà une bonne URL complète du backend, la garder
  if (imagePath.startsWith('https://api-final-m259.onrender.com')) {
    return imagePath
  }
  
  // Si c'est une URL mais du mauvais domaine (ex: frontend), l'extraire
  // Ex: https://c-shop-w.vercel.app/-final-m259.onrender.com/api/uploads/...
  // Chercher le pattern /uploads/ ou /api/uploads/
  const uploadsMatch = imagePath.match(/\/(uploads\/.*)/);
  if (uploadsMatch) {
    console.log('[normalizeImagePath] Chemin corrigé à partir d\'URL mal formée')
    return uploadsMatch[1]; // Retourne just 'uploads/...'
  }
  
  return imagePath
}

// Cache local pour les images - fallback si le backend ne les retourne pas
const imageCache = new Map()

const productService = {
  getAllProducts: async (page = 1) => {
    const response = await axiosInstance.get(`/products?page=${page}`)
    
    // Normaliser les images reçues (fixer les chemins mal formés)
    if (response?.data && Array.isArray(response.data)) {
      response.data = response.data.map(product => {
        if (product.image) {
          const normalized = normalizeImagePath(product.image)
          if (normalized !== product.image) {
            console.log(`[productService] Image corrigée pour ${product.name}: "${product.image}" → "${normalized}"`)
            product.image = normalized
          }
        }
        return product
      })
    }
    
    // Restaurer du cache si besoin
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
    
    // Normaliser l'image si présente
    if (response?.image) {
      const normalized = normalizeImagePath(response.image)
      if (normalized !== response.image) {
        console.log(`[productService] Image corrigée pour produit ${id}`)
        response.image = normalized
      }
      imageCache.set(id, response.image)
    }
    
    return response
  },

  // Admin - nécessite FormData (multipart/form-data) pour l'image
  createProduct: async (formData) => {
    const response = await axiosInstance.post('/products/add-product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    
    // Normaliser l'image si présente
    if (response?.image) {
      const normalized = normalizeImagePath(response.image)
      if (normalized !== response.image) {
        console.log(`[productService] Image corrigée pour nouveau produit`)
        response.image = normalized
      }
    }
    
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
    
    // Normaliser l'image si présente
    if (response?.image) {
      const normalized = normalizeImagePath(response.image)
      if (normalized !== response.image) {
        console.log(`[productService] Image corrigée pour produit modifié`)
        response.image = normalized
      }
    }
    
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
