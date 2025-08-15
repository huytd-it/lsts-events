import api from '../axios';

export const eventService = {
  // Get all events
  getAll: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Get event by ID
  getById: async (id, params = {}) => {
    const response = await api.get(`/events/${id}`, { params });
    return response.data;
  },

  // Create new event
  create: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  // Update event
  update: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  // Delete event
  delete: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Upload files for event
  uploadFiles: async (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_data[${index}]`, file);
    });

    const response = await api.post('/events/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get available years
  getYears: async () => {
    const response = await api.get('/events/years');
    return response.data;
  },

  // Get event statistics
  getStatistics: async (params = {}) => {
    const response = await api.get('/events/statistics', { params });
    return response.data;
  },

  // Import event data
  import: async (eventData) => {
    const response = await api.post('/events/import', eventData);
    return response.data;
  },

  // Export events
  export: async (params = {}) => {
    const response = await api.get('/events/export', { 
      params,
      responseType: 'blob'
    });
    return response;
  }
};