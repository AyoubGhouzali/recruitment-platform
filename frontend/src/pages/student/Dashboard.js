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
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Work as WorkIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Recommend as RecommendIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import aiService from '../../services/aiService';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch recent jobs
        const jobsResponse = await jobService.getAllJobs();
        setRecentJobs(jobsResponse.slice(0, 3)); // Get only 3 most recent jobs
        
        // Fetch student applications
        const applicationsResponse = await applicationService.getStudentApplications(user.id);
        setApplications(applicationsResponse);
        
        // Fetch job recommendations
        const recommendationsResponse = await aiService.getJobRecommendations(3);
        setRecommendations(recommendationsResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user.id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container className="dashboard-container">
      <Typography variant="h4" component="h1" className="page-title">
        Student Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Quick Links Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={RouterLink}
                    to="/student/profile"
                    startIcon={<PersonIcon />}
                  >
                    My Profile
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={RouterLink}
                    to="/student/jobs"
                    startIcon={<WorkIcon />}
                  >
                    Browse Jobs
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={RouterLink}
                    to="/student/applications"
                    startIcon={<AssignmentIcon />}
                  >
                    My Applications
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={RouterLink}
                    to="/student/recommendations"
                    startIcon={<RecommendIcon />}
                  >
                    AI Recommendations
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Applications */}
        <Grid item xs={12} md={6}>
          <Card className="dashboard-card">
            <CardContent className="dashboard-card-content">
              <Typography variant="h6" gutterBottom>
                Recent Applications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {applications.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  You haven't applied to any jobs yet.
                </Typography>
              ) : (
                applications.slice(0, 3).map((application) => (
                  <Box key={application.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      {application.jobTitle}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {application.companyName}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={application.status}
                        size="small"
                        color={
                          application.status === 'ACCEPTED' ? 'success' :
                          application.status === 'REJECTED' ? 'error' :
                          application.status === 'PENDING' ? 'warning' :
                          'default'
                        }
                      />
                    </Box>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))
              )}
            </CardContent>
            <CardActions>
              <Button
                size="small"
                component={RouterLink}
                to="/student/applications"
              >
                View All Applications
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Recent Jobs */}
        <Grid item xs={12} md={6}>
          <Card className="dashboard-card">
            <CardContent className="dashboard-card-content">
              <Typography variant="h6" gutterBottom>
                Recent Job Postings
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {recentJobs.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No job postings available.
                </Typography>
              ) : (
                recentJobs.map((job) => (
                  <Box key={job.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {job.companyName}
                    </Typography>
                    <Typography variant="body2">
                      {job.salaryMin && job.salaryMax ? 
                        `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : 
                        'Salary not specified'}
                    </Typography>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))
              )}
            </CardContent>
            <CardActions>
              <Button
                size="small"
                component={RouterLink}
                to="/student/jobs"
              >
                Browse All Jobs
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* AI Recommendations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Job Recommendations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {recommendations.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      No recommendations available. Complete your profile to get personalized recommendations.
                    </Typography>
                  </Grid>
                ) : (
                  recommendations.map((job) => (
                    <Grid item xs={12} sm={6} md={4} key={job.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1">
                            {job.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {job.companyName}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {job.description && job.description.length > 100
                              ? `${job.description.substring(0, 100)}...`
                              : job.description}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`/student/jobs/${job.id}`}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                component={RouterLink}
                to="/student/recommendations"
              >
                View All Recommendations
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
