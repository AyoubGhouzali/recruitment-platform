import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent
} from '@mui/material';
import {
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import studentService from '../../services/studentService';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  const [matchScore, setMatchScore] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch job details
        const jobData = await jobService.getJobById(id);
        setJob(jobData);
        
        // Fetch student profile
        const profileData = await studentService.getProfile();
        setStudentProfile(profileData);
        
        // Check if student has already applied
        const applications = await applicationService.getStudentApplications(user.id);
        const hasAlreadyApplied = applications.some(app => app.jobOfferId === parseInt(id));
        setHasApplied(hasAlreadyApplied);
        
        // Calculate match score (simplified version)
        calculateMatchScore(profileData, jobData);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id, user.id]);

  const calculateMatchScore = (profile, job) => {
    if (!profile || !job || !profile.skills || !job.skills) {
      setMatchScore(null);
      return;
    }
    
    // Simple matching algorithm based on skills overlap
    const studentSkills = profile.skills.toLowerCase().split(',').map(s => s.trim());
    const jobSkills = job.skills.toLowerCase().split(',').map(s => s.trim());
    
    // Count matching skills
    const matchingSkills = studentSkills.filter(skill => 
      jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
    );
    
    // Calculate score (0-100%)
    const score = jobSkills.length > 0 
      ? Math.min(100, Math.round((matchingSkills.length / jobSkills.length) * 100))
      : 0;
    
    setMatchScore(score);
  };

  const handleApplyClick = () => {
    if (!studentProfile?.resumeUrl) {
      setOpenDialog(true);
    } else {
      applyToJob();
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmApply = () => {
    setOpenDialog(false);
    applyToJob();
  };

  const applyToJob = async () => {
    setApplying(true);
    setError('');
    
    try {
      await applicationService.createApplication(id, studentProfile?.resumeUrl);
      setHasApplied(true);
    } catch (error) {
      console.error('Error applying to job:', error);
      setError('Failed to apply to job. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const formatSalaryRange = (min, max) => {
    if (!min && !max) return 'Not specified';
    if (min && !max) return `$${min.toLocaleString()}+`;
    if (!min && max) return `Up to $${max.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  // Parse skills from comma-separated string
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

  if (!job) {
    return (
      <Container>
        <Alert severity="error">
          Job not found. It may have been removed or you don't have permission to view it.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/student/jobs')}
          sx={{ mt: 2 }}
        >
          Back to Jobs
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Button 
        variant="outlined" 
        onClick={() => navigate('/student/jobs')}
        sx={{ mb: 3 }}
      >
        Back to Jobs
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {hasApplied && (
        <Alert severity="success" sx={{ mb: 3 }}>
          You have successfully applied to this job.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {job.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="h6" color="textSecondary">
                {job.companyName || 'Company not specified'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <MoneyIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" color="textSecondary">
                {formatSalaryRange(job.salaryMin, job.salaryMax)}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Job Description
            </Typography>
            <Typography variant="body1" paragraph>
              {job.description || 'No description provided'}
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Required Skills
            </Typography>
            <Box sx={{ mb: 3 }}>
              {parseSkills(job.skills).length > 0 ? (
                parseSkills(job.skills).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No specific skills mentioned
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Posted by: {job.recruiterEmail || 'Unknown recruiter'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Posted on: {new Date(job.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={hasApplied ? <CheckIcon /> : <AssignmentIcon />}
                onClick={handleApplyClick}
                disabled={applying || hasApplied}
              >
                {applying ? <CircularProgress size={24} /> : 
                  hasApplied ? 'Applied' : 'Apply Now'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* Match Score Card */}
          {matchScore !== null && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Skills Match
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-flex',
                      width: 120,
                      height: 120
                    }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={matchScore}
                      size={120}
                      thickness={4}
                      sx={{
                        color: matchScore > 70 ? 'success.main' : 
                               matchScore > 40 ? 'warning.main' : 'error.main'
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="h4"
                        component="div"
                        color="text.secondary"
                      >
                        {`${matchScore}%`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Typography variant="body2" align="center">
                  {matchScore > 70 ? 'Great match! Your skills align well with this job.' :
                   matchScore > 40 ? 'Decent match. You have some of the required skills.' :
                   'Low match. Consider developing more skills for this role.'}
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {/* Profile Status Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Checklist
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {studentProfile?.fullName ? (
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <CloseIcon color="error" sx={{ mr: 1 }} />
                )}
                <Typography variant="body2">
                  Complete profile information
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {studentProfile?.skills ? (
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <CloseIcon color="error" sx={{ mr: 1 }} />
                )}
                <Typography variant="body2">
                  List your skills
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {studentProfile?.resumeUrl ? (
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <CloseIcon color="error" sx={{ mr: 1 }} />
                )}
                <Typography variant="body2">
                  Upload your resume
                </Typography>
              </Box>
              
              {!studentProfile?.resumeUrl && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => navigate('/student/profile')}
                  sx={{ mt: 2 }}
                >
                  Complete Your Profile
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Apply Without Resume Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Resume Missing</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You haven't uploaded a resume yet. It's recommended to have a resume when applying for jobs.
            Would you like to apply without a resume or go to your profile to upload one?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/student/profile')} color="primary">
            Upload Resume
          </Button>
          <Button onClick={handleConfirmApply} color="primary" autoFocus>
            Apply Without Resume
          </Button>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetails;
