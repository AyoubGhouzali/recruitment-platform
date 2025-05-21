import apiService from './apiService';

const STUDENTS_URL = '/students';

const studentService = {
  getProfile: async () => {
    const response = await apiService.get(`${STUDENTS_URL}/me`);
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await apiService.put(`${STUDENTS_URL}/update`, profileData);
    return response.data;
  },
  
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiService.post('/files/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
};

export default studentService;
