import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Package, DollarSign, UserCheck, Building, Activity, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const getModuleCards = () => {
    const allCards = [
      {
        title: 'Foydalanuvchilar',
        description: 'Foydalanuvchilarni boshqarish',
        path: '/users',
        icon: Users,
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        roles: ['admin']
      },
      {
        title: 'Mahsulotlar',
        description: 'Mahsulotlar va ombor',
        path: '/products',
        icon: Package,
        color: 'bg-gradient-to-r from-green-500 to-green-600',
        roles: ['admin', 'seller']
      },
      {
        title: 'Sotuvlar',
        description: 'Sotuvlarni boshqarish',
        path: '/sales',
        icon: DollarSign,
        color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
        roles: ['admin', 'seller']
      },
      {
        title: 'Qarzdorlar',
        description: 'Qarzdorlar ro\'yxati',
        path: '/debtors',
        icon: UserCheck,
        color: 'bg-gradient-to-r from-red-500 to-red-600',
        roles: ['admin', 'seller']
      },
      {
        title: 'Xarajatlar',
        description: 'Xarajatlarni kuzatish',
        path: '/expenses',
        icon: TrendingUp,
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        roles: ['admin', 'seller']
      },
      {
        title: 'Bozorlar',
        description: 'Bozorlarni boshqarish',
        path: '/markets',
        icon: Building,
        color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
        roles: ['admin', 'seller']
      },
      {
        title: 'Faoliyat Jurnali',
        description: 'Tizim faoliyati',
        path: '/activity-log',
        icon: Activity,
        color: 'bg-gradient-to-r from-gray-500 to-gray-600',
        roles: ['admin', 'viewer']
      }
    ];

    return allCards.filter(card => 
      card.roles.includes(user?.role)
    );
  };

  const moduleCards = getModuleCards();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Dashboard</h1>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Xush kelibsiz, {user?.fullName}!
            </h2>
            <p className="text-gray-600">
              Sizning rolingiz: <span className="font-medium text-blue-600">{user?.role}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moduleCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                to={card.path}
                className="group block"
              >
                <div className={`${card.color} rounded-lg shadow-lg p-6 text-white transform transition-all duration-200 hover:scale-105 hover:shadow-xl`}>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8" />
                    <div className="opacity-75 group-hover:opacity-100 transition-opacity">
                      →
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                  <p className="text-white text-opacity-90 text-sm mb-4">
                    {card.description}
                  </p>
                  <div className="inline-flex items-center text-sm font-medium group-hover:underline">
                    Boshqarish
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {moduleCards.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sizga ruxsat berilgan modullar yo'q
              </h3>
              <p className="text-gray-600">
                Administrator bilan bog'laning
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;