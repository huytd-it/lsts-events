import api from '../axios';

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  },

  // Check session status
  checkSession: async () => {
    const response = await api.get('/auth/check-session');
    return response.data;
  },

  // Refresh session
  refreshSession: async () => {
    const response = await api.post('/auth/refresh-session');
    return response.data;
  },

  // Get user permissions
  getPermissions: async () => {
    const response = await api.get('/auth/permissions');
    return response.data;
  },

  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/auth/users', { params });
    return response.data;
  }
};