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
    <div className="hero min-h-[500px]" style={{
      backgroundImage: 'url("")',
    }}>
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md">
          <motion.h1 
            className="mb-5 text-5xl font-bold"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            transition={{ delay: 0.2 }}
          >
            Welcome CShop
          </motion.h1>
          
          <motion.p 
            className="mb-5"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            transition={{ delay: 0.4 }}
          >
            Discover amazing products from across the galaxy
          </motion.p>
          
          <motion.button 
            className="btn btn-primary bg-fuchsia-350 hover:bg-fuchsia-300 border-none"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToProducts}
          >
            Shop Now <ArrowRight className="w-4 h-4 ml-2" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default Hero