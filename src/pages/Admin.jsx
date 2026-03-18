import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Trash2, Edit, Save, X, AlertCircle, Upload, Package, DollarSign } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://api-final-m259.onrender.com/api';
const IMAGE_URL = 'https://api-final-m259.onrender.com';

const Admin = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Chargement des produits...');
      
      // Endpoint pour récupérer tous les produits (public)
      const response = await axios.get(`${API_URL}/products`);
      
      console.log('✅ Réponse produits:', response.data);
      
      if (response.data?.success && response.data?.data) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement produits:', error);
      setMessage({ text: 'Erreur chargement des produits', type: 'error' });
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validation du type de fichier
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Veuillez sélectionner une image', type: 'error' });
      return;
    }
    
    // Limite de taille (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Image trop volumineuse (max 5MB)', type: 'error' });
      return;
    }
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '' });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ text: 'Le nom est requis', type: 'error' });
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setMessage({ text: 'Le prix doit être supérieur à 0', type: 'error' });
      return false;
    }
    if (!formData.description.trim()) {
      setMessage({ text: 'La description est requise', type: 'error' });
      return false;
    }
    // L'image n'est obligatoire que pour la création
    if (!editingId && !imageFile) {
      setMessage({ text: 'Une image est requise', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("price", formData.price);
      form.append("description", formData.description);

      if (imageFile) {
        form.append("image", imageFile);
      }

      let response;

      if (editingId) {
        // MODIFICATION - PUT avec query param _id
        response = await axios.put(`${API_URL}/products/update-product?_id=${editingId}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        setMessage({ text: "✅ Produit modifié avec succès !", type: "success" });
      } else {
        // CRÉATION - POST /add-product
        response = await axios.post(`${API_URL}/products/add-product`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        setMessage({ text: "✅ Produit ajouté avec succès !", type: "success" });
      }

      console.log('✅ Réponse:', response.data);

      // Recharger la liste des produits
      await fetchProducts();
      resetForm();

    } catch (error) {
      console.error('❌ Erreur:', error);
      
      // Afficher le message d'erreur du backend si disponible
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Erreur lors de l'opération";
      
      setMessage({
        text: errorMessage,
        type: "error"
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description
    });
    
    // Prévisualisation de l'image existante
    if (product.image) {
      if (product.image.startsWith('data:image')) {
        setImagePreview(product.image);
      } else {
        setImagePreview(`${IMAGE_URL}/${product.image}`);
      }
    }
    
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // SUPPRESSION - DELETE avec query param _id
      const response = await axios.delete(`${API_URL}/products/delete-product?_id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Réponse suppression:', response.data);
      setMessage({ text: '🗑️ Produit supprimé avec succès !', type: 'success' });
      
      // Recharger la liste
      await fetchProducts();

    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Erreur lors de la suppression', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/400x400/FFFFFF/fuchsia?text=No+Image';
    if (imagePath.startsWith('data:image')) return imagePath;
    if (imagePath.startsWith('http')) return imagePath;
    return `${IMAGE_URL}/${imagePath}`;
  };

  // Statistiques
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête avec bienvenue */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fuchsia-300 mb-2">Tableau de bord administrateur</h1>
          <p className="text-gray-400">
            Bienvenue, <span className="text-fuchsia-300 font-semibold">{user?.name || 'Admin'}</span>
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-fuchsia-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-fuchsia-100 rounded-lg">
                <Package className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total produits</p>
                <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-fuchsia-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-fuchsia-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Valeur totale</p>
                <p className="text-2xl font-bold text-gray-800">{totalValue.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire CRUD */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-fuchsia-200 shadow-sm">
          <h2 className="text-xl font-semibold text-fuchsia-400 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            {editingId ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
          </h2>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <Save className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Ex: Smartphone X" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-300"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                <input 
                  type="number" 
                  name="price" 
                  placeholder="50000" 
                  value={formData.price} 
                  onChange={handleChange} 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-300"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image du produit</label>
              <div className="flex items-center gap-4">
                <label className={`flex items-center gap-2 cursor-pointer bg-fuchsia-100 hover:bg-fuchsia-200 text-gray-700 px-4 py-2 rounded-lg border border-fuchsia-300 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  <Upload className="w-4 h-4" /> 
                  Choisir une image
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    disabled={loading} 
                  />
                </label>
                {imagePreview && <span className="text-sm text-gray-500">Image sélectionnée ✓</span>}
              </div>
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Aperçu :</p>
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-fuchsia-300" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                name="description" 
                rows="3" 
                placeholder="Description détaillée du produit..." 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-300"
                disabled={loading}
              ></textarea>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="submit" 
                className={`bg-fuchsia-300 hover:bg-fuchsia-400 text-gray-900 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                {loading ? 'En cours...' : (editingId ? 'Modifier' : 'Ajouter')}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors font-medium"
                  onClick={resetForm}
                  disabled={loading}
                >
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
              Produits en base ({products.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div 
                  key={p._id} 
                  className="bg-white rounded-xl overflow-hidden border border-fuchsia-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <img 
                    src={getImageUrl(p.image)} 
                    alt={p.name} 
                    className="w-full h-48 object-cover"
                    onError={(e) => e.target.src = 'https://placehold.co/400x400/FFFFFF/fuchsia?text=No+Image'} 
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">{p.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{p.description}</p>
                    <p className="text-fuchsia-400 font-bold text-lg mb-3">{p.price?.toLocaleString()} FCFA</p>
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 bg-fuchsia-50 hover:bg-fuchsia-100 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        onClick={() => handleEdit(p)}
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4" /> Modifier
                      </button>
                      <button 
                        className="flex-1 bg-red-50 hover:bg-red-100 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                        onClick={() => handleDelete(p._id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-fuchsia-200">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucun produit pour le moment</p>
            <p className="text-sm text-gray-400 mt-1">Ajoutez votre premier produit avec le formulaire ci-dessus</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;