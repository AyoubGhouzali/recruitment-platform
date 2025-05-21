import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Link
} from '@mui/material';
import { Save as SaveIcon, Upload as UploadIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import aiService from '../../services/aiService';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [salaryPrediction, setSalaryPrediction] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      education: '',
      skills: '',
      resumeUrl: ''
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required('Full name is required'),
      education: Yup.string(),
      skills: Yup.string()
    }),
    onSubmit: async (values) => {
      setSaving(true);
      setError('');
      setSuccess('');
      
      try {
        await studentService.updateProfile(values);
        setSuccess('Profile updated successfully');
        fetchSalaryPrediction();
      } catch (error) {
        console.error('Error updating profile:', error);
        setError('Failed to update profile. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      
      try {
        const profileData = await studentService.getProfile();
        formik.setValues({
          fullName: profileData.fullName || '',
          education: profileData.education || '',
          skills: profileData.skills || '',
          resumeUrl: profileData.resumeUrl || ''
        });
        
        fetchSalaryPrediction();
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user.id]);

  const fetchSalaryPrediction = async () => {
    try {
      const prediction = await aiService.getSalaryPrediction();
      setSalaryPrediction(prediction);
    } catch (error) {
      console.error('Error fetching salary prediction:', error);
      // Don't show error for this as it's not critical
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      return;
    }
    
    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await studentService.uploadResume(selectedFile);
      formik.setFieldValue('resumeUrl', response.fileDownloadUri);
      setSuccess('Resume uploaded successfully');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading resume:', error);
      setError('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleExtractSkills = async () => {
    if (!formik.values.resumeUrl) {
      setError('Please upload a resume first to extract skills');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // This is a placeholder. In a real app, you would send the resume text
      // For this demo, we'll use the education field as a sample text
      const skills = await aiService.extractSkills(formik.values.education);
      formik.setFieldValue('skills', skills.join(', '));
    } catch (error) {
      console.error('Error extracting skills:', error);
      setError('Failed to extract skills. Please try again.');
    } finally {
      setLoading(false);
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
    <Container className="profile-container">
      <Typography variant="h4" component="h1" className="page-title">
        Student Profile
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="fullName"
                    name="fullName"
                    label="Full Name"
                    variant="outlined"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                    helperText={formik.touched.fullName && formik.errors.fullName}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="education"
                    name="education"
                    label="Education"
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Enter your education details (degrees, institutions, graduation years)"
                    value={formik.values.education}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.education && Boolean(formik.errors.education)}
                    helperText={formik.touched.education && formik.errors.education}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="skills"
                    name="skills"
                    label="Skills"
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Enter your skills (separated by commas)"
                    value={formik.values.skills}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.skills && Boolean(formik.errors.skills)}
                    helperText={formik.touched.skills && formik.errors.skills}
                  />
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={handleExtractSkills}
                    sx={{ mt: 1 }}
                  >
                    Extract Skills from Resume
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Resume
                  </Typography>
                  <Box className="file-upload-container">
                    <input
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      style={{ display: 'none' }}
                      id="resume-file"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="resume-file">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                      >
                        Select Resume
                      </Button>
                    </label>
                    {selectedFile && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          Selected file: {selectedFile.name}
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleFileUpload}
                          disabled={uploading}
                          startIcon={uploading ? <CircularProgress size={24} /> : <UploadIcon />}
                          sx={{ mt: 1 }}
                        >
                          Upload
                        </Button>
                      </Box>
                    )}
                    {formik.values.resumeUrl && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          Current resume: 
                          <Link href={formik.values.resumeUrl} target="_blank" rel="noopener noreferrer">
                            View Resume
                          </Link>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={saving ? <CircularProgress size={24} /> : <SaveIcon />}
                    disabled={saving}
                  >
                    Save Profile
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* Salary Prediction Card */}
          {salaryPrediction && (
            <Card className="salary-prediction-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Salary Prediction
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Based on your skills and education, our AI predicts your market value:
                </Typography>
                
                <Typography variant="h5" color="primary" sx={{ mt: 2, mb: 1 }}>
                  ${Math.round(salaryPrediction.minSalary).toLocaleString()} - ${Math.round(salaryPrediction.maxSalary).toLocaleString()}
                </Typography>
                
                <Typography variant="body2" color="textSecondary">
                  Confidence: {Math.round(salaryPrediction.confidenceScore * 100)}%
                </Typography>
                
                <Typography variant="body2" sx={{ mt: 2 }}>
                  This prediction is based on your current profile information. Complete your profile to get a more accurate prediction.
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {/* Profile Tips Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Tips
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" paragraph>
                <strong>Complete your profile</strong> to get better job recommendations and increase your visibility to recruiters.
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Upload your resume</strong> to make it easier to apply for jobs and to help our AI extract your skills.
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>List all relevant skills</strong> to improve matching with job requirements.
              </Typography>
              
              <Typography variant="body2">
                <strong>Keep your education information detailed</strong> with degrees, institutions, and graduation years.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
