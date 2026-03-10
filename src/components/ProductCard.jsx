import React from 'react'
import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/CartUtils'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()

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
          src={product.image} 
          alt={product.name}
          className="rounded-xl h-48 w-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <p className="text-primary font-bold">{formatPrice(product.price)}</p>
        <p className="text-sm text-gray-500">{product.description}</p>
        <div className="card-actions justify-end mt-4">
          <motion.button 
            className="btn btn-primary btn-sm"
            onClick={() => addToCart(product)}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard