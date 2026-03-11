import React from 'react'
import { Star, Heart } from 'lucide-react'

const Footer = () => {
  return (
    <>
      <footer className="bg-base-200 text-base-content fixed bottom-0 left-0 right-0 z-40 py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              <span className='text-fuchsia-500'>CShop</span>
            </div>
            
            <div className="flex gap-4 my-2 sm:my-0">
              <a className="link link-hover">About</a>
              <a className="link link-hover">Contact</a>
              <a className="link link-hover">Privacy</a>
            </div>
            
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-fuchsia-500" />
              <span>in space</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Espace pour compenser le footer fixed */}
      <div className="h-16"></div>
    </>
  )
}

export default Footer