import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const Hero = () => {
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section')
    if (productsSection) {
      productsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <div className="hero min-h-[600px] relative overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-950 to-black"></div>
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="hero-content text-center text-white relative z-10">
        <div className="max-w-md">
          <motion.h1 
            className="mb-5 text-5xl font-bold"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            transition={{ delay: 0.2 }}
          >
            Bienvenue sur CShop. Votre plateforme d'achats de vos produits
          </motion.h1>
          
          <motion.p 
            className="mb-5 text-gray-200"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            transition={{ delay: 0.4 }}
          >
            Découvrez notre large gamme d'articles et de produits de qualité supérieure
          </motion.p>
          
          <motion.button 
            className="btn btn-primary bg-fuchsia-350 hover:bg-fuchsia-300 border-none text-white"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToProducts}
          >
            Acheter maintenant <ArrowRight className="w-4 h-4 ml-2" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default Hero