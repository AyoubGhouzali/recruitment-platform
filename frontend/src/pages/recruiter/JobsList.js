import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/jobService';

const JobsList = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      
      try {
        const jobsData = await jobService.getRecruiterJobs(user.id);
        setJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [user.id]);

  useEffect(() => {
    // Apply filters whenever search term or active/inactive filters change
    let result = jobs;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(term) || 
        job.companyName.toLowerCase().includes(term) ||
        (job.description && job.description.toLowerCase().includes(term))
      );
    }
    
    // Filter by active status
    if (!showActive) {
      result = result.filter(job => !job.active);
    }
    
    if (!showInactive) {
      result = result.filter(job => job.active);
    }
    
    setFilteredJobs(result);
  }, [jobs, searchTerm, showActive, showInactive]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDeleteClick = (job) => {
    setSelectedJob(job);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedJob) return;
    
    setDeleting(true);
    setError('');
    
    try {
      await jobService.deleteJob(selectedJob.id);
      
      // Remove the deleted job from the state
      setJobs(jobs.filter(job => job.id !== selectedJob.id));
      
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleStatus = async (job) => {
    setStatusUpdating(true);
    setError('');
    
    try {
      const updatedJob = await jobService.updateJobStatus(job.id, !job.active);
      
      // Update the job in the state
      setJobs(jobs.map(j => 
        j.id === job.id 
          ? { ...j, active: !j.active } 
          : j
      ));
      
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" className="page-title">
          Manage Job Postings
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
      
      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Search Jobs"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showActive}
                onChange={(e) => setShowActive(e.target.checked)}
                color="primary"
              />
            }
            label="Active Jobs"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                color="primary"
              />
            }
            label="Inactive Jobs"
          />
        </Box>
      </Paper>
      
      {filteredJobs.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Jobs Found
          </Typography>
          <Typography variant="body1" paragraph>
            {jobs.length === 0 
              ? "You haven't posted any jobs yet." 
              : "No jobs match your current filters."}
          </Typography>
          {jobs.length === 0 && (
            <Button 
              variant="contained" 
              color="primary"
              component={RouterLink}
              to="/recruiter/jobs/create"
              startIcon={<AddIcon />}
            >
              Post Your First Job
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Posted Date</TableCell>
                <TableCell>Salary Range</TableCell>
                <TableCell>Applications</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>
                    <Chip 
                      label={job.active ? "Active" : "Inactive"} 
                      color={job.active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(job.createdAt)}</TableCell>
                  <TableCell>{formatSalaryRange(job.salaryMin, job.salaryMax)}</TableCell>
                  <TableCell>{job.applicationCount || 0}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        component={RouterLink}
                        to={`/recruiter/jobs/${job.id}`}
                        sx={{ mr: 1 }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        color="primary"
                        component={RouterLink}
                        to={`/recruiter/jobs/edit/${job.id}`}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(job)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Job Posting</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the job posting "{selectedJob?.title}"? 
            This action cannot be undone and will remove all associated applications.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobsList;
