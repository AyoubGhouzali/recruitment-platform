import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack
} from '@mui/material';
import { 
  Work as WorkIcon, 
  School as SchoolIcon, 
  Business as BusinessIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Determine the CTA button based on authentication status
  const renderCTA = () => {
    if (!isAuthenticated) {
      return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" mt={4}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            component={RouterLink}
            to="/register"
            startIcon={<SchoolIcon />}
          >
            Register as Student
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            component={RouterLink}
            to="/register"
            startIcon={<BusinessIcon />}
          >
            Register as Recruiter
          </Button>
        </Stack>
      );
    }
    
    if (user.role === 'STUDENT') {
      return (
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          component={RouterLink}
          to="/student/jobs"
          startIcon={<WorkIcon />}
        >
          Browse Jobs
        </Button>
      );
    }
    
    if (user.role === 'RECRUITER') {
      return (
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          component={RouterLink}
          to="/recruiter/jobs/post"
          startIcon={<WorkIcon />}
        >
          Post a Job
        </Button>
      );
    }
    
    return null;
  };
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            AI-Powered Recruitment Platform
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Simplifying recruitment with artificial intelligence
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            Connect students with job opportunities using smart matching algorithms and AI-driven recommendations
          </Typography>
          
          {renderCTA()}
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Key Features
        </Typography>
        <Typography variant="body1" align="center" paragraph sx={{ mb: 6 }}>
          Our platform offers powerful tools for both students and recruiters
        </Typography>
        
        <Grid container spacing={4}>
          {/* Feature 1 */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <PsychologyIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  AI Recommendations
                </Typography>
                <Typography variant="body2">
                  Get personalized job recommendations based on your skills, education, and experience
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Feature 2 */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <WorkIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Job Matching
                </Typography>
                <Typography variant="body2">
                  Our AI engine matches students with the most suitable job opportunities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Feature 3 */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <SchoolIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Student Profiles
                </Typography>
                <Typography variant="body2">
                  Build comprehensive profiles showcasing your skills, education, and experience
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Feature 4 */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <BusinessIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Recruiter Tools
                </Typography>
                <Typography variant="body2">
                  Powerful tools for recruiters to post jobs and manage applications efficiently
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            How It Works
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {/* Step 1 */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h1" 
                  component="div" 
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  1
                </Typography>
                <Typography variant="h5" component="h3" gutterBottom>
                  Create Your Profile
                </Typography>
                <Typography variant="body1">
                  Sign up and create your profile with your skills, education, and experience
                </Typography>
              </Box>
            </Grid>
            
            {/* Step 2 */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h1" 
                  component="div" 
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  2
                </Typography>
                <Typography variant="h5" component="h3" gutterBottom>
                  Browse & Apply
                </Typography>
                <Typography variant="body1">
                  Browse job listings or get AI-powered recommendations and apply to positions
                </Typography>
              </Box>
            </Grid>
            
            {/* Step 3 */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h1" 
                  component="div" 
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  3
                </Typography>
                <Typography variant="h5" component="h3" gutterBottom>
                  Get Hired
                </Typography>
                <Typography variant="body1">
                  Connect with recruiters and land your dream job with our AI-powered platform
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
