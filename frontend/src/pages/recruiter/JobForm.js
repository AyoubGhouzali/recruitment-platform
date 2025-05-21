import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
  Chip
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/jobService';

const JobForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(jobId ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const isEditMode = !!jobId;

  const validationSchema = Yup.object({
    title: Yup.string().required('Job title is required'),
    companyName: Yup.string().required('Company name is required'),
    location: Yup.string().required('Location is required'),
    description: Yup.string().required('Job description is required').min(50, 'Description must be at least 50 characters'),
    requirements: Yup.string().required('Job requirements are required'),
    salaryMin: Yup.number().nullable().min(0, 'Minimum salary must be positive'),
    salaryMax: Yup.number().nullable().min(0, 'Maximum salary must be positive')
      .test('is-greater', 'Maximum salary must be greater than minimum salary', 
        function(value) {
          const { salaryMin } = this.parent;
          return !value || !salaryMin || value > salaryMin;
        }),
    active: Yup.boolean()
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      companyName: '',
      location: '',
      description: '',
      requirements: '',
      salaryMin: '',
      salaryMax: '',
      active: true
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      setError('');
      
      try {
        // Format the values
        const jobData = {
          ...values,
          salaryMin: values.salaryMin ? Number(values.salaryMin) : null,
          salaryMax: values.salaryMax ? Number(values.salaryMax) : null,
          skills: skills.join(','),
          recruiterId: user.id
        };
        
        let result;
        if (isEditMode) {
          result = await jobService.updateJob(jobId, jobData);
        } else {
          result = await jobService.createJob(jobData);
        }
        
        navigate('/recruiter/jobs');
      } catch (error) {
        console.error('Error saving job:', error);
        setError(`Failed to ${isEditMode ? 'update' : 'create'} job. Please try again.`);
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      
      setLoading(true);
      setError('');
      
      try {
        const jobData = await jobService.getJobById(jobId);
        
        // Check if the job belongs to the current recruiter
        if (jobData.recruiterId !== user.id) {
          setError("You don't have permission to edit this job.");
          navigate('/recruiter/jobs');
          return;
        }
        
        // Set form values
        formik.setValues({
          title: jobData.title || '',
          companyName: jobData.companyName || '',
          location: jobData.location || '',
          description: jobData.description || '',
          requirements: jobData.requirements || '',
          salaryMin: jobData.salaryMin || '',
          salaryMax: jobData.salaryMax || '',
          active: jobData.active
        });
        
        // Set skills
        if (jobData.skills) {
          setSkills(jobData.skills.split(',').map(skill => skill.trim()).filter(skill => skill));
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId, user.id, navigate]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleDeleteSkill = (skillToDelete) => {
    setSkills(skills.filter(skill => skill !== skillToDelete));
  };

  const handleSkillInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddSkill();
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
        {isEditMode ? 'Edit Job Posting' : 'Create New Job Posting'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Job Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="companyName"
                name="companyName"
                label="Company Name"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.companyName && Boolean(formik.errors.companyName)}
                helperText={formik.touched.companyName && formik.errors.companyName}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="location"
                name="location"
                label="Location"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="salaryMin"
                name="salaryMin"
                label="Minimum Salary"
                type="number"
                value={formik.values.salaryMin}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.salaryMin && Boolean(formik.errors.salaryMin)}
                helperText={formik.touched.salaryMin && formik.errors.salaryMin}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="salaryMax"
                name="salaryMax"
                label="Maximum Salary"
                type="number"
                value={formik.values.salaryMax}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.salaryMax && Boolean(formik.errors.salaryMax)}
                helperText={formik.touched.salaryMax && formik.errors.salaryMax}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Job Description"
                multiline
                rows={6}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="requirements"
                name="requirements"
                label="Job Requirements"
                multiline
                rows={4}
                value={formik.values.requirements}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.requirements && Boolean(formik.errors.requirements)}
                helperText={formik.touched.requirements && formik.errors.requirements}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Required Skills
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  id="skills"
                  label="Add Skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillInputKeyDown}
                  sx={{ mr: 1 }}
                />
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleAddSkill}
                >
                  Add
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleDeleteSkill(skill)}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    id="active"
                    name="active"
                    checked={formik.values.active}
                    onChange={formik.handleChange}
                    color="primary"
                  />
                }
                label="Active Job Posting"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="outlined"
                  onClick={() => navigate('/recruiter/jobs')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    isEditMode ? 'Update Job' : 'Create Job'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default JobForm;
