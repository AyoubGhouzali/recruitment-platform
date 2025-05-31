import apiService from './apiService';

const APPLICATIONS_URL = '/api/applications';

const applicationService = {
  getStudentApplications: async (studentId) => {
    const response = await apiService.get(`${APPLICATIONS_URL}/student/${studentId}`);
    return response.data;
  },
  
  getJobApplications: async (jobOfferId) => {
    const response = await apiService.get(`${APPLICATIONS_URL}/joboffer/${jobOfferId}`);
    return response.data;
  },
  
  createApplication: async (jobOfferId, resumeUrl) => {
    const url = resumeUrl 
      ? `${APPLICATIONS_URL}?jobOfferId=${jobOfferId}&resumeUrl=${resumeUrl}`
      : `${APPLICATIONS_URL}?jobOfferId=${jobOfferId}`;
      
    const response = await apiService.post(url);
    return response.data;
  },
  
  updateApplicationStatus: async (id, status) => {
    const response = await apiService.put(`${APPLICATIONS_URL}/${id}/status?status=${status}`);
    return response.data;
  },
  
  withdrawApplication: async (id) => {
    const response = await apiService.put(`${APPLICATIONS_URL}/${id}/withdraw`);
    return response.data;
  }
};

export default applicationService;
