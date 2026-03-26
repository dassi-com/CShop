// Stratégie de récupération des images manquantes
import axiosInstance from '../config/axios'

export const fetchMissingImages = async (products) => {
  if (!Array.isArray(products)) return products

  // Filtrer les produits sans image
  const productsWithoutImage = products.filter(p => !p.image)
  
  if (productsWithoutImage.length === 0) {
    console.log('✅ Tous les produits ont des images')
    return products
  }

  console.warn(`⚠️ ${productsWithoutImage.length} produit(s) sans image - tentative de récupération`)

  // Tenter de récupérer l'image pour chaque produit manquant
  const updatedProducts = await Promise.all(
    products.map(async (product) => {
      if (product.image) {
        return product // Image existe
      }

      try {
        // Tenter de récupérer le produit complet
        const fullProduct = await axiosInstance.get(`/products/${product._id}`)
        if (fullProduct?.image) {
          console.log(`✅ Image récupérée pour ${product.name}:`, fullProduct.image)
          return { ...product, image: fullProduct.image }
        }
      } catch (error) {
        console.log(`❌ Impossible de récupérer image pour ${product._id}`)
      }

      return product
    })
  )

  return updatedProducts
}

// Stratégie alternative : Construire une URL d'image par défaut basée sur le produit
export const generateFallbackImageUrl = (product, productIndex) => {
  // Si on a déjà une image, la retourner
  if (product.image) return product.image

  // Sinon, générer une image placeholder avec le nom du produit
  const encodedName = encodeURIComponent(product.name || `Product ${productIndex + 1}`)
  const placeholder = `https://placehold.co/400x400/c084fc/1a1a2e?text=${encodedName}`
  
  console.log(`[fallback] Placeholder pour "${product.name}": ${placeholder}`)
  return placeholder
}

// Vérifier et réparer les images après un upload
export const validateProductImages = (products) => {
  return products.map((product, index) => {
    if (!product.image) {
      console.warn(`⚠️ Produit ${index + 1} (${product.name}) sans image - utilisation fallback`)
      product.image = generateFallbackImageUrl(product, index)
    }
    return product
  })
}
