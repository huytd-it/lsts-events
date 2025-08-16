import { 
  mockCategories, 
  mockEvents, 
  mockDashboardStats, 
  mockUsers,
  mockApiDelay,
  generateId,
  findById,
  removeById 
} from '../../data/mockData';

// Mock category service
export const mockCategoryService = {
  getAll: async (params = {}) => {
    await mockApiDelay(800);
    return {
      success: true,
      data: mockCategories,
      total: mockCategories.length
    };
  },

  getById: async (id) => {
    await mockApiDelay(500);
    const category = findById(mockCategories, id, 'category_id');
    if (!category) {
      throw new Error('Category not found');
    }
    return {
      success: true,
      data: category
    };
  },

  create: async (categoryData) => {
    await mockApiDelay(1000);
    const newCategory = {
      category_id: generateId(),
      ...categoryData,
      events_count: 0,
      users_count: 0,
      parent_id: categoryData.parent_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockCategories.push(newCategory);
    return {
      success: true,
      data: newCategory,
      msg: 'Category created successfully'
    };
  },

  update: async (id, categoryData) => {
    await mockApiDelay(1000);
    const index = mockCategories.findIndex(c => c.category_id == id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    mockCategories[index] = {
      ...mockCategories[index],
      ...categoryData,
      updated_at: new Date().toISOString()
    };
    
    return {
      success: true,
      data: mockCategories[index],
      msg: 'Category updated successfully'
    };
  },

  delete: async (id) => {
    await mockApiDelay(800);
    const index = mockCategories.findIndex(c => c.category_id == id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    mockCategories.splice(index, 1);
    return {
      success: true,
      msg: 'Category deleted successfully'
    };
  }
};

// Mock event service
export const mockEventService = {
  getAll: async (params = {}) => {
    await mockApiDelay(1000);
    let filteredEvents = [...mockEvents];
    
    // Apply filters
    if (params.search) {
      filteredEvents = filteredEvents.filter(event => 
        event.event_name.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    if (params.category_id) {
      filteredEvents = filteredEvents.filter(event => 
        event.category_id == params.category_id
      );
    }
    
    return {
      success: true,
      data: filteredEvents,
      total: filteredEvents.length
    };
  },

  getById: async (id) => {
    await mockApiDelay(500);
    const event = findById(mockEvents, id);
    if (!event) {
      throw new Error('Event not found');
    }
    return {
      success: true,
      data: event
    };
  },

  create: async (eventData) => {
    await mockApiDelay(1200);
    const category = findById(mockCategories, eventData.category_id, 'category_id');
    const newEvent = {
      id: Math.max(...mockEvents.map(e => e.id)) + 1,
      ...eventData,
      category_name: category?.category_name || '',
      attendees: 0,
      status: 'upcoming',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockEvents.push(newEvent);
    
    // Update category events count
    if (category) {
      category.events_count++;
    }
    
    return {
      success: true,
      data: newEvent,
      msg: 'Event created successfully'
    };
  },

  update: async (id, eventData) => {
    await mockApiDelay(1200);
    const index = mockEvents.findIndex(e => e.id == id);
    if (index === -1) {
      throw new Error('Event not found');
    }
    
    const category = findById(mockCategories, eventData.category_id, 'category_id');
    mockEvents[index] = {
      ...mockEvents[index],
      ...eventData,
      category_name: category?.category_name || mockEvents[index].category_name,
      updated_at: new Date().toISOString()
    };
    
    return {
      success: true,
      data: mockEvents[index],
      msg: 'Event updated successfully'
    };
  },

  delete: async (id) => {
    await mockApiDelay(800);
    const index = mockEvents.findIndex(e => e.id == id);
    if (index === -1) {
      throw new Error('Event not found');
    }
    
    const event = mockEvents[index];
    const category = findById(mockCategories, event.category_id, 'category_id');
    
    mockEvents.splice(index, 1);
    
    // Update category events count
    if (category && category.events_count > 0) {
      category.events_count--;
    }
    
    return {
      success: true,
      msg: 'Event deleted successfully'
    };
  }
};

// Mock dashboard service
export const mockDashboardService = {
  getStats: async () => {
    await mockApiDelay(600);
    return {
      success: true,
      data: mockDashboardStats
    };
  }
};

// Mock auth service
export const mockAuthService = {
  getCurrentUser: async () => {
    await mockApiDelay(300);
    return {
      success: true,
      data: {
        id: 1,
        name: 'Admin User',
        email: 'admin@lsts.edu.vn'
      }
    };
  },

  getUsers: async () => {
    await mockApiDelay(800);
    return {
      success: true,
      data: mockUsers,
      total: mockUsers.length
    };
  }
};