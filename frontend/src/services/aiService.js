import apiService from './apiService';

const AI_URL = '/ai';

const aiService = {
  getJobRecommendations: async (limit = 5) => {
    const response = await apiService.get(`${AI_URL}/recommend?limit=${limit}`);
    return response.data;
  },
  
  getSalaryPrediction: async () => {
    const response = await apiService.get(`${AI_URL}/salary`);
    return response.data;
  },
  
  extractSkills: async (resumeText) => {
    const response = await apiService.get(`${AI_URL}/skills?resumeText=${encodeURIComponent(resumeText)}`);
    return response.data;
  }
};

export default aiService;
