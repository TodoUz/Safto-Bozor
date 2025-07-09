import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Edit, Trash2, Settings } from 'lucide-react';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseSources, setExpenseSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  const [expenseFormData, setExpenseFormData] = useState({
    sourceId: '',
    amount: '',
    date: '',
    description: '',
    note: ''
  });

  const [sourceFormData, setSourceFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // API calls will be added here
      // Mock data for UI testing
      const mockExpenses = [
        {
          id: 1,
          source: { id: 1, name: 'Transport' },
          amount: 50000,
          date: '2024-01-15',
          description: 'Benzin va yo\'l harajatlari',
          note: 'Haftalik transport'
        },
        {
          id: 2,
          source: { id: 2, name: 'Kommunal' },
          amount: 150000,
          date: '2024-01-16',
          description: 'Elektr energiya to\'lovi',
          note: 'Yanvar oyining to\'lovi'
        },
        {
          id: 3,
          source: { id: 3, name: 'Ofis' },
          amount: 75000,
          date: '2024-01-17',
          description: 'Ofis buyumlari',
          note: 'Qog\'oz va boshqa'
        }
      ];

      const mockSources = [
        { id: 1, name: 'Transport', description: 'Yoqilg\'i va transport xarajatlari' },
        { id: 2, name: 'Kommunal', description: 'Elektr, suv, gaz to\'lovlari' },
        { id: 3, name: 'Ofis', description: 'Ofis buyumlari va jihozlari' },
        { id: 4, name: 'Marketing', description: 'Reklama va marketing xarajatlari' }
      ];

      setExpenses(mockExpenses);
      setExpenseSources(mockSources);
    } catch (error) {
      setError('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedSourceObj = expenseSources.find(s => s.id === parseInt(expenseFormData.sourceId));

      if (modalMode === 'add') {
        const newExpense = {
          id: Date.now(),
          source: selectedSourceObj,
          amount: parseFloat(expenseFormData.amount),
          date: expenseFormData.date,
          description: expenseFormData.description,
          note: expenseFormData.note
        };
        setExpenses([...expenses, newExpense]);
      } else {
        setExpenses(expenses.map(expense => 
          expense.id === selectedExpense.id 
            ? {
                ...expense,
                source: selectedSourceObj,
                amount: parseFloat(expenseFormData.amount),
                date: expenseFormData.date,
                description: expenseFormData.description,
                note: expenseFormData.note
              }
            : expense
        ));
      }
      setShowExpenseModal(false);
      resetExpenseForm();
    } catch (error) {
      setError('Xarajatni saqlashda xatolik');
    }
  };

  const handleSourceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        const newSource = {
          id: Date.now(),
          name: sourceFormData.name,
          description: sourceFormData.description
        };
        setExpenseSources([...expenseSources, newSource]);
      } else {
        setExpenseSources(expenseSources.map(source => 
          source.id === selectedSource.id 
            ? { ...source, name: sourceFormData.name, description: sourceFormData.description }
            : source
        ));
      }
      setShowSourceModal(false);
      resetSourceForm();
    } catch (error) {
      setError('Manba saqlashda xatolik');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Xarajatni o\'chirish tasdiqlaysizmi?')) {
      try {
        setExpenses(expenses.filter(expense => expense.id !== expenseId));
      } catch (error) {
        setError('Xarajatni o\'chirishda xatolik');
      }
    }
  };

  const handleDeleteSource = async (sourceId) => {
    if (window.confirm('Manba o\'chirish tasdiqlaysizmi?')) {
      try {
        setExpenseSources(expenseSources.filter(source => source.id !== sourceId));
      } catch (error) {
        setError('Manba o\'chirishda xatolik');
      }
    }
  };

  const openExpenseModal = (mode, expense = null) => {
    setModalMode(mode);
    setSelectedExpense(expense);
    if (expense) {
      setExpenseFormData({
        sourceId: expense.source.id.toString(),
        amount: expense.amount.toString(),
        date: expense.date,
        description: expense.description,
        note: expense.note
      });
    } else {
      resetExpenseForm();
    }
    setShowExpenseModal(true);
  };

  const openSourceModal = (mode, source = null) => {
    setModalMode(mode);
    setSelectedSource(source);
    if (source) {
      setSourceFormData({
        name: source.name,
        description: source.description
      });
    } else {
      resetSourceForm();
    }
    setShowSourceModal(true);
  };

  const resetExpenseForm = () => {
    setExpenseFormData({
      sourceId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      note: ''
    });
  };

  const resetSourceForm = () => {
    setSourceFormData({
      name: '',
      description: ''
    });
  };

  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSourceInputChange = (e) => {
    const { name, value } = e.target;
    setSourceFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
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
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Xarajatlar</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => openSourceModal('add')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Manbalarni boshqarish</span>
              </button>
              <button
                onClick={() => openExpenseModal('add')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Yangi xarajat</span>
              </button>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getTotalExpenses().toLocaleString()} so'm
                </div>
                <div className="text-sm text-gray-600">Umumiy xarajat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {expenses.length}
                </div>
                <div className="text-sm text-gray-600">Xarajatlar soni</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {expenseSources.length}
                </div>
                <div className="text-sm text-gray-600">Xarajat manbalari</div>
              </div>
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
                    Sana
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manba
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tavsif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miqdor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harakatlar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.source.name}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                        {expense.note && (
                          <div className="text-sm text-gray-500">{expense.note}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.amount.toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openExpenseModal('edit', expense)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
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

          {expenses.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Xarajatlar yo'q</h3>
              <p className="text-gray-600">Birinchi xarajatni qo'shing</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title={modalMode === 'add' ? 'Yangi xarajat qo\'shish' : 'Xarajatni tahrirlash'}
      >
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xarajat manbayi *
            </label>
            <select
              name="sourceId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={expenseFormData.sourceId}
              onChange={handleExpenseInputChange}
            >
              <option value="">Manba tanlang</option>
              {expenseSources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miqdor (so'm) *
            </label>
            <input
              type="number"
              name="amount"
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={expenseFormData.amount}
              onChange={handleExpenseInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sana *
            </label>
            <input
              type="date"
              name="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={expenseFormData.date}
              onChange={handleExpenseInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tavsif *
            </label>
            <input
              type="text"
              name="description"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={expenseFormData.description}
              onChange={handleExpenseInputChange}
              placeholder="Xarajat tavsifi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Izoh
            </label>
            <textarea
              name="note"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={expenseFormData.note}
              onChange={handleExpenseInputChange}
              placeholder="Qo'shimcha izoh..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowExpenseModal(false)}
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

      {/* Expense Sources Modal */}
      <Modal
        isOpen={showSourceModal}
        onClose={() => setShowSourceModal(false)}
        title="Xarajat manbalarini boshqarish"
        size="lg"
      >
        <div className="space-y-6">
          {/* Add New Source Form */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {modalMode === 'add' ? 'Yangi manba qo\'shish' : 'Manba tahrirlash'}
            </h3>
            <form onSubmit={handleSourceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manba nomi *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sourceFormData.name}
                  onChange={handleSourceInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tavsif
                </label>
                <textarea
                  name="description"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sourceFormData.description}
                  onChange={handleSourceInputChange}
                  placeholder="Manba tavsifi..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalMode('add');
                    resetSourceForm();
                  }}
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
          </div>

          {/* Existing Sources List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Mavjud manbalar</h3>
            <div className="space-y-2">
              {expenseSources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-3 bg-white border rounded-md">
                  <div>
                    <div className="font-medium text-gray-900">{source.name}</div>
                    <div className="text-sm text-gray-500">{source.description}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openSourceModal('edit', source)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSource(source.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExpensesPage;