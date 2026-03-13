import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { PlusCircle, Trash2, Edit, Save, X, AlertCircle, Upload } from 'lucide-react'
import axios from 'axios'

const API_URL = 'https://api-final-m259.onrender.com/api'
const IMAGE_URL = 'https://api-final-m259.onrender.com'

const Admin = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  // IDs des produits à supprimer (Laptop, Moniteur, Modem)
  const PRODUCTS_TO_DELETE = [
    "057c1278-f53a-4141-b0c1-c7f81bb3b339", // Laptop
    "78367791-6971-4ce0-90b6-4d262a5683bf", // Moniteur
    "fc249f87-1340-42f9-a121-36c9ab9094e9"  // Modem
  ]

  // Charger les produits depuis l'API
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      console.log('🔄 Chargement des produits...')
      const response = await axios.get(`${API_URL}/products`)
      
      console.log('✅ Réponse API:', response.data)
      
      if (response.data?.success && response.data?.data) {
        // Filtrer pour supprimer les produits indésirables
        const filteredProducts = response.data.data.filter(
          product => !PRODUCTS_TO_DELETE.includes(product._id)
        )
        setProducts(filteredProducts)
        console.log(`📦 ${filteredProducts.length} produits après filtrage`)
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement produits:', error)
      setMessage({ text: 'Erreur chargement des produits', type: 'error' })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      
      // Créer un aperçu de l'image
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: ''
    })
    setImageFile(null)
    setImagePreview('')
    setEditingId(null)
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
    if (!imageFile && !editingId) {
      setMessage({ text: 'Veuillez sélectionner une image', type: 'error' })
      return false
    }
    if (!formData.description.trim()) {
      setMessage({ text: 'La description est requise', type: 'error' })
      return false
    }
    return true
  }

  // Convertir l'image en Base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      // Convertir l'image en Base64
      let imageBase64 = null
      if (imageFile) {
        imageBase64 = await imageToBase64(imageFile)
      }

      // Préparer les données du produit
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description
      }

      // Ajouter l'image si elle existe
      if (imageBase64) {
        productData.image = imageBase64
      }

      console.log('📤 Envoi données:', productData)

      let response

      if (editingId) {
        // Modification
        response = await axios.put(
          `${API_URL}/products/${editingId}`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setMessage({ text: 'Produit modifié avec succès !', type: 'success' })
      } else {
        // Ajout
        response = await axios.post(
          `${API_URL}/products`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setMessage({ text: 'Produit ajouté avec succès !', type: 'success' })
      }

      console.log('✅ Réponse:', response.data)

      // Recharger la liste des produits
      await fetchProducts()
      resetForm()

    } catch (error) {
      console.error('❌ Erreur:', error)
      setMessage({ 
        text: error.response?.data?.message || 'Erreur lors de l\'opération', 
        type: 'error' 
      })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    }
  }

  const handleEdit = (product) => {
    console.log('✏️ Édition produit:', product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description
    })
    // Pour l'aperçu, on utilise l'URL complète de l'image
    if (product.image) {
      if (product.image.startsWith('data:image')) {
        setImagePreview(product.image)
      } else {
        setImagePreview(`${IMAGE_URL}/${product.image}`)
      }
    }
    setEditingId(product._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      console.log(`🗑️ Suppression produit ${id}`)
      
      const response = await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('✅ Réponse suppression:', response.data)

      await fetchProducts()
      setMessage({ text: 'Produit supprimé avec succès !', type: 'success' })

    } catch (error) {
      console.error('❌ Erreur suppression:', error)
      setMessage({ 
        text: error.response?.data?.message || 'Erreur lors de la suppression', 
        type: 'error' 
      })
    } finally {
      setLoading(false)
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    }
  }

  // Fonction pour obtenir l'URL complète de l'image
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/400x400/374151/fuchsia?text=Image+Error'
    if (imagePath.startsWith('data:image')) return imagePath
    if (imagePath.startsWith('http')) return imagePath
    return `${IMAGE_URL}/${imagePath}`
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fuchsia-300 mb-2">
            Panneau d'Administration
          </h1>
          <p className="text-gray-400">
            Bienvenue, <span className="text-fuchsia-300 font-semibold">{user?.name}</span>
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-fuchsia-300 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-fuchsia-300" />
            {editingId ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
          </h2>
          
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {message.type === 'success' ? <Save className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nom du produit
                </label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Ex: Gaming Controller Pro" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-fuchsia-300 text-white"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Prix (FCFA)
                </label>
                <input 
                  type="number" 
                  name="price"
                  step="0.01"
                  min="0"
                  placeholder="4999" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-fuchsia-300 text-white"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Image du produit
              </label>
              <div className="flex items-center gap-4">
                <label className={`cursor-pointer bg-fuchsia-300 hover:bg-fuchsia-400 text-gray-900 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="w-4 h-4" />
                  Choisir une image
                  <input 
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                </label>
                {imagePreview && (
                  <span className="text-sm text-gray-400">
                    Image sélectionnée
                  </span>
                )}
              </div>
              
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Aperçu :</p>
                  <img 
                    src={imagePreview} 
                    alt="Aperçu"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-fuchsia-300"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea 
                name="description"
                rows="3"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-fuchsia-300 text-white resize-none"
                placeholder="Description détaillée du produit..."
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              ></textarea>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button 
                type="submit" 
                className={`px-4 py-2 bg-fuchsia-300 hover:bg-fuchsia-400 text-gray-900 rounded-lg transition-colors flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                {loading ? 'En cours...' : (editingId ? 'Modifier' : 'Ajouter')}
              </button>
              
              {editingId && (
                <button 
                  type="button"
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  onClick={resetForm}
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste des produits */}
        {products.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-fuchsia-300 mb-4">
              Produits en base de données ({products.length})
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-fuchsia-300/50 transition-colors">
                  <img 
                    src={getImageUrl(product.image)} 
                    alt={product.name}
                    className="w-full h-48 object-cover bg-gray-700"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x400/374151/fuchsia?text=Image+Error'
                    }}
                  />
                  
                  <div className="p-4">
                    <h4 className="font-semibold text-white mb-1">{product.name}</h4>
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                    <p className="text-fuchsia-300 font-bold text-lg mb-3">
                      {product.price?.toLocaleString()} FCFA
                    </p>
                    
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 px-3 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1 text-sm"
                        onClick={() => handleEdit(product)}
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                      <button 
                        className="flex-1 px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1 text-sm"
                        onClick={() => handleDelete(product._id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
            <p className="text-gray-400">
              Aucun produit en base de données. Utilisez le formulaire ci-dessus pour créer votre premier produit.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin