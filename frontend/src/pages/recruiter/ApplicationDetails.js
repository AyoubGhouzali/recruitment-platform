import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import applicationService from '../../services/applicationService';
import studentService from '../../services/studentService';

const ApplicationDetails = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch application details
        const applicationData = await applicationService.getApplicationById(applicationId);
        
        // Check if the application is for a job posted by the current recruiter
        if (applicationData.recruiterId !== user.id) {
          setError("You don't have permission to view this application.");
          return;
        }
        
        setApplication(applicationData);
        setFeedback(applicationData.feedback || '');
        
        // Fetch student profile
        const studentData = await studentService.getStudentById(applicationData.studentId);
        setStudentProfile(studentData);
      } catch (error) {
        console.error('Error fetching application details:', error);
        setError('Failed to load application details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplicationDetails();
  }, [applicationId, user.id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!application) return;
    
    setStatusUpdating(true);
    setError('');
    
    try {
      const updatedApplication = await applicationService.updateApplicationStatus(application.id, newStatus);
      setApplication({ ...application, status: newStatus });
      
      // If rejecting or accepting, open feedback dialog
      if (newStatus === 'ACCEPTED' || newStatus === 'REJECTED') {
        setFeedbackDialogOpen(true);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      setError('Failed to update application status. Please try again.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!application) return;
    
    setSubmittingFeedback(true);
    setError('');
    
    try {
      await applicationService.addFeedback(application.id, feedback);
      setApplication({ ...application, feedback });
      setFeedbackDialogOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!studentProfile || !studentProfile.resumeUrl) return;
    
    try {
      // This would typically download the resume file
      window.open(studentProfile.resumeUrl, '_blank');
    } catch (error) {
      console.error('Error downloading resume:', error);
      setError('Failed to download resume. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      case 'REVIEWING':
        return 'info';
      case 'WITHDRAWN':
        return 'default';
      default:
        return 'default';
    }
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

  if (!application || !studentProfile) {
    return (
      <Container>
        <Alert severity="error">
          {error || "Application not found or you don't have permission to view it."}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/recruiter/applications')}
          sx={{ mt: 2 }}
        >
          Back to Applications
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/recruiter/applications')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" className="page-title">
          Application Details
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Application Details Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                Application for {application.jobTitle}
              </Typography>
              <Chip 
                label={application.status} 
                color={getStatusChipColor(application.status)}
              />
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Applied on {formatDate(application.appliedAt)}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Cover Letter
            </Typography>
            <Typography variant="body1" paragraph style={{ whiteSpace: 'pre-line' }}>
              {application.coverLetter || "No cover letter provided."}
            </Typography>
            
            {application.feedback && (
              <>
                <Typography variant="h6" gutterBottom>
                  Feedback
                </Typography>
                <Typography variant="body1" paragraph style={{ whiteSpace: 'pre-line' }}>
                  {application.feedback}
                </Typography>
              </>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Action Buttons */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Application Actions
              </Typography>
              
              {application.status === 'PENDING' && (
                <ButtonGroup variant="contained" sx={{ mb: 2 }}>
                  <Button 
                    color="primary"
                    onClick={() => handleStatusUpdate('REVIEWING')}
                    disabled={statusUpdating}
                  >
                    Mark as Reviewing
                  </Button>
                </ButtonGroup>
              )}
              
              {application.status === 'REVIEWING' && (
                <ButtonGroup variant="contained" sx={{ mb: 2 }}>
                  <Button 
                    color="success"
                    onClick={() => handleStatusUpdate('ACCEPTED')}
                    disabled={statusUpdating}
                  >
                    Accept
                  </Button>
                  <Button 
                    color="error"
                    onClick={() => handleStatusUpdate('REJECTED')}
                    disabled={statusUpdating}
                  >
                    Reject
                  </Button>
                </ButtonGroup>
              )}
              
              {(application.status === 'ACCEPTED' || application.status === 'REJECTED') && (
                <Button 
                  variant="outlined"
                  onClick={() => setFeedbackDialogOpen(true)}
                  sx={{ mb: 2 }}
                >
                  {application.feedback ? 'Edit Feedback' : 'Add Feedback'}
                </Button>
              )}
              
              <Button 
                variant="outlined"
                color="primary"
                component={RouterLink}
                to={`/recruiter/jobs/${application.jobOfferId}`}
                sx={{ ml: application.status === 'PENDING' || application.status === 'REVIEWING' ? 2 : 0 }}
              >
                View Job Posting
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Applicant Profile Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Applicant Profile
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Name" 
                  secondary={studentProfile.fullName} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={studentProfile.email} 
                />
              </ListItem>
              
              {studentProfile.phone && (
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone" 
                    secondary={studentProfile.phone} 
                  />
                </ListItem>
              )}
              
              {studentProfile.education && (
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Education" 
                    secondary={studentProfile.education} 
                  />
                </ListItem>
              )}
              
              {studentProfile.experience && (
                <ListItem>
                  <ListItemIcon>
                    <WorkIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Experience" 
                    secondary={studentProfile.experience} 
                  />
                </ListItem>
              )}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {parseSkills(studentProfile.skills).map((skill, index) => (
                <Chip key={index} label={skill} size="small" />
              ))}
              {parseSkills(studentProfile.skills).length === 0 && (
                <Typography variant="body2">No skills listed</Typography>
              )}
            </Box>
            
            {studentProfile.resumeUrl && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadResume}
                fullWidth
              >
                Download Resume
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {application.status === 'ACCEPTED' 
            ? 'Provide Feedback for Accepted Application' 
            : 'Provide Feedback for Rejected Application'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {application.status === 'ACCEPTED' 
              ? 'Congratulate the candidate and provide any additional information about next steps.' 
              : 'Provide constructive feedback to help the candidate understand why they were not selected.'}
          </DialogContentText>
          <TextField
            autoFocus
            label="Feedback"
            multiline
            rows={6}
            fullWidth
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleFeedbackSubmit} 
            variant="contained" 
            color="primary"
            disabled={submittingFeedback}
          >
            {submittingFeedback ? <CircularProgress size={24} /> : 'Submit Feedback'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApplicationDetails;
