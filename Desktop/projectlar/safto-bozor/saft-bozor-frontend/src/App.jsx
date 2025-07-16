import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios'; // Axios kutubxonasini import qilish
import {
  LogIn, Home, Users, ShoppingBag, Package, Wallet, Map, Activity, Moon, Sun, Menu, X, Settings,
  Info, Briefcase, FileText, BarChart2, DollarSign, Calendar, TrendingUp, Shield, Bell, MessageSquare,
  ClipboardList, Search, PlusCircle, Edit, Trash2, Save, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Recharts import qilingan

// --- Kontekstlar ---

// Autentifikatsiya konteksti
const AuthContext = createContext(null);

// Tema konteksti
const ThemeContext = createContext(null);

// --- API Xizmati ---
const API_BASE_URL = 'http://localhost:3000/api'; // NestJS backendingizning asosiy URL manzili
// MUHIM: Haqiqiy loyihada bu URL ni .env faylidan olish tavsiya etiladi.
// Masalan: process.env.REACT_APP_API_URL

const api = {
  async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user || { role: 'user', username: username }));
      return response.data;
    } catch (error) {
      console.error('Login xatosi:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Login muvaffaqiyatsiz');
    }
  },

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token topilmadi.');
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user || { role: 'user' }));
      return response.data;
    } catch (error) {
      console.error('Token yangilash xatosi:', error.response?.data?.message || error.message);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw new Error(error.response?.data?.message || 'Token yangilash muvaffaqiyatsiz');
    }
  },

  // Himoyalangan API chaqiruvlari uchun yordamchi funksiya
  async protectedRequest(method, url, data = null) {
    let accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Access token topilmadi. Tizimga kirishingiz kerak.');
    }

    try {
      const config = {
        method: method,
        url: `${API_BASE_URL}${url}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        data: data,
      };
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Himoyalangan soʻrov xatosi:', error.response?.data?.message || error.message);
      if (error.response?.status === 401) {
        // Token muddati tugagan bo'lsa, yangilashga urinish
        try {
          await api.refreshToken();
          // Token yangilanganidan keyin soʻrovni qayta yuborish
          const newAccessToken = localStorage.getItem('accessToken');
          const config = {
            method: method,
            url: `${API_BASE_URL}${url}`,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newAccessToken}`,
            },
            data: data,
          };
          const response = await axios(config);
          return response.data;
        } catch (refreshError) {
          console.error('Tokenni yangilashdan keyin ham soʻrov muvaffaqiyatsiz:', refreshError);
          throw new Error('Autentifikatsiya muddati tugadi. Qayta kirishingiz kerak.');
        }
      }
      throw new Error(error.response?.data?.message || 'Soʻrov muvaffaqiyatsiz');
    }
  },

  // Misol API chaqiruvlari
  getDashboardSummary: () => api.protectedRequest('GET', '/dashboard/summary'),
  getUsers: () => api.protectedRequest('GET', '/users'),
  createUser: (userData) => api.protectedRequest('POST', '/users', userData),
  updateUser: (id, userData) => api.protectedRequest('PUT', `/users/${id}`, userData),
  deleteUser: (id) => api.protectedRequest('DELETE', `/users/${id}`),

  getSales: () => api.protectedRequest('GET', '/sales'),
  getWarehouseItems: () => api.protectedRequest('GET', '/warehouse-items'),
  getDebtors: () => api.protectedRequest('GET', '/debtors'),
  getMarkets: () => api.protectedRequest('GET', '/markets'),
  getActivityLog: () => api.protectedRequest('GET', '/activity-log'),
  getReports: () => api.protectedRequest('GET', '/reports'),
  getFinanceData: () => api.protectedRequest('GET', '/finance'),
  getCompanies: () => api.protectedRequest('GET', '/companies'),
  getDocuments: () => api.protectedRequest('GET', '/documents'),
};

// --- Komponentlar ---

