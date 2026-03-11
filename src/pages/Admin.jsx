import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { PlusCircle, Trash2, Edit, Eye, X, Check } from 'lucide-react'

const Admin = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: ''
  })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [previewImage, setPreviewImage] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])


  const loadProducts = () => {
    const existingProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
    setProducts(existingProducts)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })


    if (name === 'image' && value) {
      setPreviewImage(value)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      description: ''
    })
    setEditingId(null)
    setPreviewImage('')
    setShowPreview(false)
  }

  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ text: 'Le nom du produit est requis', type: 'error' })
      return false
    }
    if (!formData.price || formData.price <= 0) {
      setMessage({ text: 'Le prix doit être supérieur à 0', type: 'error' })
      return false
    }
    if (!formData.image.trim()) {
      setMessage({ text: 'L\'URL de l\'image est requise', type: 'error' })
      return false
    }
    if (!formData.description.trim()) {
      setMessage({ text: 'La description est requise', type: 'error' })
      return false
    }
    return true
  }


  const handleSubmit = (e) => {
    e.preventDefault()
    
    
    if (!validateForm()) {
      return
    }

 
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      image: formData.image || 'https://via.placeholder.com/400x400/fuchsia/white?text=Produit'
    }

    
    const existingProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
    let updatedProducts

    if (editingId) {
      

      updatedProducts = existingProducts.map(p => 
        p.id === editingId ? { ...productData, id: editingId } : p
      )
      setMessage({ text: 'Produit modifié avec succès !', type: 'success' })
    } else {
     
      

      const newProduct = {
        id: Date.now(),
        ...productData
      }
      updatedProducts = [...existingProducts, newProduct]
      setMessage({ text: 'Produit ajouté avec succès !', type: 'success' })
    }
    
   
    localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
    
  
    window.dispatchEvent(new Event('storage'))
    
   
    setProducts(updatedProducts)
    
   

    resetForm()
    
   
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }


  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      description: product.description
    })
    setEditingId(product.id)
    setPreviewImage(product.image)
    setShowPreview(true)
    
   
    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' })
  }

  // Fonction pour supprimer un produit
  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const existingProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]')
      const updatedProducts = existingProducts.filter(p => p.id !== id)
      
      localStorage.setItem('adminProducts', JSON.stringify(updatedProducts))
      window.dispatchEvent(new Event('storage'))
      setProducts(updatedProducts)
      setMessage({ text: 'Produit supprimé avec succès !', type: 'success' })
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    }
  }

  // Fonction pour annuler l'édition
  const handleCancelEdit = () => {
    resetForm()
  }

  // Fonction pour tester l'URL de l'image
  const testImageUrl = () => {
    if (formData.image) {
      setShowPreview(!showPreview)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-fuchsia-500">Panneau d'Administration</h1>
      <p className="text-gray-400 mb-8">
        Bienvenue, <span className="text-fuchsia-500 font-semibold">{user?.name}</span> ! 
        Gérez les produits de la boutique.
      </p>
      


      <div id="product-form" className="card bg-base-100 shadow-xl max-w-2xl mx-auto mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4 text-fuchsia-500">
            <PlusCircle className="w-6 h-6" />
            {editingId ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
          </h2>
          
          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg mb-4`}>
              <span>{message.text}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
           


            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Nom du produit</span>
              </label>
              <input 
                type="text" 
                name="name"
                placeholder="Ex: Gaming Controller Pro" 
                className="input input-bordered w-full bg-base-200 focus:bg-base-100"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
          
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Prix (FCFA)</span>
              </label>
              <input 
                type="number" 
                name="price"
                step="0.01"
                min="0"
                placeholder="4999" 
                className="input input-bordered w-full bg-base-200 focus:bg-base-100"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            
   

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">URL de l'image</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  name="image"
                  placeholder="https://example.com/image.jpg" 
                  className="input input-bordered flex-1 bg-base-200 focus:bg-base-100"
                  value={formData.image}
                  onChange={handleChange}
                />
                <button 
                  type="button"
                  className="btn btn-square bg-fuchsia-500 hover:bg-fuchsia-600 border-none"
                  onClick={testImageUrl}
                  title="Aperçu"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              
          

              {showPreview && previewImage && (
                <div className="mt-4 p-4 bg-base-200 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">Aperçu de l'image :</p>
                  <img 
                    src={previewImage} 
                    alt="Prévisualisation"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/128x128/fuchsia/white?text=Erreur+Image'
                    }}
                  />
                </div>
              )}
            </div>
            
        

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea 
                name="description"
                className="textarea textarea-bordered h-24 bg-base-200 focus:bg-base-100"
                placeholder="Description détaillée du produit..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
            
            

            <div className="flex gap-2 pt-4">
              <button 
                type="submit" 
                className="btn btn-primary flex-1 bg-fuchsia-500 hover:bg-fuchsia-600 border-none"
              >
                {editingId ? 'Modifier le produit' : 'Ajouter le produit'}
              </button>
              
              {editingId && (
                <button 
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCancelEdit}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      

      {products.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-fuchsia-500">
            Produits ajoutés ({products.length})
          </h3>
          
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="card bg-base-100 shadow-xl">
                <div className="card-body p-4">
                  <div className="flex items-start gap-4">
                    

                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-base-200">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80/fuchsia/white?text=Image'
                        }}
                      />
                    </div>
                    
                    
                    <div className="flex-1">
                      <h4 className="font-bold">{product.name}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">{product.description}</p>
                      <p className="text-fuchsia-500 font-bold mt-1">
                        {parseFloat(product.price).toLocaleString()} FCFA
                      </p>
                    </div>
                    
                   
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-sm btn-ghost text-blue-500"
                        onClick={() => handleEdit(product)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="btn btn-sm btn-ghost text-red-500"
                        onClick={() => handleDelete(product.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

   
      {products.length === 0 && (
        <div className="text-center py-8 max-w-2xl mx-auto bg-base-200 rounded-lg">
          <p className="text-gray-400">
            Aucun produit ajouté pour le moment. Utilisez le formulaire ci-dessus pour ajouter votre premier produit.
          </p>
        </div>
      )}
    </div>
  )
}

export default Admin