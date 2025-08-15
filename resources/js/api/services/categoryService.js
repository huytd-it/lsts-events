import api from '../axios';

export const categoryService = {
  // Get all categories
  getAll: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  // Get public categories
  getPublicCategories: async () => {
    const response = await api.get('/public/categories');
    return response.data;
  },

  // Get category by ID
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create new category
  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Get category statistics
  getStatistics: async () => {
    const response = await api.get('/categories/statistics');
    return response.data;
  },

  // Get category tree
  getCategoryTree: async (params = {}) => {
    const response = await api.get('/categories/tree', { params });
    return response.data;
  },

  // Assign users to category
  assignUsers: async (categoryId, userEmails) => {
    const response = await api.post(`/categories/${categoryId}/assign-users`, {
      user_emails: userEmails
    });
    return response.data;
  },

  // Get assigned users for category
  getAssignedUsers: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}/users`);
    return response.data;
  },

  // Move category
  moveCategory: async (categoryId, parentId) => {
    const response = await api.put(`/categories/${categoryId}/move`, {
      parent_id: parentId
    });
    return response.data;
  },

  // Validate category tree
  validateTree: async () => {
    const response = await api.get('/categories/validate-tree');
    return response.data;
  }
};