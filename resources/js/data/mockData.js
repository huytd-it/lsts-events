// Mock data for development
export const mockCategories = [
  {
    category_id: 1,
    category_name: 'Hội Thảo Khoa Học',
    category_description: 'Các sự kiện hội thảo khoa học và học thuật',
    is_public: 1,
    events_count: 12,
    users_count: 5,
    parent_id: null,
    created_at: '2024-01-15 10:00:00',
    updated_at: '2024-01-15 10:00:00'
  },
  {
    category_id: 2,
    category_name: 'Triển Lãm Nghệ Thuật',
    category_description: 'Các sự kiện triển lãm nghệ thuật và văn hóa',
    is_public: 1,
    events_count: 8,
    users_count: 3,
    parent_id: null,
    created_at: '2024-01-20 14:30:00',
    updated_at: '2024-01-20 14:30:00'
  },
  {
    category_id: 3,
    category_name: 'Buổi Biểu Diễn',
    category_description: 'Các sự kiện biểu diễn âm nhạc và nghệ thuật',
    is_public: 1,
    events_count: 15,
    users_count: 7,
    parent_id: null,
    created_at: '2024-02-01 09:15:00',
    updated_at: '2024-02-01 09:15:00'
  },
  {
    category_id: 4,
    category_name: 'Khóa Học',
    category_description: 'Các khóa học và đào tạo',
    is_public: 0,
    events_count: 22,
    users_count: 12,
    parent_id: null,
    created_at: '2024-02-10 16:45:00',
    updated_at: '2024-02-10 16:45:00'
  },
  {
    category_id: 5,
    category_name: 'Sự Kiện Trực Tuyến',
    category_description: 'Các sự kiện được tổ chức trực tuyến',
    is_public: 1,
    events_count: 7,
    users_count: 4,
    parent_id: null,
    created_at: '2024-02-15 11:20:00',
    updated_at: '2024-02-15 11:20:00'
  }
];

export const mockEvents = [
  {
    id: 1,
    event_name: 'Hội thảo Công nghệ AI 2024',
    event_date: '2024-03-15',
    event_time: '09:00:00',
    location: 'Hội trường A - LSTS',
    description: 'Hội thảo về những xu hướng mới nhất trong lĩnh vực trí tuệ nhân tạo',
    category_id: 1,
    category_name: 'Hội Thảo Khoa Học',
    is_big_event: 1,
    attendees: 120,
    status: 'upcoming',
    created_at: '2024-01-15 10:00:00',
    updated_at: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    event_name: 'Triển lãm Nghệ thuật Đương đại',
    event_date: '2024-03-22',
    event_time: '14:00:00',
    location: 'Phòng triển lãm B - LSTS',
    description: 'Triển lãm các tác phẩm nghệ thuật đương đại của sinh viên',
    category_id: 2,
    category_name: 'Triển Lãm Nghệ Thuật',
    is_big_event: 0,
    attendees: 85,
    status: 'upcoming',
    created_at: '2024-01-20 14:30:00',
    updated_at: '2024-01-20 14:30:00'
  },
  {
    id: 3,
    event_name: 'Đêm nhạc Cổ điển',
    event_date: '2024-04-05',
    event_time: '19:30:00',
    location: 'Hội trường lớn - LSTS',
    description: 'Đêm nhạc cổ điển với sự tham gia của dàn nhạc giao hưởng',
    category_id: 3,
    category_name: 'Buổi Biểu Diễn',
    is_big_event: 1,
    attendees: 200,
    status: 'upcoming',
    created_at: '2024-02-01 09:15:00',
    updated_at: '2024-02-01 09:15:00'
  },
  {
    id: 4,
    event_name: 'Khóa học ReactJS nâng cao',
    event_date: '2024-04-10',
    event_time: '08:00:00',
    location: 'Phòng máy tính 301',
    description: 'Khóa học về ReactJS và các công nghệ frontend hiện đại',
    category_id: 4,
    category_name: 'Khóa Học',
    is_big_event: 0,
    attendees: 30,
    status: 'upcoming',
    created_at: '2024-02-10 16:45:00',
    updated_at: '2024-02-10 16:45:00'
  },
  {
    id: 5,
    event_name: 'Webinar: Tương lai của Blockchain',
    event_date: '2024-04-15',
    event_time: '20:00:00',
    location: 'Zoom Online',
    description: 'Webinar trực tuyến về công nghệ Blockchain và ứng dụng',
    category_id: 5,
    category_name: 'Sự Kiện Trực Tuyến',
    is_big_event: 0,
    attendees: 150,
    status: 'upcoming',
    created_at: '2024-02-15 11:20:00',
    updated_at: '2024-02-15 11:20:00'
  }
];

export const mockDashboardStats = {
  totalUsers: 120,
  totalEvents: 42,
  totalCategories: 8,
  totalRegistrations: 256,
  recentEvents: mockEvents.slice(0, 3),
  recentUsers: [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@lsts.edu.vn',
      avatar: null,
      created_at: '2024-02-20 10:00:00'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@lsts.edu.vn',
      avatar: null,
      created_at: '2024-02-21 14:30:00'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      email: 'levanc@lsts.edu.vn',
      avatar: null,
      created_at: '2024-02-22 09:15:00'
    }
  ]
};

export const mockUsers = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@lsts.edu.vn',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@lsts.edu.vn',
    role: 'user',
    status: 'active',
    created_at: '2024-01-15 14:30:00'
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@lsts.edu.vn',
    role: 'user',
    status: 'active',
    created_at: '2024-02-01 09:15:00'
  }
];

// Utility functions for mock data manipulation
export const mockApiDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const generateId = () => Math.max(...mockCategories.map(c => c.category_id)) + 1;

export const findById = (array, id, idField = 'id') => 
  array.find(item => item[idField] == id);

export const removeById = (array, id, idField = 'id') => 
  array.filter(item => item[idField] != id);