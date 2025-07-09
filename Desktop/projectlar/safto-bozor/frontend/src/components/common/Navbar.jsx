import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ShoppingCart, Users, Package, DollarSign, UserCheck, Building, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    if (!user) return [];

    const commonItems = [
      { name: 'Dashboard', path: '/', icon: Activity },
    ];

    if (user.role === 'admin') {
      return [
        ...commonItems,
        { name: 'Foydalanuvchilar', path: '/users', icon: Users },
        { name: 'Mahsulotlar', path: '/products', icon: Package },
        { name: 'Sotuvlar', path: '/sales', icon: DollarSign },
        { name: 'Qarzdorlar', path: '/debtors', icon: UserCheck },
        { name: 'Xarajatlar', path: '/expenses', icon: DollarSign },
        { name: 'Bozorlar', path: '/markets', icon: Building },
        { name: 'Faoliyat Jurnali', path: '/activity-log', icon: Activity },
      ];
    } else if (user.role === 'seller') {
      return [
        ...commonItems,
        { name: 'Mahsulotlar', path: '/products', icon: Package },
        { name: 'Sotuvlar', path: '/sales', icon: DollarSign },
        { name: 'Qarzdorlar', path: '/debtors', icon: UserCheck },
        { name: 'Xarajatlar', path: '/expenses', icon: DollarSign },
        { name: 'Bozorlar', path: '/markets', icon: Building },
      ];
    } else if (user.role === 'viewer') {
      return [
        ...commonItems,
        { name: 'Faoliyat Jurnali', path: '/activity-log', icon: Activity },
      ];
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-white" />
              <span className="text-white text-xl font-bold">SAFT-BOZOR</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {user ? (
                <>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  <div className="text-white px-3 py-2 text-sm">
                    Salom, {user.fullName} ({user.role})
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Chiqish
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-white hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Kirish
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-md"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-700">
            {user ? (
              <>
                <div className="text-white px-3 py-2 text-sm border-b border-blue-600 mb-2">
                  Salom, {user.fullName} ({user.role})
                </div>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="text-white hover:bg-white hover:bg-opacity-20 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium mt-2"
                >
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:bg-white hover:bg-opacity-20 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kirish
                </Link>
                <Link
                  to="/register"
                  className="text-white hover:bg-white hover:bg-opacity-20 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;