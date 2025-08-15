import api from '../axios';

export const eventMediaService = {
  // Get slides
  getSlides: async () => {
    const response = await api.get('/event-media/slides');
    return response.data;
  },

  // Import media to event
  import: async (mediaData) => {
    const response = await api.post('/event-media/import', mediaData);
    return response.data;
  },

  // Delete media
  delete: async (mediaId, additionalData = {}) => {
    const response = await api.delete(`/event-media/${mediaId}`, {
      data: additionalData
    });
    return response.data;
  },

  // Set media visibility (public/private)
  setVisibility: async (mediaId, isVisible) => {
    const response = await api.put(`/event-media/${mediaId}/visibility`, {
      is_show: isVisible ? 1 : 0
    });
    return response.data;
  },

  // Get media for event
  getEventMedia: async (eventId, params = {}) => {
    const response = await api.get(`/events/${eventId}/media`, { params });
    return response.data;
  },

  // Update media order
  updateOrder: async (mediaId, order) => {
    const response = await api.put(`/event-media/${mediaId}/order`, {
      order: order
    });
    return response.data;
  },

  // Bulk update media
  bulkUpdate: async (mediaUpdates) => {
    const response = await api.put('/event-media/bulk-update', {
      updates: mediaUpdates
    });
    return response.data;
  }
};