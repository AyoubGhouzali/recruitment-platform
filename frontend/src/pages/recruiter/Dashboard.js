import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Work as WorkIcon,
  Person as PersonIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch recent job postings by this recruiter
        const jobsData = await jobService.getRecruiterJobs(user.id, { limit: 5 });
        setJobs(jobsData);
        
        // Fetch recent applications for this recruiter's jobs
        const applicationsData = await applicationService.getRecruiterApplications(user.id, { limit: 5 });
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user.id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Calculate dashboard statistics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.active).length;
  const pendingApplications = applications.filter(app => app.status === 'PENDING').length;
  const totalApplications = applications.length;

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" className="page-title">
          Recruiter Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/recruiter/jobs/create"
        >
          Post New Job
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Dashboard Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="primary">Total Jobs</Typography>
            <Typography variant="h3">{totalJobs}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="primary">Active Jobs</Typography>
            <Typography variant="h3">{activeJobs}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="primary">Pending Applications</Typography>
            <Typography variant="h3">{pendingApplications}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h6" color="primary">Total Applications</Typography>
            <Typography variant="h3">{totalApplications}</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Job Postings */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5">Recent Job Postings</Typography>
              </Box>
              <Button
                variant="text"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                component={RouterLink}
                to="/recruiter/jobs"
                size="small"
              >
                View All
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {jobs.length === 0 ? (
              <Typography variant="body1">
                You haven't posted any jobs yet.
              </Typography>
            ) : (
              <List>
                {jobs.map(job => (
                  <ListItem 
                    key={job.id} 
                    divider 
                    button 
                    component={RouterLink} 
                    to={`/recruiter/jobs/${job.id}`}
                  >
                    <ListItemIcon>
                      <WorkIcon color={job.active ? "primary" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={job.title} 
                      secondary={`Posted: ${formatDate(job.createdAt)} • Applications: ${job.applicationCount || 0}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Applications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5">Recent Applications</Typography>
              </Box>
              <Button
                variant="text"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                component={RouterLink}
                to="/recruiter/applications"
                size="small"
              >
                View All
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {applications.length === 0 ? (
              <Typography variant="body1">
                No applications received yet.
              </Typography>
            ) : (
              <List>
                {applications.map(application => (
                  <ListItem 
                    key={application.id} 
                    divider 
                    button 
                    component={RouterLink} 
                    to={`/recruiter/applications/${application.id}`}
                  >
                    <ListItemIcon>
                      <PersonIcon color={application.status === 'PENDING' ? "warning" : "primary"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${application.studentName} for ${application.jobTitle}`} 
                      secondary={`Status: ${application.status} • Applied: ${formatDate(application.appliedAt)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Post a New Job
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Create a new job posting to attract qualified candidates.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  component={RouterLink}
                  to="/recruiter/jobs/create"
                >
                  Create Job
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Review Applications
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Review and respond to pending job applications.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  component={RouterLink}
                  to="/recruiter/applications"
                >
                  View Applications
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Manage Job Postings
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Edit, activate, or deactivate your existing job postings.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  component={RouterLink}
                  to="/recruiter/jobs"
                >
                  Manage Jobs
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default RecruiterDashboard;
