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
  Chip,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import applicationService from '../../services/applicationService';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      
      try {
        const applicationsData = await applicationService.getStudentApplications(user.id);
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [user.id]);

  const handleWithdrawClick = (application) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedApplication) return;
    
    setWithdrawing(true);
    setError('');
    
    try {
      await applicationService.withdrawApplication(selectedApplication.id);
      
      // Update the application status in the UI
      setApplications(applications.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, status: 'WITHDRAWN' } 
          : app
      ));
    } catch (error) {
      console.error('Error withdrawing application:', error);
      setError('Failed to withdraw application. Please try again.');
    } finally {
      setWithdrawing(false);
      setOpenDialog(false);
    }
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

  return (
    <Container>
      <Typography variant="h4" component="h1" className="page-title">
        My Applications
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {applications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Applications Found
          </Typography>
          <Typography variant="body1" paragraph>
            You haven't applied to any jobs yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            component={RouterLink}
            to="/student/jobs"
          >
            Browse Jobs
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Applied On</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.jobTitle}</TableCell>
                  <TableCell>{application.companyName}</TableCell>
                  <TableCell>{formatDate(application.appliedAt)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={application.status} 
                      color={getStatusChipColor(application.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        component={RouterLink}
                        to={`/student/jobs/${application.jobOfferId}`}
                        sx={{ mr: 1 }}
                      >
                        View Job
                      </Button>
                      
                      {application.status === 'PENDING' && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleWithdrawClick(application)}
                        >
                          Withdraw
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Withdraw Application Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Withdraw Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to withdraw your application for "{selectedApplication?.jobTitle}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmWithdraw} 
            color="error" 
            disabled={withdrawing}
          >
            {withdrawing ? <CircularProgress size={24} /> : 'Withdraw'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyApplications;
