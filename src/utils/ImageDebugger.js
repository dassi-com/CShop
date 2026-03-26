// Utilitaire pour déboguer les problèmes d'images

export const debugProductImages = (products) => {
  if (!Array.isArray(products)) {
    console.warn('⚠️ [ImageDebugger] products n\'est pas un tableau')
    return
  }

  console.group('🖼️ DEBUG - Analyse des images des produits')
  
  products.forEach((product, index) => {
    const { name, image, _id } = product
    const hasImage = !!image
    const isValid = image && (image.startsWith('http') || image.startsWith('/') || !image.includes('undefined'))
    
    const status = hasImage ? (isValid ? '✅' : '❌') : '⚠️'
    console.log(`${status} [${index + 1}] ${name || 'Sans nom'} (ID: ${_id})`)
    console.log(`   └─ image: "${image || 'UNDEFINED'}"`)
    
    if (!hasImage) {
      console.warn(`   └─ ⚠️ PROBLÈME: Le champ 'image' est vide ou undefined`)
    }
  })
  
  console.groupEnd()
  
  return {
    total: products.length,
    withImages: products.filter(p => !!p.image).length,
    withoutImages: products.filter(p => !p.image).length,
  }
}

export const validateImageUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const testImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    console.error(`❌ Erreur accès image: ${url}`, error.message)
    return false
  }
}

export const logProductResponse = (response) => {
  console.group('📦 Réponse API - Produits')
  console.log('Structure:', response)
  if (response?.data) {
    console.log(`Nombre de produits: ${response.data.length}`)
    if (response.data.length > 0) {
      console.log('Premier produit:', response.data[0])
    }
  }
  console.groupEnd()
}
