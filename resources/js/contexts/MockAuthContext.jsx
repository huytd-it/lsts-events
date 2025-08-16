import { createContext, useState, useContext } from 'react';

const MockAuthContext = createContext();

export const MockAuthProvider = ({ children }) => {
  const [user] = useState({
    id: 1,
    name: 'Admin User',
    email: 'admin@lsts.edu.vn',
    avatar: null
  });

  const [loading] = useState(false);
  const [permissions] = useState(['Event_Admin', 'Category_Admin', 'User_Admin']);

  const login = async (credentials) => {
    // Mock login - always success for development
    return Promise.resolve({
      success: true,
      data: {
        user: user,
        token: 'mock-token-for-development'
      }
    });
  };

  const logout = async () => {
    // Mock logout
    console.log('Mock logout');
    return Promise.resolve();
  };

  const refreshSession = async () => {
    return Promise.resolve(true);
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const isAuthenticated = () => {
    return true; // Always authenticated in dev mode
  };

  const checkAuthStatus = async () => {
    return Promise.resolve();
  };

  const value = {
    user,
    loading,
    permissions,
    login,
    logout,
    refreshSession,
    hasPermission,
    isAuthenticated,
    checkAuthStatus
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};