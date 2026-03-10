import React, { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import CarouselBanner from '../components/CarouselBanner'
import ProductGrid from '../components/ProductGrid'
import { initialProducts } from '../data/products'

const Home = () => {
  const [products, setProducts] = useState(initialProducts)

  useEffect(() => {
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
    if (adminProducts.length > 0) {
      setProducts([...initialProducts, ...adminProducts])
    }
  }, [])

  return (
    <div>
      <Hero />
      <div className="container mx-auto px-4">
        <CarouselBanner />
        <section id="products-section" className="my-16 scroll-mt-20">
          <h2 className="text-3xl font-bold text-center mb-10 text-fuchsia-300">
            Nos Produits Populaires
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Découvrez notre sélection de produits cosmiques soigneusement choisis pour vous
          </p>
          
       
          <ProductGrid products={products} />
          
          
          <div className="text-center mt-10">
            <button className="btn btn-outline btn-primary border-fuchsia-500 text-fuchsia-350 hover:bg-fuchsia-300 hover:text-white hover:border-fuchsia-500">
              Voir tous les produits
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home