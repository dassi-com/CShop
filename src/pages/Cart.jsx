import React from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { calculateSubtotal, calculateTotal, formatPrice } from '../utils/CartUtils'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart()

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <p className="mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          {cartItems.map(item => (
            <div key={item.id} className="card bg-base-100 shadow-xl mb-4">
              <div className="card-body">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="sm:w-24 sm:h-24">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-primary font-bold">{formatPrice(item.price)}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button 
                      className="btn btn-sm btn-ghost"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button 
                      className="btn btn-sm btn-ghost"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Subtotal */}
                  <div className="text-right min-w-[100px]">
                    <div className="font-bold">
                      {formatPrice(calculateSubtotal(item.price, item.quantity))}
                    </div>
                    <button 
                      className="btn btn-sm btn-ghost text-error mt-2"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button 
            className="btn btn-ghost text-error mt-4"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>
        
        {/* Cart Summary */}
        <div className="lg:w-1/3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Order Summary</h2>
              
              <div className="divider"></div>
              
              <div className="space-y-2">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatPrice(calculateSubtotal(item.price, item.quantity))}</span>
                  </div>
                ))}
              </div>
              
              <div className="divider"></div>
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(calculateTotal(cartItems))}</span>
              </div>
              
              <button className="btn btn-primary mt-4">
                Proceed to Checkout
              </button>
              
              <Link to="/" className="btn btn-ghost btn-sm mt-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart