import React from 'react'
import ProductCard from './ProductCard'

const ProductGrid = ({ products }) => {
  // Prend seulement les 6 premiers produits pour avoir 3 colonnes x 2 lignes
  const displayProducts = products.slice(0, 6)
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto">
      {displayProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid