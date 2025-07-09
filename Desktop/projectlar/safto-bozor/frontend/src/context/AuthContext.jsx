import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // API call to check authentication will be added here
      // For now, just set loading to false
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const login = async (credentials, userType) => {
    try {
      setError('');
      setIsLoading(true);
      
      // API call for login will be added here
      // Mock user data for UI testing
      const mockUser = {
        id: 1,
        username: credentials.username,
        role: userType,
        fullName: 'Test User'
      };
      
      setUser(mockUser);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setError(error.message || 'Login failed');
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData, userType) => {
    try {
      setError('');
      setIsLoading(true);
      
      // API call for registration will be added here
      // Mock user data for UI testing
      const mockUser = {
        id: 1,
        username: userData.username,
        role: userType,
        fullName: userData.fullName
      };
      
      setUser(mockUser);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setError(error.message || 'Registration failed');
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // API call for logout will be added here
      setUser(null);
      setError('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};