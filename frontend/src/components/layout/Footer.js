import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              AI Recruitment Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Simplifying recruitment with artificial intelligence
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box>
              <Link href="/" color="inherit" sx={{ mr: 2 }}>
                Home
              </Link>
              <Link href="/login" color="inherit" sx={{ mr: 2 }}>
                Login
              </Link>
              <Link href="/register" color="inherit">
                Register
              </Link>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' AI Recruitment Platform. All rights reserved.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Created by Ayoub Ghouzali
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
