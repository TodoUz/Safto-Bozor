import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Shield, User } from 'lucide-react';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('add');

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'seller',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // API call will be added here
      // Mock data for UI testing
      const mockUsers = [
        { id: 1, username: 'admin', fullName: 'Admin User', email: 'admin@example.com', role: 'admin', createdAt: '2024-01-01' },
        { id: 2, username: 'seller1', fullName: 'Alisher Karimov', email: 'alisher@example.com', role: 'seller', createdAt: '2024-01-02' },
        { id: 3, username: 'viewer1', fullName: 'Nodira Ahmadova', email: 'nodira@example.com', role: 'viewer', createdAt: '2024-01-03' },
      ];
      setUsers(mockUsers);
    } catch (error) {
      setError('Foydalanuvchilarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (modalMode === 'add' && formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmadi');
      return;
    }

    try {
      // API call will be added here
      if (modalMode === 'add') {
        const newUser = {
          id: Date.now(),
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setUsers([...users, newUser]);
      } else {
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, username: formData.username, fullName: formData.fullName, email: formData.email, role: formData.role }
            : user
        ));
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      setError('Foydalanuvchini saqlashda xatolik');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Foydalanuvchini o\'chirish tasdiqlaysizmi?')) {
      try {
        // API call will be added here
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        setError('Foydalanuvchini o\'chirishda xatolik');
      }
    }
  };

  const openModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    if (user) {
      setFormData({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: '',
        confirmPassword: ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      role: 'seller',
      password: '',
      confirmPassword: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'seller':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'seller':
        return 'Sotuvchi';
      case 'viewer':
        return 'Ko\'ruvchi';
      default:
        return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'seller':
        return User;
      case 'viewer':
        return User;
      default:
        return User;
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
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Foydalanuvchilar</h1>
            </div>
            <button
              onClick={() => openModal('add')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Yangi foydalanuvchi</span>
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
                    Foydalanuvchi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ro'yxatdan o'tgan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harakatlar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {getRoleText(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('edit', user)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Foydalanuvchilar yo'q</h3>
              <p className="text-gray-600">Birinchi foydalanuvchini qo'shing</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'add' ? 'Yangi foydalanuvchi qo\'shish' : 'Foydalanuvchini tahrirlash'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To'liq ism *
            </label>
            <input
              type="text"
              name="fullName"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foydalanuvchi nomi *
            </label>
            <input
              type="text"
              name="username"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              name="role"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="seller">Sotuvchi</option>
              <option value="admin">Admin</option>
              <option value="viewer">Ko'ruvchi</option>
            </select>
          </div>

          {modalMode === 'add' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parol *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parolni tasdiqlang *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

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

export default UsersPage;