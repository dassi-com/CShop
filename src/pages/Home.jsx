import React, { useState, useEffect, useCallback } from 'react';
import Hero from '../components/Hero';
import CarouselBanner from '../components/CarouselBanner';
import ProductGrid from '../components/ProductGrid';
import { initialProducts } from '../data/products';
import axios from 'axios';

const API_URL = 'https://api-final-m259.onrender.com/api';
const IMAGE_URL = 'https://api-final-m259.onrender.com';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${IMAGE_URL}/${imagePath}`;
  };

const loadProducts = useCallback(async () => {
  try {
    console.log('🔄 Chargement des produits depuis le serveur...');
    const response = await axios.get(`${API_URL}/products`);

    let apiProducts = [];
    if (response.data?.success && response.data?.data) {
      apiProducts = response.data.data.map(product => ({
        ...product,
        image: getImageUrl(product.image) // transforme l'image en URL complète
      }));
    }

    // Combine initialProducts + API
    const allProducts = [...initialProducts, ...apiProducts];

    console.log(`📦 Total produits: ${allProducts.length}`);
    setProducts(allProducts); // ✅ met à jour le state une seule fois

    setLoading(false);
    setLastUpdate(Date.now());
  } catch (error) {
    console.error('❌ Erreur chargement produits depuis API:', error);
    setProducts(initialProducts); // fallback sur les produits initiaux
    setLoading(false);
  }
}, []);


  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-fuchsia-300"></div>
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
            <h2 className="text-3xl font-bold text-fuchsia-300">
              Nos Produits
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {products.length} produits
              </span>
              <button 
                className="btn btn-sm btn-ghost text-fuchsia-300 hover:bg-fuchsia-300/10"
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