import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Download } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ActivityLogPage = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      // API call will be added here
      // Mock data for UI testing
      const mockActivities = [
        {
          id: 1,
          user: 'Alisher Karimov',
          action: 'CREATE',
          resource: 'Mahsulot',
          details: 'Olma sharbati mahsuloti yaratildi',
          timestamp: '2024-01-15T10:30:00Z',
          ip: '192.168.1.100'
        },
        {
          id: 2,
          user: 'Nodira Ahmadova',
          action: 'UPDATE',
          resource: 'Sotuv',
          details: 'Sotuv ma\'lumotlari yangilandi',
          timestamp: '2024-01-15T11:15:00Z',
          ip: '192.168.1.101'
        },
        {
          id: 3,
          user: 'Jasur Rahmonov',
          action: 'DELETE',
          resource: 'Qarzdor',
          details: 'Qarzdor ma\'lumotlari o\'chirildi',
          timestamp: '2024-01-15T12:00:00Z',
          ip: '192.168.1.102'
        },
        {
          id: 4,
          user: 'Admin',
          action: 'LOGIN',
          resource: 'Tizim',
          details: 'Tizimga kirish',
          timestamp: '2024-01-15T09:00:00Z',
          ip: '192.168.1.1'
        },
        {
          id: 5,
          user: 'Alisher Karimov',
          action: 'UPDATE',
          resource: 'Mahsulot',
          details: 'Mahsulot miqdori yangilandi',
          timestamp: '2024-01-15T13:45:00Z',
          ip: '192.168.1.100'
        },
        {
          id: 6,
          user: 'Nodira Ahmadova',
          action: 'CREATE',
          resource: 'Xarajat',
          details: 'Yangi xarajat qo\'shildi',
          timestamp: '2024-01-15T14:30:00Z',
          ip: '192.168.1.101'
        }
      ];
      setActivities(mockActivities);
    } catch (error) {
      setError('Faoliyat jurnalini yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'CREATE':
        return 'Yaratildi';
      case 'UPDATE':
        return 'Yangilandi';
      case 'DELETE':
        return 'O\'chirildi';
      case 'LOGIN':
        return 'Kirish';
      case 'LOGOUT':
        return 'Chiqish';
      default:
        return action;
    }
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('uz-UZ');
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === '' || activity.action === selectedAction;
    
    const matchesDate = selectedDate === '' || 
                       activity.timestamp.startsWith(selectedDate);
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = () => {
    // Export functionality will be added here
    console.log('Export activities');
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
              <Activity className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Faoliyat Jurnali</h1>
            </div>
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Eksport</span>
            </button>
          </div>
        </div>

        <ErrorMessage message={error} onClose={() => setError('')} />

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qidirish
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Foydalanuvchi, resurs yoki tavsif..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harakat turi
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
              >
                <option value="">Barcha harakatlar</option>
                <option value="CREATE">Yaratildi</option>
                <option value="UPDATE">Yangilandi</option>
                <option value="DELETE">O'chirildi</option>
                <option value="LOGIN">Kirish</option>
                <option value="LOGOUT">Chiqish</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sana
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Activity Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sana va vaqt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foydalanuvchi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harakat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tavsif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP manzil
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(activity.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {activity.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(activity.action)}`}>
                        {getActionText(activity.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.resource}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {activity.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedAction || selectedDate ? 'Hech narsa topilmadi' : 'Faoliyat jurnali bo\'sh'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedAction || selectedDate 
                  ? 'Filtr parametrlarini o\'zgartirib qaytadan urining' 
                  : 'Hozircha hech qanday faoliyat qayd etilmagan'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Oldingi
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Keyingi
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{startIndex + 1}</span> dan{' '}
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredActivities.length)}</span> gacha,{' '}
                    jami <span className="font-medium">{filteredActivities.length}</span> ta natija
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Oldingi
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Keyingi
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogPage;