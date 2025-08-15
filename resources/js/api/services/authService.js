import api from '../axios';

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/user');
    return response.data;
  },

  // Check session status
  checkSession: async () => {
    const response = await api.get('/check-session');
    return response.data;
  },

  // Refresh session
  refreshSession: async () => {
    const response = await api.post('/refresh-session');
    return response.data;
  },

  // Get user permissions
  getPermissions: async () => {
    const response = await api.get('/permissions');
    return response.data;
  },

  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  }
};