import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/CartUtils'
import { getImageUrl } from '../services/productService'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()

  // Construire l'URL de l'image avec gestion robuste
  let imgSrc
  if (!product.image) {
    // Si pas d'image, générer un placeholder avec le nom du produit
    const encodedName = encodeURIComponent(product.name || 'Product')
    imgSrc = `https://placehold.co/400x400/c084fc/1a1a2e?text=${encodedName}`
    console.warn(`[ProductCard] "${product.name}" - image undefined, utilisation placeholder`)
  } else if (product.image.startsWith('http')) {
    imgSrc = product.image
  } else {
    imgSrc = getImageUrl(product.image)
  }

  // Log pour déboguer
  console.log(`[ProductCard] ${product.name} - image: ${product.image || 'undefined'} -> URL: ${imgSrc}`)

  const handleImageError = (e) => {
    console.error(`[ProductCard] Erreur chargement image pour ${product.name}:`, e.target.src)
    // Fallback : utiliser une image placeholder générique
    e.target.src = `https://placehold.co/400x400/c084fc/1a1a2e?text=${encodeURIComponent(product.name)}`
  }

  return (
    <motion.div
      className="card bg-base-100 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <figure className="px-4 pt-4">
        <img
          src={imgSrc}
          alt={product.name}
          className="rounded-xl h-48 w-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p className="text-fuchsia-400 font-bold text-lg">{formatPrice(product.price)}</p>
        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="card-actions justify-end mt-4">
          <motion.button
            className="btn btn-primary btn-sm bg-fuchsia-500 hover:bg-fuchsia-600 border-none text-white"
            onClick={() => {
              console.log('[ProductCard] Produit à ajouter:', product, 'ID:', product._id || product.id)
              addToCart(product)
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Ajouter
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
