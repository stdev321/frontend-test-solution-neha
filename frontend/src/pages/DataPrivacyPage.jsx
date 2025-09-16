// frontend/src/pages/DataPrivacyPage.jsx
// Placeholder page that redirects to the landing page.

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

function DataPrivacyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 50);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        flexDirection: 'column' 
      }}
    >
      <CircularProgress sx={{ mb: 2 }}/>
      <Typography>Redirecting...</Typography>
    </Box>
  );
}

export default DataPrivacyPage; 