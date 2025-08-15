import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../api/services';
import { message } from 'antd';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await authService.getCurrentUser();
      setUser(response.data || response.user);
      
      // Get user permissions
      try {
        const permissionsResponse = await authService.getPermissions();
        setPermissions(permissionsResponse.data || []);
      } catch (permError) {
        console.warn('Could not fetch permissions:', permError);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user || response.data);
        
        // Get permissions after login
        try {
          const permissionsResponse = await authService.getPermissions();
          setPermissions(permissionsResponse.data || []);
        } catch (permError) {
          console.warn('Could not fetch permissions after login:', permError);
        }

        message.success(response.message || 'Đăng nhập thành công');
        return response;
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      message.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setPermissions([]);
      message.success('Đã đăng xuất');
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  const refreshSession = async () => {
    try {
      const response = await authService.refreshSession();
      return response.success;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission) || permissions.some(p => p.name === permission);
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('authToken');
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};