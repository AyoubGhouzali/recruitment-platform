import apiService from './apiService';

const JOBS_URL = '/joboffers';

const jobService = {
  getAllJobs: async () => {
    const response = await apiService.get(JOBS_URL);
    return response.data;
  },
  
  getJobById: async (id) => {
    const response = await apiService.get(`${JOBS_URL}/${id}`);
    return response.data;
  },
  
  searchJobs: async (keyword) => {
    const response = await apiService.get(`${JOBS_URL}/search?keyword=${keyword}`);
    return response.data;
  },
  
  createJob: async (jobData) => {
    const response = await apiService.post(JOBS_URL, jobData);
    return response.data;
  },
  
  updateJob: async (id, jobData) => {
    const response = await apiService.put(`${JOBS_URL}/${id}`, jobData);
    return response.data;
  },
  
  deleteJob: async (id) => {
    const response = await apiService.delete(`${JOBS_URL}/${id}`);
    return response.data;
  }
};

export default jobService;