// Autentifikatsiya provayderi
function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Foydalanuvchi ma'lumotlari
  const [loadingAuth, setLoadingAuth] = useState(true); // Autentifikatsiya holatini yuklash

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        await api.refreshToken(); // Ilova yuklanganda token yangilashga urinish
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Token yangilash muvaffaqiyatsiz, login sahifasiga yoʻnaltirilmoqda.');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const data = await api.login(username, password);
      setIsAuthenticated(true);
      setUser(data.user || { role: 'user', username: username });
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-100">
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Tema provayderi
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Login sahifasi
function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Tizimga kirishda xato yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <div className="bg-white dark:bg-card-bg-dark p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6 text-primary-blue dark:text-light-text">Tizimga Kirish</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="username">
              Foydalanuvchi nomi
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-gray-700 dark:border-gray-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Parol
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-gray-700 dark:border-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-primary-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Sahifa Komponentlari ---

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getDashboardSummary();
        setSummary(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <Home size={24} className="mr-2" /> Dashboard
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bu sizning asosiy boshqaruv paneli. Bu yerda muhim statistikalar va tezkor havolalar joylashadi.
      </p>
      {loading && <p className="text-gray-500 dark:text-gray-400">Ma'lumotlar yuklanmoqda...</p>}
      {error && <p className="text-red-500">Xato: {error}</p>}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100">Jami Foydalanuvchilar</h3>
            <p className="text-3xl font-bold text-primary-blue">{summary.totalUsers || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100">Bugungi Savdo</h3>
            <p className="text-3xl font-bold text-green-500">${summary.todaySales || 'N/A'}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100">Ombordagi Mahsulotlar</h3>
            <p className="text-3xl font-bold text-yellow-500">{summary.totalProducts || 'N/A'}</p>
          </div>
        </div>
      )}
      {!loading && !summary && !error && <p className="text-gray-500 dark:text-gray-400">Dashboard ma'lumotlari topilmadi.</p>}
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // User for editing

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getUsers();
      setUsers(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddEdit = (user = null) => {
    setCurrentUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Haqiqatan ham bu foydalanuvchini oʻchirmoqchimisiz?')) {
      try {
        await api.deleteUser(id);
        alert('Foydalanuvchi muvaffaqiyatli oʻchirildi!');
        fetchUsers(); // Refresh the list
      } catch (err) {
        alert('Foydalanuvchini oʻchirishda xato: ' + err.message);
      }
    }
  };

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center justify-between">
        <span className="flex items-center"><Users size={24} className="mr-2" /> Foydalanuvchilar</span>
        <button
          onClick={() => handleAddEdit()}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors duration-200"
        >
          <PlusCircle size={20} className="mr-2" /> Yangi foydalanuvchi
        </button>
      </h2>
      {loading && <p className="text-gray-500 dark:text-gray-400">Foydalanuvchilar yuklanmoqda...</p>}
      {error && <p className="text-red-500">Xato: {error}</p>}
      {!loading && users.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">Foydalanuvchilar topilmadi.</p>}

      {users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-card-bg-dark rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Foydalanuvchi nomi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Email</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Roli</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Harakatlar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{user.id}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{user.username}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{user.email}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200 capitalize">{user.role}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <button
                      onClick={() => handleAddEdit(user)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Tahrirlash"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-500 hover:text-red-700"
                      title="O'chirish"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <UserModal
          user={currentUser}
          onClose={() => setShowModal(false)}
          onSave={fetchUsers} // Refresh users after save
        />
      )}
    </div>
  );
};

// User Add/Edit Modal
const UserModal = ({ user, onClose, onSave }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || 'user');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = { username, email, role };
      if (!user) { // Only send password for new user creation
        if (!password) {
          setError('Parol majburiy.');
          setLoading(false);
          return;
        }
        userData.password = password;
      }

      if (user) {
        await api.updateUser(user.id, userData);
        alert('Foydalanuvchi muvaffaqiyatli tahrirlandi!');
      } else {
        await api.createUser(userData);
        alert('Yangi foydalanuvchi muvaffaqiyatli qoʻshildi!');
      }
      onSave(); // Refresh data in parent component
      onClose();
    } catch (err) {
      setError(err.message || 'Saqlashda xato yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-card-bg-dark rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-primary-blue dark:text-light-text">{user ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi qoʻshish'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="modal-username">
              Foydalanuvchi nomi
            </label>
            <input
              type="text"
              id="modal-username"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-gray-700 dark:border-gray-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="modal-email">
              Email
            </label>
            <input
              type="email"
              id="modal-email"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-gray-700 dark:border-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="modal-role">
              Roli
            </label>
            <select
              id="modal-role"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-gray-700 dark:border-gray-600"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Foydalanuvchi</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {!user && ( // Password is required only for new user creation
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="modal-password">
                Parol
              </label>
              <input
                type="password"
                id="modal-password"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-gray-700 dark:border-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!user}
              />
            </div>
          )}
          {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="bg-primary-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saqlanmoqda...' : <><Save size={20} className="mr-2" /> Saqlash</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getSales();
        setSales(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <ShoppingBag size={24} className="mr-2" /> Savdo Ma'lumotlari
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bu yerda barcha savdo operatsiyalari ro'yxati ko'rsatiladi.
      </p>
      {loading && <p className="text-gray-500 dark:text-gray-400">Savdo ma'lumotlari yuklanmoqda...</p>}
      {error && <p className="text-red-500">Xato: {error}</p>}
      {!loading && sales.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">Savdo ma'lumotlari topilmadi.</p>}

      {sales.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-card-bg-dark rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Mahsulot</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Miqdori</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Summasi ($)</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Sana</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.id}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.product}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.quantity}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">${item.amount}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const WarehousePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getWarehouseItems();
        setItems(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <Package size={24} className="mr-2" /> Ombor Hisobi
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bu yerda ombordagi mahsulotlar ro'yxati va ularning holati ko'rsatiladi.
      </p>
      {loading && <p className="text-gray-500 dark:text-gray-400">Ombor ma'lumotlari yuklanmoqda...</p>}
      {error && <p className="text-red-500">Xato: {error}</p>}
      {!loading && items.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">Ombor ma'lumotlari topilmadi.</p>}

      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-card-bg-dark rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Nomi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Zaxira</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Joylashuvi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Oxirgi yangilanish</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.id}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.name}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.stock}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.location}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.last_updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const DebtorsPage = () => {
  const [debtors, setDebtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDebtors = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getDebtors();
        setDebtors(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDebtors();
  }, []);

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <Wallet size={24} className="mr-2" /> Debitorlar Ro'yxati
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bu yerda mijozlarning debitorlik qarzlari ko'rsatiladi.
      </p>
      {loading && <p className="text-gray-500 dark:text-gray-400">Debitorlar yuklanmoqda...</p>}
      {error && <p className="text-red-500">Xato: {error}</p>}
      {!loading && debtors.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">Debitorlar topilmadi.</p>}

      {debtors.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-card-bg-dark rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Ism</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Qarz summasi ($)</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Muddati</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Holati</th>
              </tr>
            </thead>
            <tbody>
              {debtors.map((debtor) => (
                <tr key={debtor.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{debtor.id}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{debtor.name}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">${debtor.amount}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{debtor.due_date}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      debtor.status === 'Kutilmoqda' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                      debtor.status === 'Oʻtkazib yuborilgan' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                      'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    }`}>
                      {debtor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MarketsPage = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getMarkets();
        setMarkets(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, []);

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <Map size={24} className="mr-2" /> Bozorlar va Savdo Nuqtalari
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bu yerda kompaniyangiz faoliyat yuritadigan bozorlar va savdo nuqtalari ro'yxati ko'rsatiladi.
      </p>
      {loading && <p className="text-gray-500 dark:text-gray-400">Bozor ma'lumotlari yuklanmoqda...</p>}
      {error && <p className="text-red-500">Xato: {error}</p>}
      {!loading && markets.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">Bozorlar topilmadi.</p>}

      {markets.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-card-bg-dark rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Nomi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Joylashuvi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Turi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Oxirgi tashrif</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market) => (
                <tr key={market.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{market.id}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{market.name}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{market.location}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{market.type}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{market.last_visit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getActivityLog();
        setLogs(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <Activity size={24} className="mr-2" /> Faoliyat Jurnali
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bu yerda tizimdagi barcha foydalanuvchi va tizim faoliyatlari qayd etiladi.
      </p>
      {loading && <p className="text-gray-500 dark:text-gray-400">Faoliyat jurnali yuklanmoqda...</p>}
      {error && <p className="text-red-500">Xato: {error}</p>}
      {!loading && logs.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">Faoliyatlar topilmadi.</p>}

      {logs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-card-bg-dark rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Foydalanuvchi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Harakat</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Vaqt</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{log.id}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{log.user}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{log.action}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getReports();
        setReports(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <BarChart2 size={24} className="mr-2" /> Hisobotlar
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bu yerda turli xil hisobotlar va ularning holati ko'rsatiladi.
      </p>
      {loading && <p className="text-gray-500 dark:text-gray-400">Hisobotlar yuklanmoqda...</p>}
      {error && <p className="text-red-500">Xato: {error}</p>}
      {!loading && reports.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">Hisobotlar topilmadi.</p>}

      {reports.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-card-bg-dark rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Nomi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Turi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Sana</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Holati</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{report.id}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{report.name}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{report.type}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{report.date}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'Tayyor' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const FinancePage = () => {
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getFinanceData();
        setFinanceData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFinanceData();
  }, []);

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <DollarSign size={24} className="mr-2" /> Moliya
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bu yerda moliyaviy operatsiyalar va hisobotlar ko'rsatiladi.
      </p>
      {loading && <p className="text-gray-500 dark:text-gray-400">Moliyaviy ma'lumotlar yuklanmoqda...</p>}
      {error && <p className="text-red-500">Xato: {error}</p>}
      {!loading && financeData.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">Moliyaviy ma'lumotlar topilmadi.</p>}

      {financeData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-card-bg-dark rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Operatsiya</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Summa ($)</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Turi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Sana</th>
              </tr>
            </thead>
            <tbody>
              {financeData.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.id}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.operation}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">${item.amount}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.type}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getCompanies();
        setCompanies(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <Briefcase size={24} className="mr-2" /> Kompaniyalar
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bu yerda hamkor kompaniyalar va ularning ma'lumotlari ko'rsatiladi.
      </p>
      {loading && <p className="text-gray-500 dark:text-gray-400">Kompaniyalar yuklanmoqda...</p>}
      {error && <p className="text-red-500">Xato: {error}</p>}
      {!loading && companies.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">Kompaniyalar topilmadi.</p>}

      {companies.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-card-bg-dark rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Nomi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Aloqa shaxsi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Telefon</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Manzil</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{company.id}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{company.name}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{company.contact_person}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{company.phone}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{company.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getDocuments();
        setDocuments(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <FileText size={24} className="mr-2" /> Hujjatlar
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bu yerda muhim hujjatlar va fayllar ro'yxati ko'rsatiladi.
      </p>
      {loading && <p className="text-gray-500 dark:text-gray-400">Hujjatlar yuklanmoqda...</p>}
      {error && <p className="text-red-500">Xato: {error}</p>}
      {!loading && documents.length === 0 && !error && <p className="text-gray-500 dark:text-gray-400">Hujjatlar topilmadi.</p>}

      {documents.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-card-bg-dark rounded-lg overflow-hidden">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Nomi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Turi</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Yuklangan sana</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Hajmi</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{doc.id}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{doc.name}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{doc.type}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{doc.upload_date}</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{doc.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SettingsPage = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      setUserName(user.username || '');
      setUserEmail(user.email || ''); // Assuming user object has email
    }
  }, [user]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      // Send updated user settings to the backend
      // await api.updateUserSettings({ username: userName, email: userEmail });
      alert('Sozlamalar saqlandi! (Backendga yuborish simulyatsiyasi)');
    } catch (err) {
      alert('Sozlamalarni saqlashda xato: ' + err.message);
    }
  };

  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <Settings size={24} className="mr-2" /> Sozlamalar
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Ilova sozlamalarini bu yerdan boshqarishingiz mumkin.
      </p>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Tema Sozlamalari</h3>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 dark:text-gray-300">Hozirgi tema:</span>
          <span className="font-semibold text-primary-blue dark:text-light-text">
            {theme === 'light' ? 'Oq-koʻk (Light)' : 'Qora (Dark)'}
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center"
          >
            {theme === 'light' ? <Moon size={20} className="mr-1" /> : <Sun size={20} className="mr-1" />}
            Temani almashtirish
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Profil Sozlamalari</h3>
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="setting-username">
              Foydalanuvchi nomi
            </label>
            <input
              type="text"
              id="setting-username"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-gray-700 dark:border-gray-600"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="setting-email">
              Email
            </label>
            <input
              type="email"
              id="setting-email"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:bg-gray-700 dark:border-gray-600"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="bg-primary-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors duration-200"
            >
              <Save size={20} className="mr-2" /> Sozlamalarni saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AboutPage = () => {
  return (
    <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-primary-blue dark:text-light-text mb-4 flex items-center">
        <Info size={24} className="mr-2" /> Ma'lumot
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Bu "Safto Organization" uchun ishlab chiqilgan boshqaruv paneli.
      </p>
      <div className="mt-6 text-gray-600 dark:text-gray-400">
        <p className="mb-2">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Versiya:</span> 1.0.0
        </p>
        <p className="mb-2">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Ishlab chiquvchi:</span> Gemini AI
        </p>
        <p className="mb-2">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Litsenziya:</span> MIT
        </p>
        <p className="mt-4">
          Ushbu ilova biznes jarayonlarini samarali boshqarish uchun mo'ljallangan.
        </p>
      </div>
    </div>
  );
};


// Main application layout
function MainLayout({ children, currentPage, setCurrentPage }) {
  const { logout, user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', page: 'dashboard', icon: Home, roles: ['admin', 'user'] },
    { name: 'Foydalanuvchilar', page: 'users', icon: Users, roles: ['admin'] }, // Admin only
    { name: 'Savdo', page: 'sales', icon: ShoppingBag, roles: ['admin', 'user'] },
    { name: 'Ombor', page: 'warehouse', icon: Package, roles: ['admin', 'user'] },
    { name: 'Debitorlar', page: 'debtors', icon: Wallet, roles: ['admin'] }, // Admin only
    { name: 'Bozorlar', page: 'markets', icon: Map, roles: ['admin', 'user'] },
    { name: 'Faoliyat Jurnali', page: 'activityLog', icon: Activity, roles: ['admin'] }, // Admin only
    { name: 'Hisobotlar', page: 'reports', icon: BarChart2, roles: ['admin', 'user'] },
    { name: 'Moliya', page: 'finance', icon: DollarSign, roles: ['admin'] }, // Admin only
    { name: 'Kompanialar', page: 'companies', icon: Briefcase, roles: ['admin'] }, // Admin only
    { name: 'Hujjatlar', page: 'documents', icon: FileText, roles: ['admin', 'user'] },
    { name: 'Sozlamalar', page: 'settings', icon: Settings, roles: ['admin', 'user'] },
    { name: 'Maʼlumot', page: 'about', icon: Info, roles: ['admin', 'user'] },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || 'user'));


  return (
    <div className="flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-light-text transition-colors duration-300 font-inter">
      {/* Top section (Header) */}
      <header className="bg-white dark:bg-card-bg-dark shadow-sm p-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            className="md:hidden p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Menyu"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-xl font-bold ml-2 text-primary-blue dark:text-light-text">
            Safto Organization
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Temani almashtirish"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors duration-200"
          >
            <LogIn size={16} className="mr-2" /> Chiqish
          </button>
        </div>
      </header>

      {/* Main content and sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (For Desktop) */}
        <nav className="hidden md:block w-64 bg-white dark:bg-sidebar-dark-bg shadow-md p-4 border-r border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-light-text">Menyu</h2>
            {user && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Foydalanuvchi: <span className="font-medium">{user.username || 'Nomaʼlum'}</span> (<span className="capitalize">{user.role || 'user'}</span>)
              </p>
            )}
          </div>
          <ul>
            {filteredNavItems.map((item) => (
              <li key={item.page} className="mb-2">
                <button
                  onClick={() => setCurrentPage(item.page)}
                  className={`flex items-center w-full p-3 rounded-lg text-left text-gray-700 dark:text-sidebar-dark-text hover:bg-primary-blue hover:text-white dark:hover:bg-sidebar-dark-hover dark:hover:text-white transition-colors duration-200 ${
                    currentPage === item.page ? 'bg-primary-blue text-white dark:bg-sidebar-dark-hover' : ''
                  }`}
                >
                  <item.icon size={20} className="mr-3" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Sidebar (Collapsible) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <nav className="w-64 bg-white dark:bg-sidebar-dark-bg h-full p-4 shadow-lg transform transition-transform duration-300 ease-in-out" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-end mb-4">
                <button
                  className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Yopish"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-light-text">Menyu</h2>
                {user && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Foydalanuvchi: <span className="font-medium">{user.username || 'Nomaʼlum'}</span> (<span className="capitalize">{user.role || 'user'}</span>)
                  </p>
                )}
              </div>
              <ul>
                {filteredNavItems.map((item) => (
                  <li key={item.page} className="mb-2">
                    <button
                      onClick={() => {
                        setCurrentPage(item.page);
                        setIsSidebarOpen(false);
                      }}
                      className={`flex items-center w-full p-3 rounded-lg text-left text-gray-700 dark:text-sidebar-dark-text hover:bg-primary-blue hover:text-white dark:hover:bg-sidebar-dark-hover dark:hover:text-white transition-colors duration-200 ${
                        currentPage === item.page ? 'bg-primary-blue text-white dark:bg-sidebar-dark-hover' : ''
                      }`}
                    >
                      <item.icon size={20} className="mr-3" />
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Bottom navigation (Mobile - Kun.uz style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card-bg-dark shadow-lg md:hidden z-20 border-t border-gray-200 dark:border-gray-700">
        <ul className="flex justify-around py-2">
          {filteredNavItems.slice(0, 5).map((item) => ( // Display max 5 items
            <li key={item.page}>
              <button
                onClick={() => setCurrentPage(item.page)}
                className={`flex flex-col items-center text-xs font-medium px-2 py-1 rounded-md transition-colors duration-200 ${
                  currentPage === item.page ? 'text-primary-blue dark:text-light-text' : 'text-gray-500 dark:text-gray-400 hover:text-primary-blue dark:hover:text-light-text'
                }`}
              >
                <item.icon size={20} className="mb-1" />
                {item.name}
              </button>
            </li>
          ))}
          {filteredNavItems.length > 5 && ( // If more than 5, show "More" button
            <li>
              <button
                onClick={() => setIsSidebarOpen(true)} // Open sidebar
                className="flex flex-col items-center text-xs font-medium px-2 py-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-primary-blue dark:hover:text-light-text"
              >
                <Menu size={20} className="mb-1" />
                Ko'proq
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

// Main application content controller component
function AppContent() {
  const { isAuthenticated } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'users':
        return <UsersPage />;
      case 'sales':
        return <SalesPage />;
      case 'warehouse':
        return <WarehousePage />;
      case 'debtors':
        return <DebtorsPage />;
      case 'markets':
        return <MarketsPage />;
      case 'activityLog':
        return <ActivityLogPage />;
      case 'reports':
        return <ReportsPage />;
      case 'finance':
        return <FinancePage />;
      case 'companies':
        return <CompaniesPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'about':
        return <AboutPage />;
      default:
        return (
          <div className="p-4 bg-card-bg-light dark:bg-card-bg-dark rounded-xl shadow-md text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Sahifa topilmadi</h2>
            <p className="text-gray-700 dark:text-gray-300">Siz qidirayotgan sahifa topilmadi. Iltimos, menyudan boshqa sahifani tanlang.</p>
          </div>
        );
    }
  };

  return isAuthenticated ? (
    <MainLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  ) : (
    <LoginPage />
  );
}

// Main App component
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
