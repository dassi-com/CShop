import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { PlusCircle, Trash2, Edit, Save, X, AlertCircle, Upload, Package, DollarSign, ShoppingBag } from 'lucide-react'
import productService, { getImageUrl } from '../services/productService'
import orderService from '../services/cartService'

const Admin = () => {
  const { user } = useAuth()

  // ── État produits ──────────────────────────────
  const [formData, setFormData] = useState({ name: '', price: '', description: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [products, setProducts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productMessage, setProductMessage] = useState({ text: '', type: '' })

  // ── État commandes ─────────────────────────────
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  // ── Produits ───────────────────────────────────
  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await productService.getAllProducts()
      if (response?.success && Array.isArray(response?.data)) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error)
      setProductMessage({ text: 'Impossible de charger les produits', type: 'error' })
    } finally {
      setLoadingProducts(false)
    }
  }

  // ── Commandes ──────────────────────────────────
  const fetchOrders = async () => {
    setLoadingOrders(true)
    setOrdersError('')
    try {
      const response = await orderService.getOrders()
      // L'API retourne { orders, total, ... } ou directement un tableau
      const list = Array.isArray(response) ? response : response?.orders || []
      setOrders(list)
    } catch (error) {
      console.error('Erreur chargement commandes:', error)
      setOrdersError('Impossible de charger les commandes')
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setProductMessage({ text: 'Veuillez sélectionner une image', type: 'error' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setProductMessage({ text: 'Image trop volumineuse (max 5 Mo)', type: 'error' })
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '' })
    setImageFile(null)
    setImagePreview('')
    setEditingId(null)
  }

  const validateForm = () => {
    if (!formData.name.trim()) { setProductMessage({ text: 'Le nom est requis', type: 'error' }); return false }
    if (!formData.price || Number(formData.price) <= 0) { setProductMessage({ text: 'Le prix doit être > 0', type: 'error' }); return false }
    if (!formData.description.trim()) { setProductMessage({ text: 'La description est requise', type: 'error' }); return false }
    if (!editingId && !imageFile) { setProductMessage({ text: 'Une image est requise', type: 'error' }); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoadingProducts(true)
    try {
      const form = new FormData()
      form.append('name', formData.name)
      form.append('price', formData.price)
      form.append('description', formData.description)
      if (imageFile) form.append('image', imageFile)

      if (editingId) {
        await productService.updateProduct(editingId, form)
        setProductMessage({ text: '✅ Produit modifié avec succès !', type: 'success' })
      } else {
        await productService.createProduct(form)
        setProductMessage({ text: '✅ Produit ajouté avec succès !', type: 'success' })
      }

      await fetchProducts()
      resetForm()
    } catch (error) {
      const msg = error?.data?.message || error?.message || "Erreur lors de l'opération"
      setProductMessage({ text: msg, type: 'error' })
    } finally {
      setLoadingProducts(false)
      setTimeout(() => setProductMessage({ text: '', type: '' }), 5000)
    }
  }

  const handleEdit = (product) => {
    setFormData({ name: product.name, price: product.price.toString(), description: product.description })
    setImagePreview(getImageUrl(product.image))
    setEditingId(product._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return
    setLoadingProducts(true)
    try {
      await productService.deleteProduct(id)
      setProductMessage({ text: '🗑️ Produit supprimé !', type: 'success' })
      await fetchProducts()
    } catch (error) {
      const msg = error?.data?.message || error?.message || 'Erreur lors de la suppression'
      setProductMessage({ text: msg, type: 'error' })
    } finally {
      setLoadingProducts(false)
      setTimeout(() => setProductMessage({ text: '', type: '' }), 3000)
    }
  }

  const statusColors = {
    pending: 'badge-warning',
    paid: 'badge-success',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-error',
  }

  const totalValue = products.reduce((sum, p) => sum + (p.price || 0), 0)

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fuchsia-300 mb-1">Tableau de bord</h1>
          <p className="text-gray-400">Bienvenue, <span className="text-fuchsia-300 font-semibold">{user?.name || 'Admin'}</span></p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Package className="w-6 h-6 text-fuchsia-400" />, label: 'Produits', value: products.length },
            { icon: <DollarSign className="w-6 h-6 text-fuchsia-400" />, label: 'Valeur catalogue', value: `${totalValue.toLocaleString('fr-FR')} FCFA` },
            { icon: <ShoppingBag className="w-6 h-6 text-fuchsia-400" />, label: 'Commandes', value: orders.length },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-fuchsia-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-fuchsia-50 rounded-lg">{s.icon}</div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6 bg-gray-800">
          <button
            className={`tab ${activeTab === 'products' ? 'tab-active bg-fuchsia-500 text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('products')}>
            Produits
          </button>
          <button
            className={`tab ${activeTab === 'orders' ? 'tab-active bg-fuchsia-500 text-white' : 'text-gray-300'}`}
            onClick={() => setActiveTab('orders')}>
            Commandes {orders.length > 0 && <span className="ml-2 badge badge-sm">{orders.length}</span>}
          </button>
        </div>

        {/* ── TAB PRODUITS ── */}
        {activeTab === 'products' && (
          <div>
            {/* Formulaire */}
            <div className="bg-white rounded-xl p-6 mb-8 border border-fuchsia-100 shadow-sm">
              <h2 className="text-xl font-semibold text-fuchsia-400 mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                {editingId ? 'Modifier le produit' : 'Ajouter un produit'}
              </h2>

              {productMessage.text && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${productMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {productMessage.type === 'success' ? <Save className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {productMessage.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                    <input type="text" name="name" placeholder="Ex: Smartphone X" value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-400"
                      disabled={loadingProducts} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                    <input type="number" name="price" placeholder="50000" value={formData.price}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-400"
                      disabled={loadingProducts} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="flex items-center gap-4">
                    <label className={`flex items-center gap-2 cursor-pointer bg-fuchsia-50 hover:bg-fuchsia-100 text-gray-700 px-4 py-2 rounded-lg border border-fuchsia-300 transition-colors ${loadingProducts ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Upload className="w-4 h-4" />
                      Choisir une image
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={loadingProducts} />
                    </label>
                    {imagePreview && <span className="text-sm text-gray-500">Image sélectionnée ✓</span>}
                  </div>
                  {imagePreview && (
                    <img src={imagePreview} alt="Aperçu" className="mt-3 w-28 h-28 object-cover rounded-lg border-2 border-fuchsia-300"
                      onError={(e) => e.target.src = 'https://placehold.co/200x200/1a1a2e/c084fc?text=No+Image'} />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" rows="3" placeholder="Description détaillée..." value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-400"
                    disabled={loadingProducts}></textarea>
                </div>

                <div className="flex gap-2">
                  <button type="submit"
                    className={`bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium ${loadingProducts ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={loadingProducts}>
                    <Save className="w-4 h-4" />
                    {loadingProducts ? 'En cours...' : editingId ? 'Modifier' : 'Ajouter'}
                  </button>
                  {editingId && (
                    <button type="button"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors font-medium"
                      onClick={resetForm} disabled={loadingProducts}>
                      <X className="w-4 h-4 inline mr-1" />Annuler
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Liste produits */}
            {products.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-fuchsia-300 mb-4">Produits en base ({products.length})</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(p => (
                    <div key={p._id} className="bg-white rounded-xl overflow-hidden border border-fuchsia-100 shadow-sm hover:shadow-md transition-shadow">
                      <img src={getImageUrl(p.image)} alt={p.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => e.target.src = 'https://placehold.co/400x400/1a1a2e/c084fc?text=No+Image'} />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">{p.name}</h3>
                        <p className="text-gray-500 text-sm mb-2 line-clamp-2">{p.description}</p>
                        <p className="text-fuchsia-500 font-bold text-lg mb-3">{p.price?.toLocaleString('fr-FR')} FCFA</p>
                        <div className="flex gap-2">
                          <button className="flex-1 bg-fuchsia-50 hover:bg-fuchsia-100 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                            onClick={() => handleEdit(p)} disabled={loadingProducts}>
                            <Edit className="w-4 h-4" /> Modifier
                          </button>
                          <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                            onClick={() => handleDelete(p._id)} disabled={loadingProducts}>
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border border-fuchsia-100">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun produit pour le moment</p>
                <p className="text-sm text-gray-400 mt-1">Ajoutez votre premier produit ci-dessus</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB COMMANDES ── */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-fuchsia-300">Toutes les commandes</h3>
              <button onClick={fetchOrders} className="btn btn-sm btn-ghost text-fuchsia-300 hover:bg-fuchsia-300/10">⟳ Rafraîchir</button>
            </div>

            {loadingOrders && (
              <div className="flex justify-center py-10">
                <div className="loading loading-spinner loading-lg text-fuchsia-400"></div>
              </div>
            )}

            {ordersError && (
              <div className="alert alert-error mb-4"><AlertCircle className="w-5 h-5" />{ordersError}</div>
            )}

            {!loadingOrders && !ordersError && orders.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center border border-fuchsia-100">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucune commande pour le moment</p>
              </div>
            )}

            {!loadingOrders && orders.length > 0 && (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order._id} className="bg-white rounded-xl border border-fuchsia-100 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                      <div>
                        <p className="text-xs text-gray-400 font-mono">#{order._id?.slice(-8).toUpperCase()}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Client : <span className="font-medium text-gray-800">{order.userId?.name || 'Inconnu'}</span>
                          {order.userId?.email && <span className="text-gray-400 ml-1">({order.userId.email})</span>}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString('fr-FR')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${statusColors[order.status] || 'badge-ghost'}`}>{order.status}</span>
                        <span className="font-bold text-fuchsia-500">{order.totalAmount?.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Articles :</p>
                      <div className="space-y-1">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.productId?.name || 'Produit supprimé'} × {item.quantity}</span>
                            <span className="text-gray-500">{item.price?.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
