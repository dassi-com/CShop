import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PlusCircle } from 'lucide-react'

const Admin = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: ''
  })
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name || !formData.price || !formData.image || !formData.description) {
      setMessage('Please fill in all fields')
      return
    }

    // Create new product
    const newProduct = {
      id: Date.now(), // Simple ID generation
      ...formData,
      price: parseFloat(formData.price)
    }

    // Get existing products from localStorage
    const existingProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
    
    // Add new product
    const updatedProducts = [...existingProducts, newProduct]
    
    // Save to localStorage
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
    
    // Show success message
    setMessage('Product added successfully!')
    
    // Reset form
    setFormData({
      name: '',
      price: '',
      image: '',
      description: ''
    })
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
      <p className="text-gray-500 mb-8">Welcome, {user?.name}! Add new products to the store.</p>
      
      <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            <PlusCircle className="w-6 h-6" />
            Add New Product
          </h2>
          
          {message && (
            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'} mb-4`}>
              <span>{message}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Product Name</span>
              </label>
              <input 
                type="text" 
                name="name"
                placeholder="Enter product name" 
                className="input input-bordered"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Price ($)</span>
              </label>
              <input 
                type="number" 
                name="price"
                step="0.01"
                min="0"
                placeholder="0.00" 
                className="input input-bordered"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Image URL</span>
              </label>
              <input 
                type="url" 
                name="image"
                placeholder="https://example.com/image.jpg" 
                className="input input-bordered"
                value={formData.image}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea 
                name="description"
                className="textarea textarea-bordered h-24"
                placeholder="Product description..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary w-full">
              Add Product
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Admin