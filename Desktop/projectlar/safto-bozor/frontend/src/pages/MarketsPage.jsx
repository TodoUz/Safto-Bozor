import React, { useState, useEffect } from 'react';
import { Building, Plus, Edit, Trash2, MapPin } from 'lucide-react';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const MarketsPage = () => {
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    managerName: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setIsLoading(true);
      // API call will be added here
      // Mock data for UI testing
      const mockMarkets = [
        {
          id: 1,
          name: 'Chorsu bozori',
          address: 'Tashkent, Eski shahar',
          phone: '+998712345678',
          managerName: 'Alisher Karimov',
          description: 'Tashkentning eng katta bozori',
          status: 'active',
          createdAt: '2024-01-01'
        },
        {
          id: 2,
          name: 'Mirobod bozori',
          address: 'Tashkent, Mirobod tumani',
          phone: '+998712345679',
          managerName: 'Nodira Ahmadova',
          description: 'Zamonaviy savdo markazi',
          status: 'active',
          createdAt: '2024-01-02'
        },
        {
          id: 3,
          name: 'Sergeli bozori',
          address: 'Tashkent, Sergeli tumani',
          phone: '+998712345680',
          managerName: 'Jasur Rahmonov',
          description: 'Yangi qurilgan bozor',
          status: 'inactive',
          createdAt: '2024-01-03'
        }
      ];
      setMarkets(mockMarkets);
    } catch (error) {
      setError('Bozorlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call will be added here
      if (modalMode === 'add') {
        const newMarket = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setMarkets([...markets, newMarket]);
      } else {
        setMarkets(markets.map(market => 
          market.id === selectedMarket.id 
            ? { ...market, ...formData }
            : market
        ));
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      setError('Bozorni saqlashda xatolik');
    }
  };

  const handleDelete = async (marketId) => {
    if (window.confirm('Bozorni o\'chirish tasdiqlaysizmi?')) {
      try {
        // API call will be added here
        setMarkets(markets.filter(market => market.id !== marketId));
      } catch (error) {
        setError('Bozorni o\'chirishda xatolik');
      }
    }
  };

  const openModal = (mode, market = null) => {
    setModalMode(mode);
    setSelectedMarket(market);
    if (market) {
      setFormData({
        name: market.name,
        address: market.address,
        phone: market.phone,
        managerName: market.managerName,
        description: market.description,
        status: market.status
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      managerName: '',
      description: '',
      status: 'active'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Faol';
      case 'inactive':
        return 'Nofaol';
      default:
        return status;
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
              <Building className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Bozorlar</h1>
            </div>
            <button
              onClick={() => openModal('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yangi bozor</span>
            </button>
          </div>
        </div>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <div key={market.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{market.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(market.status)}`}>
                    {getStatusText(market.status)}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{market.address}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Telefon:</span> {market.phone}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Menejer:</span> {market.managerName}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{market.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Yaratilgan: {new Date(market.createdAt).toLocaleDateString('uz-UZ')}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal('edit', market)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(market.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {markets.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bozorlar yo'q</h3>
              <p className="text-gray-600">Birinchi bozorni qo'shing</p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Market Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'add' ? 'Yangi bozor qo\'shish' : 'Bozorni tahrirlash'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bozor nomi *
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
              Manzil *
            </label>
            <input
              type="text"
              name="address"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon raqami *
            </label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+998712345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Menejer ismi *
            </label>
            <input
              type="text"
              name="managerName"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.managerName}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
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
              placeholder="Bozor haqida qo'shimcha ma'lumot..."
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
    </div>
  );
};

export default MarketsPage;