import apiService from './apiService';

const AUTH_URL = '/auth';

const authService = {
  login: async (email, password) => {
    const response = await apiService.post(`${AUTH_URL}/login`, { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    console.log('Sending registration data to API:', userData);
    try {
      const response = await apiService.post(`${AUTH_URL}/signup`, userData);
      console.log('Registration API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration API error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default authService;
