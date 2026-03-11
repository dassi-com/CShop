import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import CarouselBanner from '../components/CarouselBanner';
import ProductGrid from '../components/ProductGrid';
import { initialProducts } from '../data/products';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());


  const loadProducts = () => {
    try {
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      const allProducts = [...initialProducts, ...adminProducts];
      setProducts(allProducts);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      setProducts(initialProducts);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'adminProducts') {
        console.log(' Changement détecté dans adminProducts, rechargement...');
        loadProducts();
        setLastUpdate(Date.now());
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      const currentProducts = [...initialProducts, ...adminProducts];
      

      if (currentProducts.length !== products.length) {
        console.log(' Détection d\'un changement via interval');
        setProducts(currentProducts);
      }
    }, 3000); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [products.length]);

  //  rafraîchissement globalement 
  useEffect(() => {
    window.refreshProducts = loadProducts;
    return () => {
      delete window.refreshProducts;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-fuchsia-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Hero />
      <div className="container mx-auto px-4">
        <CarouselBanner />
        
        <section id="products-section" className="my-16 scroll-mt-20">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl  font-bold text-fuchsia-500">
              Nos Produits
            </h2>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {products.length} produits
              </span>
              
              <button 
                className="btn btn-sm btn-ghost"
                onClick={loadProducts}
                title="Rafraîchir"
              >
                ⟳
              </button>
            </div>
          </div>
          
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Découvrez notre sélection de produits cosmiques
          </p>
          
          {products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">Aucun produit disponible pour le moment</p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
          
        
          <div className="text-center mt-4 text-xs text-gray-500">
            Dernière mise à jour: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;