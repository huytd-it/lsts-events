import api from '../axios';

export const categoryService = {
  getPublicCategories: async () => {
    const response = await api.get('/public/categories');
    return response.data;
  }
};