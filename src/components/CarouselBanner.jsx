import React from 'react'
import { carouselItems } from '../data/products'

const CarouselBanner = () => {
  return (
    <div className="carousel w-full h-64 my-8">
      {carouselItems.map((item, index) => (
        <div 
          key={item.id} 
          id={`slide${index + 1}`} 
          className="carousel-item relative w-full"
        >
          <img 
            src={item.image} 
            className="w-full object-cover" 
            alt={item.title}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold mb-2">{item.title}</h3>
              <p className="mb-4">{item.description}</p>
              <button className="btn btn-primary btn-sm">
                {item.buttonText}
              </button>
            </div>
          </div>
          <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
            <a href={`#slide${index}`} className="btn btn-circle">❮</a>
            <a href={`#slide${index + 2}`} className="btn btn-circle">❯</a>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CarouselBanner