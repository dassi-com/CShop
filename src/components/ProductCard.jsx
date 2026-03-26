import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/CartUtils'
import { getImageUrl } from '../services/productService'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()

  const imgSrc = product.image?.startsWith('http')
    ? product.image
    : getImageUrl(product.image)

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
          onError={(e) => {
            e.target.src = 'https://placehold.co/400x400/1a1a2e/c084fc?text=No+Image'
          }}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p className="text-fuchsia-400 font-bold text-lg">{formatPrice(product.price)}</p>
        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="card-actions justify-end mt-4">
          <motion.button
            className="btn btn-primary btn-sm bg-fuchsia-500 hover:bg-fuchsia-600 border-none text-white"
            onClick={() => addToCart(product)}
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
