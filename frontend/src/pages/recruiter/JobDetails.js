import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';

const JobDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch job details
        const jobData = await jobService.getJobById(jobId);
        
        // Check if the job belongs to the current recruiter
        if (jobData.recruiterId !== user.id) {
          setError("You don't have permission to view this job.");
          return;
        }
        
        setJob(jobData);
        
        // Fetch applications for this job
        const applicationsData = await applicationService.getJobApplications(jobId);
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId, user.id]);

  const handleToggleStatus = async () => {
    if (!job) return;
    
    setStatusUpdating(true);
    setError('');
    
    try {
      const updatedJob = await jobService.updateJobStatus(job.id, !job.active);
      setJob({ ...job, active: !job.active });
    } catch (error) {
      console.error('Error updating job status:', error);
      setError('Failed to update job status. Please try again.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

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

  if (!job) {
    return (
      <Container>
        <Alert severity="error">
          {error || "Job not found or you don't have permission to view it."}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" className="page-title">
          Job Details
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          component={RouterLink}
          to={`/recruiter/jobs/edit/${job.id}`}
        >
          Edit Job
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Job Details Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" gutterBottom>
                {job.title}
              </Typography>
              <Chip 
                label={job.active ? "Active" : "Inactive"} 
                color={job.active ? "success" : "default"}
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {job.companyName}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {job.location}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {formatSalaryRange(job.salaryMin, job.salaryMax)}
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Posted on {formatDate(job.createdAt)}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Job Description
            </Typography>
            <Typography variant="body1" paragraph style={{ whiteSpace: 'pre-line' }}>
              {job.description}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <Typography variant="body1" paragraph style={{ whiteSpace: 'pre-line' }}>
              {job.requirements}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              Required Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {parseSkills(job.skills).map((skill, index) => (
                <Chip key={index} label={skill} />
              ))}
              {parseSkills(job.skills).length === 0 && (
                <Typography variant="body2">No specific skills listed</Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={job.active}
                  onChange={handleToggleStatus}
                  disabled={statusUpdating}
                  color="primary"
                />
              }
              label={`Job is currently ${job.active ? 'active' : 'inactive'}`}
            />
          </Paper>
        </Grid>
        
        {/* Applications Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Applications ({applications.length})
            </Typography>
            
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
                      primary={application.studentName} 
                      secondary={`Status: ${application.status} • Applied: ${formatDate(application.appliedAt)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                component={RouterLink}
                to="/recruiter/applications"
                fullWidth
              >
                View All Applications
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default JobDetails;
