import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const DebtorsPage = () => {
  const [debtors, setDebtors] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [selectedMarket, setSelectedMarket] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    marketId: '',
    totalDebt: '',
    status: 'active',
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
      const mockDebtors = [
        {
          id: 1,
          name: 'Alisher Karimov',
          phone: '+998901234567',
          address: 'Tashkent, Yunusobod',
          market: { id: 1, name: 'Chorsu bozori' },
          totalDebt: 150000,
          status: 'active',
          note: 'Yaxshi mijoz'
        },
        {
          id: 2,
          name: 'Nodira Ahmadova',
          phone: '+998907654321',
          address: 'Tashkent, Mirobod',
          market: { id: 2, name: 'Mirobod bozori' },
          totalDebt: 75000,
          status: 'paid',
          note: 'To\'liq to\'langan'
        },
        {
          id: 3,
          name: 'Jasur Rahmonov',
          phone: '+998909876543',
          address: 'Tashkent, Sergeli',
          market: { id: 1, name: 'Chorsu bozori' },
          totalDebt: 200000,
          status: 'overdue',
          note: 'Muddati o\'tgan'
        }
      ];

      const mockMarkets = [
        { id: 1, name: 'Chorsu bozori' },
        { id: 2, name: 'Mirobod bozori' }
      ];

      setDebtors(mockDebtors);
      setMarkets(mockMarkets);
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
      const selectedMarketObj = markets.find(m => m.id === parseInt(formData.marketId));

      if (modalMode === 'add') {
        const newDebtor = {
          id: Date.now(),
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          market: selectedMarketObj,
          totalDebt: parseFloat(formData.totalDebt),
          status: formData.status,
          note: formData.note
        };
        setDebtors([...debtors, newDebtor]);
      } else {
        setDebtors(debtors.map(debtor => 
          debtor.id === selectedDebtor.id 
            ? {
                ...debtor,
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                market: selectedMarketObj,
                totalDebt: parseFloat(formData.totalDebt),
                status: formData.status,
                note: formData.note
              }
            : debtor
        ));
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      setError('Qarzdorni saqlashda xatolik');
    }
  };

  const handleDelete = async (debtorId) => {
    if (window.confirm('Qarzdorni o\'chirish tasdiqlaysizmi?')) {
      try {
        // API call will be added here
        setDebtors(debtors.filter(debtor => debtor.id !== debtorId));
      } catch (error) {
        setError('Qarzdorni o\'chirishda xatolik');
      }
    }
  };

  const openModal = (mode, debtor = null) => {
    setModalMode(mode);
    setSelectedDebtor(debtor);
    if (debtor) {
      setFormData({
        name: debtor.name,
        phone: debtor.phone,
        address: debtor.address,
        marketId: debtor.market.id.toString(),
        totalDebt: debtor.totalDebt.toString(),
        status: debtor.status,
        note: debtor.note
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      marketId: '',
      totalDebt: '',
      status: 'active',
      note: ''
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
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Faol';
      case 'paid':
        return 'To\'langan';
      case 'overdue':
        return 'Muddati o\'tgan';
      default:
        return status;
    }
  };

  const filteredDebtors = selectedMarket 
    ? debtors.filter(debtor => debtor.market.id === parseInt(selectedMarket))
    : debtors;

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Qarzdorlar</h1>
            </div>
            <button
              onClick={() => openModal('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yangi qarzdor</span>
            </button>
          </div>

          {/* Market Filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Bozor bo'yicha filtr:
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Barcha bozorlar</option>
                {markets.map(market => (
                  <option key={market.id} value={market.id}>
                    {market.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <ErrorMessage message={error} onClose={() => setError('')} />

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qarzdor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bozor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qarz miqdori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harakatlar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDebtors.map((debtor) => (
                  <tr key={debtor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{debtor.name}</div>
                        <div className="text-sm text-gray-500">{debtor.phone}</div>
                        <div className="text-sm text-gray-500">{debtor.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {debtor.market.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${debtor.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>
                          {debtor.totalDebt.toLocaleString()} so'm
                        </span>
                        {debtor.status === 'overdue' && (
                          <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(debtor.status)}`}>
                        {getStatusText(debtor.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal('edit', debtor)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(debtor.id)}
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

          {filteredDebtors.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedMarket ? 'Bu bozorda qarzdorlar yo\'q' : 'Qarzdorlar yo\'q'}
              </h3>
              <p className="text-gray-600">Birinchi qarzdorni qo'shing</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Debtor Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'add' ? 'Yangi qarzdor qo\'shish' : 'Qarzdorni tahrirlash'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qarzdor ismi *
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
              Telefon raqami *
            </label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+998901234567"
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
              Qarz miqdori (so'm) *
            </label>
            <input
              type="number"
              name="totalDebt"
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.totalDebt}
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
              <option value="paid">To'langan</option>
              <option value="overdue">Muddati o'tgan</option>
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
              placeholder="Qarzdor haqida izoh..."
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

export default DebtorsPage;