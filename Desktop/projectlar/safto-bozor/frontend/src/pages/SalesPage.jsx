import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Trash2, Eye } from 'lucide-react';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [debtors, setDebtors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  const [formData, setFormData] = useState({
    productId: '',
    marketId: '',
    debtorId: '',
    quantity: '',
    unitPrice: '',
    totalPrice: '',
    saleType: 'cash',
    note: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // API calls will be added here
      // Mock data for UI testing
      const mockSales = [
        {
          id: 1,
          product: { id: 1, name: 'Olma sharbati' },
          market: { id: 1, name: 'Chorsu bozori' },
          debtor: { id: 1, name: 'Alisher Karimov' },
          quantity: 10,
          unitPrice: 5000,
          totalPrice: 50000,
          saleType: 'cash',
          saleDate: '2024-01-15',
          note: 'Naqd sotildi'
        },
        {
          id: 2,
          product: { id: 2, name: 'Uzum sharbati' },
          market: { id: 2, name: 'Mirobod bozori' },
          debtor: { id: 2, name: 'Nodira Ahmadova' },
          quantity: 5,
          unitPrice: 6000,
          totalPrice: 30000,
          saleType: 'credit',
          saleDate: '2024-01-16',
          note: 'Nasiyaga berildi'
        }
      ];

      const mockProducts = [
        { id: 1, name: 'Olma sharbati', price: 5000 },
        { id: 2, name: 'Uzum sharbati', price: 6000 },
        { id: 3, name: 'Nok sharbati', price: 5500 }
      ];

      const mockMarkets = [
        { id: 1, name: 'Chorsu bozori' },
        { id: 2, name: 'Mirobod bozori' }
      ];

      const mockDebtors = [
        { id: 1, name: 'Alisher Karimov' },
        { id: 2, name: 'Nodira Ahmadova' }
      ];

      setSales(mockSales);
      setProducts(mockProducts);
      setMarkets(mockMarkets);
      setDebtors(mockDebtors);
    } catch (error) {
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call will be added here
      const selectedProduct = products.find(p => p.id === parseInt(formData.productId));
      const selectedMarket = markets.find(m => m.id === parseInt(formData.marketId));
      const selectedDebtor = debtors.find(d => d.id === parseInt(formData.debtorId));

      if (modalMode === 'add') {
        const newSale = {
          id: Date.now(),
          product: selectedProduct,
          market: selectedMarket,
          debtor: selectedDebtor,
          quantity: parseInt(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          totalPrice: parseFloat(formData.totalPrice),
          saleType: formData.saleType,
          saleDate: new Date().toISOString().split('T')[0],
          note: formData.note
        };
        setSales([...sales, newSale]);
      } else {
        setSales(sales.map(sale => 
          sale.id === selectedSale.id 
            ? {
                ...sale,
                product: selectedProduct,
                market: selectedMarket,
                debtor: selectedDebtor,
                quantity: parseInt(formData.quantity),
                unitPrice: parseFloat(formData.unitPrice),
                totalPrice: parseFloat(formData.totalPrice),
                saleType: formData.saleType,
                note: formData.note
              }
            : sale
        ));
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      setError('Sotuvni saqlashda xatolik');
    }
  };

  const handleDelete = async (saleId) => {
    if (window.confirm('Sotuvni o\'chirish tasdiqlaysizmi?')) {
      try {
        // API call will be added here
        setSales(sales.filter(sale => sale.id !== saleId));
      } catch (error) {
        setError('Sotuvni o\'chirishda xatolik');
      }
    }
  };

  const openModal = (mode, sale = null) => {
    setModalMode(mode);
    setSelectedSale(sale);
    if (sale) {
      setFormData({
        productId: sale.product.id.toString(),
        marketId: sale.market.id.toString(),
        debtorId: sale.debtor.id.toString(),
        quantity: sale.quantity.toString(),
        unitPrice: sale.unitPrice.toString(),
        totalPrice: sale.totalPrice.toString(),
        saleType: sale.saleType,
        note: sale.note
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      marketId: '',
      debtorId: '',
      quantity: '',
      unitPrice: '',
      totalPrice: '',
      saleType: 'cash',
      note: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      
      // Calculate total price when quantity or unit price changes
      if (name === 'quantity' || name === 'unitPrice') {
        const quantity = name === 'quantity' ? parseFloat(value) : parseFloat(prev.quantity);
        const unitPrice = name === 'unitPrice' ? parseFloat(value) : parseFloat(prev.unitPrice);
        
        if (!isNaN(quantity) && !isNaN(unitPrice)) {
          newFormData.totalPrice = (quantity * unitPrice).toString();
        }
      }

      // Auto-fill unit price when product is selected
      if (name === 'productId' && value) {
        const selectedProduct = products.find(p => p.id === parseInt(value));
        if (selectedProduct) {
          newFormData.unitPrice = selectedProduct.price.toString();
          if (prev.quantity) {
            newFormData.totalPrice = (parseFloat(prev.quantity) * selectedProduct.price).toString();
          }
        }
      }

      return newFormData;
    });
  };

  const getSaleTypeColor = (type) => {
    switch (type) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'credit':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSaleTypeText = (type) => {
    switch (type) {
      case 'cash':
        return 'Naqd';
      case 'credit':
        return 'Nasiya';
      default:
        return type;
    }
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
              <DollarSign className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Sotuvlar</h1>
            </div>
            <button
              onClick={() => openModal('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yangi sotuv</span>
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
                    Sana
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mahsulot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bozor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qarzdor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miqdor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Narx
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harakatlar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sale.saleDate).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.market.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.debtor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.totalPrice.toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSaleTypeColor(sale.saleType)}`}>
                        {getSaleTypeText(sale.saleType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('edit', sale)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
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

          {sales.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sotuvlar yo'q</h3>
              <p className="text-gray-600">Birinchi sotuvni qo'shing</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Sale Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'add' ? 'Yangi sotuv qo\'shish' : 'Sotuvni tahrirlash'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mahsulot *
              </label>
              <select
                name="productId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.productId}
                onChange={handleInputChange}
              >
                <option value="">Mahsulotni tanlang</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.price.toLocaleString()} so'm
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bozor *
              </label>
              <select
                name="marketId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.marketId}
                onChange={handleInputChange}
              >
                <option value="">Bozorni tanlang</option>
                {markets.map(market => (
                  <option key={market.id} value={market.id}>
                    {market.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qarzdor *
              </label>
              <select
                name="debtorId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.debtorId}
                onChange={handleInputChange}
              >
                <option value="">Qarzdorni tanlang</option>
                {debtors.map(debtor => (
                  <option key={debtor.id} value={debtor.id}>
                    {debtor.name}
                  </option>
                ))}
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
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birlik narxi (so'm) *
              </label>
              <input
                type="number"
                name="unitPrice"
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.unitPrice}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Umumiy narx (so'm)
              </label>
              <input
                type="number"
                name="totalPrice"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                value={formData.totalPrice}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sotuv turi *
              </label>
              <select
                name="saleType"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.saleType}
                onChange={handleInputChange}
              >
                <option value="cash">Naqd</option>
                <option value="credit">Nasiya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Izoh
              </label>
              <textarea
                name="note"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Sotuv haqida izoh..."
              />
            </div>
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
    </div>
  );
};

export default SalesPage;