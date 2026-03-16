import React from 'react';
import ProductCard from './ProductCard';
import { initialProducts } from '../data/products';

const ProductGrid = ({ products }) => {
  // ✅ On combine les produits initiaux et ceux du state `products` si ce n'est pas déjà fait
  const allProducts = [...initialProducts, ...products];

  // ✅ Filtrage pour éviter les doublons par id
  const uniqueProducts = allProducts.filter(
    (product, index, self) =>
      index === self.findIndex(p => p.id === product.id)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 max-w-7xl mx-auto">
      {uniqueProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;