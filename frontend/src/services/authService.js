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
    // Validate and format the role value
    if (!userData.role || (userData.role !== 'STUDENT' && userData.role !== 'RECRUITER')) {
      throw new Error('Invalid role value. Must be STUDENT or RECRUITER');
    }
    
    // Make sure the role is properly formatted as a string enum value
    const formattedUserData = {
      ...userData,
      role: userData.role // Already validated as STUDENT or RECRUITER
    };
    
    console.log('Sending registration data to API:', formattedUserData);
    console.log('Role value being sent:', formattedUserData.role, 'Type:', typeof formattedUserData.role);
    
    try {
      const response = await apiService.post(`${AUTH_URL}/signup`, formattedUserData);
      console.log('Registration API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration API error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default authService;
