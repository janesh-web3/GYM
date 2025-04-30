// @ts-nocheck
import { apiMethods } from './api';

// Authentication service
export const authService = {
  login: async (email, password, role) => {
    try {
      const response = await apiMethods.post('/auth/login', { email, password, role });
      console.log('Login API response:', response);
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await apiMethods.post('/auth/signup', userData);
      console.log('Register API response:', response);
      return response;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },
  
  forgotPassword: async (email) => {
    return apiMethods.post('/auth/forgot-password', { email });
  },
  
  resetPassword: async (token, password) => {
    return apiMethods.post('/auth/reset-password', { token, password });
  },
  
  getCurrentUser: async () => {
    return apiMethods.get('/auth/me');
  }
};

// User profile service
export const profileService = {
  getProfile: async () => {
    return apiMethods.get('/users/profile');
  },
  
  updateProfile: async (profileData) => {
    return apiMethods.put('/users/profile', profileData);
  },
  
  changePassword: async (currentPassword, newPassword) => {
    return apiMethods.put('/users/change-password', { currentPassword, newPassword });
  }
};

// Member progress service
export const progressService = {
  getProgress: async () => {
    return apiMethods.get('/members/progress');
  },
  
  recordProgress: async (progressData) => {
    return apiMethods.post('/members/progress', progressData);
  },
  
  getProgressHistory: async (startDate, endDate) => {
    return apiMethods.get(`/members/progress/history?startDate=${startDate}&endDate=${endDate}`);
  }
};

// Attendance service
export const attendanceService = {
  checkIn: async (gymId) => {
    return apiMethods.post('/attendance/check-in', { gymId });
  },
  
  checkOut: async () => {
    return apiMethods.post('/attendance/check-out');
  },
  
  getHistory: async (startDate, endDate) => {
    return apiMethods.get(`/attendance/history?startDate=${startDate}&endDate=${endDate}`);
  }
};

// Gym service
export const gymService = {
  getAllGyms: async () => {
    return apiMethods.get('/gyms');
  },
  
  getGymById: async (gymId) => {
    return apiMethods.get(`/gyms/${gymId}`);
  },
  
  createGym: async (gymData) => {
    return apiMethods.post('/gyms', gymData);
  },
  
  updateGym: async (gymId, gymData) => {
    return apiMethods.put(`/gyms/${gymId}`, gymData);
  },
  
  deleteGym: async (gymId) => {
    return apiMethods.delete(`/gyms/${gymId}`);
  }
};

// Product service
export const productService = {
  getAllProducts: async (page = 1, limit = 20, category = '', featured = false) => {
    return apiMethods.get(`/products?page=${page}&limit=${limit}&category=${category}&featured=${featured}`);
  },
  
  getProductById: async (productId) => {
    return apiMethods.get(`/products/${productId}`);
  },
  
  createProduct: async (productData) => {
    return apiMethods.post('/products', productData);
  },
  
  updateProduct: async (productId, productData) => {
    return apiMethods.put(`/products/${productId}`, productData);
  },
  
  deleteProduct: async (productId) => {
    return apiMethods.delete(`/products/${productId}`);
  }
};

// Cart service
export const cartService = {
  getCart: async () => {
    return apiMethods.get('/cart');
  },
  
  addToCart: async (productId, quantity = 1) => {
    return apiMethods.post('/cart/add', { productId, quantity });
  },
  
  updateCartItem: async (productId, quantity) => {
    return apiMethods.put('/cart/update', { productId, quantity });
  },
  
  removeFromCart: async (productId) => {
    return apiMethods.delete(`/cart/remove/${productId}`);
  },
  
  clearCart: async () => {
    return apiMethods.delete('/cart/clear');
  }
};

// Order service
export const orderService = {
  createOrder: async (orderData) => {
    return apiMethods.post('/orders', orderData);
  },
  
  getOrders: async () => {
    return apiMethods.get('/orders');
  },
  
  getOrderById: async (orderId) => {
    return apiMethods.get(`/orders/${orderId}`);
  },
  
  updateOrderStatus: async (orderId, status) => {
    return apiMethods.put(`/orders/${orderId}/status`, { status });
  }
};

// Notification service
export const notificationService = {
  getNotifications: async (page = 1, limit = 20, read = null) => {
    let url = `/notifications?page=${page}&limit=${limit}`;
    if (read !== null) {
      url += `&read=${read}`;
    }
    return apiMethods.get(url);
  },
  
  markAsRead: async (notificationId) => {
    return apiMethods.put(`/notifications/${notificationId}/read`);
  },
  
  markAllAsRead: async () => {
    return apiMethods.put('/notifications/read-all');
  },
  
  deleteNotification: async (notificationId) => {
    return apiMethods.delete(`/notifications/${notificationId}`);
  },
  
  deleteAllRead: async () => {
    return apiMethods.delete('/notifications/read');
  }
};

// Chat service
export const chatService = {
  getConversations: async () => {
    return apiMethods.get('/chat/conversations');
  },
  
  getConversation: async (conversationId) => {
    return apiMethods.get(`/chat/conversations/${conversationId}`);
  },
  
  getMessages: async (conversationId, page = 1, limit = 50) => {
    return apiMethods.get(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  },
  
  sendMessage: async (conversationId, content, media = null) => {
    const data = { content };
    if (media) {
      data.media = media;
    }
    return apiMethods.post(`/chat/conversations/${conversationId}/messages`, data);
  },
  
  createConversation: async (participantId) => {
    return apiMethods.post('/chat/conversations', { participantId });
  }
}; 