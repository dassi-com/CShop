import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Trash2, Edit, Save, X, AlertCircle, Upload } from 'lucide-react';
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
      const response = await axios.get(`${API_URL}/products`);
      if (response.data?.success && response.data?.data) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur chargement produits', type: 'error' });
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
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
    if (!formData.name.trim()) return setMessage({ text: 'Nom requis', type: 'error' }), false;
    if (!formData.price || formData.price <= 0) return setMessage({ text: 'Prix > 0', type: 'error' }), false;
    if (!imageFile && !editingId) return setMessage({ text: 'Image requise', type: 'error' }), false;
    if (!formData.description.trim()) return setMessage({ text: 'Description requise', type: 'error' }), false;
    return true;
  };

  const imageToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      let imageBase64 = null;
      if (imageFile) imageBase64 = await imageToBase64(imageFile);

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        ...(imageBase64 && { image: imageBase64 })
      };

      if (editingId) {
        await axios.put(`${API_URL}/products/${editingId}`, productData, { headers: { Authorization: `Bearer ${token}` } });
        setMessage({ text: 'Produit modifié !', type: 'success' });
      } else {
        await axios.post(`${API_URL}/products`, productData, { headers: { Authorization: `Bearer ${token}` } });
        setMessage({ text: 'Produit ajouté !', type: 'success' });
      }

      fetchProducts();
      resetForm();
    } catch (error) {
      console.error(error);
      setMessage({ text: error.response?.data?.message || 'Erreur opération', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleEdit = (product) => {
    setFormData({ name: product.name, price: product.price.toString(), description: product.description });
    setImagePreview(product.image?.startsWith('data:image') ? product.image : `${IMAGE_URL}/${product.image}`);
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMessage({ text: 'Produit supprimé !', type: 'success' });
      fetchProducts();
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erreur suppression', type: 'error' });
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

  return (
    <div className="min-h-screen bg-gray-900 py-8 text-black">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold text-fuchsia-300 mb-6">Admin Dashboard</h1>

        {/* Formulaire CRUD */}
        <div className="bg-white p-6 rounded-xl mb-8 border border-fuchsia-300 text-black">
          <h2 className="text-xl font-semibold text-fuchsia-300 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            {editingId ? 'Modifier le produit' : 'Ajouter un produit'}
          </h2>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.type === 'success' ? <Save className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Nom" value={formData.name} onChange={handleChange} className="p-2 rounded-lg w-full" disabled={loading} />
              <input type="number" name="price" placeholder="Prix" value={formData.price} onChange={handleChange} className="p-2 rounded-lg w-full" disabled={loading} />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-fuchsia-300 text-black px-4 py-2 rounded-lg">
                <Upload className="w-4 h-4" /> Choisir une image
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={loading} />
              </label>
              {imagePreview && <span>Aperçu sélectionné</span>}
            </div>
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2 border-fuchsia-300" />}

            <textarea name="description" rows="3" placeholder="Description" value={formData.description} onChange={handleChange} className="w-full p-2 rounded-lg" disabled={loading}></textarea>

            <div className="flex gap-2">
              <button type="submit" className="bg-fuchsia-300 text-black px-4 py-2 rounded-lg flex items-center gap-2">{editingId ? 'Modifier' : 'Ajouter'}</button>
              {editingId && <button type="button" className="bg-white px-4 py-2 rounded-lg" onClick={resetForm}>Annuler</button>}
            </div>
          </form>
        </div>

        {/* Liste des produits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p._id} className="bg-white text-black rounded-xl overflow-hidden border border-fuchsia-300 hover:shadow-lg transition-shadow">
              <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-48 object-cover" onError={(e)=>e.target.src='https://placehold.co/400x400/FFFFFF/fuchsia?text=No+Image'} />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                <p className="text-gray-700 mb-2 line-clamp-2">{p.description}</p>
                <p className="text-fuchsia-300 font-bold mb-2">{p.price?.toLocaleString()} FCFA</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-fuchsia-100 text-black px-2 py-1 rounded-lg flex items-center justify-center gap-1" onClick={()=>handleEdit(p)}> <Edit className="w-4 h-4"/> Edit </button>
                  <button className="flex-1 bg-red-100 text-black px-2 py-1 rounded-lg flex items-center justify-center gap-1" onClick={()=>handleDelete(p._id)}> <Trash2 className="w-4 h-4"/> Delete </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Admin;