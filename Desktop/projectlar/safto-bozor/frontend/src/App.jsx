import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import DebtorsPage from './pages/DebtorsPage';
import ExpensesPage from './pages/ExpensesPage';
import MarketsPage from './pages/MarketsPage';
import ActivityLogPage from './pages/ActivityLogPage';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/" replace /> : <RegisterPage />} 
        />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/products" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'seller']}>
              <ProductsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/sales" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'seller']}>
              <SalesPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/debtors" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'seller']}>
              <DebtorsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/expenses" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'seller']}>
              <ExpensesPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/markets" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'seller']}>
              <MarketsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/activity-log" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'viewer']}>
              <ActivityLogPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;