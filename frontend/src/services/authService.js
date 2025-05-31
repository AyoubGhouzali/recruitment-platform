import apiService from './apiService';

// Use the correct path to the auth endpoint
const AUTH_URL = '/api/auth';

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiService.post(`${AUTH_URL}/login`, { email, password });
      console.log('Login response:', response);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
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
