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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import applicationService from '../../services/applicationService';

const ApplicationsList = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      
      try {
        const applicationsData = await applicationService.getRecruiterApplications(user.id);
        setApplications(applicationsData);
        setFilteredApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [user.id]);

  useEffect(() => {
    // Apply filters whenever search term or status filter changes
    let result = applications;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(app => 
        app.studentName.toLowerCase().includes(term) || 
        app.jobTitle.toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (statusFilter !== 'ALL') {
      result = result.filter(app => app.status === statusFilter);
    }
    
    setFilteredApplications(result);
  }, [applications, searchTerm, statusFilter]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
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
        Manage Applications
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <TextField
            label="Search Applications"
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
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon fontSize="small" />
                </InputAdornment>
              }
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="REVIEWING">Reviewing</MenuItem>
              <MenuItem value="ACCEPTED">Accepted</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>
      
      {filteredApplications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Applications Found
          </Typography>
          <Typography variant="body1" paragraph>
            {applications.length === 0 
              ? "You haven't received any applications yet." 
              : "No applications match your current filters."}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Applied On</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.studentName}</TableCell>
                  <TableCell>{application.jobTitle}</TableCell>
                  <TableCell>{formatDate(application.appliedAt)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={application.status} 
                      color={getStatusChipColor(application.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      component={RouterLink}
                      to={`/recruiter/applications/${application.id}`}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Application Statistics */}
      {applications.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Application Statistics
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">Total</Typography>
                <Typography variant="h6">{applications.length}</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">Pending</Typography>
                <Typography variant="h6">{applications.filter(app => app.status === 'PENDING').length}</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">Reviewing</Typography>
                <Typography variant="h6">{applications.filter(app => app.status === 'REVIEWING').length}</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">Accepted</Typography>
                <Typography variant="h6">{applications.filter(app => app.status === 'ACCEPTED').length}</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">Rejected</Typography>
                <Typography variant="h6">{applications.filter(app => app.status === 'REJECTED').length}</Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">Withdrawn</Typography>
                <Typography variant="h6">{applications.filter(app => app.status === 'WITHDRAWN').length}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ApplicationsList;
