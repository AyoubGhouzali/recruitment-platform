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
  TextField,
  InputAdornment,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import jobService from '../../services/jobService';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError('');
      
      try {
        const jobsData = await jobService.getAllJobs();
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
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.skills && job.skills.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, jobs]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const results = await jobService.searchJobs(searchTerm);
      setFilteredJobs(results);
    } catch (error) {
      console.error('Error searching jobs:', error);
      setError('Failed to search jobs. Please try again.');
    } finally {
      setLoading(false);
    }
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

  if (loading && jobs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" className="page-title">
        Browse Jobs
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Search Box */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search jobs by title, company, or skills..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={clearSearch} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </CardContent>
      </Card>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {!loading && filteredJobs.length === 0 && (
        <Alert severity="info">
          No jobs found matching your search criteria.
        </Alert>
      )}
      
      {/* Jobs List */}
      <Grid container spacing={3}>
        {filteredJobs.map(job => (
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
    </Container>
  );
};

export default JobsList;
