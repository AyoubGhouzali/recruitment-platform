import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Recommend as RecommendIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import aiService from '../../services/aiService';
import studentService from '../../services/studentService';

const AIRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [salaryPrediction, setSalaryPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    const fetchAIData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch student profile
        const profileData = await studentService.getProfile();
        setStudentProfile(profileData);
        
        // Fetch job recommendations
        const recommendationsData = await aiService.getJobRecommendations();
        setRecommendations(recommendationsData);
        
        // Fetch salary prediction
        const predictionData = await aiService.getSalaryPrediction();
        setSalaryPrediction(predictionData);
      } catch (error) {
        console.error('Error fetching AI data:', error);
        setError('Failed to load AI recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAIData();
  }, [user.id]);

  const formatSalaryRange = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && !max) return `$${min.toLocaleString()}+`;
    if (!min && max) return `Up to $${max.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  // Extract skills from comma-separated string
  const parseSkills = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(skill => skill.trim()).filter(skill => skill);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" className="page-title">
        AI Recommendations
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {(!studentProfile?.skills || !studentProfile?.education) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your profile is incomplete. For better recommendations, please add your skills and education details.
        </Alert>
      )}
      
      {/* Salary Prediction Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUpIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h5">
            AI Salary Prediction
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {salaryPrediction ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body1" gutterBottom>
                  Based on your skills, education, and experience, our AI predicts your market value:
                </Typography>
                
                <Typography variant="h4" color="primary" sx={{ my: 2 }}>
                  ${Math.round(salaryPrediction.minSalary).toLocaleString()} - ${Math.round(salaryPrediction.maxSalary).toLocaleString()}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Confidence:
                  </Typography>
                  <Box sx={{ width: '100%', mr: 1, maxWidth: 200 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.round(salaryPrediction.confidenceScore * 100)} 
                      color={
                        salaryPrediction.confidenceScore > 0.7 ? "success" :
                        salaryPrediction.confidenceScore > 0.4 ? "warning" : "error"
                      }
                    />
                  </Box>
                  <Typography variant="body2">
                    {Math.round(salaryPrediction.confidenceScore * 100)}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  How to improve your market value:
                </Typography>
                <ul>
                  <li>Add more in-demand skills to your profile</li>
                  <li>Complete your education information</li>
                  <li>Upload a detailed resume</li>
                  <li>Apply to jobs that match your skills</li>
                </ul>
                
                <Button 
                  variant="outlined" 
                  color="primary"
                  component={RouterLink}
                  to="/student/profile"
                  sx={{ mt: 1 }}
                >
                  Update Profile
                </Button>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body1">
            We couldn't generate a salary prediction. Please complete your profile with skills and education information.
          </Typography>
        )}
      </Paper>
      
      {/* Job Recommendations Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <RecommendIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h5">
            Recommended Jobs
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          These jobs are recommended based on your skills and profile information.
        </Typography>
        
        {recommendations.length === 0 ? (
          <Alert severity="info">
            No job recommendations available. This could be because your profile is incomplete or there are no matching jobs in the system.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {recommendations.map(job => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <Card className="job-card">
                  <CardContent className="job-card-content">
                    <Typography variant="h6" component="h2" gutterBottom>
                      {job.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BusinessIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        {job.companyName || 'Company not specified'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MoneyIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        {formatSalaryRange(job.salaryMin, job.salaryMax)}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {job.description && job.description.length > 150
                        ? `${job.description.substring(0, 150)}...`
                        : job.description || 'No description provided'}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      {parseSkills(job.skills).slice(0, 3).map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                      {parseSkills(job.skills).length > 3 && (
                        <Chip
                          label={`+${parseSkills(job.skills).length - 3} more`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      component={RouterLink}
                      to={`/student/jobs/${job.id}`}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Skills Analysis Section */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <RecommendIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h5">
            Skills Analysis
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {studentProfile?.skills ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              Your current skills:
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {parseSkills(studentProfile.skills).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
            
            <Typography variant="body1" gutterBottom>
              Trending skills you might want to add:
            </Typography>
            
            <Box>
              {['React', 'Node.js', 'Machine Learning', 'AWS', 'Docker', 'Kubernetes'].map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        ) : (
          <Typography variant="body1">
            You haven't added any skills to your profile yet. Add skills to get better job recommendations.
          </Typography>
        )}
        
        <Button 
          variant="contained" 
          color="primary"
          component={RouterLink}
          to="/student/profile"
          sx={{ mt: 3 }}
        >
          Update Skills
        </Button>
      </Paper>
    </Container>
  );
};

export default AIRecommendations;
