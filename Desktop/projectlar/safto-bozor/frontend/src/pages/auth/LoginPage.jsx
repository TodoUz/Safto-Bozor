import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ShoppingCart } from 'lucide-react';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [userType, setUserType] = useState('seller');
  const { login, isLoading, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError('Barcha maydonlarni to\'ldiring');
      return;
    }

    const result = await login(credentials, userType);
    if (result.success) {
      navigate('/');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Kirish</h2>
            <p className="mt-2 text-sm text-gray-600">
              Hisobingizga kirishingiz kerak
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <ErrorMessage message={error} onClose={() => setError('')} />
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Foydalanuvchi nomi
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Foydalanuvchi nomini kiriting"
                value={credentials.username}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Parol
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Parolni kiriting"
                value={credentials.password}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                Foydalanuvchi turi
              </label>
              <select
                id="userType"
                name="userType"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="seller">Sotuvchi</option>
                <option value="admin">Admin</option>
                <option value="viewer">Ko'ruvchi</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" text="" />
                ) : (
                  'Kirish'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-500 text-sm transition-colors"
              >
                Hisobingiz yo'qmi? Ro'yxatdan o'tish
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;