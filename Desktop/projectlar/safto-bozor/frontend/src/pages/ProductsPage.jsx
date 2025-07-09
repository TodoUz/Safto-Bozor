import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [quantityData, setQuantityData] = useState({
    quantity: '',
    operation: 'add',
    note: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // API call will be added here
      // Mock data for UI testing
      const mockProducts = [
        { id: 1, name: 'Olma sharbati', price: 5000, quantity: 100, category: 'Mevali', description: 'Tabiiy olma sharbati' },
        { id: 2, name: 'Uzum sharbati', price: 6000, quantity: 50, category: 'Mevali', description: 'Tabiiy uzum sharbati' },
        { id: 3, name: 'Nok sharbati', price: 5500, quantity: 75, category: 'Mevali', description: 'Tabiiy nok sharbati' },
      ];
      setProducts(mockProducts);
    } catch (error) {
      setError('Mahsulotlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call will be added here
      if (modalMode === 'add') {
        const newProduct = {
          id: Date.now(),
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity)
        };
        setProducts([...products, newProduct]);
      } else {
        setProducts(products.map(product => 
          product.id === selectedProduct.id 
            ? { ...product, ...formData, price: parseFloat(formData.price), quantity: parseInt(formData.quantity) }
            : product
        ));
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      setError('Mahsulotni saqlashda xatolik');
    }
  };

  const handleQuantitySubmit = async (e) => {
    e.preventDefault();
    try {
      const quantity = parseInt(quantityData.quantity);
      const currentQuantity = selectedProduct.quantity;
      
      let newQuantity;
      if (quantityData.operation === 'add') {
        newQuantity = currentQuantity + quantity;
      } else if (quantityData.operation === 'subtract') {
        newQuantity = Math.max(0, currentQuantity - quantity);
      } else {
        newQuantity = quantity;
      }

      setProducts(products.map(product =>
        product.id === selectedProduct.id
          ? { ...product, quantity: newQuantity }
          : product
      ));
      
      setShowQuantityModal(false);
      setQuantityData({ quantity: '', operation: 'add', note: '' });
    } catch (error) {
      setError('Miqdorni yangilashda xatolik');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Mahsulotni o\'chirish tasdiqlaysizmi?')) {
      try {
        // API call will be added here
        setProducts(products.filter(product => product.id !== productId));
      } catch (error) {
        setError('Mahsulotni o\'chirishda xatolik');
      }
    }
  };

  const openModal = (mode, product = null) => {
    setModalMode(mode);
    setSelectedProduct(product);
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        category: product.category,
        description: product.description
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const openQuantityModal = (product) => {
    setSelectedProduct(product);
    setShowQuantityModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      quantity: '',
      category: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityInputChange = (e) => {
    const { name, value } = e.target;
    setQuantityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Mahsulotlar</h1>
            </div>
            <button
              onClick={() => openModal('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yangi mahsulot</span>
            </button>
          </div>
        </div>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mahsulot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Narxi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miqdori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategoriya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harakatlar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price.toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${product.quantity < 20 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.quantity}
                        </span>
                        <button
                          onClick={() => openQuantityModal(product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('edit', product)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Mahsulotlar yo'q</h3>
              <p className="text-gray-600">Birinchi mahsulotni qo'shing</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'add' ? 'Yangi mahsulot qo\'shish' : 'Mahsulotni tahrirlash'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mahsulot nomi *
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Narxi (so'm) *
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.price}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miqdori *
            </label>
            <input
              type="number"
              name="quantity"
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.quantity}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategoriya *
            </label>
            <select
              name="category"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Kategoriyani tanlang</option>
              <option value="Mevali">Mevali</option>
              <option value="Sabzavotli">Sabzavotli</option>
              <option value="Aralash">Aralash</option>
              <option value="Gazli">Gazli</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tavsif
            </label>
            <textarea
              name="description"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Quantity Modal */}
      <Modal
        isOpen={showQuantityModal}
        onClose={() => setShowQuantityModal(false)}
        title={`${selectedProduct?.name} miqdorini o'zgartirish`}
      >
        <form onSubmit={handleQuantitySubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">
              Joriy miqdor: <span className="font-medium">{selectedProduct?.quantity}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operatsiya turi
            </label>
            <select
              name="operation"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={quantityData.operation}
              onChange={handleQuantityInputChange}
            >
              <option value="add">Qo'shish</option>
              <option value="subtract">Ayirish</option>
              <option value="set">O'rnatish</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miqdor *
            </label>
            <input
              type="number"
              name="quantity"
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={quantityData.quantity}
              onChange={handleQuantityInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Izoh
            </label>
            <textarea
              name="note"
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={quantityData.note}
              onChange={handleQuantityInputChange}
              placeholder="Miqdor o'zgarishiga izoh..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowQuantityModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;