import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: null, // Use null instead of empty string
      fullName: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
      role: Yup.string()
        .required('Role is required'),
      fullName: Yup.string()
        .required('Full name is required')
        .min(2, 'Full name must be at least 2 characters')
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      
      try {
        // Ensure role is a valid enum string value
        if (!values.role || (values.role !== 'STUDENT' && values.role !== 'RECRUITER')) {
          setError('Please select a valid role');
          return;
        }

        // Prepare user data for registration
        const userData = {
          email: values.email,
          password: values.password,
          role: values.role, // This should be 'STUDENT' or 'RECRUITER'
          fullName: values.fullName
        };
        
        // Log the exact role value to debug
        console.log('Submitting registration with data:', userData);
        console.log('Role value type:', typeof values.role, 'Value:', values.role);
        
        const result = await register(userData);
        if (!result.success) {
          setError(result.message);
        }
      } catch (error) {
        setError('An error occurred during registration. Please try again.');
        console.error('Registration error:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Container maxWidth="sm" className="auth-container">
      <Paper elevation={3} className="auth-paper">
        <Typography variant="h4" className="auth-title">
          Register
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            variant="outlined"
            margin="normal"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={loading}
          />
          
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={loading}
          />
          
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            disabled={loading}
          />
          
          <FormControl 
            fullWidth 
            margin="normal" 
            error={formik.touched.role && Boolean(formik.errors.role)}
            disabled={loading}
          >
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formik.values.role || ''}
              label="Role"
              onChange={(e) => {
                // Ensure role is properly set as a string
                const roleValue = e.target.value;
                formik.setFieldValue('role', roleValue === '' ? null : roleValue);
                console.log('Role selected:', roleValue, 'Type:', typeof roleValue);
              }}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="">-- Select Role --</MenuItem>
              <MenuItem value="STUDENT">Student</MenuItem>
              <MenuItem value="RECRUITER">Recruiter</MenuItem>
            </Select>
            {formik.touched.role && formik.errors.role && (
              <FormHelperText>{formik.errors.role}</FormHelperText>
            )}
          </FormControl>
          
          <TextField
            fullWidth
            id="fullName"
            name="fullName"
            label="Full Name"
            variant="outlined"
            margin="normal"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
            helperText={formik.touched.fullName && formik.errors.fullName}
            disabled={loading}
          />
          
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </form>
        
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
